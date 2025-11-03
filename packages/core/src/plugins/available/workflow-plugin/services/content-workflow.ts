// Content workflow and publishing system
export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum WorkflowAction {
  SAVE_DRAFT = 'save_draft',
  SUBMIT_FOR_REVIEW = 'submit_for_review',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  SCHEDULE = 'schedule',
  ARCHIVE = 'archive',
  DELETE = 'delete',
  RESTORE = 'restore'
}

// Workflow permission configuration
export interface WorkflowPermissions {
  [ContentStatus.DRAFT]: string[]
  [ContentStatus.REVIEW]: string[]
  [ContentStatus.SCHEDULED]: string[]
  [ContentStatus.PUBLISHED]: string[]
  [ContentStatus.ARCHIVED]: string[]
  [ContentStatus.DELETED]: string[]
}

// Default workflow permissions by role
export const defaultWorkflowPermissions: WorkflowPermissions = {
  [ContentStatus.DRAFT]: ['admin', 'editor', 'author'],
  [ContentStatus.REVIEW]: ['admin', 'editor'],
  [ContentStatus.SCHEDULED]: ['admin', 'editor'],
  [ContentStatus.PUBLISHED]: ['admin', 'editor'],
  [ContentStatus.ARCHIVED]: ['admin', 'editor'],
  [ContentStatus.DELETED]: ['admin']
}

// Workflow state transitions
export const workflowTransitions: Record<ContentStatus, WorkflowAction[]> = {
  [ContentStatus.DRAFT]: [
    WorkflowAction.SAVE_DRAFT,
    WorkflowAction.SUBMIT_FOR_REVIEW,
    WorkflowAction.PUBLISH,
    WorkflowAction.SCHEDULE,
    WorkflowAction.DELETE
  ],
  [ContentStatus.REVIEW]: [
    WorkflowAction.APPROVE,
    WorkflowAction.REJECT,
    WorkflowAction.PUBLISH,
    WorkflowAction.SCHEDULE
  ],
  [ContentStatus.SCHEDULED]: [
    WorkflowAction.PUBLISH,
    WorkflowAction.SAVE_DRAFT,
    WorkflowAction.DELETE
  ],
  [ContentStatus.PUBLISHED]: [
    WorkflowAction.UNPUBLISH,
    WorkflowAction.ARCHIVE,
    WorkflowAction.DELETE
  ],
  [ContentStatus.ARCHIVED]: [
    WorkflowAction.PUBLISH,
    WorkflowAction.SAVE_DRAFT,
    WorkflowAction.DELETE
  ],
  [ContentStatus.DELETED]: [
    WorkflowAction.RESTORE
  ]
}

// Content item with workflow information
export interface ContentItem {
  id: string
  title: string
  slug: string
  content: string
  status: ContentStatus
  authorId: string
  modelName: string
  data: Record<string, any>
  
  // Workflow fields
  publishedAt?: number
  scheduledAt?: number
  reviewedBy?: string
  reviewedAt?: number
  archivedAt?: number
  deletedAt?: number
  
  // Timestamps
  createdAt: number
  updatedAt: number
  
  // Version tracking
  version: number
  parentVersion?: string
}

// Workflow history entry
export interface WorkflowHistoryEntry {
  id: string
  contentId: string
  action: WorkflowAction
  fromStatus: ContentStatus
  toStatus: ContentStatus
  userId: string
  comment?: string
  createdAt: number
}

// Content workflow manager
export class ContentWorkflow {
  // Check if user can perform action on content
  static canPerformAction(
    action: WorkflowAction,
    currentStatus: ContentStatus,
    userRole: string,
    isAuthor: boolean = false,
    permissions: WorkflowPermissions = defaultWorkflowPermissions
  ): boolean {
    // Check if action is valid for current status
    const validActions = workflowTransitions[currentStatus]
    if (!validActions.includes(action)) {
      return false
    }

    // Check role permissions
    const requiredRoles = permissions[currentStatus]
    if (!requiredRoles.includes(userRole)) {
      // Authors can edit their own drafts
      if (currentStatus === ContentStatus.DRAFT && isAuthor && userRole === 'author') {
        return [WorkflowAction.SAVE_DRAFT, WorkflowAction.SUBMIT_FOR_REVIEW].includes(action)
      }
      return false
    }

    return true
  }

