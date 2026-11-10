<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <div class="w-24 h-24 mx-auto rounded-full bg-white p-1 border-2 border-amber-500/50 shadow-glow-gold flex items-center justify-center overflow-hidden">
        <img :src="settingsStore.settings?.logoUrl || defaultLogo" alt="Villupuram District Wushu Association" class="w-full h-full object-contain" />
      </div>
      <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Official Association Guidelines • Regd. No. 95/2013</span>
      <h1 class="font-heading text-4xl font-extrabold text-slate-100">Instructions & Academy Rules</h1>
      <p class="text-slate-400 text-sm">
        All students, parents, and administrative members are expected to adhere strictly to academy rules.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Dojo Rules -->
      <div class="glass-card p-8 rounded-3xl space-y-4">
        <div class="flex items-center space-x-3 text-amber-400">
          <ShieldCheckIcon class="w-6 h-6" />
          <h3 class="font-heading text-xl font-bold text-slate-100">1. Dojo Code of Conduct</h3>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>Bow respectfully upon entering and leaving the training hall (Dojo/Kuan).</li>
          <li>Address all coaches and senior belt ranks as "Master" or "Coach".</li>
          <li>Maintain strict punctuality for morning and evening batches.</li>
          <li>Keep fingernails and toenails trimmed short for sparring safety.</li>
          <li>Jewelry, rings, and watches must be removed before entering the carpet.</li>
        </ul>
      </div>

      <!-- Uniform & Gear -->
      <div class="glass-card p-8 rounded-3xl space-y-4">
        <div class="flex items-center space-x-3 text-amber-400">
          <SparklesIcon class="w-6 h-6" />
          <h3 class="font-heading text-xl font-bold text-slate-100">2. Uniform & Belt Standards</h3>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>Official Dragon Academy Wushu uniform (Yifu) must be worn during practice.</li>
          <li>Belts must be tied neatly around the waist.</li>
          <li>Students taking part in Sanda sparring must bring personal mouthguards and shin guards.</li>
          <li>Weapon practice is only permitted under direct master supervision.</li>
        </ul>
      </div>

      <!-- Monthly Fee Policy -->
      <div class="glass-card p-8 rounded-3xl space-y-4">
        <div class="flex items-center space-x-3 text-amber-400">
          <CreditCardIcon class="w-6 h-6" />
          <h3 class="font-heading text-xl font-bold text-slate-100">3. Fee Payment Policy</h3>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>Monthly fees must be paid on or before the 10th of every month.</li>
          <li>Payments must be submitted via UPI QR code in the Student Portal with valid UTR Transaction ID.</li>
          <li>Automated push notifications and popup reminders will prompt unpaid accounts on 1st, 5th, 10th, and 15th.</li>
          <li>Fees once paid are non-refundable and non-transferable.</li>
        </ul>
      </div>

      <!-- Belt Grading & Examinations -->
      <div class="glass-card p-8 rounded-3xl space-y-4">
        <div class="flex items-center space-x-3 text-amber-400">
          <TrophyIcon class="w-6 h-6" />
          <h3 class="font-heading text-xl font-bold text-slate-100">4. Belt Grading Examinations</h3>
        </div>
        <ul class="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>Belt examinations are conducted quarterly for White to Black Belt progressions.</li>
          <li>Eligibility is based on 80%+ attendance and master recommendation.</li>
          <li>Students must demonstrate forms, stances, sparring, and oral code answers.</li>
          <li>Official certification will be issued upon passing.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import defaultLogo from '@/assets/logo.png'
import { useSettingsStore } from '@/stores/settings'
import { ShieldCheckIcon, SparklesIcon, CreditCardIcon, TrophyIcon } from '@heroicons/vue/24/solid'

const settingsStore = useSettingsStore()
</script>
