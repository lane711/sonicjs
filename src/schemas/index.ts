import { z } from 'zod'
// import { SchemaDefinition } from '../utils/api-generator'

export interface SchemaDefinition {
  name: string
  tableName: string
  schema: z.ZodSchema
  relationships?: {
    [key: string]: {
      type: 'hasMany' | 'belongsTo' | 'hasOne'
      target: string
      foreignKey?: string
    }
  }
}

// Core content schema
export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  featuredImage: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  publishedAt: z.string().datetime().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

// Collections schema
export const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-z0-9-_]+$/, 'Name must be lowercase alphanumeric with dashes/underscores'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  schema: z.record(z.any()).default({}),
  settings: z.record(z.any()).default({}),
})

// Users schema
export const userSchema = z.object({
  email: z.string().email('Valid email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'editor', 'author', 'viewer']).default('viewer'),
  isActive: z.boolean().default(true),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  settings: z.record(z.any()).default({}),
})

// Media schema
export const mediaSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('Size must be positive'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().default('/'),
  metadata: z.record(z.any()).default({}),
})

// Schema definitions for API generation
export const schemaDefinitions: SchemaDefinition[] = [
  {
    name: 'content',
    tableName: 'content',
    schema: contentSchema,
    relationships: {
      author: {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'authorId'
      },
      collection: {
        type: 'belongsTo',
        target: 'collections',
        foreignKey: 'collectionId'
      }
    }
  },
  {
    name: 'collections',
    tableName: 'collections',
    schema: collectionSchema,
    relationships: {
      content: {
        type: 'hasMany',
        target: 'content',
        foreignKey: 'collectionId'
      }
    }
  },
  {
    name: 'users',
    tableName: 'users',
    schema: userSchema,
    relationships: {
      content: {
        type: 'hasMany',
        target: 'content',
        foreignKey: 'authorId'
      }
    }
  },
  {
    name: 'media',
    tableName: 'media',
    schema: mediaSchema,
    relationships: {}
  }
]

// Export individual schemas
export {
  contentSchema as Content,
  collectionSchema as Collection,
  userSchema as User,
  mediaSchema as Media
}