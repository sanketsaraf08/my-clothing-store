-- Add missing columns to bills table
ALTER TABLE bills 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);

-- Update existing bills to have subtotal = total if null
UPDATE bills SET subtotal = total WHERE subtotal IS NULL;
