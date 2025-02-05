
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Recovery script to restore all data
-- First, ensure we're in the right schema context
SET search_path TO budget, public, extensions;

-- Create necessary schemas
CREATE SCHEMA IF NOT EXISTS budget_app;

-- First create the sources table as it's referenced by others
CREATE TABLE IF NOT EXISTS budget_app.sources (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Create the measurement units table
CREATE TABLE IF NOT EXISTS budget_app.measurement_units (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    symbol text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create the payers table
CREATE TABLE IF NOT EXISTS budget_app.payers (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create the categories table
CREATE TABLE IF NOT EXISTS budget_app.categories (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    parent_id uuid REFERENCES budget_app.categories(id),
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS budget_app.transactions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp with time zone DEFAULT now(),
    type text NOT NULL,
    category text,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    document_url text,
    payer_id uuid REFERENCES budget_app.payers(id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS budget_app.products (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    measurement_unit_id uuid REFERENCES budget_app.measurement_units(id),
    content_unit_id uuid REFERENCES budget_app.measurement_units(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_product_type CHECK (product_type IN ('basic', 'composite'))
);

-- Create recipe ingredients table
CREATE TABLE IF NOT EXISTS budget_app.recipe_ingredients (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id uuid REFERENCES budget_app.products(id) ON DELETE CASCADE,
    ingredient_id uuid REFERENCES budget_app.products(id) ON DELETE RESTRICT,
    content_quantity numeric(10, 3) NOT NULL CHECK (content_quantity > 0),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recipe_ingredients_unique_product_ingredient UNIQUE (product_id, ingredient_id)
);

-- Enable RLS on all tables
ALTER TABLE budget_app.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.measurement_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view sources"
    ON budget_app.sources FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage sources"
    ON budget_app.sources FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can view payers"
    ON budget_app.payers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage payers"
    ON budget_app.payers FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their source categories"
    ON budget_app.categories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = categories.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their source categories"
    ON budget_app.categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can view their source transactions"
    ON budget_app.transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = transactions.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their source transactions"
    ON budget_app.transactions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

-- Create public views
CREATE OR REPLACE VIEW public.payers AS SELECT * FROM budget_app.payers;
CREATE OR REPLACE VIEW public.categories AS SELECT * FROM budget_app.categories;
CREATE OR REPLACE VIEW public.transactions AS SELECT * FROM budget_app.transactions;

-- Grant permissions
GRANT USAGE ON SCHEMA budget_app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA budget_app TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA budget_app TO authenticated;