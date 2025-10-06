import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface DesignPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderDesignPage(data: DesignPageData): string {
  const pageContent = `
    <div class="space-y-8">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Catalyst Design System</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            A comprehensive showcase of all UI components and design patterns
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-x-2">
          <a
            href="/docs/design-system"
            class="inline-flex items-center gap-x-2 rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 transition-colors shadow-sm"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Documentation
          </a>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-zinc-950 dark:text-white">Component Library</h2>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Browse all available components</p>
          </div>
          <span class="inline-flex items-center gap-x-1.5 rounded-lg bg-zinc-950 dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Quick Nav
          </span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <a href="#modern" class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">Modern Patterns</a>
          <a href="#typography" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Typography</a>
          <a href="#colors" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Colors</a>
          <a href="#buttons" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Buttons</a>
          <a href="#forms" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Forms</a>
          <a href="#checkboxes" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Checkboxes</a>
          <a href="#tables" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Tables</a>
          <a href="#alerts" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Alerts</a>
          <a href="#badges" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Badges</a>
          <a href="#cards" class="text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Cards</a>
        </div>
      </div>

      <!-- Modern Patterns Section -->
      <div id="modern">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Modern UI Patterns</h2>

        <!-- Gradient Filter Bar -->
        <div class="space-y-6">
          <div>
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Gradient Filter Bar</h3>
            <div class="relative rounded-xl overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20"></div>
              <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
                <div class="px-6 py-5">
                  <div class="flex items-center gap-x-4">
                    <div class="relative group flex-1 max-w-sm">
                      <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                        <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search with gradient icon..."
                        class="w-full rounded-full bg-transparent pl-11 pr-4 py-2 text-sm text-zinc-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border-2 border-cyan-200/50 dark:border-cyan-700/50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                      />
                    </div>
                    <button class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colored Badges -->
          <div>
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Colored Category Badges</h3>
            <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center rounded-md bg-lime-50 dark:bg-lime-500/10 px-2.5 py-1 text-sm font-medium text-lime-700 dark:text-lime-300 ring-1 ring-inset ring-lime-700/10 dark:ring-lime-400/20">
                  Collection Name
                </span>
                <span class="inline-flex items-center rounded-md bg-pink-50 dark:bg-pink-500/10 px-2.5 py-1 text-sm font-medium text-pink-700 dark:text-pink-300 ring-1 ring-inset ring-pink-700/10 dark:ring-pink-400/20">
                  5 fields
                </span>
                <span class="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 text-sm font-medium text-cyan-700 dark:text-cyan-300 ring-1 ring-inset ring-cyan-700/10 dark:ring-cyan-400/20">
                  Interactive
                </span>
                <span class="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 text-sm font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/20">
                  Category
                </span>
              </div>
            </div>
          </div>

          <!-- Enhanced Table Row -->
          <div>
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Enhanced Table with Gradient Hover</h3>
            <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Type</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="group border-t border-zinc-950/5 dark:border-white/5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:via-blue-50/30 hover:to-purple-50/50 dark:hover:from-cyan-900/20 dark:hover:via-blue-900/10 dark:hover:to-purple-900/20 hover:shadow-sm hover:shadow-cyan-500/5 dark:hover:shadow-cyan-400/5 hover:border-l-2 hover:border-l-cyan-500 dark:hover:border-l-cyan-400 transition-all duration-300">
                    <td class="px-6 py-4 text-sm font-medium text-zinc-950 dark:text-white">Example Item</td>
                    <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span class="inline-flex items-center rounded-md bg-lime-50 dark:bg-lime-500/10 px-2.5 py-1 text-sm font-medium text-lime-700 dark:text-lime-300 ring-1 ring-inset ring-lime-700/10 dark:ring-lime-400/20">
                        Collection
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr class="group border-t border-zinc-950/5 dark:border-white/5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:via-blue-50/30 hover:to-purple-50/50 dark:hover:from-cyan-900/20 dark:hover:via-blue-900/10 dark:hover:to-purple-900/20 hover:shadow-sm hover:shadow-cyan-500/5 dark:hover:shadow-cyan-400/5 hover:border-l-2 hover:border-l-cyan-500 dark:hover:border-l-cyan-400 transition-all duration-300">
                    <td class="px-6 py-4 text-sm font-medium text-zinc-950 dark:text-white">Another Item</td>
                    <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span class="inline-flex items-center rounded-md bg-pink-50 dark:bg-pink-500/10 px-2.5 py-1 text-sm font-medium text-pink-700 dark:text-pink-300 ring-1 ring-inset ring-pink-700/10 dark:ring-pink-400/20">
                        Content
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span class="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
                        Draft
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Typography Section -->
      <div id="typography">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Typography</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
          <div class="space-y-8">
            <div>
              <h1 class="text-3xl font-semibold text-zinc-950 dark:text-white">Heading 1</h1>
              <code class="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">text-3xl font-semibold</code>
            </div>

            <div>
              <h2 class="text-2xl font-semibold text-zinc-950 dark:text-white">Heading 2</h2>
              <code class="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">text-2xl font-semibold</code>
            </div>

            <div>
              <h3 class="text-xl font-semibold text-zinc-950 dark:text-white">Heading 3</h3>
              <code class="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">text-xl font-semibold</code>
            </div>

            <div>
              <p class="text-base text-zinc-950 dark:text-white">Body text - This is the standard body text used throughout the interface for content and descriptions.</p>
              <code class="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">text-base</code>
            </div>

            <div>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">Small text - Used for secondary information and metadata.</p>
              <code class="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">text-sm text-zinc-500</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Colors Section -->
      <div id="colors">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Color Palette</h2>

        <div class="space-y-6">
          <!-- Pastel Brand Colors -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Pastel Brand Colors (Currently Used)</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div class="h-20 rounded-lg bg-cyan-400 dark:bg-cyan-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">cyan-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#22d3ee</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-pink-400 dark:bg-pink-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">pink-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#f472b6</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-purple-400 dark:bg-purple-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">purple-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#c084fc</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-lime-400 dark:bg-lime-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">lime-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#a3e635</span>
              </div>
            </div>
          </div>

          <!-- Full Pastel Palette -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Complete Pastel Color Set</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <div class="h-20 rounded-lg bg-cyan-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">cyan-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#22d3ee</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-sky-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">sky-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#38bdf8</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-blue-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">blue-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#60a5fa</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-indigo-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">indigo-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#818cf8</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-purple-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">purple-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#c084fc</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-fuchsia-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">fuchsia-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#e879f9</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-pink-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">pink-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#f472b6</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-rose-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">rose-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#fb7185</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-red-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">red-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#f87171</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-orange-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">orange-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#fb923c</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-amber-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">amber-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#fbbf24</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-yellow-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">yellow-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#facc15</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-lime-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">lime-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#a3e635</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-green-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">green-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#4ade80</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-emerald-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">emerald-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#34d399</span>
              </div>
              <div>
                <div class="h-20 rounded-lg bg-teal-400 shadow-sm"></div>
                <span class="text-xs font-medium text-zinc-950 dark:text-white mt-2 block">teal-400</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">#2dd4bf</span>
              </div>
            </div>
          </div>

          <!-- Zinc Scale & Semantic Colors -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Zinc Scale -->
            <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Zinc (Neutral Scale)</h3>
              <div class="space-y-2">
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-zinc-50 ring-1 ring-inset ring-zinc-950/10"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">zinc-50</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-zinc-100 ring-1 ring-inset ring-zinc-950/10"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">zinc-100</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-zinc-500"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">zinc-500</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-zinc-900"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">zinc-900</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-zinc-950"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">zinc-950</span>
                </div>
              </div>
            </div>

            <!-- Semantic Colors -->
            <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Semantic Colors</h3>
              <div class="space-y-2">
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-blue-500"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">Info - blue-500</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-green-500"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">Success - green-500</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-amber-500"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">Warning - amber-500</span>
                </div>
                <div class="flex items-center gap-x-3">
                  <div class="h-10 w-10 rounded-lg bg-red-500"></div>
                  <span class="text-sm text-zinc-950 dark:text-white">Error - red-500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons Section -->
      <div id="buttons">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Buttons</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
          <div class="space-y-8">
            <!-- Primary Buttons -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Primary</h3>
              <div class="flex flex-wrap gap-3">
                <button class="inline-flex items-center gap-x-2 rounded-lg bg-zinc-950 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Create New
                </button>
                <button class="rounded-lg bg-zinc-950 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            <!-- Secondary Buttons -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Secondary</h3>
              <div class="flex flex-wrap gap-3">
                <button class="inline-flex items-center gap-x-2 rounded-lg bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>
                <button class="rounded-lg bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
              </div>
            </div>

            <!-- Danger Buttons -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Danger</h3>
              <div class="flex flex-wrap gap-3">
                <button class="inline-flex items-center gap-x-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            <!-- Link Buttons -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Link Style</h3>
              <div class="flex flex-wrap gap-3">
                <button class="text-sm font-semibold text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  Learn more →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forms Section -->
      <div id="forms">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Form Components</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
          <form class="space-y-6">
            <!-- Text Input -->
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
              />
            </div>

            <!-- Select -->
            <div>
              <label for="select-demo" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                Select Dropdown
              </label>
              <div class="mt-2 grid grid-cols-1">
                <select id="select-demo" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 sm:text-sm/6">
                  <option value="">Choose an option</option>
                  <option value="1">Option 1</option>
                  <option value="2" selected>Option 2</option>
                  <option value="3">Option 3</option>
                </select>
                <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-600 dark:text-zinc-400 sm:size-4">
                  <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Textarea -->
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                Textarea
              </label>
              <textarea
                rows="3"
                placeholder="Enter description..."
                class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
              ></textarea>
            </div>

            <!-- Radio -->
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-3">
                Radio Group
              </label>
              <div class="space-y-2">
                <div class="flex items-center gap-x-2">
                  <input
                    type="radio"
                    id="radio-1"
                    name="radio-demo"
                    class="h-4 w-4 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white focus:ring-offset-0"
                  />
                  <label for="radio-1" class="text-sm text-zinc-950 dark:text-white">
                    Option 1
                  </label>
                </div>
                <div class="flex items-center gap-x-2">
                  <input
                    type="radio"
                    id="radio-2"
                    name="radio-demo"
                    class="h-4 w-4 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white focus:ring-offset-0"
                  />
                  <label for="radio-2" class="text-sm text-zinc-950 dark:text-white">
                    Option 2
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Checkboxes Section -->
      <div id="checkboxes">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Checkboxes</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
          <div class="space-y-8">
            <!-- Simple Checkboxes -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Simple Checkboxes</h3>
              <fieldset>
                <legend class="sr-only">Simple Checkboxes</legend>
                <div class="space-y-3">
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="checkbox-1" type="checkbox" name="simple" class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6"><label for="checkbox-1" class="font-medium text-zinc-950 dark:text-white">Default checkbox</label></div>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="checkbox-2" type="checkbox" name="simple" checked class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6"><label for="checkbox-2" class="font-medium text-zinc-950 dark:text-white">Checked checkbox</label></div>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="checkbox-3" type="checkbox" name="simple" disabled class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6"><label for="checkbox-3" class="font-medium text-zinc-500 dark:text-zinc-500">Disabled checkbox</label></div>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="checkbox-4" type="checkbox" name="simple" checked disabled class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6"><label for="checkbox-4" class="font-medium text-zinc-500 dark:text-zinc-500">Disabled & checked</label></div>
                  </div>
                </div>
              </fieldset>
            </div>

            <!-- Checkboxes with Descriptions -->
            <div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">With Descriptions</h3>
              <fieldset>
                <legend class="sr-only">Notifications</legend>
                <div class="space-y-5">
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="email-notif" type="checkbox" name="notifications" checked aria-describedby="email-desc" class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6">
                      <label for="email-notif" class="font-medium text-zinc-950 dark:text-white">Email notifications</label>
                      <p id="email-desc" class="text-zinc-500 dark:text-zinc-400">Receive email updates about new features and product announcements.</p>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="marketing" type="checkbox" name="notifications" aria-describedby="marketing-desc" class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6">
                      <label for="marketing" class="font-medium text-zinc-950 dark:text-white">Marketing communications</label>
                      <p id="marketing-desc" class="text-zinc-500 dark:text-zinc-400">Get tips, special offers, and news about our products and services.</p>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input id="security" type="checkbox" name="notifications" checked disabled aria-describedby="security-desc" class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 forced-colors:appearance-auto" />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6">
                      <label for="security" class="font-medium text-zinc-500 dark:text-zinc-500">Security alerts</label>
                      <p id="security-desc" class="text-zinc-500 dark:text-zinc-400">Important notifications about your account security and privacy.</p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables Section -->
      <div id="tables">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Tables</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
          <table class="min-w-full divide-y divide-zinc-950/5 dark:divide-white/5">
            <thead class="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Created
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-950/5 dark:divide-white/5">
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-950 dark:text-white">
                  Sample Item 1
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
                    Published
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  Jan 15, 2025
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div class="flex justify-end gap-x-2">
                    <a href="#" class="text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      Edit
                    </a>
                    <a href="#" class="text-red-600 hover:text-red-700 dark:hover:text-red-500 transition-colors">
                      Delete
                    </a>
                  </div>
                </td>
              </tr>
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-950 dark:text-white">
                  Sample Item 2
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
                    Draft
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  Jan 14, 2025
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div class="flex justify-end gap-x-2">
                    <a href="#" class="text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      Edit
                    </a>
                    <a href="#" class="text-red-600 hover:text-red-700 dark:hover:text-red-500 transition-colors">
                      Delete
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alerts Section -->
      <div id="alerts">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Alerts</h2>

        <div class="space-y-4">
          <!-- Success Alert -->
          <div class="rounded-lg bg-green-50 dark:bg-green-500/10 p-4 ring-1 ring-green-600/20 dark:ring-green-500/20">
            <div class="flex items-start gap-x-3">
              <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="text-sm font-semibold text-green-900 dark:text-green-300">Success</h3>
                <p class="mt-1 text-sm text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div class="rounded-lg bg-red-50 dark:bg-red-500/10 p-4 ring-1 ring-red-600/20 dark:ring-red-500/20">
            <div class="flex items-start gap-x-3">
              <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="text-sm font-semibold text-red-900 dark:text-red-300">Error</h3>
                <p class="mt-1 text-sm text-red-700 dark:text-red-400">There was a problem with your request.</p>
              </div>
            </div>
          </div>

          <!-- Warning Alert -->
          <div class="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-4 ring-1 ring-amber-600/20 dark:ring-amber-500/20">
            <div class="flex items-start gap-x-3">
              <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.632 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div>
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-300">Warning</h3>
                <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">Please review your changes before continuing.</p>
              </div>
            </div>
          </div>

          <!-- Info Alert -->
          <div class="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 ring-1 ring-blue-600/20 dark:ring-blue-500/20">
            <div class="flex items-start gap-x-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300">Information</h3>
                <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">Here's some helpful information about this feature.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges Section -->
      <div id="badges">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Badges</h2>

        <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center rounded-md bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/10 dark:ring-zinc-400/20">
              Default
            </span>
            <span class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Info
            </span>
            <span class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
              Success
            </span>
            <span class="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">
              Warning
            </span>
            <span class="inline-flex items-center rounded-md bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">
              Error
            </span>
          </div>
        </div>
      </div>

      <!-- Cards Section -->
      <div id="cards">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Cards</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Basic Card -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-2">Basic Card</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              A simple card with a title and description.
            </p>
          </div>

          <!-- Interactive Card -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 hover:shadow-md hover:ring-zinc-950/10 dark:hover:ring-white/20 transition-all cursor-pointer">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-2">Interactive Card</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              This card has hover effects and is clickable.
            </p>
          </div>

          <!-- Card with Icon -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <div class="flex items-center gap-x-3 mb-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 dark:bg-white">
                <svg class="h-5 w-5 text-white dark:text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-base font-semibold text-zinc-950 dark:text-white">With Icon</h3>
            </div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              Card with an icon in the header.
            </p>
          </div>
        </div>
      </div>

    </div>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Catalyst Design System',
    pageTitle: 'Design System',
    currentPath: '/admin/design',
    user: data.user,
    version: data.version,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}