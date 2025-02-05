-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own display name" ON budget.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON budget.profiles;

-- Create policy to allow users to update their own display name
CREATE POLICY "Users can update their own profile"
    ON budget.profiles 
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
