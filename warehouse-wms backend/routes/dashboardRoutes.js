const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// TOTAL PRODUCTS

router.get("/total-products", async (req, res) => {
  const result = await pool.query("SELECT COUNT(*) as total FROM products");

  res.json(result.rows[0]);
});

// TOTAL STOCK

router.get("/total-stock", async (req, res) => {
  const result = await pool.query(
    "SELECT COALESCE(SUM(i.quantity_cartons) - SUM(o.quantity_cartons), 0) as total FROM inward i FULL OUTER JOIN outward o ON true",
  );

  res.json(result.rows[0]);
});

// LOW STOCK

router.get("/low-stock", async (req, res) => {
  const result = await pool.query(`
SELECT 
  p.id,
  p.sku,
  p.name,
  p.minimum_stock,
  COALESCE(SUM(i.quantity_cartons), 0) - COALESCE(SUM(o.quantity_cartons), 0) AS current_stock,
  COALESCE(SUM(i.quantity_cartons), 0) - COALESCE(SUM(o.quantity_cartons), 0) AS stock
FROM products p
LEFT JOIN inward i ON p.id = i.product_id
LEFT JOIN outward o ON p.id = o.product_id
GROUP BY p.id
HAVING (COALESCE(SUM(i.quantity_cartons), 0) - COALESCE(SUM(o.quantity_cartons), 0)) <= p.minimum_stock
ORDER BY current_stock ASC
`);

  res.json(result.rows);
});

// RECENT INWARD

router.get("/recent-inward", async (req, res) => {
  const result = await pool.query(`
SELECT
i.id,
i.grn as grn_number,
p.name,
p.sku,
i.quantity_cartons as quantity,
COALESCE(s.name, i.supplier) as supplier

FROM inward i

LEFT JOIN products p ON i.product_id = p.id
LEFT JOIN suppliers s ON i.supplier_id = s.id

ORDER BY i.date DESC
LIMIT 5
`);

  res.json(result.rows);
});

// FINANCIAL METRICS

router.get("/financial-metrics", async (req, res) => {
  try {
    // Total Sales (All time)
    const totalSales = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total FROM sales_orders WHERE status != 'Cancelled'"
    );

    // Total Purchases (All time)
    const totalPurchases = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total FROM purchase_orders WHERE status != 'Cancelled'"
    );

    // This Month Sales
    const thisMonthSales = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM sales_orders 
      WHERE status != 'Cancelled' 
      AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // This Month Purchases
    const thisMonthPurchases = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM purchase_orders 
      WHERE status != 'Cancelled'
      AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // Last Month Sales
    const lastMonthSales = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM sales_orders 
      WHERE status != 'Cancelled' 
      AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
      AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
    `);

    // Last Month Purchases
    const lastMonthPurchases = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM purchase_orders 
      WHERE status != 'Cancelled'
      AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
      AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
    `);

    // Pending Orders Count
    const pendingSalesOrders = await pool.query(
      "SELECT COUNT(*) as count FROM sales_orders WHERE status IN ('Draft', 'Confirmed', 'Packed')"
    );

    const pendingPurchaseOrders = await pool.query(
      "SELECT COUNT(*) as count FROM purchase_orders WHERE status IN ('Draft', 'Issued')"
    );

    res.json({
      totalSales: parseFloat(totalSales.rows[0].total) || 0,
      totalPurchases: parseFloat(totalPurchases.rows[0].total) || 0,
      thisMonthSales: parseFloat(thisMonthSales.rows[0].total) || 0,
      thisMonthPurchases: parseFloat(thisMonthPurchases.rows[0].total) || 0,
      lastMonthSales: parseFloat(lastMonthSales.rows[0].total) || 0,
      lastMonthPurchases: parseFloat(lastMonthPurchases.rows[0].total) || 0,
      pendingSalesOrders: parseInt(pendingSalesOrders.rows[0].count) || 0,
      pendingPurchaseOrders: parseInt(pendingPurchaseOrders.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Error in /financial-metrics:', error.message);
    res.json({
      totalSales: 0,
      totalPurchases: 0,
      thisMonthSales: 0,
      thisMonthPurchases: 0,
      lastMonthSales: 0,
      lastMonthPurchases: 0,
      pendingSalesOrders: 0,
      pendingPurchaseOrders: 0
    });
  }
});

