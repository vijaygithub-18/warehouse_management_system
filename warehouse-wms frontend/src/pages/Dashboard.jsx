// function Dashboard() {
//   return (
//     <div>
//       <h3 className="mb-4">Dashboard Overview</h3>

//       <div className="row">
//         <div className="col-md-4">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h6>Total Products</h6>
//               <h3>120</h3>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h6>Total Categories</h6>
//               <h3>8</h3>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h6>Total Stock</h6>
//               <h3>45,000 pcs</h3>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "../styles/pages/Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recentInward, setRecentInward] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [orderStatus, setOrderStatus] = useState({ sales: [], purchases: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryStock, setCategoryStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = () => {
    setRefreshing(true);
    console.log("🔄 Loading dashboard data...");
    Promise.all([
      fetch("http://localhost:3000/api/dashboard/total-products").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/total-stock").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/low-stock").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/recent-inward").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/financial-metrics").then(
        (res) => res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/stock-value").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/order-status").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/top-products").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/monthly-trend").then((res) =>
        res.json(),
      ),
      fetch("http://localhost:3000/api/dashboard/category-stock").then((res) =>
        res.json(),
      ),
    ])
      .then(
        ([
          products,
          stock,
          low,
          inward,
          financial,
          stockVal,
          status,
          top,
          trend,
          catStock,
        ]) => {
          console.log("✅ Dashboard data loaded:", {
            products,
            stock,
            low,
            inward,
            financial,
            stockVal,
            status,
            top,
            trend,
            catStock,
          });
          setTotalProducts(products.total);
          setTotalStock(stock.total);
          setLowStock(low);
          setRecentInward(inward);
          setFinancialMetrics(financial);
          setStockValue(stockVal.totalValue);
          setOrderStatus(status);
          setTopProducts(top);
          setMonthlyTrend(trend);
          setCategoryStock(catStock);
          setLastUpdated(new Date());
          setLoading(false);
          setRefreshing(false);
        },
      )
      .catch((error) => {
        console.error("❌ Error loading dashboard data:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    // avoid setting state synchronously inside effect
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const grossProfit = financialMetrics
    ? financialMetrics.totalSales - financialMetrics.totalPurchases
    : 0;
  const profitMargin =
    financialMetrics && financialMetrics.totalSales > 0
      ? ((grossProfit / financialMetrics.totalSales) * 100).toFixed(1)
      : 0;

  const salesChange =
    financialMetrics && financialMetrics.lastMonthSales > 0
      ? (
          ((financialMetrics.thisMonthSales - financialMetrics.lastMonthSales) /
            financialMetrics.lastMonthSales) *
          100
        ).toFixed(1)
      : 0;

  const purchaseChange =
    financialMetrics && financialMetrics.lastMonthPurchases > 0
      ? (
          ((financialMetrics.thisMonthPurchases -
            financialMetrics.lastMonthPurchases) /
            financialMetrics.lastMonthPurchases) *
          100
        ).toFixed(1)
      : 0;

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📊 Dashboard Overview</h1>
          <p className={styles.subtitle}>
            Real-time warehouse metrics and insights • Last updated:{" "}
            {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => navigate("/sales-orders")}
            className={styles.actionBtn}
          >
            + Sales Order
          </button>
          <button
            onClick={() => navigate("/purchase-orders")}
            className={styles.actionBtn}
          >
            + Purchase Order
          </button>
          <button
            onClick={() => navigate("/products")}
            className={styles.actionBtn}
          >
            + Product
          </button>
          <button
            onClick={loadData}
            disabled={refreshing}
            className={styles.refreshBtn}
          >
            {refreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.products}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Products</span>
            <div className={styles.statIcon}>📦</div>
          </div>
          <h2 className={styles.statValue}>{totalProducts}</h2>
        </div>

        <div className={`${styles.statCard} ${styles.stock}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Stock</span>
            <div className={styles.statIcon}>📊</div>
          </div>
          <h2 className={styles.statValue}>{totalStock.toLocaleString()}</h2>
        </div>

        <div className={`${styles.statCard} ${styles.lowStock}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Low Stock Items</span>
            <div className={styles.statIcon}>⚠️</div>
          </div>
          <h2 className={styles.statValue}>{lowStock.length}</h2>
        </div>

        <div className={`${styles.statCard} ${styles.inward}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Recent Receipts</span>
            <div className={styles.statIcon}>📥</div>
          </div>
          <h2 className={styles.statValue}>{recentInward.length}</h2>
        </div>
      </div>

      {financialMetrics && (
        <div className={styles.financialSection}>
          <h2 className={styles.sectionTitle}>💰 Financial Overview</h2>
          <div className={styles.financialGrid}>
            <div className={`${styles.financialCard} ${styles.profit}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Gross Profit</span>
                <span className={styles.cardIcon}>💎</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {grossProfit.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>Margin: {profitMargin}%</p>
            </div>

            <div className={`${styles.financialCard} ${styles.sales}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Total Sales</span>
                <span className={styles.cardIcon}>💵</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {financialMetrics.totalSales.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>All time revenue</p>
            </div>

            <div className={`${styles.financialCard} ${styles.purchases}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Total Purchases</span>
                <span className={styles.cardIcon}>🛍️</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {financialMetrics.totalPurchases.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>All time procurement</p>
            </div>

            <div className={`${styles.financialCard} ${styles.stockValue}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Stock Value</span>
                <span className={styles.cardIcon}>📦</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {stockValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>Current inventory worth</p>
            </div>

            <div className={`${styles.financialCard} ${styles.monthSales}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>This Month Sales</span>
                <span className={styles.cardIcon}>📈</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {financialMetrics.thisMonthSales.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>
                {salesChange !== 0 && (
                  <span
                    className={
                      parseFloat(salesChange) >= 0
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {parseFloat(salesChange) >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(salesChange)}% vs last month
                  </span>
                )}
                {salesChange == 0 && "No change vs last month"}
              </p>
            </div>

            <div className={`${styles.financialCard} ${styles.monthPurchases}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>This Month Purchases</span>
                <span className={styles.cardIcon}>📊</span>
              </div>
              <h3 className={styles.cardValue}>
                ₹
                {financialMetrics.thisMonthPurchases.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </h3>
              <p className={styles.cardSubtext}>
                {purchaseChange !== 0 && (
                  <span
                    className={
                      parseFloat(purchaseChange) >= 0
                        ? styles.negative
                        : styles.positive
                    }
                  >
                    {parseFloat(purchaseChange) >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(purchaseChange)}% vs last month
                  </span>
                )}
                {purchaseChange == 0 && "No change vs last month"}
              </p>
            </div>

            <div className={`${styles.financialCard} ${styles.pendingSales}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Pending Sales Orders</span>
                <span className={styles.cardIcon}>📋</span>
              </div>
              <h3 className={styles.cardValue}>
                {financialMetrics.pendingSalesOrders}
              </h3>
              <p className={styles.cardSubtext}>Awaiting fulfillment</p>
            </div>

            <div
              className={`${styles.financialCard} ${styles.pendingPurchases}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>
                  Pending Purchase Orders
                </span>
                <span className={styles.cardIcon}>📦</span>
              </div>
              <h3 className={styles.cardValue}>
                {financialMetrics.pendingPurchaseOrders}
              </h3>
              <p className={styles.cardSubtext}>Awaiting receipt</p>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className={styles.chartsSection}>
        <h2 className={styles.sectionTitle}>📊 Visual Analytics</h2>

        <div className={styles.chartsGrid}>
          {/* Monthly Trend Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              📈 Sales vs Purchases Trend (Last 6 Months)
            </h3>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `₹${parseFloat(value).toLocaleString("en-IN")}`
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Sales"
                  />
                  <Area
                    type="monotone"
                    dataKey="purchases"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Purchases"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No data available</div>
            )}
          </div>

          {/* Category Stock Distribution */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>📊 Stock by Category</h3>
            {categoryStock.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryStock}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#3b82f6" name="Stock Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No data available</div>
            )}
          </div>

          {/* Sales Order Status Pie */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>🎯 Sales Orders Status</h3>
            {orderStatus.sales && orderStatus.sales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatus.sales.map((item) => ({
                      ...item,
                      count: parseInt(item.count),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStatus.sales.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No sales orders yet</div>
            )}
          </div>

          {/* Purchase Order Status Pie */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>📦 Purchase Orders Status</h3>
            {orderStatus.purchases && orderStatus.purchases.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatus.purchases.map((item) => ({
                      ...item,
                      count: parseInt(item.count),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStatus.purchases.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>No purchase orders yet</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>🏆 Top Selling Products</h3>
          </div>

          {topProducts.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.sku}</strong>
                    </td>
                    <td>{p.name}</td>
                    <td>
                      <span style={{ color: "#10b981", fontWeight: "600" }}>
                        {p.total_sold}
                      </span>
                    </td>
                    <td>
                      ₹
                      {parseFloat(p.total_revenue).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <p className={styles.emptyText}>No sales data yet</p>
            </div>
          )}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>📊 Order Status</h3>
          </div>

          <div className={styles.statusGrid}>
            <div>
              <h4 className={styles.statusTitle}>Sales Orders</h4>
              {orderStatus.sales.length > 0 ? (
                <div className={styles.statusList}>
                  {orderStatus.sales.map((s, i) => (
                    <div key={i} className={styles.statusItem}>
                      <span className={styles.statusLabel}>{s.status}</span>
                      <span className={styles.statusCount}>{s.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No orders</p>
              )}
            </div>
            <div>
              <h4 className={styles.statusTitle}>Purchase Orders</h4>
              {orderStatus.purchases.length > 0 ? (
                <div className={styles.statusList}>
                  {orderStatus.purchases.map((p, i) => (
                    <div key={i} className={styles.statusItem}>
                      <span className={styles.statusLabel}>{p.status}</span>
                      <span className={styles.statusCount}>{p.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No orders</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>⚠️ Low Stock Alerts</h3>
            {lowStock.length > 0 && (
              <span className={styles.badge}>{lowStock.length} Items</span>
            )}
          </div>

          {lowStock.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Current</th>
                  <th>Minimum</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.sku}</strong>
                    </td>
                    <td>{p.name}</td>
                    <td>
                      <span
                        className={`${styles.stockBadge} ${
                          p.stock === 0 ? styles.critical : styles.low
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>{p.minimum_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✅</div>
              <p className={styles.emptyText}>All products are well stocked!</p>
            </div>
          )}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>📥 Recent Inward</h3>
          </div>

          {recentInward.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>GRN</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {recentInward.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.grn_number}</strong>
                    </td>
                    <td>{r.name}</td>
                    <td>
                      <span style={{ color: "#10b981", fontWeight: "600" }}>
                        +{r.quantity}
                      </span>
                    </td>
                    <td>{r.supplier || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <p className={styles.emptyText}>No recent inward records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
