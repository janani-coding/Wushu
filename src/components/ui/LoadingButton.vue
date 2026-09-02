<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
    @click="handleClick"
    :class="[
      'inline-flex items-center justify-center font-extrabold transition-all duration-200 focus:outline-none select-none',
      block ? 'w-full' : '',
      sizeClasses[size] || sizeClasses.md,
      variantClasses[variant] || variantClasses.primary,
      (disabled || loading) ? 'cursor-not-allowed opacity-70 shadow-none pointer-events-none' : 'active:scale-95'
    ]"
  >
    <!-- Spinner SVG when loading -->
    <svg
      v-if="loading"
      class="animate-spin text-current"
      :class="[
        spinnerSizeClasses[size] || spinnerSizeClasses.md,
        $slots.default || loadingText ? 'mr-2' : ''
      ]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Leading Icon when not loading -->
    <component 
      v-else-if="icon" 
      :is="icon" 
      class="mr-2"
      :class="iconSizeClasses[size] || iconSizeClasses.md"
    />

    <!-- Slot or Text -->
    <span class="truncate">
      <template v-if="loading">
        {{ loadingText || defaultLoadingText }}
      </template>
      <template v-else>
        <slot />
      </template>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'emerald' | 'rose' | 'amber' | 'secondary' | 'outline' | 'ghost'
  },
  size: {
    type: String,
    default: 'md' // 'xs' | 'sm' | 'md' | 'lg'
  },
  loadingText: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  if (props.disabled || props.loading) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  emit('click', e)
}

const defaultLoadingText = computed(() => 'Processing...')

const sizeClasses = {
  xs: 'px-2.5 py-1 text-[11px] rounded-lg',
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-xs uppercase tracking-wider rounded-xl',
  lg: 'px-6 py-3.5 text-sm uppercase tracking-wider rounded-xl'
}

const spinnerSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow-gold',
  emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-green',
  rose: 'bg-rose-600 hover:bg-rose-500 text-slate-100 shadow-md',
  amber: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
  outline: 'bg-transparent border border-slate-700 hover:border-amber-500 hover:text-amber-400 text-slate-200',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300'
}
</script>
