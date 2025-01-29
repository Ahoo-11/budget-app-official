-- First, let's clean up any existing policies
DROP POLICY IF EXISTS "Users can view their permitted sources" ON sources;
DROP POLICY IF EXISTS "Users can view transactions from their sources" ON transactions;
DROP POLICY IF EXISTS "Controller can view all" ON sources;
DROP POLICY IF EXISTS "Controller can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Only controller can manage source permissions" ON source_permissions;
-- Drop any other policies that might interfere
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sources;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON transactions;
-- Enable RLS on all tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;
-- Create a function to check if user is controller or super_admin
CREATE OR REPLACE FUNCTION has_full_access(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('controller', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create policies for sources table
CREATE POLICY "Full access users can manage all sources"
    ON sources
    FOR ALL
    TO authenticated
    USING (has_full_access(auth.uid()));
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
    );
-- Create policies for transactions table
CREATE POLICY "Full access users can manage all transactions"
    ON transactions
    FOR ALL
    TO authenticated
    USING (has_full_access(auth.uid()));
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
    );
-- Create policy for source_permissions table
CREATE POLICY "Only full access users can manage permissions"
    ON source_permissions
    FOR ALL
    TO authenticated
    USING (has_full_access(auth.uid()));
-- Set up controller role for ahoo11official@gmail.com
DO $$ 
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'ahoo11official@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Remove any existing role first
        DELETE FROM user_roles WHERE user_id = v_user_id;
        
        -- Insert controller role
        INSERT INTO user_roles (user_id, role)
        VALUES (v_user_id, 'controller');
    END IF;
END $$;
-- Set up ahusamahmed90@gmail.com with viewer role and Huvaa source access
DO $$ 
DECLARE
    v_user_id uuid;
    v_source_id uuid;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'ahusamahmed90@gmail.com';

    -- Get Huvaa source ID
    SELECT id INTO v_source_id 
    FROM sources 
    WHERE name = 'Huvaa';

    IF v_user_id IS NOT NULL THEN
        -- Remove any existing role
        DELETE FROM user_roles WHERE user_id = v_user_id;
        
        -- Set viewer role
        INSERT INTO user_roles (user_id, role)
        VALUES (v_user_id, 'viewer');

        -- Remove any existing source permissions
        DELETE FROM source_permissions WHERE user_id = v_user_id;

        -- Grant access only to Huvaa source
        IF v_source_id IS NOT NULL THEN
            INSERT INTO source_permissions (user_id, source_id)
            VALUES (v_user_id, v_source_id);
        END IF;
    END IF;
END $$;
