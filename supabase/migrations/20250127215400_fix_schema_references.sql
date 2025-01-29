-- First, backup existing data
CREATE TEMP TABLE profiles_backup AS
SELECT * FROM public.profiles;

-- Drop existing table (will cascade to dependent objects)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Move profiles table to budget_app schema
CREATE TABLE IF NOT EXISTS budget_app.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    display_name text,
    status text
);

-- Copy backed up data
INSERT INTO budget_app.profiles (id, email, created_at, updated_at, display_name, status)
SELECT id, email, created_at, updated_at, display_name, status
FROM profiles_backup
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

-- Create view in public schema
CREATE OR REPLACE VIEW public.profiles AS 
SELECT * FROM budget_app.profiles;

-- Add RLS policies
ALTER TABLE budget_app.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON budget_app.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON budget_app.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION budget_app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON budget_app.profiles
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.set_updated_at();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON budget_app.profiles TO authenticated;
GRANT SELECT ON budget_app.profiles TO anon;

-- Clean up
DROP TABLE IF EXISTS profiles_backup;

-- Comment explaining the setup
COMMENT ON TABLE budget_app.profiles IS 
'User profiles table with extended information not stored in auth.users.';
