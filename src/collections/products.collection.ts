import { CollectionConfig } from '@sonicjs-cms/core'

/**
 * Products Collection (Example)
 *
 * This is an example collection showing how to define product schemas.
 * You can customize or remove this based on your needs.
 */
const productsCollection: CollectionConfig = {
  name: 'products',
  displayName: 'Products',
  description: 'Product catalog and inventory',
  icon: 'shopping-bag',
  color: '#8B5CF6',

  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Product Name',
        required: true,
        minLength: 3,
        maxLength: 200
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        required: true
      },
      description: {
        type: 'richtext',
        title: 'Description',
        required: true
      },
      shortDescription: {
        type: 'textarea',
        title: 'Short Description',
        maxLength: 200,
        helpText: 'Brief description for product cards and previews'
      },
      sku: {
        type: 'string',
        title: 'SKU',
        description: 'Stock Keeping Unit',
        required: true,
        pattern: '^[A-Z0-9-]+$',
        helpText: 'Unique product identifier (e.g., PROD-001)'
      },
      price: {
        type: 'number',
        title: 'Price',
        description: 'Product price in USD',
        required: true,
        min: 0
      },
      compareAtPrice: {
        type: 'number',
        title: 'Compare at Price',
        description: 'Original price (for showing discounts)',
        min: 0,
        helpText: 'Leave blank if not on sale'
      },
      inventory: {
        type: 'object',
        title: 'Inventory',
        properties: {
          trackInventory: {
            type: 'checkbox',
            title: 'Track Inventory',
            default: true
          },
          stock: {
            type: 'number',
            title: 'Stock Quantity',
            min: 0,
            default: 0
          },
          lowStockThreshold: {
            type: 'number',
            title: 'Low Stock Alert',
            description: 'Alert when stock falls below this number',
            min: 0,
            default: 10
          }
        }
      },
      images: {
        type: 'array',
        title: 'Product Images',
        description: 'Upload product photos',
        items: {
          type: 'media',
          title: 'Image'
        }
      },
      category: {
        type: 'select',
        title: 'Category',
        enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'other'],
        enumLabels: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Other'],
        required: true
      },
      tags: {
        type: 'multiselect',
        title: 'Tags',
        enum: ['new', 'featured', 'sale', 'bestseller', 'limited'],
        enumLabels: ['New Arrival', 'Featured', 'On Sale', 'Bestseller', 'Limited Edition']
      },
      specifications: {
        type: 'array',
        title: 'Specifications',
        description: 'Product specifications and features',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Specification Name',
              placeholder: 'e.g., Dimensions, Weight, Material'
            },
            value: {
              type: 'string',
              title: 'Value',
              placeholder: 'e.g., 10x5x3 inches'
            }
          }
        }
      },
      status: {
        type: 'select',
        title: 'Status',
        enum: ['draft', 'active', 'archived', 'out-of-stock'],
        enumLabels: ['Draft', 'Active', 'Archived', 'Out of Stock'],
        default: 'draft',
        required: true
      },
      featured: {
        type: 'checkbox',
        title: 'Featured Product',
        default: false
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
          }
        }
      }
    },
    required: ['name', 'slug', 'sku', 'price', 'category', 'status']
  },

  managed: true,
  isActive: true,
  defaultSort: 'name',
  defaultSortOrder: 'asc',
  listFields: ['name', 'sku', 'price', 'category', 'status'],
  searchFields: ['name', 'description', 'sku']
}

export default productsCollection
