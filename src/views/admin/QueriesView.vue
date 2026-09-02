<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Student Support Conversations</h1>
        <p class="text-xs text-slate-400">Reply to student questions, provide fee guidance, and resolve queries in real-time.</p>
      </div>

      <!-- Quick Metrics Pill -->
      <div class="flex items-center space-x-3 text-xs">
        <div class="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <span class="text-[10px] text-slate-400 font-bold uppercase block">Open Queries</span>
          <span class="font-black text-amber-400 text-sm">{{ queryStore.openQueries.length }}</span>
        </div>
        <div class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Queries</span>
          <span class="font-black text-emerald-400 text-sm">{{ queryStore.queries.length }}</span>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      
      <!-- Status Tabs -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
        <button 
          v-for="st in ['All', 'Open', 'In Progress', 'Resolved']" 
          :key="st"
          @click="selectedStatus = st"
          class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
          :class="selectedStatus === st ? 'bg-amber-500 text-slate-950 shadow-glow-gold' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'"
        >
          {{ st }}
          <span v-if="st === 'Open' && queryStore.openQueriesCount" class="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px]">
            {{ queryStore.openQueriesCount }}
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Search student, subject, or query ID..."
        class="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 max-w-sm w-full"
      />
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="queryStore.loading && !filteredQueries.length" class="space-y-4">
      <SkeletonLoader customClass="w-full h-44" v-for="i in 3" :key="i" />
    </div>

    <!-- EMPTY STATE -->
    <EmptyState 
      v-else-if="!filteredQueries.length"
      title="No Queries Found"
      description="There are currently no student inquiries matching your search filter."
    />

    <!-- CONVERSATIONS THREAD FEED -->
    <div v-else class="space-y-6">
      <div 
        v-for="q in filteredQueries" 
        :key="q.id"
        class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
      >
        <!-- Conversation Header Bar -->
        <div class="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <AvatarInitials :name="q.studentName" size="sm" />
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-slate-100 text-sm">{{ q.studentName }}</h3>
                <span class="text-[10px] text-slate-400 font-mono">({{ q.studentId }})</span>
              </div>
              <p class="text-[11px] text-amber-400 font-bold mt-0.5">{{ q.title }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3 shrink-0">
            <StatusBadge :status="q.status" />
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              {{ q.category || 'General' }}
            </span>
          </div>
        </div>

        <!-- Conversation Chat Messages -->
        <div class="p-4 sm:p-6 bg-slate-950/70 space-y-4 max-h-[450px] overflow-y-auto">
          
          <!-- STUDENT QUESTION BUBBLE (Left Aligned for Admin view) -->
          <div class="flex justify-start space-x-3">
            <AvatarInitials :name="q.studentName" size="sm" />
            <div class="max-w-md space-y-1">
              <div class="flex items-center space-x-2 text-[10px] text-slate-400">
                <span class="font-bold text-slate-200">{{ q.studentName }}</span>
                <span>•</span>
                <span>{{ new Date(q.createdAt || q.date).toLocaleString() }}</span>
              </div>
              <div class="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed shadow-md">
                {{ q.description }}
              </div>
            </div>
          </div>

          <!-- MASTER REPLIES (Right Aligned for Admin view) -->
          <template v-if="q.replies && q.replies.length">
            <div 
              v-for="(reply, idx) in getUniqueReplies(q.replies)" 
              :key="idx"
              class="flex justify-end space-x-3"
            >
              <div class="max-w-md space-y-1">
                <div class="flex items-center justify-end space-x-2 text-[10px] text-slate-400">
                  <span class="font-bold text-amber-400">{{ reply.repliedBy }}</span>
                  <span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold border border-amber-500/30">{{ reply.role || 'Admin' }}</span>
                  <span>•</span>
                  <span>{{ new Date(reply.date).toLocaleString() }}</span>
                </div>
                <div class="p-4 rounded-2xl rounded-tr-none bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-xs text-slate-100 leading-relaxed shadow-md">
                  {{ reply.message }}
                </div>
              </div>
              <div class="w-8 h-8 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 font-extrabold text-xs">
                🥋
              </div>
            </div>
          </template>

        </div>

        <!-- Chat Reply Input Bar -->
        <div class="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
          <div v-if="q.status === 'Resolved'" class="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
            <span class="text-emerald-400 font-bold">✔ Conversation Resolved</span>
            <span class="text-[11px] text-slate-400 italic">
              ℹ This resolved query will be automatically archived and deleted.
            </span>
          </div>

          <div v-else class="flex flex-col sm:flex-row gap-3">
            <input 
              v-model="replyTextMap[q.id]"
              type="text"
              placeholder="Write official response to student..."
              class="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
              @keyup.enter="sendReply(q.id)"
            />

            <div class="flex items-center space-x-2 justify-end">
              <LoadingButton 
                @click="sendReply(q.id)"
                :loading="activeProcessingId === `reply-${q.id}`"
                :disabled="!replyTextMap[q.id]?.trim()"
                variant="primary"
                size="sm"
                loading-text="Sending..."
              >
                Send Reply
              </LoadingButton>

              <LoadingButton 
                v-if="q.status === 'Open'"
                @click="handleSetProgress(q.id)"
                :loading="activeProcessingId === `progress-${q.id}`"
                variant="secondary"
                size="sm"
                loading-text="Updating..."
              >
                In Progress
              </LoadingButton>

              <LoadingButton 
                @click="handleMarkResolved(q.id)"
                :loading="activeProcessingId === `resolve-${q.id}`"
                variant="emerald"
                size="sm"
                loading-text="Resolving..."
              >
                Mark Resolved
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQueryStore } from '@/stores/query'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'

