
-- Create role enum type
CREATE TYPE budget_app.user_role AS ENUM ('controller', 'admin', 'viewer');

-- Create user_roles table
CREATE TABLE budget_app.user_roles (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role budget_app.user_role NOT NULL DEFAULT 'viewer',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Create source_permissions table
CREATE TABLE budget_app.source_permissions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, source_id)
);

-- Enable RLS
ALTER TABLE budget_app.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_permissions ENABLE ROW LEVEL SECURITY;

-- Function to check if user has access to a source
CREATE OR REPLACE FUNCTION budget_app.has_source_access(source_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Controller has access to all sources
    IF EXISTS (
        SELECT 1 FROM budget_app.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'controller'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check source_permissions for other users
    RETURN EXISTS (
        SELECT 1 FROM budget_app.source_permissions 
        WHERE user_id = auth.uid()
        AND source_id = has_source_access.source_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_roles

-- Only controller can view all roles
CREATE POLICY "Controller can view all roles"
    ON budget_app.user_roles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budget_app.user_roles
            WHERE user_id = auth.uid()
            AND role = 'controller'
        )
        OR user_id = auth.uid()  -- Users can view their own role
    );

-- Only controller can manage roles
CREATE POLICY "Controller can manage roles"
    ON budget_app.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budget_app.user_roles
            WHERE user_id = auth.uid()
            AND role = 'controller'
        )
    );

-- RLS Policies for source_permissions

-- Controller and admins can view permissions
CREATE POLICY "Controller and admins can view permissions"
    ON budget_app.source_permissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budget_app.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
        OR user_id = auth.uid()  -- Users can view their own permissions
    );

-- Only controller can manage permissions
CREATE POLICY "Controller can manage permissions"
    ON budget_app.source_permissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budget_app.user_roles
            WHERE user_id = auth.uid()
            AND role = 'controller'
        )
    );

-- Update RLS policies for sources table
CREATE POLICY "Users can view their sources"
    ON budget_app.sources
    FOR SELECT
    TO authenticated
    USING (budget_app.has_source_access(id));

CREATE POLICY "Controller and admins can manage sources"
    ON budget_app.sources
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budget_app.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
        AND budget_app.has_source_access(id)
    );

-- Make ahoo11official@gmail.com the controller
INSERT INTO budget_app.user_roles (user_id, role)
SELECT id, 'controller'::budget_app.user_role
FROM auth.users
WHERE email = 'ahoo11official@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'controller'::budget_app.user_role;

-- Grant permissions
GRANT USAGE ON SCHEMA budget_app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA budget_app TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA budget_app TO authenticated;