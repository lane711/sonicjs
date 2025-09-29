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
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white mb-2">Dashboard</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Welcome to your SonicJS AI admin dashboard</p>
    </div>

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
    <div class="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Analytics Chart -->
      <div class="xl:col-span-2">
        ${renderAnalyticsChart()}
      </div>

      <!-- Recent Activity -->
      <div class="xl:col-span-1">
        ${renderRecentActivity()}
      </div>
    </div>

    <!-- Secondary Grid -->
    <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- Quick Actions -->
      ${renderQuickActions()}

      <!-- System Status -->
      ${renderSystemStatus()}

      <!-- Storage Usage -->
      ${renderStorageUsage()}
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
      <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white mb-2">Dashboard</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Welcome to your SonicJS AI admin dashboard</p>
    </div>

    <div id="stats-container" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8" hx-get="/admin/api/stats" hx-trigger="load">
      ${renderStatsCards({ collections: 0, contentItems: 0, mediaFiles: 0, users: 0 })}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <!-- Analytics Chart -->
      <div class="xl:col-span-2">
        ${renderAnalyticsChart()}
      </div>

      <!-- Recent Activity -->
      <div class="xl:col-span-1">
        ${renderRecentActivity()}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      ${renderQuickActions()}

      <!-- System Status -->
      ${renderSystemStatus()}

      <!-- Storage Usage -->
      ${renderStorageUsage()}
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
      icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>`,
      iconBg: 'bg-blue-500 dark:bg-blue-400',
      iconColor: 'text-white dark:text-blue-950'
    },
    {
      title: 'Content Items',
      value: stats.contentItems.toString(),
      icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
          </svg>`,
      iconBg: 'bg-green-500 dark:bg-green-400',
      iconColor: 'text-white dark:text-green-950'
    },
    {
      title: 'Media Files',
      value: stats.mediaFiles.toString(),
      icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
          </svg>`,
      iconBg: 'bg-amber-500 dark:bg-amber-400',
      iconColor: 'text-white dark:text-amber-950'
    },
    {
      title: 'Active Users',
      value: stats.users.toString(),
      icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>`,
      iconBg: 'bg-purple-500 dark:bg-purple-400',
      iconColor: 'text-white dark:text-purple-950'
    }
  ]

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      ${cards.map(card => `
        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">${card.title}</p>
                    <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">${card.value}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}">
                    <div class="${card.iconColor}">${card.icon}</div>
                </div>
            </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderStatsCardsSkeleton(): string {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      ${Array(4).fill(0).map(() => `
        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 animate-pulse">
          <div class="flex items-center justify-between">
              <div>
                  <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-3"></div>
                  <div class="h-8 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
              <div class="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderAnalyticsChart(): string {
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <div class="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-6">
        <div>
          <h3 class="text-base font-semibold text-zinc-950 dark:text-white">Analytics Overview</h3>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Last 7 days activity</p>
        </div>
        <div class="inline-flex items-center rounded-lg bg-zinc-50 dark:bg-zinc-800 p-1 ring-1 ring-zinc-950/5 dark:ring-white/10">
          <button class="rounded-md bg-white dark:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-950 dark:text-white shadow-sm">
            Day
          </button>
          <button class="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
            Week
          </button>
          <button class="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
            Month
          </button>
        </div>
      </div>

      <div class="mt-6">
        <div id="chartOne" class="flex h-60 w-full items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/10">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Analytics Chart (Chart.js integration needed)</p>
        </div>
      </div>
    </div>
  `
}

function renderRecentActivity(): string {
  const activities = [
    {
      type: 'content',
      description: 'New blog post published',
      user: 'John Doe',
      time: '2 minutes ago',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>`,
      iconBg: 'bg-green-500/10 dark:bg-green-400/10',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      type: 'media',
      description: 'Image uploaded to gallery',
      user: 'Jane Smith',
      time: '5 minutes ago',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>`,
      iconBg: 'bg-blue-500/10 dark:bg-blue-400/10',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'user',
      description: 'New user account created',
      user: 'System',
      time: '10 minutes ago',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>`,
      iconBg: 'bg-purple-500/10 dark:bg-purple-400/10',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-base font-semibold text-zinc-950 dark:text-white">Recent Activity</h3>
        <select class="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div class="space-y-4">
        ${activities.map(activity => `
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${activity.iconBg}">
              <div class="${activity.iconColor}">${activity.icon}</div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-950 dark:text-white">${activity.description}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">${activity.user} • ${activity.time}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="mt-6">
        <a href="/admin/activity" class="flex w-full items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
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
      iconBg: 'bg-green-500/10 dark:bg-green-400/10',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Upload Media',
      description: 'Add images and files',
      href: '/admin/media',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>`,
      iconBg: 'bg-blue-500/10 dark:bg-blue-400/10',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Manage Users',
      description: 'Add or edit user accounts',
      href: '/admin/users',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>`,
      iconBg: 'bg-purple-500/10 dark:bg-purple-400/10',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <h3 class="mb-6 text-base font-semibold text-zinc-950 dark:text-white">Quick Actions</h3>

      <div class="space-y-3">
        ${actions.map(action => `
          <a href="${action.href}" class="block group">
            <div class="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${action.iconBg}">
                <div class="${action.iconColor}">${action.icon}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-100">${action.title}</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">${action.description}</p>
              </div>
              <svg class="w-4 h-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    { label: 'Database', status: 'online', color: 'bg-green-500 dark:bg-green-400', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'File Storage', status: 'online', color: 'bg-green-500 dark:bg-green-400', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'CDN', status: 'online', color: 'bg-green-500 dark:bg-green-400', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Email Service', status: 'maintenance', color: 'bg-amber-500 dark:bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' }
  ]

  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <h3 class="mb-6 text-base font-semibold text-zinc-950 dark:text-white">System Status</h3>

      <div class="space-y-4">
        ${statusItems.map(item => `
          <div class="flex items-center justify-between">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">${item.label}</span>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full ${item.color}"></div>
              <span class="text-sm ${item.textColor} capitalize">${item.status}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="mt-6">
        <button class="flex w-full items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  `
}

function renderStorageUsage(): string {
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <h3 class="mb-6 text-base font-semibold text-zinc-950 dark:text-white">Storage Usage</h3>

      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Database</span>
            <span class="text-sm font-medium text-zinc-950 dark:text-white">2.3 GB / 10 GB</span>
          </div>
          <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
            <div class="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" style="width: 23%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Media Files</span>
            <span class="text-sm font-medium text-zinc-950 dark:text-white">4.7 GB / 20 GB</span>
          </div>
          <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
            <div class="bg-green-500 dark:bg-green-400 h-2 rounded-full" style="width: 23.5%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Backup</span>
            <span class="text-sm font-medium text-zinc-950 dark:text-white">1.2 GB / 5 GB</span>
          </div>
          <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
            <div class="bg-amber-500 dark:bg-amber-400 h-2 rounded-full" style="width: 24%"></div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button class="flex w-full items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
          Manage Storage
        </button>
      </div>
    </div>
  `
}