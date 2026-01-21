import manifest from '../manifest.json'
import type { ContactSettings, ContactMessage } from '../types'
import type { D1Database } from '@cloudflare/workers-types'

export class ContactService {
  constructor(private db: D1Database) {}

  /**
   * Get plugin settings from the database
   */
  async getSettings(): Promise<{ status: string; data: ContactSettings }> {
    try {
      const record = await this.db
        .prepare(`SELECT settings, status FROM plugins WHERE id = ?`)
        .bind(manifest.id)
        .first()

      if (!record) {
        return {
          status: 'inactive',
          data: this.getDefaultSettings()
        }
      }

      return {
        status: (record?.status as string) || 'inactive',
        data: record?.settings ? JSON.parse(record.settings as string) : this.getDefaultSettings()
      }
    } catch (error) {
      console.error('Error getting contact form settings:', error)
      return {
        status: 'inactive',
        data: this.getDefaultSettings()
      }
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): ContactSettings {
    return {
      companyName: 'My Company',
      phoneNumber: '555-0199',
      description: '',
      address: '123 Web Dev Lane',
      city: '',
      state: '',
      showMap: false,
      mapApiKey: '',
      useTurnstile: false
    }
  }

  /**
   * Save plugin settings to the database
   */
  async saveSettings(settings: ContactSettings): Promise<void> {
    try {
      console.log('[ContactService.saveSettings] Starting save for plugin:', manifest.id)
      console.log('[ContactService.saveSettings] Settings:', JSON.stringify(settings))
      
      // Check if plugin row exists
      const existing = await this.db
        .prepare(`SELECT id, status FROM plugins WHERE id = ?`)
        .bind(manifest.id)
        .first()

      console.log('[ContactService.saveSettings] Existing row:', JSON.stringify(existing))

      if (existing) {
        // Update existing row
        console.log('[ContactService.saveSettings] Updating existing row...')
        const result = await this.db
          .prepare(`UPDATE plugins SET settings = ?, last_updated = ? WHERE id = ?`)
          .bind(JSON.stringify(settings), Date.now(), manifest.id)
          .run()
        console.log('[ContactService.saveSettings] UPDATE result:', JSON.stringify(result))
        console.log('[ContactService.saveSettings] Successfully updated')
      } else {
        // Insert new row
        console.log('[ContactService.saveSettings] No existing row, inserting new...')
        const result = await this.db
          .prepare(`
            INSERT INTO plugins (id, name, display_name, description, version, author, category, status, settings, installed_at, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'inactive', ?, ?, ?)
          `)
          .bind(
            manifest.id,
            manifest.name,
            manifest.name, // Use name for display_name since displayName doesn't exist in manifest
            manifest.description || '',
            manifest.version || '1.0.0',
            manifest.author || 'Unknown',
            manifest.category || 'other',
            JSON.stringify(settings),
            Date.now(),
            Date.now()
          )
          .run()
        console.log('[ContactService.saveSettings] INSERT result:', JSON.stringify(result))
        console.log('[ContactService.saveSettings] Successfully inserted')
      }
      console.log('[ContactService.saveSettings] Settings saved successfully')
    } catch (error) {
      console.error('[ContactService.saveSettings] ERROR:', error)
      console.error('[ContactService.saveSettings] Error message:', error instanceof Error ? error.message : String(error))
      console.error('[ContactService.saveSettings] Error stack:', error instanceof Error ? error.stack : 'No stack')
      throw new Error(`Failed to save contact form settings: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Save a contact message to the database
   */
  async saveMessage(data: ContactMessage): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not available')
      }
      
      const id = crypto.randomUUID()
      
      // Get the collection ID for contact_messages
      const collection = await this.db
        .prepare(`SELECT id FROM collections WHERE name = 'contact_messages' LIMIT 1`)
        .first()
      
      if (!collection || !collection.id) {
        console.error('Contact messages collection not found in database')
        throw new Error('Contact messages collection not found')
      }
      
      // Get any active admin user ID (finds the first active admin, regardless of email)
      const adminUser = await this.db
        .prepare(`SELECT id FROM users WHERE role = 'admin' AND is_active = 1 ORDER BY created_at LIMIT 1`)
        .first()
      
      if (!adminUser || !adminUser.id) {
        console.error('Admin user not found in database')
        throw new Error('Admin user not found')
      }
      
      const result = await this.db
        .prepare(`
          INSERT INTO content (id, collection_id, slug, title, data, status, author_id, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?)
        `)
        .bind(
          id,
          collection.id,
          `msg-${Date.now()}`,
          `Message from ${data.name}`,
          JSON.stringify(data),
          adminUser.id,
          Date.now(),
          Date.now()
        )
        .run()
      
      console.log('Contact message saved successfully:', id, result)
    } catch (error) {
      console.error('Error saving contact message - Full error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        dbExists: !!this.db
      })
      throw error // Throw the original error instead of wrapping it
    }
  }

  /**
   * Get all contact messages
   */
  async getMessages(): Promise<ContactMessage[]> {
    try {
      const results = await this.db
        .prepare(`
          SELECT data 
          FROM content 
          WHERE collection_id = 'contact_messages' 
          ORDER BY created_at DESC
        `)
        .all()

      return results.results.map((row: any) => JSON.parse(row.data))
    } catch (error) {
      console.error('Error getting contact messages:', error)
      return []
    }
  }

  // Lifecycle methods
  /**
   * Install the plugin (create database entry)
   */
  async install(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings()
      await this.db
        .prepare(`
          INSERT INTO plugins (
            id, name, display_name, description, version, author, 
            category, status, settings, installed_at, last_updated
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'inactive', ?, ?, ?) 
          ON CONFLICT(id) DO UPDATE SET 
            display_name = excluded.display_name,
            description = excluded.description,
            version = excluded.version,
            updated_at = excluded.last_updated
        `)
        .bind(
          manifest.id,
          manifest.id,
          manifest.name,
          manifest.description,
          manifest.version,
          manifest.author,
          manifest.category,
          JSON.stringify(defaultSettings),
          Date.now(),
          Date.now()
        )
        .run()
      console.log('Contact form plugin installed successfully')
    } catch (error) {
      console.error('Error installing contact form plugin:', error)
      throw new Error('Failed to install contact form plugin')
    }
  }

  /**
   * Activate the plugin
   */
  async activate(): Promise<void> {
    try {
      await this.db
        .prepare(`
          UPDATE plugins 
          SET status = 'active', last_updated = ? 
          WHERE id = ?
        `)
        .bind(Date.now(), manifest.id)
        .run()
      console.log('Contact form plugin activated')
    } catch (error) {
      console.error('Error activating contact form plugin:', error)
      throw new Error('Failed to activate contact form plugin')
    }
  }

  /**
   * Deactivate the plugin
   */
  async deactivate(): Promise<void> {
    try {
      await this.db
        .prepare(`
          UPDATE plugins 
          SET status = 'inactive', last_updated = ? 
          WHERE id = ?
        `)
        .bind(Date.now(), manifest.id)
        .run()
      console.log('Contact form plugin deactivated')
    } catch (error) {
      console.error('Error deactivating contact form plugin:', error)
      throw new Error('Failed to deactivate contact form plugin')
    }
  }

  /**
   * Uninstall the plugin (remove database entry)
   */
  async uninstall(): Promise<void> {
    try {
      await this.db
        .prepare(`DELETE FROM plugins WHERE id = ?`)
        .bind(manifest.id)
        .run()
      console.log('Contact form plugin uninstalled')
    } catch (error) {
      console.error('Error uninstalling contact form plugin:', error)
      throw new Error('Failed to uninstall contact form plugin')
    }
  }
}
