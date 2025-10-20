/**
 * Blog Posts Collection
 *
 * Example collection configuration for blog posts
 */

import type { CollectionConfig } from '@sonicjs-cms/core'

export default {
  name: 'blog-posts',
  label: 'Blog Posts',
  description: 'Manage your blog posts',
  icon: '📝',

  fields: {
    title: {
      type: 'text',
      label: 'Title',
      required: true,
      maxLength: 200
    },
    slug: {
      type: 'text',
      label: 'URL Slug',
      required: true,
      maxLength: 200
    },
    excerpt: {
      type: 'textarea',
      label: 'Excerpt',
      rows: 3,
      maxLength: 500
    },
    content: {
      type: 'markdown',
      label: 'Content',
      required: true
    },
    featuredImage: {
      type: 'image',
      label: 'Featured Image'
    },
    author: {
      type: 'text',
      label: 'Author',
      required: true
    },
    publishedAt: {
      type: 'datetime',
      label: 'Published Date'
    },
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ],
      defaultValue: 'draft'
    },
    tags: {
      type: 'text',
      label: 'Tags (comma-separated)'
    }
  },

  // List view configuration
  listView: {
    columns: ['title', 'author', 'status', 'publishedAt'],
    defaultSort: { field: 'createdAt', order: 'desc' },
    searchFields: ['title', 'excerpt', 'author'],
    filters: [
      {
        field: 'status',
        type: 'select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'archived', label: 'Archived' }
        ]
      }
    ]
  },

  // API configuration
  api: {
    enabled: true,
    public: true,
    publicReadOnly: true
  }
} satisfies CollectionConfig
