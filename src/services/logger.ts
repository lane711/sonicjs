import type { D1Database } from '@cloudflare/workers-types'
import { systemLogs, logConfig, type NewSystemLog, type LogConfig } from '../db/schema'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, gte, lte, desc, asc, count, like, or, inArray } from 'drizzle-orm'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogCategory = 'auth' | 'api' | 'workflow' | 'plugin' | 'media' | 'system' | 'security' | 'error'

export interface LogEntry {
  level: LogLevel
  category: LogCategory
  message: string
  data?: any
  userId?: string
  sessionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  stackTrace?: string
  tags?: string[]
  source?: string
}

export interface LogFilter {
  level?: LogLevel[]
  category?: LogCategory[]
  userId?: string
  source?: string
  search?: string
  startDate?: Date
  endDate?: Date
  tags?: string[]
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'level' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export class Logger {
  private db: ReturnType<typeof drizzle>
  private enabled: boolean = true
  private configCache: Map<string, LogConfig> = new Map()
  private lastConfigRefresh: number = 0
  private configRefreshInterval: number = 60000 // 1 minute

  constructor(database: D1Database) {
    this.db = drizzle(database)
  }

  /**
   * Log a debug message
   */
  async debug(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): Promise<void> {
    return this.log('debug', category, message, data, context)
  }

  /**
   * Log an info message
   */
  async info(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): Promise<void> {
    return this.log('info', category, message, data, context)
  }

  /**
   * Log a warning message
   */
  async warn(category: LogCategory, message: string, data?: any, context?: Partial<LogEntry>): Promise<void> {
    return this.log('warn', category, message, data, context)
  }

  /**
   * Log an error message
   */
  async error(category: LogCategory, message: string, error?: Error | any, context?: Partial<LogEntry>): Promise<void> {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error

    return this.log('error', category, message, errorData, {
      ...context,
      stackTrace: error instanceof Error ? error.stack : undefined
    })
  }

  /**
   * Log a fatal message
   */
  async fatal(category: LogCategory, message: string, error?: Error | any, context?: Partial<LogEntry>): Promise<void> {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error

    return this.log('fatal', category, message, errorData, {
      ...context,
      stackTrace: error instanceof Error ? error.stack : undefined
    })
  }

  /**
   * Log an API request
   */
  async logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Partial<LogEntry>
  ): Promise<void> {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    
    return this.log(level, 'api', `${method} ${url} - ${statusCode}`, {
      method,
      url,
      statusCode,
      duration
    }, {
      ...context,
      method,
      url,
      statusCode,
      duration
    })
  }

  /**
   * Log an authentication event
   */
  async logAuth(action: string, userId?: string, success: boolean = true, context?: Partial<LogEntry>): Promise<void> {
    const level: LogLevel = success ? 'info' : 'warn'
    
    return this.log(level, 'auth', `Authentication ${action}: ${success ? 'success' : 'failed'}`, {
      action,
      success,
      userId
    }, {
      ...context,
      userId,
      tags: ['authentication', action]
    })
  }

