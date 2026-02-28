const pool = require("../../config/db");

async function addTrackingType() {
  try {
    await pool.query(`
      ALTER TABLE outward 
      ADD COLUMN IF NOT EXISTS tracking_type VARCHAR(50) DEFAULT 'AWB'
    `);

    console.log("✅ Tracking type column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

addTrackingType();
