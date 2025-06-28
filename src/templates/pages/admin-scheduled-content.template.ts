import { renderAdminLayout } from '../layouts/admin-layout-v2.template'

export interface ScheduledContentData {
  user: any
  scheduledContent: any[]
  stats: {
    pending: number
    completed: number
    failed: number
    cancelled: number
  }
}

export function renderScheduledContent(data: ScheduledContentData): string {
  const content = `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <nav class="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <a href="/admin/workflow/dashboard" class="hover:text-white transition-colors">Workflow</a>
            <i class="fas fa-chevron-right text-xs"></i>
            <span class="text-white">Scheduled Content</span>
          </nav>
          <h1 class="text-3xl font-bold text-white">Scheduled Content</h1>
          <p class="text-gray-300 mt-2">Manage scheduled publishing and content actions</p>
        </div>
        <div class="flex space-x-4">
          <button onclick="openBulkScheduleModal()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i class="fas fa-plus mr-2"></i>Bulk Schedule
          </button>
          <button onclick="refreshScheduledContent()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <i class="fas fa-sync mr-2"></i>Refresh
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Pending</p>
              <p class="text-2xl font-bold text-yellow-400">${data.stats.pending}</p>
            </div>
            <i class="fas fa-clock text-yellow-400 text-2xl"></i>
          </div>
        </div>

        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Completed</p>
              <p class="text-2xl font-bold text-green-400">${data.stats.completed}</p>
            </div>
            <i class="fas fa-check-circle text-green-400 text-2xl"></i>
          </div>
        </div>

        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Failed</p>
              <p class="text-2xl font-bold text-red-400">${data.stats.failed}</p>
            </div>
            <i class="fas fa-exclamation-circle text-red-400 text-2xl"></i>
          </div>
        </div>

        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">Cancelled</p>
              <p class="text-2xl font-bold text-gray-400">${data.stats.cancelled}</p>
            </div>
            <i class="fas fa-times-circle text-gray-400 text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Scheduled Content List -->
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">Scheduled Actions</h2>
          <div class="flex space-x-4">
            <select id="status-filter" onchange="filterByStatus(this.value)" 
                    class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select id="action-filter" onchange="filterByAction(this.value)" 
                    class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
              <option value="">All Actions</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="archive">Archive</option>
            </select>
          </div>
        </div>

        ${data.scheduledContent.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left py-4 px-4 text-sm font-medium text-gray-300">Content</th>
                  <th class="text-left py-4 px-4 text-sm font-medium text-gray-300">Action</th>
                  <th class="text-left py-4 px-4 text-sm font-medium text-gray-300">Scheduled Time</th>
                  <th class="text-left py-4 px-4 text-sm font-medium text-gray-300">Status</th>
                  <th class="text-left py-4 px-4 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody class="space-y-2">
                ${data.scheduledContent.map(item => `
                  <tr class="scheduled-item border-b border-white/5 hover:bg-white/5 transition-colors" 
                      data-status="${item.status}" data-action="${item.action}">
                    <td class="py-4 px-4">
                      <div>
                        <a href="/admin/workflow/content/${item.content_id}" 
                           class="text-white hover:text-blue-300 transition-colors font-medium">
                          ${item.title}
                        </a>
                        <p class="text-xs text-gray-400 mt-1">${item.collection_name}</p>
                      </div>
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-3 py-1 text-xs font-medium rounded-full capitalize bg-blue-600/20 text-blue-400">
                        ${item.action}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="text-sm text-white">
                        ${new Date(item.scheduled_at).toLocaleDateString()}
                      </div>
                      <div class="text-xs text-gray-400">
                        ${new Date(item.scheduled_at).toLocaleTimeString()}
                      </div>
                      ${item.timezone !== 'UTC' ? `
                        <div class="text-xs text-gray-500">${item.timezone}</div>
                      ` : ''}
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-3 py-1 text-xs font-medium rounded-full capitalize bg-yellow-600/20 text-yellow-400">
                        ${item.status}
                      </span>
                      ${item.executed_at ? `
                        <div class="text-xs text-gray-400 mt-1">
                          Executed: ${new Date(item.executed_at).toLocaleString()}
                        </div>
                      ` : ''}
                      ${item.error_message ? `
                        <div class="text-xs text-red-400 mt-1 truncate" title="${item.error_message}">
                          Error: ${item.error_message}
                        </div>
                      ` : ''}
                    </td>
                    <td class="py-4 px-4">
                      <div class="flex space-x-2">
                        ${item.status === 'pending' ? `
                          <button onclick="editScheduledAction('${item.id}')" 
                                  class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 border border-blue-400/30 rounded">
                            Edit
                          </button>
                          <button onclick="cancelScheduledAction('${item.id}')" 
                                  class="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/30 rounded">
                            Cancel
                          </button>
                        ` : ''}
                        ${item.status === 'failed' ? `
                          <button onclick="retryScheduledAction('${item.id}')" 
                                  class="text-yellow-400 hover:text-yellow-300 text-xs px-2 py-1 border border-yellow-400/30 rounded">
                            Retry
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="text-center py-12">
            <i class="fas fa-calendar-times text-gray-500 text-4xl mb-4"></i>
            <h3 class="text-lg font-medium text-white mb-2">No Scheduled Content</h3>
            <p class="text-gray-400 mb-6">Schedule content actions to automate your publishing workflow</p>
            <button onclick="openBulkScheduleModal()" 
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <i class="fas fa-plus mr-2"></i>Schedule Content
            </button>
          </div>
        `}
      </div>
    </div>

    <!-- Bulk Schedule Modal -->
    <div id="bulk-schedule-modal" class="fixed inset-0 z-50 hidden">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-semibold text-white mb-6">Bulk Schedule Content</h3>
          
          <form hx-post="/admin/workflow/bulk-schedule" 
                hx-target="#bulk-schedule-response" 
                hx-swap="innerHTML"
                class="space-y-6">
            <!-- Content Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">Select Content</label>
              <div class="max-h-40 overflow-y-auto border border-white/10 rounded-lg p-3 space-y-2">
                <!-- Content items would be populated via HTMX -->
                <div class="text-sm text-gray-400">Loading content...</div>
              </div>
            </div>
            
            <!-- Action Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <select name="action" required 
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                <select name="timezone" 
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
            
            <!-- Scheduling Options -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">Scheduling Method</label>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input type="radio" name="schedule_method" value="single_time" checked 
                         class="mr-3" onchange="toggleScheduleMethod()">
                  <span class="text-white">Same time for all</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="schedule_method" value="staggered" 
                         class="mr-3" onchange="toggleScheduleMethod()">
                  <span class="text-white">Staggered (intervals)</span>
                </label>
              </div>
            </div>
            
            <!-- Single Time -->
            <div id="single-time-options">
              <label class="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
              <input type="datetime-local" name="scheduled_at" 
                     class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
            </div>
            
            <!-- Staggered Options -->
            <div id="staggered-options" class="hidden space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input type="datetime-local" name="start_time" 
                         class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Interval</label>
                  <input type="number" name="interval_minutes" value="15" min="1" 
                         class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                  <select name="interval_unit" 
                          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Selected Content
              </button>
              <button type="button" onclick="closeBulkScheduleModal()" 
                      class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
          
          <div id="bulk-schedule-response" class="mt-6"></div>
        </div>
      </div>
    </div>

    <script>
      function getStatusColor(status) {
        const colors = {
          pending: 'bg-yellow-600/20 text-yellow-400',
          completed: 'bg-green-600/20 text-green-400',
          failed: 'bg-red-600/20 text-red-400',
          cancelled: 'bg-gray-600/20 text-gray-400'
        }
        return colors[status] || 'bg-gray-600/20 text-gray-400'
      }

      function getActionColor(action) {
        const colors = {
          publish: 'bg-green-600/20 text-green-400',
          unpublish: 'bg-orange-600/20 text-orange-400',
          archive: 'bg-gray-600/20 text-gray-400'
        }
        return colors[action] || 'bg-blue-600/20 text-blue-400'
      }

      function filterByStatus(status) {
        const items = document.querySelectorAll('.scheduled-item')
        items.forEach(item => {
          if (!status || item.dataset.status === status) {
            item.style.display = ''
          } else {
            item.style.display = 'none'
          }
        })
      }

      function filterByAction(action) {
        const items = document.querySelectorAll('.scheduled-item')
        items.forEach(item => {
          if (!action || item.dataset.action === action) {
            item.style.display = ''
          } else {
            item.style.display = 'none'
          }
        })
      }

      function openBulkScheduleModal() {
        document.getElementById('bulk-schedule-modal').classList.remove('hidden')
      }

      function closeBulkScheduleModal() {
        document.getElementById('bulk-schedule-modal').classList.add('hidden')
      }

      function toggleScheduleMethod() {
        const singleTime = document.getElementById('single-time-options')
        const staggered = document.getElementById('staggered-options')
        const method = document.querySelector('input[name="schedule_method"]:checked').value
        
        if (method === 'single_time') {
          singleTime.classList.remove('hidden')
          staggered.classList.add('hidden')
        } else {
          singleTime.classList.add('hidden')
          staggered.classList.remove('hidden')
        }
      }

      async function cancelScheduledAction(scheduleId) {
        if (!confirm('Are you sure you want to cancel this scheduled action?')) return
        
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

      function refreshScheduledContent() {
        location.reload()
      }
    </script>
  `

  return renderAdminLayout({
    title: 'Scheduled Content - SonicJS AI',
    content,
    user: data.user,
    currentPage: 'workflow'
  })
}