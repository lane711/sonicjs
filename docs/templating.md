# Template System Documentation

SonicJS AI features a powerful, component-based template system that enables server-side rendering with HTMX integration for dynamic interactions. This guide covers the template architecture, component development, and best practices.

## Table of Contents

- [Overview](#overview)
- [Template Architecture](#template-architecture)
- [Template Components](#template-components)
- [Layout System](#layout-system)
- [HTMX Integration](#htmx-integration)
- [Creating Templates](#creating-templates)
- [Styling & CSS](#styling--css)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Template System Features

- **Component-Based Architecture** - Reusable, composable components
- **Server-Side Rendering** - Fast initial page loads with SEO benefits
- **HTMX Integration** - Dynamic interactions without complex JavaScript
- **Type Safety** - Full TypeScript support for template data
- **Layout Inheritance** - Consistent page structure across the application
- **Responsive Design** - Mobile-first, responsive templates
- **Accessibility** - WCAG compliant components

### Technology Stack

- **TypeScript** - Type-safe template functions
- **HTML Templates** - Server-rendered HTML strings
- **Tailwind CSS** - Utility-first CSS framework
- **HTMX** - HTML-driven dynamic interactions
- **Hono.js** - Template rendering integration

## Template Architecture

### Directory Structure

```
src/templates/
├── layouts/           # Page layouts
│   ├── admin-layout.template.ts
│   ├── docs-layout.template.ts
│   └── public-layout.template.ts
├── pages/            # Full page templates
│   ├── admin-dashboard.template.ts
│   ├── admin-content-list.template.ts
│   ├── admin-content-edit.template.ts
│   └── login.template.ts
├── components/       # Reusable components
│   ├── form.template.ts
│   ├── table.template.ts
│   ├── alert.template.ts
│   ├── navbar.template.ts
│   └── media-grid.template.ts
└── utils/           # Template utilities
    ├── html-helpers.ts
    └── template-renderer.ts
```

### Template Function Pattern

```typescript
// Template function signature
export interface TemplateData {
  // Define your data interface
}

export function renderTemplateName(data: TemplateData): string {
  return `
    <!-- HTML template content -->
  `
}
```

### Type-Safe Template System

```typescript
// Example: Button component with typed props
export interface ButtonData {
  label: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onclick?: string
  hxPost?: string
  hxTarget?: string
  className?: string
}

export function renderButton(data: ButtonData): string {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const classes = [
    baseClasses,
    variantClasses[data.variant || 'primary'],
    sizeClasses[data.size || 'md'],
    data.className || ''
  ].join(' ')
  
  return `
    <button 
      type="${data.type || 'button'}"
      class="${classes}"
      ${data.disabled ? 'disabled' : ''}
      ${data.onclick ? `onclick="${data.onclick}"` : ''}
      ${data.hxPost ? `hx-post="${data.hxPost}"` : ''}
      ${data.hxTarget ? `hx-target="${data.hxTarget}"` : ''}
    >
      ${data.label}
    </button>
  `
}
```

## Template Components

### Form Components

#### Input Field Component

```typescript
export interface InputFieldData {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date'
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  error?: string
  className?: string
}

export function renderInputField(data: InputFieldData): string {
  const fieldId = `field-${data.name}`
  
  return `
    <div class="form-group">
      <label for="${fieldId}" class="form-label">
        ${data.label}${data.required ? ' *' : ''}
      </label>
      <input 
        type="${data.type || 'text'}"
        id="${fieldId}"
        name="${data.name}"
        value="${data.value || ''}"
        class="form-input ${data.error ? 'border-red-500' : ''} ${data.className || ''}"
        ${data.placeholder ? `placeholder="${data.placeholder}"` : ''}
        ${data.required ? 'required' : ''}
        ${data.disabled ? 'disabled' : ''}
      >
      ${data.helpText ? `<p class="text-sm text-gray-600 mt-1">${data.helpText}</p>` : ''}
      ${data.error ? `<p class="text-sm text-red-600 mt-1">${data.error}</p>` : ''}
    </div>
  `
}
```

#### Rich Text Editor Component

```typescript
export interface RichTextFieldData {
  name: string
  label: string
  value?: string
  placeholder?: string
  required?: boolean
  rows?: number
  helpText?: string
}

export function renderRichTextField(data: RichTextFieldData): string {
  const uniqueId = `${data.name}-${Date.now()}`
  
  return `
    <div class="form-group">
      <label class="form-label">
        ${data.label}${data.required ? ' *' : ''}
      </label>
      <div class="markdown-field">
        <textarea 
          id="${uniqueId}" 
          name="${data.name}" 
          class="form-textarea" 
          rows="${data.rows || 8}"
          ${data.required ? 'required' : ''}
          ${data.placeholder ? `placeholder="${data.placeholder}"` : ''}
        >${data.value || ''}</textarea>
        <script>
          if (typeof EasyMDE !== 'undefined') {
            new EasyMDE({
              element: document.getElementById('${uniqueId}'),
              minHeight: '300px',
              spellChecker: false,
              status: ['autosave', 'lines', 'words', 'cursor'],
              autosave: {
                enabled: true,
                uniqueId: '${uniqueId}',
                delay: 1000
              },
              renderingConfig: {
                singleLineBreaks: false,
                codeSyntaxHighlighting: true
              }
            });
          }
        </script>
      </div>
      ${data.helpText ? `<p class="text-sm text-gray-600 mt-1">${data.helpText}</p>` : ''}
    </div>
  `
}
```

### Data Display Components

#### Table Component

```typescript
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => string
  className?: string
}

export interface TableData {
  columns: TableColumn[]
  rows: any[]
  className?: string
  emptyMessage?: string
}

export function renderTable(data: TableData): string {
  if (data.rows.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        ${data.emptyMessage || 'No data available'}
      </div>
    `
  }

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 ${data.className || ''}">
        <thead class="bg-gray-50">
          <tr>
            ${data.columns.map(column => `
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}">
                ${column.label}
                ${column.sortable ? `
                  <button class="ml-2 hover:text-gray-700">
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </button>
                ` : ''}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${data.rows.map(row => {
            if (!row) return ''
            return `
              <tr class="hover:bg-gray-50">
                ${data.columns.map(column => `
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${column.render ? column.render(row[column.key], row) : (row[column.key] || '')}
                  </td>
                `).join('')}
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}
```

### Alert Component

```typescript
export interface AlertData {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  dismissible?: boolean
  className?: string
}

export function renderAlert(data: AlertData): string {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const icons = {
    success: `<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>`,
    error: `<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>`,
    warning: `<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`,
    info: `<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>`
  }

  return `
    <div class="border rounded-md p-4 ${typeClasses[data.type]} ${data.className || ''}" role="alert">
      <div class="flex">
        <div class="flex-shrink-0">
          ${icons[data.type]}
        </div>
        <div class="ml-3">
          ${data.title ? `<h3 class="text-sm font-medium">${data.title}</h3>` : ''}
          <div class="${data.title ? 'mt-2 text-sm' : 'text-sm'}">
            ${data.message}
          </div>
        </div>
        ${data.dismissible ? `
          <div class="ml-auto pl-3">
            <button class="inline-flex text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.remove()">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `
}
```

## Layout System

### Base Layout Structure

```typescript
export interface LayoutData {
  title: string
  pageTitle?: string
  currentPath: string
  user?: {
    name: string
    email: string
    role: string
  }
  content: string
  scripts?: string[]
  styles?: string[]
  meta?: {
    description?: string
    keywords?: string
    image?: string
  }
}

export function renderBaseLayout(data: LayoutData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  
  <!-- Meta tags -->
  <meta name="description" content="${data.meta?.description || 'SonicJS AI - Modern CMS and documentation platform'}">
  <meta name="keywords" content="${data.meta?.keywords || 'CMS, documentation, TypeScript, Cloudflare'}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.meta?.description || 'SonicJS AI - Modern CMS and documentation platform'}">
  <meta property="og:image" content="${data.meta?.image || '/images/og-default.png'}">
  
  <!-- Styles -->
  <link rel="stylesheet" href="/css/tailwind.css">
  <link rel="stylesheet" href="/css/app.css">
  ${data.styles?.map(style => `<link rel="stylesheet" href="${style}">`).join('\n') || ''}
  
  <!-- HTMX -->
  <script src="https://unpkg.com/htmx.org@1.9.10"></script>
  
  <!-- Rich Text Editor -->
  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  ${data.content}
  
  <!-- Scripts -->
  <script src="/js/app.js"></script>
  ${data.scripts?.map(script => `<script src="${script}"></script>`).join('\n') || ''}
</body>
</html>`
}
```

### Admin Layout

```typescript
export interface AdminLayoutData extends LayoutData {
  currentPath: string
  user: {
    name: string
    email: string
    role: string
  }
}

export function renderAdminLayout(data: AdminLayoutData): string {
  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Content', path: '/admin/content', icon: 'content' },
    { name: 'Media', path: '/admin/media', icon: 'media' },
    { name: 'Collections', path: '/admin/collections', icon: 'collections' },
    { name: 'Users', path: '/admin/users', icon: 'users' }
  ]

  const sidebarContent = `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="w-64 bg-white shadow-sm">
        <div class="flex items-center px-4 py-4 border-b">
          <h1 class="text-xl font-bold text-gray-900">SonicJS Admin</h1>
        </div>
        
        <nav class="mt-4">
          <div class="px-2 space-y-1">
            ${navigation.map(item => `
              <a href="${item.path}" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                   data.currentPath.startsWith(item.path) 
                     ? 'bg-blue-100 text-blue-900' 
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }">
                ${getNavIcon(item.icon)}
                ${item.name}
              </a>
            `).join('')}
          </div>
        </nav>
        
        <!-- User menu -->
        <div class="absolute bottom-0 w-64 p-4 border-t">
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">${data.user.name}</p>
              <p class="text-sm text-gray-500 truncate">${data.user.role}</p>
            </div>
            <button class="ml-3 p-2 text-gray-400 hover:text-gray-600">
              <a href="/auth/logout">Logout</a>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main content -->
      <div class="flex-1 overflow-auto">
        <main>
          ${data.content}
        </main>
      </div>
    </div>
  `

  return renderBaseLayout({
    ...data,
    content: sidebarContent
  })
}
```

## HTMX Integration

### HTMX Attributes in Templates

```typescript
// Form with HTMX submission
export function renderHTMXForm(data: FormData): string {
  return `
    <form 
      hx-post="${data.hxPost}"
      hx-target="${data.hxTarget || '#form-response'}"
      hx-swap="innerHTML"
      hx-indicator=".spinner"
      class="space-y-4"
    >
      ${data.fields.map(field => renderFormField(field)).join('')}
      
      <div class="flex justify-end">
        <button 
          type="submit" 
          class="btn btn-primary"
          hx-indicator=".spinner"
        >
          ${data.submitLabel || 'Submit'}
          <div class="spinner htmx-indicator">Loading...</div>
        </button>
      </div>
    </form>
    
    <div id="form-response" class="mt-4"></div>
  `
}

// Dynamic content loading
export function renderContentList(data: any): string {
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Content</h2>
        <button 
          hx-get="/admin/content/new"
          hx-target="#content-modal .modal-content"
          hx-swap="innerHTML"
          class="btn btn-primary"
          onclick="document.getElementById('content-modal').classList.remove('hidden')"
        >
          New Content
        </button>
      </div>
      
      <div 
        id="content-grid"
        hx-get="/admin/content/list"
        hx-trigger="load, refresh from:body"
        hx-swap="innerHTML"
      >
        <!-- Content loaded via HTMX -->
      </div>
    </div>
    
    <!-- Modal -->
    <div id="content-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="modal-content bg-white rounded-lg p-6 w-full max-w-2xl">
        <!-- Modal content loaded via HTMX -->
      </div>
    </div>
  `
}
```

### HTMX Response Patterns

```typescript
// Partial content updates
export function renderContentItem(content: any): string {
  return `
    <div class="content-item" data-content-id="${content.id}">
      <h3 class="font-bold">${content.title}</h3>
      <p class="text-gray-600">${content.excerpt}</p>
      
      <div class="flex space-x-2 mt-2">
        <button 
          hx-get="/admin/content/${content.id}/edit"
          hx-target="#edit-modal .modal-content"
          class="btn btn-sm btn-secondary"
        >
          Edit
        </button>
        
        <button 
          hx-delete="/admin/content/${content.id}"
          hx-confirm="Are you sure?"
          hx-target="closest .content-item"
          hx-swap="outerHTML"
          class="btn btn-sm btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  `
}

// Success/error responses
export function renderFormResponse(success: boolean, message: string): string {
  return `
    <div class="${success ? 'alert-success' : 'alert-error'}">
      ${message}
      ${success ? `
        <script>
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        </script>
      ` : ''}
    </div>
  `
}
```

## Creating Templates

### Step-by-Step Template Creation

#### 1. Define the Data Interface

```typescript
// Define what data your template needs
export interface MyComponentData {
  title: string
  items: Array<{
    id: string
    name: string
    description?: string
  }>
  showActions?: boolean
  className?: string
}
```

#### 2. Create the Template Function

```typescript
export function renderMyComponent(data: MyComponentData): string {
  return `
    <div class="my-component ${data.className || ''}">
      <h2 class="text-xl font-bold mb-4">${data.title}</h2>
      
      ${data.items.length === 0 ? `
        <p class="text-gray-500 text-center py-8">No items found</p>
      ` : `
        <div class="space-y-2">
          ${data.items.map(item => `
            <div class="flex justify-between items-center p-3 bg-white rounded border">
              <div>
                <h3 class="font-medium">${item.name}</h3>
                ${item.description ? `<p class="text-sm text-gray-600">${item.description}</p>` : ''}
              </div>
              
              ${data.showActions ? `
                <div class="flex space-x-2">
                  <button 
                    hx-get="/api/items/${item.id}/edit"
                    class="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    hx-delete="/api/items/${item.id}"
                    hx-confirm="Delete ${item.name}?"
                    class="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `
}
```

#### 3. Use in Routes

```typescript
// In your route handler
app.get('/my-page', async (c) => {
  const data: MyComponentData = {
    title: 'My Items',
    items: await getItems(),
    showActions: true,
    className: 'my-custom-class'
  }
  
  const pageContent = renderMyComponent(data)
  
  return c.html(renderAdminLayout({
    title: 'My Page',
    content: pageContent,
    currentPath: '/my-page',
    user: c.get('user')
  }))
})
```

### Template Composition

```typescript
// Compose multiple components
export function renderDashboardPage(data: DashboardData): string {
  return `
    <div class="dashboard">
      ${renderPageHeader({ title: 'Dashboard', breadcrumbs: ['Admin', 'Dashboard'] })}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderStatsCard({ title: 'Total Users', value: data.userCount, icon: 'users' })}
        ${renderStatsCard({ title: 'Content Items', value: data.contentCount, icon: 'content' })}
        ${renderStatsCard({ title: 'Media Files', value: data.mediaCount, icon: 'media' })}
      </div>
      
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${renderRecentActivity({ activities: data.recentActivities })}
        ${renderQuickActions({ actions: data.quickActions })}
      </div>
    </div>
  `
}
```

## Styling & CSS

### CSS Architecture

```css
/* Base styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Component styles */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }
  
  .form-input {
    @apply block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

### Responsive Design

```typescript
// Responsive component example
export function renderResponsiveGrid(data: GridData): string {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      ${data.items.map(item => `
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-lg mb-2">${item.title}</h3>
          <p class="text-gray-600 text-sm">${item.description}</p>
        </div>
      `).join('')}
    </div>
  `
}
```

## Performance Optimization

### Template Caching

```typescript
// Simple template caching
const templateCache = new Map<string, string>()

export function renderCachedTemplate(
  key: string, 
  renderFn: () => string, 
  ttl: number = 300000 // 5 minutes
): string {
  const cached = templateCache.get(key)
  if (cached) {
    return cached
  }
  
  const rendered = renderFn()
  templateCache.set(key, rendered)
  
  // Auto-expire cache
  setTimeout(() => templateCache.delete(key), ttl)
  
  return rendered
}
```

### Lazy Loading

```typescript
// Lazy load content sections
export function renderLazySection(data: { endpoint: string; placeholder?: string }): string {
  return `
    <div 
      hx-get="${data.endpoint}"
      hx-trigger="intersect once"
      hx-swap="outerHTML"
    >
      ${data.placeholder || `
        <div class="animate-pulse bg-gray-200 h-32 rounded"></div>
      `}
    </div>
  `
}
```

## Best Practices

### 1. Type Safety

- Always define TypeScript interfaces for template data
- Use strict typing for all template functions
- Validate data before rendering

### 2. Component Reusability

- Create small, focused components
- Use composition over inheritance
- Pass configuration via props

### 3. Accessibility

```typescript
// Accessible form component
export function renderAccessibleForm(data: FormData): string {
  return `
    <form role="form" aria-label="${data.title}">
      <fieldset>
        <legend class="sr-only">${data.title}</legend>
        ${data.fields.map(field => `
          <div class="form-group">
            <label for="${field.id}" class="form-label">
              ${field.label}
              ${field.required ? '<span aria-label="required">*</span>' : ''}
            </label>
            <input 
              id="${field.id}"
              name="${field.name}"
              type="${field.type}"
              aria-describedby="${field.helpText ? `${field.id}-help` : ''}"
              aria-invalid="${field.error ? 'true' : 'false'}"
              ${field.required ? 'required' : ''}
            >
            ${field.helpText ? `<p id="${field.id}-help" class="form-help">${field.helpText}</p>` : ''}
            ${field.error ? `<p role="alert" class="form-error">${field.error}</p>` : ''}
          </div>
        `).join('')}
      </fieldset>
    </form>
  `
}
```

### 4. Security

```typescript
// HTML escaping utility
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Use escaped content
export function renderUserContent(data: { content: string }): string {
  return `
    <div class="user-content">
      ${escapeHtml(data.content)}
    </div>
  `
}
```

### 5. Error Handling

```typescript
// Safe template rendering
export function safeRender<T>(
  renderFn: (data: T) => string, 
  data: T,
  fallback: string = '<div class="error">Rendering error</div>'
): string {
  try {
    return renderFn(data)
  } catch (error) {
    console.error('Template rendering error:', error)
    return fallback
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Template Syntax Errors

```typescript
// Debug template output
export function debugTemplate(templateFn: () => string): string {
  try {
    const result = templateFn()
    console.log('Template rendered successfully:', result.length, 'characters')
    return result
  } catch (error) {
    console.error('Template error:', error)
    return `<div class="error">Template Error: ${error.message}</div>`
  }
}
```

#### 2. HTMX Integration Issues

```html
<!-- Debug HTMX requests -->
<script>
  document.body.addEventListener('htmx:responseError', function(e) {
    console.error('HTMX Error:', e.detail)
  })
  
  document.body.addEventListener('htmx:sendError', function(e) {
    console.error('HTMX Send Error:', e.detail)
  })
</script>
```

#### 3. Performance Issues

```typescript
// Profile template rendering
export function profileTemplate<T>(
  name: string,
  renderFn: (data: T) => string,
  data: T
): string {
  const start = performance.now()
  const result = renderFn(data)
  const end = performance.now()
  
  if (end - start > 10) { // Warn if > 10ms
    console.warn(`Slow template "${name}": ${end - start}ms`)
  }
  
  return result
}
```

## Related Documentation

- [Getting Started](getting-started.md) - Template setup and configuration
- [Content Management](content-management.md) - Content templates and workflows
- [Authentication](authentication.md) - User-specific template rendering
- [API Reference](api-reference.md) - Template endpoint documentation