import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
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
          { value: 'all', label: 'All Status', selected: data.status === 'all' },
          { value: 'draft', label: 'Draft', selected: data.status === 'draft' },
          { value: 'review', label: 'Under Review', selected: data.status === 'review' },
          { value: 'scheduled', label: 'Scheduled', selected: data.status === 'scheduled' },
          { value: 'published', label: 'Published', selected: data.status === 'published' },
          { value: 'archived', label: 'Archived', selected: data.status === 'archived' }
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
            <div class="text-sm font-medium text-white">
              <a href="/admin/content/${row.id}" class="hover:text-blue-400">${row.title}</a>
            </div>
            <div class="text-sm text-gray-400">${row.slug}</div>
          </div>
        </div>
      `
    },
    {
      key: 'modelName',
      label: 'Model',
      sortable: true,
      sortType: 'string',
      className: 'text-sm text-gray-300'
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
      className: 'text-sm text-gray-300'
    },
    {
      key: 'formattedDate',
      label: 'Updated',
      sortable: true,
      sortType: 'date',
      className: 'text-sm text-gray-400'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-sm font-medium',
      render: (value, row) => `
        <div class="flex space-x-2">
          <button 
            class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-white/10 text-white text-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            hx-get="/admin/content/${row.id}/versions"
            hx-target="#versions-modal"
          >
            History
          </button>
          ${row.availableActions.length > 0 ? `
            <div class="relative inline-block text-left">
              <button class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-white/10 text-white text-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all" onclick="toggleDropdown('${row.id}')">
                Actions ▼
              </button>
              <div id="dropdown-${row.id}" class="hidden absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl z-10">
                ${row.availableActions.map((action: string) => `
                  <button 
                    class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
                    hx-post="/admin/content/${row.id}/workflow"
                    hx-vals='{"action": "${action}"}'
                    hx-target="#content-list"
                    hx-swap="outerHTML"
                  >
                    ${action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
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
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">Content Management</h1>
          <p class="mt-2 text-sm text-gray-300">Manage and organize your content items</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/content/new" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Content
          </a>
        </div>
      </div>
      <!-- Filters -->
      ${renderFilterBar(filterBarData)}
      
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
      
      // Dropdown toggle
      function toggleDropdown(id) {
        // Close all other dropdowns
        document.querySelectorAll('[id^="dropdown-"]').forEach(dropdown => {
          if (dropdown.id !== 'dropdown-' + id) {
            dropdown.classList.add('hidden');
          }
        });
        
        // Toggle current dropdown
        const dropdown = document.getElementById('dropdown-' + id);
        dropdown.classList.toggle('hidden');
      }
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', function(event) {
        if (!event.target.closest('.relative')) {
          document.querySelectorAll('[id^="dropdown-"]').forEach(dropdown => {
            dropdown.classList.add('hidden');
          });
        }
      });
    </script>
  `

  // Prepare layout data
  const layoutData: AdminLayoutData = {
    title: 'Content Management',
    pageTitle: 'Content Management',
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}