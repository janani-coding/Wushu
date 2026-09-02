<template>
  <div class="space-y-6">
    
    <!-- Top Header & Actions Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold text-slate-100">Student Management</h1>
        <p class="text-xs text-slate-400">Add, filter, sort, and manage academy student profiles.</p>
      </div>

      <div class="flex items-center space-x-3">
        <button 
          @click="studentStore.exportToCSV()"
          class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Export List (CSV)</span>
        </button>

        <button 
          @click="openAddModal"
          class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-glow-gold transition-all"
        >
          + Add Student
        </button>
      </div>
    </div>

    <!-- Search Everywhere & Filter Controls -->
    <div class="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Search Input -->
      <div>
        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Everywhere</label>
        <div class="relative">
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input 
            v-model="studentStore.searchQuery"
            type="text" 
            placeholder="Search by name, ID, phone..."
            class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Belt Filter -->
      <div>
        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Belt Rank</label>
        <select 
          v-model="studentStore.selectedBelt"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="All">All Belts</option>
          <option value="White">White Belt</option>
          <option value="Yellow">Yellow Belt</option>
          <option value="Orange">Orange Belt</option>
          <option value="Green">Green Belt</option>
          <option value="Blue">Blue Belt</option>
          <option value="Purple">Purple Belt</option>
          <option value="Brown">Brown Belt</option>
          <option value="Black">Black Belt</option>
        </select>
      </div>

      <!-- Batch Filter -->
      <div>
        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Batch</label>
        <select 
          v-model="studentStore.selectedBatch"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="All">All Batches</option>
          <option value="Morning Warrior">Morning Batch</option>
          <option value="Evening Elite">Evening Batch</option>
          <option value="Weekend Champions">Weekend Batch</option>
        </select>
      </div>

      <!-- Sorting Options -->
      <div>
        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sort Students By</label>
        <select 
          v-model="studentStore.sortBy"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="belt">Belt Rank Progression</option>
          <option value="name">Student Full Name</option>
          <option value="joiningDate">Joining Date</option>
          <option value="id">Student ID</option>
        </select>
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="studentStore.loading && !studentStore.filteredStudents.length" class="space-y-4">
      <SkeletonLoader customClass="w-full h-24" v-for="i in 4" :key="i" />
    </div>

    <!-- EMPTY STATE -->
    <EmptyState 
      v-else-if="!studentStore.filteredStudents.length"
      title="No Students Found"
      description="No student records match your active search or belt category filter."
      actionLabel="+ Register First Student"
      @action="openAddModal"
    />

    <!-- STUDENTS CONTENT CONTAINER -->
    <div v-else>
      <!-- DESKTOP TABLE VIEW (md:block) -->
      <div class="hidden md:block glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 uppercase text-[10px] font-extrabold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-4 px-6">Student Info</th>
                <th class="py-4 px-6">Phone & DOB</th>
                <th class="py-4 px-6">Current Belt</th>
                <th class="py-4 px-6">Batch</th>
                <th class="py-4 px-6">Monthly Fee</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              <tr 
                v-for="student in studentStore.filteredStudents" 
                :key="student.id"
                class="hover:bg-slate-900/50 transition-colors"
              >
                <td class="py-4 px-6">
                  <router-link :to="`/admin/students/${student.id}`" class="flex items-center space-x-3 group">
                    <AvatarInitials :name="student.fullName" :photoUrl="student.profilePhoto" size="md" />
                    <div>
                      <h4 class="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{{ student.fullName }}</h4>
                      <p class="text-[10px] text-slate-500 font-mono">{{ student.id }}</p>
                    </div>
                  </router-link>
                </td>

                <td class="py-4 px-6">
                  <p class="font-mono text-slate-200">{{ student.phoneNumber }}</p>
                  <p class="text-[10px] text-slate-500">DOB: {{ student.dob }}</p>
                </td>

                <td class="py-4 px-6">
                  <BeltBadge :belt="student.currentBelt" />
                </td>

                <td class="py-4 px-6">
                  <span class="text-xs text-slate-300">{{ student.batch.split(' (')[0] }}</span>
                </td>

                <td class="py-4 px-6 font-bold text-amber-400">
                  ₹{{ student.monthlyFee }}
                </td>

                <td class="py-4 px-6">
                  <StatusBadge :status="student.status" />
                </td>

                <td class="py-4 px-6 text-right space-x-2">
                  <router-link 
                    :to="`/admin/students/${student.id}`"
                    class="p-2 text-slate-400 hover:text-amber-400 inline-block"
                    title="View Profile"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </router-link>
                  <button 
                    @click="openEditModal(student)"
                    class="p-2 text-slate-400 hover:text-blue-400"
                    title="Edit Student"
                  >
                    <PencilSquareIcon class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmDelete(student)"
                    class="p-2 text-slate-400 hover:text-rose-400"
                    title="Delete Student"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE CARDS VIEW (md:hidden) -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="student in studentStore.filteredStudents" 
          :key="student.id"
          class="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 text-xs"
        >
          <div class="flex items-center justify-between">
            <router-link :to="`/admin/students/${student.id}`" class="flex items-center space-x-3">
              <AvatarInitials :name="student.fullName" :photoUrl="student.profilePhoto" size="md" />
              <div>
                <h4 class="font-bold text-slate-100 text-sm">{{ student.fullName }}</h4>
                <p class="text-[10px] text-slate-500 font-mono">{{ student.id }}</p>
              </div>
            </router-link>
            <StatusBadge :status="student.status" />
          </div>

          <div class="grid grid-cols-2 gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-[11px]">
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Phone</span>
              <span class="font-mono text-slate-200 font-bold">{{ student.phoneNumber }}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Belt</span>
              <BeltBadge :belt="student.currentBelt" />
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Batch</span>
              <span class="text-slate-300 font-semibold">{{ student.batch.split(' (')[0] }}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-500 block">Monthly Fee</span>
              <span class="text-amber-400 font-extrabold">₹{{ student.monthlyFee }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800">
            <router-link 
              :to="`/admin/students/${student.id}`"
              class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <EyeIcon class="w-3.5 h-3.5" />
              <span>View Profile</span>
            </router-link>
            <button 
              @click="openEditModal(student)"
              class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <PencilSquareIcon class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button 
              @click="confirmDelete(student)"
              class="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <TrashIcon class="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Student Modal -->
    <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-2xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 class="font-heading text-lg font-bold text-amber-400">
              {{ isEditing ? 'Edit Student Details' : 'Register New Student' }}
            </h3>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-white">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveStudent" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Full Name</label>
                <input v-model="form.fullName" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Phone Number (Login Key)</label>
                <input v-model="form.phoneNumber" type="tel" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Date of Birth (Login Key)</label>
                <input v-model="form.dob" type="date" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Gender</label>
                <select v-model="form.gender" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Current Belt Rank</label>
                <select v-model="form.currentBelt" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                  <option>White</option>
                  <option>Yellow</option>
                  <option>Orange</option>
                  <option>Green</option>
                  <option>Blue</option>
                  <option>Purple</option>
                  <option>Brown</option>
                  <option>Black</option>
                </select>
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Training Batch</label>
                <select v-model="form.batch" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                  <option>Morning Warrior (6:00 AM - 7:30 AM)</option>
                  <option>Evening Elite (5:30 PM - 7:00 PM)</option>
                  <option>Weekend Champions (8:00 AM - 10:00 AM)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Monthly Fee (₹)</label>
                <input v-model="form.monthlyFee" type="number" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-300 mb-1">Account Status</label>
                <select v-model="form.status" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Address</label>
              <input v-model="form.address" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <label class="block font-bold uppercase text-slate-300 mb-1">Emergency Contact</label>
              <input v-model="form.emergencyContact" type="text" required placeholder="e.g. +91 98765 00000 (Parent)" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100" />
            </div>

            <div>
              <FileUpload 
                category="profile" 
                label="Upload Student Profile Photo" 
                v-model="form.profilePhoto" 
              />
            </div>

            <div class="pt-4 flex items-center justify-end space-x-3">
              <button type="button" @click="isModalOpen = false" class="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
              <LoadingButton 
                type="submit" 
                :loading="studentStore.loading" 
                variant="primary" 
                size="sm"
                loading-text="Saving..."
              >
                Save Student
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStudentStore } from '@/stores/student'
import { useNotificationStore } from '@/stores/notification'
import BeltBadge from '@/components/ui/BeltBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/solid'

