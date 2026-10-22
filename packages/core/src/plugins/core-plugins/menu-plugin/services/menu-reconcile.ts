import { D1Database } from '@cloudflare/workers-types'
import { nanoid } from 'nanoid'
import { getPluginMenu, type PluginMenuEntry } from '../../../../services/plugin-menu-singleton'
import { PLUGIN_REGISTRY, type PluginRegistryEntry } from '../../../../plugins/manifest-registry'

interface ActivePluginEntry {
  pluginId: string
  label: string
  url: string
  icon: string
  sortOrder: number
}

async function upsertPluginRow(
  db: D1Database,
  slug: string,
  entry: ActivePluginEntry,
  visible: boolean,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  const existing = await db
    .prepare(
      `SELECT id FROM documents
       WHERE slug = ? AND type_id = 'menu_item' AND tenant_id = 'default'
         AND is_current_draft = 1 AND deleted_at IS NULL`,
    )
    .bind(slug)
    .first<{ id: string }>()

  if (existing) {
    await db
      .prepare(
        `UPDATE documents
         SET data = json_set(data, '$.url', ?, '$.pluginId', ?, '$.visible', ?),
             visible = ?,
             updated_at = ?
         WHERE id = ? AND tenant_id = 'default'`,
      )
      .bind(entry.url, entry.pluginId, visible ? 1 : 0, visible ? 1 : 0, now, existing.id)
      .run()
    return
  }

  const id = nanoid()
  const data = JSON.stringify({
    label: entry.label,
    url: entry.url,
    icon: entry.icon,
    target: '_self',
    isExternal: false,
    visible,
    parent: null,
    source: 'plugin',
    pluginId: entry.pluginId,
    permissions: [],
    lockedFields: ['url'],
    sortOrder: entry.sortOrder,
  })

  // 30 columns — matches documents INSERT in DocumentsService.create (R5)
  await db
    .prepare(
      `INSERT INTO documents (id, root_id, type_id, type_version, version_of_id, version_number,
         is_current_draft, is_published, status, parent_root_id, slug, path, title, zone,
         sort_order, visible, published_at, scheduled_at, expires_at, deleted_at,
         tenant_id, locale, translation_group_id, data, metadata,
         owner_id, created_by, updated_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, id, 'menu_item', 1, null, 1,
      1, 0, 'draft', '', slug, null, entry.label, null,
      entry.sortOrder, visible ? 1 : 0, null, null, null, null,
      'default', 'default', '', data, '{}',
      null, null, null, now, now,
    )
    .run()
}

async function deactivateStalePluginRows(
  db: D1Database,
  activePluginIds: Set<string>,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  const rows = await db
    .prepare(
      `SELECT id, data FROM documents
       WHERE type_id = 'menu_item' AND tenant_id = 'default'
         AND is_current_draft = 1 AND deleted_at IS NULL
         AND json_extract(data, '$.source') = 'plugin'`,
    )
    .all<{ id: string; data: string }>()

  const stale = (rows.results ?? []).filter((row) => {
    let pluginId: string | undefined
    try {
      pluginId = JSON.parse(row.data)?.pluginId as string | undefined
    } catch {
      return false
    }
    return pluginId !== undefined && !activePluginIds.has(pluginId)
  })

  if (stale.length === 0) return

  await db.batch(
    stale.map((row) =>
      db
        .prepare(
          `UPDATE documents
           SET data = json_set(data, '$.visible', 0), visible = 0, updated_at = ?
           WHERE id = ? AND tenant_id = 'default'`,
        )
        .bind(now, row.id),
    ),
  )
}

async function fetchActivePluginIds(db: D1Database): Promise<Set<string>> {
  try {
    const rows = await db
      .prepare(
        `SELECT slug FROM documents
         WHERE type_id = 'plugin' AND tenant_id = 'default'
           AND is_current_draft = 1 AND deleted_at IS NULL
           AND json_extract(data, '$.status') = 'active'`,
      )
      .all<{ slug: string }>()
    return new Set((rows.results ?? []).map((r) => r.slug))
  } catch {
    return new Set()
  }
}

export async function reconcileMenuFromPlugins(db: D1Database): Promise<void> {
  try {
    const singletonEntries = getPluginMenu()
    const manifestEntries = (Object.values(PLUGIN_REGISTRY) as PluginRegistryEntry[]).filter(
      (p): p is PluginRegistryEntry & { adminMenu: NonNullable<PluginRegistryEntry['adminMenu']> } =>
        p.adminMenu !== null,
    )

    const byPluginId = new Map<string, ActivePluginEntry>()
    manifestEntries.forEach((p: PluginRegistryEntry, idx: number) => {
      const menu = p.adminMenu!
      byPluginId.set(p.id, {
        pluginId: p.id,
        label: menu.label,
        url: menu.path,
        icon: menu.icon,
        sortOrder: 100 + idx * 10,
      })
    })
    singletonEntries.forEach((entry: PluginMenuEntry, idx: number) => {
      const pathParts = entry.path.replace(/\/$/, '').split('/')
      const pluginId =
        pathParts[pathParts.length - 1] ||
        entry.label.toLowerCase().replace(/\s+/g, '-')
      byPluginId.set(pluginId, {
        pluginId,
        label: entry.label,
        url: entry.path,
        icon: entry.icon ?? 'puzzle-piece',
        sortOrder: 100 + idx * 10,
      })
    })

    // Round trip 1: get active plugin IDs
    const activeIds = await fetchActivePluginIds(db)

    // Round trip 2: get all existing plugin-source menu rows
    const existingRows = await db
      .prepare(
        `SELECT id, slug, data, visible FROM documents
         WHERE type_id = 'menu_item' AND tenant_id = 'default'
           AND is_current_draft = 1 AND deleted_at IS NULL
           AND json_extract(data, '$.source') = 'plugin'`
      )
      .all<{ id: string; slug: string; data: string; visible: number }>()

    const existingBySlug = new Map(
      (existingRows.results ?? []).map(r => [r.slug, r])
    )
    const expectedSlugs = new Set([...byPluginId.keys()].map(id => `menu:plugin:${id}`))
    const now = Math.floor(Date.now() / 1000)

    const statements: ReturnType<D1Database['prepare']>[] = []

    // Insert new rows, skip existing
    for (const [pluginId, entry] of byPluginId) {
      const slug = `menu:plugin:${pluginId}`
      const existing = existingBySlug.get(slug)
      const shouldBeVisible = activeIds.has(pluginId)

      if (!existing) {
        const id = nanoid()
        const data = JSON.stringify({
          label: entry.label,
          url: entry.url,
          icon: entry.icon,
          target: '_self',
          isExternal: false,
          visible: shouldBeVisible,
          parent: null,
          source: 'plugin',
          pluginId: entry.pluginId,
          permissions: [],
          lockedFields: ['url'],
          sortOrder: entry.sortOrder,
        })
        statements.push(
          db.prepare(
            `INSERT INTO documents (id, root_id, type_id, type_version, version_of_id, version_number,
               is_current_draft, is_published, status, parent_root_id, slug, path, title, zone,
               sort_order, visible, published_at, scheduled_at, expires_at, deleted_at,
               tenant_id, locale, translation_group_id, data, metadata,
               owner_id, created_by, updated_by, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          ).bind(
            id, id, 'menu_item', 1, null, 1,
            1, 0, 'draft', '', slug, null, entry.label, null,
            entry.sortOrder, shouldBeVisible ? 1 : 0, null, null, null, null,
            'default', 'default', '', data, '{}',
            null, null, null, now, now,
          )
        )
      }
    }

    // Deactivate stale rows (pluginId removed from registry)
    for (const row of existingRows.results ?? []) {
      if (!expectedSlugs.has(row.slug)) {
        statements.push(
          db.prepare(
            `UPDATE documents SET data = json_set(data, '$.visible', 0), visible = 0, updated_at = ?
             WHERE id = ? AND tenant_id = 'default'`,
          ).bind(now, row.id)
        )
      }
    }

    if (statements.length > 0) {
      await db.batch(statements)
    }
  } catch {
    // DB may not be ready at bootstrap; swallow silently
  }
}
