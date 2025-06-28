-- Delete test users created during e2e testing
-- Run this with: wrangler d1 execute sonicjs-dev --local --file=scripts/delete-test-users.sql

-- First, let's see what we're about to delete
SELECT 'Users to be deleted:' as action;
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
  OR email LIKE '%xss%'
  OR email LIKE '%security%'
  OR email LIKE '%duplicate%'
  OR email LIKE '%cookie%'
  OR email LIKE '%role%'
ORDER BY created_at DESC;

-- Count how many users will be deleted
SELECT COUNT(*) as users_to_delete
FROM users 
WHERE 
  email LIKE '%test%' 
  OR email LIKE '%temp%' 
  OR email LIKE '%e2e%'
  OR username LIKE '%test%'
  OR username LIKE '%temp%'
  OR username LIKE '%e2e%'
  OR email LIKE '%xss%'
  OR email LIKE '%security%'
  OR email LIKE '%duplicate%'
  OR email LIKE '%cookie%'
  OR email LIKE '%role%';

-- First, delete dependent records to avoid foreign key constraints

-- Delete API tokens for test users
DELETE FROM api_tokens 
WHERE user_id IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete workflow history for test users
DELETE FROM workflow_history 
WHERE user_id IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete content versions authored by test users
DELETE FROM content_versions 
WHERE author_id IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete content authored by test users
DELETE FROM content 
WHERE author_id IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete media uploaded by test users
DELETE FROM media 
WHERE uploaded_by IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete email templates created by test users
DELETE FROM email_templates 
WHERE created_by IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Delete email themes created by test users
DELETE FROM email_themes 
WHERE created_by IN (
  SELECT id FROM users WHERE (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com'
  AND username != 'admin'
);

-- Finally, delete the test users (preserve the admin user)
DELETE FROM users 
WHERE 
  (
    email LIKE '%test%' 
    OR email LIKE '%temp%' 
    OR email LIKE '%e2e%'
    OR username LIKE '%test%'
    OR username LIKE '%temp%'
    OR username LIKE '%e2e%'
    OR email LIKE '%xss%'
    OR email LIKE '%security%'
    OR email LIKE '%duplicate%'
    OR email LIKE '%cookie%'
    OR email LIKE '%role%'
  )
  AND email != 'admin@sonicjs.com' -- Preserve the admin user
  AND username != 'admin';

-- Show remaining users
SELECT 'Remaining users after cleanup:' as action;
SELECT 
  id,
  email,
  username,
  role,
  created_at
FROM users 
ORDER BY created_at DESC;