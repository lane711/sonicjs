-- Migration: 029_add_forms_system.sql
-- Description: Add Form.io integration for advanced form building
-- Date: January 23, 2026
-- Phase: 1 - Database Schema

-- =====================================================
-- Table: forms
-- Description: Stores form definitions and configuration
-- =====================================================

CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,              -- Machine name (e.g., "contact-form")
  display_name TEXT NOT NULL,             -- Human name (e.g., "Contact Form")
  description TEXT,                       -- Optional description
  category TEXT DEFAULT 'general',        -- Form category (contact, survey, registration, etc.)
  
  -- Form.io schema (JSON)
  formio_schema TEXT NOT NULL,            -- Complete Form.io JSON schema
  
  -- Settings
  settings TEXT,                          -- JSON: {
                                          --   emailNotifications: true,
                                          --   notifyEmail: "admin@example.com",
                                          --   successMessage: "Thank you!",
                                          --   redirectUrl: "/thank-you",
                                          --   allowAnonymous: true,
                                          --   requireAuth: false,
                                          --   maxSubmissions: null,
                                          --   submitButtonText: "Submit",
                                          --   saveProgress: true,
                                          --   webhookUrl: null
                                          -- }
  
  -- Status & Management
  is_active INTEGER DEFAULT 1,            -- Active/inactive flag
  is_public INTEGER DEFAULT 1,            -- Public (anyone) vs private (auth required)
  managed INTEGER DEFAULT 0,              -- Code-managed (like collections)
  
  -- Metadata
  icon TEXT,                              -- Optional icon for admin UI
  color TEXT,                             -- Optional color (hex) for admin UI
  tags TEXT,                              -- JSON array of tags
  
  -- Stats
  submission_count INTEGER DEFAULT 0,     -- Total submissions received
  view_count INTEGER DEFAULT 0,           -- Form views (optional tracking)
  
  -- Ownership
  created_by TEXT REFERENCES users(id),   -- User who created the form
  updated_by TEXT REFERENCES users(id),   -- User who last updated
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for forms
CREATE INDEX IF NOT EXISTS idx_forms_name ON forms(name);
CREATE INDEX IF NOT EXISTS idx_forms_category ON forms(category);
CREATE INDEX IF NOT EXISTS idx_forms_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_public ON forms(is_public);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);

-- =====================================================
-- Table: form_submissions
-- Description: Stores submitted form data
-- =====================================================

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Submission data
  submission_data TEXT NOT NULL,          -- JSON: The actual form data submitted
  
  -- Submission metadata
  status TEXT DEFAULT 'pending',          -- pending, reviewed, approved, rejected, spam
  submission_number INTEGER,              -- Sequential number per form
  
  -- User information (if authenticated)
  user_id TEXT REFERENCES users(id),      -- Submitter user ID (if logged in)
  user_email TEXT,                        -- Email from form (or user account)
  
  -- Tracking information
  ip_address TEXT,                        -- IP address of submitter
  user_agent TEXT,                        -- Browser user agent
  referrer TEXT,                          -- Page that referred to form
  utm_source TEXT,                        -- UTM tracking params
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Review/Processing
  reviewed_by TEXT REFERENCES users(id),  -- Admin who reviewed
  reviewed_at INTEGER,                    -- Review timestamp
  review_notes TEXT,                      -- Admin notes
  
  -- Flags
  is_spam INTEGER DEFAULT 0,              -- Spam flag
  is_archived INTEGER DEFAULT 0,          -- Archived flag
  
  -- Timestamps
  submitted_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(user_email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_spam ON form_submissions(is_spam);

-- Trigger to auto-increment submission_number per form
CREATE TRIGGER IF NOT EXISTS set_submission_number
AFTER INSERT ON form_submissions
BEGIN
  UPDATE form_submissions 
  SET submission_number = (
    SELECT COUNT(*) 
    FROM form_submissions 
    WHERE form_id = NEW.form_id 
    AND id <= NEW.id
  )
  WHERE id = NEW.id;
END;

-- Trigger to update form submission_count
CREATE TRIGGER IF NOT EXISTS increment_form_submission_count
AFTER INSERT ON form_submissions
BEGIN
  UPDATE forms 
  SET submission_count = submission_count + 1,
      updated_at = unixepoch() * 1000
  WHERE id = NEW.form_id;
END;

-- =====================================================
-- Table: form_files (Optional)
-- Description: Link form submissions to uploaded files
-- =====================================================

CREATE TABLE IF NOT EXISTS form_files (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,               -- Form field that uploaded this file
  uploaded_at INTEGER NOT NULL
);

-- Indexes for form files
CREATE INDEX IF NOT EXISTS idx_form_files_submission ON form_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_form_files_media ON form_files(media_id);

-- =====================================================
-- Sample Data: Create a default contact form
-- =====================================================

INSERT OR IGNORE INTO forms (
  id,
  name,
  display_name,
  description,
  category,
  formio_schema,
  settings,
  is_active,
  is_public,
  created_at,
  updated_at
) VALUES (
  'default-contact-form',
  'contact',
  'Contact Form',
  'A simple contact form for getting in touch',
  'contact',
  '{"components":[]}',
  '{"emailNotifications":false,"successMessage":"Thank you for your submission!","submitButtonText":"Submit","requireAuth":false}',
  1,
  1,
  unixepoch() * 1000,
  unixepoch() * 1000
);
