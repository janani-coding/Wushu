<template>
  <div>
    <!-- Offline Indicator -->
    <div 
      v-if="isOffline"
      class="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold text-center fixed top-0 left-0 right-0 z-50 flex items-center justify-center space-x-2 shadow-lg"
    >
      <WifiIcon class="w-4 h-4" />
      <span>Offline Mode Active. Cached academy data is being used.</span>
    </div>

    <!-- PWA Install Banner -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div 
        v-if="showInstallPrompt"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 max-w-md bg-slate-900/95 border border-amber-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between space-x-4"
      >
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-white border border-amber-500/40 rounded-full p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-glow-gold">
            <img :src="defaultLogo" alt="Villupuram Wushu Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-100">Install Villupuram Wushu App</h4>
            <p class="text-xs text-slate-400">Install as native PWA app for instant offline access & push notifications.</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button 
            @click="installPwa"
            class="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 shadow-glow-gold transition-all"
          >
            Install
          </button>
          <button 
            @click="dismissPrompt"
            class="p-1.5 text-slate-400 hover:text-slate-200"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import defaultLogo from '@/assets/logo.png'
import { WifiIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const isOffline = ref(!navigator.onLine)
const showInstallPrompt = ref(false)
let deferredPrompt = null

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

const installPwa = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
    }
    deferredPrompt = null
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
}
</script>
