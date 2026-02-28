const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("./authRoutes");
const { logActivity } = require("../utils/activityLogger");

// ➜ Add Rack
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { rack_code, location, capacity, description } = req.body;
    const desc = description || (location || capacity ? `${location || ''} ${capacity ? 'Capacity: ' + capacity : ''}`.trim() : null);

    const result = await pool.query(
      `INSERT INTO racks (rack_code, description)
       VALUES ($1, $2)
       RETURNING *`,
      [rack_code, desc],
    );

    await logActivity(req.user.id, req.user.username, 'CREATE', 'RACK', result.rows[0].id, `Created rack: ${rack_code}`);

    res.json({
      message: "Rack Added Successfully",
      rack: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding rack" });
  }
});

// ➜ Get All Racks
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM racks ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching racks" });
  }
});

// ➜ Update Rack
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rack_code, location, capacity, description } = req.body;
    const desc = description || (location || capacity ? `${location || ''} ${capacity ? 'Capacity: ' + capacity : ''}`.trim() : null);

    const result = await pool.query(
      `UPDATE racks 
       SET rack_code = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [rack_code, desc, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rack not found" });
    }

    await logActivity(req.user.id, req.user.username, 'UPDATE', 'RACK', id, `Updated rack: ${rack_code}`);

    res.json({
      message: "Rack Updated Successfully",
      rack: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating rack" });
  }
});

// ➜ Delete Rack
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rack is in use
    const checkProducts = await pool.query(
      "SELECT COUNT(*) FROM products WHERE rack_id = $1",
      [id],
    );

    if (parseInt(checkProducts.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: "Cannot delete rack. It is assigned to products." 
      });
    }

    const result = await pool.query(
      "DELETE FROM racks WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rack not found" });
    }

    await logActivity(req.user.id, req.user.username, 'DELETE', 'RACK', id, `Deleted rack: ${result.rows[0].rack_code}`);

    res.json({ message: "Rack Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting rack" });
  }
});

module.exports = router;
