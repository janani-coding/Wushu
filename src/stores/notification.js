import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    toasts: [],
    loading: false,
    _unsubscribe: null
  }),

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      const local = dbService.getLocal('notifications');
      if (local && local.length && this.notifications.length === 0) {
        this.notifications = local;
      }
      this.loading = this.notifications.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('notifications', (items) => {
        if (items) {
          this.notifications = items;
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

    async fetchNotifications(force = false) {
      if (!force && this.notifications.length > 0) return;

      if (this.notifications.length === 0) {
        const local = dbService.getLocal('notifications');
        if (local && local.length) this.notifications = local;
      }

      this.loading = this.notifications.length === 0;
      try {
        const data = await dbService.getNotifications();
        if (data) this.notifications = data;
      } catch (err) {
        console.error('Fetch notifications error:', err);
      } finally {
        this.loading = false;
      }
    },

    async createNotification(notifData) {
      this.loading = true;
      try {
        const created = await dbService.addNotification(notifData);
        if (created) {
          this.notifications.unshift(created);
        }
        this.addToast(`Broadcast Notification Sent: "${notifData.title}"`, 'success');
        return created;
      } catch (err) {
        console.error('Create notification error:', err);
      } finally {
        this.loading = false;
      }
    },

    // --- Toast Notifications System ---
    addToast(message, type = 'info', timeout = 4000) {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.removeToast(id);
      }, timeout);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
})
