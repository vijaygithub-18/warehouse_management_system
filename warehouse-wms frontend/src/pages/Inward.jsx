import { useEffect, useState, useRef, useCallback } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Inward.module.css";

function Inward() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inward, setInward] = useState([]);
  const [productId, setProductId] = useState("");
  const [rackId, setRackId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [grn, setGrn] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const barcodeInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // loader helpers defined ahead of effect to prevent access-before-declaration
  const loadProducts = () => {
    fetch("http://localhost:3000/api/products/all")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const loadRacks = () => {
    fetch("http://localhost:3000/api/racks/all")
      .then((res) => res.json())
      .then((data) => setRacks(data));
  };

  const loadSuppliers = useCallback(() => {
    fetch("http://localhost:3000/api/suppliers/all")
      .then((res) => {
        console.log("Suppliers API response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Suppliers loaded:", data);
        setSuppliers(data);
      })
      .catch((error) => {
        console.error("Error loading suppliers:", error);
        toast.error(
          "Failed to load suppliers. Please check if backend is running.",
        );
      });
  }, [toast]);

  const loadInward = () => {
    fetch("http://localhost:3000/api/inward/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("Inward data loaded:", data);
        setInward(data);
      });
  };

  useEffect(() => {
    loadProducts();
    loadRacks();
    loadSuppliers();
    loadInward();
  }, [loadSuppliers]);

  const saveInward = async () => {
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (!rackId) {
      toast.error("Please select a rack");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity (greater than 0)");
      return;
    }
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (!grn || grn.trim() === "") {
      toast.error("Please enter GRN number");
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/inward/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        rack_id: rackId,
        quantity,
        supplier_id: supplierId,
        grn,
      }),
    });

    if (response.ok) {
      setProductId("");
      setRackId("");
      setQuantity("");
      setSupplierId("");
      setGrn("");
      setBarcodeInput("");
      loadInward();
      toast.success("Goods received successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to receive goods");
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const sku = barcodeInput.trim().toUpperCase();

    if (!sku) return;

    const product = products.find((p) => p.sku.toUpperCase() === sku);

    if (product) {
      setProductId(product.id);
      if (product.rack_id) {
        setRackId(product.rack_id);
      }
      setBarcodeInput("");
      toast.success(`Product found: ${product.name} (${product.sku})`);
      document.getElementById("quantity-input")?.focus();
    } else {
      toast.error(`Product not found with SKU: ${sku}`);
      setBarcodeInput("");
    }
  };

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    if (!scannerActive) {
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  };

  const filteredInward = inward.filter((i) => {
    console.log('Filtering record:', { 
      id: i.id, 
      supplier_id: i.supplier_id, 
      date: i.date,
      filterSupplier,
      filterDateFrom,
      filterDateTo
    });
    
    const matchesSupplier = !filterSupplier || i.supplier_id?.toString() === filterSupplier;
    console.log('Supplier match:', matchesSupplier);
    
    if (!i.date) return matchesSupplier;

    const [year, month, day] = i.date.split('-').map(Number);
    const recordDate = new Date(year, month - 1, day);
    
    let fromDate = null;
    let toDate = null;
    
    if (filterDateFrom) {
      const [fYear, fMonth, fDay] = filterDateFrom.split('-').map(Number);
      fromDate = new Date(fYear, fMonth - 1, fDay);
    }
    
    if (filterDateTo) {
      const [tYear, tMonth, tDay] = filterDateTo.split('-').map(Number);
      toDate = new Date(tYear, tMonth - 1, tDay);
    }
    
    const matchesDateFrom = !fromDate || recordDate >= fromDate;
    const matchesDateTo = !toDate || recordDate <= toDate;
    
    console.log('Date match:', { matchesDateFrom, matchesDateTo, recordDate, fromDate, toDate });

    const result = matchesSupplier && matchesDateFrom && matchesDateTo;
    console.log('Final result:', result);
    return result;
  });

  const totalPages = Math.ceil(filteredInward.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInward = filteredInward.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.inward}>
      <div className={`${styles.header} no-print`}>
        <h1 className={styles.title}>📥 Goods Receiving (Inward)</h1>
        <p className={styles.subtitle}>
          Record incoming inventory and stock receipts
        </p>
      </div>

      <div className={`${styles.formCard} no-print`}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3 className={styles.formHeader}>Receive New Goods</h3>
          <button
            onClick={toggleScanner}
            style={{
              padding: "0.5rem 1rem",
              background: scannerActive ? "#10b981" : "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {scannerActive ? "✅ Scanner Active" : "📷 Enable Scanner"}
          </button>
        </div>

        {scannerActive && (
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              color: "white",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              📱 Barcode Scanner
            </h4>
            <form onSubmit={handleBarcodeSubmit}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or type SKU (e.g., PC-0001)"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    background: "rgba(255,255,255,0.9)",
                    color: "#1f2937",
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "white",
                    color: "#667eea",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🔍 Search
                </button>
              </div>
            </form>
            <p
              style={{
                margin: "0.75rem 0 0 0",
                fontSize: "0.875rem",
                opacity: 0.9,
              }}
            >
              💡 Tip: Use a USB barcode scanner or type the SKU manually
            </p>
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product *</label>
            <select
              className={styles.select}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Rack Location *</label>
            <select
              className={styles.select}
              value={rackId}
              onChange={(e) => setRackId(e.target.value)}
            >
              <option value="">Select Rack</option>
              {racks.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rack_code}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantity (Cartons) *</label>
            <input
              id="quantity-input"
              className={styles.input}
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Supplier *</label>
            <select
              className={styles.select}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>GRN Number *</label>
            <input
              className={styles.input}
              placeholder="Enter Goods Receipt Note number"
              value={grn}
              onChange={(e) => setGrn(e.target.value)}
            />
          </div>
        </div>

        <button className={styles.receiveButton} onClick={saveInward}>
          ✅ Receive Goods
        </button>
      </div>

      <div className={`${styles.tableCard} tableCard`}>
        <div className={styles.tableHeader} style={{ className: 'no-print' }}>
          <h3 className={styles.tableTitle}>Inward History</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className={styles.recordCount}>
              {filteredInward.length} Records
            </span>
            <button
              className="printButton"
              onClick={() => window.print()}
              style={{
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              🖨️ Print
            </button>
          </div>
        </div>

        <div className="no-print"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <select
            className={styles.select}
            value={filterSupplier}
            onChange={(e) => {
              setFilterSupplier(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 200px" }}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className={styles.input}
            placeholder="From Date"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 150px" }}
          />
          <input
            type="date"
            className={styles.input}
            placeholder="To Date"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 150px" }}
          />
        </div>

        {filteredInward.length > 0 ? (
          <>
            <div className="print-only" style={{ marginBottom: '2rem', display: 'none' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937' }}>INWARD REPORT</h1>
              <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>Generated: {new Date().toLocaleDateString()}</p>
              <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>Total Records: {filteredInward.length}</p>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Rack</th>
                  <th>Qty</th>
                  <th>Supplier</th>
                  <th>GRN</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInward.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <span className={styles.idBadge}>#{i.id}</span>
                    </td>
                    <td>
                      <span className={styles.skuBadge}>{i.sku}</span>
                    </td>
                    <td>
                      <strong>{i.name}</strong>
                    </td>
                    <td>
                      <span className={styles.rackBadge}>{i.rack_code}</span>
                    </td>
                    <td>
                      <span className={styles.quantityBadge}>
                        +{i.quantity}
                      </span>
                    </td>
                    <td>{i.supplier || "—"}</td>
                    <td>{i.grn || "—"}</td>
                    <td>
                      <span className={styles.dateBadge}>{i.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredInward.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📥</div>
            <p className={styles.emptyText}>No inward records yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inward;
