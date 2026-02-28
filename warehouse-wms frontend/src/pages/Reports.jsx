import { useState } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import styles from "../styles/pages/Reports.module.css";

function Reports() {
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stock, setStock] = useState([]);
  const [inward, setInward] = useState([]);
  const [outward, setOutward] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const loadStock = async () => {
    const res = await fetch("http://localhost:3000/api/reports/stock");
    const data = await res.json();
    setStock(data);
    setInward([]);
    setOutward([]);
  };

  const loadInward = async () => {
    if (!from || !to) {
      toast.error("Please select date range");
      return;
    }
    const res = await fetch(
      `http://localhost:3000/api/reports/inward?from=${from}&to=${to}`
    );
    const data = await res.json();
    setInward(data);
    setStock([]);
    setOutward([]);
  };

  const loadOutward = async () => {
    if (!from || !to) {
      toast.error("Please select date range");
      return;
    }
    const res = await fetch(
      `http://localhost:3000/api/reports/outward?from=${from}&to=${to}`
    );
    const data = await res.json();
    setOutward(data);
    setStock([]);
    setInward([]);
  };

  const getCurrentData = () => {
    if (stock.length > 0) return stock;
    if (inward.length > 0) return inward;
    if (outward.length > 0) return outward;
    return [];
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Reports & Analytics</h1>
        <p className={styles.subtitle}>Generate and export warehouse reports</p>
      </div>

      <div className={styles.filterCard}>
        <h3 className={styles.filterHeader}>Report Filters</h3>

        <div className={styles.dateGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>From Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>To Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.buttonGrid}>
          <button
            className={`${styles.reportButton} ${styles.stock}`}
            onClick={loadStock}
          >
            📦 Stock Report
          </button>
          <button
            className={`${styles.reportButton} ${styles.inward}`}
            onClick={loadInward}
          >
            📥 Inward Report
          </button>
          <button
            className={`${styles.reportButton} ${styles.outward}`}
            onClick={loadOutward}
          >
            📤 Outward Report
          </button>
        </div>
      </div>

      {stock.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>📦 Stock Report</h3>
            <ExportButtons data={stock} filename="stock_report" title="Stock Report" />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className={styles.skuBadge}>{s.sku}</span>
                  </td>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{s.category}</span>
                  </td>
                  <td>
                    <span className={styles.stockValue}>{s.stock}</span>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={stock.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {inward.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>📥 Inward Report</h3>
            <ExportButtons data={inward} filename="inward_report" title="Inward Report" />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>GRN</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.name}</strong>
                  </td>
                  <td>
                    <span className={styles.skuBadge}>{i.sku}</span>
                  </td>
                  <td>
                    <span className={styles.quantityIn}>+{i.quantity}</span>
                  </td>
                  <td>{i.supplier_name || "—"}</td>
                  <td>{i.grn_number || "—"}</td>
                  <td>{i.created_at}</td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={inward.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {outward.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>📤 Outward Report</h3>
            <ExportButtons data={outward} filename="outward_report" title="Outward Report" />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.name}</strong>
                  </td>
                  <td>
                    <span className={styles.skuBadge}>{o.sku}</span>
                  </td>
                  <td>
                    <span className={styles.quantityOut}>-{o.quantity}</span>
                  </td>
                  <td>{o.customer_name || "—"}</td>
                  <td>{o.dispatch_number || "—"}</td>
                  <td>{o.created_at}</td>
                </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={outward.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {stock.length === 0 && inward.length === 0 && outward.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyText}>No report generated yet</p>
          <p className={styles.emptyHint}>
            Select dates and click a report button to view data
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;
