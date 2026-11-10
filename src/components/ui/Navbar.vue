<template>
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <!-- Brand Logo & Title -->
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-glow-gold transition-transform group-hover:scale-105 flex-shrink-0">
            <div class="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden p-0.5">
              <img :src="settingsStore.settings?.logoUrl || defaultLogo" alt="Villupuram District Wushu Association Logo" class="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <span class="font-heading text-base sm:text-lg font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              VILLUPURAM WUSHU
            </span>
            <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">District Association</p>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path"
            class="text-sm font-semibold tracking-wide text-slate-300 hover:text-amber-400 transition-colors py-1 relative"
            active-class="text-amber-400 font-bold"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Auth CTAs & Mobile Toggle -->
        <div class="flex items-center space-x-3">
          
          <!-- Theme Toggle Button -->
          <button 
            @click="themeStore.toggleTheme()" 
            class="p-2.5 rounded-xl text-amber-400 bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors"
            :title="themeStore.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <SunIcon v-if="themeStore.mode === 'dark'" class="w-5 h-5 text-amber-400" />
            <MoonIcon v-else class="w-5 h-5 text-slate-700" />
          </button>

          <!-- Portal Auth Buttons -->
          <div class="hidden sm:flex items-center space-x-2">
            <router-link 
              to="/login/student"
              class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all shadow-sm"
            >
              Student Portal
            </router-link>
            <router-link 
              to="/login/admin"
              class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 rounded-xl shadow-glow-gold transition-all"
            >
              Admin Portal
            </router-link>
          </div>

          <!-- Mobile Menu Drawer Toggle -->
          <button 
            @click="isMobileOpen = !isMobileOpen"
            class="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-amber-400 bg-slate-900 border border-slate-800 focus:outline-none"
          >
            <Bars3Icon v-if="!isMobileOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>

        </div>
      </div>
    </div>

    <!-- Mobile Drawer Overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMobileOpen" class="md:hidden bg-slate-950/95 border-b border-amber-500/20 px-6 py-6 space-y-4 backdrop-blur-xl">
        <div class="flex flex-col space-y-3">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            @click="isMobileOpen = false"
            class="text-base font-medium text-slate-300 hover:text-amber-400 py-2 border-b border-slate-900"
          >
            {{ item.name }}
          </router-link>
        </div>

        <div class="pt-4 flex flex-col space-y-3">
          <router-link 
            to="/login/student"
            @click="isMobileOpen = false"
            class="w-full text-center py-3 text-sm font-bold text-slate-100 bg-slate-800 rounded-xl border border-slate-700"
          >
            Student Login
          </router-link>
          <router-link 
            to="/login/admin"
            @click="isMobileOpen = false"
            class="w-full text-center py-3 text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-glow-gold"
          >
            Admin Login
          </router-link>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import defaultLogo from '@/assets/logo.png'
import { useSettingsStore } from '@/stores/settings'
import { useThemeStore } from '@/stores/theme'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/solid'

const settingsStore = useSettingsStore()
const themeStore = useThemeStore()
const isMobileOpen = ref(false)

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Coaches', path: '/coaches' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
  { name: 'Instructions', path: '/instructions' }
]
</script>
