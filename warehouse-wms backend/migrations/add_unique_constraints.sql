-- Migration: Add Unique Constraints to Prevent Duplicates
-- Run this SQL in your PostgreSQL database

-- 1. Add unique constraint on product SKU
ALTER TABLE products ADD CONSTRAINT unique_product_sku UNIQUE (sku);

-- 2. Add unique constraint on inward GRN
ALTER TABLE inward ADD CONSTRAINT unique_inward_grn UNIQUE (grn);

-- 3. Add unique constraint on outward invoice
ALTER TABLE outward ADD CONSTRAINT unique_outward_invoice UNIQUE (invoice);

-- 4. Add unique constraint on sales order number
ALTER TABLE sales_orders ADD CONSTRAINT unique_sales_order_number UNIQUE (order_number);

-- 5. Add unique constraint on purchase order number
ALTER TABLE purchase_orders ADD CONSTRAINT unique_purchase_order_number UNIQUE (order_number);

-- 6. Add check constraint to prevent negative stock
ALTER TABLE products ADD CONSTRAINT check_stock_non_negative CHECK (stock >= 0);

-- 7. Add check constraint to prevent negative minimum stock
ALTER TABLE products ADD CONSTRAINT check_minimum_stock_non_negative CHECK (minimum_stock >= 0);
