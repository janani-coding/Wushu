import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [],
    registrations: [],
    loading: false,
    _unsubT: null,
    _unsubR: null
  }),

  getters: {
    upcomingTournaments: (state) => state.tournaments.filter(t => t.status === 'Upcoming'),
    
    getRegistrationsForTournament: (state) => (tournamentId) => {
      return state.registrations.filter(r => r.tournamentId === tournamentId && r.status !== 'Cancelled');
    },

    getStudentRegistration: (state) => (studentId, tournamentId) => {
      return state.registrations.find(r => r.studentId === studentId && r.tournamentId === tournamentId && r.status !== 'Cancelled');
    },

    getParticipantCount: (state) => (tournamentId) => {
      return state.registrations.filter(r => r.tournamentId === tournamentId && r.status !== 'Cancelled').length;
    },

    getQuota: (state) => (tournamentId) => {
      const t = state.tournaments.find(x => x.id === tournamentId);
      return t ? (Number(t.maxParticipants || t.quota) || 30) : 30;
    },

    getAvailableSlots: (state) => (tournamentId) => {
      const t = state.tournaments.find(x => x.id === tournamentId);
      const quota = t ? (Number(t.maxParticipants || t.quota) || 30) : 30;
      const count = state.registrations.filter(r => r.tournamentId === tournamentId && r.status !== 'Cancelled').length;
      return Math.max(0, quota - count);
    },

    getProgressPercent: (state) => (tournamentId) => {
      const t = state.tournaments.find(x => x.id === tournamentId);
      const quota = t ? (Number(t.maxParticipants || t.quota) || 30) : 30;
      if (quota <= 0) return 0;
      const count = state.registrations.filter(r => r.tournamentId === tournamentId && r.status !== 'Cancelled').length;
      return Math.min(100, Math.round((count / quota) * 100));
    },

    isTournamentFull: (state) => (tournamentId) => {
      const t = state.tournaments.find(x => x.id === tournamentId);
      const quota = t ? (Number(t.maxParticipants || t.quota) || 30) : 30;
      const count = state.registrations.filter(r => r.tournamentId === tournamentId && r.status !== 'Cancelled').length;
      return count >= quota;
    },

    getCalculatedStatus: () => (t) => {
      if (!t) return 'Upcoming';
      const now = Date.now();
      
      const tourneyDateStr = t.date || t.tournamentDate;
      const tourneyDate = tourneyDateStr ? new Date(tourneyDateStr).getTime() : 0;
      const tourneyEnd = tourneyDate ? new Date(tourneyDateStr).setHours(23, 59, 59, 999) : 0;

      if (tourneyEnd && now > tourneyEnd) {
        return 'Completed';
      }

      const deadlineStr = t.registrationDeadline || t.deadline;
      const deadlineDate = deadlineStr ? new Date(deadlineStr).getTime() : 0;
      const deadlineEnd = deadlineStr ? new Date(deadlineStr).setHours(23, 59, 59, 999) : 0;

      if (deadlineEnd && now > deadlineEnd) {
        return 'Expired';
      }

      if (deadlineEnd) {
        const diffDays = (deadlineEnd - now) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 3) {
          return 'Closing Soon';
        }
      }

      return 'Upcoming';
    }
  },

  actions: {
    initAutoSync() {
      if (this._unsubT && this._unsubR) return;

      const localT = dbService.getLocal('tournaments');
      const localR = dbService.getLocal('tournamentRegistrations');
      if (localT && localT.length && this.tournaments.length === 0) this.tournaments = localT;
      if (localR && localR.length && this.registrations.length === 0) this.registrations = localR;

      this.loading = this.tournaments.length === 0;

      this._unsubT = dbService.subscribeToCollection('tournaments', (items) => {
        if (items) this.tournaments = items;
        this.loading = false;
      });

      this._unsubR = dbService.subscribeToCollection('tournamentRegistrations', (items) => {
        if (items) this.registrations = items;
      });
    },

    unsubscribeAutoSync() {
      if (this._unsubT) {
        this._unsubT();
        this._unsubT = null;
      }
      if (this._unsubR) {
        this._unsubR();
        this._unsubR = null;
      }
    },

    async fetchTournaments(force = false) {
      if (!force && this.tournaments.length > 0 && this.registrations.length > 0) return;

      if (this.tournaments.length === 0) {
        const localT = dbService.getLocal('tournaments');
        const localR = dbService.getLocal('tournamentRegistrations');
        if (localT && localT.length) this.tournaments = localT;
        if (localR && localR.length) this.registrations = localR;
      }

      this.loading = this.tournaments.length === 0;
      try {
        const tData = await dbService.getTournaments();
        const rData = await dbService.getTournamentRegistrations();
        if (tData) this.tournaments = tData;
        if (rData) this.registrations = rData;
      } catch (err) {
        console.error('Fetch tournaments error:', err);
      } finally {
        this.loading = false;
      }
    },

    async createTournament(tournamentData) {
      this.loading = true;
      try {
        const created = await dbService.addTournament(tournamentData);
        if (created) {
          this.tournaments.unshift(created);
        }
        return created;
      } catch (err) {
        console.error('Create tournament error:', err);
      } finally {
        this.loading = false;
      }
    },

    async registerStudent(student, tournament) {
      this.loading = true;
      try {
        const registrationData = {
          tournamentId: tournament.id,
          studentId: student.id,
          studentName: student.fullName,
          belt: student.currentBelt,
          phone: student.phoneNumber
        };
        const created = await dbService.registerStudentForTournament(registrationData);
        if (created) {
          this.registrations.unshift(created);
          const tIdx = this.tournaments.findIndex(t => t.id === tournament.id);
          if (tIdx !== -1) {
            this.tournaments[tIdx].registeredCount = (this.tournaments[tIdx].registeredCount || 0) + 1;
          }
        }
        return created;
      } catch (err) {
        console.error('Register student for tournament error:', err);
      } finally {
        this.loading = false;
      }
    },

    async cancelRegistration(registrationId) {
      this.loading = true;
      try {
        const target = this.registrations.find(r => r.id === registrationId);
        await dbService.cancelTournamentRegistration(registrationId);
        this.registrations = this.registrations.filter(r => r.id !== registrationId);
        if (target) {
          const tIdx = this.tournaments.findIndex(t => t.id === target.tournamentId);
          if (tIdx !== -1 && this.tournaments[tIdx].registeredCount > 0) {
            this.tournaments[tIdx].registeredCount -= 1;
          }
        }
      } catch (err) {
        console.error('Cancel registration error:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateTournament(tournamentId, updatedFields) {
      this.loading = true;
      try {
        const updated = await dbService.updateTournament(tournamentId, updatedFields);
        const idx = this.tournaments.findIndex(t => t.id === tournamentId);
        if (idx !== -1 && updated) {
          this.tournaments[idx] = { ...this.tournaments[idx], ...updatedFields };
        }
        return updated;
      } catch (err) {
        console.error('Update tournament error:', err);
      } finally {
        this.loading = false;
      }
    },

    async deleteTournament(tournamentId) {
      this.loading = true;
      try {
        await dbService.deleteTournament(tournamentId);
        this.tournaments = this.tournaments.filter(t => t.id !== tournamentId);
        this.registrations = this.registrations.filter(r => r.tournamentId !== tournamentId);
        return true;
      } catch (err) {
        console.error('Delete tournament error:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    exportParticipantsCSV(tournament) {
      const regs = this.getRegistrationsForTournament(tournament.id);
      if (!regs.length) return;
      const headers = ["Registration ID", "Tournament Title", "Student ID", "Student Name", "Belt Rank", "Phone", "Registration Date", "Payment Status"];
      const rows = regs.map(r => [
        r.id,
        `"${tournament.title}"`,
        r.studentId,
        `"${r.studentName}"`,
        r.belt,
        r.phone,
        r.registrationDate,
        r.paymentStatus
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Tournament_Participants_${tournament.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
})
