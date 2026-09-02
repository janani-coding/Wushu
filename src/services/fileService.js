import { compressImage } from '@/utils/imageOptimizer'

/**
 * File Storage API Client for MongoDB GridFS with Sharp Compression
 * Handles client-side validation, server-side Sharp processing, and GridFS streaming.
 */

const API_BASE_URL = '/api'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']

export class FileStorageService {
  /**
   * Validate file format and size
   */
  validateFile(file) {
    if (!file) throw new Error('No file selected.')

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed 10 MB limit.`)
    }

    // Check MIME type or extension
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : ''
    const mime = file.type ? file.type.toLowerCase() : ''

    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext)
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(mime)

    if (!isAllowedExt && !isAllowedMime && mime) {
      throw new Error('Unsupported file format. Please upload JPG, JPEG, PNG, WEBP, or PDF files.')
    }

    return true
  }

  /**
   * Upload a File or DataURL Image to MongoDB GridFS
   * @param {File | Blob | String} fileOrDataUrl - The image/file object or base64 data string
   * @param {String} category - Category tag e.g. 'profile', 'certificate', 'medal', 'gallery', 'tournament', 'logo'
   * @param {Function} onStatusChange - Optional callback for user feedback ('Optimizing image...', 'Uploading...')
   * @returns {Promise<{ fileId: String, fileUrl: String }>}
   */
  async uploadFile(fileOrDataUrl, category = 'general', onStatusChange = null) {
    try {
      let blobToUpload = fileOrDataUrl
      let fileName = `upload_${Date.now()}.jpg`

      if (onStatusChange) onStatusChange('Optimizing image...')

      // Handle String input (data URL or external URL)
      if (typeof fileOrDataUrl === 'string') {
        if (fileOrDataUrl.startsWith('data:')) {
          const compressedDataUrl = await compressImage(fileOrDataUrl, 1000, 1000, 0.8)
          const res = await fetch(compressedDataUrl)
          blobToUpload = await res.blob()
        } else if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
          // External URL backward compatibility
          return { fileId: null, fileUrl: fileOrDataUrl }
        }
      } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
        if (fileOrDataUrl instanceof File) {
          this.validateFile(fileOrDataUrl)
          fileName = fileOrDataUrl.name
        }

        // Compress image client-side before sending if image MIME
        if (fileOrDataUrl.type && fileOrDataUrl.type.startsWith('image/')) {
          const compressedDataUrl = await compressImage(fileOrDataUrl, 1200, 1200, 0.82)
          const res = await fetch(compressedDataUrl)
          blobToUpload = await res.blob()
        }
      }

      if (onStatusChange) onStatusChange('Uploading to MongoDB GridFS...')

      const formData = new FormData()
      formData.append('file', blobToUpload, fileName)
      formData.append('category', category)

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson.error || `Upload failed with HTTP status ${response.status}`)
      }

      const data = await response.json()
      if (data && data.fileUrl) {
        return {
          fileId: data.fileId,
          fileUrl: data.fileUrl,
          originalSize: data.originalSize,
          compressedSize: data.compressedSize
        }
      }

      throw new Error('Upload server returned invalid response format.')
    } catch (err) {
      console.warn('MongoDB GridFS upload warning:', err.message)
      if (typeof fileOrDataUrl === 'string') {
        return { fileId: null, fileUrl: fileOrDataUrl }
      }
      throw err
    }
  }

  /**
   * Delete a File from MongoDB GridFS by ID
   */
  async deleteFile(fileId) {
    if (!fileId) return true
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (err) {
      console.error('Delete MongoDB GridFS file error:', err)
      return false
    }
  }

  /**
   * Helper to format image URL correctly
   */
  getFileUrl(fileIdOrUrl) {
    if (!fileIdOrUrl) return ''
    if (typeof fileIdOrUrl !== 'string') return ''
    if (
      fileIdOrUrl.startsWith('http://') || 
      fileIdOrUrl.startsWith('https://') || 
      fileIdOrUrl.startsWith('data:') || 
      fileIdOrUrl.startsWith('/') ||
      fileIdOrUrl.startsWith('blob:')
    ) {
      return fileIdOrUrl
    }
    return `${API_BASE_URL}/files/${fileIdOrUrl}`
  }
}

export const fileService = new FileStorageService()
