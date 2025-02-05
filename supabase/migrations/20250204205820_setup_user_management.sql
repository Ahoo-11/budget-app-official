-- Drop old schema
DROP SCHEMA IF EXISTS budget_app CASCADE;

-- Create enum type for user roles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'budget')) THEN
        CREATE TYPE budget.user_role AS ENUM ('controller', 'admin', 'viewer');
    END IF;
END $$;

-- Create enum type for user status if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'budget')) THEN
        CREATE TYPE budget.user_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Ensure proper tables in budget schema
CREATE TABLE IF NOT EXISTS budget.profiles (
    id UUID REFERENCES auth.users(id),
    email TEXT,
    status budget.user_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS budget.user_roles (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role budget.user_role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS budget.sources (
    id UUID DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS budget.source_permissions (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    source_id UUID REFERENCES budget.sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE(user_id, source_id)
);

-- Enable RLS on all tables
ALTER TABLE budget.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.source_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON budget.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Controllers can view all profiles"
    ON budget.profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    ));

CREATE POLICY "Controllers can update profiles"
    ON budget.profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    ));

-- User Roles policies
CREATE POLICY "Controllers can manage roles"
    ON budget.user_roles FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    ));

CREATE POLICY "Users can view their own role"
    ON budget.user_roles FOR SELECT
    USING (user_id = auth.uid());

-- Sources policies
CREATE POLICY "Controllers can manage sources"
    ON budget.sources FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    ));

CREATE POLICY "Users can view assigned sources"
    ON budget.sources FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = id AND sp.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage assigned sources"
    ON budget.sources FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = budget.sources.id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    ));

-- Source Permissions policies
CREATE POLICY "Controllers can manage permissions"
    ON budget.source_permissions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    ));

CREATE POLICY "Users can view their permissions"
    ON budget.source_permissions FOR SELECT
    USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION budget.approve_user(
    p_user_id UUID,
    p_role budget.user_role,
    p_source_ids UUID[]
) RETURNS void AS $$
BEGIN
    -- Update profile status
    UPDATE budget.profiles 
    SET status = 'approved',
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Insert or update role
    INSERT INTO budget.user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = p_role, updated_at = now();
    
    -- Insert source permissions
    INSERT INTO budget.source_permissions (user_id, source_id)
    SELECT p_user_id, unnest(p_source_ids)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION budget.reject_user(
    p_user_id UUID
) RETURNS void AS $$
BEGIN
    UPDATE budget.profiles 
    SET status = 'rejected',
        updated_at = now()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Set up initial controller account
DO $$ 
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user ID for ahoo11official@gmail.com
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'ahoo11official@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Create or update profile
        INSERT INTO budget.profiles (id, email, status)
        VALUES (v_user_id, 'ahoo11official@gmail.com', 'approved')
        ON CONFLICT (id) DO UPDATE 
        SET status = 'approved',
            updated_at = now();

        -- Set controller role
        INSERT INTO budget.user_roles (user_id, role)
        VALUES (v_user_id, 'controller')
        ON CONFLICT (user_id) DO UPDATE 
        SET role = 'controller',
            updated_at = now();
    END IF;
END $$;
