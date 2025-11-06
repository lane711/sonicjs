import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderAuthSettingsForm } from '../components/auth-settings-form.template'
import type { AuthSettings } from '../../services/auth-validation'

export interface PluginSettings {
  [key: string]: any
}

export interface PluginActivity {
  id: string
  action: string
  message: string
  timestamp: number
  user?: string
}

export interface PluginSettingsPageData {
  plugin: {
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
    settings?: PluginSettings
  }
  activity?: PluginActivity[]
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderPluginSettingsPage(data: PluginSettingsPageData): string {
  const { plugin, activity = [], user } = data
  
  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header with Back Button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Plugin Settings</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            ${plugin.description}
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/plugins" class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Plugins
          </a>
        </div>
      </div>

      <!-- Plugin Header -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              ${plugin.icon || plugin.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="text-2xl font-semibold text-white mb-1">${plugin.displayName}</h2>
              <div class="flex items-center gap-4 text-sm text-gray-400 mt-2">
                <span>v${plugin.version}</span>
                <span>by ${plugin.author}</span>
                <span>${plugin.category}</span>
                ${plugin.downloadCount ? `<span>${plugin.downloadCount.toLocaleString()} downloads</span>` : ''}
                ${plugin.rating ? `<span>★ ${plugin.rating}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            ${renderStatusBadge(plugin.status)}
            ${renderToggleButton(plugin)}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button onclick="showTab('settings')" id="settings-tab" class="tab-button active border-b-2 border-blue-400 py-2 px-1 text-sm font-medium text-blue-400">
            Settings
          </button>
          <button onclick="showTab('activity')" id="activity-tab" class="tab-button border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-400 hover:text-gray-300">
            Activity Log
          </button>
          <button onclick="showTab('info')" id="info-tab" class="tab-button border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-400 hover:text-gray-300">
            Information
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div id="tab-content">
        <!-- Settings Tab -->
        <div id="settings-content" class="tab-content">
          ${renderSettingsTab(plugin)}
        </div>

        <!-- Activity Tab -->
        <div id="activity-content" class="tab-content hidden">
          ${renderActivityTab(activity)}
        </div>

        <!-- Information Tab -->
        <div id="info-content" class="tab-content hidden">
          ${renderInformationTab(plugin)}
        </div>
      </div>
    </div>

    <script>
      function showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(tab => {
          tab.classList.remove('active', 'border-blue-400', 'text-blue-400');
          tab.classList.add('border-transparent', 'text-gray-400');
        });
        
        // Show selected tab content
        document.getElementById(tabName + '-content').classList.remove('hidden');
        
        // Add active class to selected tab
        const activeTab = document.getElementById(tabName + '-tab');
        activeTab.classList.add('active', 'border-blue-400', 'text-blue-400');
        activeTab.classList.remove('border-transparent', 'text-gray-400');
      }

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
            showNotification(\`Plugin \${action}d successfully\`, 'success');
            setTimeout(() => location.reload(), 1000);
          } else {
            throw new Error(result.error || \`Failed to \${action} plugin\`);
          }
        } catch (error) {
          showNotification(error.message, 'error');
          button.textContent = originalText;
          button.disabled = false;
        }
      }

      async function saveSettings() {
        const form = document.getElementById('settings-form');
        const formData = new FormData(form);
        const isAuthPlugin = '${plugin.id}' === 'core-auth';
        let settings = {};

        if (isAuthPlugin) {
          // Handle nested auth settings structure
          settings = {
            requiredFields: {},
            validation: {
              passwordRequirements: {}
            },
            registration: {}
          };

          for (let [key, value] of formData.entries()) {
            const input = form.querySelector(\`[name="\${key}"]\`);
            const fieldValue = input.type === 'checkbox' ? input.checked :
                             input.type === 'number' ? parseInt(value) || 0 : value;

            // Parse nested field names like "requiredFields_email_required"
            if (key.startsWith('requiredFields_')) {
              const parts = key.replace('requiredFields_', '').split('_');
              const fieldName = parts[0];
              const propName = parts[1];

              if (!settings.requiredFields[fieldName]) {
                settings.requiredFields[fieldName] = { type: 'text', label: '' };
              }
              settings.requiredFields[fieldName][propName] = fieldValue;
            } else if (key.startsWith('validation_passwordRequirements_')) {
              const propName = key.replace('validation_passwordRequirements_', '');
              settings.validation.passwordRequirements[propName] = fieldValue;
            } else if (key.startsWith('validation_')) {
              const propName = key.replace('validation_', '');
              // Invert the allowDuplicateUsernames logic
              if (propName === 'allowDuplicateUsernames') {
                settings.validation[propName] = !fieldValue;
              } else {
                settings.validation[propName] = fieldValue;
              }
            } else if (key.startsWith('registration_')) {
              const propName = key.replace('registration_', '');
              settings.registration[propName] = fieldValue;
            }
          }
        } else {
          // Handle regular plugin settings
          for (let [key, value] of formData.entries()) {
            if (key.startsWith('setting_')) {
              const settingKey = key.replace('setting_', '');

              const input = form.querySelector(\`[name="\${key}"]\`);
              if (input.type === 'checkbox') {
                settings[settingKey] = input.checked;
              } else if (input.type === 'number') {
                settings[settingKey] = parseInt(value) || 0;
              } else {
                settings[settingKey] = value;
              }
            }
          }
        }

        const saveButton = document.getElementById('save-button');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
          const response = await fetch(\`/admin/plugins/${plugin.id}/settings\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
          });

          const result = await response.json();

          if (result.success) {
            showNotification('Settings saved successfully', 'success');
            // Reload page after 1 second to show updated settings
            setTimeout(() => location.reload(), 1000);
          } else {
            throw new Error(result.error || 'Failed to save settings');
          }
        } catch (error) {
          showNotification(error.message, 'error');
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = 'Save Settings';
        }
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
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: `${plugin.displayName} Settings`,
    pageTitle: `${plugin.displayName} Settings`,
    currentPath: `/admin/plugins/${plugin.id}`,
    user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function renderStatusBadge(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-900/50 text-green-300 border-green-600/30',
    inactive: 'bg-gray-800/50 text-gray-400 border-gray-600/30',
    error: 'bg-red-900/50 text-red-300 border-red-600/30'
  }

  const statusIcons: Record<string, string> = {
    active: '<div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>',
    inactive: '<div class="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>',
    error: '<div class="w-2 h-2 bg-red-400 rounded-full mr-2"></div>'
  }

  return `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.inactive} border">
      ${statusIcons[status] || statusIcons.inactive}${status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  `
}

function renderToggleButton(plugin: any): string {
  if (plugin.isCore) {
    return '<span class="text-sm text-gray-400">Core Plugin</span>'
  }

  return plugin.status === 'active' 
    ? `<button onclick="togglePlugin('${plugin.id}', 'deactivate')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Deactivate</button>`
    : `<button onclick="togglePlugin('${plugin.id}', 'activate')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Activate</button>`
}

function renderSettingsTab(plugin: any): string {
  const settings = plugin.settings || {}
  const isSeedDataPlugin = plugin.id === 'seed-data' || plugin.name === 'seed-data'
  const isAuthPlugin = plugin.id === 'core-auth' || plugin.name === 'core-auth'

  return `
    ${isSeedDataPlugin ? `
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white mb-2">Seed Data Generator</h2>
            <p class="text-gray-400">Generate realistic example data for testing and development.</p>
          </div>
          <a
            href="/admin/seed-data"
            target="_blank"
            class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Open Seed Data Tool
          </a>
        </div>
      </div>
    ` : ''}

    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      ${isAuthPlugin ? `
        <h2 class="text-xl font-semibold text-white mb-4">Authentication Settings</h2>
        <p class="text-gray-400 mb-6">Configure user registration fields and validation rules.</p>
      ` : `
        <h2 class="text-xl font-semibold text-white mb-4">Plugin Settings</h2>
      `}

      <form id="settings-form" class="space-y-6">
        ${isAuthPlugin && Object.keys(settings).length > 0
          ? renderAuthSettingsForm(settings as AuthSettings)
          : Object.keys(settings).length > 0
            ? renderSettingsFields(settings)
            : renderNoSettings(plugin)
        }

        ${Object.keys(settings).length > 0 ? `
        <div class="flex items-center justify-end pt-6 border-t border-white/10">
          <button
            type="button"
            id="save-button"
            onclick="saveSettings()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
        ` : ''}
      </form>
    </div>
  `
}

function renderSettingsFields(settings: PluginSettings): string {
  return Object.entries(settings).map(([key, value]) => {
    const fieldId = `setting_${key}`
    const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    
    if (typeof value === 'boolean') {
      return `
        <div class="flex items-center justify-between">
          <div>
            <label for="${fieldId}" class="text-sm font-medium text-gray-300">${displayName}</label>
            <p class="text-xs text-gray-400">Enable or disable this feature</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="${fieldId}" id="${fieldId}" ${value ? 'checked' : ''} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      `
    } else if (typeof value === 'number') {
      return `
        <div>
          <label for="${fieldId}" class="block text-sm font-medium text-gray-300 mb-2">${displayName}</label>
          <input 
            type="number" 
            name="${fieldId}" 
            id="${fieldId}" 
            value="${value}"
            class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
          >
        </div>
      `
    } else {
      return `
        <div>
          <label for="${fieldId}" class="block text-sm font-medium text-gray-300 mb-2">${displayName}</label>
          <input 
            type="text" 
            name="${fieldId}" 
            id="${fieldId}" 
            value="${value}"
            class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full"
          >
        </div>
      `
    }
  }).join('')
}

function renderNoSettings(plugin: any): string {
  // Special handling for seed-data plugin
  if (plugin.id === 'seed-data' || plugin.name === 'seed-data') {
    return `
      <div class="text-center py-8">
        <svg class="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-300 mb-2">Seed Data Generator</h3>
        <p class="text-gray-400 mb-6">Generate realistic example data for testing and development.</p>
        <a
          href="/admin/seed-data"
          class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Generate Seed Data
        </a>
      </div>
    `
  }

  return `
    <div class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-300 mb-2">No Settings Available</h3>
      <p class="text-gray-400">This plugin doesn't have any configurable settings.</p>
    </div>
  `
}

function renderActivityTab(activity: PluginActivity[]): string {
  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      <h2 class="text-xl font-semibold text-white mb-4">Activity Log</h2>
      
      ${activity.length > 0 ? `
        <div class="space-y-4">
          ${activity.map(item => `
            <div class="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-white">${item.action}</span>
                  <span class="text-xs text-gray-400">${formatTimestamp(item.timestamp)}</span>
                </div>
                <p class="text-sm text-gray-300 mt-1">${item.message}</p>
                ${item.user ? `<p class="text-xs text-gray-400 mt-1">by ${item.user}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-300 mb-2">No Activity</h3>
          <p class="text-gray-400">No recent activity for this plugin.</p>
        </div>
      `}
    </div>
  `
}

function renderInformationTab(plugin: any): string {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Plugin Details -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Plugin Details</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-400">Name:</span>
            <span class="text-white">${plugin.displayName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Version:</span>
            <span class="text-white">${plugin.version}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Author:</span>
            <span class="text-white">${plugin.author}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Category:</span>
            <span class="text-white">${plugin.category}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Status:</span>
            <span class="text-white">${plugin.status}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Last Updated:</span>
            <span class="text-white">${plugin.lastUpdated}</span>
          </div>
        </div>
      </div>

      <!-- Dependencies & Permissions -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Dependencies & Permissions</h2>
        
        ${plugin.dependencies && plugin.dependencies.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-300 mb-2">Dependencies:</h3>
            <div class="space-y-1">
              ${plugin.dependencies.map((dep: string) => `
                <div class="inline-block bg-white/10 text-gray-300 text-sm px-2 py-1 rounded mr-2">${dep}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${plugin.permissions && plugin.permissions.length > 0 ? `
          <div>
            <h3 class="text-sm font-medium text-gray-300 mb-2">Permissions:</h3>
            <div class="space-y-1">
              ${plugin.permissions.map((perm: string) => `
                <div class="inline-block bg-white/10 text-gray-300 text-sm px-2 py-1 rounded mr-2">${perm}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${(!plugin.dependencies || plugin.dependencies.length === 0) && (!plugin.permissions || plugin.permissions.length === 0) ? `
          <p class="text-gray-400">No dependencies or special permissions required.</p>
        ` : ''}
      </div>
    </div>
  `
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}