// STOCK VALUE

router.get("/stock-value", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(stock * 100), 0) as total_value
      FROM products
      WHERE stock > 0
    `);
    res.json({ totalValue: parseFloat(result.rows[0].total_value) || 0 });
  } catch (error) {
    console.error('Error in /stock-value:', error.message);
    res.json({ totalValue: 0 });
  }
});

// ORDER STATUS BREAKDOWN

router.get("/order-status", async (req, res) => {
  try {
    const salesStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM sales_orders
      GROUP BY status
    `);

    const purchaseStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM purchase_orders
      GROUP BY status
    `);

    res.json({
      sales: salesStatus.rows,
      purchases: purchaseStatus.rows
    });
  } catch (error) {
    console.error('Error in /order-status:', error.message);
    res.json({ sales: [], purchases: [] });
  }
});

// TOP SELLING PRODUCTS

router.get("/top-products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        SUM(soi.quantity) as total_sold,
        SUM(soi.amount) as total_revenue
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      JOIN sales_orders so ON soi.sales_order_id = so.id
      WHERE so.status != 'Cancelled'
      GROUP BY p.id, p.sku, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /top-products:', error.message);
    res.json([]);
  }
});

// MONTHLY TREND (Last 6 months)

router.get("/monthly-trend", async (req, res) => {
  try {
    const result = await pool.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) AS month
      )
      SELECT 
        TO_CHAR(m.month, 'Mon') as month,
        COALESCE(SUM(CASE WHEN so.status != 'Cancelled' THEN so.total ELSE 0 END), 0) as sales,
        COALESCE(SUM(CASE WHEN po.status != 'Cancelled' THEN po.total ELSE 0 END), 0) as purchases
      FROM months m
      LEFT JOIN sales_orders so ON date_trunc('month', so.order_date) = m.month
      LEFT JOIN purchase_orders po ON date_trunc('month', po.order_date) = m.month
      GROUP BY m.month
      ORDER BY m.month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /monthly-trend:', error.message);
    res.json([]);
  }
});

// CATEGORY STOCK DISTRIBUTION

router.get("/category-stock", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        category,
        SUM(stock) as stock
      FROM products
      GROUP BY category
      ORDER BY stock DESC
      LIMIT 8
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in /category-stock:', error.message);
    res.json([]);
  }
});

// TODAY'S SUMMARY

router.get("/today-summary", async (req, res) => {
  try {
    // Today's Inward
    const todayInward = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(quantity_cartons), 0) as total_qty
      FROM inward
      WHERE DATE(date) = CURRENT_DATE
    `);

    // Today's Outward
    const todayOutward = await pool.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(quantity_cartons), 0) as total_qty
      FROM outward
      WHERE DATE(date) = CURRENT_DATE
    `);

    // Today's Adjustments
    const todayAdjustments = await pool.query(`
      SELECT COUNT(*) as count
      FROM stock_adjustments
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Pending Shipments
    const pendingShipments = await pool.query(`
      SELECT COUNT(*) as count
      FROM outward
      WHERE shipment_status IN ('Pending', 'Processing')
    `);

    res.json({
      inward: {
        count: parseInt(todayInward.rows[0].count) || 0,
        quantity: parseInt(todayInward.rows[0].total_qty) || 0
      },
      outward: {
        count: parseInt(todayOutward.rows[0].count) || 0,
        quantity: parseInt(todayOutward.rows[0].total_qty) || 0
      },
      adjustments: parseInt(todayAdjustments.rows[0].count) || 0,
      pendingShipments: parseInt(pendingShipments.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Error in /today-summary:', error.message);
    res.json({
      inward: { count: 0, quantity: 0 },
      outward: { count: 0, quantity: 0 },
      adjustments: 0,
      pendingShipments: 0
    });
  }
});

module.exports = router;
