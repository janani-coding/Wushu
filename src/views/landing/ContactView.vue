<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Get In Touch</span>
      <h1 class="font-heading text-4xl font-extrabold text-slate-100">Contact Dragon Academy</h1>
      <p class="text-slate-400 text-sm">
        Have questions regarding admissions, batch timings, belt exams, or tournament participation? Contact us today.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Contact Info Card -->
      <div class="glass-card p-8 rounded-3xl space-y-8">
        <h3 class="text-2xl font-bold text-slate-100 font-heading">Academy Location & Hours</h3>

        <div class="space-y-6 text-sm">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <MapPinIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-slate-200">Address</h4>
              <p class="text-slate-400 text-xs mt-1 leading-relaxed">{{ settingsStore.settings.address }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <PhoneIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-slate-200">Phone</h4>
              <p class="text-slate-400 text-xs mt-1">{{ settingsStore.settings.contactPhone }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <EnvelopeIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-slate-200">Email</h4>
              <p class="text-slate-400 text-xs mt-1">{{ settingsStore.settings.contactEmail }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ClockIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-slate-200">Batch Hours</h4>
              <p class="text-slate-400 text-xs mt-1">Morning: 6:00 AM - 7:30 AM (Mon - Sat)</p>
              <p class="text-slate-400 text-xs">Evening: 5:30 PM - 7:00 PM (Mon - Sat)</p>
              <p class="text-slate-400 text-xs">Weekend: 8:00 AM - 10:00 AM (Sun)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Message Form -->
      <div class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 class="text-2xl font-bold text-slate-100 font-heading">Send Us a Direct Message</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-300 mb-1">Your Full Name</label>
            <input 
              v-model="form.name"
              type="text" 
              required 
              placeholder="e.g. Rahul Sharma"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-1">Phone Number</label>
              <input 
                v-model="form.phone"
                type="tel" 
                required 
                placeholder="9876543210"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-1">Inquiry Type</label>
              <select 
                v-model="form.type"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option>New Admission</option>
                <option>Batch Timings</option>
                <option>Tournament Inquiry</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-300 mb-1">Message</label>
            <textarea 
              v-model="form.message"
              rows="4" 
              required
              placeholder="How can our masters assist you?"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
          >
            Send Inquiry
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useNotificationStore } from '@/stores/notification'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/vue/24/solid'

const settingsStore = useSettingsStore()
const notificationStore = useNotificationStore()

const form = reactive({
  name: '',
  phone: '',
  type: 'New Admission',
  message: ''
})

const handleSubmit = () => {
  notificationStore.addToast(`Inquiry sent! Our admin team will contact you shortly.`, 'success')
  form.name = ''
  form.phone = ''
  form.message = ''
}
</script>
