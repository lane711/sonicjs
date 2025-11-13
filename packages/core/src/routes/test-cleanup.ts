/**
 * Test Cleanup Routes
 *
 * Provides endpoints to clean up test data after e2e tests
 * WARNING: These endpoints should only be available in development/test environments
 */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'

const app = new Hono()

/**
 * Clean up all test data (collections, content, users except admin)
 * POST /test-cleanup
 */
app.post('/test-cleanup', async (c: Context) => {
  const db = c.env.DB as D1Database

  // Only allow in development/test environments
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Cleanup endpoint not available in production' }, 403)
  }

  try {
    let deletedCount = 0

    // Delete test collections (those starting with 'test_' or created during tests)
    const collectionsResult = await db.prepare(`
      DELETE FROM collections
      WHERE name LIKE 'test_%'
      OR name IN ('blog_posts', 'test_collection', 'products', 'articles')
    `).run()
    deletedCount += collectionsResult.meta?.changes || 0

    // Delete test content
    const contentResult = await db.prepare(`
      DELETE FROM content
      WHERE title LIKE 'Test %'
      OR title LIKE '%E2E%'
      OR title LIKE '%Playwright%'
    `).run()
    deletedCount += contentResult.meta?.changes || 0

    // Delete test users (preserve admin)
    const usersResult = await db.prepare(`
      DELETE FROM users
      WHERE email != 'admin@sonicjs.com'
      AND email LIKE '%test%'
    `).run()
    deletedCount += usersResult.meta?.changes || 0

    // Delete orphaned collection_fields
    await db.prepare(`
      DELETE FROM collection_fields
      WHERE collection_id NOT IN (SELECT id FROM collections)
    `).run()

    // Delete orphaned content_data
    await db.prepare(`
      DELETE FROM content_data
      WHERE content_id NOT IN (SELECT id FROM content)
    `).run()

    // Delete old activity logs (keep only last 100)
    await db.prepare(`
      DELETE FROM activity_logs
      WHERE id NOT IN (
        SELECT id FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 100
      )
    `).run()

    return c.json({
      success: true,
      deletedCount,
      message: 'Test data cleaned up successfully'
    })
  } catch (error) {
    console.error('Test cleanup error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Clean up test users only
 * POST /test-cleanup/users
 */
app.post('/test-cleanup/users', async (c: Context) => {
  const db = c.env.DB as D1Database

  // Only allow in development/test environments
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Cleanup endpoint not available in production' }, 403)
  }

  try {
    // Delete test users (preserve admin)
    const result = await db.prepare(`
      DELETE FROM users
      WHERE email != 'admin@sonicjs.com'
      AND (
        email LIKE '%test%'
        OR email LIKE '%example.com%'
        OR first_name = 'Test'
      )
    `).run()

    return c.json({
      success: true,
      deletedCount: result.meta?.changes || 0,
      message: 'Test users cleaned up successfully'
    })
  } catch (error) {
    console.error('User cleanup error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Clean up test collections only
 * POST /test-cleanup/collections
 */
app.post('/test-cleanup/collections', async (c: Context) => {
  const db = c.env.DB as D1Database

  // Only allow in development/test environments
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Cleanup endpoint not available in production' }, 403)
  }

  try {
    let deletedCount = 0

    // Get test collection IDs first
    const collections = await db.prepare(`
      SELECT id FROM collections
      WHERE name LIKE 'test_%'
      OR name IN ('blog_posts', 'test_collection', 'products', 'articles')
    `).all()

    if (collections.results && collections.results.length > 0) {
      const collectionIds = collections.results.map((c: any) => c.id)

      // Delete associated fields
      for (const id of collectionIds) {
        await db.prepare('DELETE FROM collection_fields WHERE collection_id = ?').bind(id).run()
      }

      // Delete associated content
      for (const id of collectionIds) {
        await db.prepare('DELETE FROM content WHERE collection_id = ?').bind(id).run()
      }

      // Delete the collections
      const result = await db.prepare(`
        DELETE FROM collections
        WHERE id IN (${collectionIds.map(() => '?').join(',')})
      `).bind(...collectionIds).run()

      deletedCount = result.meta?.changes || 0
    }

    return c.json({
      success: true,
      deletedCount,
      message: 'Test collections cleaned up successfully'
    })
  } catch (error) {
    console.error('Collection cleanup error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Clean up test content only
 * POST /test-cleanup/content
 */
app.post('/test-cleanup/content', async (c: Context) => {
  const db = c.env.DB as D1Database

  // Only allow in development/test environments
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Cleanup endpoint not available in production' }, 403)
  }

  try {
    // Delete test content
    const result = await db.prepare(`
      DELETE FROM content
      WHERE title LIKE 'Test %'
      OR title LIKE '%E2E%'
      OR title LIKE '%Playwright%'
      OR title LIKE '%Sample%'
    `).run()

    // Clean up orphaned content_data
    await db.prepare(`
      DELETE FROM content_data
      WHERE content_id NOT IN (SELECT id FROM content)
    `).run()

    return c.json({
      success: true,
      deletedCount: result.meta?.changes || 0,
      message: 'Test content cleaned up successfully'
    })
  } catch (error) {
    console.error('Content cleanup error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app
