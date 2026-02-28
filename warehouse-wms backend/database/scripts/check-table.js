const pool = require("./config/db");

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inward'
      ORDER BY ordinal_position
    `);
    
    console.log("Inward table columns:");
    console.log(result.rows);
    
    const data = await pool.query("SELECT * FROM inward LIMIT 1");
    console.log("\nSample data:");
    console.log(data.rows);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkTable();
