import { Hono } from 'hono'
import { html } from 'hono/html'
import { renderCollectionsListPage } from '../templates/pages/admin-collections-list.template'
import { renderCollectionFormPage } from '../templates/pages/admin-collections-form.template'

// Type definitions for collections
interface Collection {
  id: string
  name: string
  display_name: string
  description?: string
  created_at: number
  formattedDate: string
  field_count?: number
  managed?: boolean
}

interface CollectionFormData {
  id?: string
  name?: string
  display_name?: string
  description?: string
  fields?: CollectionField[]
  isEdit?: boolean
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

interface CollectionField {
  id: string
  field_name: string
  field_type: string
  field_label: string
  field_options: any
  field_order: number
  is_required: boolean
  is_searchable: boolean
}

interface CollectionsListPageData {
  collections: Collection[]
  search?: string
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

type Bindings = {
  DB: D1Database
  CACHE_KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  ASSETS: Fetcher
  EMAIL_QUEUE?: Queue
  SENDGRID_API_KEY?: string
  DEFAULT_FROM_EMAIL?: string
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
  ENVIRONMENT?: string
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
  requestId?: string
  startTime?: number
  appVersion?: string
}

export const adminCollectionsRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Collections management - List all collections
adminCollectionsRoutes.get('/collections', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const url = new URL(c.req.url)
    const search = url.searchParams.get('search') || ''

    // Build query based on search
    let stmt
    let results
    if (search) {
      stmt = db.prepare(`
        SELECT id, name, display_name, description, created_at, managed
        FROM collections
        WHERE is_active = 1
        AND (name LIKE ? OR display_name LIKE ? OR description LIKE ?)
        ORDER BY created_at DESC
      `)
      const searchParam = `%${search}%`
      const queryResults = await stmt.bind(searchParam, searchParam, searchParam).all()
      results = queryResults.results
    } else {
      stmt = db.prepare('SELECT id, name, display_name, description, created_at, managed FROM collections WHERE is_active = 1 ORDER BY created_at DESC')
      const queryResults = await stmt.all()
      results = queryResults.results
    }

    // Fetch field counts for all collections
    const fieldCountStmt = db.prepare('SELECT collection_id, COUNT(*) as count FROM content_fields GROUP BY collection_id')
    const { results: fieldCountResults } = await fieldCountStmt.all()
    const fieldCounts = new Map((fieldCountResults || []).map((row: any) => [String(row.collection_id), Number(row.count)]))

    const collections: Collection[] = (results || [])
      .filter((row: any) => row && row.id)
      .map((row: any) => {
        return {
          id: String(row.id || ''),
          name: String(row.name || ''),
          display_name: String(row.display_name || ''),
          description: row.description ? String(row.description) : undefined,
          created_at: Number(row.created_at || 0),
          formattedDate: row.created_at ? new Date(Number(row.created_at)).toLocaleDateString() : 'Unknown',
          field_count: fieldCounts.get(String(row.id)) || 0,
          managed: row.managed === 1
        }
      })

    const pageData: CollectionsListPageData = {
      collections,
      search,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      version: c.get('appVersion')
    }

    return c.html(renderCollectionsListPage(pageData))
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.html(html`<p>Error loading collections</p>`)
  }
})

// New collection form
adminCollectionsRoutes.get('/collections/new', (c) => {
  const user = c.get('user')

  const formData: CollectionFormData = {
    isEdit: false,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    version: c.get('appVersion')
  }

  return c.html(renderCollectionFormPage(formData))
})

