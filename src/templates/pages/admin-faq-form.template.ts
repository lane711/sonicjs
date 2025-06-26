import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderForm } from '../components/form.template'
import { renderAlert } from '../components/alert.template'

interface FAQ {
  id?: number
  question: string
  answer: string
  category?: string
  tags?: string
  isPublished: boolean
  sortOrder: number
}

interface FAQFormData {
  faq?: FAQ
  isEdit: boolean
  errors?: Record<string, string[]>
  user?: { name: string; email: string; role: string }
  message?: string
  messageType?: 'success' | 'error' | 'warning' | 'info'
}

export function renderFAQForm(data: FAQFormData): string {
  const { faq, isEdit, errors, message, messageType } = data
  const pageTitle = isEdit ? 'Edit FAQ' : 'New FAQ'

  const pageContent = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-100">${pageTitle}</h1>
          <p class="mt-2 text-sm text-gray-400">
            ${isEdit ? 'Update the FAQ details below' : 'Create a new frequently asked question'}
          </p>
        </div>
        <a href="/admin/faq" 
           class="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </a>
      </div>

      ${message ? renderAlert({ type: messageType || 'info', message, dismissible: true }) : ''}

      <!-- Form -->
      <div class="bg-gray-800 shadow rounded-lg">
        <form ${isEdit ? `hx-put="/admin/faq/${faq?.id}"` : 'hx-post="/admin/faq"'} 
              hx-target="body" 
              hx-swap="outerHTML"
              class="space-y-6 p-6">
          
          <!-- Question -->
          <div>
            <label for="question" class="block text-sm font-medium text-gray-300">
              Question <span class="text-red-400">*</span>
            </label>
            <div class="mt-1">
              <textarea name="question" 
                        id="question" 
                        rows="3" 
                        required
                        maxlength="500"
                        class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Enter the frequently asked question...">${faq?.question || ''}</textarea>
              <p class="mt-1 text-sm text-gray-400">
                <span id="question-count">0</span>/500 characters
              </p>
            </div>
            ${errors?.question ? `
              <div class="mt-1">
                ${errors.question.map(error => `
                  <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Answer -->
          <div>
            <label for="answer" class="block text-sm font-medium text-gray-300">
              Answer <span class="text-red-400">*</span>
            </label>
            <div class="mt-1">
              <textarea name="answer" 
                        id="answer" 
                        rows="6" 
                        required
                        maxlength="2000"
                        class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Enter the detailed answer...">${faq?.answer || ''}</textarea>
              <p class="mt-1 text-sm text-gray-400">
                <span id="answer-count">0</span>/2000 characters. You can use basic HTML for formatting.
              </p>
            </div>
            ${errors?.answer ? `
              <div class="mt-1">
                ${errors.answer.map(error => `
                  <p class="text-sm text-red-400">${escapeHtml(error)}</p>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Category and Tags Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-300">Category</label>
              <div class="mt-1">
                <select name="category" 
                        id="category" 
                        class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
                  <option value="">Select a category</option>
                  <option value="general" ${faq?.category === 'general' ? 'selected' : ''}>General</option>
                  <option value="technical" ${faq?.category === 'technical' ? 'selected' : ''}>Technical</option>
                  <option value="billing" ${faq?.category === 'billing' ? 'selected' : ''}>Billing</option>
                  <option value="support" ${faq?.category === 'support' ? 'selected' : ''}>Support</option>
                  <option value="account" ${faq?.category === 'account' ? 'selected' : ''}>Account</option>
                  <option value="features" ${faq?.category === 'features' ? 'selected' : ''}>Features</option>
                </select>
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
              <label for="tags" class="block text-sm font-medium text-gray-300">Tags</label>
              <div class="mt-1">
                <input type="text" 
                       name="tags" 
                       id="tags" 
                       value="${faq?.tags || ''}"
                       class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                       placeholder="e.g., payment, setup, troubleshooting">
                <p class="mt-1 text-sm text-gray-400">Separate multiple tags with commas</p>
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

          <!-- Status and Sort Order Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Published Status -->
            <div>
              <label class="block text-sm font-medium text-gray-300">Status</label>
              <div class="mt-2 space-y-2">
                <div class="flex items-center">
                  <input id="published" 
                         name="isPublished" 
                         type="radio" 
                         value="true"
                         ${!faq || faq.isPublished ? 'checked' : ''}
                         class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 bg-gray-700">
                  <label for="published" class="ml-2 block text-sm text-gray-300">
                    Published <span class="text-gray-400">(visible to users)</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="draft" 
                         name="isPublished" 
                         type="radio" 
                         value="false"
                         ${faq && !faq.isPublished ? 'checked' : ''}
                         class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 bg-gray-700">
                  <label for="draft" class="ml-2 block text-sm text-gray-300">
                    Draft <span class="text-gray-400">(not visible to users)</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Sort Order -->
            <div>
              <label for="sortOrder" class="block text-sm font-medium text-gray-300">Sort Order</label>
              <div class="mt-1">
                <input type="number" 
                       name="sortOrder" 
                       id="sortOrder" 
                       value="${faq?.sortOrder || 0}"
                       min="0"
                       step="1"
                       class="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
                <p class="mt-1 text-sm text-gray-400">Lower numbers appear first (0 = highest priority)</p>
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
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <a href="/admin/faq" 
               class="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </a>
            <button type="submit" 
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              ${isEdit ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      // Character count for question
      const questionTextarea = document.getElementById('question');
      const questionCount = document.getElementById('question-count');
      
      function updateQuestionCount() {
        questionCount.textContent = questionTextarea.value.length;
      }
      
      questionTextarea.addEventListener('input', updateQuestionCount);
      updateQuestionCount(); // Initial count

      // Character count for answer
      const answerTextarea = document.getElementById('answer');
      const answerCount = document.getElementById('answer-count');
      
      function updateAnswerCount() {
        answerCount.textContent = answerTextarea.value.length;
      }
      
      answerTextarea.addEventListener('input', updateAnswerCount);
      updateAnswerCount(); // Initial count
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: `${pageTitle} - Admin`,
    pageTitle,
    currentPath: isEdit ? `/admin/faq/${faq?.id}` : '/admin/faq/new',
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