  /**
   * Log a security event
   */
  async logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Partial<LogEntry>): Promise<void> {
    const level: LogLevel = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn'
    
    return this.log(level, 'security', `Security event: ${event}`, {
      event,
      severity
    }, {
      ...context,
      tags: ['security', severity]
    })
  }

  /**
   * Core logging method
   */
  private async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    context?: Partial<LogEntry>
  ): Promise<void> {
    if (!this.enabled) return

    try {
      // Check if logging is enabled for this category and level
      const config = await this.getConfig(category)
      if (!config || !config.enabled || !this.shouldLog(level, config.level)) {
        return
      }

      const logEntry: NewSystemLog = {
        id: globalThis.crypto.randomUUID(),
        level,
        category,
        message,
        data: data ? JSON.stringify(data) : null,
        userId: context?.userId || null,
        sessionId: context?.sessionId || null,
        requestId: context?.requestId || null,
        ipAddress: context?.ipAddress || null,
        userAgent: context?.userAgent || null,
        method: context?.method || null,
        url: context?.url || null,
        statusCode: context?.statusCode || null,
        duration: context?.duration || null,
        stackTrace: context?.stackTrace || null,
        tags: context?.tags ? JSON.stringify(context.tags) : null,
        source: context?.source || null,
        createdAt: new Date()
      }

      await this.db.insert(systemLogs).values(logEntry)

      // Check if we need to clean up old logs
      if (config.maxSize) {
        await this.cleanupCategory(category, config.maxSize)
      }

    } catch (error) {
      // Don't log errors in the logger to avoid infinite loops
      console.error('Logger error:', error)
    }
  }

  /**
   * Get logs with filtering and pagination
   */
  async getLogs(filter: LogFilter = {}): Promise<{ logs: any[], total: number }> {
    try {
      const conditions = []
      
      if (filter.level && filter.level.length > 0) {
        conditions.push(inArray(systemLogs.level, filter.level))
      }
      
      if (filter.category && filter.category.length > 0) {
        conditions.push(inArray(systemLogs.category, filter.category))
      }
      
      if (filter.userId) {
        conditions.push(eq(systemLogs.userId, filter.userId))
      }
      
      if (filter.source) {
        conditions.push(eq(systemLogs.source, filter.source))
      }
      
      if (filter.search) {
        conditions.push(
          or(
            like(systemLogs.message, `%${filter.search}%`),
            like(systemLogs.data, `%${filter.search}%`),
            like(systemLogs.url, `%${filter.search}%`)
          )
        )
      }
      
      if (filter.startDate) {
        conditions.push(gte(systemLogs.createdAt, filter.startDate))
      }
      
      if (filter.endDate) {
        conditions.push(lte(systemLogs.createdAt, filter.endDate))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const totalResult = await this.db
        .select({ count: count() })
        .from(systemLogs)
        .where(whereClause)

      const total = totalResult[0]?.count || 0

      // Get logs with pagination and sorting
      const sortColumn = filter.sortBy === 'level' ? systemLogs.level :
                        filter.sortBy === 'category' ? systemLogs.category :
                        systemLogs.createdAt

      const sortFn = filter.sortOrder === 'asc' ? asc : desc

      const logs = await this.db
        .select()
        .from(systemLogs)
        .where(whereClause)
        .orderBy(sortFn(sortColumn))
        .limit(filter.limit || 50)
        .offset(filter.offset || 0)

      return { logs, total }
    } catch (error) {
      console.error('Error getting logs:', error)
      return { logs: [], total: 0 }
    }
  }

  /**
   * Get log configuration for a category
   */
  private async getConfig(category: LogCategory): Promise<LogConfig | null> {
    try {
      // Check cache first
      const now = Date.now()
      if (this.configCache.has(category) && (now - this.lastConfigRefresh) < this.configRefreshInterval) {
        return this.configCache.get(category) || null
      }

      // Refresh config from database
      const configs = await this.db
        .select()
        .from(logConfig)
        .where(eq(logConfig.category, category))

      const config = configs[0] || null
      
      if (config) {
        this.configCache.set(category, config)
        this.lastConfigRefresh = now
      }

      return config
    } catch (error) {
      console.error('Error getting log config:', error)
      return null
    }
  }

  /**
   * Update log configuration
   */
  async updateConfig(category: LogCategory, updates: Partial<LogConfig>): Promise<void> {
    try {
      await this.db
        .update(logConfig)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(logConfig.category, category))

      // Clear cache for this category
      this.configCache.delete(category)
    } catch (error) {
      console.error('Error updating log config:', error)
    }
  }

  /**
   * Get all log configurations
   */
  async getAllConfigs(): Promise<LogConfig[]> {
    try {
      return await this.db.select().from(logConfig)
    } catch (error) {
      console.error('Error getting log configs:', error)
      return []
    }
  }

  /**
   * Clean up old logs for a category
   */
  private async cleanupCategory(category: LogCategory, maxSize: number): Promise<void> {
    try {
      // Count current logs for this category
      const countResult = await this.db
        .select({ count: count() })
        .from(systemLogs)
        .where(eq(systemLogs.category, category))

      const currentCount = countResult[0]?.count || 0

      if (currentCount > maxSize) {
        // Get the cutoff date (keep newest maxSize logs)
        const cutoffLogs = await this.db
          .select({ createdAt: systemLogs.createdAt })
          .from(systemLogs)
          .where(eq(systemLogs.category, category))
          .orderBy(desc(systemLogs.createdAt))
          .limit(1)
          .offset(maxSize - 1)

        if (cutoffLogs[0]) {
          // Delete older logs
          await this.db
            .delete(systemLogs)
            .where(
              and(
                eq(systemLogs.category, category),
                lte(systemLogs.createdAt, cutoffLogs[0].createdAt)
              )
            )
        }
      }
    } catch (error) {
      console.error('Error cleaning up logs:', error)
    }
  }

  /**
   * Clean up logs based on retention policy
   */
  async cleanupByRetention(): Promise<void> {
    try {
      const configs = await this.getAllConfigs()
      
      for (const config of configs) {
        if (config.retention > 0) {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - config.retention)

          await this.db
            .delete(systemLogs)
            .where(
              and(
                eq(systemLogs.category, config.category),
                lte(systemLogs.createdAt, cutoffDate)
              )
            )
        }
      }
    } catch (error) {
      console.error('Error cleaning up logs by retention:', error)
    }
  }

  /**
   * Check if a log level should be recorded based on configuration
   */
  private shouldLog(level: LogLevel, configLevel: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal']
    const levelIndex = levels.indexOf(level)
    const configLevelIndex = levels.indexOf(configLevel)
    
    return levelIndex >= configLevelIndex
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// Singleton logger instance
let loggerInstance: Logger | null = null

/**
 * Get the logger instance
 */
export function getLogger(database?: D1Database): Logger {
  if (!loggerInstance && database) {
    loggerInstance = new Logger(database)
  }
  
  if (!loggerInstance) {
    throw new Error('Logger not initialized. Call getLogger with a database instance first.')
  }
  
  return loggerInstance
}

/**
 * Initialize the logger with a database
 */
export function initLogger(database: D1Database): Logger {
  loggerInstance = new Logger(database)
  return loggerInstance
}