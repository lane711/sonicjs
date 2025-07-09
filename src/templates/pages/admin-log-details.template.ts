import { html } from 'hono/html'
import { adminLayoutV2 } from '../layouts/admin-layout-v2.template'
import { LogEntry } from './admin-logs-list.template'

interface BaseUser {
  name: string
  email: string
  role: string
}

export interface LogDetailsPageData {
  log: LogEntry
  user?: BaseUser
}

export function renderLogDetailsPage(data: LogDetailsPageData) {
  const { log, user } = data

  const content = html`
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <nav class="mb-4">
            <a href="/admin/logs" class="text-indigo-600 hover:text-indigo-900">
              ← Back to Logs
            </a>
          </nav>
          <h1 class="text-2xl font-semibold text-gray-900">Log Details</h1>
          <p class="mt-2 text-sm text-gray-700">
            Detailed information for log entry ${log.id}
          </p>
        </div>
      </div>

      <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">Log Entry Information</h2>
            <div class="flex items-center space-x-2">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.levelClass}">
                ${log.level}
              </span>
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.categoryClass}">
                ${log.category}
              </span>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">ID</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">${log.id}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Timestamp</dt>
              <dd class="mt-1 text-sm text-gray-900">${log.formattedDate}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Level</dt>
              <dd class="mt-1">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.levelClass}">
                  ${log.level}
                </span>
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Category</dt>
              <dd class="mt-1">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.categoryClass}">
                  ${log.category}
                </span>
              </dd>
            </div>
            
            ${log.source ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">Source</dt>
                <dd class="mt-1 text-sm text-gray-900">${log.source}</dd>
              </div>
            ` : ''}
            
            ${log.userId ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">User ID</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">${log.userId}</dd>
              </div>
            ` : ''}
            
            ${log.sessionId ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">Session ID</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">${log.sessionId}</dd>
              </div>
            ` : ''}
            
            ${log.requestId ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">Request ID</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">${log.requestId}</dd>
              </div>
            ` : ''}
            
            ${log.ipAddress ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">IP Address</dt>
                <dd class="mt-1 text-sm text-gray-900">${log.ipAddress}</dd>
              </div>
            ` : ''}
            
            ${log.method && log.url ? html`
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">HTTP Request</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span class="font-medium">${log.method}</span> ${log.url}
                  ${log.statusCode ? html`<span class="ml-2 text-gray-500">(${log.statusCode})</span>` : ''}
                </dd>
              </div>
            ` : ''}
            
            ${log.duration ? html`
              <div>
                <dt class="text-sm font-medium text-gray-500">Duration</dt>
                <dd class="mt-1 text-sm text-gray-900">${log.formattedDuration}</dd>
              </div>
            ` : ''}
            
            ${log.userAgent ? html`
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">User Agent</dt>
                <dd class="mt-1 text-sm text-gray-900 break-all">${log.userAgent}</dd>
              </div>
            ` : ''}
          </dl>
        </div>
      </div>

      <!-- Message -->
      <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Message</h3>
        </div>
        <div class="px-6 py-4">
          <div class="text-sm text-gray-900 whitespace-pre-wrap break-words">
            ${log.message}
          </div>
        </div>
      </div>

      <!-- Tags -->
      ${log.tags && log.tags.length > 0 ? html`
        <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Tags</h3>
          </div>
          <div class="px-6 py-4">
            <div class="flex flex-wrap gap-2">
              ${log.tags.map(tag => html`
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Additional Data -->
      ${log.data ? html`
        <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Additional Data</h3>
          </div>
          <div class="px-6 py-4">
            <pre class="text-sm text-gray-900 bg-gray-50 rounded-md p-4 overflow-x-auto"><code>${JSON.stringify(log.data, null, 2)}</code></pre>
          </div>
        </div>
      ` : ''}

      <!-- Stack Trace -->
      ${log.stackTrace ? html`
        <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Stack Trace</h3>
          </div>
          <div class="px-6 py-4">
            <pre class="text-sm text-gray-900 bg-gray-50 rounded-md p-4 overflow-x-auto whitespace-pre-wrap"><code>${log.stackTrace}</code></pre>
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <a
          href="/admin/logs"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to Logs
        </a>
        
        <div class="flex space-x-3">
          ${log.level === 'error' || log.level === 'fatal' ? html`
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onclick="alert('Error reporting functionality would be implemented here')"
            >
              Report Issue
            </button>
          ` : ''}
          
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(log)}, null, 2)).then(() => alert('Log details copied to clipboard'))"
          >
            Copy Details
          </button>
        </div>
      </div>
    </div>
  `

  return adminLayoutV2({
    title: `Log Details - ${log.id}`,
    user,
    content
  })
}