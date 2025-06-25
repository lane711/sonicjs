import { renderLogo } from '../components/logo.template'

export interface AdminLayoutData {
  title: string
  pageTitle: string
  currentPath: string
  user?: {
    name: string
    email: string
    role: string
  }
  scripts?: string[]
  styles?: string[]
  content: string
}



export function renderAdminLayout(data: AdminLayoutData): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - SonicJS AI Admin</title>
  
  <!-- Core Styles -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  
  <!-- Custom Styles - Dark Mode -->
  <style>
    /* Base button styles */
    .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
    .btn-primary { 
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
      @apply text-white hover:opacity-90 border-0;
    }
    .btn-secondary { 
      @apply bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600;
    }
    .btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
    .btn-warning { @apply bg-yellow-600 text-white hover:bg-yellow-700; }
    .btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
    .btn-sm { @apply px-2 py-1 text-sm; }
    
    /* Form elements - Dark Mode */
    .form-input { 
      @apply w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400;
      @apply focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent;
    }
    .form-textarea { 
      @apply w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400;
      @apply focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent;
    }
    .form-label { @apply block text-sm font-medium text-gray-300 mb-2; }
    .form-group { @apply mb-6; }
    
    /* Dark mode overrides for EasyMDE */
    .CodeMirror {
      background-color: #1f2937 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
    }
    
    .CodeMirror-cursor {
      border-left: 1px solid #e5e7eb !important;
    }
    
    .editor-toolbar {
      background-color: #374151 !important;
      border-color: #4b5563 !important;
    }
    
    .editor-toolbar button {
      color: #d1d5db !important;
    }
    
    .editor-toolbar button:hover {
      background-color: #4b5563 !important;
    }
    
    /* Dark scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #374151;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
    }
  </style>
  
  <!-- Additional Styles -->
  ${data.styles ? data.styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n  ') : ''}
  
  <!-- Core Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  
  <!-- Additional Scripts -->
  ${data.scripts ? data.scripts.map(script => `<script src="${script}"></script>`).join('\n  ') : ''}
</head>
<body class="bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900 min-h-screen">
  <div class="min-h-screen">
    ${renderAdminHeader({ pageTitle: data.pageTitle, currentPath: data.currentPath, user: data.user })}
    
    <!-- Main Content -->
    ${data.content}
  </div>
</body>
</html>`
}

interface AdminHeaderData {
  pageTitle: string
  currentPath: string
  user?: {
    name: string
    email: string
    role: string
  }
}

function renderAdminHeader(data: AdminHeaderData): string {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/content', label: 'Content' },
    { path: '/admin/collections', label: 'Collections' },
    { path: '/admin/media', label: 'Media' },
    { path: '/admin/users', label: 'Users' },
    { path: '/docs', label: 'Docs' }
  ]

  return `
    <header class="bg-gray-800/80 backdrop-blur-sm shadow-xl border-b border-gray-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            ${renderLogo({ size: 'md', showText: true, variant: 'white' })}
            <h1 class="text-2xl font-bold text-gray-100">${data.pageTitle}</h1>
            <nav class="flex space-x-4">
              ${navItems.map(item => `
                <a href="${item.path}" class="${data.currentPath.startsWith(item.path) ? 'text-purple-400 font-medium' : 'text-gray-300 hover:text-gray-100'}">
                  ${item.label}
                </a>
              `).join('')}
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            ${data.user ? `
              <div class="relative">
                <button 
                  id="user-menu-button"
                  onclick="toggleUserMenu()"
                  class="flex items-center space-x-2 text-gray-300 hover:text-gray-100"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-white">${data.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span class="text-sm">${data.user.name}</span>
                </button>
                
                <div 
                  id="user-menu"
                  class="hidden absolute right-0 mt-2 w-48 bg-gray-800 backdrop-blur-sm rounded-md shadow-xl border border-gray-700 z-50"
                >
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                      <div class="font-medium text-gray-200">${data.user.name}</div>
                      <div class="text-gray-400">${data.user.email}</div>
                    </div>
                    <a href="/admin/profile" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100">Profile</a>
                    <a href="/admin/settings" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100">Settings</a>
                    <a href="/auth/logout" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100">Logout</a>
                  </div>
                </div>
              </div>
              
              <script>
                function toggleUserMenu() {
                  const menu = document.getElementById('user-menu');
                  menu.classList.toggle('hidden');
                }
                
                // Close menu when clicking outside
                document.addEventListener('click', function(event) {
                  const menu = document.getElementById('user-menu');
                  const button = document.getElementById('user-menu-button');
                  
                  if (!button.contains(event.target) && !menu.contains(event.target)) {
                    menu.classList.add('hidden');
                  }
                });
              </script>
            ` : `
              <a href="/auth/login" class="btn btn-primary">Login</a>
            `}
          </div>
        </div>
      </div>
    </header>
  `
}