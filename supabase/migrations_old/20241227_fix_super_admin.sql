-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users with permissions" ON sources;
DROP POLICY IF EXISTS "Enable insert for users with permissions" ON sources;
DROP POLICY IF EXISTS "Enable update for users with permissions" ON sources;
DROP POLICY IF EXISTS "Enable delete for users with permissions" ON sources;

-- Update the has_full_access function to properly handle super_admin
CREATE OR REPLACE FUNCTION has_full_access(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role IN ('controller', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies that properly handle super_admin role
CREATE POLICY "Enable read access for users with permissions" ON sources
  FOR SELECT
  USING (
    has_full_access(auth.uid()) OR
    id IN (
      SELECT source_id 
      FROM source_permissions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for users with permissions" ON sources
  FOR INSERT
  WITH CHECK (has_full_access(auth.uid()));

CREATE POLICY "Enable update for users with permissions" ON sources
  FOR UPDATE
  USING (has_full_access(auth.uid()));

CREATE POLICY "Enable delete for users with permissions" ON sources
  FOR DELETE
  USING (has_full_access(auth.uid()));

-- Update source_permissions policies
DROP POLICY IF EXISTS "Enable read access for users" ON source_permissions;
DROP POLICY IF EXISTS "Enable insert for super admins" ON source_permissions;
DROP POLICY IF EXISTS "Enable delete for super admins" ON source_permissions;

CREATE POLICY "Enable read access for users" ON source_permissions
  FOR SELECT
  USING (
    has_full_access(auth.uid()) OR 
    user_id = auth.uid()
  );

CREATE POLICY "Enable insert for super admins" ON source_permissions
  FOR INSERT
  WITH CHECK (
    has_full_access(auth.uid())
  );

CREATE POLICY "Enable delete for super admins" ON source_permissions
  FOR DELETE
  USING (
    has_full_access(auth.uid())
  );

-- Reset permissions for proactivepixel@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID for proactivepixel@gmail.com
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = 'proactivepixel@gmail.com';

  -- Delete existing permissions
  DELETE FROM source_permissions
  WHERE user_id = v_user_id;

  -- Set role to super_admin
  UPDATE user_roles
  SET role = 'super_admin'
  WHERE user_id = v_user_id;
END $$;
