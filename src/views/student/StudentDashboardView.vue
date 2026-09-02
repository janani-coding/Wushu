<template>
  <div class="space-y-8 pb-28 sm:pb-12">
    
    <!-- Welcome Header Banner -->
    <div class="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <AvatarInitials 
          :name="studentProfile?.fullName || 'Student'"
          :photoUrl="studentProfile?.profilePhoto"
          size="xl"
        />
        <div>
          <h1 class="font-heading text-2xl font-extrabold text-slate-100">
            Welcome, <span class="text-amber-400">{{ studentProfile?.fullName }}</span>
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-mono">ID: {{ studentProfile?.id }} • Joined: {{ studentProfile?.joiningDate }}</p>
          <div class="mt-2 flex items-center space-x-3 justify-center sm:justify-start">
            <BeltBadge :belt="studentProfile?.currentBelt || 'White'" />
            <span class="text-xs text-slate-300 font-semibold">{{ studentProfile?.batch.split(' (')[0] }}</span>
          </div>
        </div>
      </div>

      <router-link 
        to="/student/payments"
        class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold text-center"
      >
        Pay Monthly Fee
      </router-link>
    </div>

    <!-- Monthly Payment Status Card -->
    <div class="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="space-y-1 text-center sm:text-left">
        <span class="text-[10px] uppercase font-bold text-slate-400">Current Month Status ({{ currentMonthName }})</span>
        <h3 class="text-lg font-bold text-slate-100">Monthly Fee: ₹{{ studentProfile?.monthlyFee }}</h3>
        <p class="text-xs text-slate-400" v-if="currentPayment">
          Transaction ID: <span class="font-mono text-amber-400 font-bold">{{ currentPayment.transactionId }}</span>
        </p>
      </div>
      <div>
        <StatusBadge :status="currentPayment?.status || 'Unpaid'" />
      </div>
    </div>

    <!-- Quick Action Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link to="/student/payments" class="glass-card p-6 rounded-3xl space-y-3 group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <CreditCardIcon class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-100 text-sm">Scan UPI & Pay Fees</h4>
        <p class="text-xs text-slate-400">Submit transaction UTR reference for admin approval.</p>
      </router-link>

      <router-link to="/student/achievements" class="glass-card p-6 rounded-3xl space-y-3 group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <TrophyIcon class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-100 text-sm">Upload Achievements</h4>
        <p class="text-xs text-slate-400">Upload medals and certificate photos to your warrior profile.</p>
      </router-link>

      <router-link to="/student/queries" class="glass-card p-6 rounded-3xl space-y-3 group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <ChatBubbleLeftRightIcon class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-100 text-sm">Ask Query / Helpdesk</h4>
        <p class="text-xs text-slate-400">Submit questions directly to academy masters.</p>
      </router-link>

      <router-link to="/student/tournaments" class="glass-card p-6 rounded-3xl space-y-3 group">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <SparklesIcon class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-100 text-sm">Tournament Entry</h4>
        <p class="text-xs text-slate-400">Register for upcoming Wushu open championships.</p>
      </router-link>
    </div>

    <!-- Automated Monthly Payment Reminder Popup Modal -->
    <Transition enter-active-class="transition duration-300" leave-active-class="transition duration-200">
      <div v-if="showReminderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="max-w-md w-full bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 space-y-6 text-center shadow-2xl relative">
          <div class="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 animate-bounce">
            <BellIcon class="w-8 h-8" />
          </div>

          <div class="space-y-2">
            <h3 class="font-heading text-xl font-bold text-slate-100">Monthly Fee Reminder</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Dear <strong class="text-amber-400">{{ studentProfile?.fullName }}</strong>, your academy monthly fee for <strong class="text-slate-100">{{ currentMonthName }}</strong> is currently pending.
            </p>
            <p class="text-[11px] text-amber-400 font-semibold">Amount Due: ₹{{ studentProfile?.monthlyFee }}</p>
          </div>

          <div class="pt-2 flex flex-col space-y-3">
            <router-link 
              to="/student/payments" 
              @click="showReminderModal = false"
              class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-gold"
            >
              Pay via UPI Now
            </router-link>
            <button 
              @click="showReminderModal = false"
              class="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-bold"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import { 
  CreditCardIcon, 
  TrophyIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon, 
  BellIcon 
} from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const settingsStore = useSettingsStore()

const showReminderModal = ref(false)

const studentProfile = computed(() => authStore.currentUserProfile)

const currentMonthName = computed(() => {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
})

const currentPayment = computed(() => {
  if (!studentProfile.value) return null
  return paymentStore.getStudentPaymentForMonth(studentProfile.value.id, currentMonthName.value)
})

onMounted(() => {
  if (studentProfile.value) {
    const shouldRemind = paymentStore.shouldShowPaymentReminder(
      studentProfile.value.id,
      settingsStore.settings.reminderSchedule
    )
    if (shouldRemind && (!currentPayment.value || currentPayment.value.status !== 'Approved')) {
      showReminderModal.value = true
    }
  }
})
</script>
