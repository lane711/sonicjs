import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
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
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">FAQ Management</h1>
          <p class="mt-2 text-sm text-gray-300">Manage frequently asked questions</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/faq/new" 
             class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add FAQ
          </a>
        </div>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Filters -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select name="category" id="category" 
                    class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
                    hx-get="/admin/faq" 
                    hx-trigger="change" 
                    hx-target="#faq-list"
                    hx-include="[name='published'], [name='search']">
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <label for="published" class="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select name="published" id="published" 
                    class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
                    hx-get="/admin/faq" 
                    hx-trigger="change" 
                    hx-target="#faq-list"
                    hx-include="[name='category'], [name='search']">
              <option value="">All</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <div>
            <label for="search" class="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input type="text" name="search" id="search" placeholder="Search questions..." 
                   class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
                   hx-get="/admin/faq" 
                   hx-trigger="keyup changed delay:300ms" 
                   hx-target="#faq-list"
                   hx-include="[name='category'], [name='published']">
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
                <div class="font-medium text-white truncate">${escapeHtml(faq.question)}</div>
                ${faq.tags ? `<div class="text-sm text-gray-300 mt-1">${escapeHtml(faq.tags)}</div>` : ''}
              </div>
            `,
            category: faq.category ? `
              <span class="inline-flex items-center rounded-xl backdrop-blur-sm bg-white/20 px-2 py-1 text-xs font-medium text-white">
                ${escapeHtml(faq.category)}
              </span>
            ` : '<span class="text-gray-500">—</span>',
            isPublished: faq.isPublished ? `
              <span class="inline-flex items-center rounded-xl backdrop-blur-sm bg-green-500/80 px-2 py-1 text-xs font-medium text-white">
                Published
              </span>
            ` : `
              <span class="inline-flex items-center rounded-xl backdrop-blur-sm bg-yellow-500/80 px-2 py-1 text-xs font-medium text-white">
                Draft
              </span>
            `,
            sortOrder: faq.sortOrder.toString(),
            created_at: new Date(faq.created_at * 1000).toLocaleDateString(),
            actions: `
              <div class="flex items-center space-x-2">
                <button type="button" 
                        class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-red-500/80 text-white text-sm rounded-xl border border-white/20 hover:bg-red-500 transition-all"
                        hx-delete="/admin/faq/${faq.id}"
                        hx-confirm="Are you sure you want to delete this FAQ?"
                        hx-target="#faq-list"
                        hx-swap="outerHTML">
                  Delete
                </button>
              </div>
            `
          })),
          selectable: true
        }) : `
          <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-white">No FAQs</h3>
            <p class="mt-1 text-sm text-gray-300">Get started by creating your first FAQ.</p>
            <div class="mt-6">
              <a href="/admin/faq/new" 
                 class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
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

  const layoutData: AdminLayoutData = {
    title: 'FAQ Management - Admin',
    pageTitle: 'FAQ Management',
    currentPath: '/admin/faq',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}