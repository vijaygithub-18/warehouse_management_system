const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../controllers/authController");
const { logActivity } = require("../utils/activityLogger");

// Get all shipments
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, so.order_number, c.name as customer_name,
             TO_CHAR(s.shipment_date, 'YYYY-MM-DD') as shipment_date,
             TO_CHAR(s.expected_delivery, 'YYYY-MM-DD') as expected_delivery
      FROM shipments s
      LEFT JOIN sales_orders so ON s.sales_order_id = so.id
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching shipments" });
  }
});

// Create shipment
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { sales_order_id, tracking_number, carrier, shipment_date, expected_delivery, notes } = req.body;

    console.log('Creating shipment with data:', { sales_order_id, tracking_number, carrier, shipment_date, expected_delivery, notes });

    const result = await pool.query(`
      INSERT INTO shipments (sales_order_id, tracking_number, carrier, shipment_date, expected_delivery, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'In Transit')
      RETURNING *
    `, [sales_order_id, tracking_number, carrier, shipment_date, expected_delivery, notes]);

    await logActivity(req.user.id, req.user.username, 'CREATE', 'SHIPMENT', result.rows[0].id, 
      `Created shipment ${tracking_number} for order ${sales_order_id}`, null);

    res.json({ message: "Shipment created successfully", shipment: result.rows[0] });
  } catch (error) {
    console.error('Error creating shipment:', error.message);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: "Error creating shipment", details: error.message });
  }
});

// Update shipment status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE shipments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);
    await logActivity(req.user.id, req.user.username, 'UPDATE', 'SHIPMENT', id, `Updated shipment status to ${status}`, null);

    res.json({ message: "Shipment status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating shipment" });
  }
});

// Delete shipment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shipments WHERE id = $1", [id]);
    await logActivity(req.user.id, req.user.username, 'DELETE', 'SHIPMENT', id, `Deleted shipment`, null);

    res.json({ message: "Shipment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting shipment" });
  }
});

module.exports = router;
