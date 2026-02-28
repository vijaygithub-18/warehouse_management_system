const pool = require("./config/db");

async function updateOutwardTable() {
  try {
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'outward' AND column_name = 'customer_id'
    `);

    if (checkColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE outward 
        ADD COLUMN customer_id INTEGER REFERENCES customers(id)
      `);
      console.log("✅ customer_id column added to outward table");
    } else {
      console.log("✅ customer_id column already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateOutwardTable();
