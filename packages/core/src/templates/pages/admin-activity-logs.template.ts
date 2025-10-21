import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: number
  user_email?: string
  user_name?: string
}

export interface ActivityLogsPageData {
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    user_id?: string
    action?: string
    resource_type?: string
    date_from?: string
    date_to?: string
  }
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderActivityLogsPage(data: ActivityLogsPageData): string {
  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">Activity Logs</h1>
          <p class="mt-2 text-sm text-gray-300">Monitor user actions and system activity</p>
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-3">
          <li>
            <a href="/admin" class="text-gray-300 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium text-gray-200">Activity Logs</span>
          </li>
        </ol>
      </nav>

      <!-- Filters -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-white mb-4">Filters</h3>
        
        <form method="GET" action="/admin/activity-logs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Action</label>
            <select name="action" class="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30">
              <option value="">All Actions</option>
              <option value="user.login" ${data.filters.action === 'user.login' ? 'selected' : ''}>User Login</option>
              <option value="user.logout" ${data.filters.action === 'user.logout' ? 'selected' : ''}>User Logout</option>
              <option value="user.invite_sent" ${data.filters.action === 'user.invite_sent' ? 'selected' : ''}>User Invited</option>
              <option value="user.invitation_accepted" ${data.filters.action === 'user.invitation_accepted' ? 'selected' : ''}>Invitation Accepted</option>
              <option value="profile.update" ${data.filters.action === 'profile.update' ? 'selected' : ''}>Profile Update</option>
              <option value="profile.password_change" ${data.filters.action === 'profile.password_change' ? 'selected' : ''}>Password Change</option>
              <option value="content.create" ${data.filters.action === 'content.create' ? 'selected' : ''}>Content Created</option>
              <option value="content.update" ${data.filters.action === 'content.update' ? 'selected' : ''}>Content Updated</option>
              <option value="content.delete" ${data.filters.action === 'content.delete' ? 'selected' : ''}>Content Deleted</option>
              <option value="collection.create" ${data.filters.action === 'collection.create' ? 'selected' : ''}>Collection Created</option>
              <option value="collection.update" ${data.filters.action === 'collection.update' ? 'selected' : ''}>Collection Updated</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Resource Type</label>
            <select name="resource_type" class="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30">
              <option value="">All Resources</option>
              <option value="users" ${data.filters.resource_type === 'users' ? 'selected' : ''}>Users</option>
              <option value="content" ${data.filters.resource_type === 'content' ? 'selected' : ''}>Content</option>
              <option value="collections" ${data.filters.resource_type === 'collections' ? 'selected' : ''}>Collections</option>
              <option value="media" ${data.filters.resource_type === 'media' ? 'selected' : ''}>Media</option>
              <option value="settings" ${data.filters.resource_type === 'settings' ? 'selected' : ''}>Settings</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">From Date</label>
            <input 
              type="date" 
              name="date_from" 
              value="${data.filters.date_from || ''}"
              class="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">To Date</label>
            <input 
              type="date" 
              name="date_to" 
              value="${data.filters.date_to || ''}"
              class="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30"
            >
          </div>

          <div class="md:col-span-2 lg:col-span-4 flex gap-3">
            <button 
              type="submit"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Apply Filters
            </button>
            <a 
              href="/admin/activity-logs"
              class="px-6 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Clear Filters
            </a>
          </div>
        </form>
      </div>

      <!-- Activity Logs Table -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl overflow-hidden">
        <div class="relative px-6 py-4 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">Recent Activity</h2>
            <div class="text-sm text-gray-300">
              Showing ${data.logs.length} of ${data.pagination.total} logs
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resource</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              ${data.logs.map(log => `
                <tr class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${new Date(log.created_at).toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-white">${log.user_name || 'Unknown'}</div>
                    <div class="text-xs text-gray-400">${log.user_email || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeClass(log.action)}">
                      ${formatAction(log.action)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${log.resource_type ? `
                      <div class="text-white">${log.resource_type}</div>
                      ${log.resource_id ? `<div class="text-xs text-gray-400">${log.resource_id}</div>` : ''}
                    ` : 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${log.ip_address || 'N/A'}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-300">
                    ${log.details ? `
                      <details class="cursor-pointer">
                        <summary class="text-blue-400 hover:text-blue-300">View Details</summary>
                        <pre class="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">${JSON.stringify(log.details, null, 2)}</pre>
                      </details>
                    ` : 'N/A'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${data.logs.length === 0 ? `
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-300">No activity logs found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ` : ''}

        <!-- Pagination -->
        ${data.pagination.pages > 1 ? `
          <div class="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div class="text-sm text-gray-300">
              Page ${data.pagination.page} of ${data.pagination.pages} (${data.pagination.total} total logs)
            </div>
            <div class="flex space-x-2">
              ${data.pagination.page > 1 ? `
                <a href="?page=${data.pagination.page - 1}&${new URLSearchParams(data.filters as Record<string, string>).toString()}" 
                   class="px-3 py-1 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                  Previous
                </a>
              ` : ''}
              ${data.pagination.page < data.pagination.pages ? `
                <a href="?page=${data.pagination.page + 1}&${new URLSearchParams(data.filters as Record<string, string>).toString()}" 
                   class="px-3 py-1 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                  Next
                </a>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: 'Activity Logs',
    pageTitle: 'Activity Logs',
    currentPath: '/admin/activity-logs',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function getActionBadgeClass(action: string): string {
  if (action.includes('login') || action.includes('logout')) {
    return 'bg-blue-500/20 text-blue-300'
  } else if (action.includes('create') || action.includes('invite')) {
    return 'bg-green-500/20 text-green-300'
  } else if (action.includes('update') || action.includes('change')) {
    return 'bg-yellow-500/20 text-yellow-300'
  } else if (action.includes('delete') || action.includes('cancel')) {
    return 'bg-red-500/20 text-red-300'
  } else {
    return 'bg-gray-500/20 text-gray-300'
  }
}

function formatAction(action: string): string {
  // Convert action from dot notation to readable format
  return action
    .split('.')
    .map(part => part.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join(' - ')
}