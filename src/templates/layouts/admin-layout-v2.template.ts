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
    
    /* Custom slider styles */
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #465FFF;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #465FFF;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-webkit-slider-track {
      height: 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .slider::-moz-range-track {
      height: 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
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
  <div id="background-overlay" class="fixed inset-0 backdrop-blur-sm" style="background-color: rgba(0, 0, 0, 0.2);"></div>
  <!-- Main container -->
  <div class="relative z-10 min-h-screen">
    <!-- Header -->
    ${renderTopBar(data.pageTitle, data.user)}
    
    <!-- Main content area -->
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          ${renderSidebar(data.currentPath, data.user)}
        </div>
        
        <!-- Main content -->
        <div class="lg:col-span-4">
          ${data.content}
        </div>
      </div>
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
    
    // User dropdown toggle
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      dropdown.classList.toggle('hidden');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('userDropdown');
      const button = event.target.closest('button');
      if (!button || !button.getAttribute('onclick')) {
        dropdown.classList.add('hidden');
      }
    });
    
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
    
    // Background customizer functionality
    function toggleBackgroundCustomizer() {
      const dropdown = document.getElementById('backgroundCustomizer');
      dropdown.classList.toggle('hidden');
    }
    
    // Background themes
    const backgroundThemes = {
      'default': 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800',
      'cosmic-blue': 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      'matrix-green': 'bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900',
      'cyber-pink': 'bg-gradient-to-br from-gray-900 via-pink-900 to-rose-900',
      'neon-orange': 'bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900',
      'deep-space': 'bg-gradient-to-br from-slate-900 via-gray-900 to-black'
    };
    
    // Set background theme
    function setBackground(theme) {
      const body = document.body;
      
      // Remove all existing background classes
      Object.values(backgroundThemes).forEach(bgClass => {
        body.classList.remove(...bgClass.split(' ').slice(1)); // Remove 'bg-gradient-to-br' prefix
      });
      
      // Add new background classes
      const newClasses = backgroundThemes[theme].split(' ').slice(1); // Remove 'bg-gradient-to-br' prefix
      body.classList.add('bg-gradient-to-br', ...newClasses);
      
      // Save preference
      localStorage.setItem('backgroundTheme', theme);
      
      // Close dropdown
      toggleBackgroundCustomizer();
      
      // Show notification
      showNotification('Background changed to ' + theme.replace('-', ' '), 'success');
    }
    
    // Adjust background darkness
    function adjustDarkness(value) {
      const overlay = document.getElementById('background-overlay');
      if (overlay) {
        const opacity = value / 100; // Convert percentage to decimal
        overlay.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
        localStorage.setItem('backgroundDarkness', value);
        console.log('Darkness adjusted to:', value + '%', 'Opacity:', opacity);
      } else {
        console.log('Overlay element not found');
      }
    }
    
    // Initialize background on page load
    function initializeBackground() {
      const savedTheme = localStorage.getItem('backgroundTheme') || 'default';
      const savedDarkness = localStorage.getItem('backgroundDarkness') || '20';
      
      // Set background theme
      if (savedTheme !== 'default') {
        const body = document.body;
        Object.values(backgroundThemes).forEach(bgClass => {
          body.classList.remove(...bgClass.split(' ').slice(1));
        });
        const newClasses = backgroundThemes[savedTheme].split(' ').slice(1);
        body.classList.add('bg-gradient-to-br', ...newClasses);
      }
      
      // Set darkness
      const overlay = document.getElementById('background-overlay');
      if (overlay) {
        const opacity = savedDarkness / 100;
        overlay.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
      }
      
      // Set slider value
      const slider = document.getElementById('darknessSlider');
      if (slider) {
        slider.value = savedDarkness;
      }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('backgroundCustomizer');
      const button = event.target.closest('button');
      const slider = event.target.closest('#darknessSlider');
      const dropdownContainer = event.target.closest('#backgroundCustomizer');
      
      // Don't close if clicking inside the dropdown, on the toggle button, or on the slider
      if (!button?.getAttribute('onclick')?.includes('toggleBackgroundCustomizer') && 
          !slider && !dropdownContainer) {
        dropdown?.classList.add('hidden');
      }
    });
    
    // Initialize background when page loads
    document.addEventListener('DOMContentLoaded', initializeBackground);
  </script>
