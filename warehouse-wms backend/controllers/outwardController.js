const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// Add Outward Entry
exports.addOutward = async (req, res) => {
  try {
    const { product_id, quantity_cartons, quantity, customer_id, invoice } = req.body;
    const qty = quantity_cartons || quantity;

    if (!product_id || !qty || !customer_id || !invoice) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check Stock
    const stockResult = await pool.query(`SELECT stock FROM products WHERE id = $1`, [product_id]);
    const currentStock = stockResult.rows[0]?.stock || 0;

    if (qty > currentStock) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${currentStock}` });
    }

    // Insert Outward Record
    const result = await pool.query(
      `INSERT INTO outward (product_id, quantity_cartons, customer_id, invoice)
       VALUES ($1, $2, $3, $4)
       RETURNING *, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date`,
      [product_id, qty, customer_id, invoice]
    );

    // Update Stock
    await pool.query(
      `UPDATE products SET stock = COALESCE(stock,0) - $1 WHERE id = $2`,
      [qty, product_id]
    );

    // Add to inventory
    await pool.query(
      `INSERT INTO inventory (product_id, quantity, type, reference) VALUES ($1, $2, 'OUT', $3)`,
      [product_id, qty, `INV-${invoice}`]
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'OUTWARD', result.rows[0].id, `Dispatched: ${qty} units of product ID ${product_id}, Invoice: ${invoice}`, null);

    res.json({ message: "Goods Dispatched Successfully + Stock Updated", outward: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding outward entry" });
  }
};

// Get All Outward Records
exports.getAllOutward = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, p.name AS product_name, p.name AS product, p.name AS name, p.sku,
             o.quantity_cartons, o.quantity_cartons as quantity, COALESCE(c.name, o.customer) as customer,
             o.invoice, TO_CHAR(o.date, 'YYYY-MM-DD') as date, o.date as created_at
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
};
