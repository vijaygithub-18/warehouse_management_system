const pool = require("../../config/db");

async function addShipmentTracking() {
  try {
    console.log("Adding shipment tracking fields to outward table...");

    await pool.query(`
      ALTER TABLE outward 
      ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipment_status VARCHAR(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
      ADD COLUMN IF NOT EXISTS actual_delivery DATE,
      ADD COLUMN IF NOT EXISTS tracking_url TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);

    console.log("✅ Shipment tracking fields added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addShipmentTracking();
