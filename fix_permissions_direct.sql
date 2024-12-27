-- Reset and recreate all necessary tables and policies

-- First, clean up existing policies
DROP POLICY IF EXISTS "Users can view their permitted sources" ON sources;
DROP POLICY IF EXISTS "Users can view transactions from their sources" ON transactions;
DROP POLICY IF EXISTS "Controller can view all" ON sources;
DROP POLICY IF EXISTS "Controller can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Only controller can manage source permissions" ON source_permissions;
DROP POLICY IF EXISTS "Full access users can manage all sources" ON sources;
DROP POLICY IF EXISTS "Full access users can manage all transactions" ON transactions;
DROP POLICY IF EXISTS "Only full access users can manage permissions" ON source_permissions;

-- Make sure RLS is enabled
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_permissions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Enable read for users with access" ON sources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM source_permissions sp 
            WHERE sp.source_id = sources.id 
            AND sp.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 
            FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('controller', 'super_admin')
        )
    );

CREATE POLICY "Enable read for users with access" ON transactions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM source_permissions sp 
            WHERE sp.source_id = transactions.source_id 
            AND sp.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 
            FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('controller', 'super_admin')
        )
    );

-- Reset user roles and permissions
DO $$ 
DECLARE
    v_controller_id uuid;
    v_viewer_id uuid;
    v_huvaa_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO v_controller_id FROM profiles WHERE email = 'ahoo11official@gmail.com';
    SELECT id INTO v_viewer_id FROM profiles WHERE email = 'ahusamahmed90@gmail.com';
    
    -- Get Huvaa source ID
    SELECT id INTO v_huvaa_id FROM sources WHERE name = 'Huvaa';
    
    -- Clear existing roles and permissions
    DELETE FROM user_roles WHERE user_id IN (v_controller_id, v_viewer_id);
    DELETE FROM source_permissions WHERE user_id IN (v_controller_id, v_viewer_id);
    
    -- Set up controller
    IF v_controller_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) VALUES (v_controller_id, 'controller');
    END IF;
    
    -- Set up viewer with Huvaa access
    IF v_viewer_id IS NOT NULL AND v_huvaa_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) VALUES (v_viewer_id, 'viewer');
        INSERT INTO source_permissions (user_id, source_id) VALUES (v_viewer_id, v_huvaa_id);
    END IF;
END $$;

-- Verify the setup
SELECT 
    p.email,
    ur.role,
    s.name as accessible_source
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN source_permissions sp ON p.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com')
ORDER BY p.email;
