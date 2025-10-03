# Config-Based Collections

SonicJS supports defining collections in TypeScript configuration files, providing a developer-friendly, version-controlled approach to schema management.

## Overview

Collections can now be defined in **two ways**:

1. **Config-Managed** (new): Defined in TypeScript files, version-controlled, synced automatically
2. **User-Created**: Created and edited through the admin UI

Both types work seamlessly together!

## Why Config-Based Collections?

### Traditional Approach (UI-Only)
- ❌ Schema changes not version controlled
- ❌ Manual setup in each environment
- ❌ No IDE autocomplete or type safety
- ❌ Difficult to review schema changes
- ❌ Hard to replicate environments

### Config-Based Approach
- ✅ **Version Control**: Track all schema changes in Git
- ✅ **Type Safety**: Full TypeScript support with IDE autocomplete
- ✅ **Deployment**: Collections travel with your code
- ✅ **Code Review**: Schema changes go through PR process
- ✅ **Repeatability**: Easy to replicate across environments
- ✅ **Documentation**: Config files serve as living documentation

## Quick Start

### 1. Create a Collection Config

Create a new file in `src/collections/` directory:

```typescript
// src/collections/events.collection.ts
import { CollectionConfig } from '../types/collection-config'

const eventsCollection: CollectionConfig = {
  name: 'events',
  displayName: 'Events',
  description: 'Community events and meetups',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Event Title',
        required: true,
        minLength: 3,
        maxLength: 200
      },
      date: {
        type: 'datetime',
        title: 'Event Date',
        required: true
      },
      location: {
        type: 'string',
        title: 'Location',
        placeholder: 'e.g., San Francisco, CA'
      },
      description: {
        type: 'richtext',
        title: 'Description'
      },
      capacity: {
        type: 'number',
        title: 'Max Attendees',
        min: 1,
        default: 50
      },
      registrationOpen: {
        type: 'checkbox',
        title: 'Registration Open',
        default: true
      }
    },
    required: ['title', 'date']
  },

  managed: true,
  isActive: true
}

export default eventsCollection
```

### 2. Auto-Sync on Startup

Collections are automatically synced when the app starts. Just run:

```bash
npm run dev
```

You'll see output like:
```
[Bootstrap] Syncing collection configurations...
✓ Loaded collection config: events
✓ Created collection: events
✅ Collection sync complete: 1 created, 0 updated, 0 unchanged
```

### 3. View in Admin UI

Visit `/admin/collections` and you'll see your new collection with a **"Config"** badge, indicating it's managed by code and locked for editing.

## Collection Configuration Reference

### Basic Structure

```typescript
import { CollectionConfig } from '../types/collection-config'

const myCollection: CollectionConfig = {
  // Machine name (required)
  name: 'my_collection',

  // Display name (required)
  displayName: 'My Collection',

  // Optional description
  description: 'Description of this collection',

  // Schema definition (required)
  schema: {
    type: 'object',
    properties: { /* fields */ },
    required: ['field1', 'field2']
  },

  // Config-managed (default: true)
  managed: true,

  // Active status (default: true)
  isActive: true,

  // Optional UI settings
  icon: 'calendar',
  color: '#3B82F6',
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc',
  listFields: ['title', 'date', 'status'],
  searchFields: ['title', 'description']
}

export default myCollection
```

### Available Field Types

#### Text Fields
- `string` - Single-line text
- `textarea` - Multi-line text
- `email` - Email address (with validation)
- `url` - URL (with validation)
- `slug` - URL-friendly slug
- `color` - Color picker

#### Numbers and Dates
- `number` - Numeric input
- `date` - Date picker
- `datetime` - Date and time picker

#### Rich Content
- `richtext` - WYSIWYG editor
- `markdown` - Markdown editor
- `json` - JSON editor

#### Selections
- `select` - Dropdown selection
- `multiselect` - Multiple selection dropdown
- `radio` - Radio buttons
- `checkbox` - Single checkbox

