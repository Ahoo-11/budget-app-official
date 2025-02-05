-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS budget_app;

-- Ensure sources table exists
CREATE TABLE IF NOT EXISTS budget_app.sources (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS budget_app.categories (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    source_id uuid REFERENCES budget_app.sources(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Create role enum type if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'budget_app')) THEN
        CREATE TYPE budget_app.user_role AS ENUM ('controller', 'admin', 'viewer');
    END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS budget_app.user_roles (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role budget_app.user_role NOT NULL DEFAULT 'viewer',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Create source_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS budget_app.source_permissions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, source_id)
);

-- Insert default source for users who don't have one
INSERT INTO budget_app.sources (name, user_id)
SELECT 'Default Source', au.id
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM budget_app.sources s 
    WHERE s.user_id = au.id
);

-- Insert default categories for sources that don't have them
WITH source_data AS (
    SELECT s.id as source_id
    FROM budget_app.sources s
    WHERE NOT EXISTS (
        SELECT 1 FROM budget_app.categories c 
        WHERE c.source_id = s.id
    )
)
INSERT INTO budget_app.categories (name, source_id)
SELECT name, source_data.source_id
FROM (
    VALUES 
        ('Income'),
        ('Expenses'),
        ('Investments')
) AS categories(name)
CROSS JOIN source_data;

-- Set up RLS policies
ALTER TABLE budget_app.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_permissions ENABLE ROW LEVEL SECURITY;

-- Source policies
DROP POLICY IF EXISTS "Users can view their own sources" ON budget_app.sources;
CREATE POLICY "Users can view their own sources" ON budget_app.sources
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sources" ON budget_app.sources;
CREATE POLICY "Users can manage their own sources" ON budget_app.sources
    FOR ALL USING (auth.uid() = user_id);

-- Category policies
DROP POLICY IF EXISTS "Users can view categories of their sources" ON budget_app.categories;
CREATE POLICY "Users can view categories of their sources" ON budget_app.categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM budget_app.sources s
            WHERE s.id = source_id AND s.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage categories of their sources" ON budget_app.categories;
CREATE POLICY "Users can manage categories of their sources" ON budget_app.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM budget_app.sources s
            WHERE s.id = source_id AND s.user_id = auth.uid()
        )
    );

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON budget_app.user_roles;
CREATE POLICY "Users can view their own roles" ON budget_app.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Source permissions policies
DROP POLICY IF EXISTS "Users can view their own permissions" ON budget_app.source_permissions;
CREATE POLICY "Users can view their own permissions" ON budget_app.source_permissions
    FOR SELECT USING (auth.uid() = user_id);
