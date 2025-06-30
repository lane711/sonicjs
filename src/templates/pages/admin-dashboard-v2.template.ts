import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface DashboardStats {
  collections: number
  contentItems: number
  mediaFiles: number
  users: number
  recentActivity?: ActivityItem[]
  analytics?: AnalyticsData
}

export interface ActivityItem {
  id: string
  type: 'content' | 'media' | 'user' | 'collection'
  action: string
  description: string
  timestamp: string
  user: string
}

export interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  contentPublished: number
  mediaUploaded: number
  weeklyGrowth: {
    pageViews: number
    visitors: number
    content: number
    media: number
  }
}

export interface DashboardPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  stats?: DashboardStats
}

export function renderDashboardPage(data: DashboardPageData): string {
  const pageContent = `
    

    <!-- Stats Cards -->
    <div 
      id="stats-container"
      hx-get="/admin/api/stats"
      hx-trigger="load"
      hx-swap="innerHTML"
    >
      ${renderStatsCardsSkeleton()}
    </div>

    <!-- Dashboard Grid -->
    <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <!-- Analytics Chart -->
      <div class="col-span-12 xl:col-span-8">
        ${renderAnalyticsChart()}
      </div>
      
      <!-- Recent Activity -->
      <div class="col-span-12 xl:col-span-4">
        ${renderRecentActivity()}
      </div>
    </div>

    <!-- Secondary Grid -->
    <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-7.5">
      <!-- Quick Actions -->
      <div class="col-span-12 xl:col-span-1">
        ${renderQuickActions()}
      </div>
      
      <!-- System Status -->
      <div class="col-span-12 xl:col-span-1">
        ${renderSystemStatus()}
      </div>
      
      <!-- Storage Usage -->
      <div class="col-span-12 xl:col-span-1">
        ${renderStorageUsage()}
      </div>
    </div>

    <script>
      function refreshDashboard() {
        htmx.trigger('#stats-container', 'htmx:load');
        showNotification('Dashboard refreshed', 'success');
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Dashboard',
    pageTitle: 'Dashboard',
    currentPath: '/admin',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

export function renderDashboardPageWithDynamicMenu(
  data: DashboardPageData,
  dynamicMenuItems: Array<{ label: string; path: string; icon: string }>
): string {
  const pageContent = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p class="text-gray-300">Welcome to your SonicJS AI admin dashboard</p>
    </div>

    <div id="stats-container" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8" hx-get="/admin/api/stats" hx-trigger="load">
      ${renderStatsCards({ collections: 0, contentItems: 0, mediaFiles: 0, users: 0 })}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <!-- Recent Activity -->
      <div class="xl:col-span-2">
        ${renderRecentActivity()}
      </div>
      
      <!-- Quick Actions -->
      <div class="xl:col-span-1">
        ${renderQuickActions()}
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <!-- Analytics Chart -->
      <div class="col-span-12 xl:col-span-4">
        ${renderAnalyticsChart()}
      </div>
      
      <!-- Storage Usage -->
      <div class="col-span-12 xl:col-span-1">
        ${renderStorageUsage()}
      </div>
    </div>

    <script>
      function refreshDashboard() {
        htmx.trigger('#stats-container', 'htmx:load');
        showNotification('Dashboard refreshed', 'success');
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Dashboard',
    pageTitle: 'Dashboard',
    currentPath: '/admin',
    user: data.user,
    content: pageContent,
    dynamicMenuItems
  }

  return renderAdminLayout(layoutData)
}

export function renderStatsCards(stats: DashboardStats): string {
  const cards = [
    {
      title: 'Total Collections',
      value: stats.collections.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>`,
      color: 'bg-gradient-to-br from-blue-400 to-purple-500'
    },
    {
      title: 'Content Items',
      value: stats.contentItems.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>`,
      color: 'bg-gradient-to-br from-green-400 to-teal-500'
    },
    {
      title: 'Media Files',
      value: stats.mediaFiles.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>`,
      color: 'bg-gradient-to-br from-orange-400 to-pink-500'
    },
    {
      title: 'Active Users',
      value: stats.users.toString(),
      icon: `<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>`,
      color: 'bg-gradient-to-br from-cyan-400 to-blue-600'
    }
  ]

  return `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      ${cards.map(card => `
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
      `).join('')}
    </div>
  `
}

