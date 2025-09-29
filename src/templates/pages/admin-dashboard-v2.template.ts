import {
  AdminLayoutData,
  renderAdminLayout,
} from "../layouts/admin-layout-v2.template";

export interface DashboardStats {
  collections: number;
  contentItems: number;
  mediaFiles: number;
  users: number;
  recentActivity?: ActivityItem[];
  analytics?: AnalyticsData;
}

export interface ActivityItem {
  id: string;
  type: "content" | "media" | "user" | "collection";
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  contentPublished: number;
  mediaUploaded: number;
  weeklyGrowth: {
    pageViews: number;
    visitors: number;
    content: number;
    media: number;
  };
}

export interface DashboardPageData {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  stats?: DashboardStats;
}

export function renderDashboardPage(data: DashboardPageData): string {
  const pageContent = `
    <div class="mb-8">
      <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Dashboard</h1>
      <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Welcome to your SonicJS AI admin dashboard</p>
    </div>

    <!-- Stats Cards -->
    <dl
      id="stats-container"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8"
      hx-get="/admin/api/stats"
      hx-trigger="load"
      hx-swap="innerHTML"
    >
      ${renderStatsCardsSkeleton()}
    </dl>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-8">
      <!-- Analytics Chart -->
      <div class="xl:col-span-2">
        ${renderAnalyticsChart()}
      </div>

      <!-- Recent Activity -->
      <div class="xl:col-span-1">
        ${renderRecentActivity()}
      </div>
    </div>

    <!-- Secondary Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Quick Actions -->
      ${renderQuickActions()}

      <!-- System Status -->
      ${renderSystemStatus()}

      <!-- Storage Usage -->
      ${renderStorageUsage()}
    </div>

    <script>
      function refreshDashboard() {
        htmx.trigger('#stats-container', 'htmx:load');
        showNotification('Dashboard refreshed', 'success');
      }
    </script>
  `;

  const layoutData: AdminLayoutData = {
    title: "Dashboard",
    pageTitle: "Dashboard",
    currentPath: "/admin",
    user: data.user,
    content: pageContent,
  };

  return renderAdminLayout(layoutData);
}

export function renderDashboardPageWithDynamicMenu(
  data: DashboardPageData,
  dynamicMenuItems: Array<{ label: string; path: string; icon: string }>
): string {
  const pageContent = `
    <div class="mb-8">
      <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Dashboard</h1>
      <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Welcome to your SonicJS AI admin dashboard</p>
    </div>

    <dl id="stats-container" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8" hx-get="/admin/api/stats" hx-trigger="load">
      ${renderStatsCards({
        collections: 0,
        contentItems: 0,
        mediaFiles: 0,
        users: 0,
      })}
    </dl>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-8">
      <!-- Analytics Chart -->
      <div class="xl:col-span-2">
        ${renderAnalyticsChart()}
      </div>

      <!-- Recent Activity -->
      <div class="xl:col-span-1">
        ${renderRecentActivity()}
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Quick Actions -->
      ${renderQuickActions()}

      <!-- System Status -->
      ${renderSystemStatus()}

      <!-- Storage Usage -->
      ${renderStorageUsage()}
    </div>

    <script>
      function refreshDashboard() {
        htmx.trigger('#stats-container', 'htmx:load');
        showNotification('Dashboard refreshed', 'success');
      }
    </script>
  `;

  const layoutData: AdminLayoutData = {
    title: "Dashboard",
    pageTitle: "Dashboard",
    currentPath: "/admin",
    user: data.user,
    content: pageContent,
    dynamicMenuItems,
  };

  return renderAdminLayout(layoutData);
}

export function renderStatsCards(stats: DashboardStats): string {
  const cards = [
    {
      title: "Total Collections",
      value: stats.collections.toString(),
      change: "+12.5%",
      isPositive: true,
    },
    {
      title: "Content Items",
      value: stats.contentItems.toString(),
      change: "+8.2%",
      isPositive: true,
    },
    {
      title: "Media Files",
      value: stats.mediaFiles.toString(),
      change: "+15.3%",
      isPositive: true,
    },
    {
      title: "Active Users",
      value: stats.users.toString(),
      change: "-2.4%",
      isPositive: false,
    },
  ];

  return cards
    .map(
      (card) => `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <dt class="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">${card.title}</dt>
      <dd class="mt-3 flex items-baseline gap-x-2">
        <span class="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">${card.value}</span>
        <span class="text-sm ${card.isPositive ? 'text-lime-600 dark:text-lime-400' : 'text-pink-600 dark:text-pink-400'}">${card.change}</span>
      </dd>
    </div>
  `
    )
    .join("");
}

function renderStatsCardsSkeleton(): string {
  return Array(4)
    .fill(0)
    .map(
      () => `
        <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 animate-pulse">
          <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-3"></div>
          <div class="h-10 w-20 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        </div>
      `
    )
    .join("");
}

function renderAnalyticsChart(): string {
  return `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
        <div class="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
          <div>
            <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white">Analytics Overview</h3>
            <p class="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">Last 7 days activity</p>
          </div>
          <div class="inline-flex gap-1 rounded-lg bg-zinc-950/5 dark:bg-white/5 p-1">
            <button class="rounded-md bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs/5 font-medium text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
              Day
            </button>
            <button class="px-2.5 py-1.5 text-xs/5 font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
              Week
            </button>
            <button class="px-2.5 py-1.5 text-xs/5 font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
              Month
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-6">
        <div id="chartOne" class="flex h-60 w-full items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Analytics Chart (Chart.js integration needed)</p>
        </div>
      </div>
    </div>
  `;
}

