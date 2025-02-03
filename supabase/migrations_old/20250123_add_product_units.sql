-- Add content measurement to basic products
ALTER TABLE products
ADD COLUMN content_unit_id uuid REFERENCES measurement_units(id),
ADD COLUMN content_per_unit numeric(10, 3);

-- Add function to calculate available content quantity
CREATE OR REPLACE FUNCTION calculate_available_content(product_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    product_record record;
BEGIN
    -- Get the product details
    SELECT 
        current_stock,
        content_per_unit
    INTO product_record
    FROM products
    WHERE id = product_id;

    -- Return total content available (stock × content per unit)
    RETURN COALESCE(product_record.current_stock * product_record.content_per_unit, 0);
END;
$$;

-- Modify recipe_ingredients to use content units
ALTER TABLE recipe_ingredients
ADD COLUMN content_quantity numeric(10, 3);

-- Add helper function to calculate required units
CREATE OR REPLACE FUNCTION calculate_required_units(
    required_content numeric,
    content_per_unit numeric
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN CEIL(required_content / content_per_unit);
END;
$$;
