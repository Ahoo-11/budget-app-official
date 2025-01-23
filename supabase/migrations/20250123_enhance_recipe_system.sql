-- Add conversion tracking to recipe ingredients
ALTER TABLE recipe_ingredients
ADD COLUMN conversion_ratio numeric(10, 3),
ADD COLUMN purchase_unit_id uuid REFERENCES measurement_units(id),
ADD COLUMN sales_unit_id uuid REFERENCES measurement_units(id);

-- Add opened units tracking for basic products
CREATE TABLE opened_product_units (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    opened_at timestamp with time zone DEFAULT now(),
    initial_quantity numeric(10, 3) NOT NULL,
    remaining_quantity numeric(10, 3) NOT NULL,
    unit_id uuid REFERENCES measurement_units(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add trigger to update updated_at
CREATE TRIGGER set_opened_product_units_timestamp
    BEFORE UPDATE ON opened_product_units
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for performance
CREATE INDEX idx_opened_product_units_product_id ON opened_product_units(product_id);
CREATE INDEX idx_recipe_ingredients_purchase_unit ON recipe_ingredients(purchase_unit_id);
CREATE INDEX idx_recipe_ingredients_sales_unit ON recipe_ingredients(sales_unit_id);

-- Add RLS policies
ALTER TABLE opened_product_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opened units from their sources"
    ON opened_product_units
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = opened_product_units.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert opened units for their sources"
    ON opened_product_units
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = opened_product_units.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update opened units from their sources"
    ON opened_product_units
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = opened_product_units.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete opened units from their sources"
    ON opened_product_units
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = opened_product_units.product_id
            AND su.user_id = auth.uid()
        )
    );

-- Function to calculate available quantity for a composite product
CREATE OR REPLACE FUNCTION calculate_available_quantity(product_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    total_quantity numeric := 0;
    recipe_record record;
BEGIN
    -- Get the recipe for this product
    FOR recipe_record IN (
        SELECT 
            ri.ingredient_id,
            ri.quantity,
            ri.conversion_ratio,
            p.current_stock as ingredient_stock,
            COALESCE(
                (SELECT SUM(remaining_quantity)
                FROM opened_product_units opu
                WHERE opu.product_id = ri.ingredient_id),
                0
            ) as opened_quantity
        FROM recipe_ingredients ri
        JOIN products p ON p.id = ri.ingredient_id
        WHERE ri.product_id = $1
    ) LOOP
        -- Calculate total available quantity from unopened units
        total_quantity := total_quantity + (
            (recipe_record.ingredient_stock * recipe_record.conversion_ratio) +
            recipe_record.opened_quantity
        ) / recipe_record.quantity;
    END LOOP;

    RETURN FLOOR(total_quantity);
END;
$$;
