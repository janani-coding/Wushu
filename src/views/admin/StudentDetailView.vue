<template>
  <div v-if="student" class="space-y-8">
    
    <!-- Top Profile Header Card -->
    <div class="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <AvatarInitials 
          :name="student.fullName"
          :photoUrl="student.profilePhoto"
          size="xl"
        />
        <div class="space-y-1">
          <div class="flex items-center justify-center sm:justify-start space-x-2">
            <h1 class="font-heading text-2xl font-extrabold text-slate-100">{{ student.fullName }}</h1>
            <StatusBadge :status="student.status" />
          </div>
          <p class="text-xs text-slate-400 font-mono">Student ID: {{ student.id }}</p>
          <div class="pt-1 flex items-center space-x-3 justify-center sm:justify-start">
            <BeltBadge :belt="student.currentBelt" />
            <span class="text-xs font-bold text-amber-400">Monthly Fee: ₹{{ student.monthlyFee }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <router-link 
          to="/admin/students" 
          class="px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl"
        >
          ← Back to Students
        </router-link>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Personal Info Panel -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-heading text-base font-bold text-slate-100 border-b border-slate-800 pb-3">Personal Details</h3>
        <div class="space-y-3 text-xs">
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Phone Number</span>
            <span class="text-slate-200 font-mono font-bold">{{ student.phoneNumber }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Date of Birth</span>
            <span class="text-slate-200 font-bold">{{ student.dob }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Gender</span>
            <span class="text-slate-200 font-bold">{{ student.gender }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Batch</span>
            <span class="text-slate-200 font-bold">{{ student.batch }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Joining Date</span>
            <span class="text-slate-200 font-bold">{{ student.joiningDate }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Address</span>
            <span class="text-slate-300 leading-relaxed">{{ student.address }}</span>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-bold text-[10px] block">Emergency Contact</span>
            <span class="text-amber-400 font-bold">{{ student.emergencyContact }}</span>
          </div>
        </div>
      </div>

      <!-- Activity & Tabs Panel -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Fee Payment History Timeline -->
        <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 class="font-heading text-base font-bold text-slate-100 flex items-center justify-between">
            <span>Fee Payment History</span>
            <StatusBadge :status="currentMonthPayment?.status || 'Unpaid'" />
          </h3>

          <div v-if="studentPayments.length" class="space-y-3">
            <div 
              v-for="p in studentPayments" 
              :key="p.id"
              class="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span class="font-bold text-slate-100">{{ p.month }}</span>
                <p class="text-[10px] text-slate-400 font-mono mt-0.5">UTR: {{ p.transactionId }}</p>
              </div>
              <div class="text-right">
                <span class="font-bold text-amber-400">₹{{ p.amount }}</span>
                <div class="mt-1">
                  <StatusBadge :status="p.status" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-slate-500 text-xs py-4 text-center">No payment history recorded.</div>
        </div>

        <!-- Student Achievements & Tournaments -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Achievements -->
          <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 class="font-heading text-sm font-bold text-slate-100">Uploaded Achievements</h3>
            <div v-if="studentAchievements.length" class="space-y-3">
              <div v-for="ach in studentAchievements" :key="ach.id" class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <h4 class="font-bold text-amber-400">{{ ach.title }}</h4>
                <p class="text-slate-400 text-[11px] mt-1">{{ ach.description }}</p>
                <span class="text-[10px] text-slate-500 block mt-2">{{ ach.date }}</span>
              </div>
            </div>
            <div v-else class="text-slate-500 text-xs py-4 text-center">No achievements uploaded yet.</div>
          </div>

          <!-- Tournament Registrations -->
          <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 class="font-heading text-sm font-bold text-slate-100">Tournament Registrations</h3>
            <div v-if="studentRegistrations.length" class="space-y-3">
              <div v-for="reg in studentRegistrations" :key="reg.id" class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <h4 class="font-bold text-slate-100">{{ getTournamentTitle(reg.tournamentId) }}</h4>
                  <p class="text-[10px] text-slate-400">Reg Date: {{ new Date(reg.registrationDate).toLocaleDateString() }}</p>
                </div>
                <StatusBadge :status="reg.paymentStatus" />
              </div>
            </div>
            <div v-else class="text-slate-500 text-xs py-4 text-center">Not registered for any tournaments.</div>
          </div>

        </div>

      </div>

    </div>
  </div>

  <div v-else class="text-center py-24 text-slate-400">
    <p>Student profile not found.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import { usePaymentStore } from '@/stores/payment'
import { useAchievementStore } from '@/stores/achievement'
import { useTournamentStore } from '@/stores/tournament'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'

const route = useRoute()
const studentStore = useStudentStore()
const paymentStore = usePaymentStore()
const achievementStore = useAchievementStore()
const tournamentStore = useTournamentStore()

const studentId = computed(() => route.params.id)

const student = computed(() => studentStore.getStudentById(studentId.value))

const studentPayments = computed(() => {
  return paymentStore.payments.filter(p => p.studentId === studentId.value)
})

const currentMonthPayment = computed(() => {
  return paymentStore.getStudentPaymentForMonth(studentId.value)
})

const studentAchievements = computed(() => {
  return achievementStore.getAchievementsByStudent(studentId.value)
})

const studentRegistrations = computed(() => {
  return tournamentStore.registrations.filter(r => r.studentId === studentId.value)
})

const getTournamentTitle = (tId) => {
  const t = tournamentStore.tournaments.find(trn => trn.id === tId)
  return t ? t.title : 'Tournament'
}
</script>
