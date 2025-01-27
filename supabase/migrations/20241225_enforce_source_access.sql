-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS enforce_source_access ON transactions;
DROP POLICY IF EXISTS enforce_source_permissions_access ON source_permissions;

-- Create policy for transactions
CREATE POLICY enforce_source_access ON transactions
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  )
  OR
  source_id IN (
    SELECT source_id FROM source_permissions WHERE user_id = auth.uid()
  )
);

-- Create policy for source_permissions
CREATE POLICY enforce_source_permissions_access ON source_permissions
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  )
  OR
  user_id = auth.uid()
);
