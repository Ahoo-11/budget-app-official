-- Create test transactions
WITH user_ids AS (
  SELECT 
    (SELECT id FROM profiles WHERE email = 'ahoo11official@gmail.com') as admin_id,
    (SELECT id FROM profiles WHERE email = 'ahusamahmed90@gmail.com') as user_id,
    (SELECT id FROM sources WHERE name = 'Huvaa') as huvaa_source_id
)
INSERT INTO transactions (amount, description, source_id, user_id, created_at)
SELECT * FROM (
  -- Admin's transactions
  SELECT 
    100.00,
    'Admin test transaction 1',
    huvaa_source_id,
    admin_id,
    NOW()
  FROM user_ids
  UNION ALL
  SELECT 
    200.00,
    'Admin test transaction 2',
    huvaa_source_id,
    admin_id,
    NOW()
  FROM user_ids
  UNION ALL
  -- Regular user's transactions
  SELECT 
    50.00,
    'User test transaction 1',
    huvaa_source_id,
    user_id,
    NOW()
  FROM user_ids
  UNION ALL
  SELECT 
    75.00,
    'User test transaction 2',
    huvaa_source_id,
    user_id,
    NOW()
  FROM user_ids
) as test_data;

-- Verify the test data
SELECT 
    t.amount,
    t.description,
    s.name as source_name,
    p.email as created_by,
    t.created_at
FROM transactions t
JOIN sources s ON t.source_id = s.id
JOIN profiles p ON t.user_id = p.id
ORDER BY t.created_at DESC;
