const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("./authRoutes");
const { logActivity } = require("../utils/activityLogger");

// Add Supplier
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;

    const result = await pool.query(
      `INSERT INTO suppliers (name, contact, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, contact || null, email || null, address || null]
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'SUPPLIER', result.rows[0].id, `Created supplier: ${name}`);

    res.json({
      message: "Supplier Added Successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding supplier" });
  }
});

// Get All Suppliers
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suppliers ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching suppliers" });
  }
});

// Update Supplier
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, address } = req.body;

    const result = await pool.query(
      `UPDATE suppliers 
       SET name = $1, contact = $2, email = $3, address = $4
       WHERE id = $5
       RETURNING *`,
      [name, contact || null, email || null, address || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await logActivity(req.user.id, req.user.username, 'UPDATE', 'SUPPLIER', id, `Updated supplier: ${name}`);

    res.json({
      message: "Supplier Updated Successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating supplier" });
  }
});

// Delete Supplier
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM suppliers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await logActivity(req.user.id, req.user.username, 'DELETE', 'SUPPLIER', id, `Deleted supplier: ${result.rows[0].name}`);

    res.json({ message: "Supplier Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting supplier" });
  }
});

module.exports = router;
