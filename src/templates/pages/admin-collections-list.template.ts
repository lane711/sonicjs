import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderTable, TableData } from '../components/table.template'

export interface Collection {
  id: string
  name: string
  display_name: string
  description?: string
  created_at: number
  formattedDate: string
}

export interface CollectionsListPageData {
  collections: Collection[]
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderCollectionsListPage(data: CollectionsListPageData): string {
  const tableData: TableData<Collection> = {
    tableId: 'collections-table',
    rowClickable: true,
    rowClickUrl: (collection: Collection) => `/admin/collections/${collection.id}`,
    columns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        sortType: 'string',
        render: (value, collection) => `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-zinc-950 dark:bg-white rounded-full mr-3 flex items-center justify-center">
                    <span class="text-white dark:text-zinc-950 text-sm font-medium">${collection.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div class="text-sm font-medium text-zinc-950 dark:text-white">${collection.name}</div>
            </div>
          `
      },
      {
        key: 'display_name',
        label: 'Display Name',
        sortable: true,
        sortType: 'string'
      },
      {
        key: 'description',
        label: 'Description',
        sortable: true,
        sortType: 'string',
        render: (value, collection) => collection.description || '<span class="text-zinc-500 dark:text-zinc-400">-</span>'
      },
      {
        key: 'formattedDate',
        label: 'Created',
        sortable: true,
        sortType: 'date'
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (value, collection) => {
          if (!collection || !collection.id) return '<span class="text-zinc-500 dark:text-zinc-400">-</span>'
          return `
            <div class="flex items-center space-x-2">
              <a href="/admin/collections/${collection.id}" class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Edit
              </a>
              <a href="/admin/collections/${collection.name || collection.id}/content" class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Content
              </a>
            </div>
          `
        }
      }
    ],
    rows: data.collections,
    emptyMessage: 'No collections found.'
  }

  const pageContent = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Collections</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage your content collections and their schemas</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/collections/new" class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Collection
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
        <div class="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search collections..."
                  class="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 pl-9 text-sm w-64 text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
                  hx-get="/admin/collections/search"
                  hx-trigger="keyup changed delay:300ms"
                  hx-target="#collections-list"
                >
                <svg class="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
            <div class="flex items-center gap-x-3">
              <span class="text-sm/6 text-zinc-500 dark:text-zinc-400">${data.collections.length} ${data.collections.length === 1 ? 'collection' : 'collections'}</span>
              <button
                class="inline-flex items-center gap-x-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white text-sm rounded-lg ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                onclick="location.reload()"
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

      <!-- Collections List -->
      <div id="collections-list">
        ${renderTable(tableData)}
      </div>

      <!-- Empty State -->
      ${data.collections.length === 0 ? `
        <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <h3 class="mt-4 text-base/7 font-semibold text-zinc-950 dark:text-white">No collections found</h3>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Get started by creating your first collection</p>
          <div class="mt-6">
            <a href="/admin/collections/new" class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
              <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              New Collection
            </a>
          </div>
        </div>
      ` : ''}
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: 'Collections',
    pageTitle: 'Collections',
    currentPath: '/admin/collections',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}