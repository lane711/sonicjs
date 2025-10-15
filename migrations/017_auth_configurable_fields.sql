-- Migration: Make authentication fields configurable
-- This migration updates the core-auth plugin to support configurable required fields

-- The settings will be stored in the plugins table as JSON
-- Default settings for core-auth plugin include:
-- {
--   "requiredFields": {
--     "email": { "required": true, "minLength": 5 },
--     "password": { "required": true, "minLength": 8 },
--     "username": { "required": true, "minLength": 3 },
--     "firstName": { "required": true, "minLength": 1 },
--     "lastName": { "required": true, "minLength": 1 }
--   },
--   "validation": {
--     "emailFormat": true,
--     "allowDuplicateUsernames": false
--   }
-- }

-- Update core-auth plugin settings with configurable field requirements
UPDATE plugins
SET settings = json_object(
  'requiredFields', json_object(
    'email', json_object('required', 1, 'minLength', 5, 'label', 'Email', 'type', 'email'),
    'password', json_object('required', 1, 'minLength', 8, 'label', 'Password', 'type', 'password'),
    'username', json_object('required', 1, 'minLength', 3, 'label', 'Username', 'type', 'text'),
    'firstName', json_object('required', 1, 'minLength', 1, 'label', 'First Name', 'type', 'text'),
    'lastName', json_object('required', 1, 'minLength', 1, 'label', 'Last Name', 'type', 'text')
  ),
  'validation', json_object(
    'emailFormat', 1,
    'allowDuplicateUsernames', 0,
    'passwordRequirements', json_object(
      'requireUppercase', 0,
      'requireLowercase', 0,
      'requireNumbers', 0,
      'requireSpecialChars', 0
    )
  ),
  'registration', json_object(
    'enabled', 1,
    'requireEmailVerification', 0,
    'defaultRole', 'viewer'
  )
)
WHERE id = 'core-auth';

-- If core-auth plugin doesn't exist, this migration will be handled by bootstrap
-- No need to insert here as plugin bootstrap handles initial plugin creation
