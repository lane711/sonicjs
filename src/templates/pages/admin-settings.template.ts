import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface SettingsPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  settings?: {
    general?: GeneralSettings
    appearance?: AppearanceSettings
    security?: SecuritySettings
    notifications?: NotificationSettings
    storage?: StorageSettings
  }
  activeTab?: string
}

export interface GeneralSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  timezone: string
  language: string
  maintenanceMode: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  logoUrl: string
  favicon: string
  customCSS: string
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordRequirements: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
  ipWhitelist: string[]
}

export interface NotificationSettings {
  emailNotifications: boolean
  contentUpdates: boolean
  systemAlerts: boolean
  userRegistrations: boolean
  emailFrequency: 'immediate' | 'daily' | 'weekly'
}

export interface StorageSettings {
  maxFileSize: number
  allowedFileTypes: string[]
  storageProvider: 'local' | 'cloudflare' | 's3'
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  retentionPeriod: number
}

export function renderSettingsPage(data: SettingsPageData): string {
  const activeTab = data.activeTab || 'general'
  
  const pageContent = `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">Settings</h1>
            <p class="text-gray-300 mt-1">Manage your application settings and preferences</p>
          </div>
          <div class="flex space-x-3">
            <button 
              onclick="resetSettings()" 
              class="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              Reset to Defaults
            </button>
            <button 
              onclick="saveAllSettings()" 
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Navigation Tabs -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden">
        <nav class="flex space-x-0" role="tablist">
          ${renderTabButton('general', 'General', 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', activeTab)}
          ${renderTabButton('appearance', 'Appearance', 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z', activeTab)}
          ${renderTabButton('security', 'Security', 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', activeTab)}
          ${renderTabButton('notifications', 'Notifications', 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', activeTab)}
          ${renderTabButton('storage', 'Storage', 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', activeTab)}
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden">
        <div id="settings-content" class="p-6">
          ${renderTabContent(activeTab, data.settings)}
        </div>
      </div>
    </div>

    <script>
      let currentTab = '${activeTab}';
      
      function switchTab(tab) {
        if (currentTab === tab) return;
        
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(btn => {
          btn.classList.remove('bg-white/20', 'text-white', 'border-white/20');
          btn.classList.add('text-gray-300', 'hover:bg-white/10');
        });
        
        document.querySelector(\`[data-tab="\${tab}"]\`).classList.remove('text-gray-300', 'hover:bg-white/10');
        document.querySelector(\`[data-tab="\${tab}"]\`).classList.add('bg-white/20', 'text-white', 'border-white/20');
        
        // Load tab content
        const content = document.getElementById('settings-content');
        content.innerHTML = '<div class="flex items-center justify-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
        
        // Simulate loading (replace with actual HTMX call)
        setTimeout(() => {
          content.innerHTML = getTabContent(tab);
          currentTab = tab;
        }, 300);
      }
      
      function getTabContent(tab) {
        switch(tab) {
          case 'general':
            return \`${renderGeneralSettings(data.settings?.general).replace(/`/g, '\\`')}\`;
          case 'appearance':
            return \`${renderAppearanceSettings(data.settings?.appearance).replace(/`/g, '\\`')}\`;
          case 'security':
            return \`${renderSecuritySettings(data.settings?.security).replace(/`/g, '\\`')}\`;
          case 'notifications':
            return \`${renderNotificationSettings(data.settings?.notifications).replace(/`/g, '\\`')}\`;
          case 'storage':
            return \`${renderStorageSettings(data.settings?.storage).replace(/`/g, '\\`')}\`;
          default:
            return '<p class="text-gray-300">Content not found</p>';
        }
      }
      
      function saveAllSettings() {
        // Collect all form data
        const formData = new FormData();
        
        // Get all form inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
          if (input.type === 'checkbox') {
            formData.append(input.name, input.checked);
          } else if (input.name) {
            formData.append(input.name, input.value);
          }
        });
        
        // Show loading state
        const saveBtn = document.querySelector('button[onclick="saveAllSettings()"]');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = 'Saving...';
        saveBtn.disabled = true;
        
        // Simulate save (replace with actual API call)
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.disabled = false;
          showNotification('Settings saved successfully!', 'success');
        }, 1000);
      }
      
      function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
          showNotification('Settings reset to defaults', 'info');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Settings',
    pageTitle: 'Settings',
    currentPath: '/admin/settings',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function renderTabButton(tabId: string, label: string, iconPath: string, activeTab: string): string {
  const isActive = activeTab === tabId
  const baseClasses = 'flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b border-white/10'
  const activeClasses = isActive ? 'bg-white/20 text-white border-white/20' : 'text-gray-300 hover:bg-white/10'
  
  return `
    <button 
      onclick="switchTab('${tabId}')" 
      data-tab="${tabId}"
      class="${baseClasses} ${activeClasses}"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
      </svg>
      <span>${label}</span>
    </button>
  `
}

function renderTabContent(activeTab: string, settings?: SettingsPageData['settings']): string {
  switch (activeTab) {
    case 'general':
      return renderGeneralSettings(settings?.general)
    case 'appearance':
      return renderAppearanceSettings(settings?.appearance)
    case 'security':
      return renderSecuritySettings(settings?.security)
    case 'notifications':
      return renderNotificationSettings(settings?.notifications)
    case 'storage':
      return renderStorageSettings(settings?.storage)
    default:
      return renderGeneralSettings(settings?.general)
  }
}

function renderGeneralSettings(settings?: GeneralSettings): string {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">General Settings</h3>
        <p class="text-gray-300 mb-6">Configure basic application settings and preferences.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
            <input 
              type="text" 
              name="siteName"
              value="${settings?.siteName || 'SonicJS AI'}"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter site name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
            <input 
              type="email" 
              name="adminEmail"
              value="${settings?.adminEmail || 'admin@example.com'}"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
            <select 
              name="timezone"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC" ${settings?.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
              <option value="America/New_York" ${settings?.timezone === 'America/New_York' ? 'selected' : ''}>Eastern Time</option>
              <option value="America/Chicago" ${settings?.timezone === 'America/Chicago' ? 'selected' : ''}>Central Time</option>
              <option value="America/Denver" ${settings?.timezone === 'America/Denver' ? 'selected' : ''}>Mountain Time</option>
              <option value="America/Los_Angeles" ${settings?.timezone === 'America/Los_Angeles' ? 'selected' : ''}>Pacific Time</option>
            </select>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Site Description</label>
            <textarea 
              name="siteDescription"
              rows="3"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your site..."
            >${settings?.siteDescription || ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select 
              name="language"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en" ${settings?.language === 'en' ? 'selected' : ''}>English</option>
              <option value="es" ${settings?.language === 'es' ? 'selected' : ''}>Spanish</option>
              <option value="fr" ${settings?.language === 'fr' ? 'selected' : ''}>French</option>
              <option value="de" ${settings?.language === 'de' ? 'selected' : ''}>German</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="maintenanceMode"
              name="maintenanceMode"
              ${settings?.maintenanceMode ? 'checked' : ''}
              class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label for="maintenanceMode" class="text-sm text-gray-300">
              Enable maintenance mode
            </label>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderAppearanceSettings(settings?: AppearanceSettings): string {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
        <p class="text-gray-300 mb-6">Customize the look and feel of your application.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Theme</label>
            <div class="grid grid-cols-3 gap-3">
              <label class="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  value="light"
                  ${settings?.theme === 'light' ? 'checked' : ''}
                  class="text-blue-600"
                />
                <span class="text-sm text-gray-300">Light</span>
              </label>
              <label class="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark"
                  ${settings?.theme === 'dark' || !settings?.theme ? 'checked' : ''}
                  class="text-blue-600"
                />
                <span class="text-sm text-gray-300">Dark</span>
              </label>
              <label class="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  value="auto"
                  ${settings?.theme === 'auto' ? 'checked' : ''}
                  class="text-blue-600"
                />
                <span class="text-sm text-gray-300">Auto</span>
              </label>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
            <div class="flex items-center space-x-3">
              <input 
                type="color" 
                name="primaryColor"
                value="${settings?.primaryColor || '#465FFF'}"
                class="w-12 h-10 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
              />
              <input 
                type="text" 
                value="${settings?.primaryColor || '#465FFF'}"
                class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#465FFF"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
            <input 
              type="url" 
              name="logoUrl"
              value="${settings?.logoUrl || ''}"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
            <input 
              type="url" 
              name="favicon"
              value="${settings?.favicon || ''}"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/favicon.ico"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Custom CSS</label>
            <textarea 
              name="customCSS"
              rows="6"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="/* Add your custom CSS here */"
            >${settings?.customCSS || ''}</textarea>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderSecuritySettings(settings?: SecuritySettings): string {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Security Settings</h3>
        <p class="text-gray-300 mb-6">Configure security and authentication settings.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="twoFactorEnabled"
              name="twoFactorEnabled"
              ${settings?.twoFactorEnabled ? 'checked' : ''}
              class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label for="twoFactorEnabled" class="text-sm text-gray-300">
              Enable Two-Factor Authentication
            </label>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
            <input 
              type="number" 
              name="sessionTimeout"
              value="${settings?.sessionTimeout || 30}"
              min="5"
              max="1440"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Password Requirements</label>
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="requireUppercase"
                  name="requireUppercase"
                  ${settings?.passwordRequirements?.requireUppercase ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="requireUppercase" class="text-sm text-gray-300">Require uppercase letters</label>
              </div>
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="requireNumbers"
                  name="requireNumbers"
                  ${settings?.passwordRequirements?.requireNumbers ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="requireNumbers" class="text-sm text-gray-300">Require numbers</label>
              </div>
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="requireSymbols"
                  name="requireSymbols"
                  ${settings?.passwordRequirements?.requireSymbols ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="requireSymbols" class="text-sm text-gray-300">Require symbols</label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Minimum Password Length</label>
            <input 
              type="number" 
              name="minPasswordLength"
              value="${settings?.passwordRequirements?.minLength || 8}"
              min="6"
              max="128"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">IP Whitelist</label>
            <textarea 
              name="ipWhitelist"
              rows="4"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter IP addresses (one per line)&#10;192.168.1.1&#10;10.0.0.1"
            >${settings?.ipWhitelist?.join('\n') || ''}</textarea>
            <p class="text-xs text-gray-400 mt-1">Leave empty to allow all IPs</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderNotificationSettings(settings?: NotificationSettings): string {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Notification Settings</h3>
        <p class="text-gray-300 mb-6">Configure how and when you receive notifications.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <h4 class="text-md font-medium text-white mb-3">Email Notifications</h4>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="emailNotifications"
                  name="emailNotifications"
                  ${settings?.emailNotifications ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="emailNotifications" class="text-sm text-gray-300">Enable email notifications</label>
              </div>
              
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="contentUpdates"
                  name="contentUpdates"
                  ${settings?.contentUpdates ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="contentUpdates" class="text-sm text-gray-300">Content updates</label>
              </div>
              
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="systemAlerts"
                  name="systemAlerts"
                  ${settings?.systemAlerts ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="systemAlerts" class="text-sm text-gray-300">System alerts</label>
              </div>
              
              <div class="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="userRegistrations"
                  name="userRegistrations"
                  ${settings?.userRegistrations ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label for="userRegistrations" class="text-sm text-gray-300">New user registrations</label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email Frequency</label>
            <select 
              name="emailFrequency"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate" ${settings?.emailFrequency === 'immediate' ? 'selected' : ''}>Immediate</option>
              <option value="daily" ${settings?.emailFrequency === 'daily' ? 'selected' : ''}>Daily Digest</option>
              <option value="weekly" ${settings?.emailFrequency === 'weekly' ? 'selected' : ''}>Weekly Digest</option>
            </select>
          </div>
          
          <div class="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h5 class="text-sm font-medium text-blue-300">Notification Preferences</h5>
                <p class="text-xs text-blue-200 mt-1">
                  Critical system alerts will always be sent immediately regardless of your frequency setting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderStorageSettings(settings?: StorageSettings): string {
  return `
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">Storage Settings</h3>
        <p class="text-gray-300 mb-6">Configure file storage and backup settings.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Max File Size (MB)</label>
            <input 
              type="number" 
              name="maxFileSize"
              value="${settings?.maxFileSize || 10}"
              min="1"
              max="100"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Storage Provider</label>
            <select 
              name="storageProvider"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="local" ${settings?.storageProvider === 'local' ? 'selected' : ''}>Local Storage</option>
              <option value="cloudflare" ${settings?.storageProvider === 'cloudflare' ? 'selected' : ''}>Cloudflare R2</option>
              <option value="s3" ${settings?.storageProvider === 's3' ? 'selected' : ''}>Amazon S3</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
            <select 
              name="backupFrequency"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily" ${settings?.backupFrequency === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${settings?.backupFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${settings?.backupFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Allowed File Types</label>
            <textarea 
              name="allowedFileTypes"
              rows="3"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jpg, jpeg, png, gif, pdf, docx"
            >${settings?.allowedFileTypes?.join(', ') || 'jpg, jpeg, png, gif, pdf, docx'}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Backup Retention (days)</label>
            <input 
              type="number" 
              name="retentionPeriod"
              value="${settings?.retentionPeriod || 30}"
              min="7"
              max="365"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h5 class="text-sm font-medium text-green-300">Storage Status</h5>
                <p class="text-xs text-green-200 mt-1">
                  Current usage: 2.4 GB / 10 GB available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}