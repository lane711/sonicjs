import { CollectionConfig } from '../types/collection-config'

/**
 * Pages Collection
 *
 * This collection defines the schema for static pages.
 * Being config-managed, it cannot be edited through the admin UI.
 */
const pagesCollection: CollectionConfig = {
  name: 'pages',
  displayName: 'Pages',
  description: 'Static content pages like About, Contact, etc.',
  icon: 'document',
  color: '#10B981',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Page Title',
        description: 'The title of the page',
        required: true,
        minLength: 3,
        maxLength: 200
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        description: 'URL-friendly page identifier',
        required: true,
        helpText: 'e.g., "about-us", "contact", "privacy-policy"'
      },
      content: {
        type: 'richtext',
        title: 'Page Content',
        description: 'Main page content',
        required: true
      },
      layout: {
        type: 'select',
        title: 'Page Layout',
        description: 'Choose the layout template',
        enum: ['default', 'full-width', 'sidebar-left', 'sidebar-right', 'landing'],
        enumLabels: ['Default', 'Full Width', 'Left Sidebar', 'Right Sidebar', 'Landing Page'],
        default: 'default'
      },
      showInMenu: {
        type: 'checkbox',
        title: 'Show in Navigation',
        description: 'Display this page in the main navigation menu',
        default: false
      },
      menuOrder: {
        type: 'number',
        title: 'Menu Order',
        description: 'Order in navigation menu (lower numbers appear first)',
        min: 0,
        default: 0,
        dependsOn: 'showInMenu',
        showWhen: true
      },
      parentPage: {
        type: 'reference',
        title: 'Parent Page',
        description: 'Create a page hierarchy',
        collection: 'pages',
        helpText: 'Optional - leave blank for top-level pages'
      },
      status: {
        type: 'select',
        title: 'Status',
        description: 'Publication status',
        enum: ['draft', 'published', 'archived'],
        enumLabels: ['Draft', 'Published', 'Archived'],
        default: 'draft',
        required: true
      },
      seo: {
        type: 'object',
        title: 'SEO Settings',
        properties: {
          metaTitle: {
            type: 'string',
            title: 'Meta Title',
            maxLength: 60
          },
          metaDescription: {
            type: 'textarea',
            title: 'Meta Description',
            maxLength: 160
          },
          ogImage: {
            type: 'media',
            title: 'Social Share Image'
          },
          noIndex: {
            type: 'checkbox',
            title: 'No Index',
            description: 'Prevent search engines from indexing this page',
            default: false
          }
        }
      }
    },
    required: ['title', 'slug', 'content', 'status']
  },

  managed: true,
  isActive: true,
  defaultSort: 'menuOrder',
  defaultSortOrder: 'asc',
  listFields: ['title', 'slug', 'status', 'showInMenu'],
  searchFields: ['title', 'content']
}

export default pagesCollection
