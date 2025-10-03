-- Migration: Add Cache Plugin
-- Description: Register the cache plugin for three-tiered caching (Memory → KV → Database)
-- Created: 2025-10-03

-- Insert cache plugin into plugins table
INSERT INTO plugins (
  id,
  name,
  display_name,
  description,
  version,
  author,
  category,
  icon,
  status,
  is_core,
  settings,
  permissions,
  dependencies,
  download_count,
  rating,
  installed_at,
  activated_at,
  last_updated
) VALUES (
  'cache-plugin',
  'cache',
  'Cache System',
  'Three-tiered caching system (Memory → KV → Database) for improved performance. Provides automatic caching for content, users, media, and API responses with TTL-based expiration and pattern-based invalidation.',
  '1.0.0',
  'SonicJS',
  'Performance',
  '⚡',
  'active',
  TRUE,
  json('{
    "memoryEnabled": true,
    "kvEnabled": false,
    "defaultTTL": 3600,
    "maxMemorySize": 50
  }'),
  json('[
    "cache.view",
    "cache.manage",
    "cache.clear"
  ]'),
  json('[]'),
  0,
  5.0,
  unixepoch(),
  unixepoch(),
  unixepoch()
);
