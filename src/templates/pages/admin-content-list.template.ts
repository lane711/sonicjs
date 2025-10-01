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
        ]
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
        ]
      }
    ],
    actions: [
      {
        label: 'Refresh',
        className: 'btn-secondary',
        onclick: 'location.reload()'
      }
    ],
    bulkActions: true
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
                ${filterBarData.bulkActions ? `
                  <div class="relative inline-block" id="bulk-actions-dropdown">
                    <button
                      onclick="toggleBulkActionsDropdown()"
                      class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200"
                    >
                      Bulk Actions
                      <svg viewBox="0 0 20 20" fill="currentColor" class="size-4 text-zinc-500 dark:text-zinc-400">
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                      </svg>
                    </button>

                    <div
                      id="bulk-actions-menu"
                      class="hidden absolute right-0 mt-2 w-56 origin-top-right divide-y divide-zinc-200 dark:divide-white/10 rounded-lg bg-white dark:bg-zinc-800 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 z-50 transition-all duration-100 scale-95 opacity-0"
                      style="transition-behavior: allow-discrete;"
                    >
                      <div class="py-1">
                        <button
                          onclick="performBulkAction('publish')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-zinc-950 dark:group-hover/item:text-white">
                            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                          </svg>
                          Publish Selected
                        </button>
                        <button
                          onclick="performBulkAction('draft')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-zinc-950 dark:group-hover/item:text-white">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                          </svg>
                          Move to Draft
                        </button>
                      </div>
                      <div class="py-1">
                        <button
                          onclick="performBulkAction('delete')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-red-600 dark:group-hover/item:text-red-400">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" fill-rule="evenodd" />
                          </svg>
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  </div>
                ` : ''}
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

      // Toggle bulk actions dropdown
      function toggleBulkActionsDropdown() {
        const menu = document.getElementById('bulk-actions-menu');
        const isHidden = menu.classList.contains('hidden');

        if (isHidden) {
          menu.classList.remove('hidden');
          setTimeout(() => {
            menu.classList.remove('scale-95', 'opacity-0');
            menu.classList.add('scale-100', 'opacity-100');
          }, 10);
        } else {
          menu.classList.remove('scale-100', 'opacity-100');
          menu.classList.add('scale-95', 'opacity-0');
          setTimeout(() => {
            menu.classList.add('hidden');
          }, 100);
        }
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('bulk-actions-dropdown');
        const menu = document.getElementById('bulk-actions-menu');
        if (dropdown && menu && !dropdown.contains(e.target)) {
          menu.classList.remove('scale-100', 'opacity-100');
          menu.classList.add('scale-95', 'opacity-0');
          setTimeout(() => {
            menu.classList.add('hidden');
          }, 100);
        }
      });

      // Perform bulk action
      function performBulkAction(action) {
        const selectedIds = Array.from(document.querySelectorAll('input[type="checkbox"].row-checkbox:checked'))
          .map(cb => cb.value)
          .filter(id => id);

        if (selectedIds.length === 0) {
          alert('Please select at least one item');
          return;
        }

        const actionText = action === 'publish' ? 'publish' : action === 'draft' ? 'move to draft' : 'delete';
        const confirmed = confirm(\`Are you sure you want to \${actionText} \${selectedIds.length} item(s)?\`);

        if (!confirmed) return;

        // Close dropdown
        const menu = document.getElementById('bulk-actions-menu');
        menu.classList.add('hidden');

        fetch('/admin/content/bulk-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: action,
            ids: selectedIds
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            location.reload();
          } else {
            alert('Error: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          console.error('Bulk action error:', err);
          alert('Failed to perform bulk action');
        });
      }

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