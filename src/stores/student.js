import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'
import { useAuthStore } from '@/stores/auth'

const BELT_ORDER = {
  'White': 1,
  'Yellow': 2,
  'Orange': 3,
  'Green': 4,
  'Blue': 5,
  'Purple': 6,
  'Brown': 7,
  'Black': 8
}

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    loading: false,
    _unsubscribe: null,
    searchQuery: '',
    selectedBelt: 'All',
    selectedBatch: 'All',
    selectedStatus: 'All',
    sortBy: 'belt', // 'belt' | 'name' | 'joiningDate' | 'id'
    sortOrder: 'asc'
  }),

  getters: {
    totalStudentsCount: (state) => state.students.length,
    activeStudentsCount: (state) => state.students.filter(s => s.status === 'Active').length,
    inactiveStudentsCount: (state) => state.students.filter(s => s.status === 'Inactive').length,

    filteredStudents: (state) => {
      let list = [...state.students];

      // Search Filter
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        list = list.filter(s => 
          s.fullName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.phoneNumber.includes(q) ||
          s.address.toLowerCase().includes(q)
        );
      }

      // Belt Filter
      if (state.selectedBelt !== 'All') {
        list = list.filter(s => s.currentBelt === state.selectedBelt);
      }

      // Batch Filter
      if (state.selectedBatch !== 'All') {
        list = list.filter(s => s.batch.includes(state.selectedBatch));
      }

      // Status Filter
      if (state.selectedStatus !== 'All') {
        list = list.filter(s => s.status === state.selectedStatus);
      }

      // Sorting
      list.sort((a, b) => {
        if (state.sortBy === 'belt') {
          const rankA = BELT_ORDER[a.currentBelt] || 0;
          const rankB = BELT_ORDER[b.currentBelt] || 0;
          return state.sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
        } else if (state.sortBy === 'name') {
          return state.sortOrder === 'asc' 
            ? a.fullName.localeCompare(b.fullName) 
            : b.fullName.localeCompare(a.fullName);
        } else if (state.sortBy === 'joiningDate') {
          return state.sortOrder === 'asc'
            ? new Date(a.joiningDate) - new Date(b.joiningDate)
            : new Date(b.joiningDate) - new Date(a.joiningDate);
        } else {
          return state.sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        }
      });

      return list;
    },

    studentsPerBelt: (state) => {
      const counts = { White: 0, Yellow: 0, Orange: 0, Green: 0, Blue: 0, Purple: 0, Brown: 0, Black: 0 };
      state.students.forEach(s => {
        if (counts[s.currentBelt] !== undefined) {
          counts[s.currentBelt]++;
        }
      });
      return counts;
    },

    studentsPerBatch: (state) => {
      const batches = {};
      state.students.forEach(s => {
        const batchName = s.batch.split(' (')[0] || s.batch;
        batches[batchName] = (batches[batchName] || 0) + 1;
      });
      return batches;
    }
  },

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;
      
      const authStore = useAuthStore();
      const local = dbService.getLocal('students');
      if (local && local.length && this.students.length === 0) {
        this.students = local;
        authStore.checkAndSyncActiveStudentProfile(local);
      }
      this.loading = this.students.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('students', (items) => {
        if (items) {
          this.students = items;
          authStore.checkAndSyncActiveStudentProfile(items);
        }
        this.loading = false;
      });
    },

    unsubscribeAutoSync() {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }
    },

    async fetchStudents(force = false) {
      if (!force && this.students.length > 0) return;

      // Hydrate immediately from local cache if state is empty
      if (this.students.length === 0) {
        const local = dbService.getLocal('students');
        if (local && local.length) this.students = local;
      }

      this.loading = this.students.length === 0;
      try {
        const data = await dbService.getStudents();
        if (data) this.students = data;
      } catch (err) {
        console.error('Fetch students error:', err);
      } finally {
        this.loading = false;
      }
    },

    async addStudent(studentData) {
      this.loading = true;
      try {
        const created = await dbService.addStudent(studentData);
        if (created) {
          this.students.unshift(created);
        }
        return created;
      } catch (err) {
        console.error('Add student error:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateStudent(id, fields) {
      this.loading = true;
      try {
        const updated = await dbService.updateStudent(id, fields);
        const idx = this.students.findIndex(s => s.id === id);
        if (idx !== -1) {
          this.students[idx] = { ...this.students[idx], ...fields };
        }
        return updated;
      } catch (err) {
        console.error('Update student error:', err);
      } finally {
        this.loading = false;
      }
    },

    async deleteStudent(id) {
      this.loading = true;
      try {
        await dbService.deleteStudent(id);
        this.students = this.students.filter(s => s.id !== id);
      } catch (err) {
        console.error('Delete student error:', err);
      } finally {
        this.loading = false;
      }
    },

    getStudentById(id) {
      return this.students.find(s => s.id === id);
    },

    exportToCSV() {
      if (!this.filteredStudents.length) return;
      const headers = ["Student ID", "Full Name", "Phone", "DOB", "Gender", "Belt", "Batch", "Joining Date", "Monthly Fee", "Status", "Address"];
      const rows = this.filteredStudents.map(s => [
        s.id,
        `"${s.fullName}"`,
        s.phoneNumber,
        s.dob,
        s.gender,
        s.currentBelt,
        `"${s.batch}"`,
        s.joiningDate,
        s.monthlyFee,
        s.status,
        `"${s.address.replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `KungFu_Students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
})
