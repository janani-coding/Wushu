<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Visual Showcase</span>
      <h1 class="font-heading text-4xl font-extrabold text-slate-100">Academy Photo Gallery</h1>
      <p class="text-slate-400 text-sm">
        Explore moments from championships, belt gradings, weapon workshops, and daily warrior practice.
      </p>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="galleryStore.selectedCategory = cat"
        class="px-5 py-2 rounded-xl text-xs font-bold transition-all"
        :class="galleryStore.selectedCategory === cat ? 'bg-amber-500 text-slate-950 shadow-glow-gold' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Photo Grid -->
    <div v-if="galleryStore.filteredPhotos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="photo in galleryStore.filteredPhotos" 
        :key="photo.id"
        @click="openLightbox(photo)"
        class="glass-card rounded-2xl overflow-hidden cursor-pointer group relative"
      >
        <img 
          :src="photo.photoUrl" 
          :alt="photo.title"
          class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
        <div class="absolute bottom-4 left-4 right-4 text-left">
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {{ photo.category }}
          </span>
          <h4 class="text-sm font-bold text-slate-100 mt-2 truncate">{{ photo.title }}</h4>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-slate-400">
      <p>No photos uploaded under this category yet.</p>
    </div>

    <!-- Full-Screen Lightbox Image Viewer -->
    <ImageViewer 
      :is-open="isLightboxOpen"
      :images="galleryStore.filteredPhotos"
      :current-index="activePhotoIndex"
      @close="isLightboxOpen = false"
      @change-index="activePhotoIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import ImageViewer from '@/components/ui/ImageViewer.vue'

const galleryStore = useGalleryStore()
const isLightboxOpen = ref(false)
const activePhotoIndex = ref(0)

const categories = ['All', 'Tournament', 'Training', 'Events', 'Batch']

onMounted(() => {
  galleryStore.fetchGallery()
})

const openLightbox = (photo) => {
  const idx = galleryStore.filteredPhotos.findIndex(p => p.id === photo.id)
  activePhotoIndex.value = idx !== -1 ? idx : 0
  isLightboxOpen.value = true
}
</script>
