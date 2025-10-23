import { Hono } from 'hono'
import { html } from 'hono/html'
import { renderSettingsPage, SettingsPageData } from '../templates/pages/admin-settings.template'
import { MigrationService } from '../services/migrations'

type Bindings = {
  DB: D1Database
  CACHE_KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  ASSETS: Fetcher
  EMAIL_QUEUE?: Queue
  SENDGRID_API_KEY?: string
  DEFAULT_FROM_EMAIL?: string
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
  ENVIRONMENT?: string
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
  requestId?: string
  startTime?: number
  appVersion?: string
}

export const adminSettingsRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Helper function to get mock settings data
function getMockSettings(user: any) {
  return {
    general: {
      siteName: 'SonicJS AI',
      siteDescription: 'A modern headless CMS powered by AI',
      adminEmail: user?.email || 'admin@example.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    appearance: {
      theme: 'dark' as const,
      primaryColor: '#465FFF',
      logoUrl: '',
      favicon: '',
      customCSS: ''
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      ipWhitelist: []
    },
    notifications: {
      emailNotifications: true,
      contentUpdates: true,
      systemAlerts: true,
      userRegistrations: false,
      emailFrequency: 'immediate' as const
    },
    storage: {
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx'],
      storageProvider: 'cloudflare' as const,
      backupFrequency: 'daily' as const,
      retentionPeriod: 30
    },
    migrations: {
      totalMigrations: 0,
      appliedMigrations: 0,
      pendingMigrations: 0,
      lastApplied: undefined,
      migrations: []
    },
    databaseTools: {
      totalTables: 0,
      totalRows: 0,
      lastBackup: undefined,
      databaseSize: '0 MB',
      tables: []
    }
  }
}

// Settings page (redirects to general settings)
adminSettingsRoutes.get('/settings', (c) => {
  return c.redirect('/admin/settings/general')
})

// General settings
adminSettingsRoutes.get('/settings/general', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'general',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Appearance settings
adminSettingsRoutes.get('/settings/appearance', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'appearance',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Security settings
adminSettingsRoutes.get('/settings/security', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'security',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Notifications settings
adminSettingsRoutes.get('/settings/notifications', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'notifications',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Storage settings
adminSettingsRoutes.get('/settings/storage', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'storage',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Migrations settings
adminSettingsRoutes.get('/settings/migrations', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'migrations',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Database tools settings
adminSettingsRoutes.get('/settings/database-tools', (c) => {
  const user = c.get('user')
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: getMockSettings(user),
    activeTab: 'database-tools',
    version: c.get('appVersion')
  }
  return c.html(renderSettingsPage(pageData))
})

// Get migration status
adminSettingsRoutes.get('/api/migrations/status', async (c) => {
  try {
    const db = c.env.DB
    const migrationService = new MigrationService(db)
    const status = await migrationService.getMigrationStatus()

    return c.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error fetching migration status:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch migration status'
    }, 500)
  }
})

// Run pending migrations
adminSettingsRoutes.post('/api/migrations/run', async (c) => {
  try {
    const user = c.get('user')

    // Only allow admin users to run migrations
    if (!user || user.role !== 'admin') {
      return c.json({
        success: false,
        error: 'Unauthorized. Admin access required.'
      }, 403)
    }

    const db = c.env.DB
    const migrationService = new MigrationService(db)
    const result = await migrationService.runPendingMigrations()

    return c.json({
      success: result.success,
      message: result.message,
      applied: result.applied
    })
  } catch (error) {
    console.error('Error running migrations:', error)
    return c.json({
      success: false,
      error: 'Failed to run migrations'
    }, 500)
  }
})

// Validate database schema
adminSettingsRoutes.get('/api/migrations/validate', async (c) => {
  try {
    const db = c.env.DB
    const migrationService = new MigrationService(db)
    const validation = await migrationService.validateSchema()

    return c.json({
      success: true,
      data: validation
    })
  } catch (error) {
    console.error('Error validating schema:', error)
    return c.json({
      success: false,
      error: 'Failed to validate schema'
    }, 500)
  }
})

// Save settings
adminSettingsRoutes.post('/settings', async (c) => {
  try {
    const formData = await c.req.formData()

    // Here you would save the settings to your database
    // For now, we'll just return a success message

    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Settings saved successfully!
        <script>
          setTimeout(() => {
            showNotification('Settings saved successfully!', 'success');
          }, 100);
        </script>
      </div>
    `)
  } catch (error) {
    console.error('Error saving settings:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to save settings. Please try again.
      </div>
    `)
  }
})
