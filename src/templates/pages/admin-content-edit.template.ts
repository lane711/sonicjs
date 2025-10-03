import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderAlert } from '../components/alert.template'

export interface ContentModel {
  name: string
  displayName: string
  fields?: any
}

export interface ContentItem {
  id: string
  title: string
  slug: string
  status: string
  data: any
  collection_id: string
  created_at: string
  updated_at: string
}

export interface ContentEditPageData {
  content: ContentItem
  models: ContentModel[]
  selectedModel?: ContentModel
  error?: string
  user: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderContentEditPage(data: ContentEditPageData): string {
  const { content, models, selectedModel, error, user } = data

  // Build dynamic fields from model configuration
  let dynamicFieldsHtml = ''
  if (selectedModel?.fields) {
    Object.entries(selectedModel.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const fieldValue = content.data[fieldName] || ''
      const label = fieldConfig.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      const placeholder = fieldConfig.placeholder || `Enter ${fieldName}`
      const required = fieldConfig.required || false

      if (fieldConfig.type === 'textarea' || fieldConfig.type === 'rich_text') {
        dynamicFieldsHtml += `
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">${label}${required ? ' *' : ''}</label>
            <textarea
              name="${fieldName}"
              rows="4"
              ${required ? 'required' : ''}
              placeholder="${placeholder}"
              class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
            >${fieldValue}</textarea>
          </div>
        `
      } else {
        dynamicFieldsHtml += `
          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">${label}${required ? ' *' : ''}</label>
            <input
              type="text"
              name="${fieldName}"
              value="${fieldValue}"
              ${required ? 'required' : ''}
              placeholder="${placeholder}"
              class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
            />
          </div>
        `
      }
    })
  }

  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <a href="/admin/content" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Edit Content</h1>
          </div>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Update content details and metadata</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="submit"
            form="edit-content-form"
            class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Save Changes
          </button>
          <a
            href="/admin/content"
            class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            Cancel
          </a>
        </div>
      </div>

      <!-- Alert Messages -->
      <div id="form-response">
        ${error ? renderAlert({ type: 'error', message: error, dismissible: true }) : ''}
      </div>

      <!-- Content Edit Form -->
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8">
        <form id="edit-content-form" hx-post="/admin/content/${content.id}/edit" hx-target="#form-response">

          <!-- Basic Information -->
          <div class="mb-8">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value="${content.title}"
                  required
                  placeholder="Enter content title"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value="${content.slug}"
                  required
                  placeholder="enter-url-slug"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
                />
              </div>

              <div>
                <label for="status" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status *</label>
                <div class="mt-2 grid grid-cols-1">
                  <select
                    id="status"
                    name="status"
                    required
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 sm:text-sm/6"
                  >
                    <option value="draft" ${content.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="review" ${content.status === 'review' ? 'selected' : ''}>In Review</option>
                    <option value="published" ${content.status === 'published' ? 'selected' : ''}>Published</option>
                    <option value="archived" ${content.status === 'archived' ? 'selected' : ''}>Archived</option>
                  </select>
                  <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-600 dark:text-zinc-400 sm:size-4">
                    <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Fields -->
          ${dynamicFieldsHtml ? `
          <div class="mb-8">
            <h3 class="text-base font-semibold text-zinc-950 dark:text-white mb-4">Content Fields</h3>
            <div class="grid grid-cols-1 gap-6">
              ${dynamicFieldsHtml}
            </div>
          </div>
          ` : ''}

        </form>
      </div>
    </div>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: `Edit: ${content.title}`,
    pageTitle: 'Edit Content',
    currentPath: '/admin/content',
    user,
    version: data.version,
    content: pageContent
  }

  return renderAdminLayoutCatalyst(layoutData)
}