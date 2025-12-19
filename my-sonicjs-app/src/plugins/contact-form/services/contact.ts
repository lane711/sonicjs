import manifest from '../manifest.json'
import type { ContactSettings, ContactMessage } from '../types'

export class ContactService {
  constructor(private db: D1Database) {}

  async getSettings(): Promise<{ status: string; data: ContactSettings }> {
    const record = await this.db.prepare(`SELECT settings, status FROM plugins WHERE id = ?`).bind(manifest.id).first()
    try {
      return {
        status: (record?.status as string) || 'inactive',
        data: record?.settings ? JSON.parse(record.settings as string) : {}
      }
    } catch (e) {
      // Return default empty object cast as ContactSettings
      return { status: 'inactive', data: {} as ContactSettings }
    }
  }

  async saveSettings(settings: ContactSettings) {
    await this.db.prepare(`UPDATE plugins SET settings = ?, updated_at = ? WHERE id = ?`)
      .bind(JSON.stringify(settings), Date.now(), manifest.id)
      .run()
  }

  async saveMessage(data: ContactMessage) {
    const id = crypto.randomUUID()
    await this.db.prepare(`
      INSERT INTO content (id, collection_id, slug, title, data, status, author_id, created_at, updated_at) 
      VALUES (?, 'contact_messages', ?, ?, ?, 'published', 'system', ?, ?)
    `).bind(id, `msg-${Date.now()}`, `Message from ${data.name}`, JSON.stringify(data), Date.now(), Date.now()).run()
  }

  // ... (Lifecycle methods remain the same) ...
  async activate() {
     await this.db.prepare(`INSERT INTO plugins (id, name, display_name, description, version, author, category, status, installed_at, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?) ON CONFLICT(id) DO UPDATE SET status = 'active', updated_at = ?`).bind(manifest.id, manifest.id, manifest.name, manifest.description, manifest.version, manifest.author, 'communication', Date.now(), Date.now(), Date.now()).run()
  }
  async deactivate() { await this.db.prepare(`UPDATE plugins SET status = 'inactive' WHERE id = ?`).bind(manifest.id).run() }
  async uninstall() { await this.db.prepare(`DELETE FROM plugins WHERE id = ?`).bind(manifest.id).run() }
}
