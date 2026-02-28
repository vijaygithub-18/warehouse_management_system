const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// Get All Sales Orders
exports.getAllSalesOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT so.*, c.name as customer_name, c.email as customer_email,
             (SELECT COUNT(*) FROM sales_order_items WHERE sales_order_id = so.id) as items_count
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY so.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching sales orders" });
  }
};

// Get Single Sales Order
exports.getSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query(`
      SELECT so.*, c.name as customer_name, c.email as customer_email, c.contact as customer_contact
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      WHERE so.id = $1
    `, [id]);

    const items = await pool.query(`
      SELECT soi.*, p.name as product_name, p.sku
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = $1
    `, [id]);

    res.json({ order: order.rows[0], items: items.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching sales order" });
  }
};

// Create Sales Order
exports.createSalesOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { customer_id, order_date, expected_shipment_date, payment_terms, delivery_method, items, notes, tax, discount } = req.body;

    // Generate order number
    const lastOrder = await client.query("SELECT order_number FROM sales_orders ORDER BY id DESC LIMIT 1");
    let nextNumber = 1;
    if (lastOrder.rows.length > 0) {
      const lastNum = parseInt(lastOrder.rows[0].order_number.split('-')[1]);
      nextNumber = lastNum + 1;
    }
    const order_number = `SO-${String(nextNumber).padStart(5, '0')}`;

    // Calculate totals with proper number parsing
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);
    const taxAmount = parseFloat(tax) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const total = subtotal + taxAmount - discountAmount;

    // Insert order
    const orderResult = await client.query(`
      INSERT INTO sales_orders (order_number, customer_id, order_date, expected_shipment_date, 
                                payment_terms, delivery_method, subtotal, tax, discount, total, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Confirmed')
      RETURNING *
    `, [order_number, customer_id, order_date, expected_shipment_date, payment_terms, delivery_method, subtotal, taxAmount, discountAmount, total, notes]);

    // Insert items
    for (const item of items) {
      const qty = parseFloat(item.quantity);
      const rate = parseFloat(item.rate);
      const amount = qty * rate;
      await client.query(`
        INSERT INTO sales_order_items (sales_order_id, product_id, quantity, rate, amount)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderResult.rows[0].id, item.product_id, qty, rate, amount]);
    }

    await client.query('COMMIT');
    await logActivity(req.user.id, req.user.username, 'CREATE', 'SALES_ORDER', orderResult.rows[0].id, `Created sales order: ${order_number}`, null);
    
    res.json({ message: "Sales order created successfully", order: orderResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Error creating sales order" });
  } finally {
    client.release();
  }
};

// Update Sales Order Status
exports.updateSalesOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`\n🔄 Updating Sales Order #${id} to status: ${status}`);
    
    // Get current status
    const currentOrder = await client.query("SELECT status FROM sales_orders WHERE id = $1", [id]);
    const oldStatus = currentOrder.rows[0]?.status;
    console.log(`📋 Old status: ${oldStatus}`);
    
    // Update status
    await client.query("UPDATE sales_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);
    console.log(`✅ Status updated in database`);
    
    // Reduce stock when order is Shipped or Delivered (only once)
    if ((status === 'Shipped' || status === 'Delivered') && oldStatus !== 'Shipped' && oldStatus !== 'Delivered') {
      console.log(`📦 Reducing stock for shipped/delivered order...`);
      const items = await client.query("SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = $1", [id]);
      console.log(`📦 Found ${items.rows.length} items to process`);
      
      for (const item of items.rows) {
        console.log(`  - Reducing product #${item.product_id} by ${item.quantity} units`);
        const result = await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock", [item.quantity, item.product_id]);
        console.log(`  ✅ New stock: ${result.rows[0]?.stock}`);
      }
    }
    
    // Restore stock if order is cancelled from Shipped/Delivered
    if (status === 'Cancelled' && (oldStatus === 'Shipped' || oldStatus === 'Delivered')) {
      console.log(`🔄 Restoring stock for cancelled order...`);
      const items = await client.query("SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = $1", [id]);
      
      for (const item of items.rows) {
        console.log(`  - Restoring product #${item.product_id} by ${item.quantity} units`);
        const result = await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING stock", [item.quantity, item.product_id]);
        console.log(`  ✅ New stock: ${result.rows[0]?.stock}`);
      }
    }
    
    await client.query('COMMIT');
    await logActivity(req.user.id, req.user.username, 'UPDATE', 'SALES_ORDER', id, `Updated sales order status to: ${status}`, null);
    
    console.log(`✅ Transaction committed successfully\n`);
    res.json({ message: "Status updated successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating sales order status:', error);
    res.status(500).json({ error: "Error updating status" });
  } finally {
    client.release();
  }
};

// Delete Sales Order
exports.deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query("SELECT order_number FROM sales_orders WHERE id = $1", [id]);
    
    await pool.query("DELETE FROM sales_orders WHERE id = $1", [id]);
    await logActivity(req.user.id, req.user.username, 'DELETE', 'SALES_ORDER', id, `Deleted sales order: ${order.rows[0]?.order_number}`, null);
    
    res.json({ message: "Sales order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting sales order" });
  }
};