function renderStatsCardsSkeleton(): string {
  return `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      ${Array(4).fill(0).map(() => `
        <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6 animate-pulse">
          <div class="flex items-center justify-between">
              <div>
                  <div class="h-4 w-24 bg-gray-6 rounded mb-2"></div>
                  <div class="h-8 w-16 bg-gray-6 rounded"></div>
              </div>
              <div class="w-12 h-12 bg-gray-6 rounded-lg"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderAnalyticsChart(): string {
  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      <div class="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div class="flex w-full flex-wrap gap-3 sm:gap-5">
          <div class="flex min-w-47.5">
            <span class="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span class="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div class="w-full">
              <p class="font-semibold text-primary">Content Created</p>
              <p class="text-sm font-medium text-gray-4">Last 7 days</p>
            </div>
          </div>
          <div class="flex min-w-47.5">
            <span class="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span class="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div class="w-full">
              <p class="font-semibold text-secondary">Media Uploaded</p>
              <p class="text-sm font-medium text-gray-4">Last 7 days</p>
            </div>
          </div>
        </div>
        <div class="flex w-full max-w-45 justify-end">
          <div class="inline-flex items-center rounded-md bg-gray-7 p-1.5">
            <button class="rounded bg-white/10 py-1 px-3 text-xs font-medium text-gray-300 shadow-card hover:bg-white/20">
              Day
            </button>
            <button class="py-1 px-3 text-xs font-medium text-gray-300 hover:bg-white/10">
              Week
            </button>
            <button class="py-1 px-3 text-xs font-medium text-gray-300 hover:bg-white/10">
              Month
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-8">
        <div id="chartOne" class="mx-auto flex justify-center">
          <!-- Chart placeholder -->
          <div class="flex h-60 w-full items-center justify-center bg-gray-7 rounded">
            <p class="text-gray-4">Analytics Chart (Chart.js integration needed)</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderRecentActivity(): string {
  const activities = [
    {
      type: 'content',
      action: 'created',
      description: 'New blog post published',
      user: 'John Doe',
      time: '2 minutes ago',
      icon: `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>`
    },
    {
      type: 'media',
      action: 'uploaded',
      description: 'Image uploaded to gallery',
      user: 'Jane Smith',
      time: '5 minutes ago',
      icon: `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>`
    },
    {
      type: 'user',
      action: 'registered',
      description: 'New user account created',
      user: 'System',
      time: '10 minutes ago',
      icon: `<svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>`
    }
  ]

  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl py-6 px-4 sm:px-6">
      <div class="mb-4 justify-between sm:flex">
        <div>
          <h4 class="text-xl font-semibold text-gray-1">Recent Activity</h4>
        </div>
        <div>
          <div class="relative z-20 inline-block">
            <select class="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none text-gray-300">
              <option value="" class="text-gray-8">Today</option>
              <option value="" class="text-gray-8">This Week</option>
              <option value="" class="text-gray-8">This Month</option>
            </select>
            <span class="absolute top-1/2 right-3 z-10 -translate-y-1/2">
              <svg class="w-4 h-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        ${activities.map(activity => `
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              ${activity.icon}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-1">${activity.description}</p>
              <p class="text-xs text-gray-4">${activity.user} • ${activity.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-6">
        <a href="/admin/activity" class="flex w-full items-center justify-center rounded bg-white/10 py-2 px-4 text-sm font-medium text-gray-300 hover:bg-white/20">
          View All Activity
        </a>
      </div>
    </div>
  `
}

function renderQuickActions(): string {
  const actions = [
    {
      title: 'Create Content',
      description: 'Add new blog post or page',
      href: '/admin/content/new',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>`,
      color: 'text-green-500 bg-green-500/10'
    },
    {
      title: 'Upload Media',
      description: 'Add images and files',
      href: '/admin/media',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>`,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Manage Users',
      description: 'Add or edit user accounts',
      href: '/admin/users',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>`,
      color: 'text-purple-500 bg-purple-500/10'
    }
  ]

  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      <h4 class="mb-6 text-xl font-semibold text-gray-1">Quick Actions</h4>
      
      <div class="space-y-3">
        ${actions.map(action => `
          <a href="${action.href}" class="block group">
            <div class="flex items-center gap-3 rounded-lg bg-white/10 p-3 hover:bg-white/20 transition-colors">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg ${action.color}">
                ${action.icon}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-1 group-hover:text-white">${action.title}</p>
                <p class="text-xs text-gray-4">${action.description}</p>
              </div>
              <svg class="w-4 h-4 text-gray-4 group-hover:text-gray-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `
}

function renderSystemStatus(): string {
  const statusItems = [
    { label: 'Database', status: 'online', color: 'text-success' },
    { label: 'File Storage', status: 'online', color: 'text-success' },
    { label: 'CDN', status: 'online', color: 'text-success' },
    { label: 'Email Service', status: 'maintenance', color: 'text-warning' }
  ]

  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      <h4 class="mb-6 text-xl font-semibold text-gray-1">System Status</h4>
      
      <div class="space-y-4">
        ${statusItems.map(item => `
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-3">${item.label}</span>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full ${item.color.replace('text-', 'bg-')}"></div>
              <span class="text-sm ${item.color} capitalize">${item.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-6">
        <button class="flex w-full items-center justify-center rounded bg-white/10 py-2 px-4 text-sm font-medium text-gray-300 hover:bg-white/20">
          View Details
        </button>
      </div>
    </div>
  `
}

function renderStorageUsage(): string {
  return `
    <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl p-6">
      <h4 class="mb-6 text-xl font-semibold text-gray-1">Storage Usage</h4>
      
      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Database</span>
            <span class="text-sm text-gray-1">2.3 GB / 10 GB</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full" style="width: 23%"></div>
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Media Files</span>
            <span class="text-sm text-gray-1">4.7 GB / 20 GB</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2">
            <div class="bg-success h-2 rounded-full" style="width: 23.5%"></div>
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Backup</span>
            <span class="text-sm text-gray-1">1.2 GB / 5 GB</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2">
            <div class="bg-warning h-2 rounded-full" style="width: 24%"></div>
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <button class="flex w-full items-center justify-center rounded bg-white/10 py-2 px-4 text-sm font-medium text-gray-300 hover:bg-white/20">
          Manage Storage
        </button>
      </div>
    </div>
  `
}