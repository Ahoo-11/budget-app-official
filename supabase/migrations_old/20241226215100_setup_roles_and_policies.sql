-- Setup roles and policies
BEGIN;

-- Set search path for table creation
SET search_path TO budget, auth, public;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS budget.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.source_permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    source_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.sources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS controller_access ON budget.transactions;
DROP POLICY IF EXISTS admin_access ON budget.transactions;
DROP POLICY IF EXISTS viewer_access ON budget.transactions;

-- Controller policy (full access to everything)
CREATE POLICY controller_access ON budget.transactions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);

-- Admin policies
CREATE POLICY admin_view_all ON budget.transactions
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY admin_modify_permitted ON budget.transactions
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM budget.user_roles ur
        JOIN budget.source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = budget.transactions.source_id
    )
);

CREATE POLICY admin_update_permitted ON budget.transactions
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles ur
        JOIN budget.source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = budget.transactions.source_id
    )
);

CREATE POLICY admin_delete_permitted ON budget.transactions
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles ur
        JOIN budget.source_permissions sp ON sp.user_id = ur.user_id
        WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND sp.source_id = budget.transactions.source_id
    )
);

-- Source permissions policies
CREATE POLICY controller_manage_sources ON budget.sources
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);

CREATE POLICY admin_view_sources ON budget.sources
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Source permissions management
CREATE POLICY controller_manage_permissions ON budget.source_permissions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid()
        AND role = 'controller'
    )
);

CREATE POLICY admin_manage_viewer_permissions ON budget.source_permissions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles ur1
        WHERE ur1.user_id = auth.uid()
        AND ur1.role = 'admin'
        AND EXISTS (
            SELECT 1 FROM budget.user_roles ur2
            WHERE ur2.user_id = budget.source_permissions.user_id
            AND ur2.role = 'viewer'
        )
    )
);

COMMIT;
