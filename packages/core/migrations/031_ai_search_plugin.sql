-- AI Search plugin settings
CREATE TABLE IF NOT EXISTS ai_search_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enabled BOOLEAN DEFAULT 0,
  ai_mode_enabled BOOLEAN DEFAULT 1,
  selected_collections TEXT, -- JSON array of collection IDs to index
  dismissed_collections TEXT, -- JSON array of collection IDs user chose not to index
  autocomplete_enabled BOOLEAN DEFAULT 1,
  cache_duration INTEGER DEFAULT 1, -- hours
  results_limit INTEGER DEFAULT 20,
  index_media BOOLEAN DEFAULT 0,
  index_status TEXT, -- JSON object with status per collection
  last_indexed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Search history/analytics
CREATE TABLE IF NOT EXISTS ai_search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  mode TEXT, -- 'ai' or 'keyword'
  results_count INTEGER,
  user_id INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Index metadata tracking (per collection)
CREATE TABLE IF NOT EXISTS ai_search_index_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  collection_name TEXT NOT NULL, -- Cache collection name for display
  total_items INTEGER DEFAULT 0,
  indexed_items INTEGER DEFAULT 0,
  last_sync_at INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'indexing', 'completed', 'error'
  error_message TEXT,
  UNIQUE(collection_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_search_history_created_at ON ai_search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_search_history_mode ON ai_search_history(mode);
CREATE INDEX IF NOT EXISTS idx_ai_search_index_meta_collection_id ON ai_search_index_meta(collection_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_index_meta_status ON ai_search_index_meta(status);
