import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderPagination, PaginationData } from '../pagination.template'
import { renderAlert } from '../alert.template'
import { renderTable, TableColumn, TableData } from '../table.template'

interface CodeExample {
  id: number
  title: string
  description?: string
  code: string
  language: string
  category?: string
  tags?: string
  isPublished: boolean
  sortOrder: number
  created_at: number
  updated_at: number
}

interface CodeExamplesListData {
  codeExamples: CodeExample[]
  totalCount: number
  currentPage: number
  totalPages: number
  user?: { name: string; email: string; role: string }
  message?: string
  messageType?: 'success' | 'error' | 'warning' | 'info'
}

export function renderCodeExamplesList(data: CodeExamplesListData): string {
  const { codeExamples, totalCount, currentPage, totalPages, message, messageType } = data

  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Code Examples</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage code snippets and examples</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/code-examples/new"
             class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Code Example
          </a>
        </div>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Filters -->
      <div class="relative rounded-xl overflow-hidden mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-400/20 dark:via-pink-400/20 dark:to-orange-400/20"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1">
                <div>
                  <label for="published" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select
                      name="published"
                      id="published"
                      hx-get="/admin/code-examples"
                      hx-trigger="change"
                      hx-target="#code-examples-list"
                      hx-include="[name='language'], [name='search']"
                      class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-purple-500/30 dark:outline-purple-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-500 dark:focus-visible:outline-purple-400 sm:text-sm/6 min-w-48"
                    >
                      <option value="">All</option>
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-purple-600 dark:text-purple-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label for="language" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Language</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select
                      name="language"
                      id="language"
                      hx-get="/admin/code-examples"
                      hx-trigger="change"
                      hx-target="#code-examples-list"
                      hx-include="[name='published'], [name='search']"
                      class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-purple-500/30 dark:outline-purple-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-500 dark:focus-visible:outline-purple-400 sm:text-sm/6 min-w-48"
                    >
                      <option value="">All Languages</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="java">Java</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="sql">SQL</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-purple-600 dark:text-purple-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 max-w-md">
                  <label for="search" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Search</label>
                  <div class="relative group">
                    <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-300 dark:to-pink-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Search code examples..."
                      hx-get="/admin/code-examples"
                      hx-trigger="keyup changed delay:300ms"
                      hx-target="#code-examples-list"
                      hx-include="[name='published'], [name='language']"
                      class="w-full rounded-full bg-transparent px-11 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-purple-200/50 dark:border-purple-700/50 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-purple-400/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-x-3 ml-4">
                <span class="text-sm/6 font-medium text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">${totalCount} ${totalCount === 1 ? 'item' : 'items'}</span>
                <button
                  onclick="location.reload()"
                  class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-purple-200/50 dark:ring-purple-700/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 hover:ring-purple-300 dark:hover:ring-purple-600 transition-all duration-200"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Examples List -->
      <div id="code-examples-list">
        ${codeExamples.length > 0 ? renderTable({
          tableId: 'code-examples-table',
          rowClickable: true,
          rowClickUrl: (row: any) => `/admin/code-examples/${row.id}`,
          columns: [
            { key: 'title', label: 'Title', sortable: true, sortType: 'string' },
            { key: 'language', label: 'Language', sortable: true, sortType: 'string' },
            { key: 'description', label: 'Description', sortable: false },
            { key: 'status', label: 'Status', sortable: true, sortType: 'boolean' },
            { key: 'sortOrder', label: 'Order', sortable: true, sortType: 'number' },
            { key: 'created_at', label: 'Created', sortable: true, sortType: 'date' }
          ],
          rows: codeExamples.map(example => {
            const truncatedDesc = example.description
              ? (example.description.length > 80
                  ? example.description.substring(0, 80) + '...'
                  : example.description)
              : 'No description'

            const languageColors: Record<string, string> = {
              javascript: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20 dark:ring-yellow-500/20',
              typescript: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20',
              python: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20',
              go: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 ring-cyan-600/20 dark:ring-cyan-500/20',
              rust: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-500/20',
              java: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20',
              php: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-600/20 dark:ring-indigo-500/20',
              ruby: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 ring-pink-600/20 dark:ring-pink-500/20',
              sql: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-500/20'
            }
            const langColor = languageColors[example.language.toLowerCase()] || 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 ring-zinc-600/20 dark:ring-zinc-500/20'

            return {
              id: example.id,
              title: `<div class="font-medium text-zinc-950 dark:text-white">${example.title}</div>`,
              language: `<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${langColor}">${example.language}</span>`,
              description: `<div class="text-sm text-zinc-700 dark:text-zinc-300 max-w-md">${truncatedDesc}</div>`,
              status: example.isPublished
                ? '<span class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">Published</span>'
                : '<span class="inline-flex items-center rounded-md bg-zinc-50 dark:bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/20 dark:ring-zinc-500/20">Draft</span>',
              sortOrder: example.sortOrder.toString(),
              created_at: new Date(example.created_at * 1000).toLocaleDateString()
            }
          }),
          selectable: true
        }) : `
          <div class="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
            <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 class="mt-2 text-sm font-semibold text-zinc-950 dark:text-white">No code examples</h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Get started by creating a new code example.</p>
            <div class="mt-6">
              <a href="/admin/code-examples/new" class="inline-flex items-center rounded-md bg-zinc-950 dark:bg-white px-3 py-2 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                New Code Example
              </a>
            </div>
          </div>
        `}
      </div>

      ${totalPages > 1 ? renderPagination({
        currentPage,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: 20,
        startItem: (currentPage - 1) * 20 + 1,
        endItem: Math.min(currentPage * 20, totalCount),
        baseUrl: '/admin/code-examples'
      }) : ''}
    </div>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Code Examples',
    pageTitle: 'Code Examples',
    currentPath: '/admin/code-examples',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}
