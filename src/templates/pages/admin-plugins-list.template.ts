import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

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
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">Plugins</h1>
          <p class="mt-2 text-sm text-gray-300">Manage and extend functionality with plugins</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Install Plugin
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        ${renderPluginStatsCards(data.stats)}
      </div>

      <!-- Filters -->
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full">
              <option value="">All Categories</option>
              <option value="content">Content Management</option>
              <option value="media">Media</option>
              <option value="seo">SEO & Analytics</option>
              <option value="security">Security</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input type="text" placeholder="Search plugins..." 
                   class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors w-full">
          </div>
          <div class="flex items-end">
            <button class="inline-flex items-center px-3 py-2 backdrop-blur-sm bg-white/10 text-white text-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all w-full justify-center">
              Refresh
            </button>
          </div>
        </div>
      </div>

    <!-- Plugins Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      ${data.plugins.map(plugin => renderPluginCard(plugin)).join('')}
    </div>

    <script>
      function togglePlugin(pluginId, action) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = action === 'activate' ? 'Activating...' : 'Deactivating...';
        
        // Simulate API call
        setTimeout(() => {
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
          
          button.disabled = false;
          showNotification(\`Plugin \${action}d successfully\`, 'success');
        }, 1000);
      }
      
      function showNotification(message, type) {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = \`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 \${type === 'success' ? 'bg-green-600' : 'bg-red-600'}\`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Plugins',
    pageTitle: 'Plugin Management',
    currentPath: '/admin/plugins',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
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
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-300 text-sm">${card.title}</p>
                <p class="text-white text-2xl font-bold">${card.value}</p>
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
    active: 'bg-green-900/50 text-green-300 border-green-600/30',
    inactive: 'bg-gray-800/50 text-gray-400 border-gray-600/30',
    error: 'bg-red-900/50 text-red-300 border-red-600/30'
  }

  const statusIcons = {
    active: '<div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>',
    inactive: '<div class="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>',
    error: '<div class="w-2 h-2 bg-red-400 rounded-full mr-2"></div>'
  }

  const actionButton = plugin.status === 'active' 
    ? `<button onclick="togglePlugin('${plugin.id}', 'deactivate')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">Deactivate</button>`
    : `<button onclick="togglePlugin('${plugin.id}', 'activate')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">Activate</button>`

  return `
    <div class="plugin-card backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6 hover:bg-black/30 transition-colors">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
            ${plugin.icon || plugin.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">${plugin.displayName}</h3>
            <p class="text-sm text-gray-400">v${plugin.version} by ${plugin.author}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <span class="status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[plugin.status]} border">
            ${statusIcons[plugin.status]}${plugin.status.charAt(0).toUpperCase() + plugin.status.slice(1)}
          </span>
          ${plugin.isCore ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-600/30">Core</span>' : ''}
        </div>
      </div>
      
      <p class="text-gray-300 text-sm mb-4 line-clamp-3">${plugin.description}</p>
      
      <div class="flex items-center gap-4 mb-4 text-xs text-gray-400">
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
          <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${plugin.rating}
        </span>
        ` : ''}
        
        <span>${plugin.lastUpdated}</span>
      </div>
      
      ${plugin.dependencies && plugin.dependencies.length > 0 ? `
      <div class="mb-4">
        <p class="text-xs text-gray-400 mb-2">Dependencies:</p>
        <div class="flex flex-wrap gap-1">
          ${plugin.dependencies.map(dep => `<span class="inline-block bg-white/10 text-gray-300 text-xs px-2 py-1 rounded">${dep}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="flex items-center justify-between">
        <div class="flex gap-2">
          ${!plugin.isCore ? actionButton : ''}
          <button class="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1.5 rounded text-sm font-medium transition-colors">
            Settings
          </button>
        </div>
        
        <div class="flex items-center gap-2">
          <button class="text-gray-400 hover:text-gray-300 p-1.5 rounded hover:bg-white/10 transition-colors" title="Plugin Details">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          
          ${!plugin.isCore ? `
          <button class="text-gray-400 hover:text-red-400 p-1.5 rounded hover:bg-white/10 transition-colors" title="Uninstall Plugin">
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
      icon: '🚀',
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
      icon: '📸',
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
      icon: '💾',
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
      icon: '🛡️',
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
      icon: '📱',
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
      icon: '📊',
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
      icon: '📝',
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
      icon: '⚡',
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
      icon: '🌍',
      downloadCount: 7650,
      rating: 4.5,
      lastUpdated: '2 weeks ago',
      dependencies: ['translation-api'],
      permissions: ['read:content', 'write:translations', 'manage:languages']
    }
  ]
}