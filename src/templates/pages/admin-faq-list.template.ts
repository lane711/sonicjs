import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderTable } from '../components/table.template'
import { renderAlert } from '../components/alert.template'
import { renderPagination } from '../components/pagination.template'

interface FAQ {
  id: number
  question: string
  answer: string
  category?: string
  tags?: string
  isPublished: boolean
  sortOrder: number
  created_at: number
  updated_at: number
}

interface FAQListData {
  faqs: FAQ[]
  totalCount: number
  currentPage: number
  totalPages: number
  user?: { name: string; email: string; role: string }
  message?: string
  messageType?: 'success' | 'error' | 'warning' | 'info'
}

export function renderFAQList(data: FAQListData): string {
  const { faqs, totalCount, currentPage, totalPages, message, messageType } = data

  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">FAQ Management</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage frequently asked questions</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/faq/new"
             class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add FAQ
          </a>
        </div>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Filters -->
      <div class="relative rounded-xl overflow-hidden mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1">
                <div>
                  <label for="category" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Category</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select
                      name="category"
                      id="category"
                      hx-get="/admin/faq"
                      hx-trigger="change"
                      hx-target="#faq-list"
                      hx-include="[name='published'], [name='search']"
                      class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48"
                    >
                      <option value="">All Categories</option>
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="support">Support</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label for="published" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select
                      name="published"
                      id="published"
                      hx-get="/admin/faq"
                      hx-trigger="change"
                      hx-target="#faq-list"
                      hx-include="[name='category'], [name='search']"
                      class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48"
                    >
                      <option value="">All</option>
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 max-w-md">
                  <label for="search" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Search</label>
                  <div class="relative group">
                    <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Search questions..."
                      hx-get="/admin/faq"
                      hx-trigger="keyup changed delay:300ms"
                      hx-target="#faq-list"
                      hx-include="[name='category'], [name='published']"
                      class="w-full rounded-full bg-transparent px-11 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-x-3 ml-4">
                <span class="text-sm/6 font-medium text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">${totalCount} ${totalCount === 1 ? 'item' : 'items'}</span>
                <button
                  onclick="location.reload()"
                  class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200"
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

      <!-- FAQ List -->
      <div id="faq-list">
        ${faqs.length > 0 ? renderTable({
          tableId: 'faq-table',
          rowClickable: true,
          rowClickUrl: (row: any) => `/admin/faq/${row.id}`,
          columns: [
            { key: 'question', label: 'Question', sortable: true, sortType: 'string' },
            { key: 'category', label: 'Category', sortable: true, sortType: 'string' },
            { key: 'isPublished', label: 'Status', sortable: true, sortType: 'boolean' },
            { key: 'sortOrder', label: 'Order', sortable: true, sortType: 'number' },
            { key: 'created_at', label: 'Created', sortable: true, sortType: 'date' },
            { key: 'actions', label: 'Actions', sortable: false }
          ],
          rows: faqs.map(faq => ({
            id: faq.id,
            question: `
              <div class="max-w-xs">
                <div class="font-medium text-zinc-950 dark:text-white truncate">${escapeHtml(faq.question)}</div>
                ${faq.tags ? `<div class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">${escapeHtml(faq.tags)}</div>` : ''}
              </div>
            `,
            category: faq.category ? `
              <span class="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 text-sm font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/20">
                ${escapeHtml(faq.category)}
              </span>
            ` : '<span class="text-zinc-500 dark:text-zinc-400">—</span>',
            isPublished: faq.isPublished ? `
              <span class="inline-flex items-center rounded-md bg-lime-50 dark:bg-lime-500/10 px-2.5 py-1 text-sm font-medium text-lime-700 dark:text-lime-300 ring-1 ring-inset ring-lime-700/10 dark:ring-lime-400/20">
                Published
              </span>
            ` : `
              <span class="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-500/10 px-2.5 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-300 ring-1 ring-inset ring-yellow-700/10 dark:ring-yellow-400/20">
                Draft
              </span>
            `,
            sortOrder: faq.sortOrder.toString(),
            created_at: new Date(faq.created_at * 1000).toLocaleDateString(),
            actions: `
              <div class="flex space-x-2">
                <button
                  class="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  hx-delete="/admin/faq/${faq.id}"
                  hx-confirm="Are you sure you want to delete this FAQ?"
                  hx-target="#faq-list"
                  hx-swap="outerHTML"
                  title="Delete"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            `
          })),
          selectable: true
        }) : `
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-zinc-950 dark:text-white">No FAQs</h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Get started by creating your first FAQ.</p>
            <div class="mt-6">
              <a href="/admin/faq/new"
                 class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
                <svg class="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                New FAQ
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
        baseUrl: '/admin/faq'
      }) : ''}
    </div>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'FAQ Management - Admin',
    pageTitle: 'FAQ Management',
    currentPath: '/admin/faq',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}