function renderRecentActivity(): string {
  const activities = [
    {
      type: "content",
      description: "New blog post published",
      user: "John Doe",
      time: "2 minutes ago",
      initials: "JD",
      bgColor: "bg-lime-500/10 dark:bg-lime-400/10",
      textColor: "text-lime-700 dark:text-lime-300",
    },
    {
      type: "media",
      description: "Image uploaded to gallery",
      user: "Jane Smith",
      time: "5 minutes ago",
      initials: "JS",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-400/10",
      textColor: "text-cyan-700 dark:text-cyan-300",
    },
    {
      type: "user",
      description: "New user account created",
      user: "Mike Wilson",
      time: "10 minutes ago",
      initials: "MW",
      bgColor: "bg-pink-500/10 dark:bg-pink-400/10",
      textColor: "text-pink-700 dark:text-pink-300",
    },
  ];

  return `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
        <div class="flex items-center justify-between">
          <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white">Recent Activity</h3>
          <button class="text-xs/5 font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors">
            View all
          </button>
        </div>
      </div>

      <div class="px-6 py-6">
        <ul role="list" class="space-y-6">
          ${activities
            .map(
              (activity) => `
            <li class="relative flex gap-x-4">
              <div class="flex h-10 w-10 flex-none items-center justify-center rounded-full ${activity.bgColor}">
                <span class="text-xs font-semibold ${activity.textColor}">${activity.initials}</span>
              </div>
              <div class="flex-auto">
                <p class="text-sm/6 font-medium text-zinc-950 dark:text-white">${activity.description}</p>
                <p class="mt-1 text-xs/5 text-zinc-500 dark:text-zinc-400">
                  <span class="font-medium text-zinc-950 dark:text-white">${activity.user}</span>
                  <span class="text-zinc-400 dark:text-zinc-500"> · </span>
                  ${activity.time}
                </p>
              </div>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;
}

function renderQuickActions(): string {
  const actions = [
    {
      title: "Create Content",
      description: "Add new blog post or page",
      href: "/admin/content/new",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>`,
    },
    {
      title: "Upload Media",
      description: "Add images and files",
      href: "/admin/media",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>`,
    },
    {
      title: "Manage Users",
      description: "Add or edit user accounts",
      href: "/admin/users",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>`,
    },
  ];

  return `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
        <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white">Quick Actions</h3>
      </div>

      <div class="p-6">
        <div class="space-y-2">
          ${actions
            .map(
              (action) => `
            <a href="${action.href}" class="group flex items-center gap-x-3 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div class="flex h-10 w-10 flex-none items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400">
                ${action.icon}
              </div>
              <div class="flex-auto">
                <p class="text-sm/6 font-medium text-zinc-950 dark:text-white">${action.title}</p>
                <p class="text-xs/5 text-zinc-500 dark:text-zinc-400">${action.description}</p>
              </div>
              <svg class="h-5 w-5 flex-none text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
              </svg>
            </a>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderSystemStatus(): string {
  const statusItems = [
    {
      label: "Database",
      status: "Operational",
      color: "bg-lime-500 dark:bg-lime-400",
      textColor: "text-lime-700 dark:text-lime-300",
    },
    {
      label: "File Storage",
      status: "Operational",
      color: "bg-lime-500 dark:bg-lime-400",
      textColor: "text-lime-700 dark:text-lime-300",
    },
    {
      label: "CDN",
      status: "Operational",
      color: "bg-lime-500 dark:bg-lime-400",
      textColor: "text-lime-700 dark:text-lime-300",
    },
    {
      label: "Email Service",
      status: "Maintenance",
      color: "bg-amber-500 dark:bg-amber-400",
      textColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  return `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
        <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white">System Status</h3>
      </div>

      <div class="px-6 py-6">
        <dl class="space-y-4">
          ${statusItems
            .map(
              (item) => `
            <div class="flex items-center justify-between">
              <dt class="text-sm/6 text-zinc-500 dark:text-zinc-400">${item.label}</dt>
              <dd class="flex items-center gap-2">
                <div class="h-1.5 w-1.5 rounded-full ${item.color}"></div>
                <span class="text-sm/6 font-medium ${item.textColor}">${item.status}</span>
              </dd>
            </div>
          `
            )
            .join("")}
        </dl>
      </div>
    </div>
  `;
}

function renderStorageUsage(): string {
  const storageItems = [
    {
      label: "Database",
      used: "2.3 GB",
      total: "10 GB",
      percentage: 23,
      color: "bg-cyan-500 dark:bg-cyan-400",
    },
    {
      label: "Media Files",
      used: "4.7 GB",
      total: "20 GB",
      percentage: 23.5,
      color: "bg-lime-500 dark:bg-lime-400",
    },
    {
      label: "Backup",
      used: "1.2 GB",
      total: "5 GB",
      percentage: 24,
      color: "bg-pink-500 dark:bg-pink-400",
    },
  ];

  return `
    <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
        <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white">Storage Usage</h3>
      </div>

      <div class="px-6 py-6">
        <dl class="space-y-6">
          ${storageItems
            .map(
              (item) => `
            <div>
              <div class="flex items-center justify-between mb-2">
                <dt class="text-sm/6 text-zinc-500 dark:text-zinc-400">${item.label}</dt>
                <dd class="text-sm/6 font-medium text-zinc-950 dark:text-white">${item.used} / ${item.total}</dd>
              </div>
              <div class="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div class="${item.color} h-full rounded-full transition-all duration-300" style="width: ${item.percentage}%"></div>
              </div>
            </div>
          `
            )
            .join("")}
        </dl>
      </div>
    </div>
  `;
}