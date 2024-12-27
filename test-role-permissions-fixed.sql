-- Create a function to test permissions
CREATE OR REPLACE FUNCTION test_user_permissions(user_email TEXT)
RETURNS TABLE (
    test_case TEXT,
    result JSONB
) AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM profiles WHERE email = user_email;
    
    -- Test transactions access
    RETURN QUERY
    SELECT 
        'Can view transactions'::TEXT,
        jsonb_build_object(
            'count', (SELECT COUNT(*)::TEXT FROM transactions),
            'role', (SELECT role::TEXT FROM user_roles WHERE user_id = user_id)
        );
    
    -- Test sources access
    RETURN QUERY
    SELECT 
        'Can view sources'::TEXT,
        jsonb_build_object(
            'count', (SELECT COUNT(*)::TEXT FROM sources),
            'permitted_sources', (
                SELECT jsonb_agg(s.name)
                FROM sources s
                JOIN source_permissions sp ON sp.source_id = s.id
                WHERE sp.user_id = user_id
            )
        );
    
    -- Test permissions management
    RETURN QUERY
    SELECT 
        'Permission management'::TEXT,
        jsonb_build_object(
            'role', (SELECT role::TEXT FROM user_roles WHERE user_id = user_id),
            'can_manage_permissions', (
                SELECT role IN ('controller', 'super_admin', 'admin')
                FROM user_roles
                WHERE user_id = user_id
            )::TEXT
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test Controller permissions
SELECT * FROM test_user_permissions('ahoo11official@gmail.com');

-- Test Admin permissions
SELECT * FROM test_user_permissions('ahusamahmed90@gmail.com');

-- Additional verification queries
SELECT 
    p.email,
    ur.role,
    COUNT(DISTINCT t.id) as visible_transactions,
    COUNT(DISTINCT sp.source_id) as accessible_sources
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN transactions t ON true  -- Will be filtered by RLS
LEFT JOIN source_permissions sp ON p.id = sp.user_id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com')
GROUP BY p.email, ur.role;

-- Check source permissions
SELECT 
    p.email,
    ur.role,
    s.name as source_name,
    sp.source_id IS NOT NULL as has_access
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
CROSS JOIN sources s
LEFT JOIN source_permissions sp ON sp.user_id = p.id AND sp.source_id = s.id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com')
ORDER BY p.email, s.name;
