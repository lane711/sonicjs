import { Hono } from 'hono'
import { z } from 'zod'
import { Plugin } from '../types'
import { PluginBuilder, PluginHelpers } from '../sdk/plugin-builder'

const faqSchema = z.object({
  id: z.number().optional(),
  question: z.string().min(1, 'Question is required').max(500, 'Question must be under 500 characters'),
  answer: z.string().min(1, 'Answer is required').max(2000, 'Answer must be under 2000 characters'),
  category: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})

const faqMigration = `
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(isPublished);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sortOrder);

CREATE TRIGGER IF NOT EXISTS faqs_updated_at
  AFTER UPDATE ON faqs
BEGIN
  UPDATE faqs SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
`

const faqAPIRoutes = new Hono()

faqAPIRoutes.get('/', async (c) => {
  try {
    const { category, published } = c.req.query()
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    let query = 'SELECT * FROM faqs WHERE 1=1'
    const params: any[] = []

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    if (published !== undefined) {
      query += ' AND isPublished = ?'
      params.push(published === 'true' ? 1 : 0)
    }

    query += ' ORDER BY sortOrder ASC, created_at DESC'

    const { results } = await db.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      data: results
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch FAQs' 
    }, 500)
  }
})

faqAPIRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results } = await db.prepare('SELECT * FROM faqs WHERE id = ?').bind(id).all()
    
    if (!results || results.length === 0) {
      return c.json({ error: 'FAQ not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0]
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch FAQ' 
    }, 500)
  }
})

faqAPIRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = faqSchema.parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results } = await db.prepare(`
      INSERT INTO faqs (question, answer, category, tags, isPublished, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      validatedData.question,
      validatedData.answer,
      validatedData.category || null,
      validatedData.tags || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder
    ).all()

    return c.json({
      success: true,
      data: results?.[0],
      message: 'FAQ created successfully'
    }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed',
        details: error.errors 
      }, 400)
    }
    
    return c.json({ 
      success: false, 
      error: 'Failed to create FAQ' 
    }, 500)
  }
})

faqAPIRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validatedData = faqSchema.partial().parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const updateFields = []
    const updateValues = []

    if (validatedData.question !== undefined) {
      updateFields.push('question = ?')
      updateValues.push(validatedData.question)
    }
    if (validatedData.answer !== undefined) {
      updateFields.push('answer = ?')
      updateValues.push(validatedData.answer)
    }
    if (validatedData.category !== undefined) {
      updateFields.push('category = ?')
      updateValues.push(validatedData.category)
    }
    if (validatedData.tags !== undefined) {
      updateFields.push('tags = ?')
      updateValues.push(validatedData.tags)
    }
    if (validatedData.isPublished !== undefined) {
      updateFields.push('isPublished = ?')
      updateValues.push(validatedData.isPublished ? 1 : 0)
    }
    if (validatedData.sortOrder !== undefined) {
      updateFields.push('sortOrder = ?')
      updateValues.push(validatedData.sortOrder)
    }

    if (updateFields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400)
    }

    updateValues.push(id)

    const { results } = await db.prepare(`
      UPDATE faqs 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
      RETURNING *
    `).bind(...updateValues).all()

    if (!results || results.length === 0) {
      return c.json({ error: 'FAQ not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'FAQ updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed',
        details: error.errors 
      }, 400)
    }
    
    return c.json({ 
      success: false, 
      error: 'Failed to update FAQ' 
    }, 500)
  }
})

faqAPIRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { changes } = await db.prepare('DELETE FROM faqs WHERE id = ?').bind(id).run()

    if (changes === 0) {
      return c.json({ error: 'FAQ not found' }, 404)
    }

    return c.json({
      success: true,
      message: 'FAQ deleted successfully'
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to delete FAQ' 
    }, 500)
  }
})

export function createFAQPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'faq-plugin',
    version: '1.0.0',
    description: 'Frequently Asked Questions management plugin'
  })

  builder.metadata({
    author: {
      name: 'SonicJS',
      email: 'info@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^1.0.0'
  })

  builder.addModel('FAQ', {
    tableName: 'faqs',
    schema: faqSchema,
    migrations: [faqMigration]
  })

  builder.addRoute('/api/faq', faqAPIRoutes, {
    description: 'FAQ management API endpoints',
    requiresAuth: false
  })

  builder.addAdminPage('/faq', 'FAQ Management', 'FAQListView', {
    description: 'Manage frequently asked questions',
    icon: 'question-circle',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/faq/new', 'New FAQ', 'FAQFormView', {
    description: 'Create a new FAQ',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/faq/:id', 'Edit FAQ', 'FAQFormView', {
    description: 'Edit an existing FAQ',
    permissions: ['admin', 'editor']
  })

  builder.addMenuItem('FAQ', '/admin/faq', {
    icon: 'question-circle',
    order: 50,
    permissions: ['admin', 'editor']
  })

  builder.lifecycle({
    install: async (context) => {
      const { db } = context
      await db.prepare(faqMigration).run()
      console.log('FAQ plugin installed successfully')
    },
    uninstall: async (context) => {
      const { db } = context
      await db.prepare('DROP TABLE IF EXISTS faqs').run()
      console.log('FAQ plugin uninstalled successfully')
    },
    activate: async () => {
      console.log('FAQ plugin activated')
    },
    deactivate: async () => {
      console.log('FAQ plugin deactivated')
    }
  })

  return builder.build()
}

export const faqPlugin = createFAQPlugin()