import { describe, test, expect, beforeEach, vi } from 'vitest'
import { SchedulerService } from '../../src/services/scheduler'

// Mock D1Database
const mockDB = {
  prepare: vi.fn(),
  exec: vi.fn(),
  dump: vi.fn(),
  batch: vi.fn()
}

const mockStatement = {
  bind: vi.fn(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn()
}

// Setup mock chain
beforeEach(() => {
  vi.clearAllMocks()
  mockDB.prepare.mockReturnValue(mockStatement)
  mockStatement.bind.mockReturnValue(mockStatement)
  mockStatement.first.mockResolvedValue(null)
  mockStatement.all.mockResolvedValue({ results: [] })
  mockStatement.run.mockResolvedValue({ changes: 1, success: true })
})

describe('SchedulerService', () => {
  let schedulerService: SchedulerService

  beforeEach(() => {
    schedulerService = new SchedulerService(mockDB as any)
  })

  describe('scheduleContent', () => {
    test('should successfully schedule content for publishing', async () => {
      const scheduleDate = new Date('2024-12-31T23:59:00Z')
      
      const scheduleId = await schedulerService.scheduleContent(
        'content-123',
        'publish',
        scheduleDate,
        'America/New_York',
        'user-123'
      )

      expect(scheduleId).toBeDefined()
      expect(typeof scheduleId).toBe('string')
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO scheduled_content'))
      expect(mockStatement.bind).toHaveBeenCalledWith(
        scheduleId,
        'content-123',
        'publish',
        '2024-12-31T23:59:00.000Z',
        'America/New_York',
        'user-123'
      )
    })

    test('should use UTC timezone by default', async () => {
      const scheduleDate = new Date('2024-12-31T23:59:00Z')
      
      await schedulerService.scheduleContent(
        'content-123',
        'unpublish',
        scheduleDate,
        undefined,
        'user-123'
      )

      expect(mockStatement.bind).toHaveBeenCalledWith(
        expect.any(String),
        'content-123',
        'unpublish',
        '2024-12-31T23:59:00.000Z',
        'UTC',
        'user-123'
      )
    })

    test('should handle archive action', async () => {
      const scheduleDate = new Date('2024-12-31T23:59:00Z')
      
      await schedulerService.scheduleContent(
        'content-123',
        'archive',
        scheduleDate,
        'UTC',
        'user-123'
      )

      expect(mockStatement.bind).toHaveBeenCalledWith(
        expect.any(String),
        'content-123',
        'archive',
        expect.any(String),
        'UTC',
        'user-123'
      )
    })
  })

  describe('updateScheduledContent', () => {
    test('should successfully update scheduled content with timezone', async () => {
      const newDate = new Date('2025-01-01T12:00:00Z')
      
      const result = await schedulerService.updateScheduledContent(
        'schedule-123',
        newDate,
        'Europe/London'
      )

      expect(result).toBe(true)
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE scheduled_content'))
      expect(mockStatement.bind).toHaveBeenCalledWith(
        '2025-01-01T12:00:00.000Z',
        'Europe/London',
        'schedule-123'
      )
    })

    test('should update scheduled content without changing timezone', async () => {
      const newDate = new Date('2025-01-01T12:00:00Z')
      
      const result = await schedulerService.updateScheduledContent(
        'schedule-123',
        newDate
      )

      expect(result).toBe(true)
      expect(mockStatement.bind).toHaveBeenCalledWith(
        '2025-01-01T12:00:00.000Z',
        'schedule-123'
      )
    })

    test('should handle update failure', async () => {
      mockStatement.run.mockRejectedValueOnce(new Error('Database error'))
      
      const result = await schedulerService.updateScheduledContent(
        'schedule-123',
        new Date()
      )

      expect(result).toBe(false)
    })
  })

  describe('cancelScheduledContent', () => {
    test('should successfully cancel pending scheduled content', async () => {
      const result = await schedulerService.cancelScheduledContent('schedule-123')

      expect(result).toBe(true)
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE scheduled_content'))
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("SET status = 'cancelled'"))
      expect(mockStatement.bind).toHaveBeenCalledWith('schedule-123')
    })

    test('should handle cancellation failure', async () => {
      mockStatement.run.mockRejectedValueOnce(new Error('Database error'))
      
      const result = await schedulerService.cancelScheduledContent('schedule-123')

      expect(result).toBe(false)
    })
  })

  describe('getPendingScheduledContent', () => {
    test('should return pending scheduled content', async () => {
      const mockScheduledContent = [
        {
          id: 'schedule-1',
          content_id: 'content-123',
          action: 'publish',
          scheduled_at: '2024-12-31T23:59:00Z',
          status: 'pending'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockScheduledContent })

      const result = await schedulerService.getPendingScheduledContent(50)

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE status = 'pending'"))
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("scheduled_at <= datetime('now')"))
      expect(mockStatement.bind).toHaveBeenCalledWith(50)
      expect(result).toEqual(mockScheduledContent)
    })

    test('should use default limit', async () => {
      mockStatement.all.mockResolvedValueOnce({ results: [] })

      await schedulerService.getPendingScheduledContent()

      expect(mockStatement.bind).toHaveBeenCalledWith(100)
    })
  })

  describe('getScheduledContentForUser', () => {
    test('should return scheduled content for specific user', async () => {
      const mockUserContent = [
        {
          id: 'schedule-1',
          content_id: 'content-123',
          title: 'Test Article',
          collection_name: 'Articles',
          action: 'publish',
          scheduled_at: '2024-12-31T23:59:00Z'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockUserContent })

      const result = await schedulerService.getScheduledContentForUser('user-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE sc.user_id = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockUserContent)
    })
  })

  describe('getScheduledContentForContent', () => {
    test('should return scheduled actions for specific content', async () => {
      const mockContentSchedule = [
        {
          id: 'schedule-1',
          content_id: 'content-123',
          action: 'publish',
          scheduled_at: '2024-12-31T23:59:00Z',
          status: 'pending'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockContentSchedule })

      const result = await schedulerService.getScheduledContentForContent('content-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE content_id = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('content-123')
      expect(result).toEqual(mockContentSchedule)
    })
  })

  describe('executeScheduledAction', () => {
    test('should successfully execute publish action', async () => {
      const mockScheduledItem = {
        id: 'schedule-1',
        content_id: 'content-123',
        action: 'publish',
        status: 'pending'
      }

      mockStatement.first.mockResolvedValueOnce(mockScheduledItem)

      const result = await schedulerService.executeScheduledAction('schedule-1')

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(3) // Get item, execute action, update status
    })

    test('should successfully execute unpublish action', async () => {
      const mockScheduledItem = {
        id: 'schedule-1',
        content_id: 'content-123',
        action: 'unpublish',
        status: 'pending'
      }

      mockStatement.first.mockResolvedValueOnce(mockScheduledItem)

      const result = await schedulerService.executeScheduledAction('schedule-1')

      expect(result).toBe(true)
    })

    test('should successfully execute archive action', async () => {
      const mockScheduledItem = {
        id: 'schedule-1',
        content_id: 'content-123',
        action: 'archive',
        status: 'pending'
      }

      mockStatement.first.mockResolvedValueOnce(mockScheduledItem)

      const result = await schedulerService.executeScheduledAction('schedule-1')

      expect(result).toBe(true)
    })

    test('should fail when scheduled item not found', async () => {
      mockStatement.first.mockResolvedValueOnce(null)

      const result = await schedulerService.executeScheduledAction('nonexistent')

      expect(result).toBe(false)
    })

    test('should handle execution errors', async () => {
      const mockScheduledItem = {
        id: 'schedule-1',
        content_id: 'content-123',
        action: 'publish',
        status: 'pending'
      }

      mockStatement.first.mockResolvedValueOnce(mockScheduledItem)
      mockStatement.run.mockRejectedValueOnce(new Error('Execution failed'))

      const result = await schedulerService.executeScheduledAction('schedule-1')

      expect(result).toBe(false)
      // Should mark as failed
      expect(mockStatement.bind).toHaveBeenCalledWith(
        'failed',
        expect.any(String),
        'schedule-1'
      )
    })
  })

  describe('processScheduledContent', () => {
    test('should process multiple pending items', async () => {
      const mockPendingItems = [
        { id: 'schedule-1', content_id: 'content-1', action: 'publish', status: 'pending' },
        { id: 'schedule-2', content_id: 'content-2', action: 'unpublish', status: 'pending' }
      ]

      // Mock getPendingScheduledContent
      mockStatement.all.mockResolvedValueOnce({ results: mockPendingItems })
      
      // Mock executeScheduledAction calls
      mockStatement.first
        .mockResolvedValueOnce(mockPendingItems[0])
        .mockResolvedValueOnce(mockPendingItems[1])

      const result = await schedulerService.processScheduledContent()

      expect(result.processed).toBe(2)
      expect(result.errors).toBe(0)
    })

    test('should handle processing errors', async () => {
      const mockPendingItems = [
        { id: 'schedule-1', content_id: 'content-1', action: 'publish', status: 'pending' }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockPendingItems })
      mockStatement.first.mockResolvedValueOnce(mockPendingItems[0])
      mockStatement.run.mockRejectedValueOnce(new Error('Processing failed'))

      const result = await schedulerService.processScheduledContent()

      expect(result.processed).toBe(0)
      expect(result.errors).toBe(1)
    })

    test('should handle empty pending queue', async () => {
      mockStatement.all.mockResolvedValueOnce({ results: [] })

      const result = await schedulerService.processScheduledContent()

      expect(result.processed).toBe(0)
      expect(result.errors).toBe(0)
    })
  })

  describe('getScheduledContentStats', () => {
    test('should return statistics for all statuses', async () => {
      const mockStats = [
        { status: 'pending', count: 5 },
        { status: 'completed', count: 10 },
        { status: 'failed', count: 2 },
        { status: 'cancelled', count: 1 }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockStats })

      const result = await schedulerService.getScheduledContentStats()

      expect(result).toEqual({
        pending: 5,
        completed: 10,
        failed: 2,
        cancelled: 1
      })
    })

    test('should handle missing status counts', async () => {
      const mockStats = [
        { status: 'pending', count: 3 }
        // Missing other statuses
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockStats })

      const result = await schedulerService.getScheduledContentStats()

      expect(result).toEqual({
        pending: 3,
        completed: 0,
        failed: 0,
        cancelled: 0
      })
    })

    test('should handle empty stats', async () => {
      mockStatement.all.mockResolvedValueOnce({ results: [] })

      const result = await schedulerService.getScheduledContentStats()

      expect(result).toEqual({
        pending: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      })
    })
  })

  describe('Private Action Methods', () => {
    test('publishContent should update content status and workflow', async () => {
      const schedulerService = new SchedulerService(mockDB as any)
      
      // Access private method for testing
      const publishContent = (schedulerService as any).publishContent.bind(schedulerService)
      
      const result = await publishContent('content-123')

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(3) // Update content, workflow status, workflow state
    })

    test('unpublishContent should update content to draft', async () => {
      const schedulerService = new SchedulerService(mockDB as any)
      
      const unpublishContent = (schedulerService as any).unpublishContent.bind(schedulerService)
      
      const result = await unpublishContent('content-123')

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(3)
    })

    test('archiveContent should update content to archived', async () => {
      const schedulerService = new SchedulerService(mockDB as any)
      
      const archiveContent = (schedulerService as any).archiveContent.bind(schedulerService)
      
      const result = await archiveContent('content-123')

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(3)
    })

    test('should handle action execution errors', async () => {
      const schedulerService = new SchedulerService(mockDB as any)
      
      mockStatement.run.mockRejectedValueOnce(new Error('Database error'))
      
      const publishContent = (schedulerService as any).publishContent.bind(schedulerService)
      
      const result = await publishContent('content-123')

      expect(result).toBe(false)
    })
  })
})