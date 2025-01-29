-- First, ensure we're in a clean state
DROP TABLE IF EXISTS public.sources CASCADE;
DROP TABLE IF EXISTS budget_app.sources CASCADE;

-- Recreate the sources table in budget_app schema
CREATE TABLE budget_app.sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Insert the sources with their original IDs
INSERT INTO budget_app.sources (id, name, created_at, user_id) VALUES
    ('c8625867-6296-49fb-8b05-539432c3ac28', 'Huvaa', '2024-12-27 16:58:16.990663+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa'),
    ('d5ac817d-430b-4640-ba4f-c494b4b62610', 'Petrol', '2024-12-31 16:53:09.385737+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa'),
    ('3f624f16-475e-4bd9-bc44-9191619997fb', 'Faza', '2025-01-23 14:16:45.19725+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa');

-- Enable RLS
ALTER TABLE budget_app.sources ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their sources"
    ON budget_app.sources FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their sources"
    ON budget_app.sources FOR ALL
    USING (user_id = auth.uid());

-- Create view in public schema
CREATE VIEW public.sources AS SELECT * FROM budget_app.sources;

-- Grant permissions
GRANT ALL ON budget_app.sources TO authenticated;
GRANT ALL ON public.sources TO authenticated;
GRANT SELECT ON public.sources TO anon;

-- Verify the data
SELECT * FROM budget_app.sources ORDER BY created_at;
