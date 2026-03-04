const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/* STOCK REPORT */

router.get("/stock", async (req, res) => {
  const result = await pool.query(`
SELECT
p.id,
p.sku,
p.name,
p.category,
p.minimum_stock,
COALESCE(SUM(i.quantity_cartons), 0) - COALESCE(SUM(o.quantity_cartons), 0) AS stock
FROM products p
LEFT JOIN inward i ON p.id = i.product_id
LEFT JOIN outward o ON p.id = o.product_id
GROUP BY p.id
ORDER BY p.name
`);

  res.json(result.rows);
});

/* INWARD REPORT */

router.get("/inward", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.json([]);
    }

    const result = await pool.query(
      `
SELECT
i.id,
p.name,
p.sku,
i.quantity_cartons as quantity,
i.supplier as supplier_name,
i.grn as grn_number,
TO_CHAR(i.date, 'YYYY-MM-DD') as created_at

FROM inward i

JOIN products p
ON i.product_id=p.id

WHERE DATE(i.date)
BETWEEN $1 AND $2

ORDER BY i.id DESC
`,
      [from, to],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Inward report error:", error.message);
    res.status(500).json({ error: "Error fetching inward report" });
  }
});

/* OUTWARD REPORT */

router.get("/outward", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.json([]);
    }

    const result = await pool.query(
      `
SELECT
o.id,
p.name,
p.sku,
o.quantity_cartons as quantity,
o.customer as customer_name,
o.invoice as dispatch_number,
TO_CHAR(o.date, 'YYYY-MM-DD') as created_at

FROM outward o

JOIN products p
ON o.product_id=p.id

WHERE DATE(o.date)
BETWEEN $1 AND $2

ORDER BY o.id DESC
`,
      [from, to],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Outward report error:", error.message);
    res.status(500).json({ error: "Error fetching outward report" });
  }
});

/* SUPPLIER REPORT */

router.get("/suppliers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.contact,
             COUNT(DISTINCT po.id) as total_orders,
             COALESCE(SUM(po.total), 0) as total_amount,
             COUNT(DISTINCT i.id) as total_deliveries
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplier_id
      LEFT JOIN inward i ON s.id = i.supplier_id
      GROUP BY s.id
      ORDER BY total_amount DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Supplier report error:", error.message);
    res.status(500).json({ error: "Error fetching supplier report" });
  }
});

/* CUSTOMER REPORT */

router.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.email, c.contact,
             COUNT(DISTINCT so.id) as total_orders,
             COALESCE(SUM(so.total), 0) as total_amount,
             COUNT(DISTINCT o.id) as total_shipments
      FROM customers c
      LEFT JOIN sales_orders so ON c.id = so.customer_id
      LEFT JOIN outward o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY total_amount DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Customer report error:", error.message);
    res.status(500).json({ error: "Error fetching customer report" });
  }
});

/* PRODUCT MOVEMENT REPORT */

router.get("/product-movement", async (req, res) => {
  try {
    const { product_id, from, to } = req.query;
    
    if (!product_id) {
      return res.status(400).json({ error: "Product ID required" });
    }
    
    const inward = await pool.query(`
      SELECT 'IN' as type, i.quantity_cartons as quantity, i.grn as reference,
             TO_CHAR(i.date, 'YYYY-MM-DD') as date, s.name as party
      FROM inward i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.product_id = $1 ${from && to ? 'AND i.date BETWEEN $2 AND $3' : ''}
    `, from && to ? [product_id, from, to] : [product_id]);
    
    const outward = await pool.query(`
      SELECT 'OUT' as type, o.quantity_cartons as quantity, o.invoice as reference,
             TO_CHAR(o.date, 'YYYY-MM-DD') as date, c.name as party
      FROM outward o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.product_id = $1 ${from && to ? 'AND o.date BETWEEN $2 AND $3' : ''}
    `, from && to ? [product_id, from, to] : [product_id]);
    
    const movements = [...inward.rows, ...outward.rows].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(movements);
  } catch (error) {
    console.error("Product movement error:", error.message);
    res.status(500).json({ error: "Error fetching product movement" });
  }
});

module.exports = router;
