<template>
  <div class="space-y-8">
    
    <!-- Top Greeting Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-amber-500/20">
      <div>
        <h1 class="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">
          Welcome back, <span class="text-amber-400">{{ authStore.currentUserProfile?.name || 'Master' }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">Here is your academy's real-time operational overview for today.</p>
      </div>
      <div class="flex items-center space-x-3">
        <router-link 
          to="/admin/students" 
          class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
        >
          + Add New Student
        </router-link>
      </div>
    </div>

    <!-- Summary Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Card 1: Total Students -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Active Students</p>
          <h3 class="text-3xl font-extrabold text-slate-100 mt-2 font-heading">{{ studentStore.activeStudentsCount }}</h3>
          <p class="text-[11px] text-amber-400 font-semibold mt-1">{{ studentStore.totalStudentsCount }} Registered Total</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <UserGroupIcon class="w-8 h-8" />
        </div>
      </div>

      <!-- Card 2: Pending Payments -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Pending Payments</p>
          <h3 class="text-3xl font-extrabold text-amber-400 mt-2 font-heading">{{ paymentStore.pendingPaymentsCount }}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Awaiting UPI Verification</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <CreditCardIcon class="w-8 h-8" />
        </div>
      </div>

      <!-- Card 3: Monthly Collected Revenue -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Collected This Month</p>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2 font-heading">₹{{ paymentStore.collectedThisMonth }}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Total ₹{{ paymentStore.totalRevenue }} All-Time</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <BanknotesIcon class="w-8 h-8" />
        </div>
      </div>

      <!-- Card 4: Open Queries -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Pending Student Queries</p>
          <h3 class="text-3xl font-extrabold text-amber-400 mt-2 font-heading">{{ queryStore.openQueriesCount }}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Open Helpdesk Tickets</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ChatBubbleLeftRightIcon class="w-8 h-8" />
        </div>
      </div>

      <!-- Card 5: Upcoming Tournaments -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Upcoming Tournaments</p>
          <h3 class="text-3xl font-extrabold text-slate-100 mt-2 font-heading">{{ tournamentStore.upcomingTournaments.length }}</h3>
          <p class="text-[11px] text-amber-400 mt-1">Registrations Open</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <TrophyIcon class="w-8 h-8" />
        </div>
      </div>

      <!-- Card 6: Total Broadcast Notifications -->
      <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase text-slate-400 tracking-wider">Active Announcements</p>
          <h3 class="text-3xl font-extrabold text-slate-100 mt-2 font-heading">{{ notificationStore.notifications.length }}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Broadcasted Push Alerts</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <BellIcon class="w-8 h-8" />
        </div>
      </div>

    </div>

    <!-- Quick Action Tables Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Pending UPI Payments Approval Table -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-heading text-lg font-bold text-slate-100">Pending Fee Payments</h3>
          <router-link to="/admin/payments" class="text-xs font-bold text-amber-400 hover:underline">View All</router-link>
        </div>

        <div v-if="paymentStore.pendingPayments.length" class="space-y-3">
          <div 
            v-for="pay in paymentStore.pendingPayments.slice(0, 4)" 
            :key="pay.id"
            class="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center space-x-3">
              <AvatarInitials :name="pay.studentName" size="sm" />
              <div>
                <h4 class="text-sm font-bold text-slate-100">{{ pay.studentName }}</h4>
                <p class="text-[10px] text-slate-400 font-mono mt-0.5">UTR: {{ pay.transactionId }}</p>
                <p class="text-[10px] text-amber-400 font-semibold mt-0.5">Amount: ₹{{ pay.amount }} • {{ pay.month }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <LoadingButton 
                @click="paymentStore.approvePayment(pay.id, authStore.currentUserProfile?.name || 'Admin')"
                :loading="paymentStore.loading"
                variant="emerald"
                size="xs"
                loading-text="..."
              >
                Approve
              </LoadingButton>
              <LoadingButton 
                @click="paymentStore.rejectPayment(pay.id, authStore.currentUserProfile?.name || 'Admin')"
                :loading="paymentStore.loading"
                variant="outline"
                size="xs"
                class="!text-rose-300"
              >
                Reject
              </LoadingButton>
            </div>
          </div>
        </div>

        <EmptyState 
          v-else
          title="No Pending Payments"
          description="All student monthly fee submissions have been reviewed and verified."
        />
      </div>

      <!-- Recent Student Queries Table -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-heading text-lg font-bold text-slate-100">Recent Student Queries</h3>
          <router-link to="/admin/queries" class="text-xs font-bold text-amber-400 hover:underline">View All</router-link>
        </div>

        <div v-if="queryStore.queries.length" class="space-y-3">
          <div 
            v-for="query in queryStore.queries.slice(0, 4)" 
            :key="query.id"
            class="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
          >
            <div class="space-y-1 max-w-xs">
              <div class="flex items-center space-x-2">
                <StatusBadge :status="query.status" />
                <span class="text-xs font-bold text-slate-200 truncate">{{ query.title }}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate">From: {{ query.studentName }}</p>
            </div>
            <router-link 
              to="/admin/queries"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700"
            >
              Reply
            </router-link>
          </div>
        </div>

        <EmptyState 
          v-else
          title="No Support Queries"
          description="There are no active helpdesk questions from students right now."
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { usePaymentStore } from '@/stores/payment'
import { useQueryStore } from '@/stores/query'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { 
  UserGroupIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  ChatBubbleLeftRightIcon, 
  TrophyIcon, 
  BellIcon 
} from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const paymentStore = usePaymentStore()
const queryStore = useQueryStore()
const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()
</script>
