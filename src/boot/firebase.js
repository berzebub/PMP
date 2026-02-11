import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdNU8f7biSzE9XCWl9a-FdzKj1RS2UFZE",
  authDomain: "edutask-4d90b.firebaseapp.com",
  projectId: "edutask-4d90b",
  storageBucket: "edutask-4d90b.firebasestorage.app",
  messagingSenderId: "279770463915",
  appId: "1:279770463915:web:0ab6c2925c196266f041ee",
  measurementId: "G-8E03RMNLF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Storage
export const storage = getStorage(app)

export default app
