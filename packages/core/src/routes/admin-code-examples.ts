import { Hono } from 'hono'
import { z } from 'zod'
import { renderCodeExamplesList } from '../templates/pages/admin-code-examples-list.template'
import { renderCodeExamplesForm } from '../templates/pages/admin-code-examples-form.template'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

const codeExampleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  category: z.string().max(50, 'Category must be under 50 characters').optional(),
  tags: z.string().max(200, 'Tags must be under 200 characters').optional(),
  isPublished: z.string().transform(val => val === 'true'),
  sortOrder: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0))
})

const adminCodeExamplesRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminCodeExamplesRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { published, language, search, page = '1' } = c.req.query()
    const currentPage = parseInt(page, 10) || 1
    const limit = 20
    const offset = (currentPage - 1) * limit

    const db = (c as any).env?.DB
    if (!db) {
      return c.html(renderCodeExamplesList({
        codeExamples: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Database not available',
        messageType: 'error'
      }))
    }

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (published !== undefined) {
      whereClause += ' AND isPublished = ?'
      params.push(published === 'true' ? 1 : 0)
    }

    if (language) {
      whereClause += ' AND language = ?'
      params.push(language)
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ? OR code LIKE ? OR tags LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    const countQuery = `SELECT COUNT(*) as count FROM code_examples ${whereClause}`
    const { results: countResults } = await db.prepare(countQuery).bind(...params).all()
    const totalCount = countResults?.[0]?.count || 0

    const dataQuery = `
      SELECT * FROM code_examples
      ${whereClause}
      ORDER BY sortOrder ASC, created_at DESC
      LIMIT ? OFFSET ?
    `
    const { results: codeExamples } = await db.prepare(dataQuery).bind(...params, limit, offset).all()

    const totalPages = Math.ceil(totalCount / limit)

    return c.html(renderCodeExamplesList({
      codeExamples: codeExamples || [],
      totalCount,
      currentPage,
      totalPages,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching code examples:', error)
    const user = c.get('user')
    return c.html(renderCodeExamplesList({
      codeExamples: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load code examples',
      messageType: 'error'
    }))
  }
})

adminCodeExamplesRoutes.get('/new', async (c) => {
  const user = c.get('user')
  return c.html(renderCodeExamplesForm({
    isEdit: false,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }))
})

adminCodeExamplesRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())

    const validatedData = codeExampleSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderCodeExamplesForm({
        isEdit: false,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Database not available',
        messageType: 'error'
      }))
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

    if (results && results.length > 0) {
      return c.redirect('/admin/code-examples?message=Code example created successfully')
    } else {
      return c.html(renderCodeExamplesForm({
        isEdit: false,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Failed to create code example',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error creating code example:', error)
    const user = c.get('user')

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.issues.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })

      return c.html(renderCodeExamplesForm({
        isEdit: false,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        errors,
        message: 'Please correct the errors below',
        messageType: 'error'
      }))
    }

    return c.html(renderCodeExamplesForm({
      isEdit: false,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to create code example',
      messageType: 'error'
    }))
  }
})

adminCodeExamplesRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderCodeExamplesForm({
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Database not available',
        messageType: 'error'
      }))
    }

    const { results } = await db.prepare('SELECT * FROM code_examples WHERE id = ?').bind(id).all()

    if (!results || results.length === 0) {
      return c.redirect('/admin/code-examples?message=Code example not found&type=error')
    }

    const example = results[0] as any

    return c.html(renderCodeExamplesForm({
      codeExample: {
        id: example.id,
        title: example.title,
        description: example.description,
        code: example.code,
        language: example.language,
        category: example.category,
        tags: example.tags,
        isPublished: Boolean(example.isPublished),
        sortOrder: example.sortOrder
      },
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching code example:', error)
    const user = c.get('user')
    return c.html(renderCodeExamplesForm({
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load code example',
      messageType: 'error'
    }))
  }
})

adminCodeExamplesRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())

    const validatedData = codeExampleSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderCodeExamplesForm({
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Database not available',
        messageType: 'error'
      }))
    }

    const { results } = await db.prepare(`
      UPDATE code_examples
      SET title = ?, description = ?, code = ?, language = ?, category = ?, tags = ?, isPublished = ?, sortOrder = ?
      WHERE id = ?
      RETURNING *
    `).bind(
      validatedData.title,
      validatedData.description || null,
      validatedData.code,
      validatedData.language,
      validatedData.category || null,
      validatedData.tags || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder,
      id
    ).all()

    if (results && results.length > 0) {
      return c.redirect('/admin/code-examples?message=Code example updated successfully')
    } else {
      return c.html(renderCodeExamplesForm({
        codeExample: {
          id,
          title: validatedData.title,
          description: validatedData.description,
          code: validatedData.code,
          language: validatedData.language,
          category: validatedData.category,
          tags: validatedData.tags,
          isPublished: validatedData.isPublished,
          sortOrder: validatedData.sortOrder
        },
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Code example not found',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error updating code example:', error)
    const user = c.get('user')
    const id = parseInt(c.req.param('id'))

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.issues.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })

      return c.html(renderCodeExamplesForm({
        codeExample: {
          id,
          title: '',
          description: '',
          code: '',
          language: '',
          category: '',
          tags: '',
          isPublished: true,
          sortOrder: 0
        },
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        errors,
        message: 'Please correct the errors below',
        messageType: 'error'
      }))
    }

    return c.html(renderCodeExamplesForm({
      codeExample: {
        id,
        title: '',
        description: '',
        code: '',
        language: '',
        category: '',
        tags: '',
        isPublished: true,
        sortOrder: 0
      },
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to update code example',
      messageType: 'error'
    }))
  }
})

adminCodeExamplesRoutes.delete('/:id', async (c) => {
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

    return c.redirect('/admin/code-examples?message=Code example deleted successfully')
  } catch (error) {
    console.error('Error deleting code example:', error)
    return c.json({ error: 'Failed to delete code example' }, 500)
  }
})

export default adminCodeExamplesRoutes
