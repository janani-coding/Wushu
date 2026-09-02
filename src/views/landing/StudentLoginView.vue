<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-8 relative overflow-hidden">
      <!-- Glow Accent -->
      <div class="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <UserIcon class="w-8 h-8" />
        </div>
        <h2 class="font-heading text-2xl font-extrabold text-slate-100 tracking-wider">STUDENT LOGIN</h2>
        <p class="text-xs text-slate-400">Enter your Phone Number & Date of Birth to access your student portal</p>
      </div>

      <!-- Auth Error Alert -->
      <div 
        v-if="authStore.authError"
        class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2"
      >
        <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 text-rose-400" />
        <span>{{ authStore.authError }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
          <div class="relative">
            <input 
              v-model="phone"
              type="tel"
              required
              placeholder="e.g. 9876543210"
              class="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Date of Birth</label>
          <input 
            v-model="dob"
            type="date"
            required
            class="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none transition-colors"
          />
        </div>

        <button 
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-glow-gold transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <span v-if="authStore.loading" class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span v-else>Login to Student Portal</span>
        </button>
      </form>

      <!-- Demo Account Quick Helpers for Reviewer -->
      <div class="pt-4 border-t border-slate-800 text-center space-y-2">
        <p class="text-[11px] text-slate-500 uppercase font-bold">Quick Demo Accounts:</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button 
            type="button"
            @click="fillDemo('9876543210', '2002-05-15')"
            class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-amber-400 font-mono"
          >
            Arun (Black Belt)
          </button>
          <button 
            type="button"
            @click="fillDemo('9876543211', '2004-09-22')"
            class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-amber-400 font-mono"
          >
            Priya (Green Belt)
          </button>
          <button 
            type="button"
            @click="fillDemo('9360780904', '2006-09-04')"
            class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-amber-400 font-mono"
          >
            Karthik (9360780904)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { UserIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const phone = ref('')
const dob = ref('')

const handleLogin = async () => {
  const success = await authStore.loginStudent(phone.value, dob.value)
  if (success) {
    notificationStore.addToast(`Welcome back, ${authStore.currentUserProfile.fullName}!`, 'success')
    const target = route.query.redirect || '/student/dashboard'
    router.push(target)
  }
}

const fillDemo = (p, d) => {
  phone.value = p
  dob.value = d
}
</script>
