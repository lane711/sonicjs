import { Hono } from 'hono'
import { z } from 'zod'
import { renderFAQList } from '../templates/pages/admin-faq-list.template'
import { renderFAQForm } from '../templates/pages/admin-faq-form.template'

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

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question must be under 500 characters'),
  answer: z.string().min(1, 'Answer is required').max(2000, 'Answer must be under 2000 characters'),
  category: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.string().transform(val => val === 'true'),
  sortOrder: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0))
})

const adminFAQRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminFAQRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { category, published, search, page = '1' } = c.req.query()
    const currentPage = parseInt(page, 10) || 1
    const limit = 20
    const offset = (currentPage - 1) * limit

    const db = (c as any).env?.DB
    if (!db) {
      return c.html(renderFAQList({
        faqs: [],
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

    if (category) {
      whereClause += ' AND category = ?'
      params.push(category)
    }

    if (published !== undefined) {
      whereClause += ' AND isPublished = ?'
      params.push(published === 'true' ? 1 : 0)
    }

    if (search) {
      whereClause += ' AND (question LIKE ? OR answer LIKE ? OR tags LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    const countQuery = `SELECT COUNT(*) as count FROM faqs ${whereClause}`
    const { results: countResults } = await db.prepare(countQuery).bind(...params).all()
    const totalCount = countResults?.[0]?.count || 0

    const dataQuery = `
      SELECT * FROM faqs 
      ${whereClause} 
      ORDER BY sortOrder ASC, created_at DESC 
      LIMIT ? OFFSET ?
    `
    const { results: faqs } = await db.prepare(dataQuery).bind(...params, limit, offset).all()

    const totalPages = Math.ceil(totalCount / limit)

    return c.html(renderFAQList({
      faqs: faqs || [],
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
    console.error('Error fetching FAQs:', error)
    const user = c.get('user')
    return c.html(renderFAQList({
      faqs: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load FAQs',
      messageType: 'error'
    }))
  }
})

adminFAQRoutes.get('/new', async (c) => {
  const user = c.get('user')
  return c.html(renderFAQForm({
    isEdit: false,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }))
})

adminFAQRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())
    
    const validatedData = faqSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderFAQForm({
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

    if (results && results.length > 0) {
      return c.redirect('/admin/faq?message=FAQ created successfully')
    } else {
      return c.html(renderFAQForm({
        isEdit: false,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Failed to create FAQ',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error creating FAQ:', error)
    const user = c.get('user')
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })
      
      return c.html(renderFAQForm({
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

    return c.html(renderFAQForm({
      isEdit: false,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to create FAQ',
      messageType: 'error'
    }))
  }
})

adminFAQRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderFAQForm({
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

    const { results } = await db.prepare('SELECT * FROM faqs WHERE id = ?').bind(id).all()

    if (!results || results.length === 0) {
      return c.redirect('/admin/faq?message=FAQ not found&type=error')
    }

    const faq = results[0] as any
    
    return c.html(renderFAQForm({
      faq: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        tags: faq.tags,
        isPublished: Boolean(faq.isPublished),
        sortOrder: faq.sortOrder
      },
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    const user = c.get('user')
    return c.html(renderFAQForm({
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load FAQ',
      messageType: 'error'
    }))
  }
})

adminFAQRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())
    
    const validatedData = faqSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderFAQForm({
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
      UPDATE faqs 
      SET question = ?, answer = ?, category = ?, tags = ?, isPublished = ?, sortOrder = ?
      WHERE id = ?
      RETURNING *
    `).bind(
      validatedData.question,
      validatedData.answer,
      validatedData.category || null,
      validatedData.tags || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder,
      id
    ).all()

    if (results && results.length > 0) {
      return c.redirect('/admin/faq?message=FAQ updated successfully')
    } else {
      return c.html(renderFAQForm({
        faq: {
          id,
          question: validatedData.question,
          answer: validatedData.answer,
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
        message: 'FAQ not found',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error updating FAQ:', error)
    const user = c.get('user')
    const id = parseInt(c.req.param('id'))
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })
      
      return c.html(renderFAQForm({
        faq: {
          id,
          question: '',
          answer: '',
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

    return c.html(renderFAQForm({
      faq: {
        id,
        question: '',
        answer: '',
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
      message: 'Failed to update FAQ',
      messageType: 'error'
    }))
  }
})

adminFAQRoutes.delete('/:id', async (c) => {
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

    return c.redirect('/admin/faq?message=FAQ deleted successfully')
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return c.json({ error: 'Failed to delete FAQ' }, 500)
  }
})

export default adminFAQRoutes