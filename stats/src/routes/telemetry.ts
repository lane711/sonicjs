/**
 * Public Telemetry Routes
 *
 * Unauthenticated endpoints for receiving telemetry data
 * from SonicJS installations
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Bindings {
  DB: D1Database
}

const telemetryRoutes = new Hono<{ Bindings: Bindings }>()

// Enable CORS for telemetry endpoints
telemetryRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

/**
 * POST /v1/events - Create a telemetry event
 *
 * Public endpoint - no authentication required
 */
telemetryRoutes.post('/events', async (c) => {
  try {
    const body = await c.req.json()
    const db = c.env.DB

    // Extract data from the payload
    const { data } = body
    if (!data) {
      return c.json({ error: 'data is required' }, 400)
    }

    const { installation_id, event_type, properties, timestamp } = data

    // Validate required fields
    if (!installation_id) {
      return c.json({ error: 'installation_id is required' }, 400)
    }
    if (!event_type) {
      return c.json({ error: 'event_type is required' }, 400)
    }

    // Get events collection ID
    const collection = await db.prepare(
      'SELECT id FROM collections WHERE name = ?'
    ).bind('events').first() as any

    if (!collection) {
      return c.json({ error: 'Events collection not found' }, 500)
    }

    // Create content record
    const contentId = crypto.randomUUID()
    const now = Date.now()
    const title = `${installation_id} - ${event_type}`
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    await db.prepare(`
      INSERT INTO content (
        id, collection_id, slug, title, data, status,
        author_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contentId,
      collection.id,
      slug,
      title,
      JSON.stringify({
        installation_id,
        event_type,
        properties: properties || {},
        timestamp: timestamp || new Date().toISOString()
      }),
      'published',
      'admin-user-id',  // Use admin user ID (created during seed)
      now,
      now
    ).run()

    // Also update/create install record
    await upsertInstall(db, installation_id, properties)

    return c.json({
      success: true,
      id: contentId
    }, 201)

  } catch (error) {
    console.error('Telemetry event error:', error)
    return c.json({
      error: 'Failed to record event',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

/**
 * POST /v1/installs - Create/update an install record
 *
 * Public endpoint - no authentication required
 */
telemetryRoutes.post('/installs', async (c) => {
  try {
    const body = await c.req.json()
    const db = c.env.DB

    const { data } = body
    if (!data) {
      return c.json({ error: 'data is required' }, 400)
    }

    const { installation_id } = data

    if (!installation_id) {
      return c.json({ error: 'installation_id is required' }, 400)
    }

    const result = await upsertInstall(db, installation_id, data)

    return c.json({
      success: true,
      ...result
    }, 201)

  } catch (error) {
    console.error('Telemetry install error:', error)
    return c.json({
      error: 'Failed to record install',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

/**
 * Upsert install record
 */
async function upsertInstall(
  db: D1Database,
  installationId: string,
  properties?: Record<string, any>
): Promise<{ id: string; created: boolean }> {
  // Get installs collection ID
  const collection = await db.prepare(
    'SELECT id FROM collections WHERE name = ?'
  ).bind('installs').first() as any

  if (!collection) {
    throw new Error('Installs collection not found')
  }

  // Check if install already exists
  const existing = await db.prepare(
    'SELECT id, data FROM content WHERE collection_id = ? AND slug = ?'
  ).bind(collection.id, installationId).first() as any

  const now = Date.now()
  const timestamp = new Date().toISOString()

  if (existing) {
    // Update existing record with last_seen
    const existingData = JSON.parse(existing.data || '{}')
    const updatedData = {
      ...existingData,
      last_seen: timestamp,
      os: properties?.os || existingData.os,
      node_version: properties?.nodeVersion || properties?.node_version || existingData.node_version,
      package_manager: properties?.packageManager || properties?.package_manager || existingData.package_manager
    }

    await db.prepare(
      'UPDATE content SET data = ?, updated_at = ? WHERE id = ?'
    ).bind(JSON.stringify(updatedData), now, existing.id).run()

    return { id: existing.id, created: false }
  }

  // Create new install record
  const contentId = crypto.randomUUID()
  const installData = {
    installation_id: installationId,
    first_seen: timestamp,
    last_seen: timestamp,
    os: properties?.os || properties?.properties?.os,
    node_version: properties?.nodeVersion || properties?.node_version || properties?.properties?.nodeVersion,
    package_manager: properties?.packageManager || properties?.package_manager || properties?.properties?.packageManager
  }

  await db.prepare(`
    INSERT INTO content (
      id, collection_id, slug, title, data, status,
      author_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    contentId,
    collection.id,
    installationId,
    installationId,
    JSON.stringify(installData),
    'published',
    'admin-user-id',  // Use admin user ID (created during seed)
    now,
    now
  ).run()

  return { id: contentId, created: true }
}

export default telemetryRoutes
