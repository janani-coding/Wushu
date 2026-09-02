<template>
  <div class="max-w-3xl mx-auto space-y-8 pb-28 sm:pb-12">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">My Warrior Profile</h1>
      <p class="text-xs text-slate-400">View your martial arts credentials and update contact details.</p>
    </div>

    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
      
      <!-- Read-Only Belt & Header -->
      <div class="flex items-center space-x-6 border-b border-slate-800 pb-6">
        <AvatarInitials 
          :name="studentProfile?.fullName || 'Student'"
          :photoUrl="studentProfile?.profilePhoto"
          size="xl"
        />
        <div>
          <h2 class="font-heading text-xl font-bold text-slate-100">{{ studentProfile?.fullName }}</h2>
          <p class="text-xs font-mono text-slate-400">ID: {{ studentProfile?.id }}</p>
          <div class="mt-2 flex items-center space-x-3">
            <BeltBadge :belt="studentProfile?.currentBelt || 'White'" />
            <span class="text-xs font-bold text-amber-400">Fee: ₹{{ studentProfile?.monthlyFee }}/mo</span>
          </div>
        </div>
      </div>

      <form @submit.prevent="saveProfile" class="space-y-6 text-xs">
        
        <!-- Editable Fields Section -->
        <div class="space-y-4">
          <h3 class="font-heading text-xs font-bold text-amber-400 uppercase tracking-wider">Editable Contact Details</h3>
          
          <div>
            <label class="block font-bold uppercase text-slate-300 mb-1">Residential Address</label>
            <input 
              v-model="form.address"
              type="text" 
              required 
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-300 mb-1">Emergency Contact Number & Relation</label>
            <input 
              v-model="form.emergencyContact"
              type="text" 
              required 
              placeholder="e.g. +91 98765 00000 (Father)"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <FileUpload 
              category="profile" 
              label="Upload Profile Photo" 
              v-model="form.profilePhoto" 
            />
          </div>
        </div>

        <!-- Restricted Read-Only Fields Section -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <h3 class="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <LockClosedIcon class="w-4 h-4 text-amber-400" />
            <span>Restricted Academy Fields (Admin Verified)</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Phone Number (Login Key)</span>
              <span class="text-slate-300 font-mono font-bold">{{ studentProfile?.phoneNumber }}</span>
            </div>

            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Date of Birth (Login Key)</span>
              <span class="text-slate-300 font-bold">{{ studentProfile?.dob }}</span>
            </div>

            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Current Belt Rank</span>
              <span class="text-slate-300 font-bold">{{ studentProfile?.currentBelt }}</span>
            </div>

            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Batch</span>
              <span class="text-slate-300 font-bold">{{ studentProfile?.batch }}</span>
            </div>

            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Joining Date</span>
              <span class="text-slate-300 font-bold">{{ studentProfile?.joiningDate }}</span>
            </div>

            <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Monthly Fee</span>
              <span class="text-amber-400 font-bold">₹{{ studentProfile?.monthlyFee }}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <LoadingButton 
            type="submit"
            :loading="studentStore.loading"
            variant="primary"
            size="md"
            loading-text="Saving Changes..."
          >
            Update Profile
          </LoadingButton>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useNotificationStore } from '@/stores/notification'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import { LockClosedIcon } from '@heroicons/vue/24/solid'

import { fileService } from '@/services/fileService'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const notificationStore = useNotificationStore()

const studentProfile = computed(() => authStore.currentUserProfile)

const form = reactive({
  address: '',
  emergencyContact: '',
  profilePhoto: ''
})

const populateForm = () => {
  if (studentProfile.value) {
    form.address = studentProfile.value.address || ''
    form.emergencyContact = studentProfile.value.emergencyContact || ''
    form.profilePhoto = studentProfile.value.profilePhoto || ''
  }
}

onMounted(() => {
  populateForm()
})

watch(studentProfile, () => {
  populateForm()
}, { deep: true })

const saveProfile = async () => {
  if (!studentProfile.value) return
  
  let finalPhotoUrl = form.profilePhoto
  if (form.profilePhoto && (form.profilePhoto.startsWith('data:') || form.profilePhoto.startsWith('blob:'))) {
    try {
      const uploadRes = await fileService.uploadFile(form.profilePhoto, 'profile')
      if (uploadRes && uploadRes.fileUrl) {
        finalPhotoUrl = uploadRes.fileUrl
      }
    } catch (err) {
      console.warn('Profile photo upload fallback to URL:', err)
    }
  }

  await studentStore.updateStudent(studentProfile.value.id, {
    address: form.address,
    emergencyContact: form.emergencyContact,
    profilePhoto: finalPhotoUrl
  })

  authStore.updateCurrentStudentProfile({
    address: form.address,
    emergencyContact: form.emergencyContact,
    profilePhoto: finalPhotoUrl
  })

  notificationStore.addToast(`Profile updated successfully! Stored in MongoDB GridFS.`, 'success')
}
</script>
