import { CollectionConfig } from '../types/collection-config'

/**
 * Blog Posts Collection
 *
 * This collection defines the schema for blog posts.
 * Being config-managed, it cannot be edited through the admin UI.
 */
const blogPostsCollection: CollectionConfig = {
  name: 'blog_posts',
  displayName: 'Blog Posts',
  description: 'Articles and blog content for the website',
  icon: 'document-text',
  color: '#3B82F6',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        description: 'The title of the blog post',
        required: true,
        minLength: 3,
        maxLength: 200,
        placeholder: 'Enter blog post title...'
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        description: 'Auto-generated URL-friendly slug',
        helpText: 'Leave blank to auto-generate from title'
      },
      excerpt: {
        type: 'textarea',
        title: 'Excerpt',
        description: 'Short summary of the post',
        maxLength: 300,
        placeholder: 'Brief description for previews and SEO...'
      },
      content: {
        type: 'richtext',
        title: 'Content',
        description: 'Main blog post content',
        required: true
      },
      featuredImage: {
        type: 'media',
        title: 'Featured Image',
        description: 'Main image for the blog post',
        helpText: 'Recommended size: 1200x630px'
      },
      author: {
        type: 'reference',
        title: 'Author',
        description: 'Post author',
        collection: 'users',
        required: true
      },
      category: {
        type: 'select',
        title: 'Category',
        description: 'Blog post category',
        enum: ['technology', 'design', 'business', 'development', 'marketing', 'other'],
        enumLabels: ['Technology', 'Design', 'Business', 'Development', 'Marketing', 'Other'],
        default: 'other'
      },
      tags: {
        type: 'multiselect',
        title: 'Tags',
        description: 'Keywords and topics',
        enum: ['javascript', 'typescript', 'cloudflare', 'cms', 'api', 'tutorial', 'guide', 'news'],
        enumLabels: ['JavaScript', 'TypeScript', 'Cloudflare', 'CMS', 'API', 'Tutorial', 'Guide', 'News']
      },
      publishDate: {
        type: 'datetime',
        title: 'Publish Date',
        description: 'When to publish this post',
        default: new Date().toISOString()
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
      featured: {
        type: 'checkbox',
        title: 'Featured Post',
        description: 'Show this post in featured sections',
        default: false
      },
      allowComments: {
        type: 'checkbox',
        title: 'Allow Comments',
        description: 'Enable commenting on this post',
        default: true
      },
      seo: {
        type: 'object',
        title: 'SEO Settings',
        description: 'Search engine optimization settings',
        properties: {
          metaTitle: {
            type: 'string',
            title: 'Meta Title',
            maxLength: 60,
            helpText: 'Leave blank to use post title'
          },
          metaDescription: {
            type: 'textarea',
            title: 'Meta Description',
            maxLength: 160,
            helpText: 'Leave blank to use excerpt'
          },
          ogImage: {
            type: 'media',
            title: 'Social Share Image',
            helpText: 'Image for social media sharing (defaults to featured image)'
          }
        }
      }
    },
    required: ['title', 'content', 'status']
  },

  managed: true,
  isActive: true,
  defaultSort: 'publishDate',
  defaultSortOrder: 'desc',
  listFields: ['title', 'author', 'category', 'status', 'publishDate'],
  searchFields: ['title', 'excerpt', 'content']
}

export default blogPostsCollection
