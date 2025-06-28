import { describe, test, expect, beforeEach, vi } from 'vitest'
import { WorkflowEngine } from '../../src/services/workflow'

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

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine

  beforeEach(() => {
    workflowEngine = new WorkflowEngine(mockDB as any)
  })

  describe('getWorkflowStates', () => {
    test('should return workflow states ordered correctly', async () => {
      const mockStates = [
        { id: 'draft', name: 'Draft', is_initial: 1, color: '#F59E0B' },
        { id: 'published', name: 'Published', is_initial: 0, color: '#059669' }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockStates })

      const result = await workflowEngine.getWorkflowStates()

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM workflow_states'))
      expect(result).toEqual(mockStates)
    })
  })

  describe('getWorkflow', () => {
    test('should return workflow by ID', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        collection_id: 'articles',
        is_active: true
      }

      mockStatement.first.mockResolvedValueOnce(mockWorkflow)

      const result = await workflowEngine.getWorkflow('workflow-1')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM workflows WHERE id = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('workflow-1')
      expect(result).toEqual(mockWorkflow)
    })

    test('should return null when workflow not found', async () => {
      mockStatement.first.mockResolvedValueOnce(null)

      const result = await workflowEngine.getWorkflow('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getWorkflowByCollection', () => {
    test('should return active workflow for collection', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Articles Workflow',
        collection_id: 'articles',
        is_active: 1
      }

      mockStatement.first.mockResolvedValueOnce(mockWorkflow)

      const result = await workflowEngine.getWorkflowByCollection('articles')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE collection_id = ? AND is_active = 1'))
      expect(mockStatement.bind).toHaveBeenCalledWith('articles')
      expect(result).toEqual(mockWorkflow)
    })
  })

  describe('getWorkflowTransitions', () => {
    test('should return transitions for workflow', async () => {
      const mockTransitions = [
        {
          id: 'trans-1',
          workflow_id: 'workflow-1',
          from_state_id: 'draft',
          to_state_id: 'review',
          required_permission: 'content:submit'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockTransitions })

      const result = await workflowEngine.getWorkflowTransitions('workflow-1')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM workflow_transitions'))
      expect(mockStatement.bind).toHaveBeenCalledWith('workflow-1')
      expect(result).toEqual(mockTransitions)
    })
  })

  describe('getAvailableTransitions', () => {
    test('should return available transitions for user and state', async () => {
      const mockTransitions = [
        {
          id: 'trans-1',
          workflow_id: 'workflow-1',
          from_state_id: 'draft',
          to_state_id: 'review',
          required_permission: 'content:submit'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockTransitions })

      const result = await workflowEngine.getAvailableTransitions('workflow-1', 'draft', 'user-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('workflow_transitions wt'))
      expect(mockStatement.bind).toHaveBeenCalledWith('workflow-1', 'draft', 'user-123')
      expect(result).toEqual(mockTransitions)
    })
  })

  describe('getContentWorkflowStatus', () => {
    test('should return workflow status for content', async () => {
      const mockStatus = {
        id: 'status-1',
        content_id: 'content-123',
        workflow_id: 'workflow-1',
        current_state_id: 'draft',
        assigned_to: 'user-456'
      }

      mockStatement.first.mockResolvedValueOnce(mockStatus)

      const result = await workflowEngine.getContentWorkflowStatus('content-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM content_workflow_status WHERE content_id = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('content-123')
      expect(result).toEqual(mockStatus)
    })
  })

  describe('transitionContent', () => {
    test('should successfully transition content when valid', async () => {
      // Mock current status
      const mockCurrentStatus = {
        id: 'status-1',
        content_id: 'content-123',
        workflow_id: 'workflow-1',
        current_state_id: 'draft'
      }

      // Mock available transitions
      const mockTransitions = [
        {
          id: 'trans-1',
          workflow_id: 'workflow-1',
          from_state_id: 'draft',
          to_state_id: 'review'
        }
      ]

      // Set up mock responses in sequence
      mockStatement.first
        .mockResolvedValueOnce(mockCurrentStatus) // getContentWorkflowStatus
      
      mockStatement.all
        .mockResolvedValueOnce({ results: mockTransitions }) // getAvailableTransitions

      const result = await workflowEngine.transitionContent(
        'content-123',
        'review',
        'user-123',
        'Moving to review'
      )

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(3) // Update status, update content, insert history
    })

    test('should fail transition when no current status found', async () => {
      mockStatement.first.mockResolvedValueOnce(null)

      const result = await workflowEngine.transitionContent(
        'content-123',
        'review',
        'user-123'
      )

      expect(result).toBe(false)
    })

    test('should fail transition when transition not allowed', async () => {
      const mockCurrentStatus = {
        id: 'status-1',
        content_id: 'content-123',
        workflow_id: 'workflow-1',
        current_state_id: 'draft'
      }

      mockStatement.first.mockResolvedValueOnce(mockCurrentStatus)
      mockStatement.all.mockResolvedValueOnce({ results: [] }) // No available transitions

      const result = await workflowEngine.transitionContent(
        'content-123',
        'published',
        'user-123'
      )

      expect(result).toBe(false)
    })

    test('should auto-publish when transitioning to published state', async () => {
      const mockCurrentStatus = {
        id: 'status-1',
        content_id: 'content-123',
        workflow_id: 'workflow-1',
        current_state_id: 'approved'
      }

      const mockTransitions = [
        {
          id: 'trans-1',
          workflow_id: 'workflow-1',
          from_state_id: 'approved',
          to_state_id: 'published'
        }
      ]

      mockStatement.first.mockResolvedValueOnce(mockCurrentStatus)
      mockStatement.all.mockResolvedValueOnce({ results: mockTransitions })

      const result = await workflowEngine.transitionContent(
        'content-123',
        'published',
        'user-123'
      )

      expect(result).toBe(true)
      // Should call run 4 times: status update, content workflow state, history, auto-publish
      expect(mockStatement.run).toHaveBeenCalledTimes(4)
    })
  })

  describe('initializeContentWorkflow', () => {
    test('should successfully initialize workflow for new content', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        collection_id: 'articles',
        is_active: 1
      }

      const mockInitialState = {
        id: 'draft'
      }

      mockStatement.first
        .mockResolvedValueOnce(mockWorkflow) // getWorkflowByCollection
        .mockResolvedValueOnce(mockInitialState) // get initial state

      const result = await workflowEngine.initializeContentWorkflow('content-123', 'articles')

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledTimes(2) // Insert status, update content
    })

    test('should fail when no workflow found for collection', async () => {
      mockStatement.first.mockResolvedValueOnce(null)

      const result = await workflowEngine.initializeContentWorkflow('content-123', 'nonexistent')

      expect(result).toBe(false)
    })

    test('should fail when no initial state found', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        collection_id: 'articles',
        is_active: 1
      }

      mockStatement.first
        .mockResolvedValueOnce(mockWorkflow)
        .mockResolvedValueOnce(null) // No initial state

      const result = await workflowEngine.initializeContentWorkflow('content-123', 'articles')

      expect(result).toBe(false)
    })
  })

  describe('getWorkflowHistory', () => {
    test('should return workflow history with user and state names', async () => {
      const mockHistory = [
        {
          id: 'hist-1',
          content_id: 'content-123',
          from_state_id: 'draft',
          to_state_id: 'review',
          user_id: 'user-123',
          user_name: 'John Doe',
          from_state_name: 'Draft',
          to_state_name: 'Review',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockHistory })

      const result = await workflowEngine.getWorkflowHistory('content-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN users u'))
      expect(mockStatement.bind).toHaveBeenCalledWith('content-123')
      expect(result).toEqual(mockHistory)
    })
  })

  describe('assignContentToUser', () => {
    test('should successfully assign content to user', async () => {
      const result = await workflowEngine.assignContentToUser(
        'content-123',
        'user-456',
        '2024-12-31'
      )

      expect(result).toBe(true)
      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE content_workflow_status'))
      expect(mockStatement.bind).toHaveBeenCalledWith('user-456', '2024-12-31', 'content-123')
      expect(mockStatement.run).toHaveBeenCalled()
    })

    test('should handle assignment without due date', async () => {
      const result = await workflowEngine.assignContentToUser('content-123', 'user-456')

      expect(result).toBe(true)
      expect(mockStatement.bind).toHaveBeenCalledWith('user-456', null, 'content-123')
    })

    test('should handle assignment failure', async () => {
      mockStatement.run.mockRejectedValueOnce(new Error('Database error'))

      const result = await workflowEngine.assignContentToUser('content-123', 'user-456')

      expect(result).toBe(false)
    })
  })

  describe('getAssignedContent', () => {
    test('should return content assigned to user', async () => {
      const mockAssignedContent = [
        {
          id: 'content-123',
          title: 'Test Article',
          current_state_id: 'review',
          due_date: '2024-12-31',
          state_name: 'Review',
          state_color: '#3B82F6',
          collection_name: 'Articles'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockAssignedContent })

      const result = await workflowEngine.getAssignedContent('user-123')

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE cws.assigned_to = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockAssignedContent)
    })
  })

  describe('getContentByState', () => {
    test('should return content in specified state', async () => {
      const mockContent = [
        {
          id: 'content-123',
          title: 'Test Article',
          current_state_id: 'draft',
          state_name: 'Draft',
          state_color: '#F59E0B',
          collection_name: 'Articles',
          assigned_to_name: 'John Doe'
        }
      ]

      mockStatement.all.mockResolvedValueOnce({ results: mockContent })

      const result = await workflowEngine.getContentByState('draft', 25)

      expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE cws.current_state_id = ?'))
      expect(mockStatement.bind).toHaveBeenCalledWith('draft', 25)
      expect(result).toEqual(mockContent)
    })

    test('should use default limit when not specified', async () => {
      mockStatement.all.mockResolvedValueOnce({ results: [] })

      await workflowEngine.getContentByState('draft')

      expect(mockStatement.bind).toHaveBeenCalledWith('draft', 50)
    })
  })
})

describe('WorkflowEngine Error Handling', () => {
  let workflowEngine: WorkflowEngine

  beforeEach(() => {
    workflowEngine = new WorkflowEngine(mockDB as any)
  })

  test('should handle database errors gracefully in transitionContent', async () => {
    mockStatement.first.mockRejectedValueOnce(new Error('Database connection failed'))

    const result = await workflowEngine.transitionContent(
      'content-123',
      'review',
      'user-123'
    )

    expect(result).toBe(false)
  })

  test('should handle database errors gracefully in initializeContentWorkflow', async () => {
    mockStatement.first.mockRejectedValueOnce(new Error('Database error'))

    const result = await workflowEngine.initializeContentWorkflow('content-123', 'articles')

    expect(result).toBe(false)
  })

  test('should handle empty results gracefully', async () => {
    mockStatement.all.mockResolvedValueOnce({ results: null })

    const result = await workflowEngine.getWorkflowStates()

    expect(result).toEqual(null)
  })
})