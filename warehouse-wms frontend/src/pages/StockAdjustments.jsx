import { useEffect, useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import BASE_URL from "../config";
import styles from "../styles/pages/StockAdjustments.module.css";

function StockAdjustments() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filterReason, setFilterReason] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    void loadProducts();
    void loadAdjustments();
  }, []);

  const loadProducts = () => {
    fetch(`${BASE_URL}/products/all`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const loadAdjustments = () => {
    fetch(`${BASE_URL}/adjustments/all`)
      .then((res) => res.json())
      .then((data) => setAdjustments(data));
  };

  const adjustStock = async (type) => {
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity (greater than 0)");
      return;
    }
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    // Validate stock for decrease
    if (
      type === "out" &&
      selectedProduct &&
      parseInt(quantity) > selectedProduct.stock
    ) {
      toast.error(
        `Cannot decrease by ${quantity}. Current stock is only ${selectedProduct.stock}`,
      );
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/adjustments/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: type === "in" ? quantity : -quantity,
        reason,
        notes,
      }),
    });

    if (response.ok) {
      setProductId("");
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
      setNotes("");
      loadProducts();
      loadAdjustments();
      toast.success("Stock adjusted successfully!");
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to adjust stock");
    }
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesReason = !filterReason || adj.reason === filterReason;
    const matchesType =
      !filterType ||
      (filterType === "in" && adj.quantity > 0) ||
      (filterType === "out" && adj.quantity < 0);

    return matchesReason && matchesType;
  });

  const totalPages = Math.ceil(filteredAdjustments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdjustments = filteredAdjustments.slice(
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
    <div className={styles.adjustments}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚖️ Stock Adjustments</h1>
        <p className={styles.subtitle}>
          Adjust inventory for damages, corrections, and other reasons
        </p>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formHeader}>New Adjustment</h3>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product *</label>
            <select
              className={styles.select}
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);
                const product = products.find((p) => p.id === parseInt(id));
                setSelectedProduct(product || null);
              }}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Stock: {p.stock || 0}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  background: "#f0f9ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Current Stock:</strong>{" "}
                <span
                  style={{
                    color: "#1e40af",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                  }}
                >
                  {selectedProduct.stock || 0}
                </span>{" "}
                units
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quantity *</label>
            <input
              className={styles.input}
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {selectedProduct && quantity && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "#fef3c7",
                  border: "1px solid #fbbf24",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              >
                <strong>After Adjustment:</strong>
                <span style={{ marginLeft: "0.5rem", fontWeight: "700" }}>
                  {selectedProduct.stock || 0} →{" "}
                  {(selectedProduct.stock || 0) + parseInt(quantity || 0)} (IN)
                  / {(selectedProduct.stock || 0) - parseInt(quantity || 0)}{" "}
                  (OUT)
                </span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Reason *</label>
            <select
              className={styles.select}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Correction">Correction</option>
              <option value="Return">Return</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.textarea}
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.adjustInButton}
            onClick={() => adjustStock("in")}
          >
            ➕ Adjust IN
          </button>
          <button
            className={styles.adjustOutButton}
            onClick={() => adjustStock("out")}
          >
            ➖ Adjust OUT
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Adjustment History</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className={styles.recordCount}>
              {filteredAdjustments.length} Records
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
            value={filterReason}
            onChange={(e) => {
              setFilterReason(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 200px" }}
          >
            <option value="">All Reasons</option>
            <option value="Damaged">Damaged</option>
            <option value="Expired">Expired</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
            <option value="Correction">Correction</option>
            <option value="Return">Return</option>
            <option value="Other">Other</option>
          </select>
          <select
            className={styles.select}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: "1 1 150px" }}
          >
            <option value="">All Types</option>
            <option value="in">Adjust IN (+)</option>
            <option value="out">Adjust OUT (-)</option>
          </select>
        </div>

        {filteredAdjustments.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td>
                      <span className={styles.idBadge}>#{adj.id}</span>
                    </td>
                    <td>
                      <span className={styles.skuBadge}>{adj.sku}</span>
                    </td>
                    <td>
                      <strong>{adj.name}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          adj.quantity > 0
                            ? styles.quantityIn
                            : styles.quantityOut
                        }
                      >
                        {adj.quantity > 0 ? "+" : ""}
                        {adj.quantity}
                      </span>
                    </td>
                    <td>
                      <span className={styles.reasonBadge}>{adj.reason}</span>
                    </td>
                    <td>{adj.notes || "—"}</td>
                    <td>
                      <span className={styles.dateBadge}>{adj.created_at}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAdjustments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚖️</div>
            <p className={styles.emptyText}>No adjustments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockAdjustments;
