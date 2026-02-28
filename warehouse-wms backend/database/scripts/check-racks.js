const pool = require("./config/db");

async function checkRacks() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'racks'
      ORDER BY ordinal_position
    `);
    
    console.log("Racks table columns:");
    console.log(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkRacks();
