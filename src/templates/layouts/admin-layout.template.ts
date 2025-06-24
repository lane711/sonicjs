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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - SonicJS AI Admin</title>
  
  <!-- Core Styles -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  
  <!-- Custom Styles -->
  <style>
    .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
    .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
    .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300; }
    .btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
    .btn-warning { @apply bg-yellow-600 text-white hover:bg-yellow-700; }
    .btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
    .btn-sm { @apply px-2 py-1 text-sm; }
    .form-input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500; }
    .form-textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500; }
    .form-label { @apply block text-sm font-medium text-gray-700 mb-2; }
    .form-group { @apply mb-6; }
  </style>
  
  <!-- Additional Styles -->
  ${data.styles ? data.styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n  ') : ''}
  
  <!-- Core Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
  
  <!-- Additional Scripts -->
  ${data.scripts ? data.scripts.map(script => `<script src="${script}"></script>`).join('\n  ') : ''}
</head>
<body class="bg-gray-50">
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
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            ${renderLogo({ size: 'md', showText: true })}
            <h1 class="text-2xl font-bold text-gray-900">${data.pageTitle}</h1>
            <nav class="flex space-x-4">
              ${navItems.map(item => `
                <a href="${item.path}" class="${data.currentPath.startsWith(item.path) ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}">
                  ${item.label}
                </a>
              `).join('')}
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            ${data.user ? `
              <div class="relative group">
                <button class="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">${data.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span class="text-sm">${data.user.name}</span>
                </button>
                
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-700 border-b">
                      <div class="font-medium">${data.user.name}</div>
                      <div class="text-gray-500">${data.user.email}</div>
                    </div>
                    <a href="/admin/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="/admin/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <a href="/auth/logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                  </div>
                </div>
              </div>
            ` : `
              <a href="/auth/login" class="btn btn-primary">Login</a>
            `}
          </div>
        </div>
      </div>
    </header>
  `
}