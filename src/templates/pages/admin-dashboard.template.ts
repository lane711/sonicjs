import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface DashboardStats {
  collections: number
  contentItems: number
  mediaFiles: number
  users: number
}

export interface DashboardPageData {
  stats?: DashboardStats
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderDashboardPage(data: DashboardPageData): string {
  const pageContent = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome to your SonicJS AI admin panel</p>
      </div>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stats-card" hx-get="/admin/api/stats" hx-trigger="load" hx-target="this">
          <div class="bg-white rounded-lg border shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Collections</p>
                <p class="text-3xl font-bold text-gray-900">Loading...</p>
              </div>
              <div class="p-3 rounded-full bg-blue-100">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg border shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Content Items</p>
              <p class="text-3xl font-bold text-gray-900">Loading...</p>
            </div>
            <div class="p-3 rounded-full bg-green-100">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg border shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Media Files</p>
              <p class="text-3xl font-bold text-gray-900">Loading...</p>
            </div>
            <div class="p-3 rounded-full bg-purple-100">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg border shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Users</p>
              <p class="text-3xl font-bold text-gray-900">Loading...</p>
            </div>
            <div class="p-3 rounded-full bg-yellow-100">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg border shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <a href="/admin/content/new" class="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <div class="p-2 rounded-md bg-blue-100 mr-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Create Content</p>
                <p class="text-sm text-gray-600">Add new content item</p>
              </div>
            </a>
            
            <a href="/admin/collections/new" class="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <div class="p-2 rounded-md bg-green-100 mr-3">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">New Collection</p>
                <p class="text-sm text-gray-600">Define content structure</p>
              </div>
            </a>
            
            <button onclick="document.getElementById('upload-modal').classList.remove('hidden')" class="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors w-full text-left">
              <div class="p-2 rounded-md bg-purple-100 mr-3">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Upload Media</p>
                <p class="text-sm text-gray-600">Add images and files</p>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg border shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div hx-get="/admin/api/recent-activity" hx-trigger="load" class="space-y-3">
            <div class="flex items-center p-3 rounded-md bg-gray-50">
              <div class="animate-pulse flex space-x-3">
                <div class="rounded-full bg-gray-300 h-3 w-3"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Status -->
      <div class="bg-white rounded-lg border shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span class="text-sm text-gray-600">Database: Connected</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span class="text-sm text-gray-600">Storage: Available</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <span class="text-sm text-gray-600">API: Operational</span>
          </div>
        </div>
      </div>
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: 'Dashboard',
    pageTitle: 'SonicJS AI Admin',
    currentPath: '/admin',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

export function renderStatsCards(stats: DashboardStats): string {
  return `
    <div class="bg-white rounded-lg border shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Collections</p>
          <p class="text-3xl font-bold text-gray-900">${stats.collections}</p>
        </div>
        <div class="p-3 rounded-full bg-blue-100">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Content Items</p>
          <p class="text-3xl font-bold text-gray-900">${stats.contentItems}</p>
        </div>
        <div class="p-3 rounded-full bg-green-100">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Media Files</p>
          <p class="text-3xl font-bold text-gray-900">${stats.mediaFiles}</p>
        </div>
        <div class="p-3 rounded-full bg-purple-100">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Users</p>
          <p class="text-3xl font-bold text-gray-900">${stats.users}</p>
        </div>
        <div class="p-3 rounded-full bg-yellow-100">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
        </div>
      </div>
    </div>
  `
}