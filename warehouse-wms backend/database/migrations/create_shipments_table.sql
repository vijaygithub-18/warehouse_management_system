-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(100) NOT NULL,
  carrier VARCHAR(100),
  shipment_date DATE NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  status VARCHAR(50) DEFAULT 'In Transit',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shipments_sales_order ON shipments(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- Add comment
COMMENT ON TABLE shipments IS 'Tracks shipment details for sales orders';
