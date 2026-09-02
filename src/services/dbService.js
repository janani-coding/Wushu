import { db, isFirebaseConfigured } from '@/firebase'
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, writeBatch, increment 
} from 'firebase/firestore'
import { 
  INITIAL_SETTINGS, INITIAL_ADMINS, INITIAL_STUDENTS, INITIAL_PAYMENTS, 
  INITIAL_QUERIES, INITIAL_NOTIFICATIONS, INITIAL_GALLERY, INITIAL_TOURNAMENTS, 
  INITIAL_TOURNAMENT_REGISTRATIONS, INITIAL_ACHIEVEMENTS 
} from '@/data/initialData'
import { fileService } from '@/services/fileService'

class DatabaseService {
  constructor() {
    this.useFirebase = isFirebaseConfigured()
    this.initLocalStorage()
  }

  // Helper to seed Firestore in the background if a cloud collection is empty
  async seedCollection(collectionName, items) {
    if (!this.useFirebase || !items || !items.length) return
    try {
      for (const item of items) {
        const docId = item.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        await setDoc(doc(db, collectionName, docId), item, { merge: true })
      }
      console.log(`Successfully seeded ${items.length} initial records to Firestore collection '${collectionName}'`)
    } catch (err) {
      console.warn(`Background seed error for '${collectionName}':`, err)
    }
  }

