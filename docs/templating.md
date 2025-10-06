# Template System Documentation

SonicJS AI features a modern, server-side rendering template system built with TypeScript, HTMX, Alpine.js, and TailwindCSS. This guide provides comprehensive coverage of the template architecture, components, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Template Architecture](#template-architecture)
3. [Template Structure](#template-structure)
4. [Template Rendering Flow](#template-rendering-flow)
5. [Layout System](#layout-system)
6. [Component Library](#component-library)
7. [HTMX Integration](#htmx-integration)
8. [Alpine.js Integration](#alpinejs-integration)
9. [TailwindCSS & Design System](#tailwindcss--design-system)
10. [Dark Mode Implementation](#dark-mode-implementation)
11. [Creating Custom Templates](#creating-custom-templates)
12. [Real-World Examples](#real-world-examples)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

## Overview

### Key Features

- **Server-Side Rendering (SSR)** - Fast initial page loads with full HTML from the server
- **Type-Safe Templates** - Full TypeScript support for template data interfaces
- **HTMX-Driven Interactions** - Dynamic updates without complex JavaScript
- **Alpine.js for Client-Side Logic** - Lightweight JavaScript framework for interactivity
- **TailwindCSS Design System** - Utility-first CSS with dark mode support
- **Component-Based Architecture** - Reusable, composable template components
- **Template Renderer Utility** - Handlebars-like template engine for variable interpolation

### Technology Stack

```
├── TypeScript          → Type-safe template functions
├── HTMX 2.0           → HTML-driven interactions
├── Alpine.js 3.x      → Reactive client-side logic
├── TailwindCSS        → Utility-first styling
└── Hono.js            → Server framework integration
```

## Template Architecture

### Directory Structure

```
src/templates/
├── layouts/                              # Page layouts
│   ├── admin-layout-v2.template.ts      # Main admin layout (delegates to Catalyst)
│   ├── admin-layout-catalyst.template.ts # Catalyst-based admin UI
│   └── docs-layout.template.ts          # Documentation layout
├── pages/                                # Full page templates
│   ├── admin-dashboard.template.ts      # Dashboard with stats & charts
│   ├── admin-content-list.template.ts   # Content listing with filters
│   ├── admin-content-edit.template.ts   # Content editor
│   ├── admin-media-library.template.ts  # Media management
│   ├── admin-users-list.template.ts     # User management
│   ├── auth-login.template.ts           # Login page
│   └── ...                               # More page templates
├── components/                           # Reusable components
│   ├── form.template.ts                 # Form builder
│   ├── table.template.ts                # Data tables with sorting
│   ├── media-grid.template.ts           # Media file grid/list
│   ├── alert.template.ts                # Alert notifications
│   ├── pagination.template.ts           # Pagination controls
│   ├── filter-bar.template.ts           # Filter controls
│   ├── logo.template.ts                 # Logo component
│   └── ...                              # More components
└── utils/
    └── template-renderer.ts             # Template rendering utility
```

### Template Function Pattern

All templates follow this TypeScript pattern:

```typescript
// 1. Define the data interface
export interface MyTemplateData {
  title: string
  items: Array<{ id: string; name: string }>
  optional?: string
}

// 2. Create the render function
export function renderMyTemplate(data: MyTemplateData): string {
  return `
    <div class="my-template">
      <h1>${data.title}</h1>
      ${data.items.map(item => `
        <div>${item.name}</div>
      `).join('')}
    </div>
  `
}
```

## Template Structure

### Three-Tier Template Hierarchy

```
Layout (admin-layout-v2.template.ts)
  └── Page (admin-dashboard.template.ts)
       └── Components (table.template.ts, alert.template.ts, etc.)
```

**1. Layouts** - Define the overall page structure (header, sidebar, footer)
**2. Pages** - Compose components into full pages
**3. Components** - Reusable UI elements

## Template Rendering Flow

### Template Renderer Utility

SonicJS includes a custom template renderer at `/src/utils/template-renderer.ts` that provides Handlebars-like functionality:

```typescript
import { renderTemplate, TemplateRenderer } from '../utils/template-renderer'

// Simple variable interpolation
const html = renderTemplate('Hello {{name}}!', { name: 'World' })
// Output: "Hello World!"

// Nested properties
const html = renderTemplate('{{user.name}}', { user: { name: 'John' } })

// Conditionals
const html = renderTemplate(`
  {{#if isActive}}
    <div>Active</div>
  {{/if}}
`, { isActive: true })

// Loops
const html = renderTemplate(`
  {{#each items}}
    <li>{{name}}</li>
  {{/each}}
`, { items: [{ name: 'Item 1' }, { name: 'Item 2' }] })

// Helper functions
const html = renderTemplate('{{titleCase field}}', { field: 'hello_world' })
// Output: "Hello World"
```

### Renderer Features

- **Variable interpolation**: `{{variable}}`
- **Nested properties**: `{{user.name}}`
- **Raw HTML**: `{{{rawHtml}}}`
- **Conditionals**: `{{#if condition}}...{{/if}}`
- **Loops**: `{{#each array}}...{{/each}}`
- **Special loop variables**: `{{@index}}`, `{{@first}}`, `{{@last}}`
- **Helper functions**: `{{titleCase field}}`

### Request Flow

```
1. Route Handler (Hono)
   ↓
2. Fetch Data from Database/API
   ↓
3. Call Page Template Function
   ↓
4. Page Template Calls Component Templates
   ↓
5. Component Templates Return HTML Strings
   ↓
6. Page Template Returns Complete HTML
   ↓
7. Page Template Calls Layout Template
   ↓
8. Layout Returns Full HTML Document
   ↓
9. Hono Returns HTML Response
```

## Layout System

### Admin Layout v2 (with Catalyst)

The main admin layout delegates to Catalyst UI:

```typescript
// src/templates/layouts/admin-layout-v2.template.ts
export interface AdminLayoutData {
  title: string
  pageTitle?: string
  currentPath?: string
  user?: {
    name: string
    email: string
    role: string
  }
  content: string | HtmlEscapedString
  scripts?: string[]
  styles?: string[]
  version?: string
  dynamicMenuItems?: Array<{
    label: string
    path: string
    icon: string
  }>
}

export function renderAdminLayout(data: AdminLayoutData): string {
  const { renderAdminLayoutCatalyst } = require('./admin-layout-catalyst.template')
  return renderAdminLayoutCatalyst(data)
}
```

### Layout Features

**1. Responsive Sidebar Navigation**
- Dashboard, Content, Collections, Media, Users, Plugins, Cache, Design, Logs, Settings
- Dynamic menu items from plugins
- Active state highlighting

**2. Top Bar**
- Logo with customizable size/variant
- Notifications button
- Background theme customizer
- User dropdown menu

**3. Background Customization**
- Multiple gradient themes (Deep Space, Cosmic Blue, Matrix Green, Cyber Pink, etc.)
- Custom PNG backgrounds (Blue Waves, Stars, Crescent, 3D Waves)
- Darkness adjustment slider
- Persisted to localStorage

**4. Dark Mode Support**
- Class-based dark mode (`dark:` prefix)
- System preference detection
- Toggle functionality with localStorage persistence

**5. Custom Styling**
```css
/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1F2937; }
::-webkit-scrollbar-thumb { background: #465FFF; border-radius: 3px; }

/* Sidebar animations */
.sidebar-item {
  transition: all 0.3s ease;
}
.sidebar-item:hover {
  transform: translateX(4px);
}
```

## Component Library

### 1. Form Component

**Location**: `/src/templates/components/form.template.ts`

```typescript
import { renderForm, FormField, FormData } from '../components/form.template'

const formData: FormData = {
  id: 'my-form',
  hxPost: '/api/submit',
  hxTarget: '#form-response',
  title: 'User Registration',
  description: 'Please fill in your details',
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'you@example.com'
    },
    {
      name: 'bio',
      label: 'Biography',
      type: 'textarea',
      rows: 4,
      helpText: 'Tell us about yourself'
    },
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' }
      ]
    },
    {
      name: 'newsletter',
      label: 'Subscribe to newsletter',
      type: 'checkbox',
      value: true
    }
  ],
  submitButtons: [
    { label: 'Save', type: 'submit', className: 'btn-primary' },
    { label: 'Cancel', type: 'button', className: 'btn-secondary', onclick: 'history.back()' }
  ]
}

const html = renderForm(formData)
```

**Supported Field Types**:
- `text`, `email`, `number`, `date`
- `textarea`, `rich_text` (with EasyMDE)
- `select`, `multi_select`
- `checkbox`
- `file`

### 2. Table Component

**Location**: `/src/templates/components/table.template.ts`

```typescript
import { renderTable, TableColumn, TableData } from '../components/table.template'

const columns: TableColumn[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    sortType: 'date',
    render: (value) => new Date(value).toLocaleDateString()
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (value, row) => `
      <button hx-get="/users/${row.id}/edit" class="btn-sm btn-primary">Edit</button>
      <button hx-delete="/users/${row.id}" class="btn-sm btn-danger">Delete</button>
    `
  }
]

const tableData: TableData = {
  columns,
  rows: users,
  selectable: true,
  rowClickable: true,
  rowClickUrl: (row) => `/users/${row.id}`,
  emptyMessage: 'No users found'
}

const html = renderTable(tableData)
```

**Table Features**:
- Column sorting (string, number, date, boolean)
- Row selection with "select all"
- Clickable rows
- Empty state
- Custom cell rendering
- Responsive design

### 3. Media Grid Component

**Location**: `/src/templates/components/media-grid.template.ts`

```typescript
import { renderMediaGrid, MediaGridData } from '../components/media-grid.template'

const gridData: MediaGridData = {
  files: mediaFiles,
  viewMode: 'grid', // or 'list'
  selectable: true,
  emptyMessage: 'No media files uploaded yet'
}

const html = renderMediaGrid(gridData)
```

**Media Grid Features**:
- Grid and list view modes
- Image thumbnails with lazy loading
- File type icons (image, video, PDF, document)
- Hover overlays with actions
- File selection
- Copy URL to clipboard
- File details modal (via HTMX)

### 4. Alert Component

**Location**: `/src/templates/components/alert.template.ts`

```typescript
import { renderAlert } from '../components/alert.template'

// Success alert
const success = renderAlert({
  type: 'success',
  title: 'Success!',
  message: 'Your changes have been saved.',
  dismissible: true
})

// Error alert
const error = renderAlert({
  type: 'error',
  message: 'An error occurred. Please try again.'
})

// Warning and info
const warning = renderAlert({ type: 'warning', message: 'This action cannot be undone.' })
const info = renderAlert({ type: 'info', message: 'You have 3 pending notifications.' })
```

**Alert Types**: `success`, `error`, `warning`, `info`

### 5. Pagination Component

**Location**: `/src/templates/components/pagination.template.ts`

```typescript
import { renderPagination } from '../components/pagination.template'

const pagination = renderPagination({
  currentPage: 2,
  totalPages: 10,
  totalItems: 195,
  itemsPerPage: 20,
  startItem: 21,
  endItem: 40,
  baseUrl: '/admin/content',
  queryParams: { status: 'published', model: 'blog' },
  showPageNumbers: true,
  maxPageNumbers: 5,
  showPageSizeSelector: true,
  pageSizeOptions: [10, 20, 50, 100]
})
```

**Pagination Features**:
- Page number navigation
- Previous/Next buttons
- Page size selector
- Query parameter preservation
- Mobile-responsive
- Showing X-Y of Z results

### 6. Filter Bar Component

**Location**: `/src/templates/components/filter-bar.template.ts`

```typescript
import { renderFilterBar } from '../components/filter-bar.template'

const filterBar = renderFilterBar({
  filters: [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status', selected: true },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ],
  actions: [
    { label: 'Refresh', className: 'btn-secondary', onclick: 'location.reload()' }
  ],
  bulkActions: [
    { label: 'Delete', value: 'delete', icon: 'trash', className: 'text-red-600' }
  ]
})
```

## HTMX Integration

HTMX enables dynamic, server-driven interactions without writing JavaScript.

### Core HTMX Patterns

#### 1. Auto-Refresh with Polling

```html
<!-- Refresh stats every 30 seconds -->
<div
  id="stats-container"
  hx-get="/admin/api/stats"
  hx-trigger="load, every 30s"
  hx-swap="innerHTML"
>
  <div>Loading...</div>
</div>
```

#### 2. Form Submission

```html
<form
  hx-post="/admin/content/create"
  hx-target="#form-response"
  hx-swap="innerHTML"
  hx-indicator="#loading-spinner"
>
  <input type="text" name="title" required />
  <button type="submit">
    Submit
    <div id="loading-spinner" class="htmx-indicator">Saving...</div>
  </button>
</form>

<div id="form-response"></div>
```

#### 3. Partial Updates (Edit in Place)

```html
<div id="content-item-${id}">
  <h3>${title}</h3>
  <button
    hx-get="/admin/content/${id}/edit"
    hx-target="#content-item-${id}"
    hx-swap="outerHTML"
  >
    Edit
  </button>
</div>
```

#### 4. Delete with Confirmation

```html
<button
  hx-delete="/admin/content/${id}"
  hx-confirm="Are you sure you want to delete this?"
  hx-target="closest .content-item"
  hx-swap="outerHTML"
>
  Delete
</button>
```

#### 5. Infinite Scroll

```html
<div id="content-list">
  ${items.map(item => renderItem(item)).join('')}
</div>

<div
  hx-get="/admin/content?page=${page + 1}"
  hx-trigger="intersect once"
  hx-swap="beforeend"
  hx-target="#content-list"
>
  <div class="text-center py-4">Loading more...</div>
</div>
```

#### 6. Dependent Dropdowns

```html
<select
  name="collection"
  hx-get="/admin/api/fields"
  hx-target="#fields-container"
  hx-trigger="change"
>
  <option value="blog">Blog</option>
  <option value="page">Page</option>
</select>

<div id="fields-container">
  <!-- Dynamically loaded fields -->
</div>
```

#### 7. Modal Loading

```html
<button
  hx-get="/admin/media/${fileId}/details"
  hx-target="#modal-content"
  hx-swap="innerHTML"
  onclick="openModal()"
>
  View Details
</button>

<div id="modal" class="hidden">
  <div id="modal-content">
    <!-- Content loaded via HTMX -->
  </div>
</div>
```

### HTMX Attributes Reference

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `hx-get` | GET request | `hx-get="/api/data"` |
| `hx-post` | POST request | `hx-post="/api/create"` |
| `hx-put` | PUT request | `hx-put="/api/update/123"` |
| `hx-delete` | DELETE request | `hx-delete="/api/delete/123"` |
| `hx-target` | Where to insert response | `hx-target="#result"` |
| `hx-swap` | How to insert | `innerHTML`, `outerHTML`, `beforeend` |
| `hx-trigger` | When to trigger | `click`, `load`, `change`, `every 30s` |
| `hx-indicator` | Loading indicator | `hx-indicator="#spinner"` |
| `hx-confirm` | Confirmation dialog | `hx-confirm="Are you sure?"` |

### Real HTMX Example from Dashboard

```typescript
// From admin-dashboard.template.ts
export function renderDashboardPage(data: DashboardPageData): string {
  return `
    <!-- Auto-loading stats with skeleton -->
    <div
      id="stats-container"
      hx-get="/admin/api/stats"
      hx-trigger="load"
      hx-swap="innerHTML"
    >
      ${renderStatsCardsSkeleton()}
    </div>

    <!-- System status with auto-refresh -->
    <div
      id="system-status-container"
      hx-get="/admin/api/system-status"
      hx-trigger="load, every 30s"
      hx-swap="innerHTML"
    >
      <div class="animate-pulse">Loading...</div>
    </div>
  `
}
```

## Alpine.js Integration

Alpine.js provides reactive client-side interactions. It's included via CDN:

```html
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

### Alpine.js Examples

#### 1. Dropdown Menu

```html
<div x-data="{ open: false }">
  <button @click="open = !open">
    Toggle Menu
  </button>
  <div x-show="open" @click.away="open = false">
    <a href="/profile">Profile</a>
    <a href="/settings">Settings</a>
  </div>
</div>
```

#### 2. Tabs

```html
<div x-data="{ activeTab: 'overview' }">
  <div class="tabs">
    <button @click="activeTab = 'overview'" :class="{ 'active': activeTab === 'overview' }">
      Overview
    </button>
    <button @click="activeTab = 'details'" :class="{ 'active': activeTab === 'details' }">
      Details
    </button>
  </div>

  <div x-show="activeTab === 'overview'">
    Overview content
  </div>
  <div x-show="activeTab === 'details'">
    Details content
  </div>
</div>
```

#### 3. Search Filter (Client-Side)

```html
<div x-data="{ search: '' }">
  <input type="text" x-model="search" placeholder="Search...">

  <template x-for="item in items.filter(i => i.name.includes(search))">
    <div x-text="item.name"></div>
  </template>
</div>
```

## TailwindCSS & Design System

### TailwindCSS Configuration

SonicJS uses Tailwind via CDN with custom configuration:

```javascript
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#465FFF',
        secondary: '#212A3E',
        dark: '#1C1C24',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      fontFamily: {
        satoshi: ['Satoshi', 'sans-serif']
      }
    }
  }
}
```

### Common Utility Patterns

#### Form Inputs
```html
<input
  type="text"
  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
/>
```

#### Buttons
```html
<!-- Primary Button -->
<button class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
  Save
</button>

<!-- Secondary Button -->
<button class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
  Cancel
</button>
```

#### Cards
```html
<div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
  <!-- Card content -->
</div>
```

#### Backdrop Blur (Glass Effect)
```html
<div class="backdrop-blur-md bg-black/30 rounded-xl border border-white/10 shadow-xl p-6">
  <!-- Glass morphism content -->
</div>
```

## Dark Mode Implementation

### Dark Mode Toggle

Dark mode uses Tailwind's `class` strategy:

```javascript
// Dark mode toggle (in layout)
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'))
}

// Initialize from localStorage
if (localStorage.getItem('darkMode') === 'true' ||
    (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}
```

### Dark Mode Utilities

Every component uses dark mode variants:

```html
<!-- Text colors -->
<p class="text-zinc-950 dark:text-white">Primary text</p>
<p class="text-zinc-500 dark:text-zinc-400">Secondary text</p>

<!-- Backgrounds -->
<div class="bg-white dark:bg-zinc-900">Content</div>
<div class="bg-zinc-50 dark:bg-zinc-800">Subtle background</div>

<!-- Borders -->
<div class="border border-zinc-950/10 dark:border-white/10">Bordered</div>

<!-- Rings (focus states) -->
<input class="ring-1 ring-zinc-950/10 dark:ring-white/10 focus:ring-zinc-950 dark:focus:ring-white" />
```

## Creating Custom Templates

### Step-by-Step Guide

#### 1. Define Your Data Interface

```typescript
// src/templates/pages/my-custom-page.template.ts

export interface MyCustomPageData {
  title: string
  items: Array<{
    id: string
    name: string
    description?: string
  }>
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}
```

#### 2. Create Component Templates (if needed)

```typescript
// src/templates/components/my-component.template.ts

export interface MyComponentData {
  title: string
  items: string[]
}

export function renderMyComponent(data: MyComponentData): string {
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
      <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">
        ${data.title}
      </h3>
      <ul class="space-y-2">
        ${data.items.map(item => `
          <li class="text-sm text-zinc-500 dark:text-zinc-400">${item}</li>
        `).join('')}
      </ul>
    </div>
  `
}
```

#### 3. Create the Page Template

```typescript
import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderMyComponent } from '../components/my-component.template'
import { renderAlert } from '../components/alert.template'

export function renderMyCustomPage(data: MyCustomPageData): string {
  const pageContent = `
    <div>
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">
          ${data.title}
        </h1>
        <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Custom page description
        </p>
      </div>

      <!-- Success Message -->
      ${renderAlert({
        type: 'success',
        message: 'Page loaded successfully!',
        dismissible: true
      })}

      <!-- Custom Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        ${data.items.map(item => `
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-2">
              ${item.name}
            </h3>
            ${item.description ? `
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                ${item.description}
              </p>
            ` : ''}

            <!-- HTMX Action Button -->
            <button
              hx-get="/api/item/${item.id}"
              hx-target="#item-details"
              hx-swap="innerHTML"
              class="mt-4 inline-flex items-center rounded-lg bg-zinc-950 dark:bg-white px-3 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              View Details
            </button>
          </div>
        `).join('')}
      </div>

      <!-- HTMX Target for Dynamic Content -->
      <div id="item-details" class="mt-6"></div>

      <!-- Component Usage -->
      ${renderMyComponent({
        title: 'My Component',
        items: ['Item 1', 'Item 2', 'Item 3']
      })}
    </div>
  `

  // Wrap in layout
  const layoutData: AdminLayoutData = {
    title: data.title,
    pageTitle: data.title,
    currentPath: '/admin/my-page',
    user: data.user,
    version: data.version,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}
```

#### 4. Create the Route Handler

```typescript
// src/routes/admin.routes.ts
import { renderMyCustomPage } from '../templates/pages/my-custom-page.template'

app.get('/admin/my-page', async (c) => {
  const user = c.get('user')

  // Fetch your data
  const items = await db.query('SELECT * FROM items')

  const pageData = {
    title: 'My Custom Page',
    items,
    user,
    version: '1.0.0'
  }

  return c.html(renderMyCustomPage(pageData))
})
```

## Real-World Examples

### Example 1: Content List Page with Filters

```typescript
// From admin-content-list.template.ts (simplified)
export function renderContentListPage(data: ContentListPageData): string {
  const pageContent = `
    <div>
      <!-- Header with Actions -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white">
          Content
        </h1>
        <a
          href="/admin/content/new"
          class="inline-flex items-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950"
        >
          New Content
        </a>
      </div>

      <!-- Filter Bar -->
      ${renderFilterBar({
        filters: [
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Status', selected: data.status === 'all' },
              { value: 'draft', label: 'Draft', selected: data.status === 'draft' },
              { value: 'published', label: 'Published', selected: data.status === 'published' }
            ]
          }
        ],
        bulkActions: [
          { label: 'Publish', value: 'publish' },
          { label: 'Delete', value: 'delete', className: 'text-red-600' }
        ]
      })}

      <!-- Content Table -->
      ${renderTable({
        columns: [
          {
            key: 'title',
            label: 'Title',
            sortable: true,
            render: (value, row) => `
              <a href="/admin/content/${row.id}" class="hover:text-blue-600">
                ${row.title}
              </a>
            `
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => renderStatusBadge(value)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => `
              <button
                hx-get="/admin/content/${row.id}/edit"
                class="btn-sm btn-primary"
              >
                Edit
              </button>
            `
          }
        ],
        rows: data.contentItems,
        selectable: true,
        rowClickable: true,
        rowClickUrl: (row) => `/admin/content/${row.id}`
      })}

      <!-- Pagination -->
      ${renderPagination({
        currentPage: data.page,
        totalPages: Math.ceil(data.totalItems / data.itemsPerPage),
        totalItems: data.totalItems,
        itemsPerPage: data.itemsPerPage,
        startItem: (data.page - 1) * data.itemsPerPage + 1,
        endItem: Math.min(data.page * data.itemsPerPage, data.totalItems),
        baseUrl: '/admin/content'
      })}
    </div>
  `

  return renderAdminLayout({
    title: 'Content Management',
    pageTitle: 'Content',
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  })
}
```

### Example 2: Dashboard with HTMX Auto-Refresh

```typescript
// From admin-dashboard.template.ts (simplified)
export function renderDashboardPage(data: DashboardPageData): string {
  const pageContent = `
    <div>
      <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white mb-6">
        Dashboard
      </h1>

      <!-- Stats Cards with Auto-Load -->
      <div
        id="stats-container"
        hx-get="/admin/api/stats"
        hx-trigger="load"
        hx-swap="innerHTML"
      >
        ${renderStatsCardsSkeleton()}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <!-- Analytics Chart -->
        <div class="xl:col-span-2">
          ${renderAnalyticsChart()}
        </div>

        <!-- Recent Activity -->
        <div class="xl:col-span-1">
          ${renderRecentActivity()}
        </div>
      </div>

      <!-- System Status with Auto-Refresh Every 30s -->
      <div
        id="system-status"
        hx-get="/admin/api/system-status"
        hx-trigger="load, every 30s"
        hx-swap="innerHTML"
      >
        <div class="animate-pulse">Loading system status...</div>
      </div>
    </div>
  `

  return renderAdminLayout({
    title: 'Dashboard',
    pageTitle: 'Dashboard',
    currentPath: '/admin',
    user: data.user,
    content: pageContent,
    scripts: ['https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js']
  })
}
```

### Example 3: Form with HTMX Submission

```typescript
export function renderContentEditPage(data: ContentEditPageData): string {
  const pageContent = `
    <div>
      <h1 class="text-2xl font-semibold text-zinc-950 dark:text-white mb-6">
        Edit Content
      </h1>

      <!-- Alert Container -->
      <div id="form-response"></div>

      <!-- Form with HTMX -->
      <form
        id="edit-form"
        hx-post="/admin/content/${data.content.id}/edit"
        hx-target="#form-response"
        hx-swap="innerHTML"
        class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8"
      >
        <!-- Title Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value="${data.content.title}"
            required
            class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10"
          />
        </div>

        <!-- Status Dropdown -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
            Status
          </label>
          <select
            name="status"
            class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
          >
            <option value="draft" ${data.content.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="published" ${data.content.status === 'published' ? 'selected' : ''}>Published</option>
          </select>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="inline-flex items-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950"
        >
          Save Changes
        </button>
      </form>
    </div>
  `

  return renderAdminLayout({
    title: `Edit: ${data.content.title}`,
    currentPath: '/admin/content',
    user: data.user,
    content: pageContent
  })
}
```

## Best Practices

### 1. Type Safety

**Always define TypeScript interfaces for template data:**

```typescript
// Good
export interface PageData {
  title: string
  items: Item[]
}

// Bad - No type safety
export function renderPage(data: any) { ... }
```

### 2. Component Reusability

**Break down complex UIs into reusable components:**

```typescript
// Instead of duplicating card HTML:
const html = `
  <div class="card">${item1.name}</div>
  <div class="card">${item2.name}</div>
`

// Create a reusable component:
function renderCard(data: CardData) {
  return `<div class="card">${data.name}</div>`
}

const html = items.map(item => renderCard(item)).join('')
```

### 3. Accessibility

**Include ARIA attributes and semantic HTML:**

```html
<button
  aria-label="Delete item"
  role="button"
  class="..."
>
  Delete
</button>

<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

### 4. XSS Prevention

**Always escape user-provided content:**

```typescript
// Bad - XSS vulnerability
const html = `<div>${userInput}</div>`

// Good - Use template renderer or escape
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const html = `<div>${escapeHtml(userInput)}</div>`
```

### 5. Performance

**Use HTMX for partial updates instead of full page reloads:**

```html
<!-- Bad - Full page reload -->
<a href="/admin/stats">Refresh Stats</a>

<!-- Good - Partial update with HTMX -->
<button
  hx-get="/admin/api/stats"
  hx-target="#stats-container"
  hx-swap="innerHTML"
>
  Refresh Stats
</button>
```

### 6. Error Handling

**Provide fallback UI and error states:**

```typescript
export function renderDataTable(data: TableData): string {
  if (!data.rows || data.rows.length === 0) {
    return `
      <div class="text-center py-12">
        <p class="text-zinc-500 dark:text-zinc-400">
          ${data.emptyMessage || 'No data available'}
        </p>
      </div>
    `
  }

  return renderTable(data)
}
```

### 7. Loading States

**Always provide loading skeletons:**

```html
<div
  hx-get="/api/data"
  hx-trigger="load"
  hx-swap="innerHTML"
>
  <!-- Loading skeleton -->
  <div class="animate-pulse">
    <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
    <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
  </div>
</div>
```

## Troubleshooting

### Common Issues

#### 1. HTMX Request Not Firing

**Problem**: HTMX attribute not working

**Solution**: Check browser console for errors, ensure HTMX is loaded:

```html
<!-- Verify HTMX is included -->
<script src="https://unpkg.com/htmx.org@2.0.3"></script>

<!-- Debug HTMX events -->
<script>
  document.body.addEventListener('htmx:responseError', function(e) {
    console.error('HTMX Error:', e.detail)
  })
</script>
```

#### 2. Dark Mode Not Persisting

**Problem**: Dark mode resets on page load

**Solution**: Ensure initialization runs before first paint:

```html
<script>
  // Must run immediately, not in DOMContentLoaded
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark')
  }
</script>
```

#### 3. Table Sorting Not Working

**Problem**: Click on sortable column header does nothing

**Solution**: Verify the sort script is included and table has correct ID:

```typescript
const tableData: TableData = {
  tableId: 'my-table', // Required for sorting
  columns: [
    { key: 'name', label: 'Name', sortable: true, sortType: 'string' }
  ],
  rows: data
}
```

#### 4. Form Validation Errors Not Showing

**Problem**: HTMX form submission doesn't show errors

**Solution**: Server must return partial HTML for the target:

```typescript
// Server-side route
app.post('/admin/content/create', async (c) => {
  try {
    // ... validation
  } catch (error) {
    // Return alert HTML for hx-target
    return c.html(renderAlert({
      type: 'error',
      message: error.message
    }))
  }
})
```

#### 5. Alpine.js Reactivity Issues

**Problem**: Alpine.js variables not updating

**Solution**: Ensure `x-data` is on parent element:

```html
<!-- Bad -->
<div>
  <button @click="open = true">Open</button>
  <div x-show="open">Content</div>
</div>

<!-- Good -->
<div x-data="{ open: false }">
  <button @click="open = true">Open</button>
  <div x-show="open">Content</div>
</div>
```

### Debug Tools

#### HTMX Logging

```html
<script>
  htmx.logAll() // Enable verbose HTMX logging
</script>
```

#### Template Debugging

```typescript
export function debugTemplate<T>(
  name: string,
  renderFn: (data: T) => string,
  data: T
): string {
  console.log(`Rendering template: ${name}`, data)
  try {
    const result = renderFn(data)
    console.log(`Template ${name} rendered successfully`)
    return result
  } catch (error) {
    console.error(`Template ${name} error:`, error)
    return `<div class="error">Rendering Error: ${error.message}</div>`
  }
}
```

## Related Resources

- **Getting Started**: [getting-started.md](getting-started.md)
- **API Reference**: [api-reference.md](api-reference.md)
- **Database Schema**: [database.md](database.md)
- **Authentication**: [authentication.md](authentication.md)

## External Documentation

- [HTMX Documentation](https://htmx.org/docs/)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Hono Framework](https://hono.dev/)

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
