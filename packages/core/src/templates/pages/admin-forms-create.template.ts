import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'
import { renderForm } from '../components/form.template'

export interface FormCreatePageData {
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderFormCreatePage(data: FormCreatePageData): string {
  const pageContent = `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <a href="/admin/forms" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Create New Form</h1>
            <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Enter basic information to create your form. You'll be able to add fields in the builder.</p>
          </div>
        </div>
      </div>

      <!-- Form Messages -->
      ${data.error ? `
        <div class="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            <p class="ml-3 text-sm text-red-700 dark:text-red-300">${data.error}</p>
          </div>
        </div>
      ` : ''}

      ${data.success ? `
        <div class="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            <p class="ml-3 text-sm text-green-700 dark:text-green-300">${data.success}</p>
          </div>
        </div>
      ` : ''}

      <!-- Create Form -->
      <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-950/5 dark:border-white/10 overflow-hidden">
        <form method="POST" action="/admin/forms" class="divide-y divide-zinc-950/5 dark:divide-white/10">
          <!-- Form Details -->
          <div class="px-6 py-8 space-y-6">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Form Name
                <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                pattern="[a-z0-9_]+"
                placeholder="contact_form"
                class="block w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Lowercase letters, numbers, and underscores only. Used in URLs and API.
              </p>
            </div>

            <!-- Display Name -->
            <div>
              <label for="displayName" class="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Display Name
                <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                required
                placeholder="Contact Form"
                class="block w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Human-readable name shown in the admin interface.
              </p>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Brief description of this form's purpose..."
                class="block w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                class="block w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="general" selected>General</option>
                <option value="contact">Contact</option>
                <option value="survey">Survey</option>
                <option value="registration">Registration</option>
                <option value="feedback">Feedback</option>
              </select>
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Helps organize forms in the admin panel.
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
            <a
              href="/admin/forms"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </a>
            <button
              type="submit"
              class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create & Open Builder
            </button>
          </div>
        </form>
      </div>

      <!-- Info Box -->
      <div class="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
        <div class="flex">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300">What happens next?</h3>
            <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>After creating your form, you'll be taken to the Form Builder where you can:</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Drag and drop fields onto your form</li>
                <li>Configure field properties and validation</li>
                <li>Add conditional logic</li>
                <li>Preview your form in real-time</li>
                <li>Publish when ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      // Auto-generate form name from display name
      const displayNameInput = document.getElementById('displayName');
      const nameInput = document.getElementById('name');
      let nameManuallyEdited = false;

      nameInput.addEventListener('input', () => {
        nameManuallyEdited = nameInput.value.length > 0;
      });

      displayNameInput.addEventListener('input', (e) => {
        if (!nameManuallyEdited) {
          const value = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          nameInput.value = value;
        }
      });
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Create Form',
    content: pageContent,
    user: data.user,
    version: data.version
  }

  return renderAdminLayoutCatalyst(layoutData)
}
