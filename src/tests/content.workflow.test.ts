import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  ContentStatus, 
  WorkflowAction, 
  WorkflowManager,
  WorkflowPermissions,
  defaultWorkflowPermissions,
  workflowTransitions
} from '../content/workflow'

// Mock dependencies
const createMockDb = () => ({
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn()
  })
})

describe('Content Workflow', () => {
  let workflowManager: WorkflowManager
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = createMockDb()
    workflowManager = new WorkflowManager(mockDb)
  })

  describe('ContentStatus enum', () => {
    it('should have correct status values', () => {
      expect(ContentStatus.DRAFT).toBe('draft')
      expect(ContentStatus.REVIEW).toBe('review')
      expect(ContentStatus.SCHEDULED).toBe('scheduled')
      expect(ContentStatus.PUBLISHED).toBe('published')
      expect(ContentStatus.ARCHIVED).toBe('archived')
      expect(ContentStatus.DELETED).toBe('deleted')
    })
  })

  describe('WorkflowAction enum', () => {
    it('should have correct action values', () => {
      expect(WorkflowAction.SAVE_DRAFT).toBe('save_draft')
      expect(WorkflowAction.SUBMIT_FOR_REVIEW).toBe('submit_for_review')
      expect(WorkflowAction.APPROVE).toBe('approve')
      expect(WorkflowAction.REJECT).toBe('reject')
      expect(WorkflowAction.PUBLISH).toBe('publish')
      expect(WorkflowAction.UNPUBLISH).toBe('unpublish')
      expect(WorkflowAction.SCHEDULE).toBe('schedule')
      expect(WorkflowAction.ARCHIVE).toBe('archive')
      expect(WorkflowAction.DELETE).toBe('delete')
      expect(WorkflowAction.RESTORE).toBe('restore')
    })
  })

  describe('defaultWorkflowPermissions', () => {
    it('should define permissions for all content statuses', () => {
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.DRAFT)
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.REVIEW)
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.SCHEDULED)
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.PUBLISHED)
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.ARCHIVED)
      expect(defaultWorkflowPermissions).toHaveProperty(ContentStatus.DELETED)
    })

    it('should allow admin access to all statuses', () => {
      Object.values(defaultWorkflowPermissions).forEach(permissions => {
        expect(permissions).toContain('admin')
      })
    })

    it('should restrict deleted content to admin only', () => {
      expect(defaultWorkflowPermissions[ContentStatus.DELETED]).toEqual(['admin'])
    })

    it('should allow authors to create drafts', () => {
      expect(defaultWorkflowPermissions[ContentStatus.DRAFT]).toContain('author')
    })
  })

  describe('workflowTransitions', () => {
    it('should define transitions for all content statuses', () => {
      expect(workflowTransitions).toHaveProperty(ContentStatus.DRAFT)
      expect(workflowTransitions).toHaveProperty(ContentStatus.REVIEW)
      expect(workflowTransitions).toHaveProperty(ContentStatus.SCHEDULED)
      expect(workflowTransitions).toHaveProperty(ContentStatus.PUBLISHED)
      expect(workflowTransitions).toHaveProperty(ContentStatus.ARCHIVED)
      expect(workflowTransitions).toHaveProperty(ContentStatus.DELETED)
    })

    it('should allow publishing from draft', () => {
      expect(workflowTransitions[ContentStatus.DRAFT]).toContain(WorkflowAction.PUBLISH)
    })

    it('should allow scheduling from draft', () => {
      expect(workflowTransitions[ContentStatus.DRAFT]).toContain(WorkflowAction.SCHEDULE)
    })

    it('should allow unpublishing from published', () => {
      expect(workflowTransitions[ContentStatus.PUBLISHED]).toContain(WorkflowAction.UNPUBLISH)
    })

    it('should allow restoring from deleted', () => {
      expect(workflowTransitions[ContentStatus.DELETED]).toContain(WorkflowAction.RESTORE)
    })
  })

  describe('WorkflowManager', () => {
    describe('canPerformAction', () => {
      it('should allow valid workflow transitions', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DRAFT,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const canPublish = await workflowManager.canPerformAction(
          'content-1',
          WorkflowAction.PUBLISH,
          'user-1',
          'admin'
        )

        expect(canPublish).toBe(true)
      })

      it('should reject invalid workflow transitions', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.PUBLISHED,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const canSubmitForReview = await workflowManager.canPerformAction(
          'content-1',
          WorkflowAction.SUBMIT_FOR_REVIEW,
          'user-1',
          'admin'
        )

        expect(canSubmitForReview).toBe(false)
      })

      it('should check user permissions for content status', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DELETED,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const authorCanRestore = await workflowManager.canPerformAction(
          'content-1',
          WorkflowAction.RESTORE,
          'user-1',
          'author'
        )

        const adminCanRestore = await workflowManager.canPerformAction(
          'content-1',
          WorkflowAction.RESTORE,
          'user-2',
          'admin'
        )

        expect(authorCanRestore).toBe(false) // Authors can't access deleted content
        expect(adminCanRestore).toBe(true)   // Admins can access deleted content
      })

      it('should handle non-existent content', async () => {
        mockDb.prepare().first.mockResolvedValue(null)

        const result = await workflowManager.canPerformAction(
          'non-existent',
          WorkflowAction.PUBLISH,
          'user-1',
          'admin'
        )

        expect(result).toBe(false)
      })

      it('should handle database errors', async () => {
        mockDb.prepare().first.mockRejectedValue(new Error('Database error'))

        const result = await workflowManager.canPerformAction(
          'content-1',
          WorkflowAction.PUBLISH,
          'user-1',
          'admin'
        )

        expect(result).toBe(false)
      })
    })

    describe('performAction', () => {
      it('should perform valid workflow action successfully', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DRAFT,
          author_id: 'user-1' 
        }

        mockDb.prepare()
          .first.mockResolvedValueOnce(mockContent) // canPerformAction check
          .run.mockResolvedValueOnce({ success: true }) // status update
          .run.mockResolvedValueOnce({ success: true }) // audit log

        const result = await workflowManager.performAction(
          'content-1',
          WorkflowAction.PUBLISH,
          'user-1',
          'admin',
          { publishedAt: new Date() }
        )

        expect(result.success).toBe(true)
        expect(result.newStatus).toBe(ContentStatus.PUBLISHED)

        // Verify database updates
        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE content SET status = ?')
        )
        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO content_audit_log')
        )
      })

      it('should reject unauthorized actions', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DELETED,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const result = await workflowManager.performAction(
          'content-1',
          WorkflowAction.RESTORE,
          'user-1',
          'author' // Authors can't access deleted content
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('Action not allowed')
      })

      it('should handle scheduling workflow', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DRAFT,
          author_id: 'user-1' 
        }

        mockDb.prepare()
          .first.mockResolvedValueOnce(mockContent)
          .run.mockResolvedValue({ success: true })

        const scheduledDate = new Date('2024-12-31T00:00:00Z')
        const result = await workflowManager.performAction(
          'content-1',
          WorkflowAction.SCHEDULE,
          'user-1',
          'editor',
          { scheduledAt: scheduledDate }
        )

        expect(result.success).toBe(true)
        expect(result.newStatus).toBe(ContentStatus.SCHEDULED)
      })

      it('should handle unpublish workflow', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.PUBLISHED,
          author_id: 'user-1' 
        }

        mockDb.prepare()
          .first.mockResolvedValueOnce(mockContent)
          .run.mockResolvedValue({ success: true })

        const result = await workflowManager.performAction(
          'content-1',
          WorkflowAction.UNPUBLISH,
          'user-1',
          'editor'
        )

        expect(result.success).toBe(true)
        expect(result.newStatus).toBe(ContentStatus.DRAFT)
      })

      it('should handle database errors during action', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DRAFT,
          author_id: 'user-1' 
        }

        mockDb.prepare()
          .first.mockResolvedValueOnce(mockContent)
          .run.mockRejectedValueOnce(new Error('Database update failed'))

        const result = await workflowManager.performAction(
          'content-1',
          WorkflowAction.PUBLISH,
          'user-1',
          'admin'
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('Database update failed')
      })
    })

    describe('getWorkflowHistory', () => {
      it('should get workflow history for content', async () => {
        const mockHistory = [
          {
            id: '1',
            content_id: 'content-1',
            action: WorkflowAction.SAVE_DRAFT,
            from_status: null,
            to_status: ContentStatus.DRAFT,
            user_id: 'user-1',
            timestamp: 1640995200000,
            metadata: '{}'
          },
          {
            id: '2',
            content_id: 'content-1',
            action: WorkflowAction.PUBLISH,
            from_status: ContentStatus.DRAFT,
            to_status: ContentStatus.PUBLISHED,
            user_id: 'user-1',
            timestamp: 1640995300000,
            metadata: '{"publishedAt": "2024-01-01T00:00:00Z"}'
          }
        ]

        mockDb.prepare().all.mockResolvedValue({ results: mockHistory })

        const result = await workflowManager.getWorkflowHistory('content-1')

        expect(result).toHaveLength(2)
        expect(result[0].action).toBe(WorkflowAction.SAVE_DRAFT)
        expect(result[1].action).toBe(WorkflowAction.PUBLISH)
        expect(result[1].metadata).toEqual({ publishedAt: '2024-01-01T00:00:00Z' })

        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM content_audit_log WHERE content_id = ?')
        )
      })

      it('should handle empty workflow history', async () => {
        mockDb.prepare().all.mockResolvedValue({ results: [] })

        const result = await workflowManager.getWorkflowHistory('content-1')

        expect(result).toEqual([])
      })

      it('should handle database errors in history retrieval', async () => {
        mockDb.prepare().all.mockRejectedValue(new Error('Query failed'))

        await expect(workflowManager.getWorkflowHistory('content-1')).rejects.toThrow(
          'Query failed'
        )
      })
    })

    describe('getAvailableActions', () => {
      it('should return available actions for content status', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DRAFT,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const actions = await workflowManager.getAvailableActions('content-1', 'user-1', 'editor')

        expect(actions).toContain(WorkflowAction.SAVE_DRAFT)
        expect(actions).toContain(WorkflowAction.SUBMIT_FOR_REVIEW)
        expect(actions).toContain(WorkflowAction.PUBLISH)
        expect(actions).toContain(WorkflowAction.SCHEDULE)
      })

      it('should filter actions based on user permissions', async () => {
        const mockContent = { 
          id: 'content-1', 
          status: ContentStatus.DELETED,
          author_id: 'user-1' 
        }

        mockDb.prepare().first.mockResolvedValue(mockContent)

        const authorActions = await workflowManager.getAvailableActions('content-1', 'user-1', 'author')
        const adminActions = await workflowManager.getAvailableActions('content-1', 'user-2', 'admin')

        expect(authorActions).toEqual([]) // Authors can't access deleted content
        expect(adminActions).toContain(WorkflowAction.RESTORE) // Admins can restore
      })

      it('should handle non-existent content in available actions', async () => {
        mockDb.prepare().first.mockResolvedValue(null)

        const actions = await workflowManager.getAvailableActions('non-existent', 'user-1', 'admin')

        expect(actions).toEqual([])
      })
    })

    describe('bulkUpdateStatus', () => {
      it('should update multiple content items status', async () => {
        const contentIds = ['content-1', 'content-2', 'content-3']
        
        mockDb.prepare().run.mockResolvedValue({ success: true })

        const result = await workflowManager.bulkUpdateStatus(
          contentIds,
          ContentStatus.ARCHIVED,
          'user-1',
          'admin',
          { reason: 'Bulk archive operation' }
        )

        expect(result.success).toBe(true)
        expect(result.updatedCount).toBe(3)

        // Should call update for each content item
        expect(mockDb.prepare).toHaveBeenCalledTimes(6) // 3 updates + 3 audit logs
      })

      it('should handle partial failures in bulk update', async () => {
        const contentIds = ['content-1', 'content-2']
        
        mockDb.prepare().run
          .mockResolvedValueOnce({ success: true })  // First update succeeds
          .mockResolvedValueOnce({ success: true })  // First audit log
          .mockRejectedValueOnce(new Error('Update failed')) // Second update fails

        const result = await workflowManager.bulkUpdateStatus(
          contentIds,
          ContentStatus.ARCHIVED,
          'user-1',
          'admin'
        )

        expect(result.success).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors![0]).toContain('content-2')
      })

      it('should validate bulk update permissions', async () => {
        const contentIds = ['content-1']
        
        const result = await workflowManager.bulkUpdateStatus(
          contentIds,
          ContentStatus.DELETED,
          'user-1',
          'author' // Authors can't delete content
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('Insufficient permissions for bulk operation')
      })
    })

    describe('custom workflow permissions', () => {
      it('should use custom workflow permissions', () => {
        const customPermissions: WorkflowPermissions = {
          [ContentStatus.DRAFT]: ['admin', 'editor'],
          [ContentStatus.REVIEW]: ['admin'],
          [ContentStatus.SCHEDULED]: ['admin'],
          [ContentStatus.PUBLISHED]: ['admin'],
          [ContentStatus.ARCHIVED]: ['admin'],
          [ContentStatus.DELETED]: ['admin']
        }

        const customWorkflow = new WorkflowManager(mockDb, customPermissions)

        const canCreateDraft = (customWorkflow as any).hasPermissionForStatus('author', ContentStatus.DRAFT)
        const canCreateDraftEditor = (customWorkflow as any).hasPermissionForStatus('editor', ContentStatus.DRAFT)

        expect(canCreateDraft).toBe(false)  // Author not in custom permissions
        expect(canCreateDraftEditor).toBe(true) // Editor is in custom permissions
      })
    })

    describe('edge cases', () => {
      it('should handle malformed metadata in audit log', async () => {
        const mockHistory = [
          {
            id: '1',
            content_id: 'content-1',
            action: WorkflowAction.PUBLISH,
            from_status: ContentStatus.DRAFT,
            to_status: ContentStatus.PUBLISHED,
            user_id: 'user-1',
            timestamp: 1640995200000,
            metadata: 'invalid json{'
          }
        ]

        mockDb.prepare().all.mockResolvedValue({ results: mockHistory })

        const result = await workflowManager.getWorkflowHistory('content-1')

        expect(result[0].metadata).toEqual({}) // Should default to empty object
      })

      it('should handle null metadata in audit log', async () => {
        const mockHistory = [
          {
            id: '1',
            content_id: 'content-1',
            action: WorkflowAction.PUBLISH,
            from_status: ContentStatus.DRAFT,
            to_status: ContentStatus.PUBLISHED,
            user_id: 'user-1',
            timestamp: 1640995200000,
            metadata: null
          }
        ]

        mockDb.prepare().all.mockResolvedValue({ results: mockHistory })

        const result = await workflowManager.getWorkflowHistory('content-1')

        expect(result[0].metadata).toEqual({})
      })
    })
  })
})