const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const { verifyToken } = require("../controllers/authController");

router.get("/all", purchaseOrderController.getAllPurchaseOrders);
router.get("/:id", purchaseOrderController.getPurchaseOrder);
router.post("/create", verifyToken, purchaseOrderController.createPurchaseOrder);
router.put("/:id/status", verifyToken, purchaseOrderController.updatePurchaseOrderStatus);
router.delete("/:id", verifyToken, purchaseOrderController.deletePurchaseOrder);

module.exports = router;
