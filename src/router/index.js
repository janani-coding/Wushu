import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import LandingLayout from '@/layouts/LandingLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import StudentLayout from '@/layouts/StudentLayout.vue'

// Landing Views
import HomeView from '@/views/landing/HomeView.vue'
import AboutView from '@/views/landing/AboutView.vue'
import CoachesView from '@/views/landing/CoachesView.vue'
import GalleryView from '@/views/landing/GalleryView.vue'
import ContactView from '@/views/landing/ContactView.vue'
import InstructionsView from '@/views/landing/InstructionsView.vue'
import StudentLoginView from '@/views/landing/StudentLoginView.vue'
import AdminLoginView from '@/views/landing/AdminLoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// Admin Views
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import StudentsView from '@/views/admin/StudentsView.vue'
import StudentDetailView from '@/views/admin/StudentDetailView.vue'
import PaymentsView from '@/views/admin/PaymentsView.vue'
import QueriesView from '@/views/admin/QueriesView.vue'
import NotificationsView from '@/views/admin/NotificationsView.vue'
import GalleryAdminView from '@/views/admin/GalleryAdminView.vue'
import TournamentsAdminView from '@/views/admin/TournamentsAdminView.vue'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'
import AdminProfileView from '@/views/admin/AdminProfileView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'

// Student Views
import StudentDashboardView from '@/views/student/StudentDashboardView.vue'
import StudentProfileView from '@/views/student/StudentProfileView.vue'
import StudentPaymentsView from '@/views/student/StudentPaymentsView.vue'
import StudentAchievementsView from '@/views/student/StudentAchievementsView.vue'
import StudentQueriesView from '@/views/student/StudentQueriesView.vue'
import StudentTournamentsView from '@/views/student/StudentTournamentsView.vue'
import StudentNotificationsView from '@/views/student/StudentNotificationsView.vue'

const routes = [
  {
    path: '/',
    component: LandingLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'about', name: 'about', component: AboutView },
      { path: 'coaches', name: 'coaches', component: CoachesView },
      { path: 'gallery', name: 'landing-gallery', component: GalleryView },
      { path: 'contact', name: 'contact', component: ContactView },
      { path: 'instructions', name: 'instructions', component: InstructionsView },
      { path: 'login/student', name: 'student-login', component: StudentLoginView },
      { path: 'login/admin', name: 'admin-login', component: AdminLoginView }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
      { path: 'students', name: 'admin-students', component: StudentsView },
      { path: 'students/:id', name: 'admin-student-detail', component: StudentDetailView },
      { path: 'payments', name: 'admin-payments', component: PaymentsView },
      { path: 'queries', name: 'admin-queries', component: QueriesView },
      { path: 'notifications', name: 'admin-notifications', component: NotificationsView },
      { path: 'gallery', name: 'admin-gallery', component: GalleryAdminView },
      { path: 'tournaments', name: 'admin-tournaments', component: TournamentsAdminView },
      { path: 'analytics', name: 'admin-analytics', component: AnalyticsView },
      { path: 'profile', name: 'admin-profile', component: AdminProfileView },
      { path: 'settings', name: 'admin-settings', component: SettingsView }
    ]
  },
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresStudent: true },
    children: [
      { path: '', redirect: '/student/dashboard' },
      { path: 'dashboard', name: 'student-dashboard', component: StudentDashboardView },
      { path: 'profile', name: 'student-profile', component: StudentProfileView },
      { path: 'payments', name: 'student-payments', component: StudentPaymentsView },
      { path: 'achievements', name: 'student-achievements', component: StudentAchievementsView },
      { path: 'queries', name: 'student-queries', component: StudentQueriesView },
      { path: 'tournaments', name: 'student-tournaments', component: StudentTournamentsView },
      { path: 'notifications', name: 'student-notifications', component: StudentNotificationsView }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Route Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return next({ name: 'admin-login', query: { redirect: to.fullPath } })
    }
  }

  if (to.meta.requiresStudent) {
    if (!authStore.isAuthenticated || !authStore.isStudent) {
      return next({ name: 'student-login', query: { redirect: to.fullPath } })
    }
  }

  next()
})

export default router
