<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-12">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">Academy System Settings</h1>
      <p class="text-xs text-slate-400">Configure branding, monthly fee defaults, due dates, payment categories, UPI QR code, and payment reminder schedules.</p>
    </div>

    <div class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
      <form @submit.prevent="saveSettings" class="space-y-6 text-xs">
        
        <!-- Academy Branding Section -->
        <div class="space-y-4">
          <h3 class="font-heading text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">1. Academy Branding</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Academy Name</label>
              <input v-model="form.academyName" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Tagline</label>
              <input v-model="form.tagline" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>
          </div>

          <div>
            <FileUpload 
              category="logo" 
              label="Academy Logo Image" 
              v-model="form.logoUrl" 
            />
          </div>
        </div>

        <!-- Payments & UPI Setup -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <h3 class="font-heading text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">2. Fee Structure & UPI Setup</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Default Monthly Fee (₹)</label>
              <input v-model.number="form.defaultMonthlyFee" type="number" required min="0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-400 font-bold" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Monthly Due Day (1-31)</label>
              <input v-model.number="form.dueDate" type="number" required min="1" max="31" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-bold" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Late Fee (₹)</label>
              <input v-model.number="form.lateFee" type="number" min="0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Academy UPI VPA ID</label>
              <input v-model="form.upiId" type="text" required placeholder="wushuassociation@upi" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono" />
            </div>

            <div>
              <FileUpload 
                category="settings" 
                label="UPI QR Code Image" 
                v-model="form.upiQrCodeUrl" 
              />
            </div>
          </div>
        </div>

        <!-- Payment Categories Manager -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <h3 class="font-heading text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">3. Configurable Payment Categories</h3>
          <p class="text-[11px] text-slate-400">Manage categories available for students when making payments:</p>

          <div class="flex flex-wrap gap-2">
            <div 
              v-for="cat in form.paymentCategories" 
              :key="cat"
              class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs text-slate-200"
            >
              <span class="font-medium">{{ cat }}</span>
              <button 
                v-if="cat !== 'Academy Monthly Fee'"
                type="button" 
                @click="removeCategory(cat)"
                class="text-rose-400 hover:text-rose-300 font-bold text-sm ml-1"
                title="Remove Category"
              >
                &times;
              </button>
            </div>
          </div>

          <div class="flex space-x-2 max-w-md">
            <input 
              v-model="newCategoryInput" 
              type="text" 
              placeholder="Add new category name (e.g. Workshop Fee)" 
              class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            />
            <button 
              type="button" 
              @click="addCategory" 
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl border border-slate-700"
            >
              + Add Category
            </button>
          </div>
        </div>

        <!-- Monthly Payment Reminder Schedule -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <h3 class="font-heading text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">4. Configurable Reminder Schedule</h3>
          <p class="text-[11px] text-slate-400">Select days of the month when automated payment reminder popups & push notifications trigger:</p>

          <div class="flex flex-wrap gap-3">
            <label 
              v-for="day in [1, 5, 10, 15, 20, 25]" 
              :key="day"
              class="flex items-center space-x-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer"
            >
              <input 
                type="checkbox" 
                :value="day"
                v-model="form.reminderSchedule"
                class="accent-amber-500 w-4 h-4 rounded"
              />
              <span class="text-xs font-bold text-slate-200">{{ day }}th of Month</span>
            </label>
          </div>
        </div>

        <!-- Submit -->
        <div class="pt-6 border-t border-slate-800 flex justify-end">
          <LoadingButton 
            type="submit"
            :loading="settingsStore.loading"
            variant="primary"
            size="lg"
            loading-text="Saving Settings..."
          >
            Save Academy Settings
          </LoadingButton>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useNotificationStore } from '@/stores/notification'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import { INITIAL_SETTINGS } from '@/data/initialData'

import { fileService } from '@/services/fileService'

const settingsStore = useSettingsStore()
const notificationStore = useNotificationStore()

const newCategoryInput = ref('')

const form = reactive({
  academyName: '',
  tagline: '',
  logoUrl: '',
  defaultMonthlyFee: 1500,
  dueDate: 5,
  lateFee: 100,
  upiId: '',
  upiQrCodeUrl: '',
  paymentCategories: [ ...INITIAL_SETTINGS.paymentCategories ],
  reminderSchedule: [1, 5, 10, 15]
})

onMounted(async () => {
  await settingsStore.fetchSettings()
  Object.assign(form, settingsStore.settings)
  if (!form.paymentCategories || !form.paymentCategories.length) {
    form.paymentCategories = [ ...INITIAL_SETTINGS.paymentCategories ]
  }
})

const addCategory = () => {
  const cat = newCategoryInput.value.trim()
  if (!cat) return
  if (!form.paymentCategories.includes(cat)) {
    form.paymentCategories.push(cat)
  }
  newCategoryInput.value = ''
}

const removeCategory = (catName) => {
  if (catName === 'Academy Monthly Fee') return
  form.paymentCategories = form.paymentCategories.filter(c => c !== catName)
}

const saveSettings = async () => {
  if (form.logoUrl && (form.logoUrl.startsWith('data:') || form.logoUrl.startsWith('blob:'))) {
    try {
      const uploadRes = await fileService.uploadFile(form.logoUrl, 'settings')
      if (uploadRes && uploadRes.fileUrl) form.logoUrl = uploadRes.fileUrl
    } catch (err) {
      console.warn('Logo upload fallback:', err)
    }
  }

  if (form.upiQrCodeUrl && (form.upiQrCodeUrl.startsWith('data:') || form.upiQrCodeUrl.startsWith('blob:'))) {
    try {
      const uploadRes = await fileService.uploadFile(form.upiQrCodeUrl, 'settings')
      if (uploadRes && uploadRes.fileUrl) form.upiQrCodeUrl = uploadRes.fileUrl
    } catch (err) {
      console.warn('QR code upload fallback:', err)
    }
  }

  await settingsStore.updateSettings(form)
  notificationStore.addToast(`Academy Settings stored in MongoDB GridFS & updated successfully!`, 'success')
}
</script>
