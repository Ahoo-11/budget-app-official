-- 1. Check user roles
SELECT p.email, ur.role
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com');

-- 2. Check sources
SELECT s.*, p.email as created_by
FROM sources s
JOIN profiles p ON s.user_id = p.id;

-- 3. Check source permissions
SELECT p.email, s.name as source_name, sp.*
FROM source_permissions sp
JOIN profiles p ON sp.user_id = p.id
JOIN sources s ON sp.source_id = s.id;

-- 4. Check transactions
SELECT 
    t.id,
    t.amount,
    t.description,
    s.name as source_name,
    p.email as created_by,
    t.created_at
FROM transactions t
JOIN sources s ON t.source_id = s.id
JOIN profiles p ON t.user_id = p.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 5. Verify super admin access
SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = (SELECT id FROM profiles WHERE email = 'ahoo11official@gmail.com')
    AND role = 'super_admin'
) as is_super_admin;
