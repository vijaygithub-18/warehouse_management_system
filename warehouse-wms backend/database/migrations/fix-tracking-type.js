const pool = require("../../config/db");

async function addTrackingTypeColumn() {
  try {
    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='outward' AND column_name='tracking_type'
    `);

    if (checkColumn.rows.length === 0) {
      // Add column if it doesn't exist
      await pool.query(`
        ALTER TABLE outward 
        ADD COLUMN tracking_type VARCHAR(50) DEFAULT 'AWB'
      `);
      console.log("✅ tracking_type column added successfully!");
    } else {
      console.log("ℹ️  tracking_type column already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

addTrackingTypeColumn();