  // Get next possible actions for content
  static getAvailableActions(
    currentStatus: ContentStatus,
    userRole: string,
    isAuthor: boolean = false,
    permissions: WorkflowPermissions = defaultWorkflowPermissions
  ): WorkflowAction[] {
    const allActions = workflowTransitions[currentStatus] || []
    
    return allActions.filter(action => 
      this.canPerformAction(action, currentStatus, userRole, isAuthor, permissions)
    )
  }

  // Apply workflow action to content
  static applyAction(
    content: ContentItem,
    action: WorkflowAction,
    userId: string,
    scheduledAt?: number,
    comment?: string
  ): { content: ContentItem; historyEntry: WorkflowHistoryEntry } {
    const now = Date.now()
    const previousStatus = content.status
    let newStatus = content.status
    const updatedContent = { ...content, updatedAt: now }

    // Apply status changes based on action
    switch (action) {
      case WorkflowAction.SAVE_DRAFT:
        newStatus = ContentStatus.DRAFT
        break
      case WorkflowAction.SUBMIT_FOR_REVIEW:
        newStatus = ContentStatus.REVIEW
        break
      case WorkflowAction.APPROVE:
        // Stay in review - require explicit publish action
        break
      case WorkflowAction.REJECT:
        newStatus = ContentStatus.DRAFT
        break
      case WorkflowAction.PUBLISH:
        newStatus = ContentStatus.PUBLISHED
        updatedContent.publishedAt = now
        break
      case WorkflowAction.UNPUBLISH:
        newStatus = ContentStatus.DRAFT
        updatedContent.publishedAt = undefined
        break
      case WorkflowAction.SCHEDULE:
        newStatus = ContentStatus.SCHEDULED
        updatedContent.scheduledAt = scheduledAt || now
        break
      case WorkflowAction.ARCHIVE:
        newStatus = ContentStatus.ARCHIVED
        updatedContent.archivedAt = now
        break
      case WorkflowAction.DELETE:
        newStatus = ContentStatus.DELETED
        updatedContent.deletedAt = now
        break
      case WorkflowAction.RESTORE:
        newStatus = ContentStatus.DRAFT
        updatedContent.deletedAt = undefined
        updatedContent.archivedAt = undefined
        break
    }

    updatedContent.status = newStatus

    // Create history entry
    const historyEntry: WorkflowHistoryEntry = {
      id: crypto.randomUUID(),
      contentId: content.id,
      action,
      fromStatus: previousStatus,
      toStatus: newStatus,
      userId,
      comment,
      createdAt: now
    }

    return { content: updatedContent, historyEntry }
  }

  // Check if content should be auto-published (for scheduled content)
  static shouldAutoPublish(content: ContentItem): boolean {
    return content.status === ContentStatus.SCHEDULED && 
           content.scheduledAt !== undefined && 
           content.scheduledAt <= Date.now()
  }

  // Get content visibility based on user role and status
  static getContentVisibility(userRole: string, _isAuthor: boolean = false): ContentStatus[] {
    switch (userRole) {
      case 'admin':
      case 'editor':
        return Object.values(ContentStatus)
      case 'author':
        return [
          ContentStatus.DRAFT,
          ContentStatus.REVIEW,
          ContentStatus.PUBLISHED,
          ContentStatus.SCHEDULED
        ]
      case 'viewer':
      default:
        return [ContentStatus.PUBLISHED]
    }
  }

  // Filter content based on user permissions
  static filterContentByPermissions(
    content: ContentItem[],
    userRole: string,
    userId?: string
  ): ContentItem[] {
    const visibleStatuses = this.getContentVisibility(userRole, false)
    
    return content.filter(item => {
      // Check status visibility
      if (!visibleStatuses.includes(item.status)) {
        return false
      }

      // Authors can see their own content in any visible status
      if (userRole === 'author' && item.authorId === userId) {
        return true
      }

      // For other roles, follow standard visibility rules
      return visibleStatuses.includes(item.status)
    })
  }

