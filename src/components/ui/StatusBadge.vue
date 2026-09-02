<template>
  <span 
    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
    :class="getStatusClasses(status)"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getDotClasses(status)"></span>
    {{ status }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
})

const getStatusClasses = (statusStr) => {
  switch (statusStr) {
    case 'Active':
    case 'Approved':
    case 'Paid':
    case 'Resolved':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
    case 'Pending Approval':
    case 'Pending':
    case 'Open':
    case 'Upcoming':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
    case 'Inactive':
    case 'Rejected':
    case 'Cancelled':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700'
  }
}

const getDotClasses = (statusStr) => {
  switch (statusStr) {
    case 'Active':
    case 'Approved':
    case 'Paid':
    case 'Resolved':
      return 'bg-emerald-400'
    case 'Pending Approval':
    case 'Pending':
    case 'Open':
    case 'Upcoming':
      return 'bg-amber-400 animate-ping'
    case 'Inactive':
    case 'Rejected':
    case 'Cancelled':
      return 'bg-rose-400'
    default:
      return 'bg-slate-400'
  }
}
</script>
