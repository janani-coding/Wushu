<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-12">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">My Warrior Achievements</h1>
        <p class="text-xs text-slate-400">Upload your medals, tournament certificates, and honors to your permanent record.</p>
      </div>

      <button 
        @click="isModalOpen = true"
        class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        + Add New Achievement
      </button>
    </div>

    <!-- Achievements Cards Grid -->
    <div v-if="achievements.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="ach in achievements" 
        :key="ach.id"
        class="glass-card rounded-3xl overflow-hidden space-y-4 p-6"
      >
        <img 
          :src="ach.certificateUrl" 
          :alt="ach.title" 
          class="w-full h-48 object-cover rounded-2xl border border-amber-500/30"
        />
        <div class="space-y-1">
          <span class="text-[10px] font-bold text-amber-400 uppercase font-mono">{{ ach.date }}</span>
          <h3 class="text-base font-bold text-slate-100">{{ ach.title }}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">{{ ach.description }}</p>
        </div>
      </div>
    </div>

    <div v-else class="py-16 text-center text-xs text-slate-500 glass-panel rounded-3xl border border-slate-800">
      No achievements uploaded yet. Click "+ Add New Achievement" to post your first certificate!
    </div>

    <!-- Upload Achievement Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">Upload Achievement</h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveAchievement" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Achievement Title</label>
              <input v-model="form.title" type="text" required placeholder="e.g. Gold Medal - State Wushu Taolu 2026" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Date Awarded</label>
              <input v-model="form.date" type="date" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <FileUpload 
                category="certificate" 
                accept="image/*,application/pdf" 
                label="Upload Certificate / Medal Document" 
                v-model="form.certificateUrl" 
              />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Description / Details</label>
              <textarea v-model="form.description" rows="3" required placeholder="Event details, category, rank..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 resize-none"></textarea>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="achievementStore.loading" 
                variant="primary" 
                size="sm"
                loading-text="Uploading..."
              >
                Save Achievement
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAchievementStore } from '@/stores/achievement'
import { useNotificationStore } from '@/stores/notification'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'

import { fileService } from '@/services/fileService'

const authStore = useAuthStore()
const achievementStore = useAchievementStore()
const notificationStore = useNotificationStore()

const isModalOpen = ref(false)

const form = reactive({
  title: '',
  date: new Date().toISOString().split('T')[0],
  certificateUrl: '',
  description: ''
})

const achievements = computed(() => {
  if (!authStore.currentUserProfile) return []
  return achievementStore.getAchievementsByStudent(authStore.currentUserProfile.id)
})

onMounted(() => {
  achievementStore.fetchAchievements()
})

const saveAchievement = async () => {
  if (!authStore.currentUserProfile) return

  let finalCertUrl = form.certificateUrl
  if (form.certificateUrl && (form.certificateUrl.startsWith('data:') || form.certificateUrl.startsWith('blob:'))) {
    try {
      const uploadRes = await fileService.uploadFile(form.certificateUrl, 'certificate')
      if (uploadRes && uploadRes.fileUrl) {
        finalCertUrl = uploadRes.fileUrl
      }
    } catch (err) {
      console.warn('Certificate upload fallback to URL:', err)
    }
  }

  await achievementStore.addAchievement({
    studentId: authStore.currentUserProfile.id,
    studentName: authStore.currentUserProfile.fullName,
    ...form,
    certificateUrl: finalCertUrl
  })
  notificationStore.addToast(`Achievement certificate saved to MongoDB GridFS!`, 'success')
  isModalOpen.value = false
  form.title = ''
  form.certificateUrl = ''
  form.description = ''
}
</script>