  // Real-time subscription to a Firestore collection
  subscribeToCollection(collectionName, callback) {
    if (this.useFirebase) {
      try {
        const colRef = collection(db, collectionName)
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal(collectionName, items)
          callback(items)
        }, (err) => {
          console.warn(`Firestore onSnapshot error for ${collectionName}:`, err)
          const local = this.getLocal(collectionName)
          callback(local && local.length ? local : [])
        })
        return unsubscribe
      } catch (err) {
        console.error(`Subscription setup error for ${collectionName}:`, err)
      }
    }
    const local = this.getLocal(collectionName)
    callback(local && local.length ? local : [])
    return () => {}
  }

  // Real-time subscription to a single Firestore document
  subscribeToDocument(collectionName, docId, callback) {
    if (this.useFirebase) {
      try {
        const docRef = doc(db, collectionName, docId)
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            localStorage.setItem(`kungfu_${collectionName}`, JSON.stringify(data))
            callback(data)
          } else {
            const localStr = localStorage.getItem(`kungfu_${collectionName}`)
            const local = localStr ? JSON.parse(localStr) : INITIAL_SETTINGS
            callback(local)
            if (local) {
              setDoc(docRef, local, { merge: true }).catch(e => console.warn('Seed doc error:', e))
            }
          }
        }, (err) => {
          console.warn(`Firestore onSnapshot error for ${collectionName}/${docId}:`, err)
          const localStr = localStorage.getItem(`kungfu_${collectionName}`)
          if (localStr) callback(JSON.parse(localStr))
        })
        return unsubscribe
      } catch (err) {
        console.error(`Document subscription error for ${collectionName}/${docId}:`, err)
      }
    }
    const localStr = localStorage.getItem(`kungfu_${collectionName}`)
    callback(localStr ? JSON.parse(localStr) : INITIAL_SETTINGS)
    return () => {}
  }

  initLocalStorage() {
    if (typeof window === 'undefined') return

    // Clear stale demo data from localStorage if legacy cache exists
    if (!localStorage.getItem('wushu_demo_cleared_v4')) {
      ['students', 'payments', 'queries', 'notifications', 'gallery', 'tournaments', 'tournamentRegistrations', 'achievements', 'admins', 'settings'].forEach(k => {
        localStorage.removeItem(`kungfu_${k}`)
      })
      localStorage.setItem('wushu_demo_cleared_v4', 'true')
    }

    const defaults = {
      settings: INITIAL_SETTINGS,
      admins: INITIAL_ADMINS,
      students: INITIAL_STUDENTS,
      payments: INITIAL_PAYMENTS,
      queries: INITIAL_QUERIES,
      notifications: INITIAL_NOTIFICATIONS,
      gallery: INITIAL_GALLERY,
      tournaments: INITIAL_TOURNAMENTS,
      tournamentRegistrations: INITIAL_TOURNAMENT_REGISTRATIONS,
      achievements: INITIAL_ACHIEVEMENTS
    }

    Object.keys(defaults).forEach(key => {
      if (!localStorage.getItem(`kungfu_${key}`)) {
        localStorage.setItem(`kungfu_${key}`, JSON.stringify(defaults[key]))
      }
    })
  }

  // Helper for localStorage fallback
  getLocal(collectionName) {
    const data = localStorage.getItem(`kungfu_${collectionName}`)
    return data ? JSON.parse(data) : []
  }

  setLocal(collectionName, data) {
    localStorage.setItem(`kungfu_${collectionName}`, JSON.stringify(data))
  }

  // --- ADMINS ---
  async getAdmins() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'admins'))
        if (!snap.empty) {
          const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          this.setLocal('admins', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore admins fetch fallback to local:', err)
      }
    }
    return this.getLocal('admins')
  }

  async addAdmin(adminData) {
    const autoId = `admin_${Date.now()}`
    const newAdmin = {
      id: autoId,
      email: adminData.email.trim().toLowerCase(),
      name: adminData.name || 'Academy Admin',
      role: adminData.role || 'Admin',
      status: 'active',
      addedAt: new Date().toISOString()
    }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'admins', autoId), newAdmin)
      } catch (err) {
        console.error('Firestore admin add error:', err)
      }
    }

    const admins = this.getLocal('admins')
    admins.unshift(newAdmin)
    this.setLocal('admins', admins)
    return newAdmin
  }

  async deleteAdmin(adminId) {
    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'admins', adminId))
      } catch (err) {
        console.error('Firestore admin delete error:', err)
      }
    }

    let admins = this.getLocal('admins')
    admins = admins.filter(a => a.id !== adminId)
    this.setLocal('admins', admins)
    return true
  }

  // --- SETTINGS ---
  async getSettings() {
    if (this.useFirebase) {
      try {
        const docRef = doc(db, 'settings', 'academy_config')
        const snap = await getDoc(docRef)
        if (snap.exists()) return snap.data()
      } catch (err) {
        console.warn('Firestore settings fetch failed, using local storage', err)
      }
    }
    const local = localStorage.getItem('kungfu_settings')
    return local ? JSON.parse(local) : INITIAL_SETTINGS
  }

  async updateSettings(newSettings) {
    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'settings', 'academy_config'), newSettings, { merge: true })
      } catch (err) {
        console.error('Firestore settings update error:', err)
      }
    }
    const current = await this.getSettings()
    const updated = { ...current, ...newSettings }
    localStorage.setItem('kungfu_settings', JSON.stringify(updated))
    return updated
  }

  // --- STUDENTS ---
  async getStudents() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'students'))
        if (!snap.empty) {
          const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          this.setLocal('students', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore students fetch fallback to local:', err)
      }
    }
    const local = this.getLocal('students')
    if (local && local.length) {
      return local
    }
    if (INITIAL_STUDENTS && INITIAL_STUDENTS.length) {
      this.setLocal('students', INITIAL_STUDENTS)
      return INITIAL_STUDENTS
    }
    return []
  }

  async addStudent(studentData) {
    const autoId = `STU-2026-${String(Math.floor(100 + Math.random() * 900))}`
    const newStudent = {
      id: autoId,
      ...studentData,
      status: studentData.status || 'Active',
      joiningDate: studentData.joiningDate || new Date().toISOString().split('T')[0]
    }

    if (this.useFirebase) {
      try {
        const batch = writeBatch(db)
        batch.set(doc(db, 'students', autoId), newStudent)
        batch.set(doc(db, 'analytics', 'dashboard'), { totalStudents: increment(1) }, { merge: true })
        await batch.commit()
      } catch (err) {
        console.error('Firestore student add error:', err)
      }
    }

    const students = this.getLocal('students')
    students.unshift(newStudent)
    this.setLocal('students', students)
    return newStudent
  }

  async updateStudent(studentId, updatedFields) {
    if (this.useFirebase) {
      try {
        await updateDoc(doc(db, 'students', studentId), updatedFields)
      } catch (err) {
        console.error('Firestore student update error:', err)
      }
    }

    const students = this.getLocal('students')
    const idx = students.findIndex(s => s.id === studentId)
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...updatedFields }
      this.setLocal('students', students)
      return students[idx]
    }
    return null
  }

  async deleteStudent(studentId) {
    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'students', studentId))
      } catch (err) {
        console.error('Firestore student delete error:', err)
      }
    }

    let students = this.getLocal('students')
    students = students.filter(s => s.id !== studentId)
    this.setLocal('students', students)
    return true
  }

  // --- PAYMENTS ---
  async getPayments() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'payments'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('payments', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore payments fetch fallback to local:', err)
      }
    }
    return this.getLocal('payments')
  }

  async addPayment(paymentData) {
    const payId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date()
    const record = {
      id: payId,
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      category: paymentData.category || 'Academy Monthly Fee',
      month: paymentData.month || now.toLocaleString('default', { month: 'long' }),
      year: paymentData.year || now.getFullYear(),
      amount: Number(paymentData.amount) || 1500,
      transactionId: String(paymentData.transactionId || '').trim(),
      tournamentId: paymentData.tournamentId || '',
      status: 'Pending Approval',
      adminApproval: false,
      paymentDate: now.toISOString(),
      approvedBy: '',
      approvedDate: null,
      notes: paymentData.notes || ''
    }

    if (this.useFirebase) {
      try {
        const batch = writeBatch(db)
        batch.set(doc(db, 'payments', payId), record)
        batch.set(doc(db, 'analytics', 'dashboard'), { pendingPayments: increment(1) }, { merge: true })
        await batch.commit()
      } catch (err) {
        console.error('Firestore payment add error:', err)
      }
    }

    const payments = this.getLocal('payments')
    payments.unshift(record)
    this.setLocal('payments', payments)
    return record
  }

  async updatePaymentStatus(paymentId, status, adminName, notes = '') {
    const isApproved = status === 'Approved'
    const updateObj = { 
      status, 
      adminApproval: isApproved,
      approvedBy: adminName, 
      approvedDate: isApproved ? new Date().toISOString() : null,
      notes 
    }
    const payments = this.getLocal('payments')
    const idx = payments.findIndex(p => p.id === paymentId)
    const targetPay = idx !== -1 ? payments[idx] : null

    if (this.useFirebase) {
      try {
        const batch = writeBatch(db)
        batch.update(doc(db, 'payments', paymentId), updateObj)
        if (targetPay) {
          const amt = Number(targetPay.amount) || 0
          if (isApproved) {
            batch.set(doc(db, 'analytics', 'dashboard'), {
              totalRevenue: increment(amt),
              pendingPayments: increment(-1)
            }, { merge: true })
          } else {
            batch.set(doc(db, 'analytics', 'dashboard'), {
              pendingPayments: increment(-1)
            }, { merge: true })
          }
        }
        await batch.commit()
      } catch (err) {
        console.error('Firestore payment update error:', err)
      }
    }

    if (idx !== -1) {
      payments[idx] = { ...payments[idx], ...updateObj }
      this.setLocal('payments', payments)
      return payments[idx]
    }
    return null
  }

  // --- QUERIES ---
  async getQueries() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'queries'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('queries', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore queries fetch fallback to local:', err)
      }
    }
    return this.getLocal('queries')
  }

  async addQuery(queryData) {
    const qId = `QRY-${Math.floor(5000 + Math.random() * 4000)}`
    const isoNow = new Date().toISOString()
    const newQuery = {
      id: qId,
      ...queryData,
      date: isoNow,
      createdAt: isoNow,
      status: 'Open',
      replies: []
    }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'queries', qId), newQuery)
      } catch (err) {
        console.error('Firestore query add error:', err)
      }
    }

    const queries = this.getLocal('queries')
    if (!queries.some(q => q.id === qId)) {
      queries.unshift(newQuery)
    }
    this.setLocal('queries', queries)
    return newQuery
  }

  async replyToQuery(queryId, replyObj) {
    const queries = this.getLocal('queries')
    const idx = queries.findIndex(q => q.id === queryId)
    if (idx !== -1) {
      const existingReplies = queries[idx].replies || []
      const isDup = existingReplies.some(r => r.message === replyObj.message && r.date === replyObj.date)
      const updatedReplies = isDup ? existingReplies : [...existingReplies, replyObj]
      queries[idx].replies = updatedReplies
      if (this.useFirebase) {
        try {
          await setDoc(doc(db, 'queries', queryId), { replies: updatedReplies }, { merge: true })
        } catch (err) {
          console.error('Firestore query reply error:', err)
        }
      }
      this.setLocal('queries', queries)
      return queries[idx]
    }
    return null
  }

  async updateQueryStatus(queryId, status) {
    const queries = this.getLocal('queries')
    const idx = queries.findIndex(q => q.id === queryId)
    if (idx !== -1) {
      const isResolved = status === 'Resolved'
      const updateObj = { 
        status, 
        resolvedAt: isResolved ? (queries[idx].resolvedAt || new Date().toISOString()) : null 
      }
      queries[idx] = { ...queries[idx], ...updateObj }
      if (this.useFirebase) {
        try {
          await setDoc(doc(db, 'queries', queryId), updateObj, { merge: true })
        } catch (err) {
          console.error('Firestore query status update error:', err)
        }
      }
      this.setLocal('queries', queries)
      return queries[idx]
    }
    return null
  }

  async deleteQuery(queryId) {
    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'queries', queryId))
      } catch (err) {
        console.error('Firestore query delete error:', err)
      }
    }

    let queries = this.getLocal('queries')
    queries = queries.filter(q => q.id !== queryId)
    this.setLocal('queries', queries)
    return true
  }

  // --- NOTIFICATIONS ---
  async getNotifications() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'notifications'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('notifications', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore notifications fetch fallback to local:', err)
      }
    }
    return this.getLocal('notifications')
  }

  async addNotification(notifData) {
    const nId = `NOTIF-${Math.floor(7000 + Math.random() * 2000)}`
    const newNotif = {
      id: nId,
      ...notifData,
      date: new Date().toISOString()
    }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'notifications', nId), newNotif)
      } catch (err) {
        console.error('Firestore notification add error:', err)
      }
    }

    const notifs = this.getLocal('notifications')
    notifs.unshift(newNotif)
    this.setLocal('notifications', notifs)
    return newNotif
  }

  // --- GALLERY ---
  async getGallery() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'gallery'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('gallery', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore gallery fetch fallback:', err)
      }
    }
    return this.getLocal('gallery')
  }

  async addGalleryItem(item) {
    const id = `GAL-${Math.floor(100 + Math.random() * 900)}`
    const newItem = { id, ...item, uploadedAt: new Date().toISOString() }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'gallery', id), newItem)
      } catch (err) {
        console.error('Firestore gallery add error:', err)
      }
    }

    const gal = this.getLocal('gallery')
    gal.unshift(newItem)
    this.setLocal('gallery', gal)
    return newItem
  }

  async deleteGalleryItem(id) {
    let gal = this.getLocal('gallery')
    const target = gal.find(g => g.id === id)

    // Purge GridFS file if fileId exists
    if (target && target.fileId) {
      await fileService.deleteFile(target.fileId).catch(() => {})
    } else if (target && target.photoUrl && target.photoUrl.includes('/api/files/')) {
      const parts = target.photoUrl.split('/api/files/')
      if (parts[1]) {
        await fileService.deleteFile(parts[1]).catch(() => {})
      }
    }

    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'gallery', id))
      } catch (err) {
        console.error('Firestore gallery delete error:', err)
      }
    }

    gal = gal.filter(g => g.id !== id)
    this.setLocal('gallery', gal)
    return true
  }

  // --- TOURNAMENTS & REGISTRATIONS ---
  async getTournaments() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'tournaments'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('tournaments', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore tournaments fetch fallback:', err)
      }
    }
    return this.getLocal('tournaments')
  }

  async addTournament(tournament) {
    const id = `TRN-${Math.floor(9000 + Math.random() * 999)}`
    const newTrn = { id, ...tournament, registeredCount: 0, status: tournament.status || 'Upcoming' }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'tournaments', id), newTrn)
      } catch (err) {
        console.error('Firestore tournament add error:', err)
      }
    }

    const trns = this.getLocal('tournaments')
    trns.unshift(newTrn)
    this.setLocal('tournaments', trns)
    return newTrn
  }

  async updateTournament(tournamentId, updatedFields) {
    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'tournaments', tournamentId), updatedFields, { merge: true })
      } catch (err) {
        console.error('Firestore tournament update error:', err)
      }
    }

    const trns = this.getLocal('tournaments')
    const idx = trns.findIndex(t => t.id === tournamentId)
    if (idx !== -1) {
      trns[idx] = { ...trns[idx], ...updatedFields }
      this.setLocal('tournaments', trns)
      return trns[idx]
    }
    return null
  }

  async deleteTournament(tournamentId) {
    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'tournaments', tournamentId))
        const regSnap = await getDocs(query(collection(db, 'tournamentRegistrations'), where('tournamentId', '==', tournamentId)))
        const deletePromises = regSnap.docs.map(d => deleteDoc(doc(db, 'tournamentRegistrations', d.id)))
        await Promise.all(deletePromises)
      } catch (err) {
        console.error('Firestore tournament delete error:', err)
      }
    }

    const trns = this.getLocal('tournaments').filter(t => t.id !== tournamentId)
    this.setLocal('tournaments', trns)

    const regs = this.getLocal('tournamentRegistrations').filter(r => r.tournamentId !== tournamentId)
    this.setLocal('tournamentRegistrations', regs)

    return true
  }

  async getTournamentRegistrations() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'tournamentRegistrations'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('tournamentRegistrations', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore tournament registrations fetch fallback:', err)
      }
    }
    return this.getLocal('tournamentRegistrations')
  }

  async registerStudentForTournament(registrationData) {
    const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}`
    const newReg = {
      id: regId,
      ...registrationData,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'Pending'
    }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'tournamentRegistrations', regId), newReg)
      } catch (err) {
        console.error('Firestore registration error:', err)
      }
    }

    const regs = this.getLocal('tournamentRegistrations')
    regs.unshift(newReg)
    this.setLocal('tournamentRegistrations', regs)

    // Increment registered count in tournament
    const tourneys = this.getLocal('tournaments')
    const tIdx = tourneys.findIndex(t => t.id === registrationData.tournamentId)
    if (tIdx !== -1) {
      tourneys[tIdx].registeredCount = (tourneys[tIdx].registeredCount || 0) + 1
      this.setLocal('tournaments', tourneys)
    }

    return newReg
  }

  async cancelTournamentRegistration(registrationId) {
    const regs = this.getLocal('tournamentRegistrations')
    const target = regs.find(r => r.id === registrationId)

    if (this.useFirebase) {
      try {
        await deleteDoc(doc(db, 'tournamentRegistrations', registrationId))
      } catch (err) {
        console.error('Firestore registration cancel error:', err)
      }
    }

    const updated = regs.filter(r => r.id !== registrationId)
    this.setLocal('tournamentRegistrations', updated)

    if (target) {
      const tourneys = this.getLocal('tournaments')
      const tIdx = tourneys.findIndex(t => t.id === target.tournamentId)
      if (tIdx !== -1 && tourneys[tIdx].registeredCount > 0) {
        tourneys[tIdx].registeredCount -= 1
        this.setLocal('tournaments', tourneys)
      }
    }

    return true
  }

  // --- ACHIEVEMENTS ---
  async getAchievements() {
    if (this.useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'achievements'))
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          this.setLocal('achievements', items)
          return items
        }
      } catch (err) {
        console.warn('Firestore achievements fetch fallback:', err)
      }
    }
    return this.getLocal('achievements')
  }

  async addAchievement(achData) {
    const id = `ACH-${Math.floor(3000 + Math.random() * 999)}`
    const newAch = { id, ...achData, date: achData.date || new Date().toISOString().split('T')[0] }

    if (this.useFirebase) {
      try {
        await setDoc(doc(db, 'achievements', id), newAch)
      } catch (err) {
        console.error('Firestore achievement add error:', err)
      }
    }

    const achs = this.getLocal('achievements')
    achs.unshift(newAch)
    this.setLocal('achievements', achs)
    return newAch
  }

  // --- ANALYTICS SUMMARY DOCUMENT ---
  async getAnalyticsSummary() {
    if (this.useFirebase) {
      try {
        const snap = await getDoc(doc(db, 'analytics', 'dashboard'))
        if (snap.exists()) {
          const data = snap.data()
          this.setLocal('analytics_summary', data)
          return data
        }
      } catch (err) {
        console.warn('Firestore analytics summary fetch fallback:', err)
      }
    }

    const students = this.getLocal('students') || []
    const payments = this.getLocal('payments') || []
    const queries = this.getLocal('queries') || []
    const tourneys = this.getLocal('tournaments') || []

    const totalStudents = students.filter(s => s.status === 'Active').length
    const pendingPayments = payments.filter(p => p.status === 'Pending Approval').length
    const totalRevenue = payments.filter(p => p.status === 'Approved').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const openQueries = queries.filter(q => q.status === 'Open' || q.status === 'In Progress').length
    const tournamentCount = tourneys.length

    const summary = { totalStudents, pendingPayments, totalRevenue, openQueries, tournamentCount }
    this.setLocal('analytics_summary', summary)

    if (this.useFirebase) {
      setDoc(doc(db, 'analytics', 'dashboard'), summary, { merge: true }).catch(() => {})
    }
    return summary
  }
}

export const dbService = new DatabaseService()
