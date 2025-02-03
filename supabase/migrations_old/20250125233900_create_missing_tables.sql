-- Create missing tables in budget_app schema
CREATE TABLE IF NOT EXISTS budget_app.payers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_app.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    parent_id uuid REFERENCES budget_app.categories(id),
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_app.templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    content jsonb NOT NULL,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_app.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS budget_app.suppliers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    contact_info jsonb,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_app.payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.suppliers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
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

-- Create views
CREATE OR REPLACE VIEW public.payers AS SELECT * FROM budget_app.payers;
CREATE OR REPLACE VIEW public.categories AS SELECT * FROM budget_app.categories;
CREATE OR REPLACE VIEW public.templates AS SELECT * FROM budget_app.templates;
CREATE OR REPLACE VIEW public.transactions AS SELECT * FROM budget_app.transactions;
CREATE OR REPLACE VIEW public.suppliers AS SELECT * FROM budget_app.suppliers;

-- Grant permissions
GRANT ALL ON budget_app.payers TO authenticated;
GRANT ALL ON budget_app.categories TO authenticated;
GRANT ALL ON budget_app.templates TO authenticated;
GRANT ALL ON budget_app.transactions TO authenticated;
GRANT ALL ON budget_app.suppliers TO authenticated;

GRANT SELECT ON budget_app.payers TO anon;
GRANT SELECT ON budget_app.categories TO anon;
GRANT SELECT ON budget_app.templates TO anon;
GRANT SELECT ON budget_app.transactions TO anon;
GRANT SELECT ON budget_app.suppliers TO anon;

-- Move data from public schema if it exists
INSERT INTO budget_app.payers 
SELECT * FROM public.payers WHERE id NOT IN (SELECT id FROM budget_app.payers);

INSERT INTO budget_app.categories 
SELECT * FROM public.categories WHERE id NOT IN (SELECT id FROM budget_app.categories);

INSERT INTO budget_app.templates 
SELECT * FROM public.templates WHERE id NOT IN (SELECT id FROM budget_app.templates);

INSERT INTO budget_app.transactions 
SELECT * FROM public.transactions WHERE id NOT IN (SELECT id FROM budget_app.transactions);

INSERT INTO budget_app.suppliers 
SELECT * FROM public.suppliers WHERE id NOT IN (SELECT id FROM budget_app.suppliers);
