import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging'
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDWOfMz2MsAN2Zb5RZRyn-hznMGPrDKtP8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chatting-f6db0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chatting-f6db0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chatting-f6db0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "991102743547",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:991102743547:web:60f870ef57ed38d914115e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KF03PS48Y2"
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Initialize Firestore with standard stable client state
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics instance
export let analytics = null
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(err => console.log('Analytics not supported in current environment', err))
}

// Messaging instance (Async support check for PWAs)
export let messaging = null
if (typeof window !== 'undefined') {
  isMessagingSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app)
    }
  }).catch(err => console.log('Messaging not supported in current environment', err))
}

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

export default app
