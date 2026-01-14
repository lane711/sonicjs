import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireAuth } from '@sonicjs-cms/core'
import { ContactService } from '../services/contact'
import { renderSettingsPage } from '../components/settings-page'

const admin = new Hono()

// Apply authentication middleware to all admin routes
admin.use('*', requireAuth())

/**
 * GET /admin/plugins/contact-form
 * Display the contact form settings page
 */
admin.get('/', async (c: any) => {
  try {
    // Get DB from context (set by SonicJS middleware)
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.html('<h1>Database not available</h1>', 500)
    }

    const service = new ContactService(db)
    const { data } = await service.getSettings()
    
    // Check if Turnstile plugin is available and active
    let turnstileAvailable = false
    try {
      const turnstilePlugin = await db
        .prepare(`SELECT status FROM plugins WHERE id = ? AND status = 'active'`)
        .bind('turnstile')
        .first()
      turnstileAvailable = !!turnstilePlugin
    } catch (error) {
      // Turnstile plugin not found, that's okay - it's optional
      console.log('Turnstile plugin not available (optional integration)')
    }
    
    return c.html(renderSettingsPage(data, turnstileAvailable))
  } catch (error) {
    console.error('Error loading settings page:', error)
    return c.html('<h1>Error loading settings</h1>', 500)
  }
})

/**
 * POST /admin/plugins/contact-form
 * Save contact form settings
 */
admin.post('/', async (c: any) => {
  try {
    const body = await c.req.json()
    
    // Get DB from context
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.json({ success: false, error: 'Database not available' }, 500)
    }

    const service = new ContactService(db)
    await service.saveSettings(body)
    
    return c.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[ContactForm Admin] Error saving settings:', errorMessage)
    console.error('[ContactForm Admin] Full error:', error)
    return c.json({ 
      success: false, 
      error: `Failed to save settings: ${errorMessage}`
    }, 500)
  }
})

/**
 * GET /api/contact-form/messages
 * Get all contact messages
 */
admin.get('/messages', async (c: any) => {
  try {
    const db = c.get('db') || c.env?.DB
    if (!db) {
      return c.json({ success: false, error: 'Database not available' }, 500)
    }

    const service = new ContactService(db)
    const messages = await service.getMessages()
    
    return c.json({ 
      success: true, 
      data: messages 
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to get messages' 
    }, 500)
  }
})

export default admin
