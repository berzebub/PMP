import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  const pendingOpenTaskId = ref(null)
  let unsubscribe = null

  const authStore = useAuthStore()

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB - dateA
    })
  })

  // Subscribe to user's notifications in real-time
  const subscribeToNotifications = () => {
    if (!authStore.user?.email) return

    if (unsubscribe) {
      unsubscribe()
    }

    loading.value = true

    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', authStore.user.email),
      orderBy('createdAt', 'desc')
    )

    unsubscribe = onSnapshot(q, (snapshot) => {
      notifications.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (err) => {
      console.error('Error subscribing to notifications:', err)
      loading.value = false
    })
  }

  // Create a notification
  const createNotification = async ({ recipientEmail, type, title, message, projectId, projectName, taskId, taskTitle, senderEmail, senderName }) => {
    try {
      // Don't notify yourself
      if (recipientEmail === authStore.user?.email) return

      await addDoc(collection(db, 'notifications'), {
        recipientEmail,
        type, // 'mention' | 'assign' | 'task_update' etc.
        title,
        message,
        projectId: projectId || null,
        projectName: projectName || null,
        taskId: taskId || null,
        taskTitle: taskTitle || null,
        senderEmail: senderEmail || authStore.user?.email,
        senderName: senderName || authStore.user?.displayName || authStore.user?.email?.split('@')[0],
        read: false,
        createdAt: Timestamp.now()
      })
    } catch (err) {
      console.error('Error creating notification:', err)
    }
  }

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId)
      await updateDoc(notifRef, { read: true })
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db)
      notifications.value
        .filter(n => !n.read)
        .forEach(n => {
          const notifRef = doc(db, 'notifications', n.id)
          batch.update(notifRef, { read: true })
        })
      await batch.commit()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  // Cleanup
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    notifications.value = []
  }

  return {
    notifications,
    loading,
    pendingOpenTaskId,
    unreadCount,
    sortedNotifications,
    subscribeToNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    cleanup
  }
})
