import { Hono } from 'hono'
import { DatabaseToolsService } from './services/database-service'

type Bindings = {
  DB: D1Database
}

export function createDatabaseToolsAdminRoutes() {
  const router = new Hono<{ Bindings: Bindings }>()

  // Get database statistics
  router.get('/api/stats', async (c) => {
    try {
      const user = c.get('user')
      
      if (!user || user.role !== 'admin') {
        return c.json({ 
          success: false, 
          error: 'Unauthorized. Admin access required.' 
        }, 403)
      }

      const db = c.env.DB
      const service = new DatabaseToolsService(db)
      const stats = await service.getDatabaseStats()

      return c.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching database stats:', error)
      return c.json({ 
        success: false, 
        error: 'Failed to fetch database statistics' 
      }, 500)
    }
  })

  // Truncate all data except admin user
  router.post('/api/truncate', async (c) => {
    try {
      const user = c.get('user')
      
      if (!user || user.role !== 'admin') {
        return c.json({ 
          success: false, 
          error: 'Unauthorized. Admin access required.' 
        }, 403)
      }

      const body = await c.req.json()
      const { confirmText } = body

      // Require confirmation text for safety
      if (confirmText !== 'TRUNCATE ALL DATA') {
        return c.json({
          success: false,
          error: 'Invalid confirmation text. Operation cancelled.'
        }, 400)
      }

      const db = c.env.DB
      const service = new DatabaseToolsService(db)
      const result = await service.truncateAllData(user.email)

      return c.json({
        success: result.success,
        message: result.message,
        data: {
          tablesCleared: result.tablesCleared,
          adminUserPreserved: result.adminUserPreserved,
          errors: result.errors
        }
      })
    } catch (error) {
      console.error('Error truncating database:', error)
      return c.json({ 
        success: false, 
        error: 'Failed to truncate database' 
      }, 500)
    }
  })

  // Create backup
  router.post('/api/backup', async (c) => {
    try {
      const user = c.get('user')
      
      if (!user || user.role !== 'admin') {
        return c.json({ 
          success: false, 
          error: 'Unauthorized. Admin access required.' 
        }, 403)
      }

      const db = c.env.DB
      const service = new DatabaseToolsService(db)
      const result = await service.createBackup()

      return c.json({
        success: result.success,
        message: result.message,
        data: {
          backupId: result.backupId
        }
      })
    } catch (error) {
      console.error('Error creating backup:', error)
      return c.json({ 
        success: false, 
        error: 'Failed to create backup' 
      }, 500)
    }
  })

  // Validate database
  router.get('/api/validate', async (c) => {
    try {
      const user = c.get('user')
      
      if (!user || user.role !== 'admin') {
        return c.json({ 
          success: false, 
          error: 'Unauthorized. Admin access required.' 
        }, 403)
      }

      const db = c.env.DB
      const service = new DatabaseToolsService(db)
      const validation = await service.validateDatabase()

      return c.json({
        success: true,
        data: validation
      })
    } catch (error) {
      console.error('Error validating database:', error)
      return c.json({ 
        success: false, 
        error: 'Failed to validate database' 
      }, 500)
    }
  })

  return router
}