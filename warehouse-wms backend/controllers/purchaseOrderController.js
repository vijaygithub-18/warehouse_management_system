const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// Get All Purchase Orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.email as supplier_email,
             (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as items_count
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching purchase orders" });
  }
};

// Get Single Purchase Order
exports.getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.email as supplier_email, s.contact as supplier_contact
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1
    `, [id]);

    const items = await pool.query(`
      SELECT poi.*, p.name as product_name, p.sku
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = $1
    `, [id]);

    res.json({ order: order.rows[0], items: items.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching purchase order" });
  }
};

// Create Purchase Order
exports.createPurchaseOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { supplier_id, order_date, expected_delivery_date, payment_terms, delivery_method, items, notes, tax, discount } = req.body;

    // Generate PO number
    const lastOrder = await client.query("SELECT po_number FROM purchase_orders ORDER BY id DESC LIMIT 1");
    let nextNumber = 1;
    if (lastOrder.rows.length > 0) {
      const lastNum = parseInt(lastOrder.rows[0].po_number.split('-')[1]);
      nextNumber = lastNum + 1;
    }
    const po_number = `PO-${String(nextNumber).padStart(5, '0')}`;

    // Calculate totals with proper number parsing
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.rate)), 0);
    const taxAmount = parseFloat(tax) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const total = subtotal + taxAmount - discountAmount;

    // Insert order
    const orderResult = await client.query(`
      INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery_date, 
                                   payment_terms, delivery_method, subtotal, tax, discount, total, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Issued')
      RETURNING *
    `, [po_number, supplier_id, order_date, expected_delivery_date, payment_terms, delivery_method, subtotal, taxAmount, discountAmount, total, notes]);

    // Insert items
    for (const item of items) {
      const qty = parseFloat(item.quantity);
      const rate = parseFloat(item.rate);
      const amount = qty * rate;
      await client.query(`
        INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, amount)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderResult.rows[0].id, item.product_id, qty, rate, amount]);
    }

    await client.query('COMMIT');
    await logActivity(req.user.id, req.user.username, 'CREATE', 'PURCHASE_ORDER', orderResult.rows[0].id, `Created purchase order: ${po_number}`, null);
    
    res.json({ message: "Purchase order created successfully", order: orderResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Error creating purchase order" });
  } finally {
    client.release();
  }
};

// Update Purchase Order Status
exports.updatePurchaseOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`\n🔄 Updating Purchase Order #${id} to status: ${status}`);
    
    // Get current status
    const currentOrder = await client.query("SELECT status FROM purchase_orders WHERE id = $1", [id]);
    const oldStatus = currentOrder.rows[0]?.status;
    console.log(`📋 Old status: ${oldStatus}`);
    
    // Update status
    await client.query("UPDATE purchase_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);
    console.log(`✅ Status updated in database`);
    
    // Increase stock when order is Received (only once)
    if (status === 'Received' && oldStatus !== 'Received') {
      console.log(`📦 Increasing stock for received order...`);
      const items = await client.query("SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1", [id]);
      console.log(`📦 Found ${items.rows.length} items to process`);
      
      for (const item of items.rows) {
        console.log(`  - Increasing product #${item.product_id} by ${item.quantity} units`);
        const result = await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING stock", [item.quantity, item.product_id]);
        console.log(`  ✅ New stock: ${result.rows[0]?.stock}`);
      }
    }
    
    // Reduce stock if order is cancelled from Received
    if (status === 'Cancelled' && oldStatus === 'Received') {
      console.log(`🔄 Reducing stock for cancelled order...`);
      const items = await client.query("SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1", [id]);
      
      for (const item of items.rows) {
        console.log(`  - Reducing product #${item.product_id} by ${item.quantity} units`);
        const result = await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock", [item.quantity, item.product_id]);
        console.log(`  ✅ New stock: ${result.rows[0]?.stock}`);
      }
    }
    
    await client.query('COMMIT');
    await logActivity(req.user.id, req.user.username, 'UPDATE', 'PURCHASE_ORDER', id, `Updated purchase order status to: ${status}`, null);
    
    console.log(`✅ Transaction committed successfully\n`);
    res.json({ message: "Status updated successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating purchase order status:', error);
    res.status(500).json({ error: "Error updating status" });
  } finally {
    client.release();
  }
};

// Delete Purchase Order
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query("SELECT po_number FROM purchase_orders WHERE id = $1", [id]);
    
    await pool.query("DELETE FROM purchase_orders WHERE id = $1", [id]);
    await logActivity(req.user.id, req.user.username, 'DELETE', 'PURCHASE_ORDER', id, `Deleted purchase order: ${order.rows[0]?.po_number}`, null);
    
    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting purchase order" });
  }
};
