const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");
const { verifyToken } = require("./authRoutes");

// ➜ Add Outward Entry (Dispatch + Auto Stock Decrease)

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { product_id, quantity_cartons, quantity, customer_id, invoice, courier_name, tracking_number, shipment_status, estimated_delivery, tracking_type } =
      req.body;

    const qty = quantity_cartons || quantity;

    if (!product_id || !qty || !customer_id || !invoice) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const stockResult = await pool.query(
      `SELECT stock FROM products WHERE id = $1`,
      [product_id],
    );

    const currentStock = stockResult.rows[0]?.stock || 0;

    if (qty > currentStock) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${currentStock}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO outward
       (product_id, quantity_cartons, customer_id, invoice, courier_name, tracking_number, shipment_status, estimated_delivery, tracking_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date`,
      [product_id, qty, customer_id, invoice, courier_name || null, tracking_number || null, shipment_status || 'Pending', estimated_delivery || null, tracking_type || 'AWB'],
    );

    await pool.query(
      `UPDATE products
       SET stock = COALESCE(stock,0) - $1
       WHERE id = $2`,
      [qty, product_id],
    );

    await pool.query(
      `INSERT INTO inventory (product_id, quantity, type, reference)
       VALUES ($1, $2, 'OUT', $3)`,
      [product_id, qty, `INV-${invoice}`],
    );

    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE',
      'OUTWARD',
      result.rows[0].id,
      `Dispatched: ${qty} units of product ID ${product_id}, Invoice: ${invoice}`,
      null
    );

    res.json({
      message: "Goods Dispatched Successfully + Stock Updated",
      outward: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding outward:", error.message);
    res.status(500).json({ error: "Error adding outward entry" });
  }
});

// ➜ Get All Outward Records

router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        p.name AS product_name,
        p.name AS product,
        p.name AS name,
        p.sku,
        o.quantity_cartons,
        o.quantity_cartons as quantity,
        COALESCE(c.name, o.customer) as customer,
        o.invoice,
        o.courier_name,
        o.tracking_number,
        COALESCE(o.tracking_type, 'AWB') as tracking_type,
        o.shipment_status,
        TO_CHAR(o.estimated_delivery, 'YYYY-MM-DD') as estimated_delivery,
        TO_CHAR(o.date, 'YYYY-MM-DD') as date,
        o.date as created_at
      FROM outward o
      JOIN products p ON o.product_id = p.id
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching outward records" });
  }
});

// Update shipment status
router.put("/update-shipment/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { courier_name, tracking_number, tracking_type, shipment_status, estimated_delivery, notes } = req.body;

    const result = await pool.query(
      `UPDATE outward 
       SET courier_name = $1, 
           tracking_number = $2, 
           tracking_type = $3,
           shipment_status = $4, 
           estimated_delivery = $5,
           notes = $6
       WHERE id = $7
       RETURNING *`,
      [courier_name, tracking_number, tracking_type, shipment_status, estimated_delivery, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Outward record not found" });
    }

    await logActivity(
      req.user.id,
      req.user.username,
      'UPDATE',
      'OUTWARD',
      id,
      `Updated shipment: ${tracking_number}, Status: ${shipment_status}`,
      null
    );

    res.json({ message: "Shipment updated successfully", outward: result.rows[0] });
  } catch (error) {
    console.error("Error updating shipment:", error.message);
    res.status(500).json({ error: "Error updating shipment" });
  }
});

module.exports = router;
