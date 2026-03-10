import { useState, useEffect } from "react";
import { useToast } from "../components/ToastContext";
import Pagination from "../components/Pagination";
import ExportButtons from "../components/ExportButtons";
import BASE_URL from "../config";
import styles from "../styles/pages/Reports.module.css";

function Reports() {
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stock, setStock] = useState([]);
  const [inward, setInward] = useState([]);
  const [outward, setOutward] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productMovement, setProductMovement] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // useEffect(() => {
  //   loadProducts();
  // }, []);

  // const loadProducts = async () => {
  //   try {
  //     const res = await fetch("http://localhost:3000/api/products/all");
  //     const data = await res.json();
  //     setProducts(data.data || data);
  //   } catch {
  //     console.error("Failed to load products");
  //   }
  // };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/all`);
        const data = await res.json();
        setProducts(data.data || data);
      } catch {
        console.error("Failed to load products");
      }
    };
    loadProducts();
  }, []);

  const loadStock = async () => {
    const res = await fetch(`${BASE_URL}/reports/stock`);
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
    const res = await fetch(`${BASE_URL}/reports/inward?from=${from}&to=${to}`);
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
      `${BASE_URL}/reports/outward?from=${from}&to=${to}`,
    );
    const data = await res.json();
    setOutward(data);
    clearOtherReports("outward");
  };

  const loadSuppliers = async () => {
    const res = await fetch(`${BASE_URL}/reports/suppliers`);
    const data = await res.json();
    setSuppliers(data);
    clearOtherReports("suppliers");
  };

  const loadCustomers = async () => {
    const res = await fetch(`${BASE_URL}/reports/customers`);
    const data = await res.json();
    setCustomers(data);
    clearOtherReports("customers");
  };

  const loadProductMovement = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    let url = `${BASE_URL}/reports/product-movement?product_id=${selectedProduct}`;
    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setProductMovement(data);
    clearOtherReports("movement");
  };

  const clearOtherReports = (keep) => {
    if (keep !== "stock") setStock([]);
    if (keep !== "inward") setInward([]);
    if (keep !== "outward") setOutward([]);
    if (keep !== "suppliers") setSuppliers([]);
    if (keep !== "customers") setCustomers([]);
    if (keep !== "movement") setProductMovement([]);
  };

  const getCurrentData = () => {
    if (stock.length > 0) return stock;
    if (inward.length > 0) return inward;
    if (outward.length > 0) return outward;
    if (suppliers.length > 0) return suppliers;
    if (customers.length > 0) return customers;
    if (productMovement.length > 0) return productMovement;
    return [];
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(
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
          <button
            className={`${styles.reportButton} ${styles.suppliers}`}
            onClick={loadSuppliers}
          >
            🏢 Supplier Performance
          </button>
          <button
            className={`${styles.reportButton} ${styles.customers}`}
            onClick={loadCustomers}
          >
            👥 Customer Analytics
          </button>
        </div>

        <div className={styles.productMovementSection}>
          <label className={styles.label}>Product Movement Report</label>
          <div className={styles.movementGrid}>
            <select
              className={styles.select}
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
            <button
              className={`${styles.reportButton} ${styles.movement}`}
              onClick={loadProductMovement}
            >
              📊 View Movement
            </button>
          </div>
        </div>
      </div>

      {stock.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>📦 Stock Report</h3>
            <ExportButtons
              data={stock}
              filename="stock_report"
              title="Stock Report"
            />
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
            <ExportButtons
              data={inward}
              filename="inward_report"
              title="Inward Report"
            />
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
            <ExportButtons
              data={outward}
              filename="outward_report"
              title="Outward Report"
            />
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

      {suppliers.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>
              🏢 Supplier Performance Report
            </h3>
            <ExportButtons
              data={suppliers}
              filename="supplier_report"
              title="Supplier Performance"
            />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Total Orders</th>
                  <th>Total Amount</th>
                  <th>Total Deliveries</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.email || "—"}</td>
                    <td>{s.contact || "—"}</td>
                    <td>
                      <span className={styles.badge}>{s.total_orders}</span>
                    </td>
                    <td>
                      <span className={styles.amount}>
                        ₹{parseFloat(s.total_amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badge}>{s.total_deliveries}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={suppliers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {customers.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>👥 Customer Analytics Report</h3>
            <ExportButtons
              data={customers}
              filename="customer_report"
              title="Customer Analytics"
            />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Total Orders</th>
                  <th>Total Revenue</th>
                  <th>Total Shipments</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.email || "—"}</td>
                    <td>{c.contact || "—"}</td>
                    <td>
                      <span className={styles.badge}>{c.total_orders}</span>
                    </td>
                    <td>
                      <span className={styles.amount}>
                        ₹{parseFloat(c.total_amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badge}>{c.total_shipments}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={customers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {productMovement.length > 0 && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>📊 Product Movement Report</h3>
            <ExportButtons
              data={productMovement}
              filename="product_movement"
              title="Product Movement"
            />
          </div>

          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Party</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <span
                        className={
                          m.type === "IN" ? styles.typeIn : styles.typeOut
                        }
                      >
                        {m.type === "IN" ? "📥 IN" : "📤 OUT"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          m.type === "IN"
                            ? styles.quantityIn
                            : styles.quantityOut
                        }
                      >
                        {m.type === "IN" ? "+" : "-"}
                        {m.quantity}
                      </span>
                    </td>
                    <td>{m.reference}</td>
                    <td>{m.party || "—"}</td>
                    <td>{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={productMovement.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        </div>
      )}

      {stock.length === 0 &&
        inward.length === 0 &&
        outward.length === 0 &&
        suppliers.length === 0 &&
        customers.length === 0 &&
        productMovement.length === 0 && (
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
