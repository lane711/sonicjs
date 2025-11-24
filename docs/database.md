# Database Documentation

Comprehensive guide to SonicJS AI's database architecture, schema, migrations, and operations using Cloudflare D1 and Drizzle ORM.

## Table of Contents

- [Overview](#overview)
- [D1 Database Setup](#d1-database-setup)
- [Complete Database Schema](#complete-database-schema)
- [Drizzle ORM Integration](#drizzle-orm-integration)
- [Migration System](#migration-system)
- [Collection Sync System](#collection-sync-system)
- [Query Patterns and Examples](#query-patterns-and-examples)
- [Prepared Statements](#prepared-statements)
- [Database Performance](#database-performance)
- [Backup and Restore](#backup-and-restore)
- [Wrangler D1 Commands](#wrangler-d1-commands)
- [Entity Relationship Diagram](#entity-relationship-diagram)

---

## Overview

SonicJS AI uses **Cloudflare D1**, a serverless SQLite database that runs at the edge, providing:

- **Global Distribution**: Database replicated across Cloudflare's network
- **Edge Compute**: Low-latency queries from any location
- **SQLite Compatible**: Standard SQL syntax with SQLite extensions
- **Zero Configuration**: No connection pools or server management
- **ACID Compliance**: Full transactional support
- **Cost Effective**: Pay-per-request pricing with generous free tier

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | Cloudflare D1 | Serverless SQLite at the edge |
| ORM | Drizzle ORM | Type-safe database operations |
| Migrations | SQL Files | Version-controlled schema changes |
| Query Builder | Drizzle Kit | SQL generation and introspection |
| Validation | Zod + Drizzle Zod | Runtime type validation |

---

## D1 Database Setup

### 1. Create D1 Database

```bash
# Development database
wrangler d1 create sonicjs-dev

# Production database
wrangler d1 create sonicjs-ai
```

### 2. Configure wrangler.toml

```toml
name = "sonicjs-ai"
main = "src/index.ts"
compatibility_date = "2024-06-01"
compatibility_flags = ["nodejs_compat"]

# Development database binding
[[d1_databases]]
binding = "DB"
database_name = "sonicjs-dev"
database_id = "your-dev-database-id"

# R2 Bucket for media storage
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "sonicjs-media-dev"

# KV Namespace for caching
[[kv_namespaces]]
binding = "CACHE_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

# Production environment
[env.production]
name = "sonicjs-ai-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "sonicjs-ai"
database_id = "your-prod-database-id"

[[env.production.r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "sonicjs-media-prod"

[[env.production.kv_namespaces]]
binding = "CACHE_KV"
id = "your-prod-kv-id"
```

### 3. Environment Access

```typescript
// In Cloudflare Worker
export default {
  async fetch(request: Request, env: Env) {
    const db = env.DB // D1 Database
    const bucket = env.MEDIA_BUCKET // R2 Bucket
    const cache = env.CACHE_KV // KV Namespace

    // Your application logic
  }
}
```

---

## Complete Database Schema

### Core Tables

#### users
User authentication and profiles with role-based access control.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  avatar TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  -- Extended profile fields (from migration 004)
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  email_notifications INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'dark',
  two_factor_enabled INTEGER DEFAULT 0,
  two_factor_secret TEXT,
  password_reset_token TEXT,
  password_reset_expires INTEGER,
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT,
  invitation_token TEXT,
  invited_by TEXT REFERENCES users(id),
  invited_at INTEGER,
  accepted_invitation_at INTEGER
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX idx_users_invitation_token ON users(invitation_token);
```

#### collections
Content collection definitions with JSON schemas.

```sql
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  schema TEXT NOT NULL, -- JSON schema definition
  is_active INTEGER NOT NULL DEFAULT 1,
  managed INTEGER DEFAULT 0 NOT NULL, -- Config-managed collections
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_collections_name ON collections(name);
CREATE INDEX idx_collections_active ON collections(is_active);
CREATE INDEX idx_collections_managed ON collections(managed);
CREATE INDEX idx_collections_managed_active ON collections(managed, is_active);
```

#### content
Actual content items with versioning and workflow support.

```sql
CREATE TABLE content (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON content data
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  -- Scheduling fields (from migration 003)
  scheduled_publish_at INTEGER,
  scheduled_unpublish_at INTEGER,

  -- Review workflow (from migration 003)
  review_status TEXT DEFAULT 'none',
  reviewer_id TEXT REFERENCES users(id),
  reviewed_at INTEGER,
  review_notes TEXT,

  -- SEO and metadata (from migration 003)
  meta_title TEXT,
  meta_description TEXT,
  featured_image_id TEXT REFERENCES media(id),
  content_type TEXT DEFAULT 'standard',

  -- Workflow state (from migration 005)
  workflow_state_id TEXT DEFAULT 'draft',
  embargo_until INTEGER,
  expires_at INTEGER,
  version_number INTEGER DEFAULT 1,
  is_auto_saved INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_content_collection ON content(collection_id);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published ON content(published_at);
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_scheduled_publish ON content(scheduled_publish_at);
CREATE INDEX idx_content_scheduled_unpublish ON content(scheduled_unpublish_at);
CREATE INDEX idx_content_review_status ON content(review_status);
CREATE INDEX idx_content_reviewer ON content(reviewer_id);
CREATE INDEX idx_content_content_type ON content(content_type);
CREATE INDEX idx_content_workflow_state ON content(workflow_state_id);
```

#### content_versions
Version history for content rollback capability.

```sql
CREATE TABLE content_versions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id),
  version INTEGER NOT NULL,
  data TEXT NOT NULL, -- JSON data
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  UNIQUE(content_id, version)
);

-- Indexes
CREATE INDEX idx_content_versions_content ON content_versions(content_id);
CREATE INDEX idx_content_versions_version ON content_versions(version);
```

#### media
Media files with R2 storage integration.

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  folder TEXT NOT NULL DEFAULT 'uploads',
  r2_key TEXT NOT NULL, -- R2 storage key
  public_url TEXT NOT NULL, -- CDN URL
  thumbnail_url TEXT, -- Cloudflare Images URL
  alt TEXT,
  caption TEXT,
  tags TEXT, -- JSON array of tags
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  uploaded_at INTEGER NOT NULL,
  updated_at INTEGER,
  published_at INTEGER,
  scheduled_at INTEGER,
  archived_at INTEGER,
  deleted_at INTEGER
);

-- Indexes
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_type ON media(mime_type);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_uploaded_at ON media(uploaded_at);
CREATE INDEX idx_media_deleted ON media(deleted_at);
```

### Workflow & Automation Tables

#### workflow_states
Defines available workflow states.

```sql
CREATE TABLE workflow_states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_initial INTEGER DEFAULT 0,
  is_final INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default states
INSERT INTO workflow_states (id, name, description, color, is_initial, is_final) VALUES
('draft', 'Draft', 'Content is being worked on', '#F59E0B', 1, 0),
('pending-review', 'Pending Review', 'Content is waiting for review', '#3B82F6', 0, 0),
('approved', 'Approved', 'Content has been approved', '#10B981', 0, 0),
('published', 'Published', 'Content is live', '#059669', 0, 1),
('rejected', 'Rejected', 'Content was rejected', '#EF4444', 0, 1),
('archived', 'Archived', 'Content has been archived', '#6B7280', 0, 1);
```

#### workflows
Workflow definitions for collections.

```sql
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  is_active INTEGER DEFAULT 1,
  auto_publish INTEGER DEFAULT 0,
  require_approval INTEGER DEFAULT 1,
  approval_levels INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### workflow_transitions
Allowed state transitions.

```sql
CREATE TABLE workflow_transitions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_state_id TEXT NOT NULL REFERENCES workflow_states(id),
  to_state_id TEXT NOT NULL REFERENCES workflow_states(id),
  required_permission TEXT,
  auto_transition INTEGER DEFAULT 0,
  transition_conditions TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### workflow_history
Complete audit trail of content state changes.

```sql
CREATE TABLE workflow_history (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  from_state_id TEXT REFERENCES workflow_states(id),
  to_state_id TEXT NOT NULL REFERENCES workflow_states(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  comment TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_workflow_history_content ON workflow_history(content_id);
CREATE INDEX idx_workflow_history_user ON workflow_history(user_id);
```

#### scheduled_content
Content scheduling for publish/unpublish automation.

```sql
CREATE TABLE scheduled_content (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'publish', 'unpublish', 'archive'
  scheduled_at DATETIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  executed_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scheduled_content_scheduled_at ON scheduled_content(scheduled_at);
CREATE INDEX idx_scheduled_content_status ON scheduled_content(status);
```

### Plugin System Tables

#### plugins
Registered plugins with metadata.

```sql
CREATE TABLE plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  is_core BOOLEAN DEFAULT FALSE,
  settings JSON,
  permissions JSON,
  dependencies JSON,
  download_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  installed_at INTEGER NOT NULL,
  activated_at INTEGER,
  last_updated INTEGER NOT NULL,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX idx_plugins_status ON plugins(status);
CREATE INDEX idx_plugins_category ON plugins(category);
```

#### plugin_hooks
Plugin-registered event hooks.

```sql
CREATE TABLE plugin_hooks (
  id TEXT PRIMARY KEY,
  plugin_id TEXT NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  hook_name TEXT NOT NULL,
  handler_name TEXT NOT NULL,
  priority INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(plugin_id, hook_name, handler_name)
);

-- Index
CREATE INDEX idx_plugin_hooks_plugin ON plugin_hooks(plugin_id);
```

#### plugin_routes
Custom routes added by plugins.

```sql
CREATE TABLE plugin_routes (
  id TEXT PRIMARY KEY,
  plugin_id TEXT NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  handler_name TEXT NOT NULL,
  middleware JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(plugin_id, path, method)
);

-- Index
CREATE INDEX idx_plugin_routes_plugin ON plugin_routes(plugin_id);
```

### Permission & Access Control Tables

#### permissions
Granular permission definitions.

```sql
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- content, users, collections, media, settings
  created_at INTEGER NOT NULL
);

-- Sample permissions
INSERT INTO permissions (id, name, description, category, created_at) VALUES
('perm_content_create', 'content.create', 'Create new content', 'content', unixepoch()),
('perm_content_read', 'content.read', 'View content', 'content', unixepoch()),
('perm_content_update', 'content.update', 'Edit existing content', 'content', unixepoch()),
('perm_content_delete', 'content.delete', 'Delete content', 'content', unixepoch()),
('perm_content_publish', 'content.publish', 'Publish/unpublish content', 'content', unixepoch());
```

#### role_permissions
Maps permissions to roles.

```sql
CREATE TABLE role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id TEXT NOT NULL REFERENCES permissions(id),
  created_at INTEGER NOT NULL,
  UNIQUE(role, permission_id)
);

-- Admin gets all permissions
INSERT INTO role_permissions (id, role, permission_id, created_at) VALUES
('rp_admin_content_create', 'admin', 'perm_content_create', unixepoch()),
('rp_admin_content_read', 'admin', 'perm_content_read', unixepoch()),
('rp_admin_content_update', 'admin', 'perm_content_update', unixepoch()),
('rp_admin_content_delete', 'admin', 'perm_content_delete', unixepoch()),
('rp_admin_content_publish', 'admin', 'perm_content_publish', unixepoch());
```

#### api_tokens
API access tokens for programmatic access.

```sql
CREATE TABLE api_tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  permissions TEXT NOT NULL, -- JSON array of permissions
  expires_at INTEGER,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_token ON api_tokens(token);
```

### System Logging Tables

#### system_logs
Comprehensive application logging.

```sql
CREATE TABLE system_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  category TEXT NOT NULL CHECK (category IN ('auth', 'api', 'workflow', 'plugin', 'media', 'system', 'security', 'error')),
  message TEXT NOT NULL,
  data TEXT,  -- JSON data
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  method TEXT,
  url TEXT,
  status_code INTEGER,
  duration INTEGER,  -- milliseconds
  stack_trace TEXT,
  tags TEXT,  -- JSON array
  source TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_category ON system_logs(category);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_status_code ON system_logs(status_code);
CREATE INDEX idx_system_logs_source ON system_logs(source);
```

#### log_config
Log retention and configuration settings.

```sql
CREATE TABLE log_config (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  level TEXT NOT NULL DEFAULT 'info',
  retention_days INTEGER NOT NULL DEFAULT 30,
  max_size_mb INTEGER NOT NULL DEFAULT 100,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Default configurations
INSERT INTO log_config (id, category, enabled, level, retention_days, max_size_mb) VALUES
('log-config-auth', 'auth', TRUE, 'info', 90, 50),
('log-config-api', 'api', TRUE, 'info', 30, 100),
('log-config-workflow', 'workflow', TRUE, 'info', 60, 50),
('log-config-plugin', 'plugin', TRUE, 'warn', 30, 25),
('log-config-security', 'security', TRUE, 'warn', 180, 100);
```

---

## Drizzle ORM Integration

### Schema Definition

File: `/src/db/schema.ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table schema
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('viewer'),
  avatar: text('avatar'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: integer('last_login_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Collections table schema
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  schema: text('schema', { mode: 'json' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  managed: integer('managed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content table schema
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  status: text('status').notNull().default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Media table schema
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder').notNull().default('uploads'),
  r2Key: text('r2_key').notNull(),
  publicUrl: text('public_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  alt: text('alt'),
  caption: text('caption'),
  tags: text('tags', { mode: 'json' }),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  uploadedAt: integer('uploaded_at').notNull(),
  updatedAt: integer('updated_at'),
  deletedAt: integer('deleted_at'),
});

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;

// Zod validation schemas
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  firstName: (schema) => schema.min(1),
  lastName: (schema) => schema.min(1),
  username: (schema) => schema.min(3),
});

export const selectUserSchema = createSelectSchema(users);
```

### Database Connection

File: `/src/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Usage in worker
export default {
  async fetch(request: Request, env: Env) {
    const db = createDb(env.DB);

    // Now you can use db with full type safety
    const users = await db.select().from(schema.users);

    return new Response(JSON.stringify(users));
  }
}
```

---

## Migration System

SonicJS uses a **build-time migration bundler** to handle database migrations. This is necessary because Cloudflare Workers don't have filesystem access at runtime, so all migration SQL must be bundled into the application code during the build process.

### How It Works

```
Migration SQL Files (.sql)     →  packages/core/migrations/
         ↓
   Build Script                →  scripts/generate-migrations.ts
         ↓
   TypeScript Bundle           →  src/db/migrations-bundle.ts
         ↓
   Runtime Execution           →  MigrationService
```

The migration bundler:
1. Reads all `.sql` files from `packages/core/migrations/`
2. Generates `src/db/migrations-bundle.ts` with all SQL embedded
3. Provides type-safe access to migrations at runtime via `getMigrationSQLById()`

### Migration Bundler Output

```typescript
// src/db/migrations-bundle.ts (AUTO-GENERATED - DO NOT EDIT)

export interface BundledMigration {
  id: string           // e.g., '001'
  name: string         // e.g., 'Create Users'
  filename: string     // e.g., '001_create_users.sql'
  description: string  // e.g., 'Migration 001: Create Users'
  sql: string          // The actual SQL content
}

export const bundledMigrations: BundledMigration[] = [...]

// Helper functions
export function getMigrationSQLById(id: string): string | null
export function getMigrationList(): Array<Omit<BundledMigration, 'sql'>>
```

### Migration Service Class

File: `/src/services/migrations.ts`

```typescript
export class MigrationService {
  constructor(private db: D1Database) {}

  /**
   * Initialize migrations tracking table
   */
  async initializeMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
      )
    `;

    await this.db.prepare(createTableQuery).run();
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    await this.initializeMigrationsTable();

    const migrations = await this.getAvailableMigrations();
    const appliedMigrations = migrations.filter(m => m.applied);
    const pendingMigrations = migrations.filter(m => !m.applied);

    return {
      totalMigrations: migrations.length,
      appliedMigrations: appliedMigrations.length,
      pendingMigrations: pendingMigrations.length,
      migrations
    };
  }

  /**
   * Run pending migrations
   */
  async runPendingMigrations(): Promise<{ success: boolean; message: string; applied: string[] }> {
    const status = await this.getMigrationStatus();
    const pendingMigrations = status.migrations.filter(m => !m.applied);

    if (pendingMigrations.length === 0) {
      return {
        success: true,
        message: 'All migrations are up to date',
        applied: []
      };
    }

    const applied: string[] = [];

    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration);
        await this.markMigrationApplied(migration.id, migration.name, migration.filename);
        applied.push(migration.id);
      } catch (error) {
        console.error(`Failed to apply migration ${migration.id}:`, error);
        break;
      }
    }

    return {
      success: true,
      message: `Applied ${applied.length} migration(s)`,
      applied
    };
  }

  /**
   * Split SQL into statements, handling CREATE TRIGGER properly
   */
  private splitSQLStatements(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inTrigger = false;

    const lines = sql.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        continue;
      }

      // Check if we're entering a trigger
      if (trimmed.toUpperCase().includes('CREATE TRIGGER')) {
        inTrigger = true;
      }

      current += line + '\n';

      // Check if we're exiting a trigger
      if (inTrigger && trimmed.toUpperCase() === 'END;') {
        statements.push(current.trim());
        current = '';
        inTrigger = false;
      }
      // Check for regular statement end (not in trigger)
      else if (!inTrigger && trimmed.endsWith(';')) {
        statements.push(current.trim());
        current = '';
      }
    }

    return statements.filter(s => s.length > 0);
  }
}
```

### Migration Files

All migrations are stored in `/migrations/` directory with sequential numbering:

```
migrations/
├── 001_initial_schema.sql       # Core tables: users, content, collections, media
├── 002_faq_plugin.sql           # FAQ plugin tables
├── 003_stage5_enhancements.sql  # Content scheduling, workflow, fields
├── 004_stage6_user_management.sql # Teams, permissions, sessions
├── 005_stage7_workflow_automation.sql # Workflow engine, notifications
├── 006_plugin_system.sql        # Plugin management tables
├── 007_demo_login_plugin.sql    # Demo login plugin registration
├── 008_fix_slug_validation.sql  # Update field validation rules
├── 009_system_logging.sql       # Logging infrastructure
├── 010_cache_plugin.sql         # Cache plugin registration
└── 011_config_managed_collections.sql # Config-managed collections
```

### Creating New Migrations

When developing the SonicJS core package:

```bash
# Step 1: Create a new migration file
touch packages/core/migrations/027_add_feature.sql

# Step 2: Write idempotent SQL in the file
# Use CREATE TABLE IF NOT EXISTS, INSERT OR IGNORE, etc.

# Step 3: Regenerate the migrations bundle
cd packages/core
npm run generate:migrations
# This runs automatically during: npm run build

# Step 4: Rebuild the package
npm run build

# Step 5: Apply to your test database
cd my-sonicjs-app
wrangler d1 migrations apply DB --local
```

**Important**: After creating or modifying migration SQL files, you MUST rebuild the package. The SQL files themselves are not used at runtime - only the bundled TypeScript file is.

### Running Migrations

```bash
# Local development (uses local D1 database)
npm run db:migrate

# Production
npm run db:migrate:prod

# Using wrangler directly
wrangler d1 migrations apply DB --local
wrangler d1 migrations apply DB --env production

# Check migration status
wrangler d1 migrations list DB --local
```

### Example Migration File

```sql
-- Migration: 012_add_comments_table
-- Description: Add comments system for content

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  parent_id TEXT REFERENCES comments(id), -- For nested comments
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created ON comments(created_at);
```

---

## Collection Sync System

File: `/src/services/collection-sync.ts`

Collections can be managed through configuration files, allowing version-controlled schema definitions.

### Sync Service

```typescript
/**
 * Sync all collection configurations to the database
 */
export async function syncCollections(db: D1Database): Promise<CollectionSyncResult[]> {
  console.log('🔄 Starting collection sync...');

  const results: CollectionSyncResult[] = [];
  const configs = await loadCollectionConfigs();

  for (const config of configs) {
    const result = await syncCollection(db, config);
    results.push(result);
  }

  const created = results.filter(r => r.status === 'created').length;
  const updated = results.filter(r => r.status === 'updated').length;
  const unchanged = results.filter(r => r.status === 'unchanged').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Collection sync complete: ${created} created, ${updated} updated, ${unchanged} unchanged, ${errors} errors`);

  return results;
}

/**
 * Sync a single collection configuration to the database
 */
export async function syncCollection(db: D1Database, config: CollectionConfig): Promise<CollectionSyncResult> {
  try {
    // Validate config
    const validation = validateCollectionConfig(config);
    if (!validation.valid) {
      return {
        name: config.name,
        status: 'error',
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Check if collection exists
    const existingStmt = db.prepare('SELECT * FROM collections WHERE name = ?');
    const existing = await existingStmt.bind(config.name).first() as any;

    const now = Date.now();
    const collectionId = existing?.id || `col-${config.name}-${crypto.randomUUID().slice(0, 8)}`;

    // Prepare collection data
    const schemaJson = JSON.stringify(config.schema);
    const isActive = config.isActive !== false ? 1 : 0;
    const managed = config.managed !== false ? 1 : 0;

    if (!existing) {
      // Create new collection
      const insertStmt = db.prepare(`
        INSERT INTO collections (id, name, display_name, description, schema, is_active, managed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await insertStmt.bind(
        collectionId,
        config.name,
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        now
      ).run();

      return {
        name: config.name,
        status: 'created',
        message: `Created collection "${config.displayName}"`
      };
    } else {
      // Update existing collection if changed
      const needsUpdate =
        schemaJson !== JSON.stringify(existing.schema) ||
        config.displayName !== existing.display_name ||
        (config.description || null) !== existing.description;

      if (!needsUpdate) {
        return {
          name: config.name,
          status: 'unchanged',
          message: `Collection "${config.displayName}" is up to date`
        };
      }

      const updateStmt = db.prepare(`
        UPDATE collections
        SET display_name = ?, description = ?, schema = ?, is_active = ?, managed = ?, updated_at = ?
        WHERE name = ?
      `);

      await updateStmt.bind(
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        config.name
      ).run();

      return {
        name: config.name,
        status: 'updated',
        message: `Updated collection "${config.displayName}"`
      };
    }
  } catch (error) {
    return {
      name: config.name,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Running Collection Sync

```bash
# Sync collections from config files
npm run sync-collections
```

---

## Query Patterns and Examples

### Basic CRUD Operations

#### Create

```typescript
import { eq } from 'drizzle-orm';
import { users, content, collections } from './db/schema';

// Create user
const newUser = await db.insert(users).values({
  id: crypto.randomUUID(),
  email: 'john@example.com',
  username: 'john_doe',
  firstName: 'John',
  lastName: 'Doe',
  passwordHash: await hashPassword('secret123'),
  role: 'editor',
  createdAt: Date.now(),
  updatedAt: Date.now()
}).returning();

// Create content
const newContent = await db.insert(content).values({
  id: crypto.randomUUID(),
  collectionId: 'blog-posts-collection',
  slug: 'my-first-post',
  title: 'My First Post',
  data: JSON.stringify({
    body: '<p>Hello world!</p>',
    excerpt: 'My first blog post'
  }),
  status: 'draft',
  authorId: newUser[0].id,
  createdAt: Date.now(),
  updatedAt: Date.now()
}).returning();
```

#### Read

```typescript
// Get user by email
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'))
  .limit(1);

// Get all published content
const publishedContent = await db.select()
  .from(content)
  .where(eq(content.status, 'published'))
  .orderBy(desc(content.publishedAt))
  .limit(20);

// Get content with joins
const contentWithAuthor = await db.select({
  id: content.id,
  title: content.title,
  slug: content.slug,
  authorName: sql`${users.firstName} || ' ' || ${users.lastName}`,
  authorEmail: users.email
})
.from(content)
.leftJoin(users, eq(content.authorId, users.id))
.where(eq(content.status, 'published'));
```

#### Update

```typescript
// Update user profile
await db.update(users)
  .set({
    firstName: 'Jane',
    updatedAt: Date.now()
  })
  .where(eq(users.id, userId));

// Publish content
await db.update(content)
  .set({
    status: 'published',
    publishedAt: Date.now(),
    updatedAt: Date.now()
  })
  .where(eq(content.id, contentId));
```

#### Delete

```typescript
// Soft delete (mark as deleted)
await db.update(media)
  .set({
    deletedAt: Date.now(),
    updatedAt: Date.now()
  })
  .where(eq(media.id, mediaId));

// Hard delete (permanent removal)
await db.delete(content)
  .where(eq(content.id, contentId));
```

### Advanced Queries

#### Pagination

```typescript
import { desc, asc, count } from 'drizzle-orm';

async function getContentPaginated(page: number, limit: number = 20) {
  const offset = (page - 1) * limit;

  // Get paginated results
  const results = await db.select()
    .from(content)
    .where(eq(content.status, 'published'))
    .orderBy(desc(content.publishedAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ total }] = await db.select({ total: count() })
    .from(content)
    .where(eq(content.status, 'published'));

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}
```

#### Search and Filtering

```typescript
import { and, or, like, gte, lte } from 'drizzle-orm';

// Search content by title or body
const searchResults = await db.select()
  .from(content)
  .where(
    and(
      eq(content.status, 'published'),
      or(
        like(content.title, `%${searchQuery}%`),
        like(content.data, `%${searchQuery}%`)
      )
    )
  )
  .orderBy(desc(content.publishedAt));

// Filter by date range
const startDate = new Date('2025-01-01').getTime();
const endDate = new Date('2025-12-31').getTime();

const contentInDateRange = await db.select()
  .from(content)
  .where(
    and(
      eq(content.status, 'published'),
      gte(content.publishedAt, startDate),
      lte(content.publishedAt, endDate)
    )
  );
```

#### Aggregations

```typescript
import { count, sum, avg } from 'drizzle-orm';

// Content statistics
const stats = await db.select({
  total: count(),
  published: count(sql`CASE WHEN ${content.status} = 'published' THEN 1 END`),
  draft: count(sql`CASE WHEN ${content.status} = 'draft' THEN 1 END`)
}).from(content);

// Media statistics
const mediaStats = await db.select({
  totalFiles: count(),
  totalSize: sum(media.size),
  avgSize: avg(media.size)
})
.from(media)
.where(isNull(media.deletedAt));
```

#### Complex Joins

```typescript
// Content with author, collection, and media
const fullContent = await db.select({
  content: content,
  author: {
    id: users.id,
    name: sql`${users.firstName} || ' ' || ${users.lastName}`,
    email: users.email
  },
  collection: collections,
  featuredImage: media
})
.from(content)
.leftJoin(users, eq(content.authorId, users.id))
.leftJoin(collections, eq(content.collectionId, collections.id))
.leftJoin(media, eq(content.featuredImageId, media.id))
.where(eq(content.slug, contentSlug));
```

### Transactions

```typescript
// Create content with version history
async function createContentWithVersion(contentData: NewContent, userId: string) {
  return await db.transaction(async (tx) => {
    // Create content
    const [newContent] = await tx.insert(content).values({
      id: crypto.randomUUID(),
      ...contentData,
      versionNumber: 1
    }).returning();

    // Create initial version
    await tx.insert(contentVersions).values({
      id: crypto.randomUUID(),
      contentId: newContent.id,
      version: 1,
      data: newContent.data,
      authorId: userId,
      createdAt: Date.now()
    });

    // Log workflow action
    await tx.insert(workflowHistory).values({
      id: crypto.randomUUID(),
      contentId: newContent.id,
      action: 'created',
      fromStatus: '',
      toStatus: 'draft',
      userId: userId,
      createdAt: Date.now()
    });

    return newContent;
  });
}
```

---

## Prepared Statements

D1 supports prepared statements for better performance and SQL injection prevention.

### Basic Prepared Statements

```typescript
// Define prepared statement
const getUserStmt = db.prepare('SELECT * FROM users WHERE email = ?');

// Execute with parameter binding
const user = await getUserStmt.bind('john@example.com').first();
```

### Batch Operations

```typescript
// Batch insert for better performance
const batch = [];

for (const item of dataArray) {
  const stmt = db.prepare(
    'INSERT INTO content (id, title, slug, collection_id, data, author_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  batch.push(stmt.bind(
    crypto.randomUUID(),
    item.title,
    item.slug,
    item.collectionId,
    JSON.stringify(item.data),
    item.authorId,
    Date.now(),
    Date.now()
  ));
}

// Execute all at once
await db.batch(batch);
```

### SQL Injection Prevention

```typescript
// ❌ DANGEROUS: String interpolation
const unsafe = await db.prepare(`SELECT * FROM users WHERE email = '${userEmail}'`).all();

// ✅ SAFE: Parameter binding
const safe = await db.prepare('SELECT * FROM users WHERE email = ?')
  .bind(userEmail)
  .all();

// ✅ SAFE: Using Drizzle ORM
const safeDrizzle = await db.select()
  .from(users)
  .where(eq(users.email, userEmail));
```

### Dynamic Queries

```typescript
function buildSearchQuery(filters: SearchFilters) {
  let sql = 'SELECT * FROM content WHERE status = ?';
  const params = [filters.status];

  if (filters.collectionId) {
    sql += ' AND collection_id = ?';
    params.push(filters.collectionId);
  }

  if (filters.authorId) {
    sql += ' AND author_id = ?';
    params.push(filters.authorId);
  }

  if (filters.searchTerm) {
    sql += ' AND (title LIKE ? OR data LIKE ?)';
    params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(filters.limit || 20);

  return db.prepare(sql).bind(...params);
}

// Use it
const results = await buildSearchQuery({
  status: 'published',
  searchTerm: 'cloudflare',
  limit: 50
}).all();
```

---

## Database Performance

### Indexing Strategy

```sql
-- Essential single-column indexes
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published ON content(published_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_media_type ON media(mime_type);

-- Composite indexes for multi-column queries
CREATE INDEX idx_content_collection_status ON content(collection_id, status);
CREATE INDEX idx_content_author_status ON content(author_id, status, published_at DESC);
CREATE INDEX idx_media_folder_type ON media(folder, mime_type);

-- Covering indexes (include commonly selected columns)
CREATE INDEX idx_content_published_covering ON content(status, published_at, title, slug);

-- Partial indexes (filter specific conditions)
CREATE INDEX idx_active_users ON users(email) WHERE is_active = 1;
CREATE INDEX idx_published_content ON content(published_at DESC) WHERE status = 'published';
```

### Query Optimization Tips

```typescript
// ❌ Bad: Select all columns when you only need a few
const users = await db.select().from(users);

// ✅ Good: Select only needed columns
const userEmails = await db.select({
  id: users.id,
  email: users.email
}).from(users);

// ❌ Bad: N+1 query problem
for (const post of posts) {
  const author = await db.select()
    .from(users)
    .where(eq(users.id, post.authorId));
}

// ✅ Good: Use joins
const postsWithAuthors = await db.select({
  post: content,
  author: users
})
.from(content)
.leftJoin(users, eq(content.authorId, users.id));

// ❌ Bad: Count with full scan
const total = (await db.select().from(content)).length;

// ✅ Good: Use COUNT() aggregate
const [{ total }] = await db.select({ total: count() }).from(content);
```

### Caching Strategies

```typescript
// Three-tier caching: Memory → KV → Database
class CachedQuery {
  private memoryCache = new Map<string, any>();

  async get(key: string, fetcher: () => Promise<any>, ttl: number = 3600) {
    // Check memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check KV cache
    const cached = await env.CACHE_KV.get(key, 'json');
    if (cached) {
      this.memoryCache.set(key, cached);
      return cached;
    }

    // Fetch from database
    const data = await fetcher();

    // Store in caches
    this.memoryCache.set(key, data);
    await env.CACHE_KV.put(key, JSON.stringify(data), { expirationTtl: ttl });

    return data;
  }

  async invalidate(key: string) {
    this.memoryCache.delete(key);
    await env.CACHE_KV.delete(key);
  }
}

// Usage
const cache = new CachedQuery();

const publishedPosts = await cache.get(
  'content:published:latest',
  async () => {
    return await db.select()
      .from(content)
      .where(eq(content.status, 'published'))
      .orderBy(desc(content.publishedAt))
      .limit(20);
  },
  3600 // 1 hour TTL
);
```

### Connection Best Practices

```typescript
// D1 automatically manages connections - no pooling needed
// Just create the db instance once per request

export default {
  async fetch(request: Request, env: Env) {
    // Create db instance for this request
    const db = createDb(env.DB);

    // Use throughout request lifecycle
    const user = await db.select().from(users).limit(1);
    const posts = await db.select().from(content).limit(10);

    // Automatically cleaned up after request
    return new Response(JSON.stringify({ user, posts }));
  }
}
```

---

## Backup and Restore

### Export Database

```bash
# Export entire database to SQL file
wrangler d1 export sonicjs-dev --output=backup-dev.sql
wrangler d1 export sonicjs-ai --output=backup-prod.sql --env production

# Export with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
wrangler d1 export sonicjs-ai --output=backups/backup-$DATE.sql --env production
```

### Import Database

```bash
# Import from SQL file
wrangler d1 execute sonicjs-dev --file=backup-dev.sql --local
wrangler d1 execute sonicjs-ai --file=backup-prod.sql --env production
```

### Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$ENVIRONMENT-$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Export database
echo "Creating backup: $BACKUP_FILE"
wrangler d1 export sonicjs-ai --output="$BACKUP_FILE" --env "$ENVIRONMENT"

# Compress backup
gzip "$BACKUP_FILE"
echo "Backup completed: $BACKUP_FILE.gz"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "Old backups cleaned up"
```

### Data Export/Import in TypeScript

```typescript
// Export data to JSON
async function exportData(db: D1Database) {
  const allUsers = await db.select().from(users);
  const allCollections = await db.select().from(collections);
  const allContent = await db.select().from(content);
  const allMedia = await db.select().from(media);

  return {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    data: {
      users: allUsers,
      collections: allCollections,
      content: allContent,
      media: allMedia
    }
  };
}

// Import data from JSON
async function importData(db: D1Database, backup: any) {
  await db.transaction(async (tx) => {
    // Import users
    for (const user of backup.data.users) {
      await tx.insert(users).values(user).onConflictDoNothing();
    }

    // Import collections
    for (const collection of backup.data.collections) {
      await tx.insert(collections).values(collection).onConflictDoNothing();
    }

    // Import content
    for (const item of backup.data.content) {
      await tx.insert(content).values(item).onConflictDoNothing();
    }

    // Import media
    for (const item of backup.data.media) {
      await tx.insert(media).values(item).onConflictDoNothing();
    }
  });

  console.log('Data import completed');
}
```

---

## Wrangler D1 Commands

### Database Management

```bash
# Create new database
wrangler d1 create <database-name>

# List all databases
wrangler d1 list

# Delete database (careful!)
wrangler d1 delete <database-name>

# Get database info
wrangler d1 info <database-name>
```

### Migrations

```bash
# Apply migrations locally
wrangler d1 migrations apply DB --local

# Apply migrations to production
wrangler d1 migrations apply DB --env production

# List migration status
wrangler d1 migrations list DB --local
wrangler d1 migrations list DB --env production

# Create new migration file
wrangler d1 migrations create DB <migration-name>
```

### Execute SQL

```bash
# Execute SQL file
wrangler d1 execute DB --file=./script.sql --local
wrangler d1 execute DB --file=./script.sql --env production

# Execute SQL command directly
wrangler d1 execute DB --command="SELECT * FROM users LIMIT 5" --local

# Execute with JSON output
wrangler d1 execute DB --command="SELECT * FROM content" --json --local
```

### Backup Operations

```bash
# Export database
wrangler d1 export DB --output=backup.sql --local
wrangler d1 export DB --output=backup.sql --env production

# Export specific table
wrangler d1 execute DB --command="SELECT * FROM users" --json > users.json
```

### Development Workflow

```bash
# Start local dev with watch mode
wrangler dev

# Tail production logs
wrangler tail --env production

# Time travel (query database at specific point)
wrangler d1 time-travel DB --timestamp="2025-10-01T00:00:00Z"
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:migrate": "wrangler d1 migrations apply DB --local",
    "db:migrate:prod": "wrangler d1 migrations apply DB --env production",
    "db:export": "wrangler d1 export DB --output=backup.sql --local",
    "db:export:prod": "wrangler d1 export DB --output=backup.sql --env production",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │◄─────┐
│ email           │      │
│ username        │      │
│ password_hash   │      │
│ role            │      │
└─────────────────┘      │
        ▲                │
        │                │
        │                │
┌───────┴──────────┐     │
│    content       │     │
├──────────────────┤     │
│ id (PK)          │     │
│ author_id (FK)   │─────┘
│ collection_id(FK)│────┐
│ slug             │    │
│ title            │    │
│ data (JSON)      │    │
│ status           │    │
│ workflow_state_id│    │
└──────────────────┘    │
        │               │
        │               │
        ▼               ▼
┌──────────────────┐ ┌──────────────────┐
│content_versions  │ │  collections     │
├──────────────────┤ ├──────────────────┤
│ id (PK)          │ │ id (PK)          │
│ content_id (FK)  │ │ name             │
│ version          │ │ display_name     │
│ data (JSON)      │ │ schema (JSON)    │
│ author_id (FK)   │ │ managed          │
└──────────────────┘ └──────────────────┘

┌─────────────────────┐
│    media            │
├─────────────────────┤
│ id (PK)             │
│ uploaded_by (FK)    │─────┐
│ filename            │     │
│ r2_key              │     │
│ public_url          │     │
│ mime_type           │     │
│ size                │     │
└─────────────────────┘     │
                            │
                            ▼
┌─────────────────────────────────┐
│         plugins                 │
├─────────────────────────────────┤
│ id (PK)                         │
│ name                            │
│ version                         │
│ status (active/inactive/error)  │
│ settings (JSON)                 │
└─────────────────────────────────┘
        │
        ├────► plugin_hooks
        ├────► plugin_routes
        ├────► plugin_assets
        └────► plugin_activity_log

┌──────────────────────┐
│  workflow_states     │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ color                │
│ is_initial           │
│ is_final             │
└──────────────────────┘
        ▲
        │
┌───────┴────────────────┐
│  workflow_history      │
├────────────────────────┤
│ id (PK)                │
│ content_id (FK)        │
│ from_state_id (FK)     │
│ to_state_id (FK)       │
│ user_id (FK)           │
│ comment                │
└────────────────────────┘

┌────────────────────┐
│  permissions       │
├────────────────────┤
│ id (PK)            │
│ name               │
│ category           │
└────────────────────┘
        │
        ▼
┌────────────────────┐
│ role_permissions   │
├────────────────────┤
│ id (PK)            │
│ role               │
│ permission_id (FK) │
└────────────────────┘

┌─────────────────────┐
│   system_logs       │
├─────────────────────┤
│ id (PK)             │
│ level               │
│ category            │
│ message             │
│ user_id (FK)        │
│ data (JSON)         │
│ created_at          │
└─────────────────────┘
```

### Key Relationships

- **users → content**: One user can author many content items
- **collections → content**: One collection contains many content items
- **content → content_versions**: One content item has many versions
- **users → media**: One user can upload many media files
- **plugins → plugin_hooks/routes/assets**: One plugin can have many hooks, routes, and assets
- **workflow_states → workflow_history**: Tracks state transitions
- **permissions → role_permissions**: Maps permissions to user roles

---

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

```typescript
// ✅ Good: Atomic operation
await db.transaction(async (tx) => {
  await tx.update(content).set({ status: 'published' }).where(eq(content.id, id));
  await tx.insert(workflowHistory).values({ /* ... */ });
});

// ❌ Bad: Race conditions possible
await db.update(content).set({ status: 'published' }).where(eq(content.id, id));
await db.insert(workflowHistory).values({ /* ... */ });
```

### 2. Validate Input with Zod Schemas

```typescript
import { insertContentSchema } from './db/schema';

// Validate before inserting
const validated = insertContentSchema.parse(userInput);
await db.insert(content).values(validated);
```

### 3. Use Prepared Statements for Repeated Queries

```typescript
// Define once
const getContentBySlug = db.prepare('SELECT * FROM content WHERE slug = ? AND status = ?');

// Reuse multiple times
const post1 = await getContentBySlug.bind('post-1', 'published').first();
const post2 = await getContentBySlug.bind('post-2', 'published').first();
```

### 4. Implement Soft Deletes

```typescript
// Soft delete allows recovery
await db.update(media).set({ deletedAt: Date.now() }).where(eq(media.id, id));

// Query non-deleted items
const activeMedia = await db.select()
  .from(media)
  .where(isNull(media.deletedAt));
```

### 5. Log Important Operations

```typescript
await db.transaction(async (tx) => {
  await tx.update(content).set({ status: 'published' });

  await tx.insert(systemLogs).values({
    id: crypto.randomUUID(),
    level: 'info',
    category: 'content',
    message: 'Content published',
    data: JSON.stringify({ contentId, userId }),
    userId,
    createdAt: Date.now()
  });
});
```

---

## Troubleshooting

### Common Issues

#### Migration Failures

```bash
# Check migration status
wrangler d1 migrations list DB --local

# Manually mark migration as applied
wrangler d1 execute DB --command="INSERT INTO migrations (id, name, filename) VALUES ('006', 'Plugin System', '006_plugin_system.sql')" --local
```

#### Query Performance

```sql
-- Analyze query execution plan
EXPLAIN QUERY PLAN SELECT * FROM content WHERE status = 'published';

-- Check table structure
.schema content

-- List all indexes
SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'content';
```

#### Type Errors

```bash
# Regenerate Drizzle types after schema changes
npm run db:generate

# Verify TypeScript compilation
tsc --noEmit
```

---

## Related Documentation

- [Getting Started](./getting-started.md) - Initial setup and configuration
- [Deployment Guide](./deployment.md) - Production deployment
- [API Reference](./api-reference.md) - REST API endpoints
- [Collections Guide](./collections.md) - Content modeling
- [Plugin Development](./plugin-development.md) - Building plugins
- [Cache System](./cache.md) - Caching strategies

---

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
