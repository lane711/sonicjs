import { Hono } from 'hono'
import { WorkflowEngine } from '../services/workflow'
import { SchedulerService } from '../services/scheduler'
import { NotificationService } from '../services/notifications'
// getUserFromCookie equivalent using c.get('user')
import { PermissionManager } from '../middleware/permissions'
import { renderWorkflowDashboard } from '../templates/pages/admin-workflow.template'
import { renderWorkflowContentDetail } from '../templates/pages/admin-workflow-content.template'
import { renderScheduledContent } from '../templates/pages/admin-scheduled-content.template'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  EMAIL_QUEUE?: Queue
  SENDGRID_API_KEY?: string
  DEFAULT_FROM_EMAIL?: string
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
}

type Variables = {
  user: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

const workflowRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Debug endpoint to check workflow functionality
workflowRoutes.get('/debug', async (c) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const workflowEngine = new WorkflowEngine(c.env.DB)
  const debug: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }

  try {
    // Test 1: Check workflow states
    debug.tests.workflowStates = {
      status: 'testing',
      error: null,
      result: null
    }
    
    const states = await workflowEngine.getWorkflowStates()
    debug.tests.workflowStates.status = 'success'
    debug.tests.workflowStates.result = {
      count: states.length,
      states: states.map(s => ({ id: s.id, name: s.name, color: s.color }))
    }
  } catch (error: any) {
    debug.tests.workflowStates.status = 'error'
    debug.tests.workflowStates.error = error.message
  }

  try {
    // Test 2: Check database tables exist
    debug.tests.tableCheck = {
      status: 'testing',
      error: null,
      result: null
    }

    const tableResults: any = {}
    const tables = ['workflow_states', 'workflows', 'content_workflow_status', 'workflow_history']
    
    for (const table of tables) {
      const result = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM ${table}
      `).first()
      tableResults[table] = result?.count || 0
    }
    
    debug.tests.tableCheck.status = 'success'
    debug.tests.tableCheck.result = tableResults
  } catch (error: any) {
    debug.tests.tableCheck.status = 'error'
    debug.tests.tableCheck.error = error.message
  }

  try {
    // Test 3: Check content by state for each state
    debug.tests.contentByState = {
      status: 'testing',
      error: null,
      result: null
    }

    const states = await workflowEngine.getWorkflowStates()
    const stateResults: any = {}
    
    for (const state of states) {
      const content = await workflowEngine.getContentByState(state.id, 5)
      stateResults[state.name] = {
        id: state.id,
        count: content.length,
        sampleContent: content.map((c: any) => ({ id: c.id, title: c.title }))
      }
    }
    
    debug.tests.contentByState.status = 'success'
    debug.tests.contentByState.result = stateResults
  } catch (error: any) {
    debug.tests.contentByState.status = 'error'
    debug.tests.contentByState.error = error.message
  }

  try {
    // Test 4: Raw database query test
    debug.tests.rawQuery = {
      status: 'testing',
      error: null,
      result: null
    }

    const rawStates = await c.env.DB.prepare(`
      SELECT * FROM workflow_states ORDER BY is_initial DESC, name ASC
    `).all()
    
    debug.tests.rawQuery.status = 'success'
    debug.tests.rawQuery.result = {
      count: rawStates.results.length,
      states: rawStates.results
    }
  } catch (error: any) {
    debug.tests.rawQuery.status = 'error'
    debug.tests.rawQuery.error = error.message
  }

  return c.json(debug)
})

// Workflow Dashboard
workflowRoutes.get('/dashboard', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.redirect('/auth/login')
  }

  // Check permissions (simplified for now - assume admin has all permissions)
  if (user.role !== 'admin') {
    return c.text('Forbidden', 403)
  }

  try {
    const workflowEngine = new WorkflowEngine(c.env.DB)
    
    // Get workflow states and counts with error handling
    console.log('Fetching workflow states...')
    const states = await workflowEngine.getWorkflowStates()
    console.log(`Found ${states.length} workflow states:`, states.map(s => s.name))
    
    const stateData = []
    
    for (const state of states) {
      console.log(`Processing state: ${state.name} (${state.id})`)
      try {
        const content = await workflowEngine.getContentByState(state.id, 10)
        console.log(`Found ${content.length} content items for state ${state.name}`)
        
        stateData.push({
          ...state,
          count: content.length,
          content: content.slice(0, 5) // Show first 5 items
        })
      } catch (stateError) {
        console.error(`Error getting content for state ${state.name}:`, stateError)
        // Add state with zero count if there's an error
        stateData.push({
          ...state,
          count: 0,
          content: []
        })
      }
    }

    // Get assigned content with error handling
    console.log('Fetching assigned content...')
    let assignedContent = []
    try {
      assignedContent = await workflowEngine.getAssignedContent(user.userId)
      console.log(`Found ${assignedContent.length} assigned content items`)
    } catch (assignedError) {
      console.error('Error getting assigned content:', assignedError)
    }

    const data = {
      user,
      states: stateData,
      assignedContent
    }

    console.log('Dashboard data prepared:', {
      stateCount: data.states.length,
      assignedCount: data.assignedContent.length
    })

    return c.html(renderWorkflowDashboard(data))
  } catch (error) {
    console.error('Critical error in workflow dashboard:', error)
    
    // Return error page or basic HTML with error info
    return c.html(`
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Workflow Dashboard Error</h1>
        <p><strong>Error:</strong> ${(error as Error).message}</p>
        <p><strong>Stack:</strong> <pre>${(error as Error).stack}</pre></p>
        <hr>
        <p><a href="/admin/workflow/debug">Check Debug Endpoint</a></p>
        <p><a href="/admin">Return to Admin</a></p>
      </div>
    `)
  }
})

// Get content by workflow state
workflowRoutes.get('/state/:stateId', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.redirect('/auth/login')
  }

  const stateId = c.req.param('stateId')
  const workflowEngine = new WorkflowEngine(c.env.DB)
  
  const content = await workflowEngine.getContentByState(stateId, 100)
  const state = await c.env.DB.prepare(`
    SELECT * FROM workflow_states WHERE id = ?
  `).bind(stateId).first()

  return c.json({ content, state })
})

// Content workflow detail
workflowRoutes.get('/content/:contentId', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.redirect('/auth/login')
  }

  const contentId = c.req.param('contentId')
  const workflowEngine = new WorkflowEngine(c.env.DB)
  
  // Get content details
  const content = await c.env.DB.prepare(`
    SELECT c.*, col.name as collection_name, u.username as author_name
    FROM content c
    JOIN collections col ON c.collection_id = col.id
    JOIN users u ON c.author_id = u.id
    WHERE c.id = ?
  `).bind(contentId).first()

  if (!content) {
    return c.text('Content not found', 404)
  }

  // Get workflow status
  const workflowStatus = await workflowEngine.getContentWorkflowStatus(contentId)
  const currentState = await c.env.DB.prepare(`
    SELECT * FROM workflow_states WHERE id = ?
  `).bind(workflowStatus?.current_state_id || 'draft').first()

  // Get available transitions
  const availableTransitions = workflowStatus 
    ? await workflowEngine.getAvailableTransitions(
        workflowStatus.workflow_id, 
        workflowStatus.current_state_id, 
        user.userId
      )
    : []

  // Get workflow history
  const history = await workflowEngine.getWorkflowHistory(contentId)

  // Get scheduled actions
  const scheduler = new SchedulerService(c.env.DB)
  const scheduledActions = await scheduler.getScheduledContentForContent(contentId)

  const data = {
    user,
    content,
    currentState,
    workflowStatus,
    availableTransitions,
    history,
    scheduledActions
  }

  return c.html(renderWorkflowContentDetail(data))
})

// Transition content workflow state
workflowRoutes.post('/content/:contentId/transition', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const contentId = c.req.param('contentId')
  const formData = await c.req.formData()
  const toStateId = formData.get('to_state_id') as string
  const comment = formData.get('comment') as string

  const workflowEngine = new WorkflowEngine(c.env.DB)
  const success = await workflowEngine.transitionContent(
    contentId,
    toStateId,
    user.userId,
    comment
  )

  if (success) {
    // Send notification if content was assigned
    const workflowStatus = await workflowEngine.getContentWorkflowStatus(contentId)
    if (workflowStatus?.assigned_to && workflowStatus.assigned_to !== user.userId) {
      const notificationService = new NotificationService(c.env.DB)
      await notificationService.createNotification(
        workflowStatus.assigned_to,
        'workflow',
        'Content Status Updated',
        `Content workflow state has been updated to ${toStateId}`,
        { contentId, fromState: workflowStatus.current_state_id, toState: toStateId }
      )
    }

    return c.json({ success: true })
  } else {
    return c.json({ error: 'Transition failed' }, 400)
  }
})

// Assign content to user
workflowRoutes.post('/content/:contentId/assign', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const contentId = c.req.param('contentId')
  const formData = await c.req.formData()
  const assignedTo = formData.get('assigned_to') as string
  const dueDate = formData.get('due_date') as string

  const workflowEngine = new WorkflowEngine(c.env.DB)
  const success = await workflowEngine.assignContentToUser(
    contentId,
    assignedTo,
    dueDate || undefined
  )

  if (success) {
    // Send notification to assigned user
    const notificationService = new NotificationService(c.env.DB)
    await notificationService.createNotification(
      assignedTo,
      'workflow',
      'Content Assigned',
      'You have been assigned content for review',
      { contentId, dueDate }
    )

    return c.json({ success: true })
  } else {
    return c.json({ error: 'Assignment failed' }, 400)
  }
})

// Schedule content action
workflowRoutes.post('/content/:contentId/schedule', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const contentId = c.req.param('contentId')
  const formData = await c.req.formData()
  const action = formData.get('action') as 'publish' | 'unpublish' | 'archive'
  const scheduledAt = formData.get('scheduled_at') as string
  const timezone = formData.get('timezone') as string || 'UTC'

  const scheduler = new SchedulerService(c.env.DB)
  const scheduleId = await scheduler.scheduleContent(
    contentId,
    action,
    new Date(scheduledAt),
    timezone,
    user.userId
  )

  return c.json({ success: true, scheduleId })
})

// Get scheduled content
workflowRoutes.get('/scheduled', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.redirect('/auth/login')
  }

  const scheduler = new SchedulerService(c.env.DB)
  const scheduledContent = await scheduler.getScheduledContentForUser(user.userId)
  const stats = await scheduler.getScheduledContentStats()

  const data = {
    user,
    scheduledContent,
    stats
  }

  return c.html(renderScheduledContent(data))
})

// Cancel scheduled action
workflowRoutes.delete('/scheduled/:scheduleId', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const scheduleId = c.req.param('scheduleId')
  
  // Verify user owns the scheduled content
  const scheduled = await c.env.DB.prepare(`
    SELECT * FROM scheduled_content WHERE id = ? AND user_id = ?
  `).bind(scheduleId, user.userId).first()

  if (!scheduled) {
    return c.json({ error: 'Scheduled content not found' }, 404)
  }

  const scheduler = new SchedulerService(c.env.DB)
  const success = await scheduler.cancelScheduledContent(scheduleId)

  if (success) {
    return c.json({ success: true })
  } else {
    return c.json({ error: 'Failed to cancel' }, 400)
  }
})

// Get workflow analytics
workflowRoutes.get('/analytics', async (c) => {
  const user = await c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // Get workflow transition stats
  const transitionStats = await c.env.DB.prepare(`
    SELECT 
      fs.name as from_state,
      ts.name as to_state,
      COUNT(*) as count,
      AVG(julianday(wh.created_at) - julianday(c.created_at)) * 24 as avg_hours
    FROM workflow_history wh
    JOIN workflow_states fs ON wh.from_state_id = fs.id
    JOIN workflow_states ts ON wh.to_state_id = ts.id
    JOIN content c ON wh.content_id = c.id
    WHERE wh.created_at >= datetime('now', '-30 days')
    GROUP BY fs.id, ts.id
    ORDER BY count DESC
  `).all()

  // Get average time in each state
  const stateStats = await c.env.DB.prepare(`
    SELECT 
      ws.name as state_name,
      COUNT(*) as total_content,
      AVG(
        CASE 
          WHEN cws.current_state_id = ws.id 
          THEN julianday('now') - julianday(c.updated_at)
          ELSE julianday(wh_next.created_at) - julianday(wh_current.created_at)
        END
      ) * 24 as avg_hours_in_state
    FROM workflow_states ws
    LEFT JOIN content_workflow_status cws ON ws.id = cws.current_state_id
    LEFT JOIN content c ON cws.content_id = c.id
    LEFT JOIN workflow_history wh_current ON wh_current.to_state_id = ws.id
    LEFT JOIN workflow_history wh_next ON wh_next.from_state_id = ws.id 
      AND wh_next.content_id = wh_current.content_id
      AND wh_next.created_at > wh_current.created_at
    GROUP BY ws.id, ws.name
    ORDER BY total_content DESC
  `).all()

  return c.json({
    transitionStats: transitionStats.results,
    stateStats: stateStats.results
  })
})

export default workflowRoutes