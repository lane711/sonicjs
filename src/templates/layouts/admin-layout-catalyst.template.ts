import { HtmlEscapedString } from "hono/utils/html";
import { renderLogo } from "../components/logo.template";

export interface AdminLayoutCatalystData {
  title: string;
  pageTitle?: string;
  currentPath?: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  scripts?: string[];
  styles?: string[];
  content: string | HtmlEscapedString;
  dynamicMenuItems?: Array<{
    label: string;
    path: string;
    icon: string;
  }>;
}

export function renderAdminLayoutCatalyst(
  data: AdminLayoutCatalystData
): string {
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
          colors: {
            zinc: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
              950: '#09090b'
            }
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
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #27272a;
    }

    ::-webkit-scrollbar-thumb {
      background: #52525b;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #71717a;
    }

    /* Smooth transitions */
    * {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  </style>

  <!-- Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

  ${
    data.styles
      ? data.styles
          .map((style) => `<link rel="stylesheet" href="${style}">`)
          .join("\n  ")
      : ""
  }
  ${
    data.scripts
      ? data.scripts
          .map((script) => `<script src="${script}"></script>`)
          .join("\n  ")
      : ""
  }
</head>
<body class="min-h-screen bg-white dark:bg-zinc-900">
  <div class="relative isolate flex min-h-svh w-full max-lg:flex-col lg:bg-zinc-100 dark:lg:bg-zinc-950">
    <!-- Sidebar on desktop -->
    <div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
      ${renderCatalystSidebar(
        data.currentPath,
        data.user,
        data.dynamicMenuItems
      )}
    </div>

    <!-- Mobile sidebar (hidden by default) -->
    <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-black/30 lg:hidden hidden z-40" onclick="closeMobileSidebar()"></div>
    <div id="mobile-sidebar" class="fixed inset-y-0 left-0 w-80 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden z-50">
      ${renderCatalystSidebar(
        data.currentPath,
        data.user,
        data.dynamicMenuItems,
        true
      )}
    </div>

    <!-- Main content area -->
    <main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pr-2 lg:pl-64">
      <!-- Mobile header with menu toggle -->
      <header class="flex items-center px-4 py-2.5 lg:hidden border-b border-zinc-950/5 dark:border-white/5">
        <button onclick="openMobileSidebar()" class="relative flex items-center justify-center rounded-lg p-2 text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5" aria-label="Open navigation">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
          </svg>
        </button>
        <div class="ml-4 flex-1">
          ${renderLogo({ size: "sm", showText: true, variant: "white" })}
        </div>
      </header>

      <!-- Content -->
      <div class="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        ${data.content}
      </div>
    </main>
  </div>

  <!-- Notification Container -->
  <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <script>
    // Mobile sidebar toggle
    function openMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    }

    function closeMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
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
      const button = event.target.closest('[data-user-menu]');
      if (!button && dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Show notification
    function showNotification(message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      const colors = {
        success: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20',
        error: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20',
        warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
        info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20'
      };

      notification.className = \`rounded-lg p-4 ring-1 \${colors[type] || colors.info} max-w-sm shadow-lg\`;
      notification.innerHTML = \`
        <div class="flex items-center justify-between">
          <span class="text-sm">\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70">
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

    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'false') {
      document.documentElement.classList.remove('dark');
    }
  </script>
</body>
</html>`;
}

function renderCatalystSidebar(
  currentPath: string = "",
  user?: any,
  dynamicMenuItems?: Array<{ label: string; path: string; icon: string }>,
  isMobile: boolean = false
): string {
  const baseMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`,
    },
    {
      label: "Collections",
      path: "/admin/collections",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
      </svg>`,
    },
    {
      label: "Content",
      path: "/admin/content",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
      </svg>`,
    },
    {
      label: "Media",
      path: "/admin/media",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
      </svg>`,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>`,
    },
    {
      label: "Workflow",
      path: "/admin/workflow/dashboard",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>`,
    },
    {
      label: "Plugins",
      path: "/admin/plugins",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`,
    },
    {
      label: "Design",
      path: "/admin/design",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"/>
      </svg>`,
    },
    {
      label: "Logs",
      path: "/admin/logs",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>`,
    },
    {
      label: "API Reference",
      path: "/admin/api-reference",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>`,
    },
    {
      label: "Field Types",
      path: "/admin/field-types",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>`,
    },
  ];

  // Combine base menu items with dynamic menu items
  const allMenuItems = [...baseMenuItems];
  if (dynamicMenuItems && dynamicMenuItems.length > 0) {
    const workflowIndex = allMenuItems.findIndex(
      (item) => item.path === "/admin/workflow/dashboard"
    );
    if (workflowIndex !== -1) {
      allMenuItems.splice(workflowIndex, 0, ...dynamicMenuItems);
    }
  }

  const closeButton = isMobile
    ? `
    <div class="-mb-3 px-4 pt-3">
      <button onclick="closeMobileSidebar()" class="relative flex w-full items-center gap-3 rounded-lg p-2 text-left text-base/6 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5 sm:text-sm/5" aria-label="Close navigation">
        <svg class="h-5 w-5 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
        <span>Close menu</span>
      </button>
    </div>
  `
    : "";

  return `
    <nav class="flex h-full min-h-0 flex-col bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 ${
      isMobile ? "rounded-lg p-2 m-2" : ""
    }">
      ${closeButton}

      <!-- Sidebar Header -->
      <div class="flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5">
        ${renderLogo({ size: "md", showText: true, variant: "white" })}
      </div>

      <!-- Sidebar Body -->
      <div class="flex flex-1 flex-col overflow-y-auto p-4">
        <div class="flex flex-col gap-0.5">
          ${allMenuItems
            .map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== "/admin" && currentPath?.startsWith(item.path));
              return `
              <span class="relative">
                ${
                  isActive
                    ? `
                  <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-zinc-950 dark:bg-white"></span>
                `
                    : ""
                }
                <a
                  href="${item.path}"
                  class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium ${
                    isActive
                      ? "text-zinc-950 dark:text-white"
                      : "text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"
                  }"
                  ${isActive ? 'data-current="true"' : ""}
                >
                  <span class="shrink-0 ${
                    isActive
                      ? "fill-zinc-950 dark:fill-white"
                      : "fill-zinc-500 dark:fill-zinc-400"
                  }">
                    ${item.icon}
                  </span>
                  <span class="truncate">${item.label}</span>
                </a>
              </span>
            `;
            })
            .join("")}
        </div>
      </div>

      <!-- Sidebar Footer (User) -->
      ${
        user
          ? `
        <div class="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5">
          <div class="relative">
            <button
              data-user-menu
              onclick="toggleUserDropdown()"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <span class="text-xs font-semibold">${(
                  user.name ||
                  user.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}</span>
              </div>
              <span class="flex-1 truncate">${
                user.name || user.email || "User"
              }</span>
              <svg class="h-4 w-4 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>

            <!-- User Dropdown -->
            <div id="userDropdown" class="hidden absolute bottom-full mb-2 left-0 right-0 mx-2 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10 z-50">
              <div class="p-2">
                <div class="px-3 py-2 border-b border-zinc-950/5 dark:border-white/5">
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">${
                    user.name || user.email || "User"
                  }</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">${
                    user.email || ""
                  }</p>
                </div>
                <a href="/admin/profile" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </a>
                <a href="/admin/settings" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Settings
                </a>
                <a href="/auth/logout" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      `
          : ""
      }
    </nav>
  `;
}
