const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("./authRoutes");

// Get activity logs (role-based access)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const { role, id: currentUserId } = req.user;
    const { user_id, action, entity_type, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        al.*,
        u.username,
        u.role as user_role,
        TO_CHAR(al.created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_time
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Role-based filtering
    if (role === 'admin') {
      // Admin sees everything - no additional filter
    } else if (role === 'manager') {
      // Manager sees own + staff activities
      query += ` AND (al.user_id = $${paramCount} OR u.role = 'staff')`;
      params.push(currentUserId);
      paramCount++;
    } else {
      // Staff sees only their own
      query += ` AND al.user_id = $${paramCount}`;
      params.push(currentUserId);
      paramCount++;
    }
    
    // Additional filters
    if (user_id) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }
    
    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }
    
    if (entity_type) {
      query += ` AND al.entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }
    
    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching activity logs" });
  }
});

// Get user's own activity logs
router.get("/my-activity", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        al.*,
        TO_CHAR(al.created_at, 'YYYY-MM-DD HH24:MI:SS') as formatted_time
       FROM activity_logs al
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching activity logs" });
  }
});

// Get activity stats (role-based)
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const { role, id: currentUserId } = req.user;
    
    let whereClause = '';
    const params = [];
    
    if (role === 'admin') {
      // Admin sees all stats
      whereClause = '';
    } else if (role === 'manager') {
      // Manager sees own + staff stats
      whereClause = `WHERE al.user_id = $1 OR al.user_id IN (SELECT id FROM users WHERE role = 'staff')`;
      params.push(currentUserId);
    } else {
      // Staff sees only their own stats
      whereClause = 'WHERE al.user_id = $1';
      params.push(currentUserId);
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_activities,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_activities
      FROM activity_logs al
      ${whereClause}
    `, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching stats" });
  }
});

// Get list of users for admin filter
router.get("/users", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Only admin can see all users
    if (role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const result = await pool.query(`
      SELECT id, username, role
      FROM users
      ORDER BY username
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Clear old activity logs (admin only)
router.delete("/clear", verifyToken, async (req, res) => {
  const { role } = req.user;
  
  if (role !== 'admin') {
    return res.status(403).json({ error: "Only admins can clear logs" });
  }
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days);
    
    if (isNaN(daysInt) || daysInt < 1) {
      return res.status(400).json({ error: "Invalid days parameter" });
    }
    
    const result = await pool.query(
      `DELETE FROM activity_logs 
       WHERE created_at < NOW() - INTERVAL '1 day' * $1
       RETURNING id`,
      [daysInt]
    );
    
    res.json({ 
      message: `Deleted ${result.rowCount} logs older than ${daysInt} days`,
      deleted_count: result.rowCount 
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    res.status(500).json({ error: "Error clearing logs: " + error.message });
  }
});

module.exports = { router };