  // Generate workflow status badge HTML
  static generateStatusBadge(status: ContentStatus): string {
    const statusConfig = {
      [ContentStatus.DRAFT]: { class: 'bg-gray-100 text-gray-800', text: 'Draft' },
      [ContentStatus.REVIEW]: { class: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      [ContentStatus.SCHEDULED]: { class: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      [ContentStatus.PUBLISHED]: { class: 'bg-green-100 text-green-800', text: 'Published' },
      [ContentStatus.ARCHIVED]: { class: 'bg-purple-100 text-purple-800', text: 'Archived' },
      [ContentStatus.DELETED]: { class: 'bg-red-100 text-red-800', text: 'Deleted' }
    }

    const config = statusConfig[status]
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}">${config.text}</span>`
  }

  // Generate workflow action buttons HTML
  static generateActionButtons(
    contentId: string,
    _currentStatus: ContentStatus,
    availableActions: WorkflowAction[]
  ): string {
    const actionConfig = {
      [WorkflowAction.SAVE_DRAFT]: { class: 'btn-secondary', text: 'Save Draft', icon: '💾' },
      [WorkflowAction.SUBMIT_FOR_REVIEW]: { class: 'btn-primary', text: 'Submit for Review', icon: '👁️' },
      [WorkflowAction.APPROVE]: { class: 'btn-success', text: 'Approve', icon: '✅' },
      [WorkflowAction.REJECT]: { class: 'btn-warning', text: 'Reject', icon: '❌' },
      [WorkflowAction.PUBLISH]: { class: 'btn-success', text: 'Publish', icon: '🚀' },
      [WorkflowAction.UNPUBLISH]: { class: 'btn-warning', text: 'Unpublish', icon: '📥' },
      [WorkflowAction.SCHEDULE]: { class: 'btn-info', text: 'Schedule', icon: '⏰' },
      [WorkflowAction.ARCHIVE]: { class: 'btn-secondary', text: 'Archive', icon: '📦' },
      [WorkflowAction.DELETE]: { class: 'btn-danger', text: 'Delete', icon: '🗑️' },
      [WorkflowAction.RESTORE]: { class: 'btn-success', text: 'Restore', icon: '♻️' }
    }

    const buttons = availableActions.map(action => {
      const config = actionConfig[action]
      return `
        <button 
          class="btn ${config.class}" 
          hx-post="/admin/content/${contentId}/workflow"
          hx-vals='{"action": "${action}"}'
          hx-target="#content-status"
          hx-swap="outerHTML"
        >
          ${config.icon} ${config.text}
        </button>
      `
    }).join('')

    return `<div class="workflow-actions flex gap-2">${buttons}</div>`
  }
}

// Database-backed workflow manager for testing compatibility
export class WorkflowManager {
  private db: any
  private permissions: WorkflowPermissions

  constructor(db: any, permissions: WorkflowPermissions = defaultWorkflowPermissions) {
    this.db = db
    this.permissions = permissions
  }

  // Check if user can perform action on content
  async canPerformAction(
    contentId: string,
    action: WorkflowAction,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    try {
      // Get content from database
      const stmt = this.db.prepare('SELECT * FROM content WHERE id = ?')
      const content = await stmt.bind(contentId).first()
      
      if (!content) {
        return false
      }

      const isAuthor = content.author_id === userId
      return ContentWorkflow.canPerformAction(
        action,
        content.status as ContentStatus,
        userRole,
        isAuthor,
        this.permissions
      )
    } catch (error) {
      return false
    }
  }

