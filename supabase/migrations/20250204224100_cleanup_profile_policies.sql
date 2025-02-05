-- Drop all existing policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON budget.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON budget.profiles;
DROP POLICY IF EXISTS "Controllers can view all profiles" ON budget.profiles;
DROP POLICY IF EXISTS "Controllers can update profiles" ON budget.profiles;
DROP POLICY IF EXISTS "Users can update their own display name" ON budget.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON budget.profiles;

-- Create single policy for users to read their own profile
CREATE POLICY "Users can read their own profile"
    ON budget.profiles 
    FOR SELECT
    USING (auth.uid() = id);

-- Create single policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON budget.profiles 
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policy for controllers to read all profiles
CREATE POLICY "Controllers can read all profiles"
    ON budget.profiles 
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budget.user_roles
            WHERE user_id = auth.uid() 
            AND role = 'controller'
        )
    );
