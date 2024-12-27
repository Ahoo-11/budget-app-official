-- First, drop all existing policies
DROP POLICY IF EXISTS super_admin_full_access ON transactions;
DROP POLICY IF EXISTS user_view_permitted_transactions ON transactions;
DROP POLICY IF EXISTS user_create_permitted_transactions ON transactions;
DROP POLICY IF EXISTS user_update_own_transactions ON transactions;
DROP POLICY IF EXISTS user_delete_own_transactions ON transactions;
DROP POLICY IF EXISTS super_admin_manage_permissions ON source_permissions;
DROP POLICY IF EXISTS users_view_own_permissions ON source_permissions;

-- Create new role-based policies for transactions

-- 1. Controller has full access to everything
CREATE POLICY controller_full_access ON transactions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'controller'
  )
);

-- 2. Super admin access (everything except certain administrative actions)
CREATE POLICY super_admin_access ON transactions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- 3. Admin access (can view all, create/edit/delete in permitted sources)
CREATE POLICY admin_view_all ON transactions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY admin_modify_permitted ON transactions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN source_permissions sp ON sp.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
    AND sp.source_id = transactions.source_id
  )
);

-- 4. Viewer access (can only view permitted sources)
CREATE POLICY viewer_access ON transactions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN source_permissions sp ON sp.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'viewer'
    AND sp.source_id = transactions.source_id
  )
);

-- Policies for source_permissions table

-- 1. Controller can do everything with permissions
CREATE POLICY controller_manage_all_permissions ON source_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'controller'
  )
);

-- 2. Super admin can manage permissions (except for other super admins)
CREATE POLICY super_admin_manage_permissions ON source_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur1
    WHERE ur1.user_id = auth.uid()
    AND ur1.role = 'super_admin'
    AND NOT EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.user_id = source_permissions.user_id
      AND ur2.role IN ('controller', 'super_admin')
    )
  )
);

-- 3. Admin can view all permissions but only modify viewer permissions
CREATE POLICY admin_manage_viewer_permissions ON source_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur1
    WHERE ur1.user_id = auth.uid()
    AND ur1.role = 'admin'
    AND EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.user_id = source_permissions.user_id
      AND ur2.role = 'viewer'
    )
  )
);

-- 4. All users can view their own permissions
CREATE POLICY users_view_own_permissions ON source_permissions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Create policies for sources table

-- 1. Only controller can create/delete sources
CREATE POLICY controller_manage_sources ON sources
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'controller'
  )
);

-- 2. Super admin and admin can view all sources
CREATE POLICY admin_view_sources ON sources
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- 3. Viewers can only see permitted sources
CREATE POLICY viewer_view_permitted_sources ON sources
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM source_permissions sp
    JOIN user_roles ur ON ur.user_id = sp.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'viewer'
    AND sp.source_id = sources.id
  )
);

-- Verify roles
SELECT p.email, ur.role
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com');