  // Perform workflow action
  async performAction(
    contentId: string,
    action: WorkflowAction,
    userId: string,
    userRole: string,
    metadata?: any
  ): Promise<{ success: boolean; newStatus?: ContentStatus; error?: string }> {
    try {
      // Check permissions first
      const canPerform = await this.canPerformAction(contentId, action, userId, userRole)
      if (!canPerform) {
        return { success: false, error: 'Action not allowed' }
      }

      // Get content
      const stmt = this.db.prepare('SELECT * FROM content WHERE id = ?')
      const content = await stmt.bind(contentId).first()
      
      if (!content) {
        return { success: false, error: 'Content not found' }
      }

      // Apply workflow logic
      const { content: updatedContent, historyEntry } = ContentWorkflow.applyAction(
        {
          id: content.id,
          title: content.title,
          slug: content.slug,
          content: content.data || '',
          status: content.status as ContentStatus,
          authorId: content.author_id,
          modelName: content.model_name || '',
          data: content.data ? JSON.parse(content.data) : {},
          createdAt: content.created_at,
          updatedAt: content.updated_at,
          version: 1
        },
        action,
        userId,
        metadata?.scheduledAt,
        metadata?.comment
      )

      // Update content in database
      const updateStmt = this.db.prepare(`
        UPDATE content 
        SET status = ?, updated_at = ? 
        WHERE id = ?
      `)
      await updateStmt.bind(updatedContent.status, updatedContent.updatedAt, contentId).run()

      // Log action to audit trail
      const auditStmt = this.db.prepare(`
        INSERT INTO content_audit_log 
        (id, content_id, action, from_status, to_status, user_id, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      await auditStmt.bind(
        historyEntry.id,
        historyEntry.contentId,
        historyEntry.action,
        historyEntry.fromStatus,
        historyEntry.toStatus,
        historyEntry.userId,
        historyEntry.createdAt,
        JSON.stringify(metadata || {})
      ).run()

      return { success: true, newStatus: updatedContent.status }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get workflow history for content
  async getWorkflowHistory(contentId: string): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM content_audit_log 
      WHERE content_id = ? 
      ORDER BY timestamp DESC
    `)
    const result = await stmt.bind(contentId).all()
    
    return (result.results || []).map((entry: any) => ({
      ...entry,
      metadata: this.parseMetadata(entry.metadata)
    }))
  }

  // Get available actions for content
  async getAvailableActions(
    contentId: string,
    userId: string,
    userRole: string
  ): Promise<WorkflowAction[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM content WHERE id = ?')
      const content = await stmt.bind(contentId).first()
      
      if (!content) {
        return []
      }

      const isAuthor = content.author_id === userId
      return ContentWorkflow.getAvailableActions(
        content.status as ContentStatus,
        userRole,
        isAuthor,
        this.permissions
      )
    } catch (error) {
      return []
    }
  }

  // Bulk update status
  async bulkUpdateStatus(
    contentIds: string[],
    newStatus: ContentStatus,
    userId: string,
    userRole: string,
    metadata?: any
  ): Promise<{ success: boolean; updatedCount?: number; errors?: string[]; error?: string }> {
    // Check bulk permissions
    if (!this.hasPermissionForStatus(userRole, newStatus)) {
      return { success: false, error: 'Insufficient permissions for bulk operation' }
    }

    const errors: string[] = []
    let updatedCount = 0

    for (const contentId of contentIds) {
      try {
        // Update content status
        const updateStmt = this.db.prepare('UPDATE content SET status = ?, updated_at = ? WHERE id = ?')
        await updateStmt.bind(newStatus, Date.now(), contentId).run()

        // Log audit entry
        const auditStmt = this.db.prepare(`
          INSERT INTO content_audit_log 
          (id, content_id, action, from_status, to_status, user_id, timestamp, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        await auditStmt.bind(
          crypto.randomUUID(),
          contentId,
          'bulk_update',
          'unknown',
          newStatus,
          userId,
          Date.now(),
          JSON.stringify(metadata || {})
        ).run()

        updatedCount++
      } catch (error) {
        errors.push(`Failed to update ${contentId}: ${(error as Error).message}`)
      }
    }

    return errors.length > 0
      ? { success: false, errors }
      : { success: true, updatedCount }
  }

  // Check if user role has permission for status
  private hasPermissionForStatus(userRole: string, status: ContentStatus): boolean {
    return this.permissions[status].includes(userRole)
  }

  // Parse metadata JSON safely
  private parseMetadata(metadata: string | null): any {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
}