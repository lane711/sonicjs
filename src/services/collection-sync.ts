/**
 * Collection Sync Service for Monolith Application
 *
 * Uses the monolith's custom collection loader instead of the core package loader
 */

import { CollectionConfig, CollectionSyncResult, validateCollectionConfig } from '@sonicjs-cms/core'
import { loadCollectionConfigs } from './collection-loader'

/**
 * Sync all collection configurations to the database
 */
export async function syncCollections(db: D1Database): Promise<CollectionSyncResult[]> {
  console.log('🔄 Starting collection sync...')

  const results: CollectionSyncResult[] = []
  const configs = await loadCollectionConfigs()

  if (configs.length === 0) {
    console.log('⚠️  No collection configurations found')
    return results
  }

  for (const config of configs) {
    const result = await syncCollection(db, config)
    results.push(result)
  }

  const created = results.filter(r => r.status === 'created').length
  const updated = results.filter(r => r.status === 'updated').length
  const unchanged = results.filter(r => r.status === 'unchanged').length
  const errors = results.filter(r => r.status === 'error').length

  console.log(`✅ Collection sync complete: ${created} created, ${updated} updated, ${unchanged} unchanged, ${errors} errors`)

  return results
}

/**
 * Sync a single collection configuration to the database
 */
export async function syncCollection(db: D1Database, config: CollectionConfig): Promise<CollectionSyncResult> {
  try {
    // Validate config
    const validation = validateCollectionConfig(config)
    if (!validation.valid) {
      return {
        name: config.name,
        status: 'error',
        error: `Validation failed: ${validation.errors.join(', ')}`
      }
    }

    // Check if collection exists
    const existingStmt = db.prepare('SELECT * FROM collections WHERE name = ?')
    const existing = await existingStmt.bind(config.name).first() as any

    const now = Date.now()
    const collectionId = existing?.id || `col-${config.name}-${crypto.randomUUID().slice(0, 8)}`

    // Prepare collection data
    const schemaJson = JSON.stringify(config.schema)
    const isActive = config.isActive !== false ? 1 : 0
    const managed = config.managed !== false ? 1 : 0

    if (!existing) {
      // Create new collection
      const insertStmt = db.prepare(`
        INSERT INTO collections (id, name, display_name, description, schema, is_active, managed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      await insertStmt.bind(
        collectionId,
        config.name,
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        now
      ).run()

      console.log(`  ✓ Created collection: ${config.name}`)

      return {
        name: config.name,
        status: 'created',
        message: `Created collection "${config.displayName}"`
      }
    } else {
      // Check if update is needed
      const existingSchema = existing.schema ? JSON.stringify(existing.schema) : '{}'
      const existingDisplayName = existing.display_name
      const existingDescription = existing.description
      const existingIsActive = existing.is_active
      const existingManaged = existing.managed

      const needsUpdate =
        schemaJson !== existingSchema ||
        config.displayName !== existingDisplayName ||
        (config.description || null) !== existingDescription ||
        isActive !== existingIsActive ||
        managed !== existingManaged

      if (!needsUpdate) {
        return {
          name: config.name,
          status: 'unchanged',
          message: `Collection "${config.displayName}" is up to date`
        }
      }

      // Update existing collection
      const updateStmt = db.prepare(`
        UPDATE collections
        SET display_name = ?, description = ?, schema = ?, is_active = ?, managed = ?, updated_at = ?
        WHERE name = ?
      `)

      await updateStmt.bind(
        config.displayName,
        config.description || null,
        schemaJson,
        isActive,
        managed,
        now,
        config.name
      ).run()

      console.log(`  ✓ Updated collection: ${config.name}`)

      return {
        name: config.name,
        status: 'updated',
        message: `Updated collection "${config.displayName}"`
      }
    }
  } catch (error) {
    console.error(`  ✗ Error syncing collection ${config.name}:`, error)

    return {
      name: config.name,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
