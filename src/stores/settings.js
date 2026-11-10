import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'
import { INITIAL_SETTINGS } from '@/data/initialData'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: { ...INITIAL_SETTINGS },
    loading: false,
    _unsubscribe: null
  }),

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      this._unsubscribe = dbService.subscribeToDocument('settings', 'academy_config', (data) => {
        if (data) {
          this.settings = { 
            ...INITIAL_SETTINGS, 
            ...data,
            logoUrl: data.logoUrl || INITIAL_SETTINGS.logoUrl
          };
        }
      });
    },

    unsubscribeAutoSync() {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }
    },

    async fetchSettings(force = false) {
      if (!force && this.settings && this.settings.academyName) return;
      this.loading = true;
      try {
        const data = await dbService.getSettings();
        if (data) {
          this.settings = {
            ...INITIAL_SETTINGS,
            ...data,
            logoUrl: data.logoUrl || INITIAL_SETTINGS.logoUrl
          };
        }
      } catch (err) {
        console.error('Fetch settings error:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateSettings(newSettings) {
      this.loading = true;
      try {
        const updated = await dbService.updateSettings(newSettings);
        this.settings = updated;
        return updated;
      } catch (err) {
        console.error('Update settings error:', err);
      } finally {
        this.loading = false;
      }
    },

    async addPaymentCategory(categoryName) {
      const clean = categoryName ? categoryName.trim() : '';
      if (!clean) return;
      const current = this.settings.paymentCategories || INITIAL_SETTINGS.paymentCategories;
      if (current.includes(clean)) return;
      const updatedList = [...current, clean];
      return this.updateSettings({ paymentCategories: updatedList });
    },

    async removePaymentCategory(categoryName) {
      const current = this.settings.paymentCategories || INITIAL_SETTINGS.paymentCategories;
      // Do not allow removing Academy Monthly Fee
      if (categoryName === 'Academy Monthly Fee') return;
      const updatedList = current.filter(c => c !== categoryName);
      return this.updateSettings({ paymentCategories: updatedList });
    }
  }
})
