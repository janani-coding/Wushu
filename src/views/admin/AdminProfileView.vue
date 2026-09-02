<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="font-heading text-2xl font-extrabold text-slate-100">Administrator Profile & Management</h1>
      <p class="text-xs text-slate-400">Manage your credentials and grant system access to additional administrators.</p>
    </div>

    <!-- Active Profile Card -->
    <div class="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-6">
      <div class="flex items-center space-x-6">
        <div class="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 text-2xl font-black">
          {{ authStore.currentUserProfile?.name?.charAt(0) || 'A' }}
        </div>
        <div class="space-y-1">
          <h2 class="font-heading text-2xl font-bold text-slate-100">{{ authStore.currentUserProfile?.name }}</h2>
          <span class="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
            {{ authStore.currentUserProfile?.role }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800">
        <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span class="text-slate-500 font-bold uppercase text-[10px] block">Authorized Google Email</span>
          <span class="text-slate-100 font-mono font-bold">{{ authStore.currentUserProfile?.email }}</span>
        </div>

        <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span class="text-slate-500 font-bold uppercase text-[10px] block">System Role</span>
          <span class="text-slate-100 font-bold">{{ authStore.currentUserProfile?.role }}</span>
        </div>

        <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span class="text-slate-500 font-bold uppercase text-[10px] block">Account Status</span>
          <span class="text-emerald-400 font-bold">Active & Verified</span>
        </div>

        <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span class="text-slate-500 font-bold uppercase text-[10px] block">Last Login</span>
          <span class="text-slate-300 font-mono">{{ new Date(authStore.currentUserProfile?.lastLogin || Date.now()).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Authorized Admins Management Panel -->
    <div class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-heading text-lg font-bold text-slate-100">Authorized System Admins</h3>
          <p class="text-xs text-slate-400">Google accounts authorized to sign in to this portal.</p>
        </div>
        <button 
          @click="showAddModal = true"
          class="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <UserPlusIcon class="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      <!-- Admin List Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <th class="py-3 px-4">Admin Name</th>
              <th class="py-3 px-4">Google Email</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50">
            <tr v-for="admin in admins" :key="admin.id" class="hover:bg-slate-900/50">
              <td class="py-3 px-4 font-bold text-slate-200">{{ admin.name }}</td>
              <td class="py-3 px-4 text-slate-300 font-mono">{{ admin.email }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {{ admin.role || 'Admin' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button 
                  v-if="admin.email !== authStore.currentUserProfile?.email"
                  @click="removeAdmin(admin)"
                  class="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Revoke Admin Access"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
                <span v-else class="text-[10px] text-slate-500 italic">Current Session</span>
              </td>
            </tr>
            <tr v-if="admins.length === 0">
              <td colspan="4" class="py-6 text-center text-slate-500 italic">
                No extra admins configured. Only chief master account active.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal to Add New Admin -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="max-w-md w-full glass-panel p-6 rounded-3xl border border-amber-500/40 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="font-heading text-lg font-bold text-slate-100">Authorize New Admin</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <form @submit.prevent="handleAddAdmin" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase text-slate-300 mb-1">Google Email Address *</label>
            <input 
              v-model="newAdminForm.email" 
              type="email" 
              required 
              placeholder="e.g. coach.smith@gmail.com"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-amber-500" 
            />
            <p class="text-[10px] text-slate-400 mt-1">Must be the exact Gmail address they will use for "Continue with Google".</p>
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-300 mb-1">Admin Full Name *</label>
            <input 
              v-model="newAdminForm.name" 
              type="text" 
              required 
              placeholder="e.g. Coach Ramesh"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-amber-500" 
            />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-300 mb-1">Role / Designation</label>
            <input 
              v-model="newAdminForm.role" 
              type="text" 
              placeholder="e.g. Senior Coach / Assistant Admin"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-amber-500" 
            />
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button 
              type="button" 
              @click="showAddModal = false"
              class="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <LoadingButton 
              type="submit" 
              :loading="isSubmitting"
              variant="primary"
              size="sm"
              loading-text="Authorizing..."
            >
              Authorize Admin
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { dbService } from '@/services/dbService'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { UserPlusIcon, TrashIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const admins = ref([])
const showAddModal = ref(false)
const isSubmitting = ref(false)
const newAdminForm = ref({
  email: '',
  name: '',
  role: 'Admin'
})

const loadAdmins = async () => {
  admins.value = await dbService.getAdmins()
}

const handleAddAdmin = async () => {
  if (!newAdminForm.value.email) return
  isSubmitting.value = true
  try {
    const created = await dbService.addAdmin(newAdminForm.value)
    if (created) {
      admins.value.unshift(created)
    }
    notificationStore.addToast(`Authorized new admin: ${newAdminForm.value.email}`, 'success')
    newAdminForm.value = { email: '', name: '', role: 'Admin' }
    showAddModal.value = false
  } catch (e) {
    notificationStore.addToast(`Failed to authorize admin.`, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const removeAdmin = async (admin) => {
  if (confirm(`Are you sure you want to revoke admin access for ${admin.email}?`)) {
    await dbService.deleteAdmin(admin.id)
    admins.value = admins.value.filter(a => a.id !== admin.id)
    notificationStore.addToast(`Revoked admin access for ${admin.email}`, 'info')
  }
}

onMounted(() => {
  loadAdmins()
})
</script>
