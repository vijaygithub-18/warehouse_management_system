const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("./authRoutes");
const { logActivity } = require("../utils/activityLogger");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// CREATE new category
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const result = await pool.query(
      "INSERT INTO categories (name, code, description) VALUES ($1, $2, $3) RETURNING *",
      [name, code, description],
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'CATEGORY', result.rows[0].id, `Created category: ${name}`);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// UPDATE category
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const result = await pool.query(
      "UPDATE categories SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *",
      [name, code, description, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await logActivity(req.user.id, req.user.username, 'UPDATE', 'CATEGORY', id, `Updated category: ${name}`);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// DELETE category
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await logActivity(req.user.id, req.user.username, 'DELETE', 'CATEGORY', id, `Deleted category: ${result.rows[0].name}`);

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
