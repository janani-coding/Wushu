<template>
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
    <PwaInstallPrompt />
    <Navbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
    <ToastContainer />
  </div>
</template>

<script setup>
import Navbar from '@/components/ui/Navbar.vue'
import Footer from '@/components/ui/Footer.vue'
import PwaInstallPrompt from '@/components/ui/PwaInstallPrompt.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useGalleryStore } from '@/stores/gallery'
import { useTournamentStore } from '@/stores/tournament'
import { useAchievementStore } from '@/stores/achievement'

const settingsStore = useSettingsStore()
const galleryStore = useGalleryStore()
const tournamentStore = useTournamentStore()
const achievementStore = useAchievementStore()

onMounted(() => {
  settingsStore.initAutoSync()
  galleryStore.initAutoSync()
  tournamentStore.initAutoSync()
  achievementStore.initAutoSync()

  settingsStore.fetchSettings()
  galleryStore.fetchGallery()
  tournamentStore.fetchTournaments()
  achievementStore.fetchAchievements()
})

onUnmounted(() => {
  settingsStore.unsubscribeAutoSync()
  galleryStore.unsubscribeAutoSync()
  tournamentStore.unsubscribeAutoSync()
  achievementStore.unsubscribeAutoSync()
})
</script>
