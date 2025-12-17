/**
 * Blog Posts Collection
 *
 * Example collection configuration for blog posts
 */

import type { CollectionConfig } from '@sonicjs-cms/core'

export default {
  name: 'blog-posts',
  displayName: 'Blog Posts',
  description: 'Manage your blog posts',
  icon: '📝',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        required: true,
        maxLength: 200
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        required: true,
        maxLength: 200
      },
      excerpt: {
        type: 'textarea',
        title: 'Excerpt',
        maxLength: 500,
        helpText: 'A short summary of the post'
      },
      content: {
        type: 'quill',
        title: 'Content',
        required: true
      },
      featuredImage: {
        type: 'media',
        title: 'Featured Image'
      },
      author: {
        type: 'string',
        title: 'Author',
        required: true
      },
      publishedAt: {
        type: 'datetime',
        title: 'Published Date'
      },
      status: {
        type: 'select',
        title: 'Status',
        enum: ['draft', 'published', 'archived'],
        enumLabels: ['Draft', 'Published', 'Archived'],
        default: 'draft'
      },
      tags: {
        type: 'string',
        title: 'Tags',
        helpText: 'Comma-separated tags'
      }
    },
    required: ['title', 'slug', 'content', 'author']
  },

  // List view configuration
  listFields: ['title', 'author', 'status', 'publishedAt'],
  searchFields: ['title', 'excerpt', 'author'],
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc'
} satisfies CollectionConfig
