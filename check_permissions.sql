-- Check user permissions
WITH user_info AS (
  SELECT id
  FROM profiles
  WHERE email = 'ahusamahmed90@gmail.com'
)
SELECT 
  p.email,
  ur.role,
  s.name as source_name,
  sp.source_id,
  sp.user_id,
  p.id as profile_id
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN source_permissions sp ON p.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
WHERE p.email = 'ahusamahmed90@gmail.com';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('sources', 'transactions', 'source_permissions');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sources', 'transactions', 'source_permissions');

-- Check Huvaa source
SELECT * FROM sources WHERE name = 'Huvaa';
