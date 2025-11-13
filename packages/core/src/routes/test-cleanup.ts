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

    // Step 1: Get test collection IDs and test user IDs
    const testCollections = await db.prepare(`
      SELECT id FROM collections
      WHERE name LIKE 'test_%'
      OR name IN ('blog_posts', 'test_collection', 'products', 'articles')
    `).all()
    const testCollectionIds = testCollections.results?.map((c: any) => c.id) || []

    const testUsers = await db.prepare(`
      SELECT id FROM users
      WHERE email != 'admin@sonicjs.com'
      AND (email LIKE '%test%' OR email LIKE '%example.com%')
    `).all()
    const testUserIds = testUsers.results?.map((u: any) => u.id) || []

    // Step 2: Get content IDs that will be deleted (batched to avoid SQL variable limit)
    let contentIdsToDelete: string[] = []
    const batchSize = 500

    if (testCollectionIds.length > 0) {
      for (let i = 0; i < testCollectionIds.length; i += batchSize) {
        const batch = testCollectionIds.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')
        const contentFromCollections = await db.prepare(`
          SELECT id FROM content WHERE collection_id IN (${placeholders})
        `).bind(...batch).all()
        contentIdsToDelete.push(...(contentFromCollections.results?.map((c: any) => c.id) || []))
      }
    }

    const contentByPattern = await db.prepare(`
      SELECT id FROM content
      WHERE title LIKE 'Test %'
      OR title LIKE '%E2E%'
      OR title LIKE '%Playwright%'
      OR title LIKE '%Sample%'
    `).all()
    contentIdsToDelete.push(...(contentByPattern.results?.map((c: any) => c.id) || []))

    // Step 3: Delete data that references content (child tables first)
    if (contentIdsToDelete.length > 0) {
      for (let i = 0; i < contentIdsToDelete.length; i += batchSize) {
        const batch = contentIdsToDelete.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')

        // Delete content_versions
        await db.prepare(`
          DELETE FROM content_versions WHERE content_id IN (${placeholders})
        `).bind(...batch).run()

        // Delete workflow_history
        await db.prepare(`
          DELETE FROM workflow_history WHERE content_id IN (${placeholders})
        `).bind(...batch).run()

        // Delete content_data
        await db.prepare(`
          DELETE FROM content_data WHERE content_id IN (${placeholders})
        `).bind(...batch).run()
      }
    }

    // Step 4: Delete data that references test users (batched)
    if (testUserIds.length > 0) {
      for (let i = 0; i < testUserIds.length; i += batchSize) {
        const batch = testUserIds.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')

        // Delete API tokens
        await db.prepare(`
          DELETE FROM api_tokens WHERE user_id IN (${placeholders})
        `).bind(...batch).run()

        // Delete media uploaded by test users
        await db.prepare(`
          DELETE FROM media WHERE uploaded_by IN (${placeholders})
        `).bind(...batch).run()
      }
    }

    // Step 5: Now delete the content itself (batched)
    if (contentIdsToDelete.length > 0) {
      for (let i = 0; i < contentIdsToDelete.length; i += batchSize) {
        const batch = contentIdsToDelete.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')
        const contentResult = await db.prepare(`
          DELETE FROM content WHERE id IN (${placeholders})
        `).bind(...batch).run()
        deletedCount += contentResult.meta?.changes || 0
      }
    }

    // Step 6: Delete collection_fields for test collections (batched)
    if (testCollectionIds.length > 0) {
      for (let i = 0; i < testCollectionIds.length; i += batchSize) {
        const batch = testCollectionIds.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')
        await db.prepare(`
          DELETE FROM collection_fields WHERE collection_id IN (${placeholders})
        `).bind(...batch).run()
      }
    }

    // Step 7: Delete test collections (batched)
    if (testCollectionIds.length > 0) {
      for (let i = 0; i < testCollectionIds.length; i += batchSize) {
        const batch = testCollectionIds.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')
        const collectionsResult = await db.prepare(`
          DELETE FROM collections WHERE id IN (${placeholders})
        `).bind(...batch).run()
        deletedCount += collectionsResult.meta?.changes || 0
      }
    }

    // Step 8: Delete test users (batched)
    if (testUserIds.length > 0) {
      for (let i = 0; i < testUserIds.length; i += batchSize) {
        const batch = testUserIds.slice(i, i + batchSize)
        const placeholders = batch.map(() => '?').join(',')
        const usersResult = await db.prepare(`
          DELETE FROM users WHERE id IN (${placeholders})
        `).bind(...batch).run()
        deletedCount += usersResult.meta?.changes || 0
      }
    }

    // Step 9: Clean up any remaining orphaned data
    await db.prepare(`
      DELETE FROM content_data
      WHERE content_id NOT IN (SELECT id FROM content)
    `).run()

    await db.prepare(`
      DELETE FROM collection_fields
      WHERE collection_id NOT IN (SELECT id FROM collections)
    `).run()

    await db.prepare(`
      DELETE FROM content_versions
      WHERE content_id NOT IN (SELECT id FROM content)
    `).run()

    await db.prepare(`
      DELETE FROM workflow_history
      WHERE content_id NOT IN (SELECT id FROM content)
    `).run()

    // Step 10: Delete old activity logs (keep only last 100)
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
