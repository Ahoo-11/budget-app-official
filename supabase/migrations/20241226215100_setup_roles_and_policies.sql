-- Setup roles and policies
BEGIN;
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS controller_access ON transactions;
DROP POLICY IF EXISTS admin_access ON transactions;
DROP POLICY IF EXISTS viewer_access ON transactions;
-- Controller policy (full access to everything)
CREATE POLICY controller_access ON transactions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);
-- Admin policies
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
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = transactions.source_id
    )
);
CREATE POLICY admin_update_permitted ON transactions
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = transactions.source_id
    )
);
CREATE POLICY admin_delete_permitted ON transactions
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = transactions.source_id
    )
);
-- Source permissions policies
CREATE POLICY controller_manage_sources ON sources
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);
CREATE POLICY admin_view_sources ON sources
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);
-- Source permissions management
CREATE POLICY controller_manage_permissions ON source_permissions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);
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
COMMIT;
