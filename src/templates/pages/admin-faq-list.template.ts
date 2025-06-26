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
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-100">FAQ Management</h1>
          <p class="mt-2 text-sm text-gray-400">Manage frequently asked questions</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/faq/new" 
             class="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add FAQ
          </a>
        </div>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Filters -->
      <div class="bg-gray-800 rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select name="category" id="category" 
                    class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
                    class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
                   class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
          columns: [
            { key: 'question', label: 'Question', sortable: true },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'isPublished', label: 'Status', sortable: true },
            { key: 'sortOrder', label: 'Order', sortable: true },
            { key: 'created_at', label: 'Created', sortable: true },
            { key: 'actions', label: 'Actions', sortable: false }
          ],
          rows: faqs.map(faq => ({
            id: faq.id,
            question: `
              <div class="max-w-xs">
                <div class="font-medium text-gray-100 truncate">${escapeHtml(faq.question)}</div>
                ${faq.tags ? `<div class="text-sm text-gray-400 mt-1">${escapeHtml(faq.tags)}</div>` : ''}
              </div>
            `,
            category: faq.category ? `
              <span class="inline-flex items-center rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-gray-300">
                ${escapeHtml(faq.category)}
              </span>
            ` : '<span class="text-gray-500">—</span>',
            isPublished: faq.isPublished ? `
              <span class="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white">
                Published
              </span>
            ` : `
              <span class="inline-flex items-center rounded-md bg-yellow-600 px-2 py-1 text-xs font-medium text-white">
                Draft
              </span>
            `,
            sortOrder: faq.sortOrder.toString(),
            created_at: new Date(faq.created_at * 1000).toLocaleDateString(),
            actions: `
              <div class="flex items-center space-x-2">
                <a href="/admin/faq/${faq.id}" 
                   class="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Edit
                </a>
                <button type="button" 
                        class="text-red-400 hover:text-red-300 text-sm font-medium"
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
          <div class="bg-gray-800 rounded-lg p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-100">No FAQs</h3>
            <p class="mt-1 text-sm text-gray-400">Get started by creating your first FAQ.</p>
            <div class="mt-6">
              <a href="/admin/faq/new" 
                 class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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