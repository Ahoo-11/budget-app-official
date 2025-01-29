-- First, let's ensure RLS is enabled on necessary tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their permitted sources" ON sources;
DROP POLICY IF EXISTS "Users can view transactions from their sources" ON transactions;
DROP POLICY IF EXISTS "Controller can view all" ON sources;
DROP POLICY IF EXISTS "Controller can view all transactions" ON transactions;
-- Create a function to check if user is controller
CREATE OR REPLACE FUNCTION is_controller(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = user_id 
        AND role = 'controller'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create policies for sources table
CREATE POLICY "Controller can view all sources"
    ON sources
    FOR ALL
    TO authenticated
    USING (is_controller(auth.uid()));
CREATE POLICY "Users can view their permitted sources"
    ON sources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM source_permissions sp 
            WHERE sp.source_id = sources.id 
            AND sp.user_id = auth.uid()
        )
        OR is_controller(auth.uid())
    );
-- Create policies for transactions table
CREATE POLICY "Controller can view all transactions"
    ON transactions
    FOR ALL
    TO authenticated
    USING (is_controller(auth.uid()));
CREATE POLICY "Users can view transactions from their sources"
    ON transactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM source_permissions sp 
            WHERE sp.source_id = transactions.source_id 
            AND sp.user_id = auth.uid()
        )
        OR is_controller(auth.uid())
    );
-- Create policy for source_permissions table
CREATE POLICY "Only controller can manage source permissions"
    ON source_permissions
    FOR ALL
    TO authenticated
    USING (is_controller(auth.uid()));
-- Function to assign source to user
CREATE OR REPLACE FUNCTION assign_source_to_user(
    target_user_email text,
    source_name text
)
RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_source_id uuid;
BEGIN
    -- Only allow controller to execute this function
    IF NOT is_controller(auth.uid()) THEN
        RAISE EXCEPTION 'Only controller can assign sources to users';
    END IF;

    -- Get user ID
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = target_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Get source ID
    SELECT id INTO v_source_id 
    FROM sources 
    WHERE name = source_name;

    IF v_source_id IS NULL THEN
        RAISE EXCEPTION 'Source not found';
    END IF;

    -- Insert or update permission
    INSERT INTO source_permissions (user_id, source_id)
    VALUES (v_user_id, v_source_id)
    ON CONFLICT (user_id, source_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Set up controller role for ahoo11official@gmail.com
DO $$ 
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'ahoo11official@gmail.com';

    IF v_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (v_user_id, 'controller')
        ON CONFLICT (user_id) DO UPDATE SET role = 'controller';
    END IF;
END $$;