#### Media and Files
- `media` - Image/file picker
- `file` - File upload

#### Relationships
- `reference` - Reference to another collection

#### Structured Data
- `object` - Nested object with properties
- `array` - Array of items

### Field Configuration Options

```typescript
{
  type: 'string',
  title: 'Field Label',           // Display name
  description: 'Field purpose',    // Help text below label
  required: true,                  // Make field required
  default: 'value',               // Default value
  placeholder: 'Enter text...',   // Input placeholder
  helpText: 'Additional info',    // Inline help tooltip

  // Validation
  minLength: 3,                   // Min string length
  maxLength: 100,                 // Max string length
  min: 0,                         // Min number value
  max: 100,                       // Max number value
  pattern: '^[A-Z]+$',           // Regex pattern

  // For select/multiselect/radio
  enum: ['draft', 'published'],
  enumLabels: ['Draft', 'Published'],

  // For reference fields
  collection: 'users',            // Target collection

  // For array fields
  items: {
    type: 'string'                // Type of array items
  },

  // For object fields
  properties: {
    field1: { type: 'string' },
    field2: { type: 'number' }
  }
}
```

## Example Collections

### Blog Posts

```typescript
const blogPostsCollection: CollectionConfig = {
  name: 'blog_posts',
  displayName: 'Blog Posts',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        required: true
      },
      slug: {
        type: 'slug',
        title: 'URL Slug'
      },
      content: {
        type: 'richtext',
        title: 'Content',
        required: true
      },
      author: {
        type: 'reference',
        title: 'Author',
        collection: 'users',
        required: true
      },
      category: {
        type: 'select',
        title: 'Category',
        enum: ['technology', 'design', 'business'],
        enumLabels: ['Technology', 'Design', 'Business']
      },
      publishDate: {
        type: 'datetime',
        title: 'Publish Date'
      },
      featured: {
        type: 'checkbox',
        title: 'Featured Post',
        default: false
      }
    }
  },

  managed: true
}
```

### Products (E-commerce)

```typescript
const productsCollection: CollectionConfig = {
  name: 'products',
  displayName: 'Products',

  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Product Name',
        required: true
      },
      sku: {
        type: 'string',
        title: 'SKU',
        required: true,
        pattern: '^[A-Z0-9-]+$'
      },
      price: {
        type: 'number',
        title: 'Price',
        required: true,
        min: 0
      },
      images: {
        type: 'array',
        title: 'Product Images',
        items: {
          type: 'media'
        }
      },
      specifications: {
        type: 'array',
        title: 'Specifications',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'string' }
          }
        }
      }
    }
  },

  managed: true
}
```

## CLI Commands

### Sync Collections Manually

```bash
npm run sync-collections
```

This command shows what collections will be synced. Collections are auto-synced on app startup, so this is mainly informational.

## How It Works

### 1. Automatic Sync on Startup

When your app starts, the bootstrap middleware:

1. Loads all `.collection.ts` files from `src/collections/`
2. Validates each configuration
3. Creates new collections or updates existing ones
4. Marks them as `managed = true` in the database
5. Locks them from editing in the admin UI

### 2. Config vs UI Collections

| Feature | Config-Managed | UI-Created |
|---------|----------------|------------|
| Defined in | TypeScript files | Admin UI |
| Version controlled | ✅ Yes | ❌ No |
| Auto-deployed | ✅ Yes | ❌ No |
| Can edit in UI | ❌ No (locked) | ✅ Yes |
| Type safety | ✅ Yes | ❌ No |
| Badge in UI | "Config" | None |

### 3. Migration Path

To convert a UI-created collection to config-managed:

1. Export the schema from the UI (or manually copy it)
2. Create a new `.collection.ts` file
3. Set `managed: true`
4. Restart the app - it will sync and lock the collection

## Best Practices

### 1. Naming Conventions

