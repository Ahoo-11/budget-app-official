-- First, drop all existing policies on transactions
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own and permitted transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "enforce_source_access" ON transactions;
DROP POLICY IF EXISTS "enforce_transaction_permissions" ON transactions;
DROP POLICY IF EXISTS "public_access" ON transactions;
DROP POLICY IF EXISTS "super_admin_access" ON transactions;

-- Drop all existing policies on source_permissions
DROP POLICY IF EXISTS "controllers_can_delete_source_permissions" ON source_permissions;
DROP POLICY IF EXISTS "enforce_source_permissions_access" ON source_permissions;
DROP POLICY IF EXISTS "public_access" ON source_permissions;
DROP POLICY IF EXISTS "source_permissions_insert_policy" ON source_permissions;
DROP POLICY IF EXISTS "strict_permission_access" ON source_permissions;

-- Create new simplified policies for transactions

-- 1. Super admin can do everything
CREATE POLICY super_admin_full_access ON transactions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- 2. Users can view transactions from their permitted sources
CREATE POLICY user_view_permitted_transactions ON transactions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM source_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.source_id = transactions.source_id
  )
);

-- 3. Users can create transactions in their permitted sources
CREATE POLICY user_create_permitted_transactions ON transactions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM source_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.source_id = transactions.source_id
  )
);

-- 4. Users can update their own transactions in permitted sources
CREATE POLICY user_update_own_transactions ON transactions
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM source_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.source_id = transactions.source_id
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM source_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.source_id = transactions.source_id
  )
);

-- 5. Users can delete their own transactions in permitted sources
CREATE POLICY user_delete_own_transactions ON transactions
FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM source_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.source_id = transactions.source_id
  )
);

-- Create new simplified policies for source_permissions

-- 1. Super admin can do everything with source permissions
CREATE POLICY super_admin_manage_permissions ON source_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- 2. Users can view their own permissions
CREATE POLICY users_view_own_permissions ON source_permissions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Verify the new policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (tablename = 'transactions' OR tablename = 'source_permissions')
ORDER BY tablename, cmd;
