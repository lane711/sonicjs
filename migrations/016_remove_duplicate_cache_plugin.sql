-- Migration: Remove duplicate cache plugin entry
-- Description: Removes the old 'cache' plugin (id: 'cache') that is a duplicate of 'core-cache'
-- This fixes the issue where Cache System appears twice in the plugins list
-- Created: 2025-10-14

-- Remove the old 'cache' plugin entry if it exists
-- The correct plugin is 'core-cache' which is managed by plugin-bootstrap.ts
DELETE FROM plugins WHERE id = 'cache' AND name = 'cache';

-- Clean up any related entries in plugin activity log
DELETE FROM plugin_activity_log WHERE plugin_id = 'cache';

-- Clean up any related entries in plugin hooks
DELETE FROM plugin_hooks WHERE plugin_id = 'cache';

-- Clean up any related entries in plugin routes
DELETE FROM plugin_routes WHERE plugin_id = 'cache';