const studentStore = useStudentStore()
const notificationStore = useNotificationStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const activeId = ref(null)

const form = reactive({
  fullName: '',
  phoneNumber: '',
  dob: '',
  gender: 'Male',
  currentBelt: 'White',
  batch: 'Morning Warrior (6:00 AM - 7:30 AM)',
  monthlyFee: 1500,
  address: '',
  emergencyContact: '',
  profilePhoto: '',
  status: 'Active'
})

const openAddModal = () => {
  isEditing.value = false
  activeId.value = null
  Object.assign(form, {
    fullName: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    currentBelt: 'White',
    batch: 'Morning Warrior (6:00 AM - 7:30 AM)',
    monthlyFee: 1500,
    address: '',
    emergencyContact: '',
    profilePhoto: '',
    status: 'Active'
  })
  isModalOpen.value = true
}

const openEditModal = (student) => {
  isEditing.value = true
  activeId.value = student.id
  Object.assign(form, student)
  isModalOpen.value = true
}

const saveStudent = async () => {
  if (isEditing.value && activeId.value) {
    await studentStore.updateStudent(activeId.value, form)
    notificationStore.addToast(`Student ${form.fullName} updated successfully!`, 'success')
  } else {
    await studentStore.addStudent(form)
    notificationStore.addToast(`New student ${form.fullName} registered!`, 'success')
  }
  isModalOpen.value = false
}

const confirmDelete = async (student) => {
  if (confirm(`Are you sure you want to delete student ${student.fullName} (${student.id})?`)) {
    await studentStore.deleteStudent(student.id)
    notificationStore.addToast(`Student deleted successfully.`, 'info')
  }
}
</script>
