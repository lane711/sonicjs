import { Hono } from 'hono'
import { z } from 'zod'
import { renderTestimonialsList } from '../templates/pages/admin-testimonials-list.template'
import { renderTestimonialsForm } from '../templates/pages/admin-testimonials-form.template'

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

const testimonialSchema = z.object({
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name must be under 100 characters'),
  authorTitle: z.string().optional(),
  authorCompany: z.string().optional(),
  testimonialText: z.string().min(1, 'Testimonial is required').max(1000, 'Testimonial must be under 1000 characters'),
  rating: z.string().transform(val => val ? parseInt(val, 10) : undefined).pipe(z.number().min(1).max(5).optional()),
  isPublished: z.string().transform(val => val === 'true'),
  sortOrder: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0))
})

const adminTestimonialsRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminTestimonialsRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { published, minRating, search, page = '1' } = c.req.query()
    const currentPage = parseInt(page, 10) || 1
    const limit = 20
    const offset = (currentPage - 1) * limit

    const db = (c as any).env?.DB
    if (!db) {
      return c.html(renderTestimonialsList({
        testimonials: [],
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

    if (minRating) {
      whereClause += ' AND rating >= ?'
      params.push(parseInt(minRating, 10))
    }

    if (search) {
      whereClause += ' AND (author_name LIKE ? OR testimonial_text LIKE ? OR author_company LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    const countQuery = `SELECT COUNT(*) as count FROM testimonials ${whereClause}`
    const { results: countResults } = await db.prepare(countQuery).bind(...params).all()
    const totalCount = countResults?.[0]?.count || 0

    const dataQuery = `
      SELECT * FROM testimonials
      ${whereClause}
      ORDER BY sortOrder ASC, created_at DESC
      LIMIT ? OFFSET ?
    `
    const { results: testimonials } = await db.prepare(dataQuery).bind(...params, limit, offset).all()

    const totalPages = Math.ceil(totalCount / limit)

    return c.html(renderTestimonialsList({
      testimonials: testimonials || [],
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
    console.error('Error fetching testimonials:', error)
    const user = c.get('user')
    return c.html(renderTestimonialsList({
      testimonials: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load testimonials',
      messageType: 'error'
    }))
  }
})

adminTestimonialsRoutes.get('/new', async (c) => {
  const user = c.get('user')
  return c.html(renderTestimonialsForm({
    isEdit: false,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }))
})

adminTestimonialsRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())

    const validatedData = testimonialSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderTestimonialsForm({
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
      INSERT INTO testimonials (author_name, author_title, author_company, testimonial_text, rating, isPublished, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      validatedData.authorName,
      validatedData.authorTitle || null,
      validatedData.authorCompany || null,
      validatedData.testimonialText,
      validatedData.rating || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder
    ).all()

    if (results && results.length > 0) {
      return c.redirect('/admin/testimonials?message=Testimonial created successfully')
    } else {
      return c.html(renderTestimonialsForm({
        isEdit: false,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Failed to create testimonial',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error creating testimonial:', error)
    const user = c.get('user')

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })

      return c.html(renderTestimonialsForm({
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

    return c.html(renderTestimonialsForm({
      isEdit: false,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to create testimonial',
      messageType: 'error'
    }))
  }
})

adminTestimonialsRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderTestimonialsForm({
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

    const { results } = await db.prepare('SELECT * FROM testimonials WHERE id = ?').bind(id).all()

    if (!results || results.length === 0) {
      return c.redirect('/admin/testimonials?message=Testimonial not found&type=error')
    }

    const testimonial = results[0] as any

    return c.html(renderTestimonialsForm({
      testimonial: {
        id: testimonial.id,
        authorName: testimonial.author_name,
        authorTitle: testimonial.author_title,
        authorCompany: testimonial.author_company,
        testimonialText: testimonial.testimonial_text,
        rating: testimonial.rating,
        isPublished: Boolean(testimonial.isPublished),
        sortOrder: testimonial.sortOrder
      },
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching testimonial:', error)
    const user = c.get('user')
    return c.html(renderTestimonialsForm({
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to load testimonial',
      messageType: 'error'
    }))
  }
})

adminTestimonialsRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const formData = await c.req.formData()
    const data = Object.fromEntries(formData.entries())

    const validatedData = testimonialSchema.parse(data)
    const user = c.get('user')
    const db = (c as any).env?.DB

    if (!db) {
      return c.html(renderTestimonialsForm({
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
      UPDATE testimonials
      SET author_name = ?, author_title = ?, author_company = ?, testimonial_text = ?, rating = ?, isPublished = ?, sortOrder = ?
      WHERE id = ?
      RETURNING *
    `).bind(
      validatedData.authorName,
      validatedData.authorTitle || null,
      validatedData.authorCompany || null,
      validatedData.testimonialText,
      validatedData.rating || null,
      validatedData.isPublished ? 1 : 0,
      validatedData.sortOrder,
      id
    ).all()

    if (results && results.length > 0) {
      return c.redirect('/admin/testimonials?message=Testimonial updated successfully')
    } else {
      return c.html(renderTestimonialsForm({
        testimonial: {
          id,
          authorName: validatedData.authorName,
          authorTitle: validatedData.authorTitle,
          authorCompany: validatedData.authorCompany,
          testimonialText: validatedData.testimonialText,
          rating: validatedData.rating,
          isPublished: validatedData.isPublished,
          sortOrder: validatedData.sortOrder
        },
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined,
        message: 'Testimonial not found',
        messageType: 'error'
      }))
    }
  } catch (error) {
    console.error('Error updating testimonial:', error)
    const user = c.get('user')
    const id = parseInt(c.req.param('id'))

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach(err => {
        const field = err.path[0] as string
        if (!errors[field]) errors[field] = []
        errors[field].push(err.message)
      })

      return c.html(renderTestimonialsForm({
        testimonial: {
          id,
          authorName: '',
          authorTitle: '',
          authorCompany: '',
          testimonialText: '',
          rating: undefined,
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

    return c.html(renderTestimonialsForm({
      testimonial: {
        id,
        authorName: '',
        authorTitle: '',
        authorCompany: '',
        testimonialText: '',
        rating: undefined,
        isPublished: true,
        sortOrder: 0
      },
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      message: 'Failed to update testimonial',
      messageType: 'error'
    }))
  }
})

adminTestimonialsRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { changes } = await db.prepare('DELETE FROM testimonials WHERE id = ?').bind(id).run()

    if (changes === 0) {
      return c.json({ error: 'Testimonial not found' }, 404)
    }

    return c.redirect('/admin/testimonials?message=Testimonial deleted successfully')
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return c.json({ error: 'Failed to delete testimonial' }, 500)
  }
})

export default adminTestimonialsRoutes
