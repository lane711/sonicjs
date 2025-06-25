# Database Documentation

SonicJS AI uses Cloudflare D1, a serverless SQLite database, with Drizzle ORM for type-safe database operations. This guide covers database schema, operations, migrations, and best practices.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Drizzle ORM Integration](#drizzle-orm-integration)
- [Database Operations](#database-operations)
- [Migrations](#migrations)
- [Performance Optimization](#performance-optimization)
- [Backup & Recovery](#backup--recovery)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Technology Stack

- **Cloudflare D1** - Serverless SQLite database
- **Drizzle ORM** - Type-safe ORM with excellent TypeScript support
- **SQLite** - Underlying database engine
- **SQL Migrations** - Version-controlled schema changes

### Key Features

- **Edge-native** - Database runs at Cloudflare's edge
- **ACID compliance** - Full transaction support
- **Type safety** - End-to-end TypeScript types
- **Zero-latency reads** - Global replication
- **Cost-effective** - Pay-per-request pricing

## Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK(role IN ('admin', 'editor', 'author', 'viewer')) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### Collections Table

```sql
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  schema TEXT, -- JSON schema definition
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_collections_name ON collections(name);
CREATE INDEX idx_collections_active ON collections(is_active);
```

#### Content Table

```sql
CREATE TABLE content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  collection_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'review', 'published', 'archived')) DEFAULT 'draft',
  data TEXT, -- JSON content data
  author_id TEXT NOT NULL,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_collection ON content(collection_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_published ON content(published_at);
```

#### Media Table

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  folder TEXT DEFAULT 'uploads',
  r2_key TEXT NOT NULL, -- R2 object key
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT,
  caption TEXT,
  tags TEXT, -- JSON array
  uploaded_by TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_type ON media(mime_type);
CREATE INDEX idx_media_uploader ON media(uploaded_by);
CREATE INDEX idx_media_uploaded ON media(uploaded_at);
CREATE INDEX idx_media_deleted ON media(deleted_at);
```

#### Content Versions Table (Versioning System)

```sql
CREATE TABLE content_versions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON content data
  author_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  UNIQUE(content_id, version_number)
);

-- Indexes
CREATE INDEX idx_versions_content ON content_versions(content_id);
CREATE INDEX idx_versions_number ON content_versions(version_number);
```

## Drizzle ORM Integration

### Schema Definition

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role', { enum: ['admin', 'editor', 'author', 'viewer'] }).default('viewer'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  lastLogin: text('last_login'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  schema: text('schema'), // JSON
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  status: text('status', { enum: ['draft', 'review', 'published', 'archived'] }).default('draft'),
  data: text('data'), // JSON
  authorId: text('author_id').notNull().references(() => users.id),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder').default('uploads'),
  r2Key: text('r2_key').notNull(),
  publicUrl: text('public_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  alt: text('alt'),
  caption: text('caption'),
  tags: text('tags'), // JSON
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  uploadedAt: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at')
})
```

### Relations Definition

```typescript
// Define table relationships
export const usersRelations = relations(users, ({ many }) => ({
  content: many(content),
  media: many(media)
}))

export const collectionsRelations = relations(collections, ({ many }) => ({
  content: many(content)
}))

export const contentRelations = relations(content, ({ one }) => ({
  author: one(users, {
    fields: [content.authorId],
    references: [users.id]
  }),
  collection: one(collections, {
    fields: [content.collectionId],
    references: [collections.id]
  })
}))

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.uploadedBy],
    references: [users.id]
  })
}))
```

### Database Connection

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const createDatabase = (d1: D1Database) => {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDatabase>
```

## Database Operations

### Basic CRUD Operations

#### Creating Records

```typescript
// Create user
const newUser = await db.insert(users).values({
  id: crypto.randomUUID(),
  email: 'user@example.com',
  passwordHash: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
  role: 'editor'
}).returning()

// Create content
const newContent = await db.insert(content).values({
  id: crypto.randomUUID(),
  title: 'New Article',
  slug: 'new-article',
  collectionId: 'blog-posts',
  status: 'draft',
  data: JSON.stringify({ content: 'Article content...' }),
  authorId: userId
}).returning()
```

#### Reading Records

```typescript
// Get user by email
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'user@example.com'))
  .limit(1)

// Get content with author and collection
const contentWithRelations = await db.select({
  content: content,
  author: users,
  collection: collections
})
.from(content)
.leftJoin(users, eq(content.authorId, users.id))
.leftJoin(collections, eq(content.collectionId, collections.id))
.where(eq(content.status, 'published'))
```

#### Updating Records

```typescript
// Update user
await db.update(users)
  .set({ 
    firstName: 'Jane',
    updatedAt: new Date().toISOString()
  })
  .where(eq(users.id, userId))

// Update content status
await db.update(content)
  .set({ 
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  .where(eq(content.id, contentId))
```

#### Deleting Records

```typescript
// Soft delete media file
await db.update(media)
  .set({ 
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  .where(eq(media.id, mediaId))

// Hard delete (use carefully)
await db.delete(content)
  .where(eq(content.id, contentId))
```

### Advanced Queries

#### Pagination

```typescript
const getContentPaginated = async (page: number, limit: number = 20) => {
  const offset = (page - 1) * limit
  
  const results = await db.select()
    .from(content)
    .where(eq(content.status, 'published'))
    .orderBy(desc(content.publishedAt))
    .limit(limit)
    .offset(offset)
    
  const total = await db.select({ count: count() })
    .from(content)
    .where(eq(content.status, 'published'))
    
  return {
    data: results,
    pagination: {
      page,
      limit,
      total: total[0].count,
      pages: Math.ceil(total[0].count / limit)
    }
  }
}
```

#### Search and Filtering

```typescript
const searchContent = async (query: string, filters: any = {}) => {
  let dbQuery = db.select()
    .from(content)
    .where(
      and(
        eq(content.status, 'published'),
        or(
          like(content.title, `%${query}%`),
          like(content.data, `%${query}%`)
        )
      )
    )
    
  if (filters.collectionId) {
    dbQuery = dbQuery.where(eq(content.collectionId, filters.collectionId))
  }
  
  if (filters.authorId) {
    dbQuery = dbQuery.where(eq(content.authorId, filters.authorId))
  }
  
  return await dbQuery.orderBy(desc(content.updatedAt))
}
```

#### Aggregation Queries

```typescript
const getContentStats = async () => {
  const stats = await db.select({
    total: count(),
    published: count(case(eq(content.status, 'published'), 1)),
    draft: count(case(eq(content.status, 'draft'), 1))
  }).from(content)
  
  const mediaStats = await db.select({
    totalFiles: count(),
    totalSize: sum(media.size)
  }).from(media).where(isNull(media.deletedAt))
  
  return {
    content: stats[0],
    media: mediaStats[0]
  }
}
```

### Transactions

```typescript
const createContentWithVersion = async (contentData: any) => {
  return await db.transaction(async (tx) => {
    // Create content
    const [newContent] = await tx.insert(content).values({
      id: crypto.randomUUID(),
      ...contentData
    }).returning()
    
    // Create initial version
    await tx.insert(contentVersions).values({
      id: crypto.randomUUID(),
      contentId: newContent.id,
      versionNumber: 1,
      title: newContent.title,
      data: newContent.data,
      authorId: newContent.authorId
    })
    
    return newContent
  })
}
```

## Migrations

### Migration Files

Create migration files in `src/db/migrations/`:

```sql
-- 001_initial_schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  -- ... rest of schema
);

-- 002_add_media_table.sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  -- ... rest of schema
);

-- 003_add_content_versions.sql
CREATE TABLE content_versions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  -- ... rest of schema
);
```

### Migration Commands

```bash
# Apply migrations locally
npm run db:migrate

# Apply migrations to production
npm run db:migrate:prod

# Generate new migration
npm run db:generate

# Reset database (development only)
npm run db:reset
```

### Migration Scripts

```json
// package.json
{
  "scripts": {
    "db:migrate": "wrangler d1 migrations apply sonicjs-ai-dev --local",
    "db:migrate:prod": "wrangler d1 migrations apply sonicjs-ai-prod",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:reset": "wrangler d1 execute sonicjs-ai-dev --file=./reset.sql --local"
  }
}
```

## Performance Optimization

### Indexing Strategy

```sql
-- Essential indexes for common queries
CREATE INDEX idx_content_published ON content(status, published_at DESC);
CREATE INDEX idx_content_author_status ON content(author_id, status);
CREATE INDEX idx_media_folder_type ON media(folder, mime_type);
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- Composite indexes for complex queries
CREATE INDEX idx_content_collection_status ON content(collection_id, status, updated_at DESC);
CREATE INDEX idx_media_uploader_date ON media(uploaded_by, uploaded_at DESC);
```

### Query Optimization

```typescript
// Efficient pagination with cursor-based approach
const getCursorPaginated = async (cursor?: string, limit: number = 20) => {
  let query = db.select()
    .from(content)
    .where(eq(content.status, 'published'))
    .orderBy(desc(content.createdAt))
    .limit(limit + 1) // +1 to check if there's a next page
    
  if (cursor) {
    query = query.where(lt(content.createdAt, cursor))
  }
  
  const results = await query
  const hasMore = results.length > limit
  
  return {
    data: results.slice(0, limit),
    nextCursor: hasMore ? results[limit - 1].createdAt : null,
    hasMore
  }
}
```

### Connection Pooling

```typescript
// D1 handles connection pooling automatically
// No manual connection management needed
const db = createDatabase(env.DB)
```

## Backup & Recovery

### Database Backup

```bash
# Export database
wrangler d1 export sonicjs-ai-prod --output=backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
wrangler d1 export sonicjs-ai-prod --output=backups/backup-$DATE.sql
```

### Data Import/Export

```typescript
// Export data as JSON
const exportData = async () => {
  const allUsers = await db.select().from(users)
  const allContent = await db.select().from(content)
  const allCollections = await db.select().from(collections)
  
  return {
    users: allUsers,
    content: allContent,
    collections: allCollections,
    timestamp: new Date().toISOString()
  }
}

// Import data from JSON
const importData = async (data: any) => {
  await db.transaction(async (tx) => {
    for (const user of data.users) {
      await tx.insert(users).values(user).onConflictDoNothing()
    }
    // ... import other tables
  })
}
```

## Best Practices

### 1. Type Safety

```typescript
// Use Drizzle's type inference
type User = typeof users.$inferSelect
type NewUser = typeof users.$inferInsert

// Create type-safe functions
const createUser = async (userData: NewUser): Promise<User> => {
  const [user] = await db.insert(users).values(userData).returning()
  return user
}
```

### 2. Error Handling

```typescript
const safeDbOperation = async (operation: () => Promise<any>) => {
  try {
    return await operation()
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Record already exists')
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      throw new Error('Invalid reference')
    }
    throw error
  }
}
```

### 3. Data Validation

```typescript
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'editor', 'author', 'viewer'])
})

