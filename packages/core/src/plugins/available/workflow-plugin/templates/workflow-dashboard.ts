import { renderAdminLayout } from '@sonicjs-cms/core/templates'

export interface WorkflowDashboardData {
  user: any
  states: Array<{
    id: string
    name: string
    description?: string
    color: string
    count: number
    content: any[]
  }>
  assignedContent: any[]
}

export function renderWorkflowDashboard(data: WorkflowDashboardData): string {
  const content = `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Workflow Dashboard</h1>
          <p class="text-gray-300 mt-2">Manage content approval workflows and assignments</p>
        </div>
        <div class="flex space-x-4">
          <a href="/admin/workflow/scheduled" 
             class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-clock mr-2"></i>Scheduled Content
          </a>
          <a href="/admin/workflow/analytics" 
             class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <i class="fas fa-chart-line mr-2"></i>Analytics
          </a>
        </div>
      </div>

      <!-- Assigned Content -->
      ${data.assignedContent.length > 0 ? `
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
          <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
            <i class="fas fa-user-check mr-3 text-yellow-400"></i>
            Assigned to You (${data.assignedContent.length})
          </h2>
          <div class="grid gap-4">
            ${data.assignedContent.map(content => `
              <div class="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-white">
                      <a href="/admin/workflow/content/${content.id}" class="hover:text-blue-300 transition-colors">
                        ${content.title}
                      </a>
                    </h3>
                    <p class="text-sm text-gray-400 mt-1">${content.collection_name}</p>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-xs font-medium rounded-full" 
                          style="background-color: ${content.state_color}20; color: ${content.state_color};">
                      ${content.state_name}
                    </span>
                    ${content.due_date ? `
                      <span class="text-xs text-gray-400">
                        Due: ${new Date(content.due_date).toLocaleDateString()}
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Workflow States -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${data.states.map(state => `
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all workflow-state-card">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full" style="background-color: ${state.color};"></div>
                <h3 class="text-lg font-semibold text-white">${state.name}</h3>
              </div>
              <span class="text-2xl font-bold text-white" data-testid="state-count">${state.count}</span>
            </div>
            
            ${state.description ? `
              <p class="text-sm text-gray-300 mb-4">${state.description}</p>
            ` : ''}

            <!-- Recent Content -->
            ${state.content.length > 0 ? `
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Recent Content:</h4>
                ${state.content.map(content => `
                  <div class="backdrop-blur-sm bg-white/5 rounded-lg p-3 text-sm">
                    <a href="/admin/workflow/content/${content.id}" 
                       class="text-white hover:text-blue-300 transition-colors block truncate">
                      ${content.title}
                    </a>
                    <div class="text-xs text-gray-400 mt-1 flex items-center justify-between">
                      <span>${content.collection_name}</span>
                      ${content.assigned_to_name ? `
                        <span class="flex items-center">
                          <i class="fas fa-user mr-1"></i>${content.assigned_to_name}
                        </span>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
                ${state.count > 5 ? `
                  <button onclick="loadMoreContent('${state.id}')" 
                          class="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2">
                    View all ${state.count} items
                  </button>
                ` : ''}
              </div>
            ` : `
              <div class="text-center py-4">
                <i class="fas fa-inbox text-gray-500 text-2xl mb-2"></i>
                <p class="text-sm text-gray-400">No content in this state</p>
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>

    <script>
      async function loadMoreContent(stateId) {
        try {
          const response = await fetch(\`/admin/workflow/state/\${stateId}\`)
          const data = await response.json()
          
          // In a real implementation, this would update the UI with modal or expanded view
          console.log('Content for state:', data)
        } catch (error) {
          console.error('Failed to load content:', error)
        }
      }
    </script>
  `

  return renderAdminLayout({
    title: 'Workflow Dashboard - SonicJS AI',
    pageTitle: 'Workflow Dashboard',
    content,
    user: data.user,
    currentPath: 'workflow'
  })
}

export function renderWorkflowStates(): string {
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-white">Workflow States</h2>
        <button onclick="openAddStateModal()" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-plus mr-2"></i>Add State
        </button>
      </div>
      
      <div id="workflow-states" class="space-y-3">
        <!-- States will be loaded via HTMX -->
      </div>
    </div>
  `
}