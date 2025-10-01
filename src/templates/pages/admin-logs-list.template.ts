import { html } from 'hono/html'
import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

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
    <div>
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div class="sm:flex-auto">
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">System Logs</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            Monitor and analyze system activity, errors, and performance metrics.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 flex gap-x-2">
          <a
            href="/admin/logs/config"
            class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors shadow-sm"
          >
            Configure
          </a>
          <a
            href="/admin/logs/export?${new URLSearchParams(filters).toString()}"
            class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Export
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="relative rounded-xl overflow-hidden mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
          <div class="px-6 py-5">
            <form method="GET" action="/admin/logs" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="relative group">
                  <label for="search" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Search</label>
                  <div class="relative">
                    <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value="${filters.search}"
                      placeholder="Search messages..."
                      class="w-full rounded-full bg-transparent pl-11 pr-4 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label for="level" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Level</label>
                  <select
                    name="level"
                    id="level"
                    class="w-full rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
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
                  <label for="category" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Category</label>
                  <select
                    name="category"
                    id="category"
                    class="w-full rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
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
                  <label for="source" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Source</label>
                  <input
                    type="text"
                    name="source"
                    id="source"
                    value="${filters.source}"
                    placeholder="e.g., http-middleware"
                    class="w-full rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label for="start_date" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    id="start_date"
                    value="${filters.startDate}"
                    class="w-full rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label for="end_date" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    id="end_date"
                    value="${filters.endDate}"
                    class="w-full rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                  />
                </div>

                <div class="sm:col-span-2 flex items-end gap-x-2">
                  <button
                    type="submit"
                    class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                  >
                    Apply Filters
                  </button>
                  <a
                    href="/admin/logs"
                    class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors shadow-sm"
                  >
                    Clear
                  </a>
                </div>
              </div>

              <div class="flex items-center justify-end pt-2">
                <span class="text-sm/6 font-medium text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">${pagination.totalItems} ${pagination.totalItems === 1 ? 'entry' : 'entries'}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-zinc-950/5 dark:border-white/5">
                <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white sm:pl-6">
                  Level
                </th>
                <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white">
                  Category
                </th>
                <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white">
                  Message
                </th>
                <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white">
                  Source
                </th>
                <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white">
                  Time
                </th>
                <th scope="col" class="relative px-4 py-3.5 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr class="border-t border-zinc-950/5 dark:border-white/5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:via-blue-50/30 hover:to-purple-50/50 dark:hover:from-cyan-900/20 dark:hover:via-blue-900/10 dark:hover:to-purple-900/20 hover:shadow-sm hover:shadow-cyan-500/5 dark:hover:shadow-cyan-400/5 transition-all duration-300">
                  <td class="px-4 py-4 whitespace-nowrap sm:pl-6">
                    <span class="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${log.levelClass}">
                      ${log.level}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${log.categoryClass}">
                      ${log.category}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="text-sm max-w-md">
                      <div class="truncate text-zinc-950 dark:text-white" title="${log.message}">${log.message}</div>
                      ${log.url ? `<div class="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">${log.method} ${log.url}</div>` : ''}
                      ${log.duration ? `<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">${log.formattedDuration}</div>` : ''}
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    ${log.source || '-'}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    ${log.formattedDate}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:pr-6">
                    <a href="/admin/logs/${log.id}" class="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
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
            <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-zinc-950 dark:text-white">No log entries</h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No log entries found matching your criteria.</p>
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
                class="relative inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors"
              >
                Previous
              </a>
            ` : html`
              <span class="relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed">
                Previous
              </span>
            `}
            ${pagination.currentPage < pagination.totalPages ? html`
              <a
                href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage + 1).toString()}).toString()}"
                class="ml-3 relative inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors"
              >
                Next
              </a>
            ` : html`
              <span class="ml-3 relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed">
                Next
              </span>
            `}
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-zinc-700 dark:text-zinc-300">
                Showing <span class="font-medium">${pagination.startItem}</span> to <span class="font-medium">${pagination.endItem}</span> of{' '}
                <span class="font-medium">${pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                ${pagination.currentPage > 1 ? html`
                  <a
                    href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage - 1).toString()}).toString()}"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-lg bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors"
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

                  return `
                    <a
                      href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: page.toString()}).toString()}"
                      class="relative inline-flex items-center px-4 py-2 text-sm font-medium ring-1 ring-inset transition-colors ${
                        page === pagination.currentPage
                          ? 'z-10 bg-cyan-50 dark:bg-cyan-900/20 ring-cyan-600 dark:ring-cyan-400 text-cyan-600 dark:text-cyan-400'
                          : 'bg-white dark:bg-zinc-800 ring-zinc-950/10 dark:ring-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                      }"
                    >
                      ${page}
                    </a>
                  `
                }).join('')}

                ${pagination.currentPage < pagination.totalPages ? html`
                  <a
                    href="${pagination.baseUrl}?${new URLSearchParams({...filters, page: (pagination.currentPage + 1).toString()}).toString()}"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-lg bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors"
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

  const layoutData: AdminLayoutCatalystData = {
    title: 'System Logs',
    pageTitle: 'System Logs',
    currentPath: '/admin/logs',
    user,
    content: content as any
  }

  return renderAdminLayoutCatalyst(layoutData)
}