const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// STOCK IN

router.post("/stockin", async (req, res) => {
  try {
    const { product_id, quantity, reference } = req.body;

    const result = await pool.query(
      `INSERT INTO inventory 
       (product_id, quantity, type, reference)
       VALUES ($1,$2,'IN',$3)
       RETURNING *`,

      [product_id, quantity, reference],
    );

    res.json({
      message: "Stock Added",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding stock" });
  }
});

// STOCK OUT

router.post("/stockout", async (req, res) => {
  try {
    const { product_id, quantity, reference } = req.body;

    const result = await pool.query(
      `INSERT INTO inventory 
       (product_id, quantity, type, reference)
       VALUES ($1,$2,'OUT',$3)
       RETURNING *`,

      [product_id, quantity, reference],
    );

    res.json({
      message: "Stock Removed",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error removing stock" });
  }
});

// CURRENT STOCK

router.get("/stock", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        products.id,
        products.name,
        products.sku,
        products.stock
      FROM products
      ORDER BY products.name`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading stock" });
  }
});

module.exports = router;
