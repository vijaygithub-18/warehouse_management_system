const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Add Stock Adjustment
router.post("/add", async (req, res) => {
  try {
    const { product_id, quantity, reason, notes } = req.body;

    // Insert adjustment record
    const adjustment = await pool.query(
      `INSERT INTO stock_adjustments (product_id, quantity, reason, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, quantity, reason, notes || null]
    );

    // Update product stock
    await pool.query(
      `UPDATE products SET stock = stock + $1 WHERE id = $2`,
      [quantity, product_id]
    );

    res.json({
      message: "Stock Adjusted Successfully",
      adjustment: adjustment.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adjusting stock" });
  }
});

// Get All Adjustments
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sa.*, p.name, p.sku,
              TO_CHAR(sa.created_at, 'YYYY-MM-DD HH24:MI') as created_at
       FROM stock_adjustments sa
       JOIN products p ON sa.product_id = p.id
       ORDER BY sa.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching adjustments" });
  }
});

module.exports = router;
