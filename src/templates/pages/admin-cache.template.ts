import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface CacheStats {
  memoryHits: number
  memoryMisses: number
  kvHits: number
  kvMisses: number
  dbHits: number
  totalRequests: number
  hitRate: number
  memorySize: number
  entryCount: number
}

export interface CacheDashboardData {
  stats: Record<string, CacheStats>
  totals: {
    hits: number
    misses: number
    requests: number
    hitRate: string
    memorySize: number
    entryCount: number
  }
  namespaces: string[]
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderCacheDashboard(data: CacheDashboardData): string {
  const pageContent = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">Cache System</h1>
          <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Monitor and manage cache performance across all namespaces
          </p>
        </div>
        <div class="flex gap-3">
          <button
            onclick="refreshStats()"
            class="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <button
            onclick="clearAllCaches()"
            class="inline-flex items-center gap-2 rounded-lg bg-red-600 dark:bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <!-- Overall Stats Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ${renderStatCard('Total Requests', data.totals.requests.toLocaleString(), 'lime', `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        `)}

        ${renderStatCard('Hit Rate', data.totals.hitRate + '%', 'blue', `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        `, parseFloat(data.totals.hitRate) > 70 ? 'lime' : parseFloat(data.totals.hitRate) > 40 ? 'amber' : 'red')}

        ${renderStatCard('Memory Usage', formatBytes(data.totals.memorySize), 'purple', `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
          </svg>
        `)}

        ${renderStatCard('Cached Entries', data.totals.entryCount.toLocaleString(), 'sky', `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
        `)}
      </div>

      <!-- Namespace Statistics -->
      <div class="overflow-hidden rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-950/5 dark:ring-white/10">
        <div class="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
          <h2 class="text-lg font-semibold text-zinc-950 dark:text-white">Cache Namespaces</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-950/5 dark:divide-white/10">
            <thead class="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Namespace
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Requests
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Hit Rate
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Memory Hits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  KV Hits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Entries
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Size
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-950/5 dark:divide-white/10">
              ${data.namespaces.map(namespace => {
                const stat = data.stats[namespace]
                if (!stat) return ''
                return renderNamespaceRow(namespace, stat)
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance Chart Placeholder -->
      <div class="overflow-hidden rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-950/5 dark:ring-white/10">
        <div class="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
          <h2 class="text-lg font-semibold text-zinc-950 dark:text-white">Performance Overview</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${renderPerformanceMetric('Memory Cache', data.totals.hits, data.totals.misses)}
            ${renderHealthStatus(parseFloat(data.totals.hitRate))}
          </div>
        </div>
      </div>
    </div>

    <script>
      async function refreshStats() {
        window.location.reload()
      }

      async function clearAllCaches() {
        if (!confirm('Are you sure you want to clear all cache entries? This cannot be undone.')) {
          return
        }

        try {
          const response = await fetch('/admin/cache/clear', {
            method: 'POST'
          })

          const result = await response.json()
          if (result.success) {
            alert('All caches cleared successfully')
            window.location.reload()
          } else {
            alert('Error clearing caches: ' + result.error)
          }
        } catch (error) {
          alert('Error clearing caches: ' + error.message)
        }
      }

      async function clearNamespaceCache(namespace) {
        if (!confirm(\`Clear cache for namespace "\${namespace}"?\`)) {
          return
        }

        try {
          const response = await fetch(\`/admin/cache/clear/\${namespace}\`, {
            method: 'POST'
          })

          const result = await response.json()
          if (result.success) {
            alert('Cache cleared successfully')
            window.location.reload()
          } else {
            alert('Error clearing cache: ' + result.error)
          }
        } catch (error) {
          alert('Error clearing cache: ' + error.message)
        }
      }
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Cache System',
    pageTitle: 'Cache System',
    currentPath: '/admin/cache',
    user: data.user,
    version: data.version,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}

function renderStatCard(label: string, value: string, color: string, icon: string, colorOverride?: string): string {
  const finalColor = colorOverride || color
  const colorClasses = {
    lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400 ring-lime-600/20 dark:ring-lime-500/20',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-500/20',
    sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-600/20 dark:ring-sky-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20'
  }

  return `
    <div class="overflow-hidden rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-lg p-2 ring-1 ring-inset ${colorClasses[finalColor as keyof typeof colorClasses]}">
              ${icon}
            </div>
            <div>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">${label}</p>
              <p class="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">${value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderNamespaceRow(namespace: string, stat: CacheStats): string {
  const hitRate = stat.hitRate.toFixed(1)
  const hitRateColor = stat.hitRate > 70 ? 'text-lime-600 dark:text-lime-400' :
                       stat.hitRate > 40 ? 'text-amber-600 dark:text-amber-400' :
                       'text-red-600 dark:text-red-400'

  return `
    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700">
          ${namespace}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
        ${stat.totalRequests.toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm font-medium ${hitRateColor}">
          ${hitRate}%
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
        ${stat.memoryHits.toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
        ${stat.kvHits.toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
        ${stat.entryCount.toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
        ${formatBytes(stat.memorySize)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
        <button
          onclick="clearNamespaceCache('${namespace}')"
          class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          Clear
        </button>
      </td>
    </tr>
  `
}

function renderPerformanceMetric(label: string, hits: number, misses: number): string {
  const total = hits + misses
  const hitPercentage = total > 0 ? (hits / total) * 100 : 0

  return `
    <div>
      <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">${label}</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-zinc-600 dark:text-zinc-400">Hits</span>
          <span class="font-medium text-zinc-900 dark:text-zinc-100">${hits.toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-zinc-600 dark:text-zinc-400">Misses</span>
          <span class="font-medium text-zinc-900 dark:text-zinc-100">${misses.toLocaleString()}</span>
        </div>
        <div class="mt-3">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-zinc-600 dark:text-zinc-400">Hit Rate</span>
            <span class="font-medium text-zinc-900 dark:text-zinc-100">${hitPercentage.toFixed(1)}%</span>
          </div>
          <div class="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div class="h-full bg-lime-500 dark:bg-lime-400" style="width: ${hitPercentage}%"></div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderHealthStatus(hitRate: number): string {
  const status = hitRate > 70 ? 'healthy' : hitRate > 40 ? 'warning' : 'critical'
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      color: 'lime',
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`
    },
    warning: {
      label: 'Needs Attention',
      color: 'amber',
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`
    },
    critical: {
      label: 'Critical',
      color: 'red',
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`
    }
  }

  const config = statusConfig[status]
  const colorClasses = {
    lime: 'bg-lime-50 dark:bg-lime-500/10 text-lime-600 dark:text-lime-400 ring-lime-600/20 dark:ring-lime-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20'
  }

  return `
    <div>
      <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">System Health</h3>
      <div class="flex items-center gap-3 p-4 rounded-lg ring-1 ring-inset ${colorClasses[config.color as keyof typeof colorClasses]}">
        ${config.icon}
        <div>
          <p class="text-sm font-medium">${config.label}</p>
          <p class="text-xs mt-0.5 opacity-80">
            ${status === 'healthy' ? 'Cache is performing well' :
              status === 'warning' ? 'Consider increasing cache TTL or capacity' :
              'Cache hit rate is too low'}
          </p>
        </div>
      </div>
    </div>
  `
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
