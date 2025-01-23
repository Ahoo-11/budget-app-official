-- Make price column nullable in products table
-- First set a default value of 0 for existing records
UPDATE products SET price = 0 WHERE price IS NULL;

-- Then make the column nullable
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;

-- Add a trigger to ensure price is at least 0 when set
CREATE OR REPLACE FUNCTION check_product_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price IS NOT NULL AND NEW.price < 0 THEN
        RAISE EXCEPTION 'Price cannot be negative';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_product_price_trigger ON products;
CREATE TRIGGER check_product_price_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_product_price();
