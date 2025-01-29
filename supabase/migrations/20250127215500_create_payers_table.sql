-- First backup existing data if any
CREATE TEMP TABLE IF NOT EXISTS payers_backup AS
SELECT * FROM public.payers;

-- Drop existing table if exists
DROP TABLE IF EXISTS public.payers CASCADE;

-- Create payers table in budget_app schema
CREATE TABLE IF NOT EXISTS budget_app.payers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Copy backed up data if any exists
INSERT INTO budget_app.payers (id, name, user_id, created_at, updated_at)
SELECT id, name, user_id, created_at, updated_at
FROM payers_backup
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    user_id = EXCLUDED.user_id,
    updated_at = EXCLUDED.updated_at;

-- Create view in public schema for backward compatibility
CREATE VIEW public.payers AS 
SELECT * FROM budget_app.payers;

-- Add RLS policies
ALTER TABLE budget_app.payers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payers"
    ON budget_app.payers
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payers"
    ON budget_app.payers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payers"
    ON budget_app.payers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payers"
    ON budget_app.payers
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER set_payers_updated_at
    BEFORE UPDATE ON budget_app.payers
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.set_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_app.payers TO authenticated;
GRANT SELECT ON budget_app.payers TO anon;

-- Clean up
DROP TABLE IF EXISTS payers_backup;

-- Add foreign key to bills table
ALTER TABLE budget_app.bills
ADD COLUMN IF NOT EXISTS payer_id uuid REFERENCES budget_app.payers(id);

-- Comment explaining the setup
COMMENT ON TABLE budget_app.payers IS 
'Payers table to track who paid for bills.';
