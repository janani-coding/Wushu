<template>
  <div class="space-y-8">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">Analytics & Financial Insights</h1>
      <p class="text-xs text-slate-400">Visual charts and operational statistics for academy decision making.</p>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Belt Distribution Chart -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-heading text-base font-bold text-slate-100">Students Distribution by Belt Rank</h3>
        <div class="h-64 flex items-center justify-center">
          <Doughnut :data="beltChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Batch Capacity Chart -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-heading text-base font-bold text-slate-100">Batch Attendance & Enrolment</h3>
        <div class="h-64 flex items-center justify-center">
          <Bar :data="batchChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Monthly Revenue Growth -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-heading text-base font-bold text-slate-100">Monthly Revenue Collection Trend (₹)</h3>
        <div class="h-64 flex items-center justify-center">
          <Line :data="revenueChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Fee Status Ratio -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-heading text-base font-bold text-slate-100">Collected vs Pending Fees Ratio</h3>
        <div class="h-64 flex items-center justify-center">
          <Doughnut :data="feeStatusChartData" :options="chartOptions" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStudentStore } from '@/stores/student'
import { usePaymentStore } from '@/stores/payment'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
)

const studentStore = useStudentStore()
const paymentStore = usePaymentStore()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Plus Jakarta Sans', size: 11 }
      }
    }
  }
}

// Belt Chart Data
const beltChartData = computed(() => {
  const counts = studentStore.studentsPerBelt
  return {
    labels: Object.keys(counts),
    datasets: [{
      backgroundColor: ['#f8fafc', '#fef08a', '#fed7aa', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#d7ccc8', '#f59e0b'],
      data: Object.values(counts)
    }]
  }
})

// Batch Chart Data
const batchChartData = computed(() => {
  const batches = studentStore.studentsPerBatch
  return {
    labels: Object.keys(batches),
    datasets: [{
      label: 'Enrolled Students',
      backgroundColor: '#f59e0b',
      data: Object.values(batches)
    }]
  }
})

// Revenue Chart Data
const revenueChartData = computed(() => {
  return {
    labels: ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [{
      label: 'Monthly Collection (₹)',
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      data: [4500, 6000, 7500, paymentStore.collectedThisMonth || 6000],
      fill: true
    }]
  }
})

// Fee Status Ratio Data
const feeStatusChartData = computed(() => {
  const approved = paymentStore.approvedPayments.length || 5
  const pending = paymentStore.pendingPayments.length || 1
  return {
    labels: ['Collected & Approved', 'Pending Verification'],
    datasets: [{
      backgroundColor: ['#10b981', '#f59e0b'],
      data: [approved, pending]
    }]
  }
})
</script>
