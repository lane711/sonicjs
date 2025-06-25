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
    <!-- Dashboard Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-semibold text-gray-1">
        Welcome back, ${data.user?.name || 'Admin'}! 👋
      </h2>
      <div class="flex items-center gap-2">
        <button 
          onclick="refreshDashboard()"
          class="flex items-center gap-2 rounded-md bg-gray-7 px-4 py-2 text-sm font-medium text-gray-3 hover:bg-gray-6 hover:text-white"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>
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

export function renderStatsCards(stats: DashboardStats): string {
  const cards = [
    {
      title: 'Total Collections',
      value: stats.collections.toString(),
      change: '+4.5%',
      changeType: 'positive',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`,
      color: 'bg-blue-500'
    },
    {
      title: 'Content Items',
      value: stats.contentItems.toString(),
      change: '+12.3%',
      changeType: 'positive',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`,
      color: 'bg-green-500'
    },
    {
      title: 'Media Files',
      value: stats.mediaFiles.toString(),
      change: '+8.1%',
      changeType: 'positive',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>`,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Users',
      value: stats.users.toString(),
      change: '+2.4%',
      changeType: 'positive',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>`,
      color: 'bg-orange-500'
    }
  ]

  return `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      ${cards.map(card => `
        <div class="card-hover rounded-sm border border-gray-7 bg-gray-8 py-6 px-7.5 shadow-default">
          <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full ${card.color}">
            <div class="text-white">
              ${card.icon}
            </div>
          </div>
          
          <div class="mt-4 flex items-end justify-between">
            <div>
              <h4 class="text-title-md font-bold text-gray-1">
                ${card.value}
              </h4>
              <span class="text-sm font-medium text-gray-4">${card.title}</span>
            </div>
            
            <span class="flex items-center gap-1 text-sm font-medium ${card.changeType === 'positive' ? 'text-success' : 'text-error'}">
              ${card.change}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${card.changeType === 'positive' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}"/>
              </svg>
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderStatsCardsSkeleton(): string {
  return `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      ${Array(4).fill(0).map(() => `
        <div class="rounded-sm border border-gray-7 bg-gray-8 py-6 px-7.5 shadow-default animate-pulse">
          <div class="h-11.5 w-11.5 rounded-full bg-gray-6"></div>
          <div class="mt-4">
            <div class="h-8 w-16 bg-gray-6 rounded mb-2"></div>
            <div class="h-4 w-24 bg-gray-6 rounded"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderAnalyticsChart(): string {
  return `
    <div class="rounded-sm border border-gray-7 bg-gray-8 px-5 pt-7.5 pb-5 shadow-default sm:px-7.5">
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
            <button class="rounded bg-white py-1 px-3 text-xs font-medium text-gray-8 shadow-card hover:bg-gray-1">
              Day
            </button>
            <button class="py-1 px-3 text-xs font-medium text-gray-4 hover:bg-gray-6 hover:text-white">
              Week
            </button>
            <button class="py-1 px-3 text-xs font-medium text-gray-4 hover:bg-gray-6 hover:text-white">
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
    <div class="rounded-sm border border-gray-7 bg-gray-8 py-6 px-4 shadow-default sm:px-6">
      <div class="mb-4 justify-between sm:flex">
        <div>
          <h4 class="text-xl font-semibold text-gray-1">Recent Activity</h4>
        </div>
        <div>
          <div class="relative z-20 inline-block">
            <select class="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none text-gray-4">
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
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-7">
              ${activity.icon}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-1">${activity.description}</p>
              <p class="text-xs text-gray-4">by ${activity.user} • ${activity.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-6">
        <a href="/admin/activity" class="flex w-full items-center justify-center rounded bg-gray-7 py-2 px-4 text-sm font-medium text-gray-3 hover:bg-gray-6 hover:text-white">
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
    <div class="rounded-sm border border-gray-7 bg-gray-8 py-6 px-4 shadow-default sm:px-6">
      <h4 class="mb-6 text-xl font-semibold text-gray-1">Quick Actions</h4>
      
      <div class="space-y-3">
        ${actions.map(action => `
          <a href="${action.href}" class="block group">
            <div class="flex items-center gap-3 rounded-lg bg-gray-7 p-3 hover:bg-gray-6 transition-colors">
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
    <div class="rounded-sm border border-gray-7 bg-gray-8 py-6 px-4 shadow-default sm:px-6">
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
        <button class="flex w-full items-center justify-center rounded bg-gray-7 py-2 px-4 text-sm font-medium text-gray-3 hover:bg-gray-6 hover:text-white">
          View Details
        </button>
      </div>
    </div>
  `
}

function renderStorageUsage(): string {
  return `
    <div class="rounded-sm border border-gray-7 bg-gray-8 py-6 px-4 shadow-default sm:px-6">
      <h4 class="mb-6 text-xl font-semibold text-gray-1">Storage Usage</h4>
      
      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Database</span>
            <span class="text-sm text-gray-1">2.3 GB / 10 GB</span>
          </div>
          <div class="w-full bg-gray-7 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full" style="width: 23%"></div>
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Media Files</span>
            <span class="text-sm text-gray-1">4.7 GB / 20 GB</span>
          </div>
          <div class="w-full bg-gray-7 rounded-full h-2">
            <div class="bg-success h-2 rounded-full" style="width: 23.5%"></div>
          </div>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-3">Backup</span>
            <span class="text-sm text-gray-1">1.2 GB / 5 GB</span>
          </div>
          <div class="w-full bg-gray-7 rounded-full h-2">
            <div class="bg-warning h-2 rounded-full" style="width: 24%"></div>
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <button class="flex w-full items-center justify-center rounded bg-gray-7 py-2 px-4 text-sm font-medium text-gray-3 hover:bg-gray-6 hover:text-white">
          Manage Storage
        </button>
      </div>
    </div>
  `
}