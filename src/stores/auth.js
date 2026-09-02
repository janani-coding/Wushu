import { defineStore } from 'pinia'
import { auth, googleProvider } from '@/firebase'
import { signInWithPopup, signOut } from 'firebase/auth'
import { dbService } from '@/services/dbService'

function isSameDob(inputDob, studentDob) {
  if (!inputDob || !studentDob) return false;
  const str1 = String(inputDob).trim();
  const str2 = String(studentDob).trim();
  if (str1 === str2) return true;

  const nums1 = str1.match(/\d+/g);
  const nums2 = str2.match(/\d+/g);

  if (!nums1 || !nums2 || nums1.length < 3 || nums2.length < 3) return false;

  const parseParts = (nums) => {
    let year, p1, p2;
    if (nums[0].length === 4) {
      year = parseInt(nums[0], 10);
      p1 = parseInt(nums[1], 10);
      p2 = parseInt(nums[2], 10);
    } else if (nums[2].length === 4) {
      year = parseInt(nums[2], 10);
      p1 = parseInt(nums[0], 10);
      p2 = parseInt(nums[1], 10);
    }
    return { year, p1, p2 };
  };

  const d1 = parseParts(nums1);
  const d2 = parseParts(nums2);

  if (!d1.year || !d2.year || d1.year !== d2.year) return false;

  return (d1.p1 === d2.p1 && d1.p2 === d2.p2) || (d1.p1 === d2.p2 && d1.p2 === d2.p1);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('kungfu_current_user') || 'null'), // { role: 'student' | 'admin', profile: {...} }
    loading: false,
    authError: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStudent: (state) => state.user?.role === 'student',
    currentUserProfile: (state) => state.user?.profile || null,
    studentId: (state) => state.user?.role === 'student' ? state.user.profile.id : null
  },

  actions: {
    // --- STUDENT LOGIN ---
    async loginStudent(phone, dob) {
      this.loading = true;
      this.authError = null;
      try {
        const students = await dbService.getStudents();
        const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
        
        const matched = students.find(s => {
          const sPhone = String(s.phoneNumber || s.phone || '').trim().replace(/\D/g, '');
          const phoneMatches = Boolean(sPhone && cleanPhone && (sPhone.endsWith(cleanPhone) || cleanPhone.endsWith(sPhone)));
          const dobMatches = isSameDob(dob, s.dob);
          return phoneMatches && dobMatches;
        });

        if (matched) {
          if (matched.status === 'Inactive') {
            this.authError = 'Your student account is currently inactive. Please contact Academy Admin.';
            this.loading = false;
            return false;
          }

          this.user = {
            role: 'student',
            profile: matched,
            loggedInAt: new Date().toISOString()
          };
          localStorage.setItem('kungfu_current_user', JSON.stringify(this.user));
          this.loading = false;
          return true;
        } else {
          this.authError = 'Invalid credentials. Please verify your phone number and date of birth.';
          this.loading = false;
          return false;
        }
      } catch (err) {
        console.error('Student login error:', err);
        this.authError = 'Authentication service error. Please try again.';
        this.loading = false;
        return false;
      }
    },

    // --- ADMIN LOGIN (Google Sign-In) ---
    async loginAdminGoogle() {
      this.loading = true;
      this.authError = null;
      try {
        let adminEmail = '';
        let adminName = 'Academy Admin';
        let adminPhoto = '';

        try {
          const result = await signInWithPopup(auth, googleProvider);
          adminEmail = result.user.email;
          adminName = result.user.displayName || adminName;
          adminPhoto = result.user.photoURL || adminPhoto;
        } catch (firebaseErr) {
          console.error('Google Sign-In Popup Error:', firebaseErr);
          this.authError = firebaseErr.message?.includes('closed-by-user')
            ? 'Sign-in cancelled. Please try again.'
            : (firebaseErr.message || 'Google Sign-In failed. Please try again.');
          this.loading = false;
          return false;
        }

        if (!adminEmail) {
          this.authError = 'Unable to retrieve email from Google Sign-In.';
          this.loading = false;
          return false;
        }

        // Validate email against authorized admins list
        const admins = await dbService.getAdmins();
        const authorized = admins.find(a => a.email && a.email.toLowerCase() === adminEmail.toLowerCase());

        if (authorized || adminEmail.toLowerCase() === 'lokesh.8637427067@gmail.com') {
          const profile = authorized || {
            id: 'admin_' + Date.now(),
            email: adminEmail,
            name: adminName,
            photoUrl: adminPhoto,
            role: 'Chief Admin',
            status: 'active',
            lastLogin: new Date().toISOString()
          };

          this.user = {
            role: 'admin',
            profile: profile,
            loggedInAt: new Date().toISOString()
          };
          localStorage.setItem('kungfu_current_user', JSON.stringify(this.user));
          this.loading = false;
          return true;
        } else {
          this.authError = `Access Denied: (${adminEmail}) is not authorized as an administrator.`;
          this.loading = false;
          return false;
        }
      } catch (err) {
        console.error('Admin login error:', err);
        this.authError = 'Google Sign-In process failed. Please try again.';
        this.loading = false;
        return false;
      }
    },

    // Update current student profile in session state
    updateCurrentStudentProfile(updatedProfile) {
      if (this.user && this.user.role === 'student') {
        this.user.profile = { ...this.user.profile, ...updatedProfile };
        localStorage.setItem('kungfu_current_user', JSON.stringify(this.user));
      }
    },

    // Real-time synchronization check called whenever student collection snapshot updates
    checkAndSyncActiveStudentProfile(studentsList) {
      if (!this.user || this.user.role !== 'student' || !this.user.profile?.id) return;
      
      const currentId = this.user.profile.id;
      const matched = studentsList.find(s => s.id === currentId);

      if (matched) {
        if (matched.status === 'Inactive') {
          // Deactivated by Admin - force auto-logout and show deactivation notice
          this.user = null;
          this.authError = 'Your account has been deactivated. Please contact the academy administrator.';
          localStorage.removeItem('kungfu_current_user');
          if (typeof window !== 'undefined' && window.location.hash !== '#/login/student') {
            window.location.href = '#/login/student';
          }
        } else {
          // Update profile in real-time
          this.user.profile = { ...this.user.profile, ...matched };
          localStorage.setItem('kungfu_current_user', JSON.stringify(this.user));
        }
      }
    },

    // --- LOGOUT ---
    async logout() {
      try {
        await signOut(auth);
      } catch (e) {
        // ignore
      }
      this.user = null;
      this.authError = null;
      localStorage.removeItem('kungfu_current_user');
    }
  }
})
