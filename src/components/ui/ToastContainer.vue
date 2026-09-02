<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
    <TransitionGroup 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-glass border backdrop-blur-md"
        :class="getToastClasses(toast.type)"
      >
        <div class="flex items-center space-x-3">
          <component :is="getToastIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
        <button 
          @click="toastStore.removeToast(toast.id)"
          class="ml-3 text-slate-400 hover:text-white transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/solid'

const toastStore = useNotificationStore()

const getToastClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-900/30'
    case 'error':
      return 'bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-900/30'
    case 'warning':
      return 'bg-amber-950/90 text-amber-100 border-amber-500/40 shadow-amber-900/30'
    default:
      return 'bg-slate-900/90 text-slate-100 border-amber-500/30 shadow-black/50'
  }
}

const getToastIcon = (type) => {
  switch (type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    default: return InformationCircleIcon
  }
}
</script>
