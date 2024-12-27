-- Check current roles
SELECT p.email, ur.role
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'ahoo11official@gmail.com';

-- Update ahoo11official@gmail.com to controller if needed
UPDATE user_roles
SET role = 'controller'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'ahoo11official@gmail.com')
  AND role != 'controller';

-- Verify the update
SELECT p.email, ur.role
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'ahoo11official@gmail.com';
