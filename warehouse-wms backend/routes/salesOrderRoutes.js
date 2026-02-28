const express = require("express");
const router = express.Router();
const salesOrderController = require("../controllers/salesOrderController");
const { verifyToken } = require("../controllers/authController");

router.get("/all", salesOrderController.getAllSalesOrders);
router.get("/:id", salesOrderController.getSalesOrder);
router.post("/create", verifyToken, salesOrderController.createSalesOrder);
router.put("/:id/status", verifyToken, salesOrderController.updateSalesOrderStatus);
router.delete("/:id", verifyToken, salesOrderController.deleteSalesOrder);

module.exports = router;
