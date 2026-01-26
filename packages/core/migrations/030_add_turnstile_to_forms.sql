-- Add Turnstile configuration to forms table
-- This allows per-form Turnstile settings with global fallback

-- Add columns (D1 may not support CHECK constraints in ALTER TABLE)
ALTER TABLE forms ADD COLUMN turnstile_enabled INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN turnstile_settings TEXT;

-- Set default to inherit global settings for existing forms
UPDATE forms 
SET turnstile_settings = '{"inherit":true}' 
WHERE turnstile_settings IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forms_turnstile ON forms(turnstile_enabled);
