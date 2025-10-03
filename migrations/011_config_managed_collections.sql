-- Migration: Add Config-Managed Collections Support
-- Description: Add 'managed' column to collections table to support config-based collection definitions
-- Created: 2025-10-03

-- Add 'managed' column to collections table
-- This column indicates whether a collection is managed by configuration files (true) or user-created (false)
-- Managed collections cannot be edited through the admin UI
ALTER TABLE collections ADD COLUMN managed INTEGER DEFAULT 0 NOT NULL;

-- Create an index on the managed column for faster queries
CREATE INDEX IF NOT EXISTS idx_collections_managed ON collections(managed);

-- Create an index on managed + is_active for efficient filtering
CREATE INDEX IF NOT EXISTS idx_collections_managed_active ON collections(managed, is_active);
