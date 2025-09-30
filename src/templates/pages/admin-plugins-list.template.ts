import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface Plugin {
  id: string
  name: string
  displayName: string
  description: string
  version: string
  author: string
  status: 'active' | 'inactive' | 'error'
  category: string
  icon: string
  downloadCount?: number
  rating?: number
  lastUpdated: string
  dependencies?: string[]
  permissions?: string[]
  isCore?: boolean
}

export interface PluginsListPageData {
  plugins: Plugin[]
  stats?: {
    total: number
    active: number
    inactive: number
    errors: number
  }
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderPluginsListPage(data: PluginsListPageData): string {
  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Plugins</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage and extend functionality with plugins</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div class="relative inline-block text-left">
            <button onclick="toggleDropdown()" class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
              <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Install Plugin
              <svg class="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="plugin-dropdown" class="hidden absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 focus:outline-none">
              <div class="py-1">
                <button onclick="installPlugin('faq-plugin')" class="block w-full text-left px-4 py-2 text-sm text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors first:rounded-t-xl">
                  <div class="flex items-center">
                    <span class="text-lg mr-2">❓</span>
                    <div>
                      <div class="font-medium">FAQ System</div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400">Community FAQ management plugin</div>
                    </div>
                  </div>
                </button>
                <div class="border-t border-zinc-950/5 dark:border-white/10 my-1"></div>
                <button onclick="showNotification('Plugin marketplace coming soon!', 'info')" class="block w-full text-left px-4 py-2 text-sm text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors last:rounded-b-xl">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <div class="font-medium">Browse Marketplace</div>
                      <div class="text-xs text-zinc-500 dark:text-zinc-400">Discover more plugins</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        ${renderPluginStatsCards(data.stats)}
      </div>

      <!-- Filters -->
      <div class="relative rounded-xl overflow-hidden mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1">
                <div>
                  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Category</label>
                  <select class="rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm min-w-48 text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300">
                    <option value="">All Categories</option>
                    <option value="content">Content Management</option>
                    <option value="media">Media</option>
                    <option value="seo">SEO & Analytics</option>
                    <option value="security">Security</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Status</label>
                  <select class="rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2 text-sm min-w-48 text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div class="flex-1 max-w-md">
                  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Search</label>
                  <div class="relative group">
                    <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search plugins..."
                      class="w-full rounded-full bg-transparent px-11 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-x-3 ml-4">
                <button
                  onclick="location.reload()"
                  class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200"
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
      </div>

    <!-- Plugins Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      ${data.plugins.map(plugin => renderPluginCard(plugin)).join('')}
    </div>

    <script>
      async function togglePlugin(pluginId, action) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = action === 'activate' ? 'Activating...' : 'Deactivating...';
        
        try {
          const response = await fetch(\`/admin/plugins/\${pluginId}/\${action}\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Update UI
            const card = button.closest('.plugin-card');
            const statusBadge = card.querySelector('.status-badge');
            
            if (action === 'activate') {
              statusBadge.className = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-600/30';
              statusBadge.innerHTML = '<div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>Active';
              button.textContent = 'Deactivate';
              button.onclick = () => togglePlugin(pluginId, 'deactivate');
              button.className = 'bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors';
            } else {
              statusBadge.className = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-400 border border-gray-600/30';
              statusBadge.innerHTML = '<div class="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>Inactive';
              button.textContent = 'Activate';
              button.onclick = () => togglePlugin(pluginId, 'activate');
              button.className = 'bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors';
            }
            
            showNotification(\`Plugin \${action}d successfully\`, 'success');
          } else {
            throw new Error(result.error || \`Failed to \${action} plugin\`);
          }
        } catch (error) {
          showNotification(error.message, 'error');
          button.textContent = originalText;
        } finally {
          button.disabled = false;
        }
      }
      
      async function installPlugin(pluginName) {
        const button = event.target;
        button.disabled = true;
        button.textContent = 'Installing...';
        
        try {
          const response = await fetch('/admin/plugins/install', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: pluginName })
          });
          
          const result = await response.json();
          
          if (result.success) {
            showNotification('Plugin installed successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
          } else {
            throw new Error(result.error || 'Failed to install plugin');
          }
        } catch (error) {
          showNotification(error.message, 'error');
          button.disabled = false;
          button.textContent = 'Install';
        }
      }
      
      async function uninstallPlugin(pluginId) {
        if (!confirm('Are you sure you want to uninstall this plugin? This action cannot be undone.')) {
          return;
        }
        
        const button = event.target;
        button.disabled = true;
        
        try {
          const response = await fetch(\`/admin/plugins/\${pluginId}/uninstall\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const result = await response.json();
          
          if (result.success) {
            showNotification('Plugin uninstalled successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
          } else {
            throw new Error(result.error || 'Failed to uninstall plugin');
          }
        } catch (error) {
          showNotification(error.message, 'error');
          button.disabled = false;
        }
      }
      
      function openPluginSettings(pluginId) {
        window.location.href = \`/admin/plugins/\${pluginId}\`;
      }
      
      function showPluginDetails(pluginId) {
        // TODO: Implement plugin details modal
        showNotification('Plugin details coming soon!', 'info');
      }
      
      function showNotification(message, type) {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        notification.className = \`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 \${bgColor}\`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
      
      function toggleDropdown() {
        const dropdown = document.getElementById('plugin-dropdown');
        dropdown.classList.toggle('hidden');
      }
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('plugin-dropdown');
        const button = event.target.closest('button[onclick="toggleDropdown()"]');
        
        if (!button && !dropdown.contains(event.target)) {
          dropdown.classList.add('hidden');
        }
      });
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Plugins',
    pageTitle: 'Plugin Management',
    currentPath: '/admin/plugins',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}

function renderPluginStatsCards(stats?: PluginsListPageData['stats']): string {
  if (!stats) {
    stats = {
      total: 0,
      active: 0,
      inactive: 0,
      errors: 0
    }
  }

  const cards = [
    {
      title: 'Total Plugins',
      value: stats.total.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>`,
      color: 'bg-gradient-to-br from-blue-400 to-purple-500'
    },
    {
      title: 'Active Plugins',
      value: stats.active.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>`,
      color: 'bg-gradient-to-br from-green-400 to-teal-500'
    },
    {
      title: 'Inactive Plugins',
      value: stats.inactive.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>`,
      color: 'bg-gradient-to-br from-gray-400 to-gray-600'
    },
    {
      title: 'Errors',
      value: stats.errors.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>`,
      color: 'bg-gradient-to-br from-red-400 to-pink-500'
    }
  ]

  return cards.map(card => `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">${card.title}</p>
                <p class="text-zinc-950 dark:text-white text-2xl font-bold">${card.value}</p>
            </div>
            <div class="w-12 h-12 ${card.color} rounded-lg flex items-center justify-center">
                ${card.icon}
            </div>
        </div>
    </div>
  `).join('')
}

function renderPluginCard(plugin: Plugin): string {
  const statusColors = {
    active: 'bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-300 ring-lime-700/10 dark:ring-lime-400/20',
    inactive: 'bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 ring-zinc-700/10 dark:ring-zinc-400/20',
    error: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-700/10 dark:ring-red-400/20'
  }

  const statusIcons = {
    active: '<div class="w-2 h-2 bg-lime-500 dark:bg-lime-400 rounded-full mr-2"></div>',
    inactive: '<div class="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 rounded-full mr-2"></div>',
    error: '<div class="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>'
  }

  const actionButton = plugin.status === 'active'
    ? `<button onclick="togglePlugin('${plugin.id}', 'deactivate')" class="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Deactivate</button>`
    : `<button onclick="togglePlugin('${plugin.id}', 'activate')" class="bg-lime-600 dark:bg-lime-700 hover:bg-lime-700 dark:hover:bg-lime-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Activate</button>`

  return `
    <div class="plugin-card rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 rounded-lg flex items-center justify-center text-white">
            ${plugin.icon || `<span class="text-xl font-bold">${plugin.displayName.charAt(0).toUpperCase()}</span>`}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white">${plugin.displayName}</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">v${plugin.version} by ${plugin.author}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <span class="status-badge inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${statusColors[plugin.status]}">
            ${statusIcons[plugin.status]}${plugin.status.charAt(0).toUpperCase() + plugin.status.slice(1)}
          </span>
          ${plugin.isCore ? '<span class="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-1 ring-inset ring-cyan-700/10 dark:ring-cyan-400/20">Core</span>' : ''}
        </div>
      </div>

      <p class="text-zinc-600 dark:text-zinc-300 text-sm mb-4 line-clamp-3">${plugin.description}</p>

      <div class="flex items-center gap-4 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          ${plugin.category}
        </span>

        ${plugin.downloadCount ? `
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          ${plugin.downloadCount.toLocaleString()}
        </span>
        ` : ''}

        ${plugin.rating ? `
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${plugin.rating}
        </span>
        ` : ''}

        <span>${plugin.lastUpdated}</span>
      </div>

      ${plugin.dependencies && plugin.dependencies.length > 0 ? `
      <div class="mb-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Dependencies:</p>
        <div class="flex flex-wrap gap-1">
          ${plugin.dependencies.map(dep => `<span class="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2 py-1 rounded">${dep}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          ${!plugin.isCore ? actionButton : ''}
          <button onclick="openPluginSettings('${plugin.id}')" class="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            Settings
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="showPluginDetails('${plugin.id}')" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Plugin Details">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>

          ${!plugin.isCore ? `
          <button onclick="uninstallPlugin('${plugin.id}')" class="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Uninstall Plugin">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          ` : ''}
        </div>
      </div>
    </div>
  `
}

// Mock data generator
export function generateMockPlugins(): Plugin[] {
  return [
    {
      id: '1',
      name: 'seo-optimizer',
      displayName: 'SEO Optimizer',
      description: 'Advanced SEO optimization tools including meta tag management, sitemap generation, and analytics integration. Boost your search engine rankings with automated optimizations.',
      version: '2.1.4',
      author: 'SonicJS Team',
      status: 'active',
      category: 'seo',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      downloadCount: 15420,
      rating: 4.8,
      lastUpdated: '2 days ago',
      dependencies: ['analytics-plugin'],
      permissions: ['read:content', 'write:meta'],
      isCore: true
    },
    {
      id: '2',
      name: 'image-optimizer',
      displayName: 'Image Optimizer',
      description: 'Automatically compress and optimize images on upload. Supports WebP conversion, lazy loading, and responsive image generation for better performance.',
      version: '1.5.2',
      author: 'MediaPro',
      status: 'active',
      category: 'media',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      downloadCount: 8930,
      rating: 4.6,
      lastUpdated: '1 week ago',
      dependencies: [],
      permissions: ['write:media', 'read:settings']
    },
    {
      id: '3',
      name: 'backup-manager',
      displayName: 'Backup Manager',
      description: 'Automated backup solution for content and media files. Schedule regular backups to cloud storage with encryption and restore capabilities.',
      version: '3.0.1',
      author: 'BackupCorp',
      status: 'inactive',
      category: 'utilities',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>`,
      downloadCount: 12450,
      rating: 4.9,
      lastUpdated: '3 days ago',
      dependencies: ['cloud-storage'],
      permissions: ['read:all', 'write:backups']
    },
    {
      id: '4',
      name: 'security-scanner',
      displayName: 'Security Scanner',
      description: 'Real-time security monitoring and vulnerability scanning. Detects malware, suspicious activities, and provides security recommendations.',
      version: '1.2.8',
      author: 'SecureWeb',
      status: 'error',
      category: 'security',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
      downloadCount: 5680,
      rating: 4.3,
      lastUpdated: '5 days ago',
      dependencies: ['security-core'],
      permissions: ['read:logs', 'read:files', 'write:security']
    },
    {
      id: '5',
      name: 'social-share',
      displayName: 'Social Share',
      description: 'Easy social media sharing buttons and Open Graph meta tag generation. Supports all major social platforms with customizable styling.',
      version: '2.3.0',
      author: 'SocialPlus',
      status: 'active',
      category: 'content',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>`,
      downloadCount: 22100,
      rating: 4.7,
      lastUpdated: '4 days ago',
      dependencies: [],
      permissions: ['read:content', 'write:meta']
    },
    {
      id: '6',
      name: 'analytics-pro',
      displayName: 'Analytics Pro',
      description: 'Advanced analytics dashboard with custom tracking events, conversion funnels, and detailed visitor insights. GDPR compliant with privacy controls.',
      version: '4.1.2',
      author: 'AnalyticsPro Inc',
      status: 'active',
      category: 'seo',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
      downloadCount: 18750,
      rating: 4.9,
      lastUpdated: '1 day ago',
      dependencies: ['gdpr-compliance'],
      permissions: ['read:analytics', 'write:tracking', 'read:users']
    },
    {
      id: '7',
      name: 'form-builder',
      displayName: 'Advanced Form Builder',
      description: 'Drag-and-drop form builder with conditional logic, file uploads, payment integration, and email notifications. Perfect for contact forms and surveys.',
      version: '1.8.5',
      author: 'FormWorks',
      status: 'inactive',
      category: 'content',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
      downloadCount: 9870,
      rating: 4.4,
      lastUpdated: '1 week ago',
      dependencies: ['email-service'],
      permissions: ['write:forms', 'read:submissions', 'send:emails']
    },
    {
      id: '8',
      name: 'cache-optimizer',
      displayName: 'Cache Optimizer',
      description: 'Intelligent caching system with Redis support, CDN integration, and automatic cache invalidation. Dramatically improves site performance.',
      version: '2.7.3',
      author: 'SpeedBoost',
      status: 'active',
      category: 'utilities',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      downloadCount: 13240,
      rating: 4.8,
      lastUpdated: '6 days ago',
      dependencies: ['redis-connector'],
      permissions: ['read:cache', 'write:cache', 'manage:cdn'],
      isCore: true
    },
    {
      id: '9',
      name: 'multilingual',
      displayName: 'Multilingual Support',
      description: 'Complete internationalization solution with automatic translation, language detection, and localized content management for global websites.',
      version: '3.2.1',
      author: 'GlobalWeb',
      status: 'active',
      category: 'content',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>`,
      downloadCount: 7650,
      rating: 4.5,
      lastUpdated: '2 weeks ago',
      dependencies: ['translation-api'],
      permissions: ['read:content', 'write:translations', 'manage:languages']
    }
  ]
}