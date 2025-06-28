-- Check for test users in the database
-- Run this with: wrangler d1 execute sonicjs-dev --local --file=scripts/check-test-users.sql

SELECT 
  id,
  email,
  username,
  first_name,
  last_name,
  role,
  created_at
FROM users 
WHERE 
  email LIKE '%test%' 
  OR email LIKE '%temp%' 
  OR email LIKE '%e2e%'
  OR username LIKE '%test%'
  OR username LIKE '%temp%'
  OR username LIKE '%e2e%'
ORDER BY created_at DESC;