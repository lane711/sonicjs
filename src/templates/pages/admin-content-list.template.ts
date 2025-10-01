import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderTable, TableData, TableColumn } from '../components/table.template'
import { renderFilterBar, FilterBarData } from '../components/filter-bar.template'
import { renderPagination, PaginationData } from '../components/pagination.template'

export interface ContentItem {
  id: string
  title: string
  slug: string
  modelName: string
  statusBadge: string
  authorName: string
  formattedDate: string
  availableActions: string[]
}

export interface ContentListPageData {
  modelName: string
  status: string
  page: number
  models: Array<{
    name: string
    displayName: string
  }>
  contentItems: ContentItem[]
  totalItems: number
  itemsPerPage: number
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderContentListPage(data: ContentListPageData): string {
  // Prepare filter bar data
  const filterBarData: FilterBarData = {
    filters: [
      {
        name: 'model',
        label: 'Model',
        options: [
          { value: 'all', label: 'All Models', selected: data.modelName === 'all' },
          ...data.models.map(model => ({
            value: model.name,
            label: model.displayName,
            selected: data.modelName === model.name
          }))
        ],
        hxTarget: '#content-list',
        hxInclude: '[name="status"]'
      },
      {
        name: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All Status', selected: data.status === 'all', color: 'zinc' },
          { value: 'draft', label: 'Draft', selected: data.status === 'draft', color: 'cyan' },
          { value: 'review', label: 'Under Review', selected: data.status === 'review', color: 'lime' },
          { value: 'scheduled', label: 'Scheduled', selected: data.status === 'scheduled', color: 'pink' },
          { value: 'published', label: 'Published', selected: data.status === 'published', color: 'purple' },
          { value: 'archived', label: 'Archived', selected: data.status === 'archived', color: 'amber' }
        ],
        hxTarget: '#content-list',
        hxInclude: '[name="model"]'
      }
    ],
    actions: [
      {
        label: 'Refresh',
        className: 'btn-secondary',
        onclick: 'location.reload()'
      },
      {
        label: 'Bulk Actions',
        className: 'btn-primary',
        hxGet: '/admin/content/bulk-actions',
        hxTarget: '#bulk-actions-modal'
      }
    ]
  }

