const pool = require("./config/db");

async function updateUsersTable() {
  try {
    // Add phone column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log("✅ Added phone column");

    // Add department column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS department VARCHAR(100)
    `);
    console.log("✅ Added department column");

    // Add location column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location VARCHAR(100)
    `);
    console.log("✅ Added location column");

    // Add last_login column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    console.log("✅ Added last_login column");

    console.log("✅ Users table updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateUsersTable();
