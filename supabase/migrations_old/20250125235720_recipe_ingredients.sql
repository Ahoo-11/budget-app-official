-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id uuid REFERENCES products(id) ON DELETE RESTRICT,
    content_quantity numeric(10, 3) NOT NULL CHECK (content_quantity > 0),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recipe_ingredients_unique_product_ingredient UNIQUE (product_id, ingredient_id)
);

-- Add trigger to update updated_at
CREATE OR REPLACE TRIGGER set_recipe_ingredients_timestamp
    BEFORE UPDATE ON recipe_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_product ON recipe_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- Add RLS policies
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe ingredients from their sources"
    ON recipe_ingredients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = recipe_ingredients.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recipe ingredients for their sources"
    ON recipe_ingredients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = recipe_ingredients.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update recipe ingredients for their sources"
    ON recipe_ingredients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = recipe_ingredients.product_id
            AND su.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = recipe_ingredients.product_id
            AND su.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recipe ingredients from their sources"
    ON recipe_ingredients
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM products p
            JOIN source_users su ON p.source_id = su.source_id
            WHERE p.id = recipe_ingredients.product_id
            AND su.user_id = auth.uid()
        )
    );
