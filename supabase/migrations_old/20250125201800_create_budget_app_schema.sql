-- Set the search path to budget schema
SET search_path TO budget, public;

-- Create the new schema
CREATE SCHEMA budget;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA budget TO authenticated;
GRANT USAGE ON SCHEMA budget TO anon;

-- Create tables in new schema
CREATE TABLE budget.measurement_units (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    symbol text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE budget.sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

CREATE TABLE budget.products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    product_type text NOT NULL DEFAULT 'basic',
    current_stock numeric(10, 3),
    minimum_stock_level numeric(10, 3),
    price numeric(10, 2),
    cost numeric(10, 2),
    category text,
    subcategory text,
    image_url text,
    source_id uuid REFERENCES budget.sources(id) ON DELETE CASCADE,
    measurement_unit_id uuid REFERENCES budget.measurement_units(id),
    content_unit_id uuid REFERENCES budget.measurement_units(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_product_type CHECK (product_type IN ('basic', 'composite'))
);

CREATE TABLE budget.recipe_ingredients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES budget.products(id) ON DELETE CASCADE,
    ingredient_id uuid REFERENCES budget.products(id) ON DELETE RESTRICT,
    content_quantity numeric(10, 3) NOT NULL CHECK (content_quantity > 0),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recipe_ingredients_unique_product_ingredient UNIQUE (product_id, ingredient_id)
);

-- Add indexes
CREATE INDEX idx_products_source ON budget.products(source_id);
CREATE INDEX idx_products_measurement_unit ON budget.products(measurement_unit_id);
CREATE INDEX idx_products_content_unit ON budget.products(content_unit_id);
CREATE INDEX idx_recipe_ingredients_product ON budget.recipe_ingredients(product_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON budget.recipe_ingredients(ingredient_id);

-- Enable RLS
ALTER TABLE budget.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.measurement_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.sources ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view products from their sources"
    ON budget.products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget.sources s
        WHERE s.id = products.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert products to their sources"
    ON budget.products FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update products in their sources"
    ON budget.products FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM budget.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete products from their sources"
    ON budget.products FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM budget.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

-- Recipe ingredients policies
CREATE POLICY "Users can view recipe ingredients from their sources"
    ON budget.recipe_ingredients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget.products p
        JOIN budget.sources s ON s.id = p.source_id
        WHERE p.id = recipe_ingredients.product_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert recipe ingredients for their sources"
    ON budget.recipe_ingredients FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget.products p
        JOIN budget.sources s ON s.id = p.source_id
        WHERE p.id = product_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update recipe ingredients for their sources"
    ON budget.recipe_ingredients FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM budget.products p
        JOIN budget.sources s ON s.id = p.source_id
        WHERE p.id = product_id
        AND s.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget.products p
        JOIN budget.sources s ON s.id = p.source_id
        WHERE p.id = product_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete recipe ingredients from their sources"
    ON budget.recipe_ingredients FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM budget.products p
        JOIN budget.sources s ON s.id = p.source_id
        WHERE p.id = product_id
        AND s.user_id = auth.uid()
    ));

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION budget.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget.products
    FOR EACH ROW
    EXECUTE FUNCTION budget.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget.recipe_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION budget.trigger_set_timestamp();

-- Function to calculate available quantity
CREATE OR REPLACE FUNCTION budget.calculate_available_quantity(product_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    available_quantity numeric;
BEGIN
    -- For basic products, just return current_stock
    IF EXISTS (
        SELECT 1 FROM budget.products 
        WHERE id = product_id 
        AND product_type = 'basic'
    ) THEN
        SELECT current_stock INTO available_quantity
        FROM budget.products
        WHERE id = product_id;
        
        RETURN COALESCE(available_quantity, 0);
    END IF;
    
    -- For composite products, calculate based on recipe ingredients
    SELECT MIN(
        FLOOR(
            p.current_stock / ri.content_quantity
        )
    ) INTO available_quantity
    FROM budget.recipe_ingredients ri
    JOIN budget.products p ON p.id = ri.ingredient_id
    WHERE ri.product_id = product_id;
    
    RETURN COALESCE(available_quantity, 0);
END;
$$;

-- Move data from public schema to budget schema
INSERT INTO budget.measurement_units 
SELECT * FROM public.measurement_units;

INSERT INTO budget.sources 
SELECT * FROM public.sources;

INSERT INTO budget.products 
SELECT * FROM public.products;

INSERT INTO budget.recipe_ingredients 
SELECT * FROM public.recipe_ingredients;