  // Prepare table data
  const tableColumns: TableColumn[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      sortType: 'string',
      render: (value, row) => `
        <div class="flex items-center">
          <div>
            <div class="text-sm font-medium text-zinc-950 dark:text-white">
              <a href="/admin/content/${row.id}" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${row.title}</a>
            </div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400">${row.slug}</div>
          </div>
        </div>
      `
    },
    {
      key: 'modelName',
      label: 'Model',
      sortable: true,
      sortType: 'string',
      className: 'text-sm text-zinc-500 dark:text-zinc-400'
    },
    {
      key: 'statusBadge',
      label: 'Status',
      sortable: true,
      sortType: 'string',
      render: (value) => value
    },
    {
      key: 'authorName',
      label: 'Author',
      sortable: true,
      sortType: 'string',
      className: 'text-sm text-zinc-500 dark:text-zinc-400'
    },
    {
      key: 'formattedDate',
      label: 'Updated',
      sortable: true,
      sortType: 'date',
      className: 'text-sm text-zinc-500 dark:text-zinc-400'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-sm font-medium',
      render: (value, row) => `
        <div class="flex space-x-2">
          <button
            class="inline-flex items-center justify-center p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 ring-1 ring-inset ring-cyan-600/20 dark:ring-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
            onclick="window.location.href='/admin/content/${row.id}/edit'"
            title="Edit"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </button>
          <button
            class="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            hx-delete="/admin/content/${row.id}"
            hx-confirm="Are you sure you want to delete this content item?"
            hx-target="#content-list"
            hx-swap="outerHTML"
            title="Delete"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      `
    }
  ]

  const tableData: TableData<ContentItem> = {
    tableId: 'content-table',
    columns: tableColumns,
    rows: data.contentItems,
    selectable: true,
    rowClickable: true,
    rowClickUrl: (row: ContentItem) => `/admin/content/${row.id}/edit`,
    emptyMessage: 'No content found. Create your first content item to get started.'
  }

  // Prepare pagination data
  const totalPages = Math.ceil(data.totalItems / data.itemsPerPage)
  const startItem = (data.page - 1) * data.itemsPerPage + 1
  const endItem = Math.min(data.page * data.itemsPerPage, data.totalItems)

  const paginationData: PaginationData = {
    currentPage: data.page,
    totalPages,
    totalItems: data.totalItems,
    itemsPerPage: data.itemsPerPage,
    startItem,
    endItem,
    baseUrl: '/admin/content',
    queryParams: {
      model: data.modelName,
      status: data.status
    }
  }

  // Generate page content
  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Content Management</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage and organize your content items</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/content/new" class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Content
          </a>
        </div>
      </div>
      <!-- Filters -->
      <div class="relative rounded-xl overflow-hidden mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                ${filterBarData.filters.map(filter => {
                  const selectedOption = filter.options.find(opt => opt.selected);
                  const selectedColor = selectedOption?.color || 'cyan';
                  const colorMap: Record<string, string> = {
                    'cyan': 'bg-cyan-400 dark:bg-cyan-400',
                    'lime': 'bg-lime-400 dark:bg-lime-400',
                    'pink': 'bg-pink-400 dark:bg-pink-400',
                    'purple': 'bg-purple-400 dark:bg-purple-400',
                    'amber': 'bg-amber-400 dark:bg-amber-400',
                    'zinc': 'bg-zinc-400 dark:bg-zinc-400'
                  };

                  return `
                  <div>
                    <label class="block text-sm/6 font-medium text-zinc-950 dark:text-white">${filter.label}</label>
                    <div class="mt-2 grid grid-cols-1">
                      <div class="col-start-1 row-start-1 flex items-center gap-3 pl-3 pr-8 pointer-events-none">
                        ${filter.name === 'status' ? `<span class="inline-block size-2 shrink-0 rounded-full border border-transparent ${colorMap[selectedColor]}"></span>` : ''}
                      </div>
                      <select
                        name="${filter.name}"
                        hx-get="/admin/content"
                        hx-trigger="change"
                        hx-target="${filter.hxTarget || '#content-list'}"
                        hx-include="${filter.hxInclude || ''}"
                        class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 ${filter.name === 'status' ? 'pl-8' : 'pl-3'} pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48"
                      >
                        ${filter.options.map(opt => `
                          <option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>
                        `).join('')}
                      </select>
                      <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                `}).join('')}
              </div>
              <div class="flex items-center gap-x-3">
                <span class="text-sm/6 font-medium text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">${data.totalItems} ${data.totalItems === 1 ? 'item' : 'items'}</span>
                ${filterBarData.actions.map(action => `
                  <button
                    ${action.onclick ? `onclick="${action.onclick}"` : ''}
                    ${action.hxGet ? `hx-get="${action.hxGet}"` : ''}
                    ${action.hxTarget ? `hx-target="${action.hxTarget}"` : ''}
                    class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200"
                  >
                    ${action.label === 'Refresh' ? `
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    ` : ''}
                    ${action.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Content List -->
      <div id="content-list">
        ${renderTable(tableData)}
        ${renderPagination(paginationData)}
      </div>
      
    </div>
    
    <!-- Modals -->
    <div id="bulk-actions-modal"></div>
    <div id="versions-modal"></div>
    
    <script>
      // Select all functionality
      document.addEventListener('change', function(e) {
        if (e.target.id === 'select-all') {
          const checkboxes = document.querySelectorAll('.row-checkbox');
          checkboxes.forEach(cb => cb.checked = e.target.checked);
        }
      });
      
    </script>
  `

  // Prepare layout data
  const layoutData: AdminLayoutCatalystData = {
    title: 'Content Management',
    pageTitle: 'Content Management',
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}