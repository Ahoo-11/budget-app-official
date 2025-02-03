-- First backup existing data
CREATE TEMP TABLE IF NOT EXISTS bills_backup AS
SELECT * FROM public.bills;

-- Drop existing table if exists
DROP TABLE IF EXISTS public.bills CASCADE;

-- Create bills table in budget_app schema
CREATE TABLE IF NOT EXISTS budget_app.bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid REFERENCES budget_app.sources(id),
    user_id uuid REFERENCES auth.users(id),
    payer_id uuid REFERENCES budget_app.payers(id),
    items jsonb NOT NULL,
    subtotal decimal NOT NULL,
    gst decimal NOT NULL,
    total decimal NOT NULL,
    paid_amount decimal DEFAULT 0,
    status text DEFAULT 'active',
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    income_type_id uuid
);

-- Copy backed up data if any exists
INSERT INTO budget_app.bills (
    id, source_id, user_id, payer_id, items, subtotal, 
    gst, total, paid_amount, status, date, created_at, 
    updated_at, income_type_id
)
SELECT 
    id, source_id, user_id, payer_id, items::jsonb, subtotal::decimal, 
    gst::decimal, total::decimal, paid_amount::decimal, status, date::date, created_at, 
    updated_at, income_type_id::uuid
FROM bills_backup
ON CONFLICT (id) DO UPDATE SET
    source_id = EXCLUDED.source_id,
    user_id = EXCLUDED.user_id,
    payer_id = EXCLUDED.payer_id,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    gst = EXCLUDED.gst,
    total = EXCLUDED.total,
    paid_amount = EXCLUDED.paid_amount,
    status = EXCLUDED.status,
    date = EXCLUDED.date,
    updated_at = EXCLUDED.updated_at,
    income_type_id = EXCLUDED.income_type_id;

-- Create view in public schema for backward compatibility
CREATE VIEW public.bills AS 
SELECT * FROM budget_app.bills;

-- Add RLS policies
ALTER TABLE budget_app.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills"
    ON budget_app.bills
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
    ON budget_app.bills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
    ON budget_app.bills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
    ON budget_app.bills
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER set_bills_updated_at
    BEFORE UPDATE ON budget_app.bills
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.set_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_app.bills TO authenticated;
GRANT SELECT ON budget_app.bills TO anon;

-- Clean up
DROP TABLE IF EXISTS bills_backup;

-- Comment explaining the setup
COMMENT ON TABLE budget_app.bills IS 
'Bills table to track expenses and purchases.';
