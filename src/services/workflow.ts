// @ts-nocheck
import { D1Database } from '@cloudflare/workers-types'

export interface WorkflowState {
  id: string
  name: string
  description?: string
  color: string
  is_initial: boolean
  is_final: boolean
}

export interface Workflow {
  id: string
  name: string
  description?: string
  collection_id?: string
  is_active: boolean
  auto_publish: boolean
  require_approval: boolean
  approval_levels: number
}

export interface WorkflowTransition {
  id: string
  workflow_id: string
  from_state_id: string
  to_state_id: string
  required_permission?: string
  auto_transition: boolean
  transition_conditions?: any
}

export interface ContentWorkflowStatus {
  id: string
  content_id: string
  workflow_id: string
  current_state_id: string
  assigned_to?: string
  due_date?: string
}

export interface WorkflowHistoryEntry {
  id: string
  content_id: string
  workflow_id: string
  from_state_id?: string
  to_state_id: string
  user_id: string
  comment?: string
  metadata?: any
  created_at: string
}

export class WorkflowEngine {
  constructor(private db: D1Database) {}

  async getWorkflowStates(): Promise<WorkflowState[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM workflow_states 
      ORDER BY is_initial DESC, name ASC
    `).all()
    
    return results as WorkflowState[]
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    const workflow = await this.db.prepare(`
      SELECT * FROM workflows WHERE id = ?
    `).bind(workflowId).first()
    
    return workflow as Workflow | null
  }

  async getWorkflowByCollection(collectionId: string): Promise<Workflow | null> {
    const workflow = await this.db.prepare(`
      SELECT * FROM workflows 
      WHERE collection_id = ? AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(collectionId).first()
    
    return workflow as Workflow | null
  }

