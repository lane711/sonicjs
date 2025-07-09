import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderTable, TableColumn, TableData } from '../components/table.template'
import { renderPagination, PaginationData } from '../components/pagination.template'
import { renderAlert } from '../components/alert.template'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  isActive: boolean
  lastLoginAt?: number
  createdAt: number
  updatedAt: number
  formattedLastLogin?: string
  formattedCreatedAt?: string
}

export interface UsersListPageData {
  users: User[]
  pagination?: PaginationData
  currentPage: number
  totalPages: number
  totalUsers: number
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderUsersListPage(data: UsersListPageData): string {
  const columns: TableColumn[] = [
    {
      key: 'avatar',
      label: '',
      className: 'w-12',
      sortable: false,
      render: (value: string | null, row: User) => {
        const initials = `${row.firstName.charAt(0)}${row.lastName.charAt(0)}`.toUpperCase()
        if (value) {
          return `<img src="${value}" alt="${row.firstName} ${row.lastName}" class="w-8 h-8 rounded-full">`
        }
        return `
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span class="text-xs font-medium text-white">${initials}</span>
          </div>
        `
      }
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      sortType: 'string',
      render: (value: any, row: User) => {
        const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char] || char))
        
        const truncatedFirstName = row.firstName.length > 25 ? row.firstName.substring(0, 25) + '...' : row.firstName
        const truncatedLastName = row.lastName.length > 25 ? row.lastName.substring(0, 25) + '...' : row.lastName
        const fullName = escapeHtml(`${truncatedFirstName} ${truncatedLastName}`)
        const truncatedUsername = row.username.length > 100 ? row.username.substring(0, 100) + '...' : row.username
        const username = escapeHtml(truncatedUsername)
        const statusBadge = row.isActive ? 
          '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 ml-2">Active</span>' :
          '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 ml-2">Inactive</span>'
        return `
          <div>
            <div class="text-sm font-medium text-white">${fullName}${statusBadge}</div>
            <div class="text-sm text-gray-400">@${username}</div>
          </div>
        `
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      sortType: 'string',
      render: (value: string) => {
        const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char] || char))
        const escapedEmail = escapeHtml(value)
        return `<a href="mailto:${escapedEmail}" class="text-blue-400 hover:text-blue-300">${escapedEmail}</a>`
      }
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      sortType: 'string',
      render: (value: string) => {
        const roleColors = {
          admin: 'bg-red-500/20 text-red-300',
          editor: 'bg-blue-500/20 text-blue-300',
          author: 'bg-green-500/20 text-green-300',
          viewer: 'bg-gray-500/20 text-gray-300'
        }
        const colorClass = roleColors[value as keyof typeof roleColors] || 'bg-gray-500/20 text-gray-300'
        return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}">${value.charAt(0).toUpperCase() + value.slice(1)}</span>`
      }
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      sortable: true,
      sortType: 'date',
      render: (value: number | null) => {
        if (!value) return '<span class="text-gray-400">Never</span>'
        return `<span class="text-sm text-gray-300">${new Date(value).toLocaleDateString()}</span>`
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      sortType: 'date',
      render: (value: number) => `<span class="text-sm text-gray-300">${new Date(value).toLocaleDateString()}</span>`
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      sortable: false,
      render: (value: any, row: User) => `
        <div class="flex justify-end space-x-2">
          <a href="/admin/users/${row.id}" class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-blue-500/80 text-white text-sm rounded-xl border border-white/20 hover:bg-blue-500 transition-all">View</a>
          ${row.isActive ? 
            `<button onclick="toggleUserStatus('${row.id}', false)" class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-red-500/80 text-white text-sm rounded-xl border border-white/20 hover:bg-red-500 transition-all">Deactivate</button>` :
            `<button onclick="toggleUserStatus('${row.id}', true)" class="inline-flex items-center px-3 py-1 backdrop-blur-sm bg-green-500/80 text-white text-sm rounded-xl border border-white/20 hover:bg-green-500 transition-all">Activate</button>`
          }
        </div>
      `
    }
  ]

  const tableData: TableData<User> = {
    tableId: 'users-table',
    columns,
    rows: data.users,
    selectable: false,
    rowClickable: true,
    rowClickUrl: (row: User) => `/admin/users/${row.id}/edit`,
    emptyMessage: 'No users found'
  }

  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">User Management</h1>
          <p class="mt-2 text-sm text-gray-300">Manage user accounts and permissions</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <a href="/admin/users/new" class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/30 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add User
          </a>
          <button class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all" onclick="exportUsers()">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
        </div>
      </div>

      <!-- Alert Messages -->
      ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
      ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}

      <!-- Filters -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input 
              type="text" 
              placeholder="Search users..."
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors"
              hx-get="/admin/users"
              hx-trigger="keyup changed delay:300ms"
              hx-target="body"
              hx-include="[name='role'], [name='status']"
              name="search"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select 
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors"
              name="role"
              hx-get="/admin/users"
              hx-trigger="change"
              hx-target="body"
              hx-include="[name='search'], [name='status']"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select 
              class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none transition-colors"
              name="status"
              hx-get="/admin/users"
              hx-trigger="change"
              hx-target="body"
              hx-include="[name='search'], [name='role']"
            >
              <option value="">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all w-full"
              onclick="clearFilters()"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      ${renderTable(tableData)}

      <!-- Pagination -->
      ${data.pagination ? renderPagination(data.pagination) : ''}

      <!-- Stats -->
      <div class="mt-6 backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-purple-400">${data.totalUsers}</div>
            <div class="text-sm text-gray-300">Total Users</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-400">${data.users.filter(u => u.isActive).length}</div>
            <div class="text-sm text-gray-300">Active Users</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-400">${data.users.filter(u => u.role === 'admin').length}</div>
            <div class="text-sm text-gray-300">Administrators</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-cyan-400">${data.users.filter(u => u.lastLoginAt && u.lastLoginAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length}</div>
            <div class="text-sm text-gray-300">Active This Week</div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function toggleUserStatus(userId, activate) {
        if (confirm(\`Are you sure you want to \${activate ? 'activate' : 'deactivate'} this user?\`)) {
          fetch(\`/admin/users/\${userId}/toggle\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active: activate })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload()
            } else {
              alert('Error updating user status')
            }
          })
          .catch(error => {
            console.error('Error:', error)
            alert('Error updating user status')
          })
        }
      }

      function clearFilters() {
        document.querySelector('[name="search"]').value = ''
        document.querySelector('[name="role"]').value = ''
        document.querySelector('[name="status"]').value = ''
        htmx.trigger(document.querySelector('[name="search"]'), 'keyup')
      }

      function exportUsers() {
        window.open('/admin/users/export', '_blank')
      }
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'Users',
    pageTitle: 'User Management',
    currentPath: '/admin/users',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
} 