const pool = require("../config/db");

async function logActivity(userId, username, action, entityType, entityId, details, ipAddress = null) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, username, action, entityType, entityId, details, ipAddress]
    );
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

module.exports = { logActivity };
