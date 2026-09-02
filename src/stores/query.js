import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const useQueryStore = defineStore('query', {
  state: () => ({
    queries: [],
    loading: false,
    _unsubscribe: null,
    filterStatus: 'All', // 'All' | 'Open' | 'In Progress' | 'Resolved'
    retentionSeconds: 30, // Default 30s delay for testing/development. Can be configured to 3600 (1h), 86400 (24h), etc.
    _activeTimers: {}
  }),

  getters: {
    openQueries: (state) => state.queries.filter(q => q.status === 'Open' || q.status === 'In Progress'),
    openQueriesCount: (state) => state.queries.filter(q => q.status === 'Open' || q.status === 'In Progress').length,
    resolvedQueriesCount: (state) => state.queries.filter(q => q.status === 'Resolved').length,

    filteredQueries: (state) => {
      let list = [...state.queries];
      if (state.filterStatus !== 'All') {
        list = list.filter(q => q.status === state.filterStatus);
      }
      const map = new Map();
      list.forEach(q => {
        if (q && q.id) map.set(q.id, q);
      });
      const unique = Array.from(map.values());
      return unique.sort((a, b) => new Date(b.createdAt || b.date || Date.now()) - new Date(a.createdAt || a.date || Date.now()));
    }
  },

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      const local = dbService.getLocal('queries');
      if (local && local.length && this.queries.length === 0) {
        this.queries = local;
        this.checkAndSweepResolvedQueries();
      }
      this.loading = this.queries.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('queries', (items) => {
        if (items) {
          this.queries = items;
          this.checkAndSweepResolvedQueries();
        }
        this.loading = false;
      });
    },

    unsubscribeAutoSync() {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }
      // Clear active timers
      Object.keys(this._activeTimers).forEach(id => clearTimeout(this._activeTimers[id]));
      this._activeTimers = {};
    },

    checkAndSweepResolvedQueries() {
      this.queries.forEach(q => {
        if (q.status === 'Resolved') {
          this.scheduleAutoDeletion(q);
        }
      });
    },

    scheduleAutoDeletion(query) {
      if (!query || query.status !== 'Resolved') return;
      if (this._activeTimers[query.id]) return; // Already scheduled

      const resolvedTime = query.resolvedAt ? new Date(query.resolvedAt).getTime() : new Date(query.date || query.createdAt || Date.now()).getTime();
      const elapsedMs = Date.now() - resolvedTime;
      const retentionMs = this.retentionSeconds * 1000;
      const remainingMs = retentionMs - elapsedMs;

      if (remainingMs <= 0) {
        this.deleteQuery(query.id);
      } else {
        this._activeTimers[query.id] = setTimeout(() => {
          this.deleteQuery(query.id);
        }, Math.max(100, remainingMs));
      }
    },

    async deleteQuery(queryId) {
      if (this._activeTimers[queryId]) {
        clearTimeout(this._activeTimers[queryId]);
        delete this._activeTimers[queryId];
      }
      
      try {
        await dbService.deleteQuery(queryId);
      } catch (err) {
        console.error('Delete query error:', err);
      } finally {
        this.queries = this.queries.filter(q => q.id !== queryId);
      }
    },

    async fetchQueries(force = false) {
      if (!force && this.queries.length > 0) return;

      if (this.queries.length === 0) {
        const local = dbService.getLocal('queries');
        if (local && local.length) {
          this.queries = local;
          this.checkAndSweepResolvedQueries();
        }
      }

      this.loading = this.queries.length === 0;
      try {
        const data = await dbService.getQueries();
        if (data) {
          this.queries = data;
          this.checkAndSweepResolvedQueries();
        }
      } catch (err) {
        console.error('Fetch queries error:', err);
      } finally {
        this.loading = false;
      }
    },

    async submitQuery(studentId, studentName, title, description, category = 'General') {
      this.loading = true;
      try {
        const created = await dbService.addQuery({
          studentId,
          studentName,
          title,
          description,
          category
        });
        if (created) {
          const exists = this.queries.some(q => q.id === created.id);
          if (!exists) {
            this.queries.unshift(created);
          }
        }
        return created;
      } catch (err) {
        console.error('Submit query error:', err);
      } finally {
        this.loading = false;
      }
    },

    async replyToQuery(queryId, adminName, adminRole, text) {
      this.loading = true;
      try {
        const replyObj = {
          repliedBy: adminName,
          role: adminRole || 'Admin',
          message: text,
          date: new Date().toISOString()
        };
        const updated = await dbService.replyToQuery(queryId, replyObj);
        const idx = this.queries.findIndex(q => q.id === queryId);
        if (idx !== -1 && updated) {
          this.queries[idx] = { ...this.queries[idx], replies: updated.replies || [] };
        }
        return updated;
      } catch (err) {
        console.error('Reply to query error:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateQueryStatus(queryId, status) {
      this.loading = true;
      try {
        const updated = await dbService.updateQueryStatus(queryId, status);
        const idx = this.queries.findIndex(q => q.id === queryId);
        if (idx !== -1) {
          const resTime = status === 'Resolved' ? new Date().toISOString() : null;
          this.queries[idx] = { ...this.queries[idx], status, resolvedAt: resTime };
          if (status === 'Resolved') {
            this.scheduleAutoDeletion(this.queries[idx]);
          }
        }
        return updated;
      } catch (err) {
        console.error('Update query status error:', err);
      } finally {
        this.loading = false;
      }
    },

    async markResolved(queryId) {
      return this.updateQueryStatus(queryId, 'Resolved');
    },

    getQueriesByStudent(studentId) {
      const list = this.queries.filter(q => q.studentId === studentId);
      const map = new Map();
      list.forEach(q => {
        if (q && q.id) map.set(q.id, q);
      });
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date || Date.now()) - new Date(a.createdAt || a.date || Date.now()));
    }
  }
})
