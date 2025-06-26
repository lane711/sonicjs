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
        const fullName = `${row.firstName} ${row.lastName}`
        const statusBadge = row.isActive ? 
          '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">Active</span>' :
          '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">Inactive</span>'
        return `
          <div>
            <div class="text-sm font-medium text-gray-900">${fullName}${statusBadge}</div>
            <div class="text-sm text-gray-500">@${row.username}</div>
          </div>
        `
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      sortType: 'string',
      render: (value: string) => `<a href="mailto:${value}" class="text-blue-600 hover:text-blue-900">${value}</a>`
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      sortType: 'string',
      render: (value: string) => {
        const roleColors = {
          admin: 'bg-red-100 text-red-800',
          editor: 'bg-blue-100 text-blue-800',
          author: 'bg-green-100 text-green-800',
          viewer: 'bg-gray-100 text-gray-800'
        }
        const colorClass = roleColors[value as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
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
        return `<span class="text-sm text-gray-900">${new Date(value).toLocaleDateString()}</span>`
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      sortType: 'date',
      render: (value: number) => `<span class="text-sm text-gray-900">${new Date(value).toLocaleDateString()}</span>`
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      sortable: false,
      render: (value: any, row: User) => `
        <div class="flex justify-end space-x-2">
          <a href="/admin/users/${row.id}" class="text-blue-600 hover:text-blue-900 text-sm">View</a>
          <a href="/admin/users/${row.id}/edit" class="text-gray-600 hover:text-gray-900 text-sm">Edit</a>
          ${row.isActive ? 
            `<button onclick="toggleUserStatus('${row.id}', false)" class="text-red-600 hover:text-red-900 text-sm">Deactivate</button>` :
            `<button onclick="toggleUserStatus('${row.id}', true)" class="text-green-600 hover:text-green-900 text-sm">Activate</button>`
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
    emptyMessage: 'No users found'
  }

  const pageContent = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-100">Users</h1>
          <p class="mt-2 text-sm text-gray-300">Manage user accounts and permissions</p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <a href="/admin/users/new" class="btn btn-primary">
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add User
          </a>
          <button class="btn btn-secondary" onclick="exportUsers()">
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input 
              type="text" 
              placeholder="Search users..."
              class="form-input"
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
              class="form-input"
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
              class="form-input"
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
              class="btn btn-secondary w-full"
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
      <div class="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
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