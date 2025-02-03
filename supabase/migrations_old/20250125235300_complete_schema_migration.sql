-- Create enum types
CREATE TYPE budget_app.transaction_status AS ENUM ('pending', 'completed');
CREATE TYPE budget_app.payment_method_type AS ENUM ('transfer');

-- 1. Create and migrate sources (base table)
CREATE TABLE IF NOT EXISTS budget_app.sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Move sources data first
INSERT INTO budget_app.sources (id, name, created_at, user_id)
SELECT id, name, created_at, user_id
FROM public.sources
ON CONFLICT (id) DO NOTHING;

-- 2. Create and migrate payers
CREATE TABLE IF NOT EXISTS budget_app.payers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO budget_app.payers (id, user_id, name, created_at)
SELECT id, user_id, name, created_at 
FROM public.payers
ON CONFLICT (id) DO NOTHING;

-- 3. Create and migrate categories (depends on sources)
CREATE TABLE IF NOT EXISTS budget_app.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    source_id uuid REFERENCES budget_app.sources(id),
    parent_id uuid REFERENCES budget_app.categories(id)
);

INSERT INTO budget_app.categories (id, name, source_id, parent_id)
SELECT id, name, source_id, parent_id
FROM public.categories
ON CONFLICT (id) DO NOTHING;

-- 4. Create and migrate transactions (depends on sources, categories, and payers)
CREATE TABLE IF NOT EXISTS budget_app.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    source_id uuid REFERENCES budget_app.sources(id),
    description text,
    amount numeric,
    type text,
    category text,
    date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    payer_id uuid REFERENCES budget_app.payers(id),
    category_id uuid REFERENCES budget_app.categories(id),
    created_by_name text,
    status budget_app.transaction_status,
    document_url text,
    total_amount numeric,
    remaining_amount numeric,
    parent_transaction_id uuid REFERENCES budget_app.transactions(id),
    is_recurring boolean,
    recurring_frequency text,
    next_occurrence timestamp with time zone,
    payment_method budget_app.payment_method_type,
    session_id uuid
);

INSERT INTO budget_app.transactions (
    id, user_id, source_id, description, amount, type, category,
    date, created_at, payer_id, category_id, created_by_name,
    status, document_url, total_amount, remaining_amount,
    parent_transaction_id, is_recurring, recurring_frequency,
    next_occurrence, payment_method, session_id
)
SELECT 
    id, user_id, source_id, description, amount, type, category,
    date, created_at, payer_id, category_id, created_by_name,
    status::budget_app.transaction_status, document_url, total_amount, remaining_amount,
    parent_transaction_id, is_recurring, recurring_frequency,
    next_occurrence, payment_method::budget_app.payment_method_type, session_id
FROM public.transactions
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE budget_app.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.transactions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their sources"
    ON budget_app.sources FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their sources"
    ON budget_app.sources FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their payers"
    ON budget_app.payers FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their payers"
    ON budget_app.payers FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their categories"
    ON budget_app.categories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = categories.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their categories"
    ON budget_app.categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can view their transactions"
    ON budget_app.transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their transactions"
    ON budget_app.transactions FOR ALL
    USING (user_id = auth.uid());

-- Drop old tables and create views
DROP TABLE IF EXISTS public.sources CASCADE;
DROP TABLE IF EXISTS public.payers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Create views in public schema
CREATE VIEW public.sources AS SELECT * FROM budget_app.sources;
CREATE VIEW public.payers AS SELECT * FROM budget_app.payers;
CREATE VIEW public.categories AS SELECT * FROM budget_app.categories;
CREATE VIEW public.transactions AS SELECT * FROM budget_app.transactions;

-- Grant permissions
GRANT ALL ON budget_app.sources TO authenticated;
GRANT ALL ON budget_app.payers TO authenticated;
GRANT ALL ON budget_app.categories TO authenticated;
GRANT ALL ON budget_app.transactions TO authenticated;

GRANT ALL ON public.sources TO authenticated;
GRANT ALL ON public.payers TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.transactions TO authenticated;

GRANT SELECT ON public.sources TO anon;
GRANT SELECT ON public.payers TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.transactions TO anon;

-- Verify data migration
SELECT 
    (SELECT COUNT(*) FROM budget_app.sources) as sources_count,
    (SELECT COUNT(*) FROM budget_app.payers) as payers_count,
    (SELECT COUNT(*) FROM budget_app.categories) as categories_count,
    (SELECT COUNT(*) FROM budget_app.transactions) as transactions_count;
