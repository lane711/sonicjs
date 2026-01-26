-- Contact Form Plugin Migration
-- Version: 1.0.0
-- Description: Initialize contact form plugin with default settings

-- Insert plugin entry into plugins table
INSERT INTO plugins (
  id,
  name,
  display_name,
  description,
  version,
  author,
  category,
  status,
  settings,
  installed_at,
  last_updated
) VALUES (
  'contact-form',
  'contact-form',
  'Contact Form',
  'Professional contact form with Google Maps integration, message storage, and configurable company information',
  '1.0.0',
  'SonicJS Community',
  'communication',
  'inactive',
  json('{
    "companyName": "My Company",
    "phoneNumber": "555-0199",
    "description": "",
    "address": "123 Web Dev Lane",
    "city": "",
    "state": "",
    "showMap": false,
    "mapApiKey": ""
  }'),
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
)
ON CONFLICT(id) DO UPDATE SET
  display_name = excluded.display_name,
  description = excluded.description,
  version = excluded.version,
  updated_at = excluded.last_updated;

-- Create index on content table for contact messages collection
CREATE INDEX IF NOT EXISTS idx_content_contact_messages 
ON content(collection_id) 
WHERE collection_id = 'contact_messages';

-- Note: The content table is created by SonicJS core migrations
-- This plugin uses the existing content table to store contact messages
-- with collection_id = 'contact_messages'

