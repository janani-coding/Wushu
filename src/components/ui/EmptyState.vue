<template>
  <div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-6">
    <div class="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
      <component :is="iconComponent || defaultIcon" class="w-8 h-8" />
    </div>

    <div class="space-y-1">
      <h3 class="font-heading text-base font-bold text-slate-100">{{ title }}</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{{ description }}</p>
    </div>

    <div v-if="actionLabel" class="pt-2">
      <button 
        @click="$emit('action')"
        class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-glow-gold hover:from-amber-400 hover:to-amber-500 transition-all"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InboxIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    default: 'No Records Found'
  },
  description: {
    type: String,
    default: 'There are no entries available right now.'
  },
  actionLabel: {
    type: String,
    default: ''
  },
  iconComponent: {
    type: [Object, Function],
    default: null
  }
})

defineEmits(['action'])

const defaultIcon = computed(() => InboxIcon)
</script>
