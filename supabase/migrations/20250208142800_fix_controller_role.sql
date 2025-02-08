-- Create role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE budget.user_role AS ENUM ('controller', 'admin', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure user_roles table exists in budget schema
CREATE TABLE IF NOT EXISTS budget.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    role budget.user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set ahoo11official@gmail.com as controller
INSERT INTO budget.user_roles (user_id, role)
SELECT id, 'controller'::budget.user_role
FROM auth.users
WHERE email = 'ahoo11official@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'controller'::budget.user_role,
    updated_at = NOW();
