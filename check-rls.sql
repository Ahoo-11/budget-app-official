-- Enable RLS on transactions table if not already enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on source_permissions table if not already enabled
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS enforce_source_access ON transactions;
DROP POLICY IF EXISTS enforce_source_permissions_access ON source_permissions;

-- Create policy for transactions table
CREATE POLICY enforce_source_access ON transactions
FOR ALL USING (
  -- Allow super_admin to access all sources
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  )
  OR
  -- Allow users to access only their permitted sources
  source_id IN (
    SELECT source_id FROM source_permissions WHERE user_id = auth.uid()
  )
);

-- Create policy for source_permissions table
CREATE POLICY enforce_source_permissions_access ON source_permissions
FOR ALL USING (
  -- Allow super_admin to manage all permissions
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  )
  OR
  -- Users can see their own permissions
  user_id = auth.uid()
);

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (tablename = 'transactions' OR tablename = 'source_permissions');
