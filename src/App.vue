<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useThemeStore } from '@/stores/theme'

const settingsStore = useSettingsStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
  settingsStore.fetchSettings()
})
</script>
