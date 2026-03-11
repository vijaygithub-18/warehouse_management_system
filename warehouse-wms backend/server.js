const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const pool = require("./config/db");
const EmailService = require("./utils/emailService");
const errorHandler = require("./middlewares/errorHandler");

const productRoutes = require("./routes/productRoutes");
const rackRoutes = require("./routes/rackRoutes");
const inwardRoutes = require("./routes/inwardRoutes");
const stockRoutes = require("./routes/stockRoutes");
const outwardRoutes = require("./routes/outwardRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adjustmentRoutes = require("./routes/adjustmentRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const customerRoutes = require("./routes/customerRoutes");
const { router: authRoutes } = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { router: activityRoutes } = require("./routes/activityRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();
/* IMPORTANT FOR RENDER */
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/racks", rackRoutes);
app.use("/api/inward", inwardRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/outward", outwardRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes.router);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/shipments", shipmentRoutes);
app.get("/", (req, res) => {
  res.send("Warehouse WMS Running 🚀");
});

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
    },
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Schedule daily report (runs at 8 AM every day)
cron.schedule("0 8 * * *", async () => {
  console.log("📊 Running daily inventory report...");
  try {
    const settingsRes = await pool.query(
      "SELECT * FROM email_settings WHERE enabled = TRUE AND send_daily_report = TRUE LIMIT 1",
    );
    const settings = settingsRes.rows[0];

    if (!settings) {
      console.log("⚠️ No email settings found or daily report not enabled");
      return;
    }

    console.log("✅ Email settings found, fetching inventory data...");

    const totalProducts = await pool.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const lowStock = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE stock <= minimum_stock",
    );
    const lowStockProducts = await pool.query(
      "SELECT name, sku, stock, minimum_stock FROM products WHERE stock <= minimum_stock ORDER BY stock ASC LIMIT 10",
    );
    const outOfStock = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE stock = 0",
    );
    const stockValue = await pool.query(
      "SELECT COALESCE(SUM(stock * price), 0) as value FROM products",
    );

    const stats = {
      totalProducts: totalProducts.rows[0].count,
      lowStockCount: lowStock.rows[0].count,
      lowStockProducts: lowStockProducts.rows,
      outOfStockCount: outOfStock.rows[0].count,
      totalValue: parseFloat(stockValue.rows[0].value),
    };

    console.log("📊 Stats collected:", {
      totalProducts: stats.totalProducts,
      lowStockCount: stats.lowStockCount,
      lowStockProductsCount: stats.lowStockProducts.length,
      outOfStockCount: stats.outOfStockCount,
      totalValue: stats.totalValue,
    });

    const emailService = new EmailService(settings);
    await emailService.sendDailyReport(stats, settings.notification_emails);
    console.log(
      "✅ Daily report sent successfully to:",
      settings.notification_emails,
    );
  } catch (error) {
    console.error("❌ Error sending daily report:", error.message);
    console.error("Stack:", error.stack);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
