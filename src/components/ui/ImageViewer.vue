<template>
  <Transition enter-active-class="transition duration-200 ease-out" leave-active-class="transition duration-150 ease-in">
    <div 
      v-if="isOpen && currentImage" 
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden"
      @keydown.esc="closeViewer"
      tabindex="0"
      ref="viewerContainerRef"
    >
      <!-- Top Header Bar -->
      <div class="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div class="flex items-center space-x-3">
          <span class="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
            {{ currentImage.category || 'Gallery' }}
          </span>
          <span class="text-xs font-bold text-slate-400 font-mono">
            {{ activeIndex + 1 }} / {{ images.length }}
          </span>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center space-x-3">
          <button 
            @click="resetZoom" 
            v-if="zoomLevel !== 1"
            class="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            Reset Zoom (100%)
          </button>
          
          <button 
            @click="closeViewer" 
            class="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-700/80 transition-all"
            title="Close Lightbox (ESC)"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Main Image View Area -->
      <div 
        class="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden cursor-grab active:cursor-grabbing"
        @wheel.prevent="handleWheel"
        @dblclick="toggleZoom"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <!-- Navigation Arrow - Left -->
        <button 
          v-if="images.length > 1"
          @click.stop="prevImage" 
          class="absolute left-3 sm:left-6 z-20 p-3 bg-slate-900/80 hover:bg-slate-800 text-amber-400 rounded-full border border-slate-700/80 transition-all hover:scale-110 shadow-2xl"
          title="Previous Image (Left Arrow)"
        >
          <ChevronLeftIcon class="w-6 h-6" />
        </button>

        <!-- Main Image Container -->
        <div class="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75">
          <!-- Loading Spinner -->
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
            <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <img 
            :src="getImageUrl(currentImage)" 
            :alt="currentImage.title" 
            class="max-w-[92vw] max-h-[78vh] object-contain rounded-2xl shadow-2xl transition-transform duration-100 ease-out"
            :style="{
              transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`
            }"
            @load="isLoading = false"
            @error="onImageError"
          />
        </div>

        <!-- Navigation Arrow - Right -->
        <button 
          v-if="images.length > 1"
          @click.stop="nextImage" 
          class="absolute right-3 sm:right-6 z-20 p-3 bg-slate-900/80 hover:bg-slate-800 text-amber-400 rounded-full border border-slate-700/80 transition-all hover:scale-110 shadow-2xl"
          title="Next Image (Right Arrow)"
        >
          <ChevronRightIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Bottom Metadata Footer -->
      <div class="p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 space-y-1 text-center">
        <h3 class="font-heading text-lg sm:text-xl font-bold text-slate-100">{{ currentImage.title }}</h3>
        <p class="text-xs text-slate-400 flex items-center justify-center space-x-3">
          <span>Uploaded: {{ formatDate(currentImage.date || currentImage.createdAt) }}</span>
          <span class="text-slate-600">•</span>
          <span class="text-amber-400 font-semibold">Dragon KungFu Academy</span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { fileService } from '@/services/fileService'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'change-index'])

const viewerContainerRef = ref(null)
const activeIndex = ref(0)
const isLoading = ref(true)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Touch Swipe Handling
const touchStartX = ref(0)
const touchEndX = ref(0)

watch(() => props.currentIndex, (newVal) => {
  activeIndex.value = newVal
  resetZoom()
  isLoading.value = true
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    activeIndex.value = props.currentIndex
    resetZoom()
    isLoading.value = true
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

const currentImage = computed(() => {
  if (!props.images || props.images.length === 0) return null
  return props.images[activeIndex.value] || props.images[0]
})

const getImageUrl = (img) => {
  if (!img) return ''
  const raw = img.photoUrl || img.certificateUrl || img.url || ''
  return fileService.getFileUrl(raw)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

const closeViewer = () => {
  emit('close')
}

const prevImage = () => {
  if (props.images.length <= 1) return
  resetZoom()
  isLoading.value = true
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
  emit('change-index', activeIndex.value)
}

const nextImage = () => {
  if (props.images.length <= 1) return
  resetZoom()
  isLoading.value = true
  activeIndex.value = (activeIndex.value + 1) % props.images.length
  emit('change-index', activeIndex.value)
}

const resetZoom = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

const toggleZoom = () => {
  if (zoomLevel.value === 1) {
    zoomLevel.value = 2.2
  } else {
    resetZoom()
  }
}

const handleWheel = (e) => {
  if (e.deltaY < 0) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.25, 4)
  } else {
    zoomLevel.value = Math.max(zoomLevel.value - 0.25, 1)
    if (zoomLevel.value === 1) {
      panX.value = 0
      panY.value = 0
    }
  }
}

const startDrag = (e) => {
  if (zoomLevel.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - panX.value, y: e.clientY - panY.value }
}

const onDrag = (e) => {
  if (!isDragging.value || zoomLevel.value <= 1) return
  panX.value = e.clientX - dragStart.value.x
  panY.value = e.clientY - dragStart.value.y
}

const stopDrag = () => {
  isDragging.value = false
}

const handleTouchStart = (e) => {
  if (e.touches && e.touches.length === 1) {
    touchStartX.value = e.touches[0].clientX
  }
}

const handleTouchEnd = (e) => {
  if (e.changedTouches && e.changedTouches.length === 1) {
    touchEndX.value = e.changedTouches[0].clientX
    handleSwipe()
  }
}

const handleSwipe = () => {
  const swipeDiff = touchEndX.value - touchStartX.value
  if (Math.abs(swipeDiff) > 40 && zoomLevel.value === 1) {
    if (swipeDiff < 0) {
      nextImage()
    } else {
      prevImage()
    }
  }
}

const handleKeydown = (e) => {
  if (!props.isOpen) return
  if (e.key === 'Escape') closeViewer()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

const onImageError = () => {
  isLoading.value = false
}

onMounted(() => {
  if (props.isOpen) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
