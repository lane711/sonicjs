import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table for authentication and user management
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password'), // Hashed password, nullable for OAuth users
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // 'admin', 'editor', 'user'
  avatar: text('avatar'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content collections - dynamic schema definitions
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  schema: text('schema', { mode: 'json' }).notNull(), // JSON schema definition
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content items - actual content data
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  data: text('data', { mode: 'json' }).notNull(), // JSON content data
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content versions for versioning system
export const contentVersions = sqliteTable('content_versions', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => content.id),
  version: integer('version').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Media/Files table
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(), // R2 path
  url: text('url').notNull(), // CDN URL
  alt: text('alt'),
  title: text('title'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// API tokens for programmatic access
export const apiTokens = sqliteTable('api_tokens', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  permissions: text('permissions', { mode: 'json' }).notNull(), // Array of permissions
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  name: (schema) => schema.min(1),
  role: (schema) => schema,
});

export const selectUserSchema = createSelectSchema(users);

export const insertCollectionSchema = createInsertSchema(collections, {
  name: (schema) => schema.min(1).regex(/^[a-z0-9_]+$/, 'Collection name must be lowercase with underscores'),
  displayName: (schema) => schema.min(1),
});

export const selectCollectionSchema = createSelectSchema(collections);

export const insertContentSchema = createInsertSchema(content, {
  slug: (schema) => schema.min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  title: (schema) => schema.min(1),
  status: (schema) => schema,
});

export const selectContentSchema = createSelectSchema(content);

export const insertMediaSchema = createInsertSchema(media, {
  filename: (schema) => schema.min(1),
  originalName: (schema) => schema.min(1),
  mimeType: (schema) => schema.min(1),
  size: (schema) => schema.positive(),
  path: (schema) => schema.min(1),
  url: (schema) => schema.url(),
});

export const selectMediaSchema = createSelectSchema(media);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;