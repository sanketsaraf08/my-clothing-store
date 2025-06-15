-- Moraya Fashion - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  customer_phone VARCHAR(20),
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table (for future features)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_purchase TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON bills
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON customers
  FOR ALL USING (true);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for Moraya Fashion
INSERT INTO products (name, barcode, price, quantity, category, image) VALUES
('Classic White T-Shirt', '1000000001', 599.00, 50, 'shirts', '/placeholder.svg?height=300&width=300&text=White+T-Shirt'),
('Blue Denim Jeans', '1000000002', 1999.00, 30, 'pants', '/placeholder.svg?height=300&width=300&text=Denim+Jeans'),
('Summer Floral Dress', '1000000003', 1799.00, 25, 'dresses', '/placeholder.svg?height=300&width=300&text=Floral+Dress'),
('Leather Sneakers', '1000000004', 2999.00, 20, 'shoes', '/placeholder.svg?height=300&width=300&text=Leather+Sneakers'),
('Cotton Kurta', '1000000005', 899.00, 35, 'shirts', '/placeholder.svg?height=300&width=300&text=Cotton+Kurta'),
('Designer Saree', '1000000006', 4999.00, 15, 'dresses', '/placeholder.svg?height=300&width=300&text=Designer+Saree'),
('Casual Polo Shirt', '1000000007', 799.00, 40, 'shirts', '/placeholder.svg?height=300&width=300&text=Polo+Shirt'),
('Formal Blazer', '1000000008', 3999.00, 12, 'jackets', '/placeholder.svg?height=300&width=300&text=Formal+Blazer'),
('Sports Shoes', '1000000009', 2499.00, 25, 'shoes', '/placeholder.svg?height=300&width=300&text=Sports+Shoes'),
('Traditional Lehenga', '1000000010', 6999.00, 8, 'dresses', '/placeholder.svg?height=300&width=300&text=Traditional+Lehenga')
ON CONFLICT (barcode) DO NOTHING;

-- Create a view for product analytics (optional)
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
  category,
  COUNT(*) as total_products,
  SUM(quantity) as total_stock,
  SUM(sold_quantity) as total_sold,
  AVG(price) as avg_price,
  SUM(price * sold_quantity) as total_revenue
FROM products 
GROUP BY category;

-- Grant permissions
GRANT ALL ON products TO authenticated;
GRANT ALL ON bills TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT SELECT ON product_analytics TO authenticated;
