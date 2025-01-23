-- Add content unit fields to products table
ALTER TABLE products 
ADD COLUMN content_unit_id uuid REFERENCES measurement_units(id),
ADD COLUMN content_per_unit numeric(10, 3);

-- Add constraint to ensure content fields are set for basic products
ALTER TABLE products
ADD CONSTRAINT check_basic_product_content 
CHECK (
  (product_type = 'basic' AND content_unit_id IS NOT NULL AND content_per_unit IS NOT NULL)
  OR
  product_type = 'composite'
);

-- Add constraint to ensure content_per_unit is positive
ALTER TABLE products
ADD CONSTRAINT check_positive_content_per_unit
CHECK (content_per_unit > 0);

-- Update recipe_ingredients to store content quantity
ALTER TABLE recipe_ingredients
DROP COLUMN conversion_ratio,
DROP COLUMN purchase_unit_id,
DROP COLUMN sales_unit_id,
ADD COLUMN content_quantity numeric(10, 3) NOT NULL;

-- Add constraint to ensure content_quantity is positive
ALTER TABLE recipe_ingredients
ADD CONSTRAINT check_positive_content_quantity
CHECK (content_quantity > 0);

-- Function to calculate required container units
CREATE OR REPLACE FUNCTION calculate_required_units(
  required_content numeric,
  content_per_unit numeric
) RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  -- Round up to nearest whole unit since we can't partially use a container
  RETURN CEIL(required_content / content_per_unit);
END;
$$;

-- Function to calculate available content
CREATE OR REPLACE FUNCTION calculate_available_content(
  product_id uuid
) RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  product_record record;
BEGIN
  -- Get product details
  SELECT 
    current_stock,
    content_per_unit
  INTO product_record
  FROM products
  WHERE id = product_id;

  -- Return total available content (stock × content per unit)
  RETURN COALESCE(product_record.current_stock * product_record.content_per_unit, 0);
END;
$$;
