-- 1. Create tables in budget_app schema
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

-- 2. Move data from public schema
INSERT INTO budget_app.payers (id, name, created_at, updated_at)
SELECT id, name, created_at, updated_at 
FROM public.payers
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_app.categories (id, name, parent_id, source_id, created_at, updated_at)
SELECT id, name, parent_id, source_id, created_at, updated_at 
FROM public.categories
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_app.transactions (id, description, amount, date, type, category, source_id, created_at, updated_at, document_url, payer_id)
SELECT id, description, amount, date, type, category, source_id, created_at, updated_at, document_url, payer_id
FROM public.transactions
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE budget_app.payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies
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

-- 5. Drop old tables and create views
DROP TABLE IF EXISTS public.payers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

CREATE VIEW public.payers AS SELECT * FROM budget_app.payers;
CREATE VIEW public.categories AS SELECT * FROM budget_app.categories;
CREATE VIEW public.transactions AS SELECT * FROM budget_app.transactions;

-- 6. Grant permissions
GRANT ALL ON budget_app.payers TO authenticated;
GRANT ALL ON budget_app.categories TO authenticated;
GRANT ALL ON budget_app.transactions TO authenticated;

GRANT ALL ON public.payers TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.transactions TO authenticated;

GRANT SELECT ON public.payers TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.transactions TO anon;
