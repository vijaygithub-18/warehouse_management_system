const express = require("express");
const cors = require("cors");

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

const app = express();
const port = 3000;

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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/", (req, res) => {
  res.send("Warehouse WMS Running 🚀");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
