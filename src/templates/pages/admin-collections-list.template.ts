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
        render: (value, collection) => `<code class="text-sm bg-gray-100 px-2 py-1 rounded">${collection.name}</code>`
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
        render: (value, collection) => collection.description || '<span class="text-gray-400">-</span>'
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
          if (!collection || !collection.id) return '<span class="text-gray-400">-</span>'
          return `
            <div class="flex items-center space-x-2">
              <a href="/admin/collections/${collection.id}" class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Edit
              </a>
              <a href="/admin/collections/${collection.name || collection.id}/content" class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Collections</h1>
          <p class="text-gray-600 mt-2">Manage your content collections and their schemas</p>
        </div>
        <a href="/admin/collections/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Collection
        </a>
      </div>
      
      <!-- Collections Table -->
      <div class="bg-white rounded-lg shadow-sm border">
        ${data.collections.length > 0 ? renderTable(tableData) : `
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No collections</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating your first collection.</p>
            <div class="mt-6">
              <a href="/admin/collections/new" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Collection
              </a>
            </div>
          </div>
        `}
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