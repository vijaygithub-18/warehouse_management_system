const pool = require("./config/db");

async function updateInwardTable() {
  try {
    // Check if supplier_id column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inward' AND column_name = 'supplier_id'
    `);

    if (checkColumn.rows.length === 0) {
      // Add supplier_id column
      await pool.query(`
        ALTER TABLE inward 
        ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)
      `);
      console.log("✅ supplier_id column added to inward table");
    } else {
      console.log("✅ supplier_id column already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateInwardTable();
