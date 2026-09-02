<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-amber-500 selection:text-slate-950">
    <PwaInstallPrompt />

    <!-- Sidebar Desktop -->
    <aside 
      class="hidden lg:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800 backdrop-blur-xl flex-shrink-0 z-30"
    >
      <!-- Admin Header -->
      <div class="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
        <router-link to="/admin/dashboard" class="flex items-center space-x-3 group">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <SparklesIcon class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-heading text-xs font-black text-amber-400 tracking-wider">VILLUPURAM WUSHU</h1>
            <p class="text-[10px] text-slate-400 font-bold uppercase">Admin Management</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <router-link 
          v-for="item in navLinks" 
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group touch-shrink"
          :class="$route.path.startsWith(item.path) ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'"
        >
          <div class="flex items-center space-x-3">
            <component 
              :is="item.icon" 
              class="w-5 h-5 transition-colors"
              :class="$route.path.startsWith(item.path) ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'" 
            />
            <span>{{ item.name }}</span>
          </div>
          <!-- Counter Badges -->
          <span 
            v-if="item.badgeCount && item.badgeCount > 0"
            class="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-500 text-slate-950 animate-pulse"
          >
            {{ item.badgeCount }}
          </span>
        </router-link>
      </div>

      <!-- Admin Profile Footer -->
      <div class="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-sm flex-shrink-0">
              {{ authStore.currentUserProfile?.name?.charAt(0) || 'A' }}
            </div>
            <div class="truncate">
              <h4 class="text-xs font-bold text-slate-100 truncate">{{ authStore.currentUserProfile?.name || 'Master Admin' }}</h4>
              <p class="text-[10px] text-amber-400 font-medium truncate">{{ authStore.currentUserProfile?.role || 'Academy Admin' }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            title="Logout"
            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors touch-shrink"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay & Slide Sidebar -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMobileSidebarOpen" class="fixed inset-0 z-50 lg:hidden flex">
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md" @click="isMobileSidebarOpen = false"></div>
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800/90 z-50 shadow-2xl">
          <div class="p-5 flex items-center justify-between border-b border-slate-800/80">
            <div class="flex items-center space-x-2">
              <SparklesIcon class="w-5 h-5 text-amber-400" />
              <span class="font-heading text-sm font-black text-amber-400 tracking-wider">WUSHU ADMIN</span>
            </div>
            <button @click="isMobileSidebarOpen = false" class="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/60">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
            <router-link 
              v-for="item in navLinks" 
              :key="item.path"
              :to="item.path"
              @click="isMobileSidebarOpen = false"
              class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all touch-shrink"
              :class="$route.path.startsWith(item.path) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center space-x-3">
                <component :is="item.icon" class="w-5 h-5 text-amber-400" />
                <span>{{ item.name }}</span>
              </div>
              <span v-if="item.badgeCount" class="px-2 py-0.5 text-xs font-black rounded-full bg-amber-500 text-slate-950">
                {{ item.badgeCount }}
              </span>
            </router-link>
          </div>

          <div class="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center">
            <div class="flex items-center space-x-2 min-w-0">
              <div class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center">
                {{ authStore.currentUserProfile?.name?.charAt(0) || 'A' }}
              </div>
              <span class="text-xs text-slate-200 font-bold truncate max-w-[130px]">{{ authStore.currentUserProfile?.name }}</span>
            </div>
            <button @click="handleLogout" class="text-xs text-rose-400 font-bold hover:underline">Logout</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Mobile Navigation Bar -->
      <header class="lg:hidden h-16 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-20 backdrop-blur-xl">
        <button 
          @click="isMobileSidebarOpen = true"
          class="p-2 text-slate-200 hover:text-amber-400 bg-slate-800/80 rounded-xl border border-slate-700/60 touch-shrink"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>
        <span class="font-heading text-xs font-black text-amber-400 tracking-wider uppercase">VILLUPURAM WUSHU ADMIN</span>
        <router-link to="/admin/profile" class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center touch-shrink">
          {{ authStore.currentUserProfile?.name?.charAt(0) || 'A' }}
        </router-link>
      </header>

      <!-- View Slot -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
        <router-view />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { useQueryStore } from '@/stores/query'
import { useStudentStore } from '@/stores/student'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { 
  HomeIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon, 
  PhotoIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  UserIcon, 
  Cog6ToothIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const queryStore = useQueryStore()
const studentStore = useStudentStore()
const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()

const isMobileSidebarOpen = ref(false)

onMounted(() => {
  studentStore.initAutoSync()
  paymentStore.initAutoSync()
  queryStore.initAutoSync()
  tournamentStore.initAutoSync()
  notificationStore.initAutoSync()

  studentStore.fetchStudents()
  paymentStore.fetchPayments()
  queryStore.fetchQueries()
  tournamentStore.fetchTournaments()
  notificationStore.fetchNotifications()
})

onUnmounted(() => {
  studentStore.unsubscribeAutoSync()
  paymentStore.unsubscribeAutoSync()
  queryStore.unsubscribeAutoSync()
  tournamentStore.unsubscribeAutoSync()
  notificationStore.unsubscribeAutoSync()
})

const navLinks = computed(() => [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
  { name: 'Students', path: '/admin/students', icon: UserGroupIcon },
  { name: 'Payments', path: '/admin/payments', icon: CreditCardIcon, badgeCount: paymentStore.pendingPaymentsCount },
  { name: 'Student Queries', path: '/admin/queries', icon: ChatBubbleLeftRightIcon, badgeCount: queryStore.openQueriesCount },
  { name: 'Notifications', path: '/admin/notifications', icon: BellIcon },
  { name: 'Gallery', path: '/admin/gallery', icon: PhotoIcon },
  { name: 'Tournament', path: '/admin/tournaments', icon: TrophyIcon },
  { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Profile & Admin Accounts', path: '/admin/profile', icon: UserIcon },
  { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon }
])

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login/admin')
}
</script>
