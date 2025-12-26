/**
 * Contact Messages Collection
 * 
 * This collection stores messages submitted through the contact form plugin.
 * Messages are automatically created when users submit the contact form.
 */

import type { CollectionConfig } from '@sonicjs-cms/core'

export default {
  name: 'contact_messages',
  displayName: 'Contact Messages',
  description: 'Messages submitted through the contact form',
  icon: '📧',

  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        required: true,
        maxLength: 200
      },
      email: {
        type: 'string',
        title: 'Email',
        required: true,
        maxLength: 200
      },
      msg: {
        type: 'textarea',
        title: 'Message',
        required: true
      }
    },
    required: ['name', 'email', 'msg']
  },

  // Admin list view configuration
  listFields: ['name', 'email', 'createdAt'],
  searchFields: ['name', 'email', 'msg'],
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc',

  // Mark as config-managed (code-based) collection
  managed: true,
  isActive: true
} satisfies CollectionConfig

