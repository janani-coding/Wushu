<template>
  <div :class="['animate-pulse bg-slate-800/60 rounded-2xl', customClass]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: 'w-full h-12'
  }
})
</script>
