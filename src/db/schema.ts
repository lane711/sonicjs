import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'editor', 'user']),
});

export const selectUserSchema = createSelectSchema(users);

export const insertCollectionSchema = createInsertSchema(collections, {
  name: z.string().min(1).regex(/^[a-z0-9_]+$/, 'Collection name must be lowercase with underscores'),
  displayName: z.string().min(1),
  schema: z.record(z.any()), // JSON schema validation
});

export const selectCollectionSchema = createSelectSchema(collections);

export const insertContentSchema = createInsertSchema(content, {
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  title: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
  data: z.record(z.any()),
});

export const selectContentSchema = createSelectSchema(content);

export const insertMediaSchema = createInsertSchema(media, {
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  path: z.string().min(1),
  url: z.string().url(),
});

export const selectMediaSchema = createSelectSchema(media);

// Type exports
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Collection = z.infer<typeof selectCollectionSchema>;
export type NewCollection = z.infer<typeof insertCollectionSchema>;
export type Content = z.infer<typeof selectContentSchema>;
export type NewContent = z.infer<typeof insertContentSchema>;
export type Media = z.infer<typeof selectMediaSchema>;
export type NewMedia = z.infer<typeof insertMediaSchema>;