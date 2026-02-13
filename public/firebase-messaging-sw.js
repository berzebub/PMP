/* eslint-env serviceworker */
/* global firebase */

// Firebase Messaging Service Worker
// This handles push notifications when the app is in the background or closed.

importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDdNU8f7biSzE9XCWl9a-FdzKj1RS2UFZE',
  authDomain: 'edutask-4d90b.firebaseapp.com',
  projectId: 'edutask-4d90b',
  storageBucket: 'edutask-4d90b.firebasestorage.app',
  messagingSenderId: '279770463915',
  appId: '1:279770463915:web:0ab6c2925c196266f041ee'
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message received:', payload)

  const { title, body } = payload.notification || {}
  const data = payload.data || {}

  const notificationTitle = title || 'การแจ้งเตือนใหม่'
  const notificationOptions = {
    body: body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    data: {
      type: data.type || '',
      notifId: data.notifId || '',
      projectId: data.projectId || '',
      url: data.url || '/'
    },
    // Vibrate pattern for mobile
    vibrate: [200, 100, 200],
    // Tag to replace existing notifications of the same type
    tag: data.type || 'default'
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click — open or focus the app and navigate
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event.notification)
  event.notification.close()

  const data = event.notification.data || {}
  let targetUrl = '/'

  // Determine navigation target based on notification type
  if (data.url) {
    targetUrl = data.url
  } else if (['expense_submitted', 'expense_rejected', 'expense_approved', 'expense_paid'].includes(data.type)) {
    targetUrl = '/#/expenses'
  } else if (['leave_approved', 'leave_rejected'].includes(data.type)) {
    targetUrl = '/#/leave'
  } else if (data.projectId) {
    targetUrl = `/#/project/${data.projectId}`
  }

  // Try to focus an existing window or open a new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
            url: targetUrl
          })
          return
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
