export interface ContentListTemplateData {
  modelName: string
  status: string
  page: number
  models: Array<{
    name: string
    displayName: string
    selected?: boolean
  }>
  contentItems: Array<{
    id: string
    title: string
    slug: string
    modelName: string
    statusBadge: string
    authorName: string
    formattedDate: string
    availableActions: string[]
  }>
  paginationStart: number
  paginationEnd: number
  totalResults: number
  showPrevious: boolean
  previousPage: number
  nextPage: number
}

export function renderContentListTemplate(data: ContentListTemplateData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Management - SonicJS AI Admin</title>
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
    .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
    .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300; }
    .btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
    .btn-warning { @apply bg-yellow-600 text-white hover:bg-yellow-700; }
    .btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
    .btn-sm { @apply px-2 py-1 text-sm; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Content Management</h1>
            <nav class="flex space-x-4">
              <a href="/admin" class="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/admin/content" class="text-blue-600 font-medium">Content</a>
              <a href="/admin/collections" class="text-gray-600 hover:text-gray-900">Collections</a>
              <a href="/admin/users" class="text-gray-600 hover:text-gray-900">Users</a>
            </nav>
          </div>
          <a href="/admin/content/new" class="btn btn-primary">New Content</a>
        </div>
      </div>
    </header>
    
    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Model:</label>
            <select 
              name="model" 
              class="border border-gray-300 rounded-md px-3 py-1"
              hx-get="/admin/content"
              hx-trigger="change"
              hx-target="#content-list"
              hx-include="[name='status']"
            >
              <option value="all" ${data.modelName === 'all' ? 'selected' : ''}>All Models</option>
              ${data.models.map(model => `
                <option value="${model.name}" ${data.modelName === model.name ? 'selected' : ''}>
                  ${model.displayName}
                </option>
              `).join('')}
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Status:</label>
            <select 
              name="status" 
              class="border border-gray-300 rounded-md px-3 py-1"
              hx-get="/admin/content"
              hx-trigger="change"
              hx-target="#content-list"
              hx-include="[name='model']"
            >
              <option value="all" ${data.status === 'all' ? 'selected' : ''}>All Status</option>
              <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="review" ${data.status === 'review' ? 'selected' : ''}>Under Review</option>
              <option value="scheduled" ${data.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="published" ${data.status === 'published' ? 'selected' : ''}>Published</option>
              <option value="archived" ${data.status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2 ml-auto">
            <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
            <button 
              class="btn btn-primary"
              hx-get="/admin/content/bulk-actions"
              hx-target="#bulk-actions-modal"
            >
              Bulk Actions
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content List -->
      <div id="content-list" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" class="rounded" id="select-all">
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${data.contentItems.map(item => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded content-checkbox" value="${item.id}">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          <a href="/admin/content/${item.id}" class="hover:text-blue-600">${item.title}</a>
                        </div>
                        <div class="text-sm text-gray-500">${item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.modelName}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${item.statusBadge}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.authorName}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.formattedDate}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <a href="/admin/content/${item.id}/edit" class="btn btn-sm btn-primary">Edit</a>
                      <button 
                        class="btn btn-sm btn-secondary"
                        hx-get="/admin/content/${item.id}/versions"
                        hx-target="#versions-modal"
                      >
                        History
                      </button>
                      ${item.availableActions.length > 0 ? `
                        <div class="relative inline-block text-left">
                          <button class="btn btn-sm btn-secondary" onclick="toggleDropdown('${item.id}')">Actions ▼</button>
                          <div id="dropdown-${item.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            ${item.availableActions.map((action: string) => `
                              <button 
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                hx-post="/admin/content/${item.id}/workflow"
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
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="btn btn-secondary">Previous</button>
            <button class="btn btn-secondary">Next</button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">${data.paginationStart}</span> to 
                <span class="font-medium">${data.paginationEnd}</span> of 
                <span class="font-medium">${data.totalResults}</span> results
              </p>
            </div>
            <div class="flex space-x-2">
              ${data.showPrevious ? `
                <a href="/admin/content?page=${data.previousPage}&model=${data.modelName}&status=${data.status}" 
                   class="btn btn-secondary">Previous</a>
              ` : ''}
              <span class="px-3 py-2 text-sm text-gray-700">Page ${data.page}</span>
              <a href="/admin/content?page=${data.nextPage}&model=${data.modelName}&status=${data.status}" 
                 class="btn btn-secondary">Next</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modals -->
  <div id="bulk-actions-modal"></div>
  <div id="versions-modal"></div>
  
  <script>
    // Select all functionality
    document.getElementById('select-all').addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.content-checkbox');
      checkboxes.forEach(cb => cb.checked = this.checked);
    });
    
    // Dropdown toggle
    function toggleDropdown(id) {
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
</body>
</html>`
}