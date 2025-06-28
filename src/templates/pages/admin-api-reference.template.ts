import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface APIEndpoint {
  method: string
  path: string
  description: string
  authentication: boolean
  category: string
}

export interface APIReferencePageData {
  endpoints: APIEndpoint[]
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderAPIReferencePage(data: APIReferencePageData): string {
  // Group endpoints by category
  const endpointsByCategory = data.endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = []
    }
    acc[endpoint.category]!.push(endpoint)
    return acc
  }, {} as Record<string, APIEndpoint[]>)

  // Category order and descriptions
  const categoryInfo = {
    'Auth': {
      title: 'Authentication',
      description: 'User authentication and authorization endpoints',
      icon: '🔐'
    },
    'Content': {
      title: 'Content Management',
      description: 'Content creation, retrieval, and management',
      icon: '📝'
    },
    'Media': {
      title: 'Media Management',
      description: 'File upload, storage, and media operations',
      icon: '🖼️'
    },
    'Admin': {
      title: 'Admin Interface',
      description: 'Administrative panel and management features',
      icon: '⚙️'
    },
    'System': {
      title: 'System',
      description: 'Health checks and system information',
      icon: '🔧'
    }
  }

  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">API Reference</h1>
          <p class="mt-2 text-sm text-gray-300">Complete documentation of all available API endpoints</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/api/" target="_blank" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            OpenAPI Spec
          </a>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 text-center">
          <div class="text-2xl font-bold text-blue-400">${data.endpoints.length}</div>
          <div class="text-sm text-gray-300">Total Endpoints</div>
        </div>
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 text-center">
          <div class="text-2xl font-bold text-green-400">${data.endpoints.filter(e => !e.authentication).length}</div>
          <div class="text-sm text-gray-300">Public Endpoints</div>
        </div>
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 text-center">
          <div class="text-2xl font-bold text-yellow-400">${data.endpoints.filter(e => e.authentication).length}</div>
          <div class="text-sm text-gray-300">Protected Endpoints</div>
        </div>
        <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 text-center">
          <div class="text-2xl font-bold text-purple-400">${Object.keys(endpointsByCategory).length}</div>
          <div class="text-sm text-gray-300">Categories</div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-1">Search Endpoints</label>
            <input 
              type="text" 
              id="endpoint-search"
              placeholder="Search by path or description..."
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-1">Filter by Method</label>
            <select 
              id="method-filter"
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors w-full"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-1">Filter by Category</label>
            <select 
              id="category-filter"
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors w-full"
            >
              <option value="">All Categories</option>
              ${Object.keys(categoryInfo).map(category => `
                <option value="${category}">${(categoryInfo as any)[category].title}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- API Categories -->
      <div class="space-y-8">
        ${Object.entries(endpointsByCategory).map(([category, endpoints]) => {
          const info = (categoryInfo as any)[category] || { title: category, description: '', icon: '📋' }
          return `
            <div class="api-category" data-category="${category}">
              <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                <!-- Category Header -->
                <div class="bg-white/5 px-6 py-4 border-b border-white/10">
                  <div class="flex items-center">
                    <span class="text-2xl mr-3">${info.icon}</span>
                    <div>
                      <h2 class="text-xl font-semibold text-white">${info.title}</h2>
                      <p class="text-sm text-gray-300">${info.description}</p>
                    </div>
                    <div class="ml-auto">
                      <span class="backdrop-blur-sm bg-white/20 px-3 py-1 rounded-xl text-sm text-white">
                        ${endpoints.length} endpoint${endpoints.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Endpoints List -->
                <div class="p-6">
                  <div class="space-y-4">
                    ${endpoints.map(endpoint => `
                      <div class="api-endpoint backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all" 
                           data-method="${endpoint.method}" 
                           data-path="${endpoint.path}" 
                           data-description="${endpoint.description}">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <div class="flex items-center mb-2">
                              <span class="method-badge method-${endpoint.method.toLowerCase()} px-2 py-1 rounded text-xs font-mono font-bold mr-3">
                                ${endpoint.method}
                              </span>
                              <code class="text-blue-300 text-sm font-mono">${endpoint.path}</code>
                              ${endpoint.authentication ? `
                                <span class="ml-2 backdrop-blur-sm bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">
                                  🔒 Auth Required
                                </span>
                              ` : `
                                <span class="ml-2 backdrop-blur-sm bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">
                                  🌍 Public
                                </span>
                              `}
                            </div>
                            <p class="text-gray-300 text-sm">${endpoint.description}</p>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>

      <!-- No Results Message -->
      <div id="no-results" class="hidden backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-8 text-center">
        <div class="text-gray-300">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-lg text-white">No endpoints found</p>
          <p class="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    </div>

    <style>
      .method-badge {
        min-width: 50px;
        text-align: center;
      }
      .method-get { background-color: rgba(34, 197, 94, 0.8); color: white; }
      .method-post { background-color: rgba(59, 130, 246, 0.8); color: white; }
      .method-put { background-color: rgba(249, 115, 22, 0.8); color: white; }
      .method-patch { background-color: rgba(168, 85, 247, 0.8); color: white; }
      .method-delete { background-color: rgba(239, 68, 68, 0.8); color: white; }
    </style>

    <script>
      // Filter functionality
      const searchInput = document.getElementById('endpoint-search');
      const methodFilter = document.getElementById('method-filter');
      const categoryFilter = document.getElementById('category-filter');
      const noResultsDiv = document.getElementById('no-results');

      function filterEndpoints() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedMethod = methodFilter.value;
        const selectedCategory = categoryFilter.value;

        const categories = document.querySelectorAll('.api-category');
        let visibleEndpoints = 0;

        categories.forEach(category => {
          const categoryName = category.dataset.category;
          const endpoints = category.querySelectorAll('.api-endpoint');
          let visibleInCategory = 0;

          // Check if category should be visible
          const categoryVisible = !selectedCategory || categoryName === selectedCategory;

          if (categoryVisible) {
            endpoints.forEach(endpoint => {
              const method = endpoint.dataset.method;
              const path = endpoint.dataset.path.toLowerCase();
              const description = endpoint.dataset.description.toLowerCase();

              const matchesSearch = !searchTerm || 
                path.includes(searchTerm) || 
                description.includes(searchTerm);
              const matchesMethod = !selectedMethod || method === selectedMethod;

              if (matchesSearch && matchesMethod) {
                endpoint.style.display = 'block';
                visibleInCategory++;
                visibleEndpoints++;
              } else {
                endpoint.style.display = 'none';
              }
            });

            category.style.display = visibleInCategory > 0 ? 'block' : 'none';
          } else {
            category.style.display = 'none';
          }
        });

        // Show/hide no results message
        noResultsDiv.style.display = visibleEndpoints === 0 ? 'block' : 'none';
      }

      // Attach event listeners
      searchInput.addEventListener('input', filterEndpoints);
      methodFilter.addEventListener('change', filterEndpoints);
      categoryFilter.addEventListener('change', filterEndpoints);

      // Copy endpoint path to clipboard
      document.addEventListener('click', function(e) {
        const endpoint = e.target.closest('.api-endpoint');
        if (endpoint && e.target.tagName === 'CODE') {
          const path = endpoint.dataset.path;
          navigator.clipboard.writeText(path).then(() => {
            // Show temporary tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'fixed top-4 right-4 backdrop-blur-xl bg-green-500/90 text-white px-4 py-2 rounded-xl shadow-2xl z-50';
            tooltip.textContent = 'Path copied to clipboard!';
            document.body.appendChild(tooltip);
            setTimeout(() => document.body.removeChild(tooltip), 2000);
          });
        }
      });
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'API Reference',
    pageTitle: 'API Reference',
    currentPath: '/admin/api-reference',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}