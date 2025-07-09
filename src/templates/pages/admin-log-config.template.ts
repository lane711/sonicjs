import { html } from 'hono/html'
import { adminLayoutV2 } from '../layouts/admin-layout-v2.template'
import { LogConfig } from '../../db/schema'

interface BaseUser {
  name: string
  email: string
  role: string
}

export interface LogConfigPageData {
  configs: LogConfig[]
  user?: BaseUser
}

export function renderLogConfigPage(data: LogConfigPageData) {
  const { configs, user } = data

  const content = html`
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <nav class="mb-4">
            <a href="/admin/logs" class="text-indigo-600 hover:text-indigo-900">
              ← Back to Logs
            </a>
          </nav>
          <h1 class="text-2xl font-semibold text-gray-900">Log Configuration</h1>
          <p class="mt-2 text-sm text-gray-700">
            Configure logging settings for different categories and manage log retention policies.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            hx-post="/admin/logs/cleanup"
            hx-confirm="Are you sure you want to run log cleanup? This will permanently delete old logs based on retention policies."
            hx-target="#cleanup-result"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Run Cleanup
          </button>
        </div>
      </div>

      <div id="cleanup-result" class="mt-4"></div>

      <!-- Log Levels Reference -->
      <div class="mt-6 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Log Levels Reference</h2>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div class="text-center">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                debug
              </span>
              <p class="mt-2 text-xs text-gray-500">Detailed diagnostic information</p>
            </div>
            <div class="text-center">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                info
              </span>
              <p class="mt-2 text-xs text-gray-500">General information messages</p>
            </div>
            <div class="text-center">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                warn
              </span>
              <p class="mt-2 text-xs text-gray-500">Warning conditions</p>
            </div>
            <div class="text-center">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                error
              </span>
              <p class="mt-2 text-xs text-gray-500">Error conditions</p>
            </div>
            <div class="text-center">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                fatal
              </span>
              <p class="mt-2 text-xs text-gray-500">Critical system errors</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration Cards -->
      <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${configs.map(config => html`
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 capitalize">${config.category}</h3>
                <div class="flex items-center">
                  ${config.enabled ? html`
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Enabled
                    </span>
                  ` : html`
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Disabled
                    </span>
                  `}
                </div>
              </div>
            </div>
            
            <form hx-post="/admin/logs/config/${config.category}" hx-target="#config-result-${config.category}">
              <div class="px-6 py-4 space-y-4">
                <div class="flex items-center">
                  <input
                    id="enabled-${config.category}"
                    name="enabled"
                    type="checkbox"
                    ${config.enabled ? 'checked' : ''}
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="enabled-${config.category}" class="ml-2 block text-sm text-gray-900">
                    Enable logging for this category
                  </label>
                </div>
                
                <div>
                  <label for="level-${config.category}" class="block text-sm font-medium text-gray-700">
                    Minimum Log Level
                  </label>
                  <select
                    id="level-${config.category}"
                    name="level"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="debug" ${config.level === 'debug' ? 'selected' : ''}>Debug</option>
                    <option value="info" ${config.level === 'info' ? 'selected' : ''}>Info</option>
                    <option value="warn" ${config.level === 'warn' ? 'selected' : ''}>Warning</option>
                    <option value="error" ${config.level === 'error' ? 'selected' : ''}>Error</option>
                    <option value="fatal" ${config.level === 'fatal' ? 'selected' : ''}>Fatal</option>
                  </select>
                  <p class="mt-1 text-sm text-gray-500">Only logs at this level or higher will be stored</p>
                </div>
                
                <div>
                  <label for="retention-${config.category}" class="block text-sm font-medium text-gray-700">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    id="retention-${config.category}"
                    name="retention"
                    value="${config.retention}"
                    min="1"
                    max="365"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p class="mt-1 text-sm text-gray-500">Logs older than this will be deleted</p>
                </div>
                
                <div>
                  <label for="max_size-${config.category}" class="block text-sm font-medium text-gray-700">
                    Maximum Log Count
                  </label>
                  <input
                    type="number"
                    id="max_size-${config.category}"
                    name="max_size"
                    value="${config.maxSize || ''}"
                    min="100"
                    max="100000"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p class="mt-1 text-sm text-gray-500">Maximum number of logs to keep for this category</p>
                </div>
              </div>
              
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div id="config-result-${config.category}" class="mb-4"></div>
                <button
                  type="submit"
                  class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Configuration
                </button>
              </div>
            </form>
            
            <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                <div>Created: ${new Date(config.createdAt).toLocaleDateString()}</div>
                <div>Updated: ${new Date(config.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Global Settings -->
      <div class="mt-8 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Global Log Settings</h2>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-6">
            <div>
              <h3 class="text-base font-medium text-gray-900">Storage Information</h3>
              <div class="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-gray-900">-</div>
                  <div class="text-sm text-gray-500">Total Log Entries</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-gray-900">-</div>
                  <div class="text-sm text-gray-500">Storage Used</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-2xl font-bold text-gray-900">-</div>
                  <div class="text-sm text-gray-500">Oldest Log</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-base font-medium text-gray-900">Log Categories</h3>
              <div class="mt-2 text-sm text-gray-600">
                <ul class="list-disc list-inside space-y-1">
                  <li><strong>auth</strong> - Authentication and authorization events</li>
                  <li><strong>api</strong> - API requests and responses</li>
                  <li><strong>workflow</strong> - Content workflow state changes</li>
                  <li><strong>plugin</strong> - Plugin-related activities</li>
                  <li><strong>media</strong> - File upload and media operations</li>
                  <li><strong>system</strong> - General system events</li>
                  <li><strong>security</strong> - Security-related events and alerts</li>
                  <li><strong>error</strong> - General error conditions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="https://unpkg.com/htmx.org@1.9.6"></script>
  `

  return adminLayoutV2({
    title: 'Log Configuration',
    user,
    content
  })
}