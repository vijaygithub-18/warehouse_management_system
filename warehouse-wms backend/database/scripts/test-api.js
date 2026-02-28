const pool = require("./config/db");

async function testQuery() {
  try {
    const result = await pool.query(`
      SELECT 
        i.id,
        p.name AS product_name,
        p.sku,
        r.rack_code,
        i.quantity_cartons,
        i.supplier,
        i.grn,
        TO_CHAR(i.date, 'YYYY-MM-DD') as date
      FROM inward i
      JOIN products p ON i.product_id = p.id
      JOIN racks r ON i.rack_id = r.id
      ORDER BY i.date DESC
      LIMIT 3
    `);

    console.log("Inward data:");
    console.log(JSON.stringify(result.rows, null, 2));
    
    const outward = await pool.query(`
      SELECT 
        o.id,
        p.name AS product_name,
        p.sku,
        o.quantity_cartons,
        o.customer,
        o.invoice,
        TO_CHAR(o.date, 'YYYY-MM-DD') as date
      FROM outward o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.date DESC
      LIMIT 3
    `);
    
    console.log("\nOutward data:");
    console.log(JSON.stringify(outward.rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testQuery();
