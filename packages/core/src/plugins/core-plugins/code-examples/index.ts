import { Hono } from 'hono'
import { z } from 'zod'
import { Plugin } from '@sonicjs-cms/core'
import { PluginBuilder } from '../../sdk/plugin-builder'

const codeExampleSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  category: z.string().max(50, 'Category must be under 50 characters').optional(),
  tags: z.string().max(200, 'Tags must be under 200 characters').optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})

const codeExampleMigration = `
CREATE TABLE IF NOT EXISTS code_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_code_examples_published ON code_examples(isPublished);
CREATE INDEX IF NOT EXISTS idx_code_examples_sort_order ON code_examples(sortOrder);
CREATE INDEX IF NOT EXISTS idx_code_examples_language ON code_examples(language);
CREATE INDEX IF NOT EXISTS idx_code_examples_category ON code_examples(category);

CREATE TRIGGER IF NOT EXISTS code_examples_updated_at
  AFTER UPDATE ON code_examples
BEGIN
  UPDATE code_examples SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
`

const codeExampleAPIRoutes = new Hono()

codeExampleAPIRoutes.get('/', async (c) => {
  try {
    const { published, language, category } = c.req.query()
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    let query = 'SELECT * FROM code_examples WHERE 1=1'
    const params: any[] = []

    if (published !== undefined) {
      query += ' AND isPublished = ?'
      params.push(published === 'true' ? 1 : 0)
    }

    if (language) {
      query += ' AND language = ?'
      params.push(language)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category)
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
      error: 'Failed to fetch code examples'
    }, 500)
  }
})

codeExampleAPIRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results } = await db.prepare('SELECT * FROM code_examples WHERE id = ?').bind(id).all()

    if (!results || results.length === 0) {
      return c.json({ error: 'Code example not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0]
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch code example'
    }, 500)
  }
})

codeExampleAPIRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = codeExampleSchema.parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results } = await db.prepare(`
      INSERT INTO code_examples (title, description, code, language, category, tags, isPublished, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      validatedData.title,
      validatedData.description || null,
      validatedData.code,
      validatedData.language,
      validatedData.category || null,
      validatedData.tags || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder
    ).all()

    return c.json({
      success: true,
      data: results?.[0],
      message: 'Code example created successfully'
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
      error: 'Failed to create code example'
    }, 500)
  }
})

codeExampleAPIRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validatedData = codeExampleSchema.partial().parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const updateFields = []
    const updateValues = []

    if (validatedData.title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(validatedData.title)
    }
    if (validatedData.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(validatedData.description)
    }
    if (validatedData.code !== undefined) {
      updateFields.push('code = ?')
      updateValues.push(validatedData.code)
    }
    if (validatedData.language !== undefined) {
      updateFields.push('language = ?')
      updateValues.push(validatedData.language)
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
      UPDATE code_examples
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
    `).bind(...updateValues).all()

    if (!results || results.length === 0) {
      return c.json({ error: 'Code example not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Code example updated successfully'
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
      error: 'Failed to update code example'
    }, 500)
  }
})

codeExampleAPIRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { changes } = await db.prepare('DELETE FROM code_examples WHERE id = ?').bind(id).run()

    if (changes === 0) {
      return c.json({ error: 'Code example not found' }, 404)
    }

    return c.json({
      success: true,
      message: 'Code example deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete code example'
    }, 500)
  }
})

export function createCodeExamplesPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'code-examples-plugin',
    version: '1.0.0-beta.1',
    description: 'Code examples and snippets management plugin'
  })

  builder.metadata({
    author: {
      name: 'SonicJS',
      email: 'info@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^1.0.0'
  })

  builder.addModel('CodeExample', {
    tableName: 'code_examples',
    schema: codeExampleSchema,
    migrations: [codeExampleMigration]
  })

  builder.addRoute('/api/code-examples', codeExampleAPIRoutes, {
    description: 'Code Examples API endpoints',
    requiresAuth: false
  })

  builder.addAdminPage('/code-examples', 'Code Examples', 'CodeExamplesListView', {
    description: 'Manage code snippets and examples',
    icon: 'code',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/code-examples/new', 'New Code Example', 'CodeExamplesFormView', {
    description: 'Create a new code example',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/code-examples/:id', 'Edit Code Example', 'CodeExamplesFormView', {
    description: 'Edit an existing code example',
    permissions: ['admin', 'editor']
  })

  builder.addMenuItem('Code Examples', '/admin/code-examples', {
    icon: 'code',
    order: 65,
    permissions: ['admin', 'editor']
  })

  builder.lifecycle({
    install: async (context) => {
      const { db } = context
      await db.prepare(codeExampleMigration).run()
      console.log('Code Examples plugin installed successfully')
    },
    uninstall: async (context) => {
      const { db } = context
      await db.prepare('DROP TABLE IF EXISTS code_examples').run()
      console.log('Code Examples plugin uninstalled successfully')
    },
    activate: async () => {
      console.log('Code Examples plugin activated')
    },
    deactivate: async () => {
      console.log('Code Examples plugin deactivated')
    }
  })

  return builder.build() as Plugin
}

export const codeExamplesPlugin = createCodeExamplesPlugin()