const createValidatedUser = async (userData: any) => {
  const validData = UserSchema.parse(userData)
  return await db.insert(users).values({
    id: crypto.randomUUID(),
    ...validData,
    passwordHash: await hashPassword(validData.password)
  })
}
```

### 4. Soft Deletes

```typescript
// Implement soft deletes consistently
const softDelete = async (table: any, id: string) => {
  return await db.update(table)
    .set({ 
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .where(eq(table.id, id))
}

// Filter out deleted records
const getActiveRecords = (table: any) => {
  return db.select().from(table).where(isNull(table.deletedAt))
}
```

## Troubleshooting

### Common Issues

#### 1. Migration Failures

```bash
# Check migration status
wrangler d1 migrations list sonicjs-ai-dev

# Fix failed migration
wrangler d1 execute sonicjs-ai-dev --file=fix-migration.sql
```

#### 2. Type Errors

```typescript
// Regenerate types after schema changes
npm run db:generate

// Check schema compatibility
npm run type-check
```

#### 3. Performance Issues

```sql
-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM content WHERE status = 'published';

-- Check index usage
.schema content
```

#### 4. Connection Issues

```typescript
// Test database connection
const testConnection = async () => {
  try {
    await db.select().from(users).limit(1)
    console.log('Database connection successful')
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}
```

### Debugging Queries

```typescript
// Enable query logging
import { drizzle } from 'drizzle-orm/d1'

const db = drizzle(d1, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

// Log query execution time
const timedQuery = async (query: Promise<any>) => {
  const start = Date.now()
  const result = await query
  console.log(`Query took ${Date.now() - start}ms`)
  return result
}
```

## Related Documentation

- [Getting Started](getting-started.md) - Database setup instructions
- [Deployment](deployment.md) - Production database configuration
- [API Reference](api-reference.md) - Database-backed API endpoints
- [Content Management](content-management.md) - Content data models