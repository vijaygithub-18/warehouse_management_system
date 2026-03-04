const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// Add Inward Entry
exports.addInward = async (req, res) => {
  try {
    const { product_id, quantity_cartons, quantity, rack_id, supplier_id, grn } = req.body;
    const qty = quantity_cartons || quantity;

    if (!product_id || !qty || !rack_id || !supplier_id || !grn) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert Inward Record
    const result = await pool.query(
      `INSERT INTO inward (product_id, quantity_cartons, rack_id, supplier_id, grn)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date`,
      [product_id, qty, rack_id, supplier_id, grn]
    );

    // Update Stock
    await pool.query(
      `UPDATE products SET stock = COALESCE(stock,0) + $1 WHERE id = $2`,
      [qty, product_id]
    );

    // Add to inventory
    await pool.query(
      `INSERT INTO inventory (product_id, quantity, type, reference) VALUES ($1, $2, 'IN', $3)`,
      [product_id, qty, `GRN-${grn}`]
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'INWARD', result.rows[0].id, `Added inward: ${qty} units of product ID ${product_id}, GRN: ${grn}`, null);

    res.json({ message: "Goods Received Successfully + Stock Updated", inward: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding inward entry" });
  }
};

// Get All Inward Records
exports.getAllInward = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM inward');
    
    const result = await pool.query(`
      SELECT i.id, p.name AS product_name, p.name AS product, p.name AS name, p.sku, r.rack_code,
             i.quantity_cartons, i.quantity_cartons as quantity, COALESCE(s.name, i.supplier) as supplier,
             i.grn, TO_CHAR(i.date, 'YYYY-MM-DD') as date, i.date as created_at
      FROM inward i
      JOIN products p ON i.product_id = p.id
      JOIN racks r ON i.rack_id = r.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      ORDER BY i.date DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching inward records" });
  }
};
