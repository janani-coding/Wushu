<template>
  <div 
    class="relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-amber-500/30 select-none"
    :class="[sizeClasses[size] || sizeClasses.md, photoUrl ? '' : gradientClass]"
  >
    <img 
      v-if="photoUrl" 
      :src="photoUrl" 
      :alt="name"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <span v-else class="font-extrabold text-amber-300 font-heading" :class="textSizeClasses[size] || textSizeClasses.md">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: 'Student'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg' | 'xl'
  }
})

const imageFailed = ref(false)

const handleImageError = () => {
  imageFailed.value = true
}

const initials = computed(() => {
  if (!props.name) return 'S'
  const parts = props.name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
})

const gradientClass = computed(() => {
  const gradients = [
    'bg-gradient-to-tr from-amber-600 to-amber-400',
    'bg-gradient-to-tr from-emerald-600 to-emerald-400',
    'bg-gradient-to-tr from-blue-600 to-cyan-400',
    'bg-gradient-to-tr from-purple-600 to-amber-400',
    'bg-gradient-to-tr from-rose-600 to-amber-400'
  ]
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
})

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl'
}
</script>
