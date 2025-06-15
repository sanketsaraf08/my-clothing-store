-- Neon Database Setup
-- Run this in your Neon console or via psql

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  customer_phone VARCHAR(20),
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_purchase TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Insert sample data
INSERT INTO products (name, barcode, price, quantity, category, image) VALUES
('Classic White T-Shirt', '1000000001', 599.00, 50, 'shirts', '/placeholder.svg?height=300&width=300&text=White+T-Shirt'),
('Blue Denim Jeans', '1000000002', 1999.00, 30, 'pants', '/placeholder.svg?height=300&width=300&text=Denim+Jeans'),
('Summer Floral Dress', '1000000003', 1799.00, 25, 'dresses', '/placeholder.svg?height=300&width=300&text=Floral+Dress'),
('Leather Sneakers', '1000000004', 2999.00, 20, 'shoes', '/placeholder.svg?height=300&width=300&text=Leather+Sneakers'),
('Cotton Kurta', '1000000005', 899.00, 35, 'shirts', '/placeholder.svg?height=300&width=300&text=Cotton+Kurta'),
('Designer Saree', '1000000006', 4999.00, 15, 'dresses', '/placeholder.svg?height=300&width=300&text=Designer+Saree')
ON CONFLICT (barcode) DO NOTHING;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
