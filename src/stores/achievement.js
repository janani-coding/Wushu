import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const useAchievementStore = defineStore('achievement', {
  state: () => ({
    achievements: [],
    loading: false,
    _unsubscribe: null
  }),

  getters: {
    getAchievementsByStudent: (state) => (studentId) => {
      return state.achievements.filter(a => a.studentId === studentId);
    }
  },

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      const local = dbService.getLocal('achievements');
      if (local && local.length && this.achievements.length === 0) {
        this.achievements = local;
      }
      this.loading = this.achievements.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('achievements', (items) => {
        if (items) {
          this.achievements = items;
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

    async fetchAchievements(force = false) {
      if (!force && this.achievements.length > 0) return;

      if (this.achievements.length === 0) {
        const local = dbService.getLocal('achievements');
        if (local && local.length) this.achievements = local;
      }

      this.loading = this.achievements.length === 0;
      try {
        const data = await dbService.getAchievements();
        if (data) this.achievements = data;
      } catch (err) {
        console.error('Fetch achievements error:', err);
      } finally {
        this.loading = false;
      }
    },

    async addAchievement(achData) {
      this.loading = true;
      try {
        const created = await dbService.addAchievement(achData);
        if (created) {
          this.achievements.unshift(created);
        }
        return created;
      } catch (err) {
        console.error('Add achievement error:', err);
      } finally {
        this.loading = false;
      }
    }
  }
})
