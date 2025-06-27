import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderMediaGrid, MediaFile, MediaGridData } from '../components/media-grid.template'

export interface FolderStats {
  folder: string
  count: number
  totalSize: number
}

export interface TypeStats {
  type: string
  count: number
}

export interface MediaLibraryPageData {
  files: MediaFile[]
  folders: FolderStats[]
  types: TypeStats[]
  currentFolder: string
  currentType: string
  currentView: 'grid' | 'list'
  currentPage: number
  totalFiles: number
  hasNextPage: boolean
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderMediaLibraryPage(data: MediaLibraryPageData): string {
  const pageContent = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">
        <!-- Sidebar -->
        <div class="w-64 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6">
          <div class="space-y-6">
            <!-- Upload Button -->
            <div>
              <button 
                class="w-full px-4 py-2 backdrop-blur-sm bg-white/20 text-white rounded-xl border border-white/20 hover:bg-white/30 transition-all"
                onclick="document.getElementById('upload-modal').classList.remove('hidden')"
              >
                Upload Files
              </button>
            </div>
            
            <!-- Folders -->
            <div>
              <h3 class="text-sm font-medium text-white mb-3">Folders</h3>
              <ul class="space-y-1">
                <li>
                  <a href="/admin/media?folder=all" 
                     class="block px-3 py-2 text-sm rounded-xl transition-all ${data.currentFolder === 'all' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}">'
                    All Files (${data.totalFiles})
                  </a>
                </li>
                ${data.folders.map(folder => `
                  <li>
                    <a href="/admin/media?folder=${folder.folder}" 
                       class="block px-3 py-2 text-sm rounded-xl transition-all ${data.currentFolder === folder.folder ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}">'
                      ${folder.folder} (${folder.count})
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <!-- File Types -->
            <div>
              <h3 class="text-sm font-medium text-white mb-3">File Types</h3>
              <ul class="space-y-1">
                <li>
                  <a href="/admin/media?type=all" 
                     class="block px-3 py-2 text-sm rounded-xl transition-all ${data.currentType === 'all' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}">'
                    All Types
                  </a>
                </li>
                ${data.types.map(type => `
                  <li>
                    <a href="/admin/media?type=${type.type}" 
                       class="block px-3 py-2 text-sm rounded-xl transition-all ${data.currentType === type.type ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}">'
                      ${type.type.charAt(0).toUpperCase() + type.type.slice(1)} (${type.count})
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <!-- Quick Actions -->
            <div>
              <h3 class="text-sm font-medium text-white mb-3">Quick Actions</h3>
              <div class="space-y-2">
                <button class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  Create Folder
                </button>
                <button 
                  class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  hx-delete="/media/cleanup"
                  hx-confirm="Delete unused files?"
                >
                  Cleanup Unused
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1">
          <!-- Toolbar -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-4 mb-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-white">View:</label>
                  <select 
                    class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-1 text-sm text-white"
                    onchange="window.location.href = updateUrlParam('view', this.value)"
                  >
                    <option value="grid" ${data.currentView === 'grid' ? 'selected' : ''}>Grid</option>
                    <option value="list" ${data.currentView === 'list' ? 'selected' : ''}>List</option>
                  </select>
                </div>
                
                <div class="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Search files..." 
                    class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-1 text-sm w-64 text-white placeholder-gray-300"
                    hx-get="/admin/media/search"
                    hx-trigger="keyup changed delay:300ms"
                    hx-target="#media-grid"
                    hx-include="[name='folder'], [name='type']"
                  >
                  <input type="hidden" name="folder" value="${data.currentFolder}">
                  <input type="hidden" name="type" value="${data.currentType}">
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-300">${data.files.length} files</span>
                <button 
                  id="select-all-btn"
                  class="px-3 py-1 text-sm backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white"
                  onclick="toggleSelectAll()"
                >
                  Select All
                </button>
                <button 
                  id="bulk-actions-btn"
                  class="px-3 py-1 text-sm bg-black/20 text-gray-400 rounded-xl cursor-not-allowed"
                  disabled
                >
                  Bulk Actions
                </button>
              </div>
            </div>
          </div>
          
          <!-- Media Grid -->
          <div id="media-grid">
            ${renderMediaGrid({
              files: data.files,
              viewMode: data.currentView,
              selectable: true,
              emptyMessage: 'No media files found. Upload your first file to get started.'
            })}
          </div>
          
          <!-- Pagination -->
          ${data.hasNextPage ? `
            <div class="mt-6 flex justify-center">
              <div class="flex space-x-2">
                ${data.currentPage > 1 ? `
                  <a href="${buildPageUrl(data.currentPage - 1, data.currentFolder, data.currentType)}" 
                     class="px-3 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-sm hover:bg-white/20 transition-all text-white">'
                    Previous
                  </a>
                ` : ''}
                <span class="px-3 py-2 text-sm text-gray-300">Page ${data.currentPage}</span>
                <a href="${buildPageUrl(data.currentPage + 1, data.currentFolder, data.currentType)}" 
                   class="px-3 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-sm hover:bg-white/20 transition-all text-white">'
                  Next
                </a>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div id="upload-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-white">Upload Files</h3>
          <button onclick="document.getElementById('upload-modal').classList.add('hidden')" class="text-gray-300 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Upload Form -->
        <form 
          id="upload-form"
          hx-post="/admin/media/upload"
          hx-encoding="multipart/form-data"
          hx-target="#upload-results"
          class="space-y-4"
        >
          <!-- Drag and Drop Zone -->
          <div 
            id="upload-zone"
            class="upload-zone border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer backdrop-blur-sm bg-white/10"
            onclick="document.getElementById('file-input').click()"
          >
            <svg class="mx-auto h-12 w-12 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4">
              <p class="text-lg text-white">Drop files here or click to upload</p>
              <p class="text-sm text-gray-300">PNG, JPG, GIF, PDF up to 10MB</p>
            </div>
          </div>
          
          <input 
            type="file" 
            id="file-input" 
            name="files" 
            multiple 
            accept="image/*,application/pdf,text/plain"
            class="hidden"
            onchange="handleFileSelect(this.files)"
          >
          
          <!-- Folder Selection -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">Upload to folder:</label>
            <select name="folder" class="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white">
              <option value="uploads">uploads</option>
              <option value="images">images</option>
              <option value="documents">documents</option>
            </select>
          </div>
          
          <!-- File List -->
          <div id="file-list" class="hidden">
            <h4 class="text-sm font-medium text-white mb-2">Selected Files:</h4>
            <div id="selected-files" class="space-y-2 max-h-40 overflow-y-auto"></div>
          </div>
          
          <!-- Upload Button -->
          <div class="flex justify-end space-x-2">
            <button 
              type="button" 
              onclick="document.getElementById('upload-modal').classList.add('hidden')"
              class="px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-sm hover:bg-white/20 transition-all text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              id="upload-btn"
              class="px-4 py-2 backdrop-blur-sm bg-white/20 text-white rounded-xl border border-white/20 hover:bg-white/30 disabled:opacity-50 transition-all"
              disabled
            >
              Upload Files
            </button>
          </div>
        </form>
        
        <!-- Upload Results -->
        <div id="upload-results" class="mt-4"></div>
      </div>
    </div>
    
    <!-- File Details Modal -->
    <div id="file-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div id="file-modal-content" class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <!-- Content loaded via HTMX -->
      </div>
    </div>
    
    <style>
      .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
      .media-item { position: relative; border-radius: 8px; overflow: hidden; transition: transform 0.2s; }
      .media-item:hover { transform: scale(1.02); }
      .media-item.selected { ring: 2px solid rgba(255, 255, 255, 0.4); }
      .upload-zone { border: 2px dashed rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1); min-height: 200px; }
      .upload-zone.dragover { border-color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.2); }
      .file-icon { width: 48px; height: 48px; }
      .preview-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.2s; }
      .media-item:hover .preview-overlay { opacity: 1; }
    </style>
    
    <script>
      let selectedFiles = new Set();
      let dragDropFiles = [];
      
      // File selection handling
      function toggleFileSelection(fileId) {
        if (selectedFiles.has(fileId)) {
          selectedFiles.delete(fileId);
          document.querySelector(\`[data-file-id="\${fileId}"]\`).classList.remove('selected');
        } else {
          selectedFiles.add(fileId);
          document.querySelector(\`[data-file-id="\${fileId}"]\`).classList.add('selected');
        }
        updateBulkActionsButton();
      }
      
      function toggleSelectAll() {
        const allItems = document.querySelectorAll('[data-file-id]');
        if (selectedFiles.size === allItems.length) {
          selectedFiles.clear();
          allItems.forEach(item => item.classList.remove('selected'));
          document.getElementById('select-all-btn').textContent = 'Select All';
        } else {
          allItems.forEach(item => {
            const fileId = item.dataset.fileId;
            selectedFiles.add(fileId);
            item.classList.add('selected');
          });
          document.getElementById('select-all-btn').textContent = 'Deselect All';
        }
        updateBulkActionsButton();
      }
      
      function updateBulkActionsButton() {
        const btn = document.getElementById('bulk-actions-btn');
        if (selectedFiles.size > 0) {
          btn.disabled = false;
          btn.className = 'px-3 py-1 text-sm backdrop-blur-sm bg-white/20 text-white rounded-xl border border-white/20 hover:bg-white/30 transition-all';
          btn.textContent = \`Actions (\${selectedFiles.size})\`;
        } else {
          btn.disabled = true;
          btn.className = 'px-3 py-1 text-sm bg-black/20 text-gray-400 rounded-xl cursor-not-allowed';
          btn.textContent = 'Bulk Actions';
        }
      }
      
      // URL parameter helpers
      function updateUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        return url.toString();
      }
      
      // Drag and drop handling
      const uploadZone = document.getElementById('upload-zone');
      
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
      });
      
      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
      });
      
      uploadZone.addEventListener('drop', handleDrop, false);
      
      function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFileSelect(files);
      }
      
      function handleFileSelect(files) {
        dragDropFiles = Array.from(files);
        
        // Update the actual file input with the selected files
        const fileInput = document.getElementById('file-input');
        const dt = new DataTransfer();
        dragDropFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        displaySelectedFiles();
        document.getElementById('upload-btn').disabled = false;
      }
      
      function displaySelectedFiles() {
        const fileList = document.getElementById('file-list');
        const selectedFilesDiv = document.getElementById('selected-files');
        
        selectedFilesDiv.innerHTML = '';
        
        dragDropFiles.forEach((file, index) => {
          const fileItem = document.createElement('div');
          fileItem.className = 'flex items-center justify-between p-2 backdrop-blur-sm bg-white/10 rounded-xl';
          fileItem.innerHTML = \`
            <div class="flex items-center space-x-2">
              <span class="text-sm text-white">\${file.name}</span>
              <span class="text-xs text-gray-300">(\${formatFileSize(file.size)})</span>
            </div>
            <button onclick="removeFile(\${index})" class="text-red-400 hover:text-red-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          \`;
          selectedFilesDiv.appendChild(fileItem);
        });
        
        fileList.classList.toggle('hidden', dragDropFiles.length === 0);
      }
      
      function removeFile(index) {
        dragDropFiles.splice(index, 1);
        displaySelectedFiles();
        
        const fileInput = document.getElementById('file-input');
        const dt = new DataTransfer();
        dragDropFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        document.getElementById('upload-btn').disabled = dragDropFiles.length === 0;
      }
      
      function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
      
      // Copy to clipboard function
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 backdrop-blur-xl bg-green-500/90 text-white px-4 py-2 rounded-xl shadow-2xl z-50';
          notification.textContent = 'URL copied to clipboard!';
          document.body.appendChild(notification);
          setTimeout(() => document.body.removeChild(notification), 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      }
      
      // Close modal when clicking outside
      document.getElementById('file-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    </script>
  `

  function buildPageUrl(page: number, folder: string, type: string): string {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (folder !== 'all') params.set('folder', folder)
    if (type !== 'all') params.set('type', type)
    return `/admin/media?${params.toString()}`
  }

  const layoutData: AdminLayoutData = {
    title: 'Media Library',
    pageTitle: 'Media Library',
    currentPath: '/admin/media',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}