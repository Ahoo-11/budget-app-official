-- 1. Check super admin permissions
SELECT 
  p.email,
  ur.role,
  COUNT(DISTINCT t.id) as visible_transactions,
  COUNT(DISTINCT sp.source_id) as accessible_sources
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN transactions t ON true  -- Super admin should see all
LEFT JOIN source_permissions sp ON u.id = sp.user_id
WHERE p.email = 'ahoo11official@gmail.com'
GROUP BY p.email, ur.role;

-- 2. Check regular user permissions
SELECT 
  p.email,
  ur.role,
  COUNT(DISTINCT t.id) as visible_transactions,
  array_agg(DISTINCT s.name) as accessible_sources
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN source_permissions sp ON u.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
LEFT JOIN transactions t ON t.source_id = sp.source_id
WHERE p.email = 'ahusamahmed90@gmail.com'
GROUP BY p.email, ur.role;

-- 3. Verify source permissions
SELECT 
  p.email,
  s.name as source_name,
  COUNT(t.id) as transaction_count
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN source_permissions sp ON u.id = sp.user_id
LEFT JOIN sources s ON sp.source_id = s.id
LEFT JOIN transactions t ON t.source_id = s.id
WHERE p.email IN ('ahoo11official@gmail.com', 'ahusamahmed90@gmail.com')
GROUP BY p.email, s.name
ORDER BY p.email, s.name;