  async getWorkflowTransitions(workflowId: string): Promise<WorkflowTransition[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM workflow_transitions 
      WHERE workflow_id = ?
      ORDER BY from_state_id, to_state_id
    `).bind(workflowId).all()
    
    return results as WorkflowTransition[]
  }

  async getAvailableTransitions(workflowId: string, currentStateId: string, userId: string): Promise<WorkflowTransition[]> {
    // Get user permissions (simplified - would integrate with permission system)
    const { results } = await this.db.prepare(`
      SELECT wt.* 
      FROM workflow_transitions wt
      WHERE wt.workflow_id = ? AND wt.from_state_id = ?
      AND (wt.required_permission IS NULL OR 
           EXISTS (
             SELECT 1 FROM user_permissions up 
             WHERE up.user_id = ? AND up.permission = wt.required_permission
           ))
    `).bind(workflowId, currentStateId, userId).all()
    
    return results as WorkflowTransition[]
  }

  async getContentWorkflowStatus(contentId: string): Promise<ContentWorkflowStatus | null> {
    const status = await this.db.prepare(`
      SELECT * FROM content_workflow_status WHERE content_id = ?
    `).bind(contentId).first()
    
    return status as ContentWorkflowStatus | null
  }

  async transitionContent(
    contentId: string, 
    toStateId: string, 
    userId: string, 
    comment?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Get current status
      const currentStatus = await this.getContentWorkflowStatus(contentId)
      if (!currentStatus) {
        throw new Error('Content workflow status not found')
      }

      // Validate transition is allowed
      const availableTransitions = await this.getAvailableTransitions(
        currentStatus.workflow_id, 
        currentStatus.current_state_id, 
        userId
      )
      
      const validTransition = availableTransitions.find(t => t.to_state_id === toStateId)
      if (!validTransition) {
        throw new Error('Transition not allowed')
      }

      // Begin transaction
      await this.db.prepare(`
        UPDATE content_workflow_status 
        SET current_state_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE content_id = ?
      `).bind(toStateId, contentId).run()

      // Update content table workflow state
      await this.db.prepare(`
        UPDATE content 
        SET workflow_state_id = ?, updated_at = ?
        WHERE id = ?
      `).bind(toStateId, Date.now(), contentId).run()

      // Record history
      await this.db.prepare(`
        INSERT INTO workflow_history 
        (content_id, workflow_id, from_state_id, to_state_id, user_id, comment, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        contentId,
        currentStatus.workflow_id,
        currentStatus.current_state_id,
        toStateId,
        userId,
        comment || null,
        metadata ? JSON.stringify(metadata) : null
      ).run()

      // Auto-publish if state is 'published'
      if (toStateId === 'published') {
        await this.db.prepare(`
          UPDATE content 
          SET status = 'published', published_at = ?
          WHERE id = ?
        `).bind(Date.now(), contentId).run()
      }

      return true
    } catch (error) {
      console.error('Workflow transition failed:', error)
      return false
    }
  }

  async initializeContentWorkflow(contentId: string, collectionId: string): Promise<boolean> {
    try {
      // Get workflow for collection
      const workflow = await this.getWorkflowByCollection(collectionId)
      if (!workflow) {
        return false
      }

      // Get initial state
      const initialState = await this.db.prepare(`
        SELECT id FROM workflow_states WHERE is_initial = 1 LIMIT 1
      `).first()

      if (!initialState) {
        return false
      }

      // Create workflow status
      await this.db.prepare(`
        INSERT OR REPLACE INTO content_workflow_status 
        (content_id, workflow_id, current_state_id)
        VALUES (?, ?, ?)
      `).bind(contentId, workflow.id, initialState.id).run()

      // Update content table
      await this.db.prepare(`
        UPDATE content 
        SET workflow_state_id = ?
        WHERE id = ?
      `).bind(initialState.id, contentId).run()

      return true
    } catch (error) {
      console.error('Failed to initialize content workflow:', error)
      return false
    }
  }

  async getWorkflowHistory(contentId: string): Promise<WorkflowHistoryEntry[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        wh.*,
        u.username as user_name,
        fs.name as from_state_name,
        ts.name as to_state_name
      FROM workflow_history wh
      LEFT JOIN users u ON wh.user_id = u.id
      LEFT JOIN workflow_states fs ON wh.from_state_id = fs.id
      LEFT JOIN workflow_states ts ON wh.to_state_id = ts.id
      WHERE wh.content_id = ?
      ORDER BY wh.created_at DESC
    `).bind(contentId).all()
    
    return results as WorkflowHistoryEntry[]
  }

  async assignContentToUser(contentId: string, userId: string, dueDate?: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE content_workflow_status 
        SET assigned_to = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE content_id = ?
      `).bind(userId, dueDate || null, contentId).run()

      return true
    } catch (error) {
      console.error('Failed to assign content:', error)
      return false
    }
  }

  async getAssignedContent(userId: string): Promise<any[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        c.*,
        cws.current_state_id,
        cws.due_date,
        ws.name as state_name,
        ws.color as state_color,
        col.name as collection_name
      FROM content c
      JOIN content_workflow_status cws ON c.id = cws.content_id
      JOIN workflow_states ws ON cws.current_state_id = ws.id
      JOIN collections col ON c.collection_id = col.id
      WHERE cws.assigned_to = ?
      ORDER BY cws.due_date ASC, c.updated_at DESC
    `).bind(userId).all()
    
    return results
  }

  async getContentByState(stateId: string, limit: number = 50): Promise<any[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        c.*,
        cws.assigned_to,
        cws.due_date,
        ws.name as state_name,
        ws.color as state_color,
        col.name as collection_name,
        u.username as assigned_to_name
      FROM content c
      JOIN content_workflow_status cws ON c.id = cws.content_id
      JOIN workflow_states ws ON cws.current_state_id = ws.id
      JOIN collections col ON c.collection_id = col.id
      LEFT JOIN users u ON cws.assigned_to = u.id
      WHERE cws.current_state_id = ?
      ORDER BY c.updated_at DESC
      LIMIT ?
    `).bind(stateId, limit).all()
    
    return results
  }
}