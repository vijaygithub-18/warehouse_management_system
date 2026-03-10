import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import BASE_URL from "../config";
import styles from "../styles/pages/Inventory.module.css";

function Inventory() {
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [stockLevelFilter, setStockLevelFilter] = useState("");

  // loader defined before useEffect to avoid access-before-declaration
  const loadStock = () => {
    console.log("🔄 Refreshing stock data...");
    setIsRefreshing(true);
    fetch(`${BASE_URL}/inventory/stock`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Stock data loaded:", data.length, "products");
        setStock(data);
        setLastUpdated(new Date());
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("❌ Error loading stock:", error);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    // avoid setting state synchronously
    const initialize = async () => {
      loadStock();
    };
    initialize();
  }, []);

  const getStockLevel = (stockValue) => {
    if (stockValue === 0) return "zero";
    if (stockValue < 50) return "low";
    if (stockValue < 200) return "medium";
    return "high";
  };

  const getStockPercentage = (stockValue) => {
    const max = 500;
    return Math.min((stockValue / max) * 100, 100);
  };

  const filteredStock = stock.filter((s) => {
    const searchMatch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!stockLevelFilter) return searchMatch;

    const level = getStockLevel(s.stock);
    return searchMatch && level === stockLevelFilter;
  });

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStock = filteredStock.slice(
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
    <div className={styles.inventory}>
      <div className={`${styles.header} no-print`}>
        <h1 className={styles.title}>📊 Stock Overview</h1>
        <p className={styles.subtitle}>
          View current stock levels across all products
        </p>
      </div>

      <div className={styles.tableCard}>
        <div
          className="print-only"
          style={{ marginBottom: "2rem", display: "none" }}
        >
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#1f2937" }}>
            STOCK OVERVIEW REPORT
          </h1>
          <p style={{ margin: "0.5rem 0", color: "#6b7280" }}>
            Generated: {new Date().toLocaleDateString()}{" "}
            {new Date().toLocaleTimeString()}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#6b7280" }}>
            Total Products: {filteredStock.length}
          </p>
        </div>
        <div className={`${styles.tableHeader} no-print`}>
          <div>
            <h3 className={styles.tableTitle}>Current Stock Levels</h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                margin: "0.25rem 0 0 0",
              }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className={styles.searchInput}
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              style={{ width: "auto", minWidth: "150px" }}
            >
              <option value="">All Stock Levels</option>
              <option value="zero">Zero Stock</option>
              <option value="low">Low Stock</option>
              <option value="medium">Medium Stock</option>
              <option value="high">High Stock</option>
            </select>
            <button
              onClick={() => {
                console.log("🔄 Refresh button clicked!");
                loadStock();
              }}
              disabled={isRefreshing}
              style={{
                padding: "0.5rem 1rem",
                background: isRefreshing ? "#6b7280" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                opacity: isRefreshing ? 0.7 : 1,
              }}
            >
              {isRefreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
            </button>
            <input
              className={styles.searchInput}
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "200px" }}
            />
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
                whiteSpace: "nowrap",
              }}
            >
              🖨️ Print
            </button>
            <ExportButtons
              data={filteredStock}
              filename="inventory"
              title="Inventory Stock Levels"
            />
          </div>
        </div>

        {filteredStock.length > 0 ? (
          <>
            <table className={styles.table} style={{ pageBreakInside: "auto" }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStock.map((s) => {
                  const level = getStockLevel(s.stock);
                  const percentage = getStockPercentage(s.stock);
                  return (
                    <tr key={s.id} style={{ pageBreakInside: "avoid" }}>
                      <td>
                        <span className={styles.skuBadge}>{s.sku}</span>
                      </td>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <span
                          className={`${styles.stockValue} ${styles[level]}`}
                        >
                          {s.stock}
                        </span>
                      </td>
                      <td>
                        <div className={styles.stockCell}>
                          <div className={styles.stockBar}>
                            <div
                              className={`${styles.stockBarFill} ${styles[level]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className="print-only"
                            style={{
                              display: "none",
                              marginLeft: "0.5rem",
                              fontSize: "0.875rem",
                              color: "#6b7280",
                            }}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="no-print">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredStock.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>No stock records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
