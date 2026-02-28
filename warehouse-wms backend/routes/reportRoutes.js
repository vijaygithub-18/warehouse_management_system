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

module.exports = router;
