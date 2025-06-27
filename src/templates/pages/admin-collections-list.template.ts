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
              <a href="/admin/collections/${collection.id}" class="inline-flex items-center px-3 py-1 text-sm leading-4 font-medium rounded-lg text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white transition-colors border border-white/20">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
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
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">Collections</h1>
            <p class="text-gray-300 mt-1">Manage your content collections and their schemas</p>
          </div>
          <a href="/admin/collections/new" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Collection
          </a>
        </div>
      </div>
      
      <!-- Collections Table -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden">
        ${data.collections.length > 0 ? renderTable(tableData) : `
          <div class="text-center py-16">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">No collections found</h3>
            <p class="text-gray-300 mb-6">Get started by creating your first collection to organize your content.</p>
            <a href="/admin/collections/new" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Your First Collection
            </a>
          </div>
        `}
      </div>
      
      <!-- Quick Actions -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/collections/new" class="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10 group">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-medium text-white">New Collection</h4>
              <p class="text-xs text-gray-300">Create a new content collection</p>
            </div>
          </a>
          
          <a href="/admin/content" class="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10 group">
            <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-medium text-white">Manage Content</h4>
              <p class="text-xs text-gray-300">View and edit all content</p>
            </div>
          </a>
          
          <a href="/admin/collections/import" class="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10 group">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-medium text-white">Import Data</h4>
              <p class="text-xs text-gray-300">Import from external sources</p>
            </div>
          </a>
        </div>
      </div>
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