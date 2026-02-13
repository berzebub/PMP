import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDdNU8f7biSzE9XCWl9a-FdzKj1RS2UFZE",
  authDomain: "edutask-4d90b.firebaseapp.com",
  projectId: "edutask-4d90b",
  storageBucket: "edutask-4d90b.firebasestorage.app",
  messagingSenderId: "279770463915",
  appId: "1:279770463915:web:0ab6c2925c196266f041ee",
  measurementId: "G-8E03RMNLF3"
};

// VAPID key for FCM web push — generate from Firebase Console > Project Settings > Cloud Messaging
export const VAPID_KEY = 'BGnr0mIl3FrlMQuHnea_zlk2RNVjkLr9CRUZ-6OiuYP4bKUYwxRJ0CVik_Mx2kRoBvlWYFQNCdVBHLmfSHxUmao'

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Storage
export const storage = getStorage(app)

// Initialize Firebase Cloud Messaging (lazy loaded — dynamic import to avoid
// crashing on browsers that don't support the Push API, e.g. iOS Safari)
let _messaging = null
export const getMessagingInstance = async () => {
  if (_messaging) return _messaging
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging')
    const supported = await isSupported()
    if (supported) {
      _messaging = getMessaging(app)
    }
  } catch (e) {
    console.warn('Firebase Messaging is not supported in this browser:', e)
  }
  return _messaging
}

export default app
