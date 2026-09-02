const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

// 1. Automated Monthly Payment Reminder Schedule
exports.scheduledMonthlyFeeReminder = functions.pubsub
  .schedule('0 9 1,5,10,15 * *') // Triggers at 9:00 AM on 1st, 5th, 10th, and 15th
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    const studentsSnap = await admin.firestore().collection('students').where('status', '==', 'Active').get()
    const paymentsSnap = await admin.firestore().collection('payments').where('month', '==', currentMonth).get()

    const paidStudentIds = new Set()
    paymentsSnap.forEach(doc => {
      if (doc.data().status === 'Approved') {
        paidStudentIds.add(doc.data().studentId)
      }
    })

    const unpaidStudents = []
    studentsSnap.forEach(doc => {
      if (!paidStudentIds.has(doc.id)) {
        unpaidStudents.push({ id: doc.id, ...doc.data() })
      }
    })

    console.log(`Sending payment reminders to ${unpaidStudents.length} unpaid students for ${currentMonth}`)

    for (const student of unpaidStudents) {
      if (student.fcmToken) {
        await admin.messaging().send({
          token: student.fcmToken,
          notification: {
            title: 'Dragon Academy Fee Reminder',
            body: `Hi ${student.fullName}, your monthly fee for ${currentMonth} is pending. Please pay via UPI.`
          }
        }).catch(err => console.error('FCM send error:', err))
      }
    }
  })

// 2. Trigger on New Student Query -> Notify Admins
exports.onNewQueryCreated = functions.firestore
  .document('queries/{queryId}')
  .onCreate(async (snap, context) => {
    const queryData = snap.data()
    console.log(`New query created by ${queryData.studentName}: ${queryData.title}`)

    // Notify all admins via Firestore notification entry
    await admin.firestore().collection('notifications').add({
      title: `New Query: ${queryData.title}`,
      message: `${queryData.studentName} asked: "${queryData.description.substring(0, 100)}..."`,
      type: 'Query Alert',
      target: 'Admins',
      date: new Date().toISOString(),
      sentBy: 'System Automation'
    })
  })

// 3. Trigger on Payment Status Update -> Notify Student
exports.onPaymentStatusChanged = functions.firestore
  .document('payments/{paymentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()

    if (before.status !== after.status) {
      console.log(`Payment ${after.id} status changed to ${after.status}`)
      await admin.firestore().collection('notifications').add({
        title: `Payment ${after.status}`,
        message: `Your fee payment for ${after.month} has been ${after.status.toLowerCase()} by ${after.approvedBy || 'Admin'}.`,
        type: 'Payment Update',
        target: after.studentId,
        date: new Date().toISOString(),
        sentBy: 'System Automation'
      })
    }
  })
