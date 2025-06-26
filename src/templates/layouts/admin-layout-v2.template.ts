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
  <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          backdropBlur: {
            xs: '2px',
          },
          colors: {
            primary: '#465FFF',
            secondary: '#212A3E',
            dark: '#1C1C24',
            'dark-2': '#1A1A27',
            'dark-3': '#2C2C54',
            'dark-4': '#40407A',
            'dark-5': '#706FD3',
            'gray-1': '#F7F9FC',
            'gray-2': '#E4E6EA',
            'gray-3': '#D2D4D9',
            'gray-4': '#9CA3AF',
            'gray-5': '#6B7280',
            'gray-6': '#4B5563',
            'gray-7': '#374151',
            'gray-8': '#1F2937',
            'gray-9': '#111827',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          },
          fontFamily: {
            satoshi: ['Satoshi', 'sans-serif'],
          },
          spacing: {
            '4.5': '1.125rem',
            '5.5': '1.375rem',
            '6.5': '1.625rem',
            '7.5': '1.875rem'
          },
          boxShadow: {
            'default': '0px 8px 13px -3px rgba(0, 0, 0, 0.07)',
            'card': '0px 1px 3px rgba(0, 0, 0, 0.12)',
            'card-2': '0px 1px 2px rgba(0, 0, 0, 0.05)',
            'switcher': '0px 2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 2px #FFFFFF, inset 0px -1px 1px rgba(0, 0, 0, 0.1)',
          },
          dropShadow: {
            1: '0px 1px 0px #E2E8F0',
            2: '0px 1px 4px rgba(0, 0, 0, 0.12)',
          }
        }
      }
    }
  </script>
  
  <!-- Additional Styles -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #1F2937;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #465FFF;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #3B4EE8;
    }
    
    /* Sidebar animations */
    .sidebar-item {
      transition: all 0.3s ease;
    }
    
    .sidebar-item:hover {
      transform: translateX(4px);
    }
    
    /* Card animations */
    .card-hover {
      transition: all 0.3s ease;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* Button gradients */
    .btn-gradient {
      background: linear-gradient(135deg, #465FFF 0%, #9333EA 100%);
    }
    
    .btn-gradient:hover {
      background: linear-gradient(135deg, #3B4EE8 0%, #7C2D12 100%);
    }
    
    /* Dark mode form elements */
    .form-input {
      background-color: #1F2937;
      border-color: #374151;
      color: #F9FAFB;
    }
    
    .form-input:focus {
      border-color: #465FFF;
      box-shadow: 0 0 0 3px rgba(70, 95, 255, 0.1);
    }
    
    /* Notification styles */
    .notification {
      animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  </style>
  
  <!-- Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  
  ${data.styles ? data.styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n  ') : ''}
  ${data.scripts ? data.scripts.map(script => `<script src="${script}"></script>`).join('\n  ') : ''}
</head>
<body class="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 min-h-screen text-gray-1">
  <!-- Background overlay with glass effect -->
  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
  <div class="relative z-10 flex h-screen overflow-hidden">
    ${renderSidebar(data.currentPath, data.user)}
    
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      ${renderTopBar(data.pageTitle, data.user)}
      
      <!-- Main Content -->
      <main class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        ${data.content}
      </main>
    </div>
  </div>
  
  <!-- Notification Container -->
  <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>
  
  <script>
    // Dark mode toggle functionality
    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    }
    
    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
    
    // Sidebar toggle for mobile
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    }
    
    // Close sidebar on overlay click
    function closeSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      const colors = {
        success: 'bg-success text-white',
        error: 'bg-error text-white',
        warning: 'bg-warning text-white',
        info: 'bg-info text-white'
      };
      
      notification.className = \`notification px-6 py-4 rounded-lg shadow-lg \${colors[type] || colors.info} max-w-sm\`;
      notification.innerHTML = \`
        <div class="flex items-center justify-between">
          <span>\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      \`;
      
      container.appendChild(notification);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
  </script>
</body>
</html>`
}

function renderSidebar(currentPath: string, user?: any): string {
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v4"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4"/>
      </svg>`
    },
    {
      label: 'Content',
      path: '/admin/content',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`
    },
    {
      label: 'Collections',
      path: '/admin/collections',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`
    },
    {
      label: 'Media',
      path: '/admin/media',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>`
    },
    {
      label: 'Email',
      path: '/admin/email',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>`
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>`
    },
    {
      label: 'FAQ',
      path: '/admin/faq',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`
    },
    {
      label: 'Documentation',
      path: '/docs',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>`
    }
  ]

  return `
    <!-- Sidebar overlay for mobile -->
    <div 
      id="sidebar-overlay" 
      class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden hidden"
      onclick="closeSidebar()"
    ></div>
    
    <!-- Sidebar -->
    <aside 
      id="sidebar"
      class="absolute left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-y-hidden backdrop-blur-md bg-black/30 border-r border-white/10 shadow-xl duration-300 ease-linear lg:static lg:translate-x-0 -translate-x-full"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <div class="flex items-center gap-2">
          ${renderLogo({ size: 'md', showText: true, variant: 'white' })}
        </div>
        
        <button 
          onclick="toggleSidebar()"
          class="block lg:hidden"
        >
          <svg class="w-6 h-6 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Sidebar Menu -->
      <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul class="mb-6 flex flex-col gap-1.5">
              ${menuItems.map(item => {
                const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path))
                return `
                  <li>
                    <a 
                      href="${item.path}"
                      class="sidebar-item group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-white/10 hover:text-white transition-all ${isActive ? 'bg-white/20 text-white' : ''}"
                    >
                      ${item.icon}
                      ${item.label}
                      ${isActive ? `
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-lg"></div>
                      ` : ''}
                    </a>
                  </li>
                `
              }).join('')}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  `
}

function renderTopBar(pageTitle: string, user?: any): string {
  return `
    <!-- Top Bar -->
    <header class="sticky top-0 z-30 flex w-full backdrop-blur-md bg-white/10 drop-shadow-1 shadow-lg border-b border-white/20">
      <div class="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Sidebar Toggle -->
          <button 
            onclick="toggleSidebar()"
            class="z-50 block rounded-sm border border-gray-6 bg-gray-7 p-1.5 shadow-sm lg:hidden"
          >
            <svg class="w-5 h-5 text-gray-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          
          <!-- Page Title -->
          <h1 class="text-2xl font-semibold text-gray-1">${pageTitle}</h1>
        </div>
        
        <div class="flex items-center gap-3 2xsm:gap-7">
          <!-- Dark Mode Toggle -->
          <div class="flex items-center gap-2">
            <button 
              onclick="toggleDarkMode()"
              class="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-6 bg-gray-7 text-gray-3 hover:text-white"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
          </div>
          
          <!-- Notifications -->
          <div class="relative">
            <button class="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-6 bg-gray-7 text-gray-3 hover:text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-error">
                <span class="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
              </span>
            </button>
          </div>
          
          <!-- User Dropdown -->
          ${user ? `
            <div class="relative" x-data="{ open: false }">
              <button 
                @click="open = !open"
                class="flex items-center gap-3 text-sm"
              >
                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">${user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span class="hidden text-gray-1 lg:block">${user.name}</span>
                <svg class="w-4 h-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div 
                x-show="open"
                @click.away="open = false"
                x-transition:enter="transition ease-out duration-100"
                x-transition:enter-start="transform opacity-0 scale-95"
                x-transition:enter-end="transform opacity-100 scale-100"
                x-transition:leave="transition ease-in duration-75"
                x-transition:leave-start="transform opacity-100 scale-100"
                x-transition:leave-end="transform opacity-0 scale-95"
                class="absolute right-0 mt-2 w-48 backdrop-blur-md bg-black/40 rounded-xl border border-white/10 shadow-xl py-1.5 z-[9999]"
              >
                <div class="px-4 py-2 border-b border-white/10">
                  <p class="text-sm font-medium text-gray-1">${user.name}</p>
                  <p class="text-xs text-gray-4">${user.email}</p>
                </div>
                <a href="/admin/profile" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </a>
                <a href="/admin/settings" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Settings
                </a>
                <a href="/auth/logout" class="flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </a>
              </div>
            </div>
          ` : `
            <a href="/auth/login" class="btn-gradient px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all">
              Sign In
            </a>
          `}
        </div>
      </div>
    </header>
  `
}