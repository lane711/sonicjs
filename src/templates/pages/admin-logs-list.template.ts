import { html } from 'hono/html'
import { adminLayoutV2 } from '../layouts/admin-layout-v2.template'

interface BaseUser {
  name: string
  email: string
  role: string
}

export interface LogEntry {
  id: string
  level: string
  category: string
  message: string
  data?: any
  userId?: string
  sessionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  stackTrace?: string
  tags: string[]
  source?: string
  createdAt: Date
  formattedDate: string
  formattedDuration?: string
  levelClass: string
  categoryClass: string
}

export interface LogsListPageData {
  logs: LogEntry[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    startItem: number
    endItem: number
    baseUrl: string
  }
  filters: {
    level: string
    category: string
    search: string
    startDate: string
    endDate: string
    source: string
  }
  user?: BaseUser
}

export function renderLogsListPage(data: LogsListPageData) {
  const { logs, pagination, filters, user } = data

  const content = html`
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">System Logs</h1>
          <p class="mt-2 text-sm text-gray-700">
            Monitor and analyze system activity, errors, and performance metrics.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <a
            href="/admin/logs/config"
            class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Configure
          </a>
          <a
            href="/admin/logs/export?${new URLSearchParams(filters).toString()}"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Export
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-6 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Filters</h2>
        </div>
        <div class="p-6">
          <form method="GET" action="/admin/logs" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                name="search"
                id="search"
                value="${filters.search}"
                placeholder="Search messages, URLs, IPs..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label for="level" class="block text-sm font-medium text-gray-700">Level</label>
              <select
                name="level"
                id="level"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Levels</option>
                <option value="debug" ${filters.level === 'debug' ? 'selected' : ''}>Debug</option>
                <option value="info" ${filters.level === 'info' ? 'selected' : ''}>Info</option>
                <option value="warn" ${filters.level === 'warn' ? 'selected' : ''}>Warning</option>
                <option value="error" ${filters.level === 'error' ? 'selected' : ''}>Error</option>
                <option value="fatal" ${filters.level === 'fatal' ? 'selected' : ''}>Fatal</option>
              </select>
            </div>
            
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                id="category"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                <option value="auth" ${filters.category === 'auth' ? 'selected' : ''}>Authentication</option>
                <option value="api" ${filters.category === 'api' ? 'selected' : ''}>API</option>
                <option value="workflow" ${filters.category === 'workflow' ? 'selected' : ''}>Workflow</option>
                <option value="plugin" ${filters.category === 'plugin' ? 'selected' : ''}>Plugin</option>
                <option value="media" ${filters.category === 'media' ? 'selected' : ''}>Media</option>
                <option value="system" ${filters.category === 'system' ? 'selected' : ''}>System</option>
                <option value="security" ${filters.category === 'security' ? 'selected' : ''}>Security</option>
                <option value="error" ${filters.category === 'error' ? 'selected' : ''}>Error</option>
              </select>
            </div>
            
            <div>
              <label for="source" class="block text-sm font-medium text-gray-700">Source</label>
              <input
                type="text"
                name="source"
                id="source"
                value="${filters.source}"
                placeholder="e.g., http-middleware"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                name="start_date"
                id="start_date"
                value="${filters.startDate}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                name="end_date"
                id="end_date"
                value="${filters.endDate}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div class="sm:col-span-2 lg:col-span-2 flex items-end">
              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
              >
                Apply Filters
              </button>
              <a
                href="/admin/logs"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear
              </a>
            </div>
          </form>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              Log Entries (${pagination.totalItems} total)
            </h2>
            <div class="text-sm text-gray-500">
              Showing ${pagination.startItem}-${pagination.endItem} of ${pagination.totalItems}
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${logs.map(log => html`
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.levelClass}">
                      ${log.level}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.categoryClass}">
                      ${log.category}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-md">
                      <div class="truncate" title="${log.message}">${log.message}</div>
                      ${log.url ? html`<div class="text-xs text-gray-500 truncate">${log.method} ${log.url}</div>` : ''}
                      ${log.duration ? html`<div class="text-xs text-gray-500">${log.formattedDuration}</div>` : ''}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${log.source || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${log.formattedDate}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/admin/logs/${log.id}" class="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${logs.length === 0 ? html`
          <div class="text-center py-12">
            <div class="text-gray-500">No log entries found matching your criteria.</div>
          </div>
        ` : ''}
      </div>

      <!-- Pagination -->
      ${pagination.totalPages > 1 ? html`
        <div class="mt-6 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            ${pagination.currentPage > 1 ? html`
              <a
                href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage - 1).toString()}).toString()}"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </a>
            ` : html`
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                Previous
              </span>
            `}
            ${pagination.currentPage < pagination.totalPages ? html`
              <a
                href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage + 1).toString()}).toString()}"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </a>
            ` : html`
              <span class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                Next
              </span>
            `}
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">${pagination.startItem}</span> to <span class="font-medium">${pagination.endItem}</span> of{' '}
                <span class="font-medium">${pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                ${pagination.currentPage > 1 ? html`
                  <a
                    href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage - 1).toString()}).toString()}"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </a>
                ` : ''}
                
                ${Array.from({ length: Math.min(10, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(pagination.totalPages - 9, pagination.currentPage - 5)) + i
                  if (page > pagination.totalPages) return ''
                  
                  return html`
                    <a
                      href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: page.toString()}).toString()}"
                      class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }"
                    >
                      ${page}
                    </a>
                  `
                }).join('')}
                
                ${pagination.currentPage < pagination.totalPages ? html`
                  <a
                    href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage + 1).toString()}).toString()}"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </a>
                ` : ''}
              </nav>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `

  return adminLayoutV2({
    title: 'System Logs',
    user,
    content
  })
}