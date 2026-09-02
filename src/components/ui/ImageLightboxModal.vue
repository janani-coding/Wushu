<template>
  <Transition
    enter-active-class="ease-out duration-300 transition"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200 transition"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      @click.self="close"
    >
      <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
        <!-- Close Button -->
        <button 
          @click="close"
          class="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-slate-800/80 rounded-full transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>

        <!-- Image preview -->
        <img 
          :src="imageUrl" 
          :alt="title"
          class="max-w-full max-h-[75vh] object-contain rounded-2xl border border-amber-500/30 shadow-2xl"
        />

        <!-- Title & Subtitle -->
        <div v-if="title" class="mt-4 text-center">
          <h3 class="text-lg font-bold text-amber-400">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-slate-300 mt-1">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/solid'

defineProps({
  isOpen: Boolean,
  imageUrl: String,
  title: String,
  subtitle: String
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>
