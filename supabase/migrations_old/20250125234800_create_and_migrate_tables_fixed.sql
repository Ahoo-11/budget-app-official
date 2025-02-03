-- 1. Create tables in budget_app schema
CREATE TABLE IF NOT EXISTS budget_app.payers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Let's check categories structure first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

-- Let's check transactions structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position;
