import { ref } from 'vue'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'
import { db, VAPID_KEY, getMessagingInstance } from 'boot/firebase'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

// Shared state across components
const pushPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')
const fcmToken = ref(null)
const isRegistering = ref(false)

export function usePushNotifications () {
  const $q = useQuasar()
  const authStore = useAuthStore()

  /**
   * Check if push notifications are supported in this browser
   */
  const isSupported = () => {
    return typeof Notification !== 'undefined' && 'serviceWorker' in navigator
  }

  /**
   * Request notification permission and register FCM token
   */
  const requestPermissionAndRegister = async () => {
    if (!isSupported()) {
      console.warn('Push notifications are not supported in this browser')
      return false
    }

    if (!authStore.user?.email) {
      console.warn('User must be logged in to register for push notifications')
      return false
    }

    isRegistering.value = true

    try {
      // Request browser notification permission
      const permission = await Notification.requestPermission()
      pushPermission.value = permission

      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return false
      }

      // Get the messaging instance (lazy loaded)
      const messaging = await getMessagingInstance()
      if (!messaging) {
        console.warn('Firebase Messaging not available on this device')
        return false
      }

      // Dynamically import firebase/messaging functions
      const { getToken } = await import('firebase/messaging')

      // Register the FCM service worker with a dedicated scope
      // (must NOT be '/' to avoid replacing the Quasar PWA service worker)
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      })

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      })

      if (token) {
        fcmToken.value = token
        await saveTokenToFirestore(token)
        console.log('FCM token registered successfully')
        return true
      } else {
        console.warn('No FCM token received')
        return false
      }
    } catch (err) {
      console.error('Error registering push notifications:', err)
      $q.notify({
        type: 'negative',
        message: 'ไม่สามารถเปิดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง',
        position: 'top'
      })
      return false
    } finally {
      isRegistering.value = false
    }
  }

  /**
   * Save FCM token to Firestore
   */
  const saveTokenToFirestore = async (token) => {
    const email = authStore.user?.email
    if (!email || !token) return

    try {
      // Check if this token already exists
      const q = query(
        collection(db, 'fcmTokens'),
        where('email', '==', email),
        where('token', '==', token)
      )
      const existing = await getDocs(q)

      if (existing.empty) {
        await addDoc(collection(db, 'fcmTokens'), {
          email,
          token,
          createdAt: Timestamp.now(),
          userAgent: navigator.userAgent.substring(0, 200)
        })
      }
    } catch (err) {
      console.error('Error saving FCM token:', err)
    }
  }

  /**
   * Remove all FCM tokens for the current user (on logout)
   */
  const unregisterToken = async () => {
    const email = authStore.user?.email

    try {
      // Delete token from FCM
      const messaging = await getMessagingInstance()
      if (messaging && fcmToken.value) {
        const { deleteToken } = await import('firebase/messaging')
        await deleteToken(messaging)
      }

      // Remove from Firestore
      if (email) {
        const q = query(
          collection(db, 'fcmTokens'),
          where('email', '==', email)
        )
        const snap = await getDocs(q)
        const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'fcmTokens', d.id)))
        await Promise.all(deletePromises)
      }

      fcmToken.value = null
    } catch (err) {
      console.error('Error unregistering FCM token:', err)
    }
  }

  /**
   * Set up foreground message handler
   * Shows a Quasar notification toast when a push arrives while the app is open
   */
  const setupForegroundHandler = async () => {
    const messaging = await getMessagingInstance()
    if (!messaging) return

    const { onMessage } = await import('firebase/messaging')

    onMessage(messaging, (payload) => {
      console.log('Foreground FCM message received:', payload)

      const { title, body } = payload.notification || {}
      const data = payload.data || {}

      $q.notify({
        message: title || 'การแจ้งเตือนใหม่',
        caption: body || '',
        color: 'dark',
        position: 'top-right',
        icon: data.type === 'mention' ? 'alternate_email'
          : data.type === 'assign' ? 'person_add'
          : ['expense_submitted', 'expense_rejected', 'expense_approved', 'expense_paid'].includes(data.type) ? 'receipt_long'
          : ['leave_submitted', 'leave_approved', 'leave_rejected'].includes(data.type) ? 'event_available'
          : 'notifications',
        timeout: 5000,
        actions: [
          { label: 'ดู', color: 'yellow', handler: () => { /* navigation handled by the notification store */ } },
          { label: 'ปิด', color: 'white' }
        ]
      })
    })
  }

  /**
   * Initialize push notifications (call after login)
   */
  const initPushNotifications = async () => {
    if (!isSupported()) return

    // If already granted, silently register token
    if (Notification.permission === 'granted') {
      await requestPermissionAndRegister()
    }

    // Always set up the foreground handler
    await setupForegroundHandler()
  }

  return {
    // State
    pushPermission,
    fcmToken,
    isRegistering,
    // Methods
    isSupported,
    requestPermissionAndRegister,
    unregisterToken,
    setupForegroundHandler,
    initPushNotifications
  }
}
