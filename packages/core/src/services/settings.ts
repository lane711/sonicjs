export interface Setting {
  id: string
  category: string
  key: string
  value: string // JSON string
  created_at: number
  updated_at: number
}

export interface GeneralSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  timezone: string
  language: string
  maintenanceMode: boolean
}

export class SettingsService {
  constructor(private db: D1Database) {}

  /**
   * Get a setting value by category and key
   */
  async getSetting(category: string, key: string): Promise<any | null> {
    try {
      const result = await this.db
        .prepare('SELECT value FROM settings WHERE category = ? AND key = ?')
        .bind(category, key)
        .first()

      if (!result) {
        return null
      }

      return JSON.parse((result as any).value)
    } catch (error) {
      console.error(`Error getting setting ${category}.${key}:`, error)
      return null
    }
  }

  /**
   * Get all settings for a category
   */
  async getCategorySettings(category: string): Promise<Record<string, any>> {
    try {
      const { results } = await this.db
        .prepare('SELECT key, value FROM settings WHERE category = ?')
        .bind(category)
        .all()

      const settings: Record<string, any> = {}
      for (const row of results || []) {
        const r = row as any
        settings[r.key] = JSON.parse(r.value)
      }

      return settings
    } catch (error) {
      console.error(`Error getting category settings for ${category}:`, error)
      return {}
    }
  }

  /**
   * Set a setting value
   */
  async setSetting(category: string, key: string, value: any): Promise<boolean> {
    try {
      const now = Date.now()
      const jsonValue = JSON.stringify(value)

      await this.db
        .prepare(`
          INSERT INTO settings (id, category, key, value, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(category, key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        `)
        .bind(crypto.randomUUID(), category, key, jsonValue, now, now)
        .run()

      return true
    } catch (error) {
      console.error(`Error setting ${category}.${key}:`, error)
      return false
    }
  }

  /**
   * Set multiple settings at once
   */
  async setMultipleSettings(category: string, settings: Record<string, any>): Promise<boolean> {
    try {
      const now = Date.now()

      // Use a transaction-like approach with batch operations
      for (const [key, value] of Object.entries(settings)) {
        const jsonValue = JSON.stringify(value)

        await this.db
          .prepare(`
            INSERT INTO settings (id, category, key, value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(category, key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at
          `)
          .bind(crypto.randomUUID(), category, key, jsonValue, now, now)
          .run()
      }

      return true
    } catch (error) {
      console.error(`Error setting multiple settings for ${category}:`, error)
      return false
    }
  }

  /**
   * Get general settings with defaults
   */
  async getGeneralSettings(userEmail?: string): Promise<GeneralSettings> {
    const settings = await this.getCategorySettings('general')

    return {
      siteName: settings.siteName || 'SonicJS AI',
      siteDescription: settings.siteDescription || 'A modern headless CMS powered by AI',
      adminEmail: settings.adminEmail || userEmail || 'admin@example.com',
      timezone: settings.timezone || 'UTC',
      language: settings.language || 'en',
      maintenanceMode: settings.maintenanceMode || false
    }
  }

  /**
   * Save general settings
   */
  async saveGeneralSettings(settings: Partial<GeneralSettings>): Promise<boolean> {
    const settingsToSave: Record<string, any> = {}

    if (settings.siteName !== undefined) settingsToSave.siteName = settings.siteName
    if (settings.siteDescription !== undefined) settingsToSave.siteDescription = settings.siteDescription
    if (settings.adminEmail !== undefined) settingsToSave.adminEmail = settings.adminEmail
    if (settings.timezone !== undefined) settingsToSave.timezone = settings.timezone
    if (settings.language !== undefined) settingsToSave.language = settings.language
    if (settings.maintenanceMode !== undefined) settingsToSave.maintenanceMode = settings.maintenanceMode

    return await this.setMultipleSettings('general', settingsToSave)
  }
}
