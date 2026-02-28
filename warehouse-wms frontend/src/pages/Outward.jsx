import { useEffect, useState, useRef } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import styles from "../styles/pages/Outward.module.css";

function Outward() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [outward, setOutward] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [invoice, setInvoice] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const barcodeInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // loader functions placed before useEffect
  const loadProducts = () => {
    fetch("http://localhost:3000/api/products/all")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const loadCustomers = () => {
    fetch("http://localhost:3000/api/customers/all")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  };

  const loadOutward = () => {
    fetch("http://localhost:3000/api/outward/all")
      .then((res) => res.json())
      .then((data) => setOutward(data));
  };

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadOutward();
  }, []);

  const saveOutward = async () => {
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity (greater than 0)");
      return;
    }
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!invoice || invoice.trim() === "") {
      toast.error("Please enter invoice number");
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/outward/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        customer_id: customerId,
        invoice,
      }),
    });

    if (response.ok) {
      setProductId("");
      setQuantity("");
      setCustomerId("");
      setInvoice("");
      setBarcodeInput("");
      loadOutward();
      toast.success("Goods dispatched successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to dispatch goods");
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const sku = barcodeInput.trim().toUpperCase();

    if (!sku) return;

    const product = products.find((p) => p.sku.toUpperCase() === sku);

    if (product) {
      setProductId(product.id);
      setBarcodeInput("");
      toast.success(`Product found: ${product.name} (${product.sku})`);
      document.getElementById("quantity-input-outward")?.focus();
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

  const filteredOutward = outward.filter((o) => {
    const matchesCustomer =
      !filterCustomer || o.customer_id?.toString() === filterCustomer;

    const recordDate = new Date(o.date);
    const matchesDateFrom =
      !filterDateFrom || recordDate >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || recordDate <= new Date(filterDateTo);

    return matchesCustomer && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredOutward.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOutward = filteredOutward.slice(
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
    <div className={styles.outward}>
      <div className={styles.header}>
        <h1 className={styles.title}>📤 Goods Dispatch (Outward)</h1>
        <p className={styles.subtitle}>
          Record outgoing inventory and shipments
        </p>
      </div>

      <div className={styles.formCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3 className={styles.formHeader}>Dispatch Goods</h3>
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
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
                    color: "#f59e0b",
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
              💡 Tip: Scan item before dispatch to verify correct product
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
            <label className={styles.label}>Quantity (Cartons) *</label>
            <input
              id="quantity-input-outward"
              className={styles.input}
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Customer *</label>
            <select
              className={styles.select}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Invoice Number *</label>
            <input
              className={styles.input}
              placeholder="Enter invoice number"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
            />
          </div>
        </div>

        <button className={styles.dispatchButton} onClick={saveOutward}>
          🚚 Dispatch Goods
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Dispatch History</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className={styles.recordCount}>
              {filteredOutward.length} Records
            </span>
            <button
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

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <select
            className={styles.select}
            value={filterCustomer}
            onChange={(e) => {
              setFilterCustomer(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 200px" }}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

        {filteredOutward.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOutward.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className={styles.idBadge}>#{o.id}</span>
                    </td>
                    <td>
                      <span className={styles.skuBadge}>{o.sku}</span>
                    </td>
                    <td>
                      <strong>{o.name}</strong>
                    </td>
                    <td>
                      <span className={styles.quantityBadge}>
                        -{o.quantity}
                      </span>
                    </td>
                    <td>
                      {o.customer ? (
                        <span className={styles.customerBadge}>
                          {o.customer}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{o.invoice || "—"}</td>
                    <td>
                      <span className={styles.dateBadge}>{o.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOutward.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📤</div>
            <p className={styles.emptyText}>No dispatch records yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Outward;
