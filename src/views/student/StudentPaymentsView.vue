<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Fee Payment Portal</h1>
        <p class="text-xs text-slate-400">Select payment category, scan official Academy UPI QR, and submit your UTR reference number.</p>
      </div>

      <!-- Quick Status Indicator -->
      <div v-if="studentProfile" class="glass-card px-4 py-2 rounded-2xl border border-slate-800 flex items-center space-x-3 text-xs">
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
        <div>
          <span class="text-[10px] text-slate-500 uppercase font-bold block">Current Student</span>
          <span class="font-bold text-slate-100">{{ studentProfile.fullName }} ({{ studentProfile.id }})</span>
        </div>
      </div>
    </div>

    <!-- Category Selector Bar -->
    <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
      <label class="block font-heading text-xs font-bold uppercase text-amber-400 tracking-wider">
        Step 1: Select Payment Category
      </label>
      <div class="relative">
        <select 
          v-model="selectedCategory" 
          class="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-100 appearance-none cursor-pointer focus:outline-none transition-colors"
        >
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
    </div>

    <!-- MAIN PAYMENT SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- LEFT COLUMN: UPI QR CODE CARD -->
      <div class="glass-card p-8 rounded-3xl text-center space-y-5 border border-amber-500/30 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-center justify-center space-x-2">
          <span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Official Academy UPI VPA
          </span>
        </div>
        
        <div class="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-amber-500/40 transform hover:scale-105 transition-transform duration-300">
          <img 
            :src="settingsStore.settings.upiQrCodeUrl || defaultQrCodeUrl" 
            alt="UPI QR Code" 
            class="w-52 h-52 object-contain mx-auto"
          />
        </div>

        <div class="space-y-1.5 pt-2">
          <p class="text-xs font-bold text-slate-300">
            UPI ID: <span class="font-mono text-amber-400 text-sm select-all">{{ settingsStore.settings.upiId || 'wushuassociation@upi' }}</span>
          </p>
          <p class="text-xs text-slate-400">
            Payable Amount: <strong class="text-slate-100 text-base font-black">₹{{ payableAmount }}</strong>
          </p>
          <p class="text-[10px] text-slate-500 italic">Scan via Google Pay, PhonePe, Paytm, or any UPI app</p>
        </div>
      </div>

      <!-- RIGHT COLUMN: FORM OR STATUS CARDS -->
      <div class="space-y-6">

        <!-- ======================================================= -->
        <!-- CATEGORY: ACADEMY MONTHLY FEE VALIDATION CARDS -->
        <!-- ======================================================= -->

        <template v-if="selectedCategory === 'Academy Monthly Fee'">
          
          <!-- STATE 1: APPROVED -->
          <div v-if="monthlyFeeStatus === 'Approved'" class="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 space-y-5 text-center">
            <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✔
            </div>
            <div>
              <h3 class="font-heading text-lg font-extrabold text-emerald-400">Monthly Fee Already Paid</h3>
              <p class="text-xs text-slate-300 mt-1">
                You have already completed your Academy Monthly Fee payment for <strong class="text-slate-100">{{ currentMonthName }} {{ currentYear }}</strong>.
              </p>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-left text-xs">
              <div class="flex justify-between border-b border-slate-800 pb-2">
                <span class="text-slate-400">Payment Status</span>
                <StatusBadge status="Approved" />
              </div>
              <div class="flex justify-between border-b border-slate-800 pb-2">
                <span class="text-slate-400">Transaction Ref UTR</span>
                <span class="font-mono text-amber-400 font-bold">{{ currentMonthlyFeeRecord?.transactionId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Approved Date</span>
                <span class="text-slate-200 font-medium">
                  {{ currentMonthlyFeeRecord?.approvedDate ? new Date(currentMonthlyFeeRecord.approvedDate).toLocaleDateString() : 'Verified' }}
                </span>
              </div>
            </div>

            <p class="text-[11px] text-slate-500 italic">
              Thank you! The payment form for next month will automatically open when {{ nextMonthName }} begins.
            </p>
          </div>

          <!-- STATE 2: PENDING APPROVAL -->
          <div v-else-if="monthlyFeeStatus === 'Pending Approval'" class="glass-panel p-8 rounded-3xl border border-amber-500/40 bg-amber-950/20 space-y-5 text-center">
            <div class="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl animate-spin">
              ⏳
            </div>
            <div>
              <h3 class="font-heading text-lg font-extrabold text-amber-400">Payment Submitted</h3>
              <p class="text-xs text-slate-300 mt-1">
                Your payment for <strong class="text-slate-100">{{ currentMonthName }} {{ currentYear }}</strong> has been received and is currently <strong class="text-amber-400">Pending Approval</strong>.
              </p>
              <p class="text-xs text-slate-400 mt-1">Please wait until the academy admin verifies your transaction reference.</p>
            </div>

            <div class="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-left text-xs">
              <div class="flex justify-between border-b border-slate-800 pb-2">
                <span class="text-slate-400">Status</span>
                <StatusBadge status="Pending Approval" />
              </div>
              <div class="flex justify-between border-b border-slate-800 pb-2">
                <span class="text-slate-400">Submitted UTR</span>
                <span class="font-mono text-amber-400 font-bold">{{ currentMonthlyFeeRecord?.transactionId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Submitted Date</span>
                <span class="text-slate-200 font-medium">{{ new Date(currentMonthlyFeeRecord?.paymentDate).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- STATE 3: REJECTED WARNING -->
          <div v-else-if="monthlyFeeStatus === 'Rejected'" class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
            <div class="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <span>⚠️</span>
              <span>Previous Payment Rejected</span>
            </div>
            <p class="text-slate-300">
              Reason: <strong class="text-rose-300">{{ currentMonthlyFeeRecord?.notes || 'Transaction ID not matching bank record' }}</strong>
            </p>
            <p class="text-slate-400 text-[11px]">
              Please double check your UPI app's 12-digit UTR reference number and submit a new payment below.
            </p>
          </div>

        </template>

        <!-- ======================================================= -->
        <!-- CATEGORY: TOURNAMENT FEE VALIDATION -->
        <!-- ======================================================= -->

        <template v-else-if="selectedCategory === 'Tournament Registration Fee'">
          <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <label class="block font-bold uppercase text-slate-300 text-xs">Select Tournament</label>
            <select 
              v-model="selectedTournamentId"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-100 focus:outline-none"
            >
              <option value="">-- Choose Upcoming Tournament --</option>
              <option v-for="trn in tournamentStore.upcomingTournaments" :key="trn.id" :value="trn.id">
                {{ trn.title }} (₹{{ trn.fee || 500 }})
              </option>
            </select>

            <!-- TOURNAMENT ALREADY PAID CARD -->
            <div v-if="tournamentPaymentRecord" class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-200">Tournament Fee Status</span>
                <StatusBadge :status="tournamentPaymentRecord.status" />
              </div>
              <p class="text-[11px] text-slate-400">
                You have already submitted a payment for this tournament (UTR: <span class="font-mono text-amber-400">{{ tournamentPaymentRecord.transactionId }}</span>).
              </p>
            </div>
          </div>
        </template>

        <!-- ======================================================= -->
        <!-- CATEGORY: GENERIC PENDING VALIDATION -->
        <!-- ======================================================= -->

        <template v-else>
          <div v-if="genericCategoryPendingRecord" class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-400">Payment Pending Verification</span>
              <StatusBadge status="Pending Approval" />
            </div>
            <p class="text-slate-300 text-[11px]">
              A payment of ₹{{ genericCategoryPendingRecord.amount }} for {{ selectedCategory }} is currently pending admin approval.
            </p>
          </div>
        </template>

        <!-- ======================================================= -->
        <!-- PAYMENT SUBMISSION FORM -->
        <!-- ======================================================= -->

        <div v-if="canSubmitPayment" class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5">
          <div>
            <h3 class="font-heading text-base font-bold text-slate-100">Submit Transaction Reference</h3>
            <p class="text-xs text-slate-400 mt-0.5">Enter your 12-digit UPI UTR / Reference number after completing payment.</p>
          </div>

          <form @submit.prevent="handlePaymentSubmit" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Selected Category</label>
              <input 
                :value="selectedCategory" 
                disabled 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-bold"
              />
            </div>

            <!-- Auto Month for Monthly Fee -->
            <div v-if="selectedCategory === 'Academy Monthly Fee'">
              <label class="block font-bold uppercase text-slate-300 mb-1">Fee Month & Year (Auto Detected)</label>
              <input 
                :value="`${currentMonthName} ${currentYear}`" 
                disabled 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-bold"
              />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Payment Amount (₹)</label>
              <input 
                :value="payableAmount" 
                disabled 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-extrabold text-sm"
              />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">UPI Transaction Ref / UTR Number (12 Digits)</label>
              <input 
                v-model="transactionId"
                type="text" 
                required 
                maxlength="20"
                placeholder="e.g. 987654321012"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <LoadingButton 
              type="submit"
              :loading="paymentStore.loading"
              :disabled="!transactionId.trim()"
              variant="primary"
              size="lg"
              block
              loading-text="Submitting Reference..."
            >
              Submit Payment for Admin Verification
            </LoadingButton>
          </form>
        </div>

      </div>

    </div>

    <!-- ======================================================= -->
    <!-- COMPLETE STUDENT PAYMENT HISTORY TIMELINE -->
    <!-- ======================================================= -->

    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-heading text-lg font-bold text-slate-100">My Complete Payment History</h3>
          <p class="text-xs text-slate-400">All submitted payment transactions and their verification status.</p>
        </div>
        <span class="px-3 py-1 bg-slate-900 rounded-full text-xs font-bold text-slate-400 border border-slate-800">
          Total Records: {{ myPayments.length }}
        </span>
      </div>

      <div v-if="myPayments.length" class="space-y-3">
        <div 
          v-for="pay in myPayments" 
          :key="pay.id" 
          class="p-5 bg-slate-900/80 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
        >
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-100 text-sm">{{ pay.category || 'Academy Monthly Fee' }}</span>
              <span v-if="pay.month" class="px-2 py-0.5 bg-slate-800 text-amber-400 rounded text-[10px] font-bold">
                {{ pay.month }} {{ pay.year || '' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-mono">
              UTR / Ref ID: <span class="text-slate-200 font-bold select-all">{{ pay.transactionId }}</span>
            </p>
            <p class="text-[10px] text-slate-500">
              Submitted: {{ new Date(pay.paymentDate).toLocaleString() }}
            </p>
            <p v-if="pay.status === 'Approved' && pay.approvedDate" class="text-[10px] text-emerald-400 font-medium">
              ✔ Approved on {{ new Date(pay.approvedDate).toLocaleString() }} by {{ pay.approvedBy || 'Admin' }}
            </p>
            <p v-if="pay.status === 'Rejected' && pay.notes" class="text-[10px] text-rose-400 font-medium">
              ❌ Rejected: {{ pay.notes }}
            </p>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <span class="font-black text-amber-400 text-base">₹{{ pay.amount }}</span>
            <StatusBadge :status="pay.status" />
          </div>
        </div>
      </div>

      <div v-else class="text-slate-500 text-xs py-8 text-center">
        No payment records found for your account.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { useTournamentStore } from '@/stores/tournament'
import { useNotificationStore } from '@/stores/notification'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { INITIAL_SETTINGS } from '@/data/initialData'

const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const settingsStore = useSettingsStore()
const tournamentStore = useTournamentStore()
const notificationStore = useNotificationStore()

const defaultQrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=wushuassociation@upi&pn=Villupuram%20Wushu%20Association"

const selectedCategory = ref('Academy Monthly Fee')
const selectedTournamentId = ref('')
const transactionId = ref('')

const studentProfile = computed(() => authStore.currentUserProfile)

// Auto Month & Year Detection
const now = new Date()
const currentMonthName = computed(() => now.toLocaleString('default', { month: 'long' }))
const currentYear = computed(() => now.getFullYear())
const nextMonthName = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toLocaleString('default', { month: 'long' })
})

// Categories dropdown list
const availableCategories = computed(() => {
  return settingsStore.settings.paymentCategories || INITIAL_SETTINGS.paymentCategories
})

// Payable Amount calculation based on selected category
const payableAmount = computed(() => {
  if (selectedCategory.value === 'Academy Monthly Fee') {
    return studentProfile.value?.monthlyFee || settingsStore.settings.defaultMonthlyFee || 1500
  }
  if (selectedCategory.value === 'Tournament Registration Fee' && selectedTournamentId.value) {
    const trn = tournamentStore.tournaments.find(t => t.id === selectedTournamentId.value)
    return trn?.fee || 500
  }
  return settingsStore.settings.defaultMonthlyFee || 1500
})

// Current Monthly Fee Record
const currentMonthlyFeeRecord = computed(() => {
  if (!studentProfile.value) return null
  return paymentStore.getStudentMonthlyFeePayment(
    studentProfile.value.id,
    currentMonthName.value,
    currentYear.value
  )
})

const monthlyFeeStatus = computed(() => {
  return currentMonthlyFeeRecord.value?.status || null
})

// Tournament Payment Validation Record
const tournamentPaymentRecord = computed(() => {
  if (!studentProfile.value || !selectedTournamentId.value) return null
  return paymentStore.getStudentTournamentPayment(studentProfile.value.id, selectedTournamentId.value)
})

// Generic Category Pending Record
const genericCategoryPendingRecord = computed(() => {
  if (!studentProfile.value) return null
  return paymentStore.getStudentPendingCategoryPayment(studentProfile.value.id, selectedCategory.value)
})

// Can submit payment logic
const canSubmitPayment = computed(() => {
  if (selectedCategory.value === 'Academy Monthly Fee') {
    return monthlyFeeStatus.value !== 'Approved' && monthlyFeeStatus.value !== 'Pending Approval'
  }
  if (selectedCategory.value === 'Tournament Registration Fee') {
    if (!selectedTournamentId.value) return false
    return !tournamentPaymentRecord.value
  }
  return !genericCategoryPendingRecord.value
})

// Student Payment History
const myPayments = computed(() => {
  if (!studentProfile.value) return []
  return paymentStore.payments
    .filter(p => p.studentId === studentProfile.value.id)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
})

// Handle Payment Submission
const handlePaymentSubmit = async () => {
  if (!studentProfile.value) return
  const cleanUTR = transactionId.value.trim()
  
  if (cleanUTR.length < 8) {
    notificationStore.addToast('Please enter a valid 12-digit UPI UTR transaction reference number.', 'warning')
    return
  }

  const payload = {
    studentId: studentProfile.value.id,
    studentName: studentProfile.value.fullName,
    category: selectedCategory.value,
    month: currentMonthName.value,
    year: currentYear.value,
    amount: payableAmount.value,
    transactionId: cleanUTR,
    tournamentId: selectedCategory.value === 'Tournament Registration Fee' ? selectedTournamentId.value : ''
  }

  await paymentStore.submitPayment(payload)
  notificationStore.addToast(`Payment submitted successfully! Status is now Pending Approval.`, 'success')
  transactionId.value = ''
}
</script>
