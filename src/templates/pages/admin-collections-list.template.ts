import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
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
                <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mr-3 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">${collection.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div class="text-sm font-medium text-white">${collection.name}</div>
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
        render: (value, collection) => collection.description || '<span class="text-gray-500">-</span>'
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
          if (!collection || !collection.id) return '<span class="text-gray-500">-</span>'
          return `
            <div class="flex items-center space-x-2">
              <a href="/admin/collections/${collection.id}" class="inline-flex items-center px-3 py-1 text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 transition-all border border-green-500/30">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Edit
              </a>
              <a href="/admin/collections/${collection.name || collection.id}/content" class="inline-flex items-center px-3 py-1 text-sm leading-4 font-medium rounded-lg text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all border border-blue-500/30">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">Collections</h1>
          <p class="mt-2 text-sm text-gray-300">Manage your content collections and their schemas</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/collections/new" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Collection
          </a>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Search collections..." 
                class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm w-64 text-white placeholder-gray-300"
                hx-get="/admin/collections/search"
                hx-trigger="keyup changed delay:300ms"
                hx-target="#collections-list"
              >
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-300">${data.collections.length} collections</span>
            <button 
              class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-white/10 text-white text-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              onclick="location.reload()"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <!-- Collections List -->
      <div id="collections-list">
        ${renderTable(tableData)}
      </div>
      
      <!-- Empty State -->
      ${data.collections.length === 0 ? `
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-8 text-center">
          <div class="text-gray-400">
            <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p class="mt-2 text-lg text-gray-300">No collections found</p>
            <p class="mt-1 text-sm text-gray-400">Get started by creating your first collection</p>
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