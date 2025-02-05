-- Drop old policies
DROP POLICY IF EXISTS "Users can update their own display name" ON budget.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON budget.profiles;

-- Create new policy for display name updates
CREATE POLICY "Users can update their own profile"
    ON budget.profiles 
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Enable row level security on budget schema tables
ALTER TABLE budget.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.source_permissions ENABLE ROW LEVEL SECURITY;

-- Add display_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'budget' 
        AND table_name = 'profiles' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE budget.profiles ADD COLUMN display_name TEXT;
    END IF;
END $$;
