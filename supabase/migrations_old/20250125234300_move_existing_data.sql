-- First, move existing data to budget_app schema
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

-- Drop existing tables
DROP TABLE IF EXISTS public.payers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- Recreate as views
CREATE VIEW public.payers AS SELECT * FROM budget_app.payers;
CREATE VIEW public.categories AS SELECT * FROM budget_app.categories;
CREATE VIEW public.templates AS SELECT * FROM budget_app.templates;
CREATE VIEW public.transactions AS SELECT * FROM budget_app.transactions;
CREATE VIEW public.suppliers AS SELECT * FROM budget_app.suppliers;

-- Grant permissions on views
GRANT ALL ON public.payers TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.suppliers TO authenticated;

GRANT SELECT ON public.payers TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.templates TO anon;
GRANT SELECT ON public.transactions TO anon;
GRANT SELECT ON public.suppliers TO anon;