```typescript
// ✅ Good names
name: 'blog_posts'
name: 'team_members'
name: 'product_categories'

// ❌ Bad names
name: 'BlogPosts'    // No camelCase
name: 'blog-posts'   // No hyphens
name: 'bp'           // Not descriptive
```

### 2. Use Validation

```typescript
{
  email: {
    type: 'email',      // Built-in email validation
    required: true
  },
  age: {
    type: 'number',
    min: 0,
    max: 120            // Sensible limits
  },
  username: {
    type: 'string',
    pattern: '^[a-z0-9_]+$',  // Custom regex
    minLength: 3,
    maxLength: 20
  }
}
```

### 3. Provide Help Text

```typescript
{
  slug: {
    type: 'slug',
    title: 'URL Slug',
    description: 'URL-friendly identifier',
    helpText: 'Leave blank to auto-generate from title',
    placeholder: 'my-blog-post'
  }
}
```

### 4. Set Sensible Defaults

```typescript
{
  status: {
    type: 'select',
    enum: ['draft', 'published'],
    default: 'draft'    // Safe default
  },
  allowComments: {
    type: 'checkbox',
    default: true       // User-friendly default
  }
}
```

## Troubleshooting

### Collections Not Syncing

**Problem**: Collections aren't appearing in the database

**Solutions**:
1. Check the console logs during startup
2. Verify `.collection.ts` files export a default
3. Check file naming: must end with `.collection.ts`
4. Ensure the `collections` table exists (run migrations)

### TypeScript Errors

**Problem**: Import errors or type issues

**Solutions**:
1. Make sure you're importing from `../types/collection-config`
2. Check that your schema structure matches `CollectionConfig` type
3. Run `npm run build` to check for TypeScript errors

### Collection Locked in UI

**Problem**: Can't edit a collection in the admin UI

**Explanation**: This is by design! Config-managed collections are locked. To edit:
1. Update the `.collection.ts` file
2. Restart the app to sync changes
3. Or set `managed: false` if you want UI editing

## Advanced Usage

### Conditional Fields

```typescript
{
  showOnHomepage: {
    type: 'checkbox',
    title: 'Show on Homepage'
  },
  homepageOrder: {
    type: 'number',
    title: 'Homepage Order',
    dependsOn: 'showOnHomepage',  // Only show if checkbox is checked
    showWhen: true
  }
}
```

### Nested Objects

```typescript
{
  seo: {
    type: 'object',
    title: 'SEO Settings',
    properties: {
      metaTitle: {
        type: 'string',
        maxLength: 60
      },
      metaDescription: {
        type: 'textarea',
        maxLength: 160
      }
    }
  }
}
```

### Array of Objects

```typescript
{
  faqs: {
    type: 'array',
    title: 'FAQs',
    items: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        answer: { type: 'textarea' }
      }
    }
  }
}
```

## Migration Guide

### From UI-Only to Hybrid Approach

**Step 1**: Keep existing UI collections (they still work!)

**Step 2**: Create new collections as config files

**Step 3**: Gradually migrate important collections to config

**Step 4**: Enjoy version control and type safety!

## FAQ

**Q: Can I still create collections in the UI?**
A: Yes! UI-created collections work alongside config-managed ones.

**Q: What happens if I delete a .collection.ts file?**
A: The collection is marked as inactive, not deleted (data is safe).

**Q: Can I mix config and UI collections?**
A: Absolutely! They work seamlessly together.

**Q: How do I see which collections are config-managed?**
A: Look for the purple "Config" badge in `/admin/collections`.

**Q: Can I convert a config collection back to UI-managed?**
A: Yes, set `managed: false` in the config or delete the config file.

## Related Documentation

- [Collection Config Types](../src/types/collection-config.ts) - Full TypeScript definitions
- [Example Collections](../src/collections/) - Real-world examples
- [Collections README](../src/collections/README.md) - Quick reference

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/sonicjs-ai/issues
- Documentation: https://sonicjs.com/docs
