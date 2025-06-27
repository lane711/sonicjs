import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'

export interface DesignPageData {
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderDesignPage(data: DesignPageData): string {
  const pageContent = `
    <!-- Page Header -->
    <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-3">
          <li>
            <a href="/admin" class="text-gray-300 hover:text-white transition-colors">Admin</a>
          </li>
          <li class="text-gray-400">/</li>
          <li class="text-white font-medium">Design System</li>
        </ol>
      </nav>
      
      <!-- Title Section with Gradient -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
        <div class="relative">
          <h1 class="text-4xl font-bold text-white mb-3">Design System</h1>
          <p class="text-gray-300 text-lg">Comprehensive showcase of all design system components and patterns</p>
        </div>
      </div>
    </div>

    <!-- Table of Contents -->
    <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 mb-8">
      <h2 class="text-2xl font-bold text-white mb-4">Components Showcase</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="#typography" class="text-blue-300 hover:text-blue-200 transition-colors">Typography</a>
        <a href="#colors" class="text-blue-300 hover:text-blue-200 transition-colors">Colors</a>
        <a href="#buttons" class="text-blue-300 hover:text-blue-200 transition-colors">Buttons</a>
        <a href="#forms" class="text-blue-300 hover:text-blue-200 transition-colors">Forms</a>
        <a href="#cards" class="text-blue-300 hover:text-blue-200 transition-colors">Cards</a>
        <a href="#tables" class="text-blue-300 hover:text-blue-200 transition-colors">Tables</a>
        <a href="#alerts" class="text-blue-300 hover:text-blue-200 transition-colors">Alerts</a>
        <a href="#spacing" class="text-blue-300 hover:text-blue-200 transition-colors">Spacing</a>
      </div>
    </div>

    <!-- Typography Section -->
    <div id="typography" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Typography</h2>
      
      <div class="space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Page Title (text-4xl font-bold)</h1>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-4xl font-bold text-white</code>
        </div>
        
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">Section Heading (text-2xl font-bold)</h2>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-2xl font-bold text-white</code>
        </div>
        
        <div>
          <h3 class="text-xl font-semibold text-white mb-2">Subsection Heading (text-xl font-semibold)</h3>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-xl font-semibold text-white</code>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-white mb-2">Card Title (text-lg font-semibold)</h4>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-lg font-semibold text-white</code>
        </div>
        
        <div>
          <p class="text-sm text-gray-300 mb-2">Body Text - This is the standard body text used throughout the interface for content and descriptions.</p>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-sm text-gray-300</code>
        </div>
        
        <div>
          <p class="text-xs text-gray-400 mb-2">Small Text - Used for metadata, timestamps, and secondary information.</p>
          <code class="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">text-xs text-gray-400</code>
        </div>
      </div>
    </div>

    <!-- Colors Section -->
    <div id="colors" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Color Palette</h2>
      
      <!-- Background Colors -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold text-white mb-4">Background Colors</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-black/20 p-4 rounded-xl border border-white/10">
            <div class="text-sm text-white mb-1">Primary Glass</div>
            <code class="text-xs text-gray-400">bg-black/20</code>
          </div>
          <div class="bg-white/10 p-4 rounded-xl border border-white/10">
            <div class="text-sm text-white mb-1">Secondary Glass</div>
            <code class="text-xs text-gray-400">bg-white/10</code>
          </div>
          <div class="bg-white/5 p-4 rounded-xl border border-white/10">
            <div class="text-sm text-white mb-1">Subtle Background</div>
            <code class="text-xs text-gray-400">bg-white/5</code>
          </div>
          <div class="bg-white/20 p-4 rounded-xl border border-white/10">
            <div class="text-sm text-white mb-1">Hover State</div>
            <code class="text-xs text-gray-400">bg-white/20</code>
          </div>
        </div>
      </div>

      <!-- Status Colors -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold text-white mb-4">Status Colors</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
            <div class="text-sm text-green-300 mb-1">Success</div>
            <code class="text-xs text-gray-400">bg-green-500/10</code>
          </div>
          <div class="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <div class="text-sm text-red-300 mb-1">Error</div>
            <code class="text-xs text-gray-400">bg-red-500/10</code>
          </div>
          <div class="bg-amber-500/20 p-4 rounded-xl border border-amber-500/20">
            <div class="text-sm text-amber-300 mb-1">Warning</div>
            <code class="text-xs text-gray-400">bg-amber-500/20</code>
          </div>
          <div class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
            <div class="text-sm text-blue-300 mb-1">Info</div>
            <code class="text-xs text-gray-400">bg-blue-500/10</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons Section -->
    <div id="buttons" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Buttons</h2>
      
      <div class="space-y-6">
        <!-- Primary Buttons -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Primary Buttons</h3>
          <div class="flex flex-wrap gap-4">
            <button class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New
            </button>
            <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
              Large Button
            </button>
          </div>
        </div>

        <!-- Secondary Buttons -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Secondary Buttons</h3>
          <div class="flex flex-wrap gap-4">
            <button class="inline-flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors border border-white/10">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11V5a2 2 0 012-2h7a2 2 0 012 2v6"></path>
              </svg>
              Edit
            </button>
            <button class="inline-flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors border border-white/10">
              View Details
            </button>
          </div>
        </div>

        <!-- Danger Buttons -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Danger Buttons</h3>
          <div class="flex flex-wrap gap-4">
            <button class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms Section -->
    <div id="forms" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Form Components</h2>
      
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <!-- Form Header -->
        <div class="relative px-8 py-6 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white">Sample Form</h3>
              <p class="text-sm text-gray-300">Demonstrating form input styles</p>
            </div>
          </div>
        </div>
        
        <!-- Form Content -->
        <div class="p-8 space-y-6">
          <!-- Text Input -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">Text Input</label>
            <input type="text" placeholder="Enter text..." class="w-full px-3 py-2 bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all">
          </div>

          <!-- Select -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">Select Dropdown</label>
            <select class="w-full px-3 py-2 bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all">
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>

          <!-- Textarea -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">Textarea</label>
            <textarea rows="3" placeholder="Enter description..." class="w-full px-3 py-2 bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"></textarea>
          </div>

          <!-- Checkbox -->
          <div class="flex items-center">
            <input type="checkbox" id="checkbox-demo" class="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0">
            <label for="checkbox-demo" class="ml-2 text-sm text-gray-300">Checkbox option</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards Section -->
    <div id="cards" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Cards</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Basic Card -->
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Basic Card</h3>
          <p class="text-gray-300">This is a standard card component with glass morphism styling.</p>
        </div>

        <!-- Interactive Card -->
        <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 hover:shadow-3xl hover:scale-[1.02] transition-all cursor-pointer">
          <h3 class="text-lg font-semibold text-white mb-4">Interactive Card</h3>
          <p class="text-gray-300">This card has hover effects with scale and shadow changes.</p>
        </div>

        <!-- Status Card -->
        <div class="backdrop-blur-xl bg-green-500/10 rounded-3xl border border-green-500/20 shadow-2xl p-6">
          <h3 class="text-lg font-semibold text-green-300 mb-4">Status Card</h3>
          <p class="text-green-200">This card shows status-specific styling with success colors.</p>
        </div>
      </div>
    </div>

    <!-- Tables Section -->
    <div id="tables" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Table Components</h2>
      
      <!-- Table Container -->
      <div class="backdrop-blur-md bg-black/20 rounded-xl border border-white/10 shadow-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-white/5">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group">
                <div class="flex items-center space-x-1">
                  <span>Name</span>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">Sample Item 1</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  Published
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                Dec 27, 2024
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <button class="text-blue-300 hover:text-blue-200 transition-colors">Edit</button>
                <button class="text-red-300 hover:text-red-200 transition-colors">Delete</button>
              </td>
            </tr>
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">Sample Item 2</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                  Draft
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                Dec 26, 2024
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <button class="text-blue-300 hover:text-blue-200 transition-colors">Edit</button>
                <button class="text-red-300 hover:text-red-200 transition-colors">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Alerts Section -->
    <div id="alerts" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Alerts & Notifications</h2>
      
      <div class="space-y-4">
        <!-- Success Alert -->
        <div class="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h5 class="text-sm font-medium text-green-300">Success</h5>
              <p class="text-sm text-green-200 mt-1">Operation completed successfully.</p>
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h5 class="text-sm font-medium text-red-300">Error</h5>
              <p class="text-sm text-red-200 mt-1">Something went wrong. Please try again.</p>
            </div>
          </div>
        </div>

        <!-- Warning Alert -->
        <div class="backdrop-blur-xl bg-amber-500/20 border border-amber-500/20 rounded-2xl p-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.632 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h5 class="text-sm font-medium text-amber-300">Warning</h5>
              <p class="text-sm text-amber-200 mt-1">Please review this action before proceeding.</p>
            </div>
          </div>
        </div>

        <!-- Info Alert -->
        <div class="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h5 class="text-sm font-medium text-blue-300">Information</h5>
              <p class="text-sm text-blue-200 mt-1">Here's some helpful information about this feature.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacing Section -->
    <div id="spacing" class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Spacing System</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Base Unit: 0.25rem (4px)</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-4 bg-blue-500/30 rounded"></div>
              <span class="text-sm text-gray-300">p-4 (16px)</span>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-24 h-4 bg-blue-500/30 rounded"></div>
              <span class="text-sm text-gray-300">p-6 (24px)</span>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-32 h-4 bg-blue-500/30 rounded"></div>
              <span class="text-sm text-gray-300">p-8 (32px)</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-white mb-4">Common Spacing Values</h3>
          <div class="bg-black/20 rounded-xl p-4">
            <code class="text-xs text-gray-300">
              space-y-6     /* 24px - Between major sections */<br>
              space-y-4     /* 16px - Between form fields */<br>
              space-x-3     /* 12px - Horizontal spacing */<br>
              p-8           /* 32px - Large container padding */<br>
              p-6           /* 24px - Medium container padding */<br>
              p-4           /* 16px - Small container padding */
            </code>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State Example -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Empty State</h2>
      
      <div class="text-center py-16">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">No items found</h3>
        <p class="text-gray-300 mb-6">Get started by creating your first item.</p>
        <button class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium">
          Create New Item
        </button>
      </div>
    </div>
  `

  const layoutData: AdminLayoutData = {
    title: 'Design System',
    pageTitle: 'Design System',
    currentPath: '/admin/design',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}