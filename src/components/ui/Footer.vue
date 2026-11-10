<template>
  <footer class="bg-slate-950 border-t border-slate-800 text-slate-400 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        
        <!-- Academy Brand Info -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-white p-0.5 border border-amber-500/40 flex items-center justify-center overflow-hidden shadow-glow-gold flex-shrink-0">
              <img :src="settingsStore.settings?.logoUrl || defaultLogo" alt="Villupuram District Wushu Association" class="w-full h-full object-contain" />
            </div>
            <div>
              <span class="font-heading text-base font-bold text-slate-100 tracking-wider block">
                VILLUPURAM WUSHU
              </span>
              <p class="text-[10px] uppercase font-bold tracking-widest text-amber-400">District Association</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Empowering students through traditional Shaolin Kung Fu, Modern Wushu, and combat fitness. Disciplined mind, invincible body.
          </p>
          <div class="flex space-x-3 pt-2">
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 transition-colors">
              <span class="text-xs font-bold">FB</span>
            </a>
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 transition-colors">
              <span class="text-xs font-bold">IG</span>
            </a>
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-amber-400 transition-colors">
              <span class="text-xs font-bold">YT</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Quick Navigation</h4>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/" class="hover:text-amber-400 transition-colors">Home</router-link></li>
            <li><router-link to="/about" class="hover:text-amber-400 transition-colors">About Academy</router-link></li>
            <li><router-link to="/coaches" class="hover:text-amber-400 transition-colors">Master Coaches</router-link></li>
            <li><router-link to="/gallery" class="hover:text-amber-400 transition-colors">Academy Gallery</router-link></li>
            <li><router-link to="/instructions" class="hover:text-amber-400 transition-colors">Academy Rules & Fees</router-link></li>
          </ul>
        </div>

        <!-- Portals -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Student & Admin Portals</h4>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/login/student" class="hover:text-amber-400 transition-colors">Student Login (Phone + DOB)</router-link></li>
            <li><router-link to="/login/admin" class="hover:text-amber-400 transition-colors">Admin Dashboard Login</router-link></li>
            <li><router-link to="/contact" class="hover:text-amber-400 transition-colors">Help & Query Desk</router-link></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Academy Contact</h4>
          <p class="text-xs text-slate-400 leading-relaxed mb-3">
            {{ settingsStore.settings.address }}
          </p>
          <p class="text-xs text-amber-400 font-semibold mb-1">
            Phone: {{ settingsStore.settings.contactPhone }}
          </p>
          <p class="text-xs text-slate-400">
            Email: {{ settingsStore.settings.contactEmail }}
          </p>
        </div>

      </div>

      <div class="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p>&copy; 2026 {{ settingsStore.settings.academyName }}. All rights reserved.</p>
        <p class="text-slate-400">Progressive Web Application • Mobile-First PWA Platform</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import defaultLogo from '@/assets/logo.png'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