// Create collection
adminCollectionsRoutes.post('/collections', async (c) => {
  try {
    const formData = await c.req.formData()
    const name = formData.get('name') as string
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string

    // Check if this is an HTMX request
    const isHtmx = c.req.header('HX-Request') === 'true'

    // Basic validation
    if (!name || !displayName) {
      const errorMsg = 'Name and display name are required.'
      if (isHtmx) {
        return c.html(html`
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ${errorMsg}
          </div>
        `)
      } else {
        // For regular form submission, redirect back with error
        return c.redirect('/admin/collections/new')
      }
    }

    // Validate name format
    if (!/^[a-z0-9_]+$/.test(name)) {
      const errorMsg = 'Collection name must contain only lowercase letters, numbers, and underscores.'
      if (isHtmx) {
        return c.html(html`
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ${errorMsg}
          </div>
        `)
      } else {
        return c.redirect('/admin/collections/new')
      }
    }

    const db = c.env.DB

    // Check if collection already exists
    const existingStmt = db.prepare('SELECT id FROM collections WHERE name = ?')
    const existing = await existingStmt.bind(name).first()

    if (existing) {
      const errorMsg = 'A collection with this name already exists.'
      if (isHtmx) {
        return c.html(html`
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ${errorMsg}
          </div>
        `)
      } else {
        return c.redirect('/admin/collections/new')
      }
    }

    // Create basic schema for the collection
    const basicSchema = {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: "Title",
          required: true
        },
        content: {
          type: "string",
          title: "Content",
          format: "richtext"
        },
        status: {
          type: "string",
          title: "Status",
          enum: ["draft", "published", "archived"],
          default: "draft"
        }
      },
      required: ["title"]
    }

    // Create collection
    const collectionId = globalThis.crypto.randomUUID()
    const now = Date.now()

    const insertStmt = db.prepare(`
      INSERT INTO collections (id, name, display_name, description, schema, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    await insertStmt.bind(
      collectionId,
      name,
      displayName,
      description || null,
      JSON.stringify(basicSchema),
      1, // is_active
      now,
      now
    ).run()

    // Clear cache
    try {
      await c.env.CACHE_KV.delete('cache:collections:all')
      await c.env.CACHE_KV.delete(`cache:collection:${name}`)
    } catch (e) {
      console.error('Error clearing cache:', e)
    }

    if (isHtmx) {
      return c.html(html`
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Collection created successfully! Redirecting...
          <script>
            setTimeout(() => {
              window.location.href = '/admin/collections';
            }, 1500);
          </script>
        </div>
      `)
    } else {
      // For regular form submission, redirect to collections list
      return c.redirect('/admin/collections')
    }
  } catch (error) {
    console.error('Error creating collection:', error)
    const isHtmx = c.req.header('HX-Request') === 'true'

    if (isHtmx) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to create collection. Please try again.
        </div>
      `)
    } else {
      return c.redirect('/admin/collections/new')
    }
  }
})

// Edit collection form
adminCollectionsRoutes.get('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')
    const db = c.env.DB

    const stmt = db.prepare('SELECT * FROM collections WHERE id = ?')
    const collection = await stmt.bind(id).first() as any

    if (!collection) {
      const formData: CollectionFormData = {
        isEdit: true,
        error: 'Collection not found.',
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        version: c.get('appVersion')
      }
      return c.html(renderCollectionFormPage(formData))
    }

    // Get collection fields
    const fieldsStmt = db.prepare(`
      SELECT * FROM content_fields
      WHERE collection_id = ?
      ORDER BY field_order ASC
    `)
    const { results: fieldsResults } = await fieldsStmt.bind(id).all()
    const fields = (fieldsResults || []).map((row: any) => ({
      id: row.id,
      field_name: row.field_name,
      field_type: row.field_type,
      field_label: row.field_label,
      field_options: row.field_options ? JSON.parse(row.field_options) : {},
      field_order: row.field_order,
      is_required: row.is_required === 1,
      is_searchable: row.is_searchable === 1
    }))

    const formData: CollectionFormData = {
      id: collection.id,
      name: collection.name,
      display_name: collection.display_name,
      description: collection.description,
      fields: fields,
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      version: c.get('appVersion')
    }

    return c.html(renderCollectionFormPage(formData))
  } catch (error) {
    console.error('Error fetching collection:', error)
    const user = c.get('user')
    const formData: CollectionFormData = {
      isEdit: true,
      error: 'Failed to load collection.',
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      version: c.get('appVersion')
    }
    return c.html(renderCollectionFormPage(formData))
  }
})

