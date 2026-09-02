import { defineStore } from 'pinia'
import { dbService } from '@/services/dbService'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [],
    loading: false,
    _unsubscribe: null,
    filterStatus: 'All', // 'All' | 'Pending Approval' | 'Approved' | 'Rejected'
    filterMonth: 'All'
  }),

  getters: {
    pendingPayments: (state) => state.payments.filter(p => p.status === 'Pending Approval'),
    approvedPayments: (state) => state.payments.filter(p => p.status === 'Approved'),
    rejectedPayments: (state) => state.payments.filter(p => p.status === 'Rejected'),

    filteredPayments: (state) => {
      let list = [...state.payments];
      if (state.filterStatus !== 'All') {
        list = list.filter(p => p.status === state.filterStatus);
      }
      if (state.filterMonth !== 'All') {
        list = list.filter(p => p.month === state.filterMonth);
      }
      return list.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    },

    totalRevenue: (state) => {
      return state.payments
        .filter(p => p.status === 'Approved')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    },

    collectedThisMonth: (state) => {
      const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      return state.payments
        .filter(p => p.status === 'Approved' && (p.month === currentMonthStr || p.month === 'August 2026'))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    },

    pendingPaymentsCount: (state) => state.pendingPayments.length
  },

  actions: {
    initAutoSync() {
      if (this._unsubscribe) return;

      const local = dbService.getLocal('payments');
      if (local && local.length && this.payments.length === 0) {
        this.payments = local;
      }
      this.loading = this.payments.length === 0;

      this._unsubscribe = dbService.subscribeToCollection('payments', (items) => {
        if (items) {
          this.payments = items;
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

    async fetchPayments(force = false) {
      if (!force && this.payments.length > 0) return;

      if (this.payments.length === 0) {
        const local = dbService.getLocal('payments');
        if (local && local.length) this.payments = local;
      }

      this.loading = this.payments.length === 0;
      try {
        const data = await dbService.getPayments();
        if (data) this.payments = data;
      } catch (err) {
        console.error('Fetch payments error:', err);
      } finally {
        this.loading = false;
      }
    },

    async submitPayment(payload) {
      this.loading = true;
      try {
        const created = await dbService.addPayment(payload);
        if (created) {
          this.payments.unshift(created);
        }
        return created;
      } catch (err) {
        console.error('Payment submit error:', err);
      } finally {
        this.loading = false;
      }
    },

    async submitUPIPayment(studentId, studentName, amount, transactionId, month, category = 'Academy Monthly Fee') {
      const now = new Date();
      return this.submitPayment({
        studentId,
        studentName,
        category,
        month: month || now.toLocaleString('default', { month: 'long' }),
        year: now.getFullYear(),
        amount: Number(amount),
        transactionId: String(transactionId).trim()
      });
    },

    async approvePayment(paymentId, adminName) {
      this.loading = true;
      try {
        const updated = await dbService.updatePaymentStatus(paymentId, 'Approved', adminName, 'Approved after reference check');
        const idx = this.payments.findIndex(p => p.id === paymentId);
        if (idx !== -1) {
          this.payments[idx] = { ...this.payments[idx], ...updated };
        }
        return updated;
      } catch (err) {
        console.error('Approve payment error:', err);
      } finally {
        this.loading = false;
      }
    },

    async rejectPayment(paymentId, adminName, reason = 'Transaction ID not matching bank record') {
      this.loading = true;
      try {
        const updated = await dbService.updatePaymentStatus(paymentId, 'Rejected', adminName, reason);
        const idx = this.payments.findIndex(p => p.id === paymentId);
        if (idx !== -1) {
          this.payments[idx] = { ...this.payments[idx], ...updated };
        }
        return updated;
      } catch (err) {
        console.error('Reject payment error:', err);
      } finally {
        this.loading = false;
      }
    },

    // Get specific monthly fee payment record for a student
    getStudentMonthlyFeePayment(studentId, monthName, yearNumber) {
      const targetMonth = monthName || new Date().toLocaleString('default', { month: 'long' });
      const targetYear = Number(yearNumber) || new Date().getFullYear();
      return this.payments.find(p => 
        p.studentId === studentId && 
        (p.category === 'Academy Monthly Fee' || !p.category) &&
        (p.month === targetMonth || p.month?.includes(targetMonth)) &&
        (Number(p.year) === targetYear || !p.year)
      );
    },

    // Check if student has paid current month fee (legacy compatible)
    getStudentPaymentForMonth(studentId, monthStr) {
      const now = new Date();
      const mName = monthStr ? monthStr.split(' ')[0] : now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      return this.getStudentMonthlyFeePayment(studentId, mName, year);
    },

    // Get payment for tournament registration
    getStudentTournamentPayment(studentId, tournamentId) {
      return this.payments.find(p => 
        p.studentId === studentId && 
        p.category === 'Tournament Registration Fee' && 
        p.tournamentId === tournamentId &&
        (p.status === 'Approved' || p.status === 'Pending Approval')
      );
    },

    // Get pending payment for generic category
    getStudentPendingCategoryPayment(studentId, category) {
      return this.payments.find(p => 
        p.studentId === studentId && 
        p.category === category && 
        p.status === 'Pending Approval'
      );
    },

    // Calculate if payment reminder should pop up for student
    shouldShowPaymentReminder(studentId, reminderSchedule = [1, 5, 10, 15]) {
      const payment = this.getStudentPaymentForMonth(studentId);
      if (payment && (payment.status === 'Approved' || payment.adminApproval)) {
        return false; // Reminders stop automatically when paid
      }

      const today = new Date();
      const currentDay = today.getDate();

      return reminderSchedule.includes(currentDay) || (payment && payment.status === 'Pending Approval') || currentDay >= 5;
    }
  }
})
