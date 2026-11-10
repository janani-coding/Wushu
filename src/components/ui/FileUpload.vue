<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" class="block font-bold uppercase text-xs text-slate-300">
      {{ label }}
    </label>

    <!-- Main Container -->
    <div class="relative">
      
      <!-- Preview State (File or Image selected / uploaded) -->
      <div 
        v-if="currentPreview" 
        class="glass-panel p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-4 transition-all"
      >
        <div class="flex items-center space-x-3 overflow-hidden">
          <!-- Thumbnail / PDF Icon -->
          <div class="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="isImage" 
              :src="currentPreview" 
              alt="Uploaded file preview" 
              class="w-full h-full object-cover" 
              @error="onImageError"
            />
            <div v-else class="text-amber-400 font-bold text-xs flex flex-col items-center">
              <DocumentIcon class="w-6 h-6" />
              <span>PDF</span>
            </div>
          </div>

          <!-- File Info -->
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-slate-200 truncate">
              {{ selectedFileName || 'Uploaded File' }}
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
              <span v-if="selectedFileSize" class="text-amber-400 font-semibold">{{ formatFileSize(selectedFileSize) }}</span>
              <span class="text-slate-500">•</span>
              <span class="text-emerald-400 font-bold">Stored in GridFS</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button 
            type="button" 
            @click="triggerFileSelect" 
            :disabled="isUploading"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1"
          >
            <ArrowPathIcon class="w-3.5 h-3.5" />
            <span>Replace</span>
          </button>

          <button 
            type="button" 
            @click="removeFile" 
            :disabled="isUploading"
            class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-all"
            title="Remove File"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Drag & Drop Upload Zone (Empty State) -->
      <div 
        v-else 
        @dragover.prevent="isDragging = true" 
        @dragleave.prevent="isDragging = false" 
        @drop.prevent="handleDrop"
        @click="triggerFileSelect"
        :class="[
          'relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3',
          isDragging ? 'border-amber-400 bg-amber-500/10 shadow-glow-gold' : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/40 hover:bg-slate-900/80',
          isUploading ? 'pointer-events-none opacity-60' : ''
        ]"
      >
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <CloudArrowUpIcon class="w-6 h-6 animate-bounce-subtle" />
        </div>

        <div>
          <p class="text-xs font-bold text-slate-200">
            <span class="text-amber-400 hover:underline">Tap to choose image / file</span> or drag & drop
          </p>
          <p class="text-[11px] text-slate-400 mt-1">
            Supported: JPG, PNG, WEBP, PDF (Max {{ maxSizeMB }} MB)
          </p>
        </div>
      </div>

      <!-- Upload Progress Overlay -->
      <div 
        v-if="isUploading" 
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl border border-amber-500/40 flex flex-col items-center justify-center p-4 space-y-3 z-10"
      >
        <div class="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <div class="text-center">
          <p class="text-xs font-bold text-amber-400">{{ uploadStatus }}</p>
          <div class="w-48 bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-700">
            <div class="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full animate-pulse" style="width: 85%"></div>
          </div>
        </div>
      </div>

      <!-- Hidden Native Input -->
      <input 
        ref="inputRef" 
        type="file" 
        :accept="accept" 
        @change="handleFileChange" 
        class="hidden" 
      />
    </div>

    <!-- Error Feedback -->
    <p v-if="errorMessage" class="text-xs font-bold text-rose-400 mt-1 flex items-center space-x-1">
      <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
      <span>{{ errorMessage }}</span>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { fileService } from '@/services/fileService'
import { 
  CloudArrowUpIcon, 
  TrashIcon, 
  ArrowPathIcon, 
  DocumentIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/solid'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'general'
  },
  label: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/jpeg,image/jpg,image/png,image/webp,application/pdf'
  },
  maxSizeMB: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'error'])

const inputRef = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadStatus = ref('Optimizing image...')
const errorMessage = ref('')
const selectedFileName = ref('')
const selectedFileSize = ref(0)
const localPreviewUrl = ref('')

// Compute formatted URL for display
const currentPreview = computed(() => {
  if (localPreviewUrl.value) return localPreviewUrl.value
  if (!props.modelValue) return ''
  return fileService.getFileUrl(props.modelValue)
})

// Check if file is image or PDF
const isImage = computed(() => {
  const url = currentPreview.value.toLowerCase()
  if (url.endsWith('.pdf')) return false
  return true
})

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const triggerFileSelect = () => {
  if (inputRef.value) {
    inputRef.value.click()
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    processSelectedFile(files[0])
  }
}

const handleFileChange = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    processSelectedFile(files[0])
  }
}

const processSelectedFile = async (file) => {
  errorMessage.value = ''
  selectedFileName.value = file.name
  selectedFileSize.value = file.size

  try {
    fileService.validateFile(file)
  } catch (err) {
    errorMessage.value = err.message
    emit('error', err.message)
    return
  }

  // Create temporary local blob preview
  if (file.type.startsWith('image/')) {
    localPreviewUrl.value = URL.createObjectURL(file)
  }

  isUploading.value = true
  uploadStatus.value = 'Optimizing image...'

  try {
    const uploadRes = await fileService.uploadFile(
      file, 
      props.category, 
      (status) => { uploadStatus.value = status }
    )

    if (uploadRes && uploadRes.fileUrl) {
      localPreviewUrl.value = uploadRes.fileUrl
      emit('update:modelValue', uploadRes.fileUrl)
      emit('upload-success', uploadRes)
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to upload file.'
    emit('error', errorMessage.value)
  } finally {
    isUploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}

const removeFile = () => {
  localPreviewUrl.value = ''
  selectedFileName.value = ''
  selectedFileSize.value = 0
  errorMessage.value = ''
  emit('update:modelValue', '')
  if (inputRef.value) inputRef.value.value = ''
}

const onImageError = () => {
  // Graceful fallback for broken image previews
}
</script>
