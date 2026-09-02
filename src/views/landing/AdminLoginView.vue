<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/40 shadow-2xl space-y-8 relative overflow-hidden text-center">
      <!-- Glow Accent -->
      <div class="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div class="space-y-2">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <SparklesIcon class="w-9 h-9" />
        </div>
        <h2 class="font-heading text-2xl font-extrabold text-slate-100 tracking-wider">ADMINISTRATOR PORTAL</h2>
        <p class="text-xs text-slate-400">Authorized Master & Coaching Personnel Portal</p>
      </div>

      <!-- Access Denied / Auth Error Alert -->
      <div 
        v-if="authStore.authError"
        class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2 text-left"
      >
        <ShieldExclamationIcon class="w-6 h-6 flex-shrink-0 text-rose-400" />
        <span>{{ authStore.authError }}</span>
      </div>

      <!-- Google Sign In Action -->
      <div class="space-y-4">
        <button 
          @click="handleGoogleSignIn"
          :disabled="authStore.loading"
          class="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-2xl text-slate-100 font-bold text-sm flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg group cursor-pointer disabled:opacity-50"
        >
          <svg v-if="!authStore.loading" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          <span v-if="!authStore.loading" class="group-hover:text-amber-400 transition-colors">Continue with Google</span>
          <span v-else class="text-amber-400 animate-pulse">Authenticating with Google...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { SparklesIcon, ShieldExclamationIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const handleGoogleSignIn = async () => {
  const success = await authStore.loginAdminGoogle()
  if (success) {
    notificationStore.addToast(`Admin Authorized. Welcome, ${authStore.currentUserProfile.name}`, 'success')
    const target = route.query.redirect || '/admin/dashboard'
    router.push(target)
  }
}
</script>
