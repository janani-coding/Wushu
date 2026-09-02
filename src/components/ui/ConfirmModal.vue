<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      @click.self="closeOnBackdrop && $emit('update:modelValue', false)"
    >
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-heading text-base font-bold text-slate-100">{{ title }}</h3>
          <button 
            @click="$emit('update:modelValue', false)" 
            class="text-slate-400 hover:text-slate-200 text-lg focus:outline-none"
          >
            &times;
          </button>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">{{ message }}</p>

        <div class="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button 
            type="button" 
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800"
          >
            {{ cancelText }}
          </button>
          <LoadingButton 
            type="button" 
            @click="$emit('confirm')"
            :loading="loading"
            :variant="variant"
            size="sm"
            :loading-text="loadingText"
          >
            {{ confirmText }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import LoadingButton from '@/components/ui/LoadingButton.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Processing...'
  },
  variant: {
    type: String,
    default: 'rose'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue', 'confirm'])
</script>
