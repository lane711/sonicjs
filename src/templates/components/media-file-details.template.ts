import { MediaFile } from './media-grid.template'

export interface MediaFileDetailsData {
  file: MediaFile & {
    width?: number
    height?: number
    folder: string
    uploadedAt: string
  }
}

export function renderMediaFileDetails(data: MediaFileDetailsData): string {
  const { file } = data
  
  return `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-white">File Details</h3>
      <button onclick="document.getElementById('file-modal').classList.add('hidden')" class="text-gray-300 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Preview -->
      <div class="space-y-4">
        <div class="backdrop-blur-sm bg-white/10 rounded-xl p-4">
          ${file.isImage ? `
            <img src="${file.public_url}" alt="${file.alt || file.filename}" class="w-full h-auto rounded">
          ` : file.isVideo ? `
            <video src="${file.public_url}" controls class="w-full h-auto rounded"></video>
          ` : `
            <div class="flex items-center justify-center h-32">
              <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          `}
        </div>
        
        <div class="text-center">
          <button 
            onclick="copyToClipboard('${file.public_url}')"
            class="px-4 py-2 backdrop-blur-sm bg-white/20 text-white rounded-xl border border-white/20 hover:bg-white/30 transition-all mr-2"
          >
            Copy URL
          </button>
          <a 
            href="${file.public_url}" 
            target="_blank"
            class="px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white"
          >
            Open Original
          </a>
        </div>
      </div>
      
      <!-- Details -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white mb-1">Filename</label>
          <p class="text-sm text-gray-300">${file.original_name}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-1">Size</label>
            <p class="text-sm text-gray-300">${file.fileSize}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-1">Type</label>
            <p class="text-sm text-gray-300">${file.mime_type}</p>
          </div>
        </div>
        
        ${file.width && file.height ? `
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-1">Width</label>
              <p class="text-sm text-gray-300">${file.width}px</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-1">Height</label>
              <p class="text-sm text-gray-300">${file.height}px</p>
            </div>
          </div>
        ` : ''}
        
        <div>
          <label class="block text-sm font-medium text-white mb-1">Folder</label>
          <p class="text-sm text-gray-300">${file.folder}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-white mb-1">Uploaded</label>
          <p class="text-sm text-gray-300">${file.uploadedAt}</p>
        </div>
        
        <!-- Editable Fields -->
        <form hx-put="/admin/media/${file.id}" hx-target="#file-modal-content" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white mb-1">Alt Text</label>
            <input 
              type="text" 
              name="alt" 
              value="${file.alt || ''}"
              class="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-300"
              placeholder="Describe this image..."
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white mb-1">Caption</label>
            <textarea 
              name="caption" 
              rows="3"
              class="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-300"
              placeholder="Optional caption..."
            >${file.caption || ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white mb-1">Tags</label>
            <input 
              type="text" 
              name="tags" 
              value="${file.tags.join(', ')}"
              class="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-300"
              placeholder="tag1, tag2, tag3"
            >
          </div>
          
          <div class="flex justify-between">
            <button 
              type="submit"
              class="px-4 py-2 backdrop-blur-sm bg-green-500/80 text-white rounded-xl border border-white/20 hover:bg-green-500 transition-all"
            >
              Save Changes
            </button>
            <button 
              type="button"
              hx-delete="/admin/media/${file.id}"
              hx-confirm="Are you sure you want to delete this file?"
              hx-target="body"
              class="px-4 py-2 backdrop-blur-sm bg-red-500/80 text-white rounded-xl border border-white/20 hover:bg-red-500 transition-all"
            >
              Delete File
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}