const pool = require("../../config/db");

async function createSalesOrdersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        order_date DATE DEFAULT CURRENT_DATE,
        expected_shipment_date DATE,
        status VARCHAR(50) DEFAULT 'Draft',
        payment_terms VARCHAR(100),
        delivery_method VARCHAR(100),
        subtotal DECIMAL(15, 2) DEFAULT 0,
        tax DECIMAL(15, 2) DEFAULT 0,
        discount DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales_order_items (
        id SERIAL PRIMARY KEY,
        sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        rate DECIMAL(15, 2) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Sales Orders tables created successfully");
  } catch (error) {
    console.error("❌ Error creating sales orders tables:", error);
  } finally {
    pool.end();
  }
}

createSalesOrdersTable();
