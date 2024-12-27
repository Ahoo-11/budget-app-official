-- Diagnostic queries to check current state

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('sources', 'transactions', 'source_permissions');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sources', 'transactions', 'source_permissions');

-- Check user roles
SELECT 
    p.email,
    ur.role,
    p.id as user_id
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com');

-- Check source permissions
SELECT 
    p.email,
    s.name as source_name,
    sp.source_id,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN source_permissions sp ON p.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com');

-- Check if Huvaa source exists
SELECT id, name FROM sources WHERE name = 'Huvaa';

-- Check all policies for a specific user
SELECT has_full_access(id) as has_full_access
FROM profiles
WHERE email = 'ahusamahmed90@gmail.com';

-- Check if RLS is actually filtering
CREATE OR REPLACE FUNCTION test_user_access(test_email text)
RETURNS TABLE (
    test_name text,
    result jsonb
) AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = test_email;

    -- Test source access
    RETURN QUERY
    SELECT 
        'Source Access'::text,
        jsonb_build_object(
            'accessible_sources', (
                SELECT jsonb_agg(name)
                FROM sources
                WHERE has_full_access(v_user_id)
                OR id IN (
                    SELECT source_id 
                    FROM source_permissions 
                    WHERE user_id = v_user_id
                )
            ),
            'all_sources', (
                SELECT jsonb_agg(name)
                FROM sources
            ),
            'role', (
                SELECT role::text
                FROM user_roles
                WHERE user_id = v_user_id
            )
        );

    -- Test transaction access
    RETURN QUERY
    SELECT 
        'Transaction Access'::text,
        jsonb_build_object(
            'transaction_count', (
                SELECT COUNT(*)::text
                FROM transactions
                WHERE has_full_access(v_user_id)
                OR source_id IN (
                    SELECT source_id 
                    FROM source_permissions 
                    WHERE user_id = v_user_id
                )
            ),
            'total_transactions', (
                SELECT COUNT(*)::text
                FROM transactions
            )
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test access for both users
SELECT * FROM test_user_access('ahoo11official@gmail.com');
SELECT * FROM test_user_access('ahusamahmed90@gmail.com');
