import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderConfirmationDialog, getConfirmationDialogScript } from '../components/confirmation-dialog.template'

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
  version?: string
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

      <!-- Experimental Notice -->
      <div class="mb-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Experimental Feature
            </h3>
            <div class="mt-2 text-sm text-amber-700 dark:text-amber-300">
              <p>
                Plugin management is currently under active development. While functional, some features may change or have limitations.
                Please report any issues you encounter on our <a href="https://discord.gg/8bMy6bv3sZ" target="_blank" class="font-medium underline hover:text-amber-900 dark:hover:text-amber-100">Discord community</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="mb-6">
        <h3 class="text-base font-semibold text-zinc-950 dark:text-white">Plugin Statistics</h3>
        <dl class="mt-5 grid grid-cols-1 divide-zinc-950/5 dark:divide-white/10 overflow-hidden rounded-lg bg-zinc-800/75 dark:bg-zinc-800/75 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-base font-normal text-zinc-700 dark:text-zinc-100">Total Plugins</dt>
            <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div class="flex items-baseline text-2xl font-semibold text-cyan-400">
                ${data.stats?.total || 0}
              </div>
              <div class="inline-flex items-baseline rounded-full bg-lime-400/10 text-lime-600 dark:text-lime-400 px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                <svg viewBox="0 0 20 20" fill="currentColor" class="-ml-1 mr-0.5 size-5 shrink-0 self-center">
                  <path d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
                <span class="sr-only">Increased by</span>
                8.5%
              </div>
            </dd>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-base font-normal text-zinc-700 dark:text-zinc-100">Active Plugins</dt>
            <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div class="flex items-baseline text-2xl font-semibold text-lime-400">
                ${data.stats?.active || 0}
              </div>
              <div class="inline-flex items-baseline rounded-full bg-lime-400/10 text-lime-600 dark:text-lime-400 px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                <svg viewBox="0 0 20 20" fill="currentColor" class="-ml-1 mr-0.5 size-5 shrink-0 self-center">
                  <path d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
                <span class="sr-only">Increased by</span>
                12.3%
              </div>
            </dd>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-base font-normal text-zinc-700 dark:text-zinc-100">Inactive Plugins</dt>
            <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div class="flex items-baseline text-2xl font-semibold text-purple-400">
                ${data.stats?.inactive || 0}
              </div>
              <div class="inline-flex items-baseline rounded-full bg-pink-400/10 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                <svg viewBox="0 0 20 20" fill="currentColor" class="-ml-1 mr-0.5 size-5 shrink-0 self-center">
                  <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
                <span class="sr-only">Decreased by</span>
                3.2%
              </div>
            </dd>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-base font-normal text-zinc-700 dark:text-zinc-100">Plugin Errors</dt>
            <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div class="flex items-baseline text-2xl font-semibold text-pink-400">
                ${data.stats?.errors || 0}
              </div>
              <div class="inline-flex items-baseline rounded-full bg-pink-400/10 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                <svg viewBox="0 0 20 20" fill="currentColor" class="-ml-1 mr-0.5 size-5 shrink-0 self-center">
                  <path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
                <span class="sr-only">Decreased by</span>
                1.5%
              </div>
            </dd>
          </div>
        </dl>
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
                  <label class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Category</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select id="category-filter" onchange="filterPlugins()" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48">
                      <option value="">All Categories</option>
                      <option value="content">Content Management</option>
                      <option value="media">Media</option>
                      <option value="seo">SEO & Analytics</option>
                      <option value="security">Security</option>
                      <option value="utilities">Utilities</option>
                      <option value="system">System</option>
                      <option value="development">Development</option>
                      <option value="demo">Demo</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status</label>
                  <div class="mt-2 grid grid-cols-1">
                    <select id="status-filter" onchange="filterPlugins()" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                    <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                      <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </div>
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
                      id="search-input"
                      type="text"
                      placeholder="Search plugins..."
                      oninput="filterPlugins()"
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
    <div id="plugins-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              // Update status badge
              statusBadge.className = 'status-badge inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-300 ring-lime-700/10 dark:ring-lime-400/20';
              statusBadge.innerHTML = '<div class="w-2 h-2 bg-lime-500 dark:bg-lime-400 rounded-full mr-2"></div>Active';
              // Update card border to green
              card.className = 'plugin-card rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-[3px] ring-lime-500 dark:ring-lime-400 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all';
              // Update button
              button.textContent = 'Deactivate';
              button.onclick = () => togglePlugin(pluginId, 'deactivate');
              button.className = 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
            } else {
              // Update status badge
              statusBadge.className = 'status-badge inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 ring-zinc-700/10 dark:ring-zinc-400/20';
              statusBadge.innerHTML = '<div class="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 rounded-full mr-2"></div>Inactive';
              // Update card border to pink
              card.className = 'plugin-card rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-[3px] ring-pink-500 dark:ring-pink-400 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all';
              // Update button
              button.textContent = 'Activate';
              button.onclick = () => togglePlugin(pluginId, 'activate');
              button.className = 'bg-lime-600 dark:bg-lime-700 hover:bg-lime-700 dark:hover:bg-lime-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
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
      
      let pluginToUninstall = null;

      async function uninstallPlugin(pluginId) {
        pluginToUninstall = pluginId;
        showConfirmDialog('uninstall-plugin-confirm');
      }

      async function performUninstallPlugin() {
        if (!pluginToUninstall) return;

        const button = event.target;
        if (button) button.disabled = true;

        try {
          const response = await fetch(\`/admin/plugins/\${pluginToUninstall}/uninstall\`, {
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
          if (button) button.disabled = false;
        } finally {
          pluginToUninstall = null;
        }
      }
      
      function openPluginSettings(pluginId) {
        // Email plugin has a custom settings page
        if (pluginId === 'email') {
          window.location.href = '/admin/plugins/email/settings';
        } else {
          window.location.href = \`/admin/plugins/\${pluginId}\`;
        }
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

      function filterPlugins() {
        const categoryFilter = document.getElementById('category-filter').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value.toLowerCase();
        const searchInput = document.getElementById('search-input').value.toLowerCase();

        const pluginCards = document.querySelectorAll('.plugin-card');
        let visibleCount = 0;

        pluginCards.forEach(card => {
          // Get plugin data from card attributes
          const category = card.getAttribute('data-category')?.toLowerCase() || '';
          const status = card.getAttribute('data-status')?.toLowerCase() || '';
          const name = card.getAttribute('data-name')?.toLowerCase() || '';
          const description = card.getAttribute('data-description')?.toLowerCase() || '';

          // Check if plugin matches all filters
          let matches = true;

          // Category filter
          if (categoryFilter && category !== categoryFilter) {
            matches = false;
          }

          // Status filter
          if (statusFilter && status !== statusFilter) {
            matches = false;
          }

          // Search filter - check if search term is in name or description
          if (searchInput && !name.includes(searchInput) && !description.includes(searchInput)) {
            matches = false;
          }

          // Show/hide card
          if (matches) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // Show/hide "no results" message
        let noResultsMsg = document.getElementById('no-results-message');
        if (visibleCount === 0) {
          if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.className = 'col-span-full text-center py-12';
            noResultsMsg.innerHTML = \`
              <div class="flex flex-col items-center">
                <svg class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-2">No plugins found</h3>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your filters or search terms</p>
              </div>
            \`;
            document.getElementById('plugins-grid').appendChild(noResultsMsg);
          }
          noResultsMsg.style.display = '';
        } else if (noResultsMsg) {
          noResultsMsg.style.display = 'none';
        }
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

    <!-- Confirmation Dialogs -->
    ${renderConfirmationDialog({
      id: 'uninstall-plugin-confirm',
      title: 'Uninstall Plugin',
      message: 'Are you sure you want to uninstall this plugin? This action cannot be undone.',
      confirmText: 'Uninstall',
      cancelText: 'Cancel',
      iconColor: 'red',
      confirmClass: 'bg-red-500 hover:bg-red-400',
      onConfirm: 'performUninstallPlugin()'
    })}

    ${getConfirmationDialogScript()}
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Plugins',
    pageTitle: 'Plugin Management',
    currentPath: '/admin/plugins',
    user: data.user,
    version: data.version,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
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

  // Border colors based on status
  const borderColors = {
    active: 'ring-[3px] ring-lime-500 dark:ring-lime-400',
    inactive: 'ring-[3px] ring-pink-500 dark:ring-pink-400',
    error: 'ring-[3px] ring-red-500 dark:ring-red-400'
  }

  // Core system plugins that cannot be deactivated
  const criticalCorePlugins = ['core-auth', 'core-media']
  const canToggle = !criticalCorePlugins.includes(plugin.id)

  const actionButton = plugin.status === 'active'
    ? `<button onclick="togglePlugin('${plugin.id}', 'deactivate')" class="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Deactivate</button>`
    : `<button onclick="togglePlugin('${plugin.id}', 'activate')" class="bg-lime-600 dark:bg-lime-700 hover:bg-lime-700 dark:hover:bg-lime-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Activate</button>`

  return `
    <div class="plugin-card rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${borderColors[plugin.status]} p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all" data-category="${plugin.category}" data-status="${plugin.status}" data-name="${plugin.displayName}" data-description="${plugin.description}">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 bg-zinc-50 dark:bg-zinc-800">
            ${plugin.icon || getDefaultPluginIcon(plugin.category)}
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
          ${canToggle ? actionButton : ''}
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

function getDefaultPluginIcon(category: string): string {
  const iconColor = 'text-zinc-600 dark:text-zinc-400'

  const icons: Record<string, string> = {
    'content': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    `,
    'media': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    `,
    'seo': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    `,
    'analytics': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    `,
    'ecommerce': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    `,
    'email': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    `,
    'workflow': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    `,
    'security': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    `,
    'social': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    `,
    'utility': `
      <svg class="w-6 h-6 ${iconColor}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    `,
  }

  const iconKey = category.toLowerCase() as keyof typeof icons
  return icons[iconKey] || icons['utility'] || ''
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