</body>
</html>`
}

function renderSidebar(currentPath: string, user?: any): string {
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`
    },
    {
      label: 'Content',
      path: '/admin/content',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`
    },
    {
      label: 'Collections',
      path: '/admin/collections',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
      </svg>`
    },
    {
      label: 'Media',
      path: '/admin/media',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
      </svg>`
    },
    {
      label: 'FAQ',
      path: '/admin/faq',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: 'Plugins',
      path: '/admin/plugins',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`
    },
    {
      label: 'Design',
      path: '/admin/design',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
      </svg>`
    },
    {
      label: 'Settings',
      path: '/admin/settings',
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: 'API Reference',
      path: '/admin/api-reference',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>`
    }
  ]

  return `
    <nav class="backdrop-blur-md bg-black/30 rounded-xl border border-white/10 shadow-xl p-6 h-[calc(100vh-9.5rem)] sticky top-8">
      <div class="space-y-4">
        ${menuItems.map(item => {
          const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path))
          return `
            <a href="${item.path}" class="flex items-center space-x-3 ${isActive ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'} rounded-lg px-3 py-2 transition-all hover:bg-white/10">
              ${item.icon}
              <span>${item.label}</span>
            </a>
          `
        }).join('')}
      </div>
    </nav>
  `
}

function renderTopBar(pageTitle: string, user?: any): string {
  return `
    <header class="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg relative z-[9998]">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            ${renderLogo({ size: 'md', showText: true, variant: 'white' })}
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>

            <!-- Background Customizer -->
            <div class="relative z-[9999]">
              <button class="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10" onclick="toggleBackgroundCustomizer()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
                </svg>
              </button>
              
              <!-- Background Customizer Dropdown -->
              <div id="backgroundCustomizer" class="hidden absolute right-0 mt-2 w-80 backdrop-blur-md bg-black/95 rounded-xl border border-white/10 shadow-xl z-[9999]">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">Background Themes</h3>
                    <button onclick="toggleBackgroundCustomizer()" class="text-gray-400 hover:text-white">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Background Options -->
                  <div class="space-y-3 mb-6">
                    <div class="grid grid-cols-2 gap-3">
                      <!-- Default -->
                      <button onclick="setBackground('default')" class="bg-preview bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Default</div>
                      </button>
                      
                      <!-- Cosmic Blue -->
                      <button onclick="setBackground('cosmic-blue')" class="bg-preview bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Cosmic</div>
                      </button>
                      
                      <!-- Matrix Green -->
                      <button onclick="setBackground('matrix-green')" class="bg-preview bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Matrix</div>
                      </button>
                      
                      <!-- Cyber Pink -->
                      <button onclick="setBackground('cyber-pink')" class="bg-preview bg-gradient-to-br from-gray-900 via-pink-900 to-rose-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Cyber</div>
                      </button>
                      
                      <!-- Neon Orange -->
                      <button onclick="setBackground('neon-orange')" class="bg-preview bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Neon</div>
                      </button>
                      
                      <!-- Deep Space -->
                      <button onclick="setBackground('deep-space')" class="bg-preview bg-gradient-to-br from-slate-900 via-gray-900 to-black h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Space</div>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Darkness Slider -->
                  <div class="space-y-3">
                    <label class="block text-sm font-medium text-white">Background Darkness</label>
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
                      </svg>
                      <input 
                        type="range" 
                        id="darknessSlider" 
                        min="10" 
                        max="60" 
                        value="20" 
                        class="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        oninput="adjustDarkness(this.value)"
                        onchange="adjustDarkness(this.value)"
                      >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                      </svg>
                    </div>
                    <div class="text-xs text-gray-400 text-center">Adjust overlay darkness</div>
                  </div>
                </div>
              </div>
            </div>
          
            <!-- User Dropdown -->
            ${user ? `
              <div class="relative z-[9999]">
                <button class="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors group" onclick="toggleUserDropdown()">
                  <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">${user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div class="hidden md:block text-left">
                    <div class="text-white text-sm font-medium">${user.name}</div>
                    <div class="text-gray-400 text-xs">${user.role || 'Administrator'}</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 backdrop-blur-md bg-black/95 rounded-xl border border-white/10 shadow-xl z-[9999]">
                  <div class="py-2">
                    <div class="px-4 py-2 border-b border-white/10">
                      <p class="text-sm font-medium text-gray-1">${user.name}</p>
                      <p class="text-xs text-gray-4">${user.email || ''}</p>
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
              </div>
            ` : `
              <a href="/auth/login" class="backdrop-blur-md bg-white/10 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
                Sign In
              </a>
            `}
        </div>
      </div>
    </header>
  `
}