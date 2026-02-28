const pool = require("./config/db");

console.log("\n📊 REAL-TIME STOCK MONITOR");
console.log("=" .repeat(50));
console.log("This will show you the current stock of all products.");
console.log("Run this BEFORE and AFTER changing order status to see if stock changes.\n");

async function checkStock() {
  try {
    const result = await pool.query(`
      SELECT id, name, sku, stock 
      FROM products 
      ORDER BY name
    `);
    
    console.log(`\n⏰ Time: ${new Date().toLocaleTimeString()}\n`);
    console.log("ID  | Product Name                    | SKU           | Stock");
    console.log("-".repeat(70));
    
    result.rows.forEach(p => {
      const id = String(p.id).padEnd(3);
      const name = String(p.name).padEnd(30);
      const sku = String(p.sku).padEnd(13);
      const stock = String(p.stock).padStart(5);
      console.log(`${id} | ${name} | ${sku} | ${stock}`);
    });
    
    console.log("\n✅ Stock check complete!");
    console.log("\n💡 TIP: Run this script again after changing order status to see changes.\n");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    pool.end();
  }
}

checkStock();
