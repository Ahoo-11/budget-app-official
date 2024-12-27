-- Test super admin access
SET request.jwt.claims.sub = (SELECT id::text FROM profiles WHERE email = 'ahoo11official@gmail.com');
SELECT 
    'Super Admin View'::text as test_case,
    COUNT(*) as visible_transactions
FROM transactions;

-- Test regular user access
SET request.jwt.claims.sub = (SELECT id::text FROM profiles WHERE email = 'ahusamahmed90@gmail.com');
SELECT 
    'Regular User View'::text as test_case,
    COUNT(*) as visible_transactions
FROM transactions;

-- Check transaction details for both users
SELECT 
    CASE 
        WHEN p.email = 'ahoo11official@gmail.com' THEN 'Super Admin'
        ELSE 'Regular User'
    END as user_type,
    p.email,
    COUNT(t.id) as transaction_count,
    SUM(t.amount) as total_amount
FROM profiles p
LEFT JOIN transactions t ON t.user_id = p.id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com')
GROUP BY p.email;
