-- Drop the old role enum type
DROP TYPE IF EXISTS user_role CASCADE;

-- Create new simplified role enum
CREATE TYPE user_role AS ENUM ('controller', 'admin', 'viewer');

-- Update the RLS policies for sources table
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION has_source_access(source_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Controller has access to all sources
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'controller'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check source_permissions for other users
  RETURN EXISTS (
    SELECT 1 FROM source_permissions 
    WHERE source_permissions.user_id = auth.uid()
    AND source_permissions.source_id = source_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS sources_select_policy ON sources;
CREATE POLICY sources_select_policy ON sources
  FOR SELECT USING (
    has_source_access(id)
  );

DROP POLICY IF EXISTS sources_insert_policy ON sources;
CREATE POLICY sources_insert_policy ON sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

DROP POLICY IF EXISTS sources_update_policy ON sources;
CREATE POLICY sources_update_policy ON sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

DROP POLICY IF EXISTS sources_delete_policy ON sources;
CREATE POLICY sources_delete_policy ON sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

-- Update source_permissions policies
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS source_permissions_select_policy ON source_permissions;
CREATE POLICY source_permissions_select_policy ON source_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND (user_roles.role = 'controller' OR user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS source_permissions_insert_policy ON source_permissions;
CREATE POLICY source_permissions_insert_policy ON source_permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

DROP POLICY IF EXISTS source_permissions_update_policy ON source_permissions;
CREATE POLICY source_permissions_update_policy ON source_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

DROP POLICY IF EXISTS source_permissions_delete_policy ON source_permissions;
CREATE POLICY source_permissions_delete_policy ON source_permissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
  );

-- Update transactions policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS transactions_select_policy ON transactions;
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT USING (
    has_source_access(source_id)
  );

DROP POLICY IF EXISTS transactions_insert_policy ON transactions;
CREATE POLICY transactions_insert_policy ON transactions
  FOR INSERT WITH CHECK (
    has_source_access(source_id) AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('controller', 'admin')
    )
  );

DROP POLICY IF EXISTS transactions_update_policy ON transactions;
CREATE POLICY transactions_update_policy ON transactions
  FOR UPDATE USING (
    has_source_access(source_id) AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('controller', 'admin')
    )
  );

DROP POLICY IF EXISTS transactions_delete_policy ON transactions;
CREATE POLICY transactions_delete_policy ON transactions
  FOR DELETE USING (
    has_source_access(source_id) AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('controller', 'admin')
    )
  );

-- Reset all roles to admin except for controller
UPDATE user_roles SET role = 'admin' 
WHERE role NOT IN ('controller', 'admin', 'viewer');

-- Ensure ahoo11official@gmail.com is the only controller
WITH user_email AS (
  SELECT id FROM profiles WHERE email = 'ahoo11official@gmail.com'
)
UPDATE user_roles 
SET role = CASE 
  WHEN user_id = (SELECT id FROM user_email) THEN 'controller'
  ELSE 'admin' 
END
WHERE role = 'controller';

-- Remove any source permissions for the controller account
DELETE FROM source_permissions 
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'ahoo11official@gmail.com'
);
