<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Broadcast Notifications</h1>
        <p class="text-xs text-slate-400">Send announcements, holiday notices, exam dates, and FCM push notifications.</p>
      </div>

      <button 
        @click="isModalOpen = true"
        class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        + Broadcast New Notice
      </button>
    </div>

    <!-- Notification Feed -->
    <div class="space-y-4">
      <div 
        v-for="notif in notificationStore.notifications" 
        :key="notif.id"
        class="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start justify-between gap-4"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {{ notif.type }}
            </span>
            <span class="text-xs text-slate-500 font-mono">Target: {{ notif.target }}</span>
          </div>
          <h3 class="text-base font-bold text-slate-100">{{ notif.title }}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">{{ notif.message }}</p>
          <p class="text-[10px] text-slate-500">Broadcasted by {{ notif.sentBy }} on {{ new Date(notif.date).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- Create Notice Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">Broadcast Announcement</h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="sendNotification" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Announcement Title</label>
              <input v-model="form.title" type="text" required placeholder="e.g. Belt Grading Examination 2026" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Category Type</label>
              <select v-model="form.type" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                <option>Announcement</option>
                <option>Holiday</option>
                <option>Exam</option>
                <option>Tournament</option>
                <option>Training Camp</option>
                <option>Schedule Changes</option>
                <option>Maintenance Notice</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Target Audience</label>
              <select v-model="form.target" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                <option>All Students</option>
                <option>Black & Brown Belts</option>
                <option>Green & Blue Belts</option>
                <option>Beginner Belts</option>
                <option>Morning Batch Only</option>
                <option>Evening Batch Only</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Detailed Message</label>
              <textarea v-model="form.message" rows="4" required placeholder="Write details here..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 resize-none"></textarea>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="notificationStore.loading" 
                variant="primary" 
                size="sm"
                loading-text="Broadcasting..."
              >
                Send Broadcast
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const isModalOpen = ref(false)

const form = reactive({
  title: '',
  type: 'Announcement',
  target: 'All Students',
  message: ''
})

const sendNotification = async () => {
  await notificationStore.createNotification({
    ...form,
    sentBy: authStore.currentUserProfile?.name || 'Admin Master'
  })
  isModalOpen.value = false
  form.title = ''
  form.message = ''
}
</script>
