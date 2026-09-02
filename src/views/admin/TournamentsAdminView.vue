<template>
  <div class="space-y-6 pb-12">
    <!-- Header section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Tournament Management</h1>
        <p class="text-xs text-slate-400">Organize upcoming tournaments, set quotas, edit details, and export registered rosters.</p>
      </div>

      <button 
        @click="openCreateModal"
        class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
      >
        + Create Tournament
      </button>
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
      <div class="w-full md:w-72 relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by title, venue, ID..." 
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
        <MagnifyingGlassIcon class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>
    </div>

    <!-- Tournament Cards Grid -->
    <div v-if="filteredTournaments.length" class="grid grid-cols-1 gap-6">
      <div 
        v-for="t in filteredTournaments" 
        :key="t.id"
        class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 relative"
      >
        <!-- Header & Action Menu -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div class="flex items-center space-x-2">
              <!-- Dynamic Status Badge -->
              <span :class="getStatusBadgeClass(tournamentStore.getCalculatedStatus(t))" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border">
                {{ tournamentStore.getCalculatedStatus(t) }}
              </span>
              <span class="text-xs font-mono text-slate-500">{{ t.id }}</span>
            </div>
            <h3 class="font-heading text-lg font-bold text-slate-100 mt-1">{{ t.title }}</h3>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Edit Button -->
            <button 
              @click="openEditModal(t)"
              class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
              title="Edit Tournament"
            >
              <PencilSquareIcon class="w-4 h-4" />
              <span>Edit</span>
            </button>

            <!-- Delete Button -->
            <button 
              @click="confirmDeleteTournament(t)"
              class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
              title="Delete Tournament"
            >
              <TrashIcon class="w-4 h-4" />
              <span>Delete</span>
            </button>

            <!-- Export CSV -->
            <button 
              @click="tournamentStore.exportParticipantsCSV(t)"
              class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
              title="Download Roster CSV"
            >
              <ArrowDownTrayIcon class="w-4 h-4 text-amber-400" />
              <span class="hidden sm:inline">CSV</span>
            </button>
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
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Deadline</span>
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
              <span class="text-slate-400 text-[11px] font-semibold">Available Slots: <strong class="text-emerald-400 font-extrabold">{{ tournamentStore.getAvailableSlots(t.id) }}</strong></span>
              <span class="text-amber-400 font-mono font-extrabold">{{ tournamentStore.getParticipantCount(t.id) }} / {{ tournamentStore.getQuota(t.id) }} Quota</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              class="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 ease-out" 
              :style="{ width: `${tournamentStore.getProgressPercent(t.id)}%` }"
            ></div>
          </div>
        </div>

        <!-- Registered Students Preview Table -->
        <div class="pt-2">
          <h4 class="text-xs font-bold text-slate-300 mb-2">Registered Students Roster ({{ tournamentStore.getParticipantCount(t.id) }}):</h4>
          <div v-if="tournamentStore.getRegistrationsForTournament(t.id).length" class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="reg in tournamentStore.getRegistrationsForTournament(t.id)" 
              :key="reg.id"
              class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div class="flex items-center space-x-3">
                <span class="font-bold text-slate-100">{{ reg.studentName }}</span>
                <BeltBadge :belt="reg.belt" />
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-slate-400 font-mono text-[11px]">{{ reg.phone }}</span>
                <button 
                  @click="tournamentStore.cancelRegistration(reg.id)"
                  class="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/30"
                  title="Remove participant"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-slate-500 text-xs italic p-3 bg-slate-900/30 rounded-xl border border-slate-800/40">No registrations submitted yet.</div>
        </div>

      </div>
    </div>

    <!-- Empty Filter State -->
    <div v-else class="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
      <div class="text-4xl">🏆</div>
      <h3 class="font-heading text-lg font-bold text-slate-200">No Tournaments Found</h3>
      <p class="text-xs text-slate-400">No tournaments match the selected filter or search term.</p>
    </div>

    <!-- Create / Edit Tournament Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">
              {{ isEditing ? 'Edit Tournament' : 'Create New Tournament' }}
            </h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveTournament" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Tournament Title</label>
              <input v-model="form.title" type="text" required placeholder="e.g. State Level Traditional Martial Arts Cup" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Venue Address</label>
              <input v-model="form.venue" type="text" required placeholder="e.g. District Sports Hub" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Tournament Date</label>
                <input v-model="form.date" type="date" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Registration Deadline</label>
                <input v-model="form.registrationDeadline" type="date" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Registration Fee (₹)</label>
                <input v-model="form.fee" type="number" required min="0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Max Participants Quota</label>
                <input v-model="form.maxParticipants" type="number" required min="1" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div>
              <FileUpload 
                category="tournament" 
                label="Tournament Banner Image" 
                v-model="form.bannerImage" 
              />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Description & Rules</label>
              <textarea v-model="form.description" rows="3" required placeholder="Categories, rules..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 resize-none focus:outline-none focus:border-amber-500"></textarea>
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="tournamentStore.loading" 
                variant="primary" 
                size="sm"
                :loading-text="isEditing ? 'Saving Changes...' : 'Creating...'"
              >
                {{ isEditing ? 'Save Changes' : 'Create Tournament' }}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-6 text-center shadow-2xl">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>

          <div>
            <h3 class="font-heading text-lg font-bold text-slate-100">Delete Tournament?</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              This action will permanently delete <strong class="text-slate-200">"{{ deleteTarget.title }}"</strong> and all associated participant registrations. This action cannot be undone.
            </p>
          </div>

          <div class="flex items-center justify-center space-x-3 pt-2">
            <button 
              @click="deleteTarget = null" 
              class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <LoadingButton 
              @click="handleDelete" 
              :loading="tournamentStore.loading" 
              variant="rose" 
              size="md"
              loading-text="Deleting..."
            >
              Delete Permanently
            </LoadingButton>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import { ArrowDownTrayIcon, XMarkIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const selectedFilter = ref('All')
const searchQuery = ref('')

const form = reactive({
  title: '',
  venue: '',
  date: '',
  registrationDeadline: '',
  description: '',
  fee: 500,
  maxParticipants: 50,
  bannerImage: ''
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

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.title = ''
  form.venue = ''
  form.date = ''
  form.registrationDeadline = ''
  form.description = ''
  form.fee = 500
  form.maxParticipants = 50
  isModalOpen.value = true
}

const openEditModal = (t) => {
  isEditing.value = true
  editingId.value = t.id
  form.title = t.title || ''
  form.venue = t.venue || ''
  form.date = t.date || t.tournamentDate || ''
  form.registrationDeadline = t.registrationDeadline || ''
  form.description = t.description || ''
  form.fee = t.fee || 500
  form.maxParticipants = t.maxParticipants || t.quota || 50
  isModalOpen.value = true
}

const saveTournament = async () => {
  if (isEditing.value && editingId.value) {
    await tournamentStore.updateTournament(editingId.value, { ...form })
    notificationStore.addToast(`Tournament updated successfully!`, 'success')
  } else {
    await tournamentStore.createTournament({ ...form })
    notificationStore.addToast(`Tournament "${form.title}" created successfully!`, 'success')
  }
  isModalOpen.value = false
}

const confirmDeleteTournament = (t) => {
  deleteTarget.value = t
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  const title = deleteTarget.value.title
  await tournamentStore.deleteTournament(deleteTarget.value.id)
  notificationStore.addToast(`Tournament "${title}" deleted permanently.`, 'success')
  deleteTarget.value = null
}
</script>
