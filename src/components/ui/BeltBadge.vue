<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
    :class="getBeltClass(belt)"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getDotClass(belt)"></span>
    {{ belt }} Belt
  </span>
</template>

<script setup>
const props = defineProps({
  belt: {
    type: String,
    default: 'White'
  }
})

const getBeltClass = (beltName) => {
  switch (beltName) {
    case 'White': return 'bg-slate-100 text-slate-900 border border-slate-300'
    case 'Yellow': return 'bg-amber-400 text-amber-950 border border-amber-500'
    case 'Orange': return 'bg-orange-500 text-white border border-orange-600'
    case 'Green': return 'bg-emerald-600 text-white border border-emerald-700'
    case 'Blue': return 'bg-blue-600 text-white border border-blue-700'
    case 'Purple': return 'bg-purple-600 text-white border border-purple-700'
    case 'Brown': return 'bg-amber-900 text-amber-100 border border-amber-950'
    case 'Black': return 'bg-slate-950 text-amber-400 border border-amber-500/50 shadow-glow-gold'
    default: return 'bg-slate-800 text-slate-300 border border-slate-700'
  }
}

const getDotClass = (beltName) => {
  switch (beltName) {
    case 'White': return 'bg-slate-400'
    case 'Yellow': return 'bg-amber-950'
    case 'Orange': return 'bg-white'
    case 'Green': return 'bg-emerald-200'
    case 'Blue': return 'bg-blue-200'
    case 'Purple': return 'bg-purple-200'
    case 'Brown': return 'bg-amber-200'
    case 'Black': return 'bg-amber-400 animate-pulse'
    default: return 'bg-slate-400'
  }
}
</script>
