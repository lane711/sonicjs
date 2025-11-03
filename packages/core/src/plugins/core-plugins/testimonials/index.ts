import { Hono } from 'hono'
import { z } from 'zod'
import { Plugin } from '@sonicjs-cms/core'
import { PluginBuilder } from '../../sdk/plugin-builder'

const testimonialSchema = z.object({
  id: z.number().optional(),
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name must be under 100 characters'),
  authorTitle: z.string().max(100, 'Author title must be under 100 characters').optional(),
  authorCompany: z.string().max(100, 'Company must be under 100 characters').optional(),
  testimonialText: z.string().min(1, 'Testimonial text is required').max(1000, 'Testimonial must be under 1000 characters'),
  rating: z.number().min(1).max(5).optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})

const testimonialMigration = `
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_company TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(isPublished);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON testimonials(sortOrder);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);

CREATE TRIGGER IF NOT EXISTS testimonials_updated_at
  AFTER UPDATE ON testimonials
BEGIN
  UPDATE testimonials SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
`

const testimonialAPIRoutes = new Hono()

testimonialAPIRoutes.get('/', async (c) => {
  try {
    const { published, minRating } = c.req.query()
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    let query = 'SELECT * FROM testimonials WHERE 1=1'
    const params: any[] = []

    if (published !== undefined) {
      query += ' AND isPublished = ?'
      params.push(published === 'true' ? 1 : 0)
    }

    if (minRating) {
      query += ' AND rating >= ?'
      params.push(parseInt(minRating, 10))
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
      error: 'Failed to fetch testimonials'
    }, 500)
  }
})

testimonialAPIRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results } = await db.prepare('SELECT * FROM testimonials WHERE id = ?').bind(id).all()

    if (!results || results.length === 0) {
      return c.json({ error: 'Testimonial not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0]
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch testimonial'
    }, 500)
  }
})

testimonialAPIRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = testimonialSchema.parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
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

    return c.json({
      success: true,
      data: results?.[0],
      message: 'Testimonial created successfully'
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
      error: 'Failed to create testimonial'
    }, 500)
  }
})

testimonialAPIRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validatedData = testimonialSchema.partial().parse(body)
    const db = (c as any).env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const updateFields = []
    const updateValues = []

    if (validatedData.authorName !== undefined) {
      updateFields.push('author_name = ?')
      updateValues.push(validatedData.authorName)
    }
    if (validatedData.authorTitle !== undefined) {
      updateFields.push('author_title = ?')
      updateValues.push(validatedData.authorTitle)
    }
    if (validatedData.authorCompany !== undefined) {
      updateFields.push('author_company = ?')
      updateValues.push(validatedData.authorCompany)
    }
    if (validatedData.testimonialText !== undefined) {
      updateFields.push('testimonial_text = ?')
      updateValues.push(validatedData.testimonialText)
    }
    if (validatedData.rating !== undefined) {
      updateFields.push('rating = ?')
      updateValues.push(validatedData.rating)
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
      UPDATE testimonials
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
    `).bind(...updateValues).all()

    if (!results || results.length === 0) {
      return c.json({ error: 'Testimonial not found' }, 404)
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Testimonial updated successfully'
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
      error: 'Failed to update testimonial'
    }, 500)
  }
})

testimonialAPIRoutes.delete('/:id', async (c) => {
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

    return c.json({
      success: true,
      message: 'Testimonial deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete testimonial'
    }, 500)
  }
})

export function createTestimonialPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'testimonials-plugin',
    version: '1.0.0-beta.1',
    description: 'Customer testimonials management plugin'
  })

  builder.metadata({
    author: {
      name: 'SonicJS',
      email: 'info@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^1.0.0'
  })

  builder.addModel('Testimonial', {
    tableName: 'testimonials',
    schema: testimonialSchema,
    migrations: [testimonialMigration]
  })

  builder.addRoute('/api/testimonials', testimonialAPIRoutes, {
    description: 'Testimonials API endpoints',
    requiresAuth: false
  })

  builder.addAdminPage('/testimonials', 'Testimonials', 'TestimonialsListView', {
    description: 'Manage customer testimonials',
    icon: 'star',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/testimonials/new', 'New Testimonial', 'TestimonialsFormView', {
    description: 'Create a new testimonial',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/testimonials/:id', 'Edit Testimonial', 'TestimonialsFormView', {
    description: 'Edit an existing testimonial',
    permissions: ['admin', 'editor']
  })

  builder.addMenuItem('Testimonials', '/admin/testimonials', {
    icon: 'star',
    order: 60,
    permissions: ['admin', 'editor']
  })

  builder.lifecycle({
    install: async (context) => {
      const { db } = context
      await db.prepare(testimonialMigration).run()
      console.log('Testimonials plugin installed successfully')
    },
    uninstall: async (context) => {
      const { db } = context
      await db.prepare('DROP TABLE IF EXISTS testimonials').run()
      console.log('Testimonials plugin uninstalled successfully')
    },
    activate: async () => {
      console.log('Testimonials plugin activated')
    },
    deactivate: async () => {
      console.log('Testimonials plugin deactivated')
    }
  })

  return builder.build() as Plugin
}

export const testimonialsPlugin = createTestimonialPlugin()
