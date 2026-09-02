<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Help & Support Chat</h1>
        <p class="text-xs text-slate-400">Direct interactive message thread with your Academy Master and Instructors.</p>
      </div>

      <button 
        @click="isModalOpen = true"
        class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        + Ask New Question
      </button>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="queryStore.loading && !myQueries.length" class="space-y-4">
      <SkeletonLoader customClass="w-full h-40" v-for="i in 3" :key="i" />
    </div>

    <!-- EMPTY STATE -->
    <EmptyState 
      v-else-if="!myQueries.length"
      title="No Support Queries Yet"
      description="Have questions about fees, belt grading exams, or class timings? Ask the academy masters directly."
      actionLabel="+ Ask First Question"
      @action="isModalOpen = true"
    />

    <!-- CHAT CONVERSATIONS LIST -->
    <div v-else class="space-y-6">
      <div 
        v-for="q in myQueries" 
        :key="q.id"
        class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
      >
        <!-- Conversation Header Bar -->
        <div class="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {{ q.category || 'Support' }}
            </span>
            <h3 class="font-bold text-slate-100 text-sm truncate max-w-xs sm:max-w-md">{{ q.title }}</h3>
          </div>

          <div class="flex items-center space-x-3 shrink-0">
            <StatusBadge :status="q.status" />
            <span class="text-[10px] text-slate-500 font-mono hidden sm:inline">{{ q.id }}</span>
          </div>
        </div>

        <!-- Chat Messages Container -->
        <div class="p-4 sm:p-6 bg-slate-950/70 space-y-4 max-h-[500px] overflow-y-auto">
          
          <!-- STUDENT ORIGINAL QUESTION BUBBLE (Right Aligned) -->
          <div class="flex justify-end space-x-3">
            <div class="max-w-md space-y-1">
              <div class="flex items-center justify-end space-x-2 text-[10px] text-slate-400">
                <span class="font-bold text-amber-400">You</span>
                <span>•</span>
                <span>{{ new Date(q.createdAt || q.date || Date.now()).toLocaleString() }}</span>
              </div>
              <div class="p-4 rounded-2xl rounded-tr-none bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-xs text-slate-100 leading-relaxed shadow-md">
                {{ q.description }}
              </div>
            </div>
            <AvatarInitials 
              :name="studentProfile?.fullName || 'Student'" 
              :photoUrl="studentProfile?.profilePhoto" 
              size="sm" 
            />
          </div>

          <!-- ADMIN REPLIES THREAD (Left Aligned) -->
          <template v-if="q.replies && q.replies.length">
            <div 
              v-for="(reply, idx) in getUniqueReplies(q.replies)" 
              :key="idx"
              class="flex justify-start space-x-3"
            >
              <div class="w-8 h-8 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 font-extrabold text-xs">
                🥋
              </div>
              <div class="max-w-md space-y-1">
                <div class="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span class="font-bold text-amber-400">{{ reply.repliedBy }}</span>
                  <span class="px-1.5 py-0.2 bg-slate-800 text-[9px] rounded font-semibold">{{ reply.role || 'Coach' }}</span>
                  <span>•</span>
                  <span>{{ new Date(reply.date).toLocaleString() }}</span>
                </div>
                <div class="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed shadow-md">
                  {{ reply.message }}
                </div>
              </div>
            </div>
          </template>

          <div v-else class="py-4 text-center text-[11px] text-slate-500 italic bg-slate-900/40 rounded-2xl border border-slate-800/60">
            ⏳ Waiting for academy master response. Admins are usually quick to reply!
          </div>

        </div>

        <!-- Chat Footer Info Bar -->
        <div class="p-4 bg-slate-900/90 border-t border-slate-800 text-xs space-y-2">
          <div v-if="q.status === 'Resolved'" class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <div class="flex items-center space-x-2 text-emerald-400 font-bold">
              <span>✔</span>
              <span>Your query has been resolved by the academy.</span>
            </div>
            <span class="text-[11px] text-slate-400 italic">
              ℹ This resolved query will be removed automatically.
            </span>
          </div>

          <div v-else class="flex items-center justify-between text-[11px] text-slate-400">
            <span>Status: <strong class="text-amber-400 font-bold">{{ q.status }}</strong></span>
            <span class="text-amber-400">Active Conversation Thread</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE QUERY MODAL -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">Ask Academy Master</h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">&times;</button>
          </div>

          <form @submit.prevent="saveQuery" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Subject Title</label>
              <input v-model="form.title" type="text" required placeholder="e.g. Question about Blue Belt Exam fees" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Category</label>
              <select v-model="form.category" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                <option>Fee Payments</option>
                <option>Belt Exam & Grading</option>
                <option>Tournaments</option>
                <option>Class Schedule</option>
                <option>Other Requests</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Detailed Explanation</label>
              <textarea v-model="form.description" rows="4" required placeholder="Describe your query in detail..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 resize-none"></textarea>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="queryStore.loading" 
                variant="primary" 
                size="sm"
                loading-text="Submitting..."
              >
                Submit Question
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
import { useQueryStore } from '@/stores/query'
import { useNotificationStore } from '@/stores/notification'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'

const authStore = useAuthStore()
const queryStore = useQueryStore()
const notificationStore = useNotificationStore()

const isModalOpen = ref(false)

const studentProfile = computed(() => authStore.currentUserProfile)

const form = reactive({
  title: '',
  category: 'Fee Payments',
  description: ''
})

const myQueries = computed(() => {
  if (!authStore.currentUserProfile) return []
  return queryStore.getQueriesByStudent(authStore.currentUserProfile.id)
})

const getUniqueReplies = (replies) => {
  if (!replies || !replies.length) return []
  const map = new Map()
  replies.forEach(r => {
    const key = `${r.repliedBy || r.sender}-${r.message}-${r.date}`
    if (!map.has(key)) map.set(key, r)
  })
  return Array.from(map.values())
}

onMounted(() => {
  queryStore.fetchQueries()
})

const saveQuery = async () => {
  if (!authStore.currentUserProfile) return
  await queryStore.submitQuery(
    authStore.currentUserProfile.id,
    authStore.currentUserProfile.fullName,
    form.title,
    form.description,
    form.category
  )
  notificationStore.addToast(`Question submitted! Academy masters have been notified.`, 'success')
  isModalOpen.value = false
  form.title = ''
  form.description = ''
}
</script>