const queryStore = useQueryStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const selectedStatus = ref('All')
const replyTextMap = reactive({})
const activeProcessingId = ref(null)

onMounted(() => {
  queryStore.fetchQueries()
})

const filteredQueries = computed(() => {
  let list = queryStore.queries

  if (selectedStatus.value !== 'All') {
    list = list.filter(q => q.status === selectedStatus.value)
  }

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase()
    list = list.filter(q => 
      q.studentName.toLowerCase().includes(term) ||
      q.studentId.toLowerCase().includes(term) ||
      q.title.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term)
    )
  }

  return list.sort((a, b) => new Date(b.createdAt || b.date || Date.now()) - new Date(a.createdAt || a.date || Date.now()))
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

const sendReply = async (queryId) => {
  const text = replyTextMap[queryId]
  if (!text || !text.trim()) return
  
  activeProcessingId.value = `reply-${queryId}`
  try {
    await queryStore.replyToQuery(
      queryId, 
      authStore.currentUserProfile?.name || 'Academy Master',
      authStore.currentUserProfile?.role || 'Admin',
      text
    )
    replyTextMap[queryId] = ''
    notificationStore.addToast('Reply sent to student!', 'success')
  } catch (err) {
    notificationStore.addToast('Failed to send reply.', 'error')
  } finally {
    activeProcessingId.value = null
  }
}

const handleSetProgress = async (queryId) => {
  activeProcessingId.value = `progress-${queryId}`
  try {
    await queryStore.updateQueryStatus(queryId, 'In Progress')
    notificationStore.addToast('Query status updated to In Progress.', 'info')
  } catch (err) {
    notificationStore.addToast('Failed to update status.', 'error')
  } finally {
    activeProcessingId.value = null
  }
}

const handleMarkResolved = async (queryId) => {
  activeProcessingId.value = `resolve-${queryId}`
  try {
    await queryStore.markResolved(queryId)
    notificationStore.addToast('Query resolved! It will be automatically archived and deleted after retention period.', 'success')
  } catch (err) {
    notificationStore.addToast('Failed to resolve conversation.', 'error')
  } finally {
    activeProcessingId.value = null
  }
}
</script>
