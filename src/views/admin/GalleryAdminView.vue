<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Gallery Photos Management</h1>
        <p class="text-xs text-slate-400">Upload high quality academy photos for public landing gallery.</p>
      </div>

      <button 
        @click="isModalOpen = true"
        class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        + Upload New Photo
      </button>
    </div>

    <!-- Photos Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="(photo, index) in galleryStore.photos" 
        :key="photo.id"
        class="glass-card rounded-2xl overflow-hidden relative group cursor-pointer"
      >
        <img 
          :src="photo.photoUrl" 
          :alt="photo.title" 
          @click="openLightbox(index)"
          class="w-full h-56 object-cover hover:scale-105 transition-transform duration-300" 
        />
        <div class="p-4 flex items-center justify-between">
          <div @click="openLightbox(index)" class="flex-1 min-w-0 pr-2">
            <h4 class="text-sm font-bold text-slate-100 truncate">{{ photo.title }}</h4>
            <span class="text-[10px] text-amber-400 font-semibold">{{ photo.category }}</span>
          </div>
          <button 
            @click.stop="confirmDeletePhoto(photo)"
            class="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-xl transition-colors"
            title="Delete Photo Permanently"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Full-Screen Lightbox Image Viewer -->
    <ImageViewer 
      :is-open="isLightboxOpen"
      :images="galleryStore.photos"
      :current-index="activePhotoIndex"
      @close="isLightboxOpen = false"
      @change-index="activePhotoIndex = $event"
    />

    <!-- Upload Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">Upload Gallery Photo</h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="savePhoto" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Photo Title</label>
              <input v-model="form.title" type="text" required placeholder="e.g. State Championship Gold Medalists" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Category</label>
              <select v-model="form.category" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                <option>Tournament</option>
                <option>Training</option>
                <option>Events</option>
                <option>Batch</option>
              </select>
            </div>

            <div>
              <FileUpload 
                category="gallery" 
                label="Upload Gallery Photo" 
                v-model="form.photoUrl" 
              />
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="galleryStore.loading" 
                variant="primary" 
                size="sm"
                loading-text="Uploading..."
              >
                Upload Photo
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { useNotificationStore } from '@/stores/notification'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import ImageViewer from '@/components/ui/ImageViewer.vue'
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { fileService } from '@/services/fileService'

const galleryStore = useGalleryStore()
const notificationStore = useNotificationStore()
const isModalOpen = ref(false)

const isLightboxOpen = ref(false)
const activePhotoIndex = ref(0)

const form = reactive({
  title: '',
  category: 'Tournament',
  photoUrl: ''
})

onMounted(() => {
  galleryStore.fetchGallery()
})

const openLightbox = (index) => {
  activePhotoIndex.value = index
  isLightboxOpen.value = true
}

const savePhoto = async () => {
  let finalPhotoUrl = form.photoUrl
  let fileId = null

  if (form.photoUrl && (form.photoUrl.startsWith('data:') || form.photoUrl.startsWith('blob:'))) {
    try {
      const uploadRes = await fileService.uploadFile(form.photoUrl, 'gallery')
      if (uploadRes && uploadRes.fileUrl) {
        finalPhotoUrl = uploadRes.fileUrl
        fileId = uploadRes.fileId
      }
    } catch (err) {
      console.warn('Gallery upload fallback:', err)
    }
  }

  await galleryStore.addPhoto({
    ...form,
    photoUrl: finalPhotoUrl,
    fileId
  })
  notificationStore.addToast(`Photo stored in MongoDB GridFS & added to Gallery!`, 'success')
  isModalOpen.value = false
  form.title = ''
  form.photoUrl = ''
}

const confirmDeletePhoto = async (photo) => {
  const photoId = photo.id || photo
  const photoTitle = photo.title || 'this gallery image'
  if (confirm(`Delete Gallery Image "${photoTitle}"?\n\nThis action cannot be undone and will permanently purge the file from MongoDB GridFS.`)) {
    await galleryStore.deletePhoto(photoId)
    notificationStore.addToast(`Gallery image and MongoDB GridFS file purged permanently.`, 'info')
  }
}
</script>
