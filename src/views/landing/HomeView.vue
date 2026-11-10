<template>
  <div class="space-y-24 pb-24">
    
    <!-- Hero Banner -->
    <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-12">
      <!-- Background Overlay Images & Gradients -->
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1920" 
          alt="Kung Fu Hero" 
          class="w-full h-full object-cover opacity-25 scale-105 filter blur-sm"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40"></div>
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-1 border-2 border-amber-500/50 shadow-glow-gold flex items-center justify-center overflow-hidden animate-float">
            <img :src="settingsStore.settings?.logoUrl || defaultLogo" alt="Villupuram District Wushu Association" class="w-full h-full object-contain" />
          </div>
          <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <SparklesIcon class="w-4 h-4" />
            <span>Regd. No. 95/2013 • Villupuram District Wushu Association</span>
          </div>
        </div>

        <h1 class="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          MASTER THE ART OF <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 drop-shadow-lg">
            SHAOLIN KUNG FU & WUSHU
          </span>
        </h1>

        <p class="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
          Build physical invincibility, mental focus, and traditional combat mastery. Designed for warriors of all age groups and skill levels.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <router-link 
            to="/login/student"
            class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-glow-gold transition-all duration-300 transform hover:-translate-y-1"
          >
            Student Portal Login
          </router-link>
          <router-link 
            to="/about"
            class="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm uppercase tracking-wider rounded-2xl border border-slate-700 backdrop-blur-md transition-all duration-300"
          >
            Explore Academy
          </router-link>
        </div>

        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
          <div class="glass-card p-5 rounded-2xl text-center">
            <h3 class="text-3xl font-extrabold text-amber-400 font-heading">15+</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Years Legacy</p>
          </div>
          <div class="glass-card p-5 rounded-2xl text-center">
            <h3 class="text-3xl font-extrabold text-amber-400 font-heading">500+</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Trained Warriors</p>
          </div>
          <div class="glass-card p-5 rounded-2xl text-center">
            <h3 class="text-3xl font-extrabold text-amber-400 font-heading">45+</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Gold Medals</p>
          </div>
          <div class="glass-card p-5 rounded-2xl text-center">
            <h3 class="text-3xl font-extrabold text-amber-400 font-heading">100%</h3>
            <p class="text-xs text-slate-400 font-medium mt-1">Certified Masters</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Academy Introduction -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <div class="inline-flex items-center space-x-2 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <ShieldCheckIcon class="w-4 h-4" />
            <span>Legacy & Excellence</span>
          </div>
          <h2 class="font-heading text-3xl sm:text-4xl font-bold text-slate-100">
            Welcome to Villupuram District Wushu Association
          </h2>
          <p class="text-slate-300 text-base leading-relaxed">
            Founded with the vision of preserving authentic Chinese martial arts and promoting competitive Wushu athletic excellence, our academy offers comprehensive training in Taolu forms, Sanda kickboxing, self-defense, and weapons mastery.
          </p>
          <p class="text-slate-400 text-sm leading-relaxed">
            Our structured curriculum guides students from White Belt fundamentals all the way to Black Belt expertise, focusing on discipline, posture, mental fortitude, and competitive tournament readiness.
          </p>
          <div class="pt-2 flex items-center space-x-6">
            <div class="flex items-center space-x-3">
              <CheckCircleIcon class="w-6 h-6 text-amber-400 flex-shrink-0" />
              <span class="text-sm font-semibold text-slate-200">Certified Grandmasters</span>
            </div>
            <div class="flex items-center space-x-3">
              <CheckCircleIcon class="w-6 h-6 text-amber-400 flex-shrink-0" />
              <span class="text-sm font-semibold text-slate-200">National Champions</span>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -inset-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur-xl opacity-30"></div>
          <img 
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800" 
            alt="Academy Practice" 
            class="relative rounded-2xl border border-amber-500/30 shadow-2xl object-cover w-full h-[400px]"
          />
          <div class="absolute -bottom-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1.5 border-2 border-amber-500 shadow-2xl flex items-center justify-center overflow-hidden z-20">
            <img :src="settingsStore.settings?.logoUrl || defaultLogo" alt="Villupuram District Wushu Association Seal" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us & Benefits -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="font-heading text-3xl sm:text-4xl font-bold text-slate-100">
          Why Choose Villupuram Wushu Association
        </h2>
        <p class="text-slate-400 text-sm">
          Experience world-class martial arts training designed to sharpen your mind, body, and spirit.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="glass-card p-8 rounded-3xl space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FireIcon class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-100">Authentic Shaolin Lineage</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Train under certified masters who have studied directly in traditional Shaolin temples and national Wushu sports institutes.
          </p>
        </div>

        <div class="glass-card p-8 rounded-3xl space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrophyIcon class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-100">Tournament Excellence</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Our students consistently win gold, silver, and bronze trophies in district, state, and national Wushu championships.
          </p>
        </div>

        <div class="glass-card p-8 rounded-3xl space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserGroupIcon class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-100">Mobile-First PWA Platform</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Manage your student profile, UPI fee payments, belt exam applications, and tournament registrations directly from your phone.
          </p>
        </div>
      </div>
    </section>

    <!-- Training Programs -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="font-heading text-3xl sm:text-4xl font-bold text-slate-100">
          Our Training Programs
        </h2>
        <p class="text-slate-400 text-sm">
          Comprehensive courses customized for beginners, intermediate martial artists, and elite combat athletes.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="glass-card rounded-3xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" 
            alt="Shaolin Form"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="p-6 space-y-3">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Traditional Form</span>
            <h3 class="text-xl font-bold text-slate-100">Shaolin Kung Fu Taolu</h3>
            <p class="text-slate-400 text-sm">
              Master barehand forms, animal styles (Tiger, Crane, Dragon), flexibility, jump kicks, and traditional acrobatics.
            </p>
          </div>
        </div>

        <div class="glass-card rounded-3xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600" 
            alt="Sanda Combat"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="p-6 space-y-3">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Full Contact</span>
            <h3 class="text-xl font-bold text-slate-100">Sanda Kickboxing & Sparring</h3>
            <p class="text-slate-400 text-sm">
              Chinese full-contact combat combining punch strikes, kicks, takedowns, sweeps, and ring tactics.
            </p>
          </div>
        </div>

        <div class="glass-card rounded-3xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600" 
            alt="Weapons Training"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="p-6 space-y-3">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">18 Weapons</span>
            <h3 class="text-xl font-bold text-slate-100">Traditional Weapons Mastery</h3>
            <p class="text-slate-400 text-sm">
              Learn Staff (Gun), Broadsword (Dao), Straight Sword (Jian), Spear (Qiang), and Nunchaku techniques.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/40 p-8 sm:p-12 text-center space-y-6">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"></div>
        <h2 class="font-heading text-3xl sm:text-5xl font-extrabold text-slate-100 relative z-10">
          BEGIN YOUR WARRIOR JOURNEY TODAY
        </h2>
        <p class="max-w-xl mx-auto text-slate-300 text-sm sm:text-base relative z-10">
          Admissions are now open for Morning and Evening batches. Contact our masters or log in to your student portal.
        </p>
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <router-link 
            to="/login/student" 
            class="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-glow-gold hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Student Login
          </router-link>
          <router-link 
            to="/contact" 
            class="px-8 py-3.5 bg-slate-900 text-slate-200 font-bold text-sm uppercase tracking-wider rounded-xl border border-slate-700 hover:bg-slate-800 transition-all"
          >
            Contact Academy
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import defaultLogo from '@/assets/logo.png'
import { useSettingsStore } from '@/stores/settings'
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  FireIcon, 
  TrophyIcon, 
  UserGroupIcon 
} from '@heroicons/vue/24/solid'

const settingsStore = useSettingsStore()
</script>
