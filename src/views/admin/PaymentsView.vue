<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Payment Approvals & Verification</h1>
        <p class="text-xs text-slate-400">Review student UPI UTR reference submissions, approve verified payments, or reject with reason.</p>
      </div>

      <!-- Quick Metrics Pill -->
      <div class="flex items-center space-x-3 text-xs">
        <div class="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <span class="text-[10px] text-slate-400 font-bold uppercase block">Pending Review</span>
          <span class="font-black text-amber-400 text-sm">{{ paymentStore.pendingPaymentsCount }}</span>
        </div>
        <div class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Revenue</span>
          <span class="font-black text-emerald-400 text-sm">₹{{ paymentStore.totalRevenue }}</span>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      
      <!-- Status Tabs -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
        <button 
          v-for="st in ['All', 'Pending Approval', 'Approved', 'Rejected']" 
          :key="st"
          @click="paymentStore.filterStatus = st"
          class="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
          :class="paymentStore.filterStatus === st ? 'bg-amber-500 text-slate-950 shadow-glow-gold' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'"
        >
          {{ st }}
          <span v-if="st === 'Pending Approval' && paymentStore.pendingPaymentsCount" class="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px]">
            {{ paymentStore.pendingPaymentsCount }}
          </span>
        </button>
      </div>

      <!-- Search & Category Dropdown -->
      <div class="flex items-center space-x-3">
        <select 
          v-model="selectedCategoryFilter"
          class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search Student, ID, or UTR..."
          class="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="paymentStore.loading && !filteredPaymentRecords.length" class="space-y-4">
      <SkeletonLoader customClass="w-full h-24" v-for="i in 4" :key="i" />
    </div>

    <!-- EMPTY STATE -->
    <EmptyState 
      v-else-if="!filteredPaymentRecords.length"
      title="No Payment Records Found"
      description="No student payment submissions match your selected filter."
    />

    <!-- PAYMENTS CONTAINER -->
    <div v-else>
      <!-- DESKTOP TABLE VIEW (md:block) -->
      <div class="hidden md:block glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 uppercase text-[10px] font-extrabold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-4 px-6">Student & ID</th>
                <th class="py-4 px-6">Category & Details</th>
                <th class="py-4 px-6">UPI UTR Ref ID</th>
                <th class="py-4 px-6">Amount</th>
                <th class="py-4 px-6">Submitted Date</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              <tr v-for="pay in filteredPaymentRecords" :key="pay.id" class="hover:bg-slate-900/50 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center space-x-3">
                    <AvatarInitials :name="pay.studentName" size="sm" />
                    <div>
                      <h4 class="font-bold text-slate-100 text-sm">{{ pay.studentName }}</h4>
                      <p class="text-[10px] text-slate-500 font-mono mt-0.5">ID: {{ pay.studentId }} • {{ pay.id }}</p>
                    </div>
                  </div>
                </td>

                <td class="py-4 px-6">
                  <span class="font-bold text-slate-200 block">{{ pay.category || 'Academy Monthly Fee' }}</span>
                  <span v-if="pay.month" class="text-[10px] text-amber-400 font-bold">
                    {{ pay.month }} {{ pay.year || '' }}
                  </span>
                </td>

                <td class="py-4 px-6 font-mono text-amber-400 font-bold select-all">
                  {{ pay.transactionId }}
                </td>

                <td class="py-4 px-6 font-black text-slate-100 text-sm">
                  ₹{{ pay.amount }}
                </td>

                <td class="py-4 px-6 text-[11px] text-slate-400">
                  {{ new Date(pay.paymentDate).toLocaleString() }}
                </td>

                <td class="py-4 px-6">
                  <StatusBadge :status="pay.status" />
                  <span v-if="pay.status === 'Rejected' && pay.notes" class="block text-[10px] text-rose-400 mt-1 italic max-w-xs truncate" :title="pay.notes">
                    Reason: {{ pay.notes }}
                  </span>
                </td>

                <td class="py-4 px-6 text-right space-x-2">
                  <div v-if="pay.status === 'Pending Approval'" class="inline-flex space-x-2">
                    <LoadingButton 
                      @click="handleApprove(pay)"
                      :loading="activeProcessingId === pay.id"
                      variant="emerald"
                      size="sm"
                      loading-text="Approving..."
                    >
                      ✔ Approve
                    </LoadingButton>
                    <LoadingButton 
                      @click="openRejectModal(pay)"
                      :disabled="activeProcessingId === pay.id"
                      variant="outline"
                      size="sm"
                      class="!text-rose-300 hover:!bg-rose-500/20"
                    >
                      ✖ Reject
                    </LoadingButton>
                  </div>
                  <div v-else class="text-[10px] text-slate-400 italic">
                    <span>Verified by {{ pay.approvedBy || 'Admin' }}</span>
                    <span v-if="pay.approvedDate" class="block text-[9px] text-slate-500">
                      {{ new Date(pay.approvedDate).toLocaleDateString() }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE CARDS VIEW (md:hidden) -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="pay in filteredPaymentRecords" 
          :key="pay.id"
          class="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 text-xs"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <AvatarInitials :name="pay.studentName" size="sm" />
              <div>
                <h4 class="font-bold text-slate-100 text-sm">{{ pay.studentName }}</h4>
                <p class="text-[10px] text-slate-500 font-mono">{{ pay.studentId }}</p>
              </div>
            </div>
            <StatusBadge :status="pay.status" />
          </div>

          <div class="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 space-y-1.5 text-[11px]">
            <div class="flex justify-between">
              <span class="text-slate-400">Category</span>
              <span class="font-bold text-slate-200">{{ pay.category || 'Academy Monthly Fee' }}</span>
            </div>
            <div v-if="pay.month" class="flex justify-between">
              <span class="text-slate-400">Month/Year</span>
              <span class="text-amber-400 font-bold">{{ pay.month }} {{ pay.year || '' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">UTR Ref ID</span>
              <span class="font-mono text-amber-400 font-bold select-all">{{ pay.transactionId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Amount</span>
              <span class="font-black text-slate-100 text-sm">₹{{ pay.amount }}</span>
            </div>
            <div v-if="pay.status === 'Rejected' && pay.notes" class="pt-1 border-t border-slate-800 text-rose-400">
              Reason: {{ pay.notes }}
            </div>
          </div>

          <div v-if="pay.status === 'Pending Approval'" class="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800">
            <LoadingButton 
              @click="handleApprove(pay)"
              :loading="activeProcessingId === pay.id"
              variant="emerald"
              size="sm"
              loading-text="Approving..."
            >
              ✔ Approve
            </LoadingButton>
            <LoadingButton 
              @click="openRejectModal(pay)"
              :disabled="activeProcessingId === pay.id"
              variant="outline"
              size="sm"
              class="!text-rose-300"
            >
              ✖ Reject
            </LoadingButton>
          </div>
          <div v-else class="text-[10px] text-slate-500 italic text-right border-t border-slate-800/80 pt-2">
            Verified by {{ pay.approvedBy || 'Admin' }}
          </div>
        </div>
      </div>
    </div>

    <!-- REJECTION REASON MODAL -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/30 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-heading text-base font-bold text-rose-400">Reject Payment Submission</h3>
          <button @click="showRejectModal = false" class="text-slate-400 hover:text-slate-200 text-lg">&times;</button>
        </div>

        <div v-if="targetPayment" class="text-xs text-slate-300 space-y-1">
          <p>Student: <strong class="text-slate-100">{{ targetPayment.studentName }}</strong> ({{ targetPayment.studentId }})</p>
          <p>Category: <strong class="text-amber-400">{{ targetPayment.category }}</strong> — ₹{{ targetPayment.amount }}</p>
          <p>UTR: <span class="font-mono text-slate-200">{{ targetPayment.transactionId }}</span></p>
        </div>

        <div>
          <label class="block font-bold uppercase text-slate-300 text-[11px] mb-1">Rejection Reason for Student</label>
          <textarea 
            v-model="rejectionReason" 
            rows="3"
            required
            placeholder="e.g. Transaction ID not matching bank statement, or Amount paid is incorrect"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            @click="showRejectModal = false"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800"
          >
            Cancel
          </button>
          <LoadingButton 
            type="button" 
            @click="confirmReject"
            :loading="activeProcessingId === targetPayment?.id"
            variant="rose"
            size="sm"
            loading-text="Rejecting..."
          >
            Confirm Rejection
          </LoadingButton>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useNotificationStore } from '@/stores/notification'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { INITIAL_SETTINGS } from '@/data/initialData'

const paymentStore = usePaymentStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const selectedCategoryFilter = ref('All')

const showRejectModal = ref(false)
const targetPayment = ref(null)
const rejectionReason = ref('Transaction ID not matching bank statement')
const activeProcessingId = ref(null)

const availableCategories = computed(() => {
  return settingsStore.settings.paymentCategories || INITIAL_SETTINGS.paymentCategories
})

const filteredPaymentRecords = computed(() => {
  let list = paymentStore.filteredPayments

  if (selectedCategoryFilter.value !== 'All') {
    list = list.filter(p => (p.category || 'Academy Monthly Fee') === selectedCategoryFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => 
      p.studentName.toLowerCase().includes(q) ||
      p.studentId.toLowerCase().includes(q) ||
      p.transactionId.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    )
  }

  return list
})

const handleApprove = async (pay) => {
  activeProcessingId.value = pay.id
  try {
    const adminName = authStore.currentUserProfile?.name || 'Admin'
    await paymentStore.approvePayment(pay.id, adminName)
    notificationStore.addToast(`Payment of ₹${pay.amount} for ${pay.studentName} Approved!`, 'success')
  } catch (e) {
    notificationStore.addToast(`Failed to approve payment. Please try again.`, 'error')
  } finally {
    activeProcessingId.value = null
  }
}

const openRejectModal = (pay) => {
  targetPayment.value = pay
  rejectionReason.value = 'Transaction ID not matching bank statement'
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!targetPayment.value) return
  const payId = targetPayment.value.id
  activeProcessingId.value = payId
  try {
    const adminName = authStore.currentUserProfile?.name || 'Admin'
    await paymentStore.rejectPayment(payId, adminName, rejectionReason.value.trim() || 'Transaction ID invalid')
    notificationStore.addToast(`Payment of ₹${targetPayment.value.amount} Rejected.`, 'warning')
    showRejectModal.value = false
    targetPayment.value = null
  } catch (e) {
    notificationStore.addToast(`Failed to reject payment. Please try again.`, 'error')
  } finally {
    activeProcessingId.value = null
  }
}
</script>