// Update collection
adminCollectionsRoutes.put('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const formData = await c.req.formData()
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string

    if (!displayName) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Display name is required.
        </div>
      `)
    }

    const db = c.env.DB

    const updateStmt = db.prepare(`
      UPDATE collections
      SET display_name = ?, description = ?, updated_at = ?
      WHERE id = ?
    `)

    await updateStmt.bind(displayName, description || null, Date.now(), id).run()

    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Collection updated successfully!
      </div>
    `)
  } catch (error) {
    console.error('Error updating collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to update collection. Please try again.
      </div>
    `)
  }
})

// Delete collection
adminCollectionsRoutes.delete('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    // Check if collection has content
    const contentStmt = db.prepare('SELECT COUNT(*) as count FROM content WHERE collection_id = ?')
    const contentResult = await contentStmt.bind(id).first() as any

    if (contentResult && contentResult.count > 0) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Cannot delete collection: it contains ${contentResult.count} content item(s). Delete all content first.
        </div>
      `)
    }

    // Delete collection fields first
    const deleteFieldsStmt = db.prepare('DELETE FROM content_fields WHERE collection_id = ?')
    await deleteFieldsStmt.bind(id).run()

    // Delete collection
    const deleteStmt = db.prepare('DELETE FROM collections WHERE id = ?')
    await deleteStmt.bind(id).run()

    return c.html(html`
      <script>
        window.location.href = '/admin/collections';
      </script>
    `)
  } catch (error) {
    console.error('Error deleting collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to delete collection. Please try again.
      </div>
    `)
  }
})

// Add field to collection
adminCollectionsRoutes.post('/collections/:id/fields', async (c) => {
  try {
    const collectionId = c.req.param('id')
    const formData = await c.req.formData()
    const fieldName = formData.get('field_name') as string
    const fieldType = formData.get('field_type') as string
    const fieldLabel = formData.get('field_label') as string
    const isRequired = formData.get('is_required') === '1'
    const isSearchable = formData.get('is_searchable') === '1'
    const fieldOptions = formData.get('field_options') as string || '{}'

    if (!fieldName || !fieldType || !fieldLabel) {
      return c.json({ success: false, error: 'Field name, type, and label are required.' })
    }

    // Validate field name format
    if (!/^[a-z0-9_]+$/.test(fieldName)) {
      return c.json({ success: false, error: 'Field name must contain only lowercase letters, numbers, and underscores.' })
    }

    const db = c.env.DB

    // Check if field already exists
    const existingStmt = db.prepare('SELECT id FROM content_fields WHERE collection_id = ? AND field_name = ?')
    const existing = await existingStmt.bind(collectionId, fieldName).first()

    if (existing) {
      return c.json({ success: false, error: 'A field with this name already exists.' })
    }

    // Get next field order
    const orderStmt = db.prepare('SELECT MAX(field_order) as max_order FROM content_fields WHERE collection_id = ?')
    const orderResult = await orderStmt.bind(collectionId).first() as any
    const nextOrder = (orderResult?.max_order || 0) + 1

    // Create field
    const fieldId = globalThis.crypto.randomUUID()
    const now = Date.now()

    const insertStmt = db.prepare(`
      INSERT INTO content_fields (
        id, collection_id, field_name, field_type, field_label,
        field_options, field_order, is_required, is_searchable,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    await insertStmt.bind(
      fieldId,
      collectionId,
      fieldName,
      fieldType,
      fieldLabel,
      fieldOptions,
      nextOrder,
      isRequired ? 1 : 0,
      isSearchable ? 1 : 0,
      now,
      now
    ).run()

    return c.json({ success: true, fieldId })
  } catch (error) {
    console.error('Error adding field:', error)
    return c.json({ success: false, error: 'Failed to add field.' })
  }
})

// Update field
adminCollectionsRoutes.put('/collections/:collectionId/fields/:fieldId', async (c) => {
  try {
    const fieldId = c.req.param('fieldId')
    const formData = await c.req.formData()
    const fieldLabel = formData.get('field_label') as string
    const isRequired = formData.get('is_required') === '1'
    const isSearchable = formData.get('is_searchable') === '1'
    const fieldOptions = formData.get('field_options') as string || '{}'

    if (!fieldLabel) {
      return c.json({ success: false, error: 'Field label is required.' })
    }

    const db = c.env.DB

    const updateStmt = db.prepare(`
      UPDATE content_fields
      SET field_label = ?, field_options = ?, is_required = ?, is_searchable = ?, updated_at = ?
      WHERE id = ?
    `)

    await updateStmt.bind(fieldLabel, fieldOptions, isRequired ? 1 : 0, isSearchable ? 1 : 0, Date.now(), fieldId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating field:', error)
    return c.json({ success: false, error: 'Failed to update field.' })
  }
})

// Delete field
adminCollectionsRoutes.delete('/collections/:collectionId/fields/:fieldId', async (c) => {
  try {
    const fieldId = c.req.param('fieldId')
    const db = c.env.DB

    const deleteStmt = db.prepare('DELETE FROM content_fields WHERE id = ?')
    await deleteStmt.bind(fieldId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting field:', error)
    return c.json({ success: false, error: 'Failed to delete field.' })
  }
})

// Update field order
adminCollectionsRoutes.post('/collections/:collectionId/fields/reorder', async (c) => {
  try {
    const body = await c.req.json()
    const fieldIds = body.fieldIds as string[]

    if (!Array.isArray(fieldIds)) {
      return c.json({ success: false, error: 'Invalid field order data.' })
    }

    const db = c.env.DB

    // Update field order
    for (let i = 0; i < fieldIds.length; i++) {
      const updateStmt = db.prepare('UPDATE content_fields SET field_order = ?, updated_at = ? WHERE id = ?')
      await updateStmt.bind(i + 1, Date.now(), fieldIds[i]).run()
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error reordering fields:', error)
    return c.json({ success: false, error: 'Failed to reorder fields.' })
  }
})
