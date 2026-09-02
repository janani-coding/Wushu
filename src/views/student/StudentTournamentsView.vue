<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-12">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">Tournament Registrations</h1>
      <p class="text-xs text-slate-400">View active championship announcements and submit your tournament entry.</p>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Status Filter Tabs -->
      <div class="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
        <button 
          v-for="status in ['All', 'Upcoming', 'Closing Soon', 'Expired', 'Completed']" 
          :key="status"
          @click="selectedFilter = status"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
            selectedFilter === status 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          ]"
        >
          {{ status }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="w-full md:w-64 relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search tournaments..." 
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
        <MagnifyingGlassIcon class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>
    </div>

    <!-- Tournaments List -->
    <div v-if="filteredTournaments.length" class="space-y-6">
      <div 
        v-for="t in filteredTournaments" 
        :key="t.id"
        class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div class="flex items-center space-x-2">
              <!-- Dynamic Status Badge -->
              <span :class="getStatusBadgeClass(tournamentStore.getCalculatedStatus(t))" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border">
                {{ tournamentStore.getCalculatedStatus(t) }}
              </span>
              <span v-if="tournamentStore.isTournamentFull(t.id) && !getRegistrationStatus(t.id) && tournamentStore.getCalculatedStatus(t) === 'Upcoming'" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Tournament Full
              </span>
            </div>
            <h3 class="font-heading text-xl font-bold text-slate-100 mt-1">{{ t.title }}</h3>
          </div>

          <div class="flex items-center space-x-3">
            <!-- If student registered -->
            <div v-if="getRegistrationStatus(t.id)" class="flex items-center space-x-2">
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30">
                ✔ Registered
              </span>
              <LoadingButton 
                v-if="tournamentStore.getCalculatedStatus(t) !== 'Expired' && tournamentStore.getCalculatedStatus(t) !== 'Completed'"
                @click="cancelRegistration(getRegistrationStatus(t.id).id, t.id)"
                :loading="activeProcessingId === `cancel-${t.id}`"
                variant="rose"
                size="sm"
                loading-text="Cancelling..."
              >
                Cancel Registration
              </LoadingButton>
            </div>

            <!-- If tournament expired -->
            <button 
              v-else-if="tournamentStore.getCalculatedStatus(t) === 'Expired'"
              disabled
              class="px-4 py-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Registration Closed
            </button>

            <!-- If tournament completed -->
            <button 
              v-else-if="tournamentStore.getCalculatedStatus(t) === 'Completed'"
              disabled
              class="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Completed
            </button>

            <!-- If tournament full -->
            <button 
              v-else-if="tournamentStore.isTournamentFull(t.id)"
              disabled
              class="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Tournament Full
            </button>

            <!-- If registration open -->
            <LoadingButton 
              v-else
              @click="registerForTournament(t)"
              :loading="activeProcessingId === `reg-${t.id}`"
              variant="primary"
              size="md"
              loading-text="Registering..."
            >
              Register Now (₹{{ t.fee }})
            </LoadingButton>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">{{ t.description }}</p>

        <!-- Dates & Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Venue</span>
            <span class="text-slate-200 font-semibold">{{ t.venue }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Tournament Date</span>
            <span class="text-slate-200 font-semibold">{{ t.date || t.tournamentDate }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Registration Deadline</span>
            <span :class="tournamentStore.getCalculatedStatus(t) === 'Expired' ? 'text-rose-400 font-bold' : 'text-amber-400 font-semibold'">
              {{ t.registrationDeadline }}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Entry Fee</span>
            <span class="text-emerald-400 font-bold">₹{{ t.fee }}</span>
          </div>
        </div>

        <!-- Quota Progress Bar -->
        <div class="space-y-2 pt-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-slate-300">Registered Participants</span>
            <div class="flex items-center space-x-3">
              <span class="text-slate-400 text-[11px] font-semibold">Available Slots: <strong :class="tournamentStore.getAvailableSlots(t.id) === 0 ? 'text-rose-400' : 'text-emerald-400'" class="font-extrabold">{{ tournamentStore.getAvailableSlots(t.id) }}</strong></span>
              <span class="text-amber-400 font-mono font-extrabold">{{ tournamentStore.getParticipantCount(t.id) }} / {{ tournamentStore.getQuota(t.id) }} Quota</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              class="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 ease-out" 
              :style="{ width: `${tournamentStore.getProgressPercent(t.id)}%` }"
            ></div>
          </div>
          <div v-if="tournamentStore.getCalculatedStatus(t) === 'Expired'" class="text-[11px] text-rose-400 font-semibold italic text-right">
            Registration has closed for this tournament.
          </div>
          <div v-else-if="tournamentStore.isTournamentFull(t.id) && !getRegistrationStatus(t.id)" class="text-[11px] text-rose-400 font-semibold italic text-right">
            Maximum participant limit reached.
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Filter State -->
    <div v-else class="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
      <div class="text-4xl">🏆</div>
      <h3 class="font-heading text-lg font-bold text-slate-200">No Tournaments Found</h3>
      <p class="text-xs text-slate-400">No tournaments match the selected filter or search term.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()

const activeProcessingId = ref(null)
const selectedFilter = ref('All')
const searchQuery = ref('')

const studentProfile = computed(() => authStore.currentUserProfile)

onMounted(() => {
  tournamentStore.fetchTournaments()
})

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    case 'Expired':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    case 'Closing Soon':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
}

const filteredTournaments = computed(() => {
  let list = [...tournamentStore.tournaments]

  // Filter by status
  if (selectedFilter.value !== 'All') {
    list = list.filter(t => tournamentStore.getCalculatedStatus(t) === selectedFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(t => 
      t.title?.toLowerCase().includes(q) ||
      t.venue?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q)
    )
  }

  return list
})

const getRegistrationStatus = (tId) => {
  if (!studentProfile.value) return null
  return tournamentStore.getStudentRegistration(studentProfile.value.id, tId)
}

const registerForTournament = async (t) => {
  if (!studentProfile.value) return
  activeProcessingId.value = `reg-${t.id}`
  try {
    await tournamentStore.registerStudent(studentProfile.value, t)
    notificationStore.addToast(`Successfully registered for ${t.title}!`, 'success')
  } catch (err) {
    notificationStore.addToast(`Failed to register for tournament.`, 'error')
  } finally {
    activeProcessingId.value = null
  }
}

const cancelRegistration = async (regId, tId) => {
  activeProcessingId.value = `cancel-${tId}`
  try {
    await tournamentStore.cancelRegistration(regId)
    notificationStore.addToast(`Tournament registration cancelled.`, 'info')
  } catch (err) {
    notificationStore.addToast(`Failed to cancel registration.`, 'error')
  } finally {
    activeProcessingId.value = null
  }
}
</script>
