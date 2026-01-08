# SonicJS Field Types Reference Guide

**Version:** 2.3.x  
**Last Updated:** January 8, 2026  
**Purpose:** Complete reference for all field types and attributes available in SonicJS collections

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Text Fields](#text-fields)
3. [Rich Content Fields](#rich-content-fields)
4. [Numeric Fields](#numeric-fields)
5. [Date & Time Fields](#date--time-fields)
6. [Boolean Fields](#boolean-fields)
7. [Selection Fields](#selection-fields)
8. [Media & File Fields](#media--file-fields)
9. [Relationship Fields](#relationship-fields)
10. [Structured Data Fields](#structured-data-fields)
11. [Special Purpose Fields](#special-purpose-fields)
12. [Common Attributes](#common-attributes)
13. [Validation Options](#validation-options)
14. [Examples](#examples)

---

## Quick Reference

### All Available Field Types (30 Total)

```typescript
type FieldType =
  // Text Fields (7)
  | 'string'       // Single-line text
  | 'textarea'     // Multi-line plain text
  | 'email'        // Email with validation
  | 'url'          // URL with validation
  | 'slug'         // URL-friendly identifier
  | 'color'        // Color picker
  | 'richtext'     // WYSIWYG HTML editor
  | 'markdown'     // Markdown editor
  
  // Numeric Fields (1)
  | 'number'       // Integer or decimal numbers
  
  // Date/Time Fields (2)
  | 'date'         // Date picker (no time)
  | 'datetime'     // Date and time picker
  
  // Boolean Fields (2)
  | 'boolean'      // True/false value
  | 'checkbox'     // UI checkbox input
  
  // Selection Fields (3)
  | 'select'       // Dropdown (single choice)
  | 'multiselect'  // Dropdown (multiple choices)
  | 'radio'        // Radio buttons
  
  // Media Fields (2)
  | 'media'        // Image/video picker
  | 'file'         // File upload
  
  // Relationship Fields (1)
  | 'reference'    // Reference to another collection
  
  // Structured Data (3)
  | 'json'         // JSON data
  | 'array'        // Array of items
  | 'object'       // Nested object
```

---

## Text Fields

### 1. `string` - Single Line Text

**Best for:** Titles, names, short text

**Storage:** `VARCHAR(255)`

**Attributes:**
- `placeholder` (string): Placeholder text
- `maxLength` (number): Max character limit
- `minLength` (number): Min character limit
- `pattern` (string): Regex validation pattern
- `helpText` (string): Help text below field

**Example:**
```typescript
{
  type: 'string',
  title: 'Article Title',
  required: true,
  maxLength: 200,
  placeholder: 'Enter article title',
  helpText: 'Keep it short and descriptive'
}
```

**Use Cases:**
- Article titles
- Product names
- User names
- Short descriptions
- Tags and keywords

---

### 2. `textarea` - Multi-Line Text

**Best for:** Descriptions, notes, plain text content

**Storage:** `TEXT`

**Attributes:**
- `placeholder` (string): Placeholder text
- `maxLength` (number): Max character limit
- `rows` (number): Number of visible rows
- `cols` (number): Number of visible columns

**Example:**
```typescript
{
  type: 'textarea',
  title: 'Description',
  rows: 5,
  maxLength: 500,
  placeholder: 'Enter a detailed description'
}
```

**Use Cases:**
- Product descriptions
- Event details
- Notes and comments
- Plain text content

---

### 3. `email` - Email Address

**Best for:** Contact emails, user emails

**Storage:** `VARCHAR(255)`

**Built-in Validation:** Email format

**Attributes:**
- `placeholder` (string): Example email
- `helpText` (string): Help text

**Example:**
```typescript
{
  type: 'email',
  title: 'Contact Email',
  required: true,
  placeholder: 'user@example.com'
}
```

**Use Cases:**
- User email addresses
- Contact information
- Author emails
- Notification emails

---

### 4. `url` - Web URL

**Best for:** Links, external resources

**Storage:** `VARCHAR(500)`

**Built-in Validation:** URL format

**Attributes:**
- `placeholder` (string): Example URL
- `helpText` (string): Help text

**Example:**
```typescript
{
  type: 'url',
  title: 'Website',
  placeholder: 'https://example.com',
  helpText: 'Include http:// or https://'
}
```

**Use Cases:**
- External links
- Social media profiles
- Documentation links
- Resource URLs

---

### 5. `slug` - URL-Friendly Identifier

**Best for:** Page URLs, SEO paths

**Storage:** `VARCHAR(255)`

**Auto-Generation:** Can be auto-generated from title

**Validation:** Lowercase, hyphens, alphanumeric only

**Attributes:**
- `pattern` (string): Validation regex (default: `^[a-z0-9-]+$`)
- `autoGenerate` (boolean): Auto-generate from title
- `sourceField` (string): Field to generate from

**Example:**
```typescript
{
  type: 'slug',
  title: 'URL Slug',
  required: true,
  pattern: '^[a-z0-9-]+$',
  helpText: 'Auto-generated from title or enter manually'
}
```

**Use Cases:**
- Page URLs
- Product slugs
- Category identifiers
- Permalink paths

---

### 6. `color` - Color Picker

**Best for:** Theme colors, UI customization

**Storage:** `VARCHAR(7)` (hex format)

**Format:** `#RRGGBB`

**Attributes:**
- `default` (string): Default color value
- `format` (string): 'hex' | 'rgb' | 'rgba'

**Example:**
```typescript
{
  type: 'color',
  title: 'Brand Color',
  default: '#3B82F6',
  helpText: 'Choose your brand color'
}
```

**Use Cases:**
- Theme customization
- Brand colors
- UI element colors
- Status indicators

---

## Rich Content Fields

### 7. `richtext` - WYSIWYG HTML Editor

**Best for:** Formatted content, blog posts, articles

**Storage:** `TEXT` or `LONGTEXT`

**Editor:** TinyMCE or similar

**Requires:** External JavaScript library

**Attributes:**
- `height` (number): Editor height in pixels (default: 300)
- `toolbar` (string): 'simple' | 'full' (default: 'full')
- `allowImages` (boolean): Allow image insertion
- `allowTables` (boolean): Allow table insertion
- `allowLinks` (boolean): Allow hyperlinks

**Example:**
```typescript
{
  type: 'richtext',
  title: 'Article Content',
  required: true,
  height: 400,
  toolbar: 'full',
  allowImages: true,
  helpText: 'Enter your article content with formatting'
}
```

**Use Cases:**
- Blog posts and articles
- Product descriptions
- About pages
- Email templates
- Documentation

**Supported Formatting:**
- Bold, italic, underline
- Headings (H1-H6)
- Lists (ordered/unordered)
- Links and images
- Tables
- Code blocks

---

### 8. `markdown` - Markdown Editor

**Best for:** Technical documentation, developer content

**Storage:** `TEXT`

**Output:** Rendered HTML

**Attributes:**
- `height` (number): Editor height
- `preview` (boolean): Show live preview
- `syntax` (boolean): Enable syntax highlighting

**Example:**
```typescript
{
  type: 'markdown',
  title: 'Documentation',
  height: 500,
  preview: true,
  syntax: true
}
```

**Use Cases:**
- Technical documentation
- README files
- Developer blogs
- Code-heavy content
- GitHub-style content

---

## Numeric Fields

### 9. `number` - Numeric Input

**Best for:** Prices, quantities, ratings, measurements

**Storage:** `DECIMAL(10,2)` or `INTEGER`

**Attributes:**
- `min` (number): Minimum value
- `max` (number): Maximum value
- `step` (number): Increment step (default: 1)
- `placeholder` (string): Placeholder text
- `precision` (number): Decimal places (for decimals)

**Example:**
```typescript
{
  type: 'number',
  title: 'Price',
  min: 0,
  max: 99999.99,
  step: 0.01,
  placeholder: '0.00',
  helpText: 'Enter price in USD'
}
```

**Use Cases:**
- Product prices
- Quantities and inventory
- Ratings and scores
- Measurements
- Age and years
- Order numbers

---

## Date & Time Fields

### 10. `date` - Date Picker

**Best for:** Birthdays, deadlines, events

**Storage:** `DATE`

**Format:** ISO 8601 date (YYYY-MM-DD)

**Attributes:**
- `min` (string): Minimum date
- `max` (string): Maximum date
- `default` (string): Default date ('today' | ISO date)

**Example:**
```typescript
{
  type: 'date',
  title: 'Publish Date',
  default: 'today',
  helpText: 'When should this be published?'
}
```

**Use Cases:**
- Publish/expire dates
- Event dates
- Birthdays
- Deadlines
- Historical dates

---

### 11. `datetime` - Date and Time Picker

**Best for:** Scheduled events, timestamps

**Storage:** `DATETIME`

**Format:** ISO 8601 datetime

**Attributes:**
- `min` (string): Minimum datetime
- `max` (string): Maximum datetime
- `default` (string): Default datetime
- `timezone` (string): Timezone handling

**Example:**
```typescript
{
  type: 'datetime',
  title: 'Event Start Time',
  required: true,
  timezone: 'UTC'
}
```

**Use Cases:**
- Event start/end times
- Appointment scheduling
- Content embargo times
- Audit timestamps
- Scheduled tasks

---

## Boolean Fields

### 12. `boolean` - True/False Value

**Best for:** Feature flags, status indicators

**Storage:** `BOOLEAN` or `INTEGER(1)`

**Attributes:**
- `default` (boolean): Default value
- `trueLabel` (string): Label for true (default: 'Yes')
- `falseLabel` (string): Label for false (default: 'No')

**Example:**
```typescript
{
  type: 'boolean',
  title: 'Published',
  default: false,
  trueLabel: 'Published',
  falseLabel: 'Draft'
}
```

**Use Cases:**
- Published/draft status
- Feature toggles
- Visibility flags
- Active/inactive status

---

### 13. `checkbox` - Checkbox Input

**Best for:** User agreements, feature toggles

**Storage:** `BOOLEAN`

**Attributes:**
- `default` (boolean): Default checked state
- `label` (string): Checkbox label text

**Example:**
```typescript
{
  type: 'checkbox',
  title: 'Featured',
  label: 'Mark as featured content',
  default: false
}
```

**Use Cases:**
- Featured content flags
- Newsletter subscriptions
- Terms acceptance
- Privacy settings

---

## Selection Fields

### 14. `select` - Dropdown (Single Choice)

**Best for:** Categories, status fields, single selections

**Storage:** `VARCHAR(100)`

**Attributes:**
- `enum` (string[]): Array of valid values (**required**)
- `enumLabels` (string[]): Display labels for values
- `default` (string): Default selected value
- `placeholder` (string): Placeholder text

**Example:**
```typescript
{
  type: 'select',
  title: 'Status',
  enum: ['draft', 'review', 'published', 'archived'],
  enumLabels: ['Draft', 'In Review', 'Published', 'Archived'],
  default: 'draft',
  required: true
}
```

**Use Cases:**
- Content status
- Categories
- Priority levels
- User roles
- Visibility settings

---

### 15. `multiselect` - Multiple Choice Dropdown

**Best for:** Tags, multiple categories

**Storage:** `JSON` (array of selected values)

**Attributes:**
- `enum` (string[]): Array of valid values (**required**)
- `enumLabels` (string[]): Display labels
- `min` (number): Minimum selections required
- `max` (number): Maximum selections allowed

**Example:**
```typescript
{
  type: 'multiselect',
  title: 'Tags',
  enum: ['javascript', 'typescript', 'react', 'vue', 'node'],
  enumLabels: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js'],
  max: 5
}
```

**Use Cases:**
- Tags and labels
- Multiple categories
- Skills and interests
- Features and options

---

### 16. `radio` - Radio Buttons

**Best for:** Small set of mutually exclusive options

**Storage:** `VARCHAR(100)`

**Attributes:**
- `enum` (string[]): Array of valid values (**required**)
- `enumLabels` (string[]): Display labels
- `default` (string): Default selected value
- `orientation` (string): 'horizontal' | 'vertical'

**Example:**
```typescript
{
  type: 'radio',
  title: 'Visibility',
  enum: ['public', 'private', 'unlisted'],
  enumLabels: ['Public', 'Private', 'Unlisted'],
  default: 'public',
  orientation: 'vertical'
}
```

**Use Cases:**
- Content visibility
- Yes/No/Maybe choices
- Priority levels
- Alignment options

---

## Media & File Fields

### 17. `media` - Image/Video Picker

**Best for:** Featured images, avatars, gallery images

**Storage:** Reference to media ID or URL

**Integration:** Connects to Media Manager

**Attributes:**
- `accept` (string): MIME types (e.g., 'image/*', 'video/*')
- `maxSize` (number): Max file size in bytes
- `multiple` (boolean): Allow multiple files
- `crop` (boolean): Enable image cropping
- `aspectRatio` (string): Crop aspect ratio (e.g., '16:9', '1:1')

**Example:**
```typescript
{
  type: 'media',
  title: 'Featured Image',
  accept: 'image/*',
  maxSize: 5242880, // 5MB
  crop: true,
  aspectRatio: '16:9'
}
```

**Use Cases:**
- Featured images
- Avatar/profile pictures
- Product images
- Gallery images
- Video content

---

### 18. `file` - File Upload

**Best for:** Documents, downloads, attachments

**Storage:** File path or blob reference

**Attributes:**
- `accept` (string): Allowed file types
- `maxSize` (number): Max file size in bytes
- `multiple` (boolean): Allow multiple files

**Example:**
```typescript
{
  type: 'file',
  title: 'Download File',
  accept: '.pdf,.doc,.docx',
  maxSize: 10485760, // 10MB
  helpText: 'Upload PDF or Word document'
}
```

**Use Cases:**
- PDF downloads
- Document attachments
- Resource files
- Data imports

---

## Relationship Fields

### 19. `reference` - Reference to Another Collection

**Best for:** Relationships between content types

**Storage:** Foreign key (UUID or ID)

**Attributes:**
- `collection` (string): Referenced collection name (**required**)
- `displayField` (string): Field to display in picker
- `multiple` (boolean): Allow multiple references
- `filters` (object): Filter referenced items

**Example:**
```typescript
{
  type: 'reference',
  title: 'Author',
  collection: 'users',
  displayField: 'name',
  required: true,
  helpText: 'Select the author of this article'
}
```

**Use Cases:**
- Author references
- Category relationships
- Related products
- Parent/child hierarchies
- Many-to-many relationships

---

## Structured Data Fields

### 20. `json` - JSON Data

**Best for:** API responses, configuration, structured data

**Storage:** `JSON` or `TEXT`

**Attributes:**
- `schema` (object): JSON schema for validation
- `editor` (string): 'code' | 'visual'
- `format` (boolean): Auto-format JSON

**Example:**
```typescript
{
  type: 'json',
  title: 'Metadata',
  editor: 'code',
  format: true,
  helpText: 'Enter valid JSON'
}
```

**Use Cases:**
- API responses
- Configuration data
- Metadata
- Custom fields
- Translation data

---

### 21. `array` - Array of Items

**Best for:** Repeating groups, lists

**Storage:** `JSON`

**Attributes:**
- `items` (FieldConfig): Schema for array items (**required**)
- `min` (number): Minimum items
- `max` (number): Maximum items
- `uniqueItems` (boolean): Require unique values

**Example:**
```typescript
{
  type: 'array',
  title: 'Features',
  items: {
    type: 'string',
    maxLength: 100
  },
  min: 1,
  max: 10,
  helpText: 'List product features'
}
```

**Use Cases:**
- Product features
- FAQ items
- Gallery items
- Team members
- Testimonials

---

### 22. `object` - Nested Object

**Best for:** Grouped fields, complex structures

**Storage:** `JSON`

**Attributes:**
- `properties` (Record<string, FieldConfig>): Object schema (**required**)

**Example:**
```typescript
{
  type: 'object',
  title: 'Address',
  properties: {
    street: { type: 'string', title: 'Street' },
    city: { type: 'string', title: 'City' },
    zip: { type: 'string', title: 'ZIP Code' },
    country: { type: 'string', title: 'Country' }
  }
}
```

**Use Cases:**
- Address information
- Contact details
- Location data
- Grouped settings

---

## Common Attributes

All field types support these base attributes:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `type` | FieldType | Field type | **Required** |
| `title` | string | Display label | Field name |
| `description` | string | Field description | undefined |
| `required` | boolean | Is field required? | false |
| `default` | any | Default value | undefined |
| `placeholder` | string | Placeholder text | undefined |
| `helpText` | string | Help text below field | undefined |
| `widget` | string | UI widget to use | Auto |
| `format` | string | Display format hint | undefined |
| `dependsOn` | string | Conditional display | undefined |
| `showWhen` | any | Show condition | undefined |

---

## Validation Options

### String Validation
- `minLength` (number): Minimum characters
- `maxLength` (number): Maximum characters
- `pattern` (string): Regex pattern

### Numeric Validation
- `min` (number): Minimum value
- `max` (number): Maximum value
- `step` (number): Increment step

### Date Validation
- `min` (string): Earliest date/time
- `max` (string): Latest date/time

### Selection Validation
- `enum` (array): Valid options
- `uniqueItems` (boolean): No duplicates (for arrays)

### Array/Object Validation
- `min` (number): Minimum items
- `max` (number): Maximum items

---

## Examples

### Example 1: Blog Post Collection

```typescript
{
  name: 'blog_posts',
  displayName: 'Blog Posts',
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
        pattern: '^[a-z0-9-]+$'
      },
      author: {
        type: 'reference',
        title: 'Author',
        collection: 'users',
        displayField: 'name',
        required: true
      },
      content: {
        type: 'richtext',
        title: 'Content',
        required: true,
        height: 500
      },
      excerpt: {
        type: 'textarea',
        title: 'Excerpt',
        maxLength: 300,
        rows: 3
      },
      featured_image: {
        type: 'media',
        title: 'Featured Image',
        accept: 'image/*',
        aspectRatio: '16:9'
      },
      tags: {
        type: 'multiselect',
        title: 'Tags',
        enum: ['tech', 'business', 'lifestyle', 'travel'],
        max: 5
      },
      status: {
        type: 'select',
        title: 'Status',
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        required: true
      },
      publish_date: {
        type: 'datetime',
        title: 'Publish Date',
        required: true
      }
    }
  }
}
```

### Example 2: Product Collection

```typescript
{
  name: 'products',
  displayName: 'Products',
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Product Name',
        required: true,
        maxLength: 150
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
        min: 0,
        step: 0.01,
        required: true
      },
      description: {
        type: 'richtext',
        title: 'Description',
        height: 300
      },
      features: {
        type: 'array',
        title: 'Features',
        items: { type: 'string', maxLength: 100 },
        max: 10
      },
      images: {
        type: 'media',
        title: 'Product Images',
        accept: 'image/*',
        multiple: true
      },
      category: {
        type: 'reference',
        title: 'Category',
        collection: 'categories',
        displayField: 'name'
      },
      in_stock: {
        type: 'boolean',
        title: 'In Stock',
        default: true
      },
      specifications: {
        type: 'object',
        title: 'Specifications',
        properties: {
          weight: { type: 'number', title: 'Weight (kg)' },
          dimensions: { type: 'string', title: 'Dimensions (cm)' },
          material: { type: 'string', title: 'Material' }
        }
      }
    }
  }
}
```

---

---

## Collection Configuration Options

Beyond fields, collections support additional configuration:

### Display Configuration

```typescript
{
  name: 'blog_posts',
  displayName: 'Blog Posts',
  description: 'Articles and blog content',
  icon: '📝',  // Emoji or icon name for UI
  color: '#3B82F6',  // Hex color code
  
  // Fields shown in list view
  listFields: ['title', 'author', 'publishDate', 'status'],
  
  // Fields included in search
  searchFields: ['title', 'excerpt', 'content'],
  
  // Default sorting
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc',  // 'asc' or 'desc'
  
  // Management flags
  managed: true,     // If true, collection is code-managed (read-only in admin UI)
  isActive: true,    // If collection is active
  
  // Additional metadata
  metadata: {
    category: 'content',
    version: '1.0.0'
  }
}
```

### Collection Types: UI vs Code

**Code-Based Collections** (`managed: true`):
- ✅ Defined in `.collection.ts` files
- ✅ Version controlled with git
- ✅ Automatically synced on startup
- ✅ Read-only in admin UI (marked with "Config" badge)
- ✅ Full TypeScript support with IDE autocomplete
- ✅ Best for: Production apps, teams, CI/CD

**UI-Created Collections** (`managed: false`):
- ✅ Created through admin interface
- ✅ Stored directly in database
- ✅ Fully editable in UI
- ✅ No code or deployment required
- ✅ Best for: Prototyping, non-developers, quick iterations

**Migration Path**: Start with UI for prototyping, then convert to code for production by exporting schema JSON and creating a `.collection.ts` file.

---

## Automatic API Endpoints

Every collection automatically gets REST API endpoints:

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/collections/{collection}/content` | Get all content from collection |
| `GET` | `/api/content/{id}` | Get single content item by ID |

### Admin Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/content` | Create new content item |
| `PUT` | `/admin/content/{id}` | Update existing content item |
| `DELETE` | `/admin/content/{id}` | Delete content item |

### Example API Usage

```javascript
// Get all blog posts
const response = await fetch('/api/collections/blog_posts/content')
const posts = await response.json()

// Get single post
const post = await fetch('/api/content/abc123')
const data = await post.json()

// Create new post (requires authentication)
const newPost = await fetch('/admin/content', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    collection_id: 'blog_posts',
    title: 'My New Post',
    content: 'Post content here...'
  })
})
```

---

## Database Queries

Collections are stored in a unified `content` table. Use Drizzle ORM for type-safe queries:

### Basic Queries

```typescript
import { db } from '@sonicjs-cms/core'
import { content } from '@sonicjs-cms/core/db/schema'
import { eq, and, desc, like } from 'drizzle-orm'

// Get all posts
const posts = await db.select()
  .from(content)
  .where(eq(content.collection_id, 'blog_posts'))
  .orderBy(desc(content.created_at))
  .limit(10)

// Get single post
const post = await db.select()
  .from(content)
  .where(eq(content.id, postId))
  .get()

// Search posts
const results = await db.select()
  .from(content)
  .where(
    and(
      eq(content.collection_id, 'blog_posts'),
      like(content.title, '%search%')
    )
  )
  .all()

// Filter by status
const published = await db.select()
  .from(content)
  .where(
    and(
      eq(content.collection_id, 'blog_posts'),
      eq(content.data.status, 'published')  // JSON field query
    )
  )
  .all()
```

### Performance Tips

1. **Limit listFields**: Only show essential fields in list views
   ```typescript
   listFields: ['title', 'status']  // Not all 20 fields
   ```

2. **Index Frequently Queried Fields**: Add database indexes for fields you query often
   ```sql
   CREATE INDEX idx_content_collection_status 
   ON content(collection_id, json_extract(data, '$.status'))
   ```

3. **Use Appropriate Types**: `select` with `enum` is faster than free-text `string`
   ```typescript
   // Good: Limited options, indexed efficiently
   status: { type: 'select', enum: ['draft', 'published'] }
   
   // Avoid for fixed options
   status: { type: 'string' }  // Allows any value, harder to query
   ```

---

## Field Editor Plugins

**Important**: Rich text editors require their respective plugins to be active:

| Field Type | Required Plugin | Status |
|------------|----------------|---------|
| `richtext` | TinyMCE Editor | Must be active |
| `markdown` | EasyMDE Editor | Must be active |
| JSON editors | Quill Editor (optional) | Optional |

**For UI-Created Collections**: Only field types with active editor plugins will be available in the field type dropdown.

**For Code-Based Collections**: All field types are available regardless of plugin status, but editors won't render if plugins are inactive.

To activate editor plugins:
1. Go to `/admin/plugins`
2. Find the editor plugin (TinyMCE, EasyMDE, etc.)
3. Click "Activate"
4. Restart your application

---

## Best Practices

### Collection Design

1. **Choose the Right Type**: Use the most specific field type for your data
   - ❌ Don't use `string` for dates
   - ✅ Use `date` or `datetime` for proper validation and UI

2. **Add Validation**: Always add appropriate validation (required, min/max, pattern)
   ```typescript
   title: {
     type: 'string',
     required: true,        // Don't allow empty
     minLength: 3,          // Meaningful minimum
     maxLength: 200,        // Prevent abuse
     helpText: 'Required'   // Clear guidance
   }
   ```

3. **Provide Help Text**: Include helpful descriptions and examples
   ```typescript
   slug: {
     type: 'slug',
     helpText: 'Auto-generated from title, or enter manually (lowercase, hyphens only)'
   }
   ```

4. **Set Sensible Defaults**: Provide default values where appropriate
   ```typescript
   status: {
     type: 'select',
     enum: ['draft', 'published'],
     default: 'draft'  // Safe default for new content
   }
   ```

5. **Use References**: Connect related content with reference fields instead of duplicating data
   ```typescript
   author: {
     type: 'reference',
     collection: 'users',
     displayField: 'name'
   }
   ```

6. **Plan for Scale**: Consider array/object limits for performance
   ```typescript
   tags: {
     type: 'array',
     max: 10  // Prevent unlimited growth
   }
   ```

7. **Test Thoroughly**: Validate your schema with real data before production

### Performance Considerations

1. **Limit List Fields**: Don't display all fields in list views
   ```typescript
   listFields: ['title', 'author', 'status']  // Essential only
   ```

2. **Enable Search Selectively**: Only index fields users will actually search
   ```typescript
   searchFields: ['title', 'content']  // Not images, metadata, etc.
   ```

3. **Use Pagination**: Always limit results when querying
   ```typescript
   .limit(50)  // Don't load all records at once
   ```

4. **Cache Frequently Accessed Data**: Use SonicJS's built-in caching for popular content

---

## Troubleshooting

### Common Issues

**Issue**: Field type not available in UI dropdown  
**Solution**: Activate the required editor plugin (TinyMCE, EasyMDE, etc.)

**Issue**: Collection not syncing from code  
**Solution**: Check `managed: true` is set and restart server

**Issue**: Validation not working  
**Solution**: Ensure validation rules are in schema, not just in TypeScript type hints

**Issue**: Performance problems with large collections  
**Solution**: Add database indexes, limit listFields, enable caching

**Issue**: Reference field showing IDs instead of names  
**Solution**: Set `displayField` to the field you want to show (e.g., 'name', 'title')

---

## Additional Resources

### Official Documentation
- **Collections Overview**: https://sonicjs.com/collections
- **API Reference**: https://sonicjs.com/api-reference
- **Database Guide**: https://sonicjs.com/database

### Code References
- **Type Definitions**: `packages/core/src/types/collection-config.ts`
- **Internal Docs**: `docs/collections-config.md`
- **Test Examples**: `packages/core/src/__tests__/utils/collections.fixtures.ts`
- **Field UI Templates**: `packages/core/src/templates/pages/admin-field-types.template.ts`

### Community
- **GitHub**: https://github.com/lane711/sonicjs
- **Discord**: Join the SonicJS Discord server
- **Twitter**: Follow @sonicjscms for updates

---

**Questions or Issues?**  
Refer to the [official SonicJS documentation](https://sonicjs.com) or raise an issue on [GitHub](https://github.com/lane711/sonicjs/issues).
