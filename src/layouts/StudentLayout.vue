<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
    <PwaInstallPrompt />

    <!-- Top Sticky Mobile & Desktop Header -->
    <header class="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
      <div class="flex items-center space-x-3">
        <router-link to="/student/dashboard" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-gold group-hover:scale-105 transition-transform">
            <SparklesIcon class="w-6 h-6" />
          </div>
          <div>
            <h2 class="font-heading text-xs sm:text-sm font-black text-amber-400 tracking-wider">VILLUPURAM WUSHU</h2>
            <p class="text-[10px] text-slate-300 font-bold uppercase truncate max-w-[150px] sm:max-w-none">
              {{ authStore.currentUserProfile?.fullName || 'Student Portal' }}
            </p>
          </div>
        </router-link>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-3">
        <!-- Current Belt Badge -->
        <BeltBadge :belt="authStore.currentUserProfile?.currentBelt || 'White'" />

        <!-- Notification Bell Quick Access -->
        <router-link 
          to="/student/notifications"
          class="p-2 text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-amber-500/10 rounded-xl border border-slate-700/60 transition-colors relative touch-shrink"
          title="Notifications"
        >
          <BellIcon class="w-5 h-5" />
          <span 
            v-if="unreadNotifsCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse"
          >
            {{ unreadNotifsCount }}
          </span>
        </router-link>

        <!-- Logout Button -->
        <button 
          @click="handleLogout"
          class="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 rounded-xl border border-slate-700/60 transition-colors touch-shrink"
          title="Sign Out"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-36 sm:pb-24">
      <router-view />
    </main>

    <!-- Premium Mobile & PWA Bottom Navigation Bar -->
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-2xl px-2 py-2 pb-safe sm:px-6 shadow-2xl">
      <div class="max-w-md sm:max-w-xl mx-auto flex items-center justify-around">
        <router-link 
          v-for="item in primaryNavLinks" 
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all relative group touch-shrink min-w-[58px]"
          :class="$route.path === item.path ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" 
            :class="$route.path === item.path ? 'text-amber-400' : 'text-slate-400'"
          />
          <span class="text-[10px] mt-1 font-semibold tracking-tight">{{ item.name }}</span>
        </router-link>

        <!-- More Toggle for Secondary Pages -->
        <button 
          @click="isMoreMenuOpen = !isMoreMenuOpen"
          class="flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all relative touch-shrink min-w-[58px]"
          :class="isSecondaryActive || isMoreMenuOpen ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'"
        >
          <EllipsisHorizontalIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="text-[10px] mt-1 font-semibold tracking-tight">More</span>
        </button>
      </div>

      <!-- More Slide-up Menu Drawer -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div 
          v-if="isMoreMenuOpen" 
          class="absolute bottom-full left-4 right-4 mb-3 bg-slate-900 border border-amber-500/30 rounded-3xl p-4 shadow-2xl space-y-2 backdrop-blur-2xl"
        >
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Additional Student Views</span>
            <button @click="isMoreMenuOpen = false" class="text-slate-400 text-xs">✕</button>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <router-link 
              v-for="item in secondaryNavLinks"
              :key="item.path"
              :to="item.path"
              @click="isMoreMenuOpen = false"
              class="flex items-center space-x-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 text-xs font-bold text-slate-200 transition-colors"
            >
              <component :is="item.icon" class="w-5 h-5 text-amber-400" />
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        </div>
      </Transition>
    </nav>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { usePaymentStore } from '@/stores/payment'
import { useQueryStore } from '@/stores/query'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { 
  HomeIcon, 
  UserIcon, 
  CreditCardIcon, 
  TrophyIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const paymentStore = usePaymentStore()
const queryStore = useQueryStore()
const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()

const isMoreMenuOpen = ref(false)

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

const unreadNotifsCount = computed(() => {
  return notificationStore.notifications ? notificationStore.notifications.length : 0
})

const primaryNavLinks = [
  { name: 'Dashboard', path: '/student/dashboard', icon: HomeIcon },
  { name: 'Pay Fee', path: '/student/payments', icon: CreditCardIcon },
  { name: 'Ask Query', path: '/student/queries', icon: ChatBubbleLeftRightIcon },
  { name: 'Tournaments', path: '/student/tournaments', icon: TrophyIcon },
  { name: 'Profile', path: '/student/profile', icon: UserIcon }
]

const secondaryNavLinks = [
  { name: 'My Achievements', path: '/student/achievements', icon: TrophyIcon },
  { name: 'Notifications', path: '/student/notifications', icon: BellIcon }
]

const isSecondaryActive = computed(() => {
  return secondaryNavLinks.some(item => route.path === item.path)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login/student')
}
</script>
