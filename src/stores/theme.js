import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem('app_theme') || 'dark' // 'dark' | 'light'
  }),

  actions: {
    initTheme() {
      const saved = localStorage.getItem('app_theme')
      if (saved) {
        this.mode = saved
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.mode = prefersDark ? 'dark' : 'light'
      }
      this.applyTheme()
    },

    toggleTheme() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('app_theme', this.mode)
      this.applyTheme()
    },

    setTheme(newMode) {
      if (['dark', 'light'].includes(newMode)) {
        this.mode = newMode
        localStorage.setItem('app_theme', newMode)
        this.applyTheme()
      }
    },

    applyTheme() {
      const root = document.documentElement
      if (this.mode === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', this.mode === 'dark' ? '#0f172a' : '#f8fafc')
      }
    }
  }
})
