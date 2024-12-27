-- 1. Test Controller Access (ahoo11official@gmail.com)
SET request.jwt.claims.sub = (SELECT id::text FROM profiles WHERE email = 'ahoo11official@gmail.com');

-- Controller should be able to:
SELECT 'Controller can view all transactions' as test_case,
    COUNT(*) as transaction_count
FROM transactions;

SELECT 'Controller can view all sources' as test_case,
    COUNT(*) as source_count
FROM sources;

SELECT 'Controller can view all permissions' as test_case,
    COUNT(*) as permission_count
FROM source_permissions;

-- 2. Test Admin Access (ahusamahmed90@gmail.com)
SET request.jwt.claims.sub = (SELECT id::text FROM profiles WHERE email = 'ahusamahmed90@gmail.com');

-- Admin should be able to:
SELECT 'Admin can view all transactions' as test_case,
    COUNT(*) as transaction_count
FROM transactions;

-- Admin should only modify transactions in permitted sources
SELECT 'Admin permitted sources' as test_case,
    s.name as source_name,
    EXISTS (
        SELECT 1 FROM source_permissions sp
        WHERE sp.user_id = auth.uid()
        AND sp.source_id = s.id
    ) as has_permission
FROM sources s;

-- Verify policy enforcement
SELECT 'Policy Check' as test_case,
    t.id,
    t.amount,
    t.description,
    s.name as source_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM source_permissions sp
            WHERE sp.user_id = auth.uid()
            AND sp.source_id = t.source_id
        ) THEN 'Yes'
        ELSE 'No'
    END as can_modify
FROM transactions t
JOIN sources s ON t.source_id = s.id
LIMIT 5;

-- Test permission management
SELECT 'Admin permission management' as test_case,
    p.email as user_email,
    ur.role,
    CASE 
        WHEN ur.role = 'viewer' THEN 'Can manage'
        ELSE 'Cannot manage'
    END as permission_access
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role IN ('viewer', 'admin', 'super_admin');
