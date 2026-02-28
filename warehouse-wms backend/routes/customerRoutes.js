const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("./authRoutes");
const { logActivity } = require("../utils/activityLogger");

// Add Customer
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;

    const result = await pool.query(
      `INSERT INTO customers (name, contact, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, contact || null, email || null, address || null]
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'CUSTOMER', result.rows[0].id, `Created customer: ${name}`);

    res.json({
      message: "Customer Added Successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding customer" });
  }
});

// Get All Customers
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching customers" });
  }
});

// Update Customer
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, address } = req.body;

    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, contact = $2, email = $3, address = $4
       WHERE id = $5
       RETURNING *`,
      [name, contact || null, email || null, address || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await logActivity(req.user.id, req.user.username, 'UPDATE', 'CUSTOMER', id, `Updated customer: ${name}`);

    res.json({
      message: "Customer Updated Successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating customer" });
  }
});

// Delete Customer
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await logActivity(req.user.id, req.user.username, 'DELETE', 'CUSTOMER', id, `Deleted customer: ${result.rows[0].name}`);

    res.json({ message: "Customer Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting customer" });
  }
});

module.exports = router;
