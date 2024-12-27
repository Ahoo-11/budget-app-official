-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename = 'transactions' OR tablename = 'source_permissions');

-- Check policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (tablename = 'transactions' OR tablename = 'source_permissions');

-- Check user roles
SELECT p.email, ur.role, array_agg(s.name) as accessible_sources
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN source_permissions sp ON u.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
GROUP BY p.email, ur.role
ORDER BY ur.role, p.email;
