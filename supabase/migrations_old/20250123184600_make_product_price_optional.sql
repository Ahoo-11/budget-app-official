-- Update the products table to make price nullable
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
