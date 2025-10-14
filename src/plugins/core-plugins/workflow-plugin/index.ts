import { Hono } from 'hono'
import { Plugin } from '../../types'
import { PluginBuilder } from '../../sdk/plugin-builder'
import { workflowMigration } from './migrations'
import { createWorkflowRoutes } from './routes'
import { createWorkflowAdminRoutes } from './admin-routes'
import { WorkflowService, WorkflowEngine, workflowSchemas } from './services/workflow-service'
import { SchedulerService } from './services/scheduler'
import { AutomationEngine } from './services/automation'
import { NotificationService } from './services/notifications'
import { WebhookService } from './services/webhooks'
import { ContentWorkflow, WorkflowManager } from './services/content-workflow'
import { renderWorkflowDashboard as workflowDashboardTemplate } from './templates/workflow-dashboard'
import { renderWorkflowContentDetail as workflowContentTemplate } from './templates/workflow-content'
import { renderScheduledContent as scheduledContentTemplate } from './templates/scheduled-content'

export function createWorkflowPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'workflow-plugin',
    version: '1.0.0-beta.1',
    description: 'Content workflow management with approval chains, scheduling, and automation'
  })

  builder.metadata({
    author: {
      name: 'SonicJS',
      email: 'info@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^1.0.0',
    dependencies: ['content-plugin']
  })

  // Register models (commented out for now - needs Zod schemas)
  // builder.addModel('WorkflowState', {
  //   tableName: 'workflow_states',
  //   schema: workflowSchemas.workflow_states,
  //   migrations: [workflowMigration]
  // })

  // builder.addModel('Workflow', {
  //   tableName: 'workflows',
  //   schema: workflowSchemas.workflows,
  //   migrations: []
  // })

  // builder.addModel('WorkflowTransition', {
  //   tableName: 'workflow_transitions',
  //   schema: workflowSchemas.workflow_transitions,
  //   migrations: []
  // })

  // builder.addModel('ContentWorkflowStatus', {
  //   tableName: 'content_workflow_status',
  //   schema: workflowSchemas.content_workflow_status,
  //   migrations: []
  // })

  // builder.addModel('WorkflowHistory', {
  //   tableName: 'workflow_history',
  //   schema: workflowSchemas.workflow_history,
  //   migrations: []
  // })

  // builder.addModel('ScheduledContent', {
  //   tableName: 'scheduled_content',
  //   schema: workflowSchemas.scheduled_content,
  //   migrations: []
  // })

  // Register API routes (commented out for now - needs type alignment)
  // const apiRoutes = createWorkflowRoutes()
  // builder.addRoute('/api/workflow', apiRoutes, {
  //   description: 'Workflow management API endpoints',
  //   requiresAuth: true
  // })

  // Register admin routes (commented out for now - needs type alignment)
  // const adminRoutes = createWorkflowAdminRoutes()
  // builder.addRoute('/admin/workflow', adminRoutes, {
  //   description: 'Workflow admin interface',
  //   requiresAuth: true,
  //   roles: ['admin', 'editor']
  // })

  // Register admin pages
  builder.addAdminPage('/workflow/dashboard', 'Workflow Dashboard', 'WorkflowDashboard', {
    description: 'Manage content workflows and approval chains',
    icon: 'git-branch',
    permissions: ['admin', 'editor']
  })

  builder.addAdminPage('/workflow/content/:contentId', 'Content Workflow', 'WorkflowContent', {
    description: 'View and manage workflow for specific content',
    permissions: ['admin', 'editor', 'author']
  })

  builder.addAdminPage('/workflow/scheduled', 'Scheduled Content', 'ScheduledContent', {
    description: 'Manage scheduled content publishing',
    icon: 'clock',
    permissions: ['admin', 'editor']
  })

  // Register components
  builder.addComponent('WorkflowDashboard', workflowDashboardTemplate)

  builder.addComponent('WorkflowContent', workflowContentTemplate)

  builder.addComponent('ScheduledContent', scheduledContentTemplate)

  // Register menu items
  builder.addMenuItem('Workflow', '/admin/workflow/dashboard', {
    icon: 'git-branch',
    order: 30,
    permissions: ['admin', 'editor']
  })

  builder.addMenuItem('Scheduled', '/admin/workflow/scheduled', {
    icon: 'clock',
    order: 31,
    parent: 'Workflow',
    permissions: ['admin', 'editor']
  })

  // Register services
  builder.addService('workflow', {
    implementation: WorkflowService,
    description: 'Workflow management service',
    singleton: true
  })

  builder.addService('scheduler', {
    implementation: SchedulerService,
    description: 'Content scheduling service',
    singleton: true
  })

  builder.addService('automation', {
    implementation: AutomationEngine,
    description: 'Workflow automation service',
    singleton: true
  })

  builder.addService('notifications', {
    implementation: NotificationService,
    description: 'Notification service',
    singleton: true
  })

  builder.addService('webhooks', {
    implementation: WebhookService,
    description: 'Webhook service',
    singleton: true
  })

  // Register hooks
  builder.addHook('content:create', async (data: any, context: any) => {
    const workflowEngine = new WorkflowEngine(context.db)
    await workflowEngine.initializeContentWorkflow(data.id, data.collectionId || data.collection_id)
    return data
  })

  builder.addHook('content:save', async (data: any, context: any) => {
    // For now, we'll just return the data as-is
    // This can be extended to handle workflow state changes on save
    return data
  })

  builder.addHook('content:delete', async (data: any, context: any) => {
    // Workflow status will be deleted automatically due to foreign key constraints
    return data
  })

  // Lifecycle hooks
  builder.lifecycle({
    install: async (context) => {
      const { db } = context
      await db.prepare(workflowMigration).run()
      console.log('Workflow plugin installed successfully')
    },
    uninstall: async (context) => {
      const { db } = context
      // Drop tables in reverse order of dependencies
      await db.prepare('DROP TABLE IF EXISTS workflow_history').run()
      await db.prepare('DROP TABLE IF EXISTS scheduled_content').run()
      await db.prepare('DROP TABLE IF EXISTS content_workflow_status').run()
      await db.prepare('DROP TABLE IF EXISTS workflow_transitions').run()
      await db.prepare('DROP TABLE IF EXISTS workflows').run()
      await db.prepare('DROP TABLE IF EXISTS workflow_states').run()
      console.log('Workflow plugin uninstalled successfully')
    },
    activate: async (context) => {
      // Initialize default workflow if needed
      const workflowService = new WorkflowService(context.db)
      // For now, we'll just log that the plugin is activated
      // Default workflow initialization can be added later
      console.log('Workflow plugin activated')
    },
    deactivate: async () => {
      console.log('Workflow plugin deactivated')
    }
  })

  return builder.build()
}

export const workflowPlugin = createWorkflowPlugin()

// Export services for external use
export {
  WorkflowService,
  WorkflowEngine
} from './services/workflow-service'

export {
  SchedulerService as WorkflowSchedulerService
} from './services/scheduler'

export {
  AutomationEngine as WorkflowAutomationEngine
} from './services/automation'

export {
  NotificationService as WorkflowNotificationService
} from './services/notifications'

export {
  WebhookService as WorkflowWebhookService
} from './services/webhooks'

export {
  ContentWorkflow as WorkflowContentWorkflow,
  WorkflowManager as WorkflowContentManager,
  ContentStatus,
  WorkflowAction,
  defaultWorkflowPermissions,
  workflowTransitions
} from './services/content-workflow'