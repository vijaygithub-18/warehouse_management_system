const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");
const { verifyToken } = require("./authRoutes");

// ➜ Add Inward Entry (Goods Receiving + Auto Stock Update)

router.post("/add", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { product_id, quantity_cartons, quantity, rack_id, supplier_id, grn } =
      req.body;

    const qty = quantity_cartons || quantity;

    if (!product_id || !qty || !rack_id || !supplier_id || !grn) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for duplicate GRN
    const duplicateCheck = await client.query(
      `SELECT id FROM inward WHERE grn = $1`,
      [grn]
    );
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `GRN ${grn} already exists` });
    }

    // Get product name for logging
    const productResult = await client.query(
      `SELECT name FROM products WHERE id = $1`,
      [product_id]
    );
    const productName = productResult.rows[0]?.name || 'Unknown';

    // Insert Inward Record
    const result = await client.query(
      `INSERT INTO inward
       (product_id, quantity_cartons, rack_id, supplier_id, grn)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date`,
      [product_id, qty, rack_id, supplier_id, grn],
    );

    // Automatic Stock Increase
    await client.query(
      `UPDATE products
       SET stock = COALESCE(stock,0) + $1
       WHERE id = $2`,
      [qty, product_id],
    );

    // Add to inventory
    await client.query(
      `INSERT INTO inventory (product_id, quantity, type, reference)
       VALUES ($1, $2, 'IN', $3)`,
      [product_id, qty, `GRN-${grn}`],
    );

    // Log activity
    await logActivity(
      req.user.id,
      req.user.username,
      'CREATE',
      'INWARD',
      result.rows[0].id,
      `Added inward: ${qty} units of ${productName}, GRN: ${grn}`,
      null
    );

    await client.query('COMMIT');

    res.json({
      message: "Goods Received Successfully + Stock Updated",
      inward: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error adding inward:", error.message);
    if (error.constraint === 'unique_inward_grn') {
      return res.status(400).json({ error: `GRN already exists` });
    }
    res.status(500).json({ error: "Error adding inward entry" });
  } finally {
    client.release();
  }
});

// ➜ Get All Inward Records

router.get("/all", async (req, res) => {
  try {
    const { supplier, startDate, endDate, search = '' } = req.query;
    
    let query = `
      SELECT 
        i.id,
        p.name AS product_name,
        p.name AS product,
        p.name AS name,
        p.sku,
        r.rack_code,
        i.quantity_cartons,
        i.quantity_cartons as quantity,
        i.supplier_id,
        COALESCE(s.name, i.supplier) as supplier,
        i.grn,
        TO_CHAR(i.date, 'YYYY-MM-DD') as date,
        i.date as created_at
      FROM inward i
      JOIN products p ON i.product_id = p.id
      JOIN racks r ON i.rack_id = r.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (supplier) {
      query += ` AND (s.name ILIKE $${paramIndex} OR i.supplier ILIKE $${paramIndex})`;
      params.push(`%${supplier}%`);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND i.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND i.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR i.grn ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY i.date DESC`;
    
    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Error fetching inward records" });
  }
});

module.exports = router;
