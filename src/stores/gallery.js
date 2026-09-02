import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    photos: [],
    loading: false,
    _unsubscribe: null,
    selectedCategory: 'All' // 'All' | 'Tournament' | 'Training' | 'Events' | 'Batch'
  }),

  getters: {
    filteredPhotos: (state) => {
      if (state.selectedCategory === 'All') return state.photos;
      return state.photos.filter(p => p.category === state.selectedCategory);
    }
  },

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      const local = dbService.getLocal('gallery');
      if (local && local.length && this.photos.length === 0) {
        this.photos = local;
      }
      this.loading = this.photos.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('gallery', (items) => {
        if (items) {
          this.photos = items;
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

    async fetchGallery(force = false) {
      if (!force && this.photos.length > 0) return;

      if (this.photos.length === 0) {
        const local = dbService.getLocal('gallery');
        if (local && local.length) this.photos = local;
      }

      this.loading = this.photos.length === 0;
      try {
        const data = await dbService.getGallery();
        if (data) this.photos = data;
      } catch (err) {
        console.error('Fetch gallery error:', err);
      } finally {
        this.loading = false;
      }
    },

    async addPhoto(photoData) {
      this.loading = true;
      try {
        const created = await dbService.addGalleryItem(photoData);
        if (created) {
          this.photos.unshift(created);
        }
        return created;
      } catch (err) {
        console.error('Add photo error:', err);
      } finally {
        this.loading = false;
      }
    },

    async deletePhoto(id) {
      this.loading = true;
      try {
        await dbService.deleteGalleryItem(id);
        this.photos = this.photos.filter(p => p.id !== id);
      } catch (err) {
        console.error('Delete photo error:', err);
      } finally {
        this.loading = false;
      }
    }
  }
})
