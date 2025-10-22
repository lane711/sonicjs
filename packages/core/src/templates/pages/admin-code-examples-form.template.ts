import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderAlert } from '../alert.template'

interface CodeExample {
  id?: number
  title: string
  description?: string
  code: string
  language: string
  category?: string
  tags?: string
  isPublished: boolean
  sortOrder: number
}

interface CodeExamplesFormData {
  codeExample?: CodeExample
  isEdit: boolean
  errors?: Record<string, string[]>
  user?: { name: string; email: string; role: string }
  message?: string
  messageType?: 'success' | 'error' | 'warning' | 'info'
}

export function renderCodeExamplesForm(data: CodeExamplesFormData): string {
  const { codeExample, isEdit, errors, message, messageType } = data
  const pageTitle = isEdit ? 'Edit Code Example' : 'New Code Example'

  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">${pageTitle}</h1>
          <p class="mt-2 text-sm text-gray-300">
            ${isEdit ? 'Update the code example details below' : 'Create a new code snippet or example'}
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/code-examples"
             class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </a>
        </div>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Form -->
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl">
        <form ${isEdit ? `hx-put="/admin/code-examples/${codeExample?.id}"` : 'hx-post="/admin/code-examples"'}
              hx-target="body"
              hx-swap="outerHTML"
              class="space-y-6 p-6">

          <!-- Basic Information Section -->
          <div>
            <h2 class="text-lg font-medium text-white mb-4">Basic Information</h2>

            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-white">
                Title <span class="text-red-400">*</span>
              </label>
              <div class="mt-1">
                <input type="text"
                       name="title"
                       id="title"
                       value="${codeExample?.title || ''}"
                       required
                       maxlength="200"
                       class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                       placeholder="e.g., React useState Hook Example">
              </div>
              ${errors?.title ? `
                <div class="mt-1">
                  ${errors.title.map(error => `
                    <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-white">Description</label>
              <div class="mt-1">
                <textarea name="description"
                          id="description"
                          rows="3"
                          maxlength="500"
                          class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-purple-400 focus:outline-none transition-colors w-full"
                          placeholder="Briefly describe what this code example demonstrates...">${codeExample?.description || ''}</textarea>
                <p class="mt-1 text-sm text-gray-300">
                  <span id="description-count">0</span>/500 characters
                </p>
              </div>
              ${errors?.description ? `
                <div class="mt-1">
                  ${errors.description.map(error => `
                    <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Language -->
              <div>
                <label for="language" class="block text-sm font-medium text-white">
                  Language <span class="text-red-400">*</span>
                </label>
                <div class="mt-1">
                  <select name="language"
                          id="language"
                          required
                          class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6">
                    <option value="">Select language...</option>
                    <option value="javascript" ${codeExample?.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                    <option value="typescript" ${codeExample?.language === 'typescript' ? 'selected' : ''}>TypeScript</option>
                    <option value="python" ${codeExample?.language === 'python' ? 'selected' : ''}>Python</option>
                    <option value="go" ${codeExample?.language === 'go' ? 'selected' : ''}>Go</option>
                    <option value="rust" ${codeExample?.language === 'rust' ? 'selected' : ''}>Rust</option>
                    <option value="java" ${codeExample?.language === 'java' ? 'selected' : ''}>Java</option>
                    <option value="php" ${codeExample?.language === 'php' ? 'selected' : ''}>PHP</option>
                    <option value="ruby" ${codeExample?.language === 'ruby' ? 'selected' : ''}>Ruby</option>
                    <option value="sql" ${codeExample?.language === 'sql' ? 'selected' : ''}>SQL</option>
                  </select>
                </div>
                ${errors?.language ? `
                  <div class="mt-1">
                    ${errors.language.map(error => `
                      <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <!-- Category -->
              <div>
                <label for="category" class="block text-sm font-medium text-white">Category</label>
                <div class="mt-1">
                  <input type="text"
                         name="category"
                         id="category"
                         value="${codeExample?.category || ''}"
                         maxlength="50"
                         class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                         placeholder="e.g., frontend, backend">
                </div>
                ${errors?.category ? `
                  <div class="mt-1">
                    ${errors.category.map(error => `
                      <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <!-- Tags -->
              <div>
                <label for="tags" class="block text-sm font-medium text-white">Tags</label>
                <div class="mt-1">
                  <input type="text"
                         name="tags"
                         id="tags"
                         value="${codeExample?.tags || ''}"
                         maxlength="200"
                         class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                         placeholder="e.g., react, hooks, state">
                  <p class="mt-1 text-sm text-gray-300">Comma-separated tags</p>
                </div>
                ${errors?.tags ? `
                  <div class="mt-1">
                    ${errors.tags.map(error => `
                      <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Code Section -->
          <div>
            <h2 class="text-lg font-medium text-white mb-4">Code</h2>

            <!-- Code Editor -->
            <div class="mb-4">
              <label for="code" class="block text-sm font-medium text-white">
                Code <span class="text-red-400">*</span>
              </label>
              <div class="mt-1">
                <textarea name="code"
                          id="code"
                          rows="20"
                          required
                          class="backdrop-blur-sm bg-gray-800/90 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:border-purple-400 focus:outline-none transition-colors w-full font-mono text-sm"
                          placeholder="Paste your code here...">${codeExample?.code || ''}</textarea>
                <p class="mt-1 text-sm text-gray-300">
                  <span id="code-count">0</span> characters
                </p>
              </div>
              ${errors?.code ? `
                <div class="mt-1">
                  ${errors.code.map(error => `
                    <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Status and Sort Order Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Published Status -->
            <div>
              <label class="block text-sm font-medium text-white">Status</label>
              <div class="mt-2 space-y-2">
                <div class="flex items-center">
                  <input id="published"
                         name="isPublished"
                         type="radio"
                         value="true"
                         ${!codeExample || codeExample.isPublished ? 'checked' : ''}
                         class="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-600 bg-gray-700">
                  <label for="published" class="ml-2 block text-sm text-white">
                    Published <span class="text-gray-300">(visible to users)</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="draft"
                         name="isPublished"
                         type="radio"
                         value="false"
                         ${codeExample && !codeExample.isPublished ? 'checked' : ''}
                         class="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-600 bg-gray-700">
                  <label for="draft" class="ml-2 block text-sm text-white">
                    Draft <span class="text-gray-300">(not visible to users)</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Sort Order -->
            <div>
              <label for="sortOrder" class="block text-sm font-medium text-white">Sort Order</label>
              <div class="mt-1">
                <input type="number"
                       name="sortOrder"
                       id="sortOrder"
                       value="${codeExample?.sortOrder || 0}"
                       min="0"
                       step="1"
                       class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6">
                <p class="mt-1 text-sm text-gray-300">Lower numbers appear first (0 = highest priority)</p>
              </div>
              ${errors?.sortOrder ? `
                <div class="mt-1">
                  ${errors.sortOrder.map(error => `
                    <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-white/20">
            <a href="/admin/code-examples"
               class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all">
              Cancel
            </a>
            <button type="submit"
                    class="inline-flex items-center justify-center rounded-xl backdrop-blur-sm bg-purple-500/80 px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-purple-500 transition-all">
              <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              ${isEdit ? 'Update Code Example' : 'Create Code Example'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      // Character count for description
      const descriptionTextarea = document.getElementById('description');
      const descriptionCount = document.getElementById('description-count');

      function updateDescriptionCount() {
        descriptionCount.textContent = descriptionTextarea.value.length;
      }

      descriptionTextarea.addEventListener('input', updateDescriptionCount);
      updateDescriptionCount(); // Initial count

      // Character count for code
      const codeTextarea = document.getElementById('code');
      const codeCount = document.getElementById('code-count');

      function updateCodeCount() {
        codeCount.textContent = codeTextarea.value.length;
      }

      codeTextarea.addEventListener('input', updateCodeCount);
      updateCodeCount(); // Initial count
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: `${pageTitle} - Admin`,
    pageTitle,
    currentPath: isEdit ? `/admin/code-examples/${codeExample?.id}` : '/admin/code-examples/new',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
