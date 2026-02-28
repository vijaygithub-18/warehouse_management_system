const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ➜ Get Low Stock Products
router.get("/low-stock", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.minimum_stock,
        COALESCE(SUM(i.quantity_cartons), 0) 
        - COALESCE(SUM(o.quantity_cartons), 0) AS current_stock
      FROM products p
      LEFT JOIN inward i ON p.id = i.product_id
      LEFT JOIN outward o ON p.id = o.product_id
      GROUP BY p.id
      HAVING 
        (COALESCE(SUM(i.quantity_cartons), 0) 
        - COALESCE(SUM(o.quantity_cartons), 0)) <= p.minimum_stock
      ORDER BY current_stock ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching low stock data" });
  }
});

// ➜ Get Current Stock of All Products
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.category,
        p.material,
        p.size,
        COALESCE(SUM(i.quantity_cartons), 0) 
        - COALESCE(SUM(o.quantity_cartons), 0) AS current_stock
      FROM products p
      LEFT JOIN inward i ON p.id = i.product_id
      LEFT JOIN outward o ON p.id = o.product_id
      GROUP BY p.id
      ORDER BY p.name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching stock data" });
  }
});

module.exports = router;
