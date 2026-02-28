const pool = require("../../config/db");

async function updateDecimalPrecision() {
  try {
    // Update sales_orders table
    await pool.query(`
      ALTER TABLE sales_orders 
        ALTER COLUMN subtotal TYPE DECIMAL(15, 2),
        ALTER COLUMN tax TYPE DECIMAL(15, 2),
        ALTER COLUMN discount TYPE DECIMAL(15, 2),
        ALTER COLUMN total TYPE DECIMAL(15, 2);
    `);

    // Update sales_order_items table
    await pool.query(`
      ALTER TABLE sales_order_items 
        ALTER COLUMN rate TYPE DECIMAL(15, 2),
        ALTER COLUMN amount TYPE DECIMAL(15, 2);
    `);

    // Update purchase_orders table
    await pool.query(`
      ALTER TABLE purchase_orders 
        ALTER COLUMN subtotal TYPE DECIMAL(15, 2),
        ALTER COLUMN tax TYPE DECIMAL(15, 2),
        ALTER COLUMN discount TYPE DECIMAL(15, 2),
        ALTER COLUMN total TYPE DECIMAL(15, 2);
    `);

    // Update purchase_order_items table
    await pool.query(`
      ALTER TABLE purchase_order_items 
        ALTER COLUMN rate TYPE DECIMAL(15, 2),
        ALTER COLUMN amount TYPE DECIMAL(15, 2);
    `);

    console.log("✅ Database decimal precision updated successfully");
  } catch (error) {
    console.error("❌ Error updating decimal precision:", error);
  } finally {
    pool.end();
  }
}

updateDecimalPrecision();
