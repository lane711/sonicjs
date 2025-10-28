import { renderAdminLayout } from '@sonicjs-cms/core/templates'

export interface WorkflowContentDetailData {
  user: any
  content: any
  currentState: any
  workflowStatus: any
  availableTransitions: any[]
  history: any[]
  scheduledActions: any[]
}

export function renderWorkflowContentDetail(data: WorkflowContentDetailData): string {
  const content = `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <nav class="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <a href="/admin/workflow/dashboard" class="hover:text-white transition-colors">Workflow</a>
            <i class="fas fa-chevron-right text-xs"></i>
            <span class="text-white">Content Detail</span>
          </nav>
          <h1 class="text-3xl font-bold text-white">${data.content.title}</h1>
          <p class="text-gray-300 mt-2">${data.content.collection_name} • by ${data.content.author_name}</p>
        </div>
        <div class="flex space-x-4">
          <a href="/admin/content/${data.content.id}/edit" 
             class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-edit mr-2"></i>Edit Content
          </a>
          <a href="/admin/content/${data.content.id}" 
             class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <i class="fas fa-eye mr-2"></i>View Content
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Current Status -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
            <h2 class="text-xl font-semibold text-white mb-6">Current Status</h2>
            
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-4">
                <div class="w-6 h-6 rounded-full" style="background-color: ${data.currentState?.color || '#6B7280'};"></div>
                <div>
                  <h3 class="text-lg font-medium text-white">${data.currentState?.name || 'Draft'}</h3>
                  <p class="text-sm text-gray-400">${data.currentState?.description || ''}</p>
                </div>
              </div>
              ${data.workflowStatus?.assigned_to ? `
                <div class="text-right">
                  <p class="text-sm text-gray-400">Assigned to</p>
                  <p class="text-white font-medium">${data.workflowStatus.assigned_to_name || 'User'}</p>
                  ${data.workflowStatus.due_date ? `
                    <p class="text-xs text-gray-400">Due: ${new Date(data.workflowStatus.due_date).toLocaleDateString()}</p>
                  ` : ''}
                </div>
              ` : ''}
            </div>

            <!-- Available Actions -->
            ${data.availableTransitions.length > 0 ? `
              <div class="border-t border-white/10 pt-6">
                <h4 class="text-sm font-medium text-gray-300 mb-4">Available Actions</h4>
                <div class="flex flex-wrap gap-3">
                  ${data.availableTransitions.map(transition => `
                    <button onclick="openTransitionModal('${transition.to_state_id}', '${transition.to_state_name}')" 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Move to ${transition.to_state_name || transition.to_state_id}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div class="border-t border-white/10 pt-6">
                <p class="text-sm text-gray-400">No actions available in current state</p>
              </div>
            `}
          </div>

          <!-- Workflow History -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
            <h2 class="text-xl font-semibold text-white mb-6">Workflow History</h2>
            
            ${data.history.length > 0 ? `
              <div class="space-y-4">
                ${data.history.map(entry => `
                  <div class="flex items-start space-x-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl">
                    <div class="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-2">
                        <p class="text-white font-medium">
                          ${entry.from_state_name ? `${entry.from_state_name} → ` : ''}${entry.to_state_name}
                        </p>
                        <span class="text-xs text-gray-400">
                          ${new Date(entry.created_at).toLocaleDateString()} ${new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400">by ${entry.user_name}</p>
                      ${entry.comment ? `
                        <p class="text-sm text-gray-300 mt-2 p-2 bg-white/5 rounded-lg">${entry.comment}</p>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="text-center py-8">
                <i class="fas fa-history text-gray-500 text-3xl mb-4"></i>
                <p class="text-gray-400">No workflow history yet</p>
              </div>
            `}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Assignment -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Assignment</h3>
            
            <form hx-post="/admin/workflow/content/${data.content.id}/assign" 
                  hx-target="#assignment-response" 
                  hx-swap="innerHTML"
                  class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Assign to User</label>
                <select name="assigned_to" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="">Select user...</option>
                  <!-- Users would be populated via HTMX or server-side -->
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <input type="datetime-local" name="due_date" 
                       class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
              </div>
              
              <button type="submit" 
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Assign
              </button>
            </form>
            
            <div id="assignment-response" class="mt-4"></div>
          </div>

          <!-- Scheduling -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Schedule Action</h3>
            
            <form hx-post="/admin/workflow/content/${data.content.id}/schedule" 
                  hx-target="#schedule-response" 
                  hx-swap="innerHTML"
                  class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <select name="action" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
                <input type="datetime-local" name="scheduled_at" required
                       class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                <select name="timezone" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              
              <button type="submit" 
                      class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Schedule
              </button>
            </form>
            
            <div id="schedule-response" class="mt-4"></div>
          </div>

          <!-- Scheduled Actions -->
          ${data.scheduledActions.length > 0 ? `
            <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-white mb-4">Scheduled Actions</h3>
              
              <div class="space-y-3">
                ${data.scheduledActions.map(action => `
                  <div class="p-3 bg-white/5 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-white capitalize">${action.action}</span>
                      <button onclick="cancelScheduledAction('${action.id}')" 
                              class="text-red-400 hover:text-red-300 text-xs">
                        Cancel
                      </button>
                    </div>
                    <p class="text-xs text-gray-400">
                      ${new Date(action.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Transition Modal -->
    <div id="transition-modal" class="fixed inset-0 z-50 hidden">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 max-w-md w-full">
          <h3 class="text-xl font-semibold text-white mb-4" id="transition-title">Confirm Transition</h3>
          
          <form hx-post="/admin/workflow/content/${data.content.id}/transition" 
                hx-target="#transition-response" 
                hx-swap="innerHTML"
                class="space-y-4">
            <input type="hidden" name="to_state_id" id="transition-state-id">
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Comment (optional)</label>
              <textarea name="comment" rows="3" 
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                        placeholder="Add a comment about this transition..."></textarea>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Confirm
              </button>
              <button type="button" onclick="closeTransitionModal()" 
                      class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
          
          <div id="transition-response" class="mt-4"></div>
        </div>
      </div>
    </div>

    <script>
      function openTransitionModal(stateId, stateName) {
        document.getElementById('transition-state-id').value = stateId
        document.getElementById('transition-title').textContent = \`Move to \${stateName}\`
        document.getElementById('transition-modal').classList.remove('hidden')
      }

      function closeTransitionModal() {
        document.getElementById('transition-modal').classList.add('hidden')
      }

      async function cancelScheduledAction(scheduleId) {
        try {
          const response = await fetch(\`/admin/workflow/scheduled/\${scheduleId}\`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            location.reload()
          } else {
            alert('Failed to cancel scheduled action')
          }
        } catch (error) {
          console.error('Error:', error)
          alert('Failed to cancel scheduled action')
        }
      }

      // Close modal when clicking outside
      document.getElementById('transition-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeTransitionModal()
        }
      })
    </script>
  `

  return renderAdminLayout({
    title: `${data.content.title} - Workflow - SonicJS AI`,
    pageTitle: `${data.content.title} - Workflow`,
    content,
    user: data.user,
    currentPath: 'workflow'
  })
}