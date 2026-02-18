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
  getDocs,
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

  // Send admin broadcast notification
  // target: { type: 'all' } | { type: 'department', department: string } | { type: 'individual', emails: string[] }
  const sendAdminNotification = async ({ target, title, message, imageURL }) => {
    try {
      loading.value = true

      // Resolve recipient emails based on target type
      let recipientEmails = []

      if (target.type === 'individual') {
        recipientEmails = target.emails || []
      } else {
        // Fetch all profiles to resolve recipients
        const profilesSnap = await getDocs(collection(db, 'profiles'))
        const allProfiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        if (target.type === 'all') {
          recipientEmails = allProfiles.map(p => p.email || p.id)
        } else if (target.type === 'department') {
          recipientEmails = allProfiles
            .filter(p => p.department === target.department)
            .map(p => p.email || p.id)
        }
      }

      // Remove sender from recipients
      const senderEmail = authStore.user?.email
      recipientEmails = recipientEmails.filter(e => e && e !== senderEmail)

      if (recipientEmails.length === 0) {
        loading.value = false
        return { success: 0, total: 0 }
      }

      // Batch write notifications (Firestore batch limit = 500)
      const batchSize = 500
      let successCount = 0

      for (let i = 0; i < recipientEmails.length; i += batchSize) {
        const batch = writeBatch(db)
        const chunk = recipientEmails.slice(i, i + batchSize)

        for (const email of chunk) {
          const notifRef = doc(collection(db, 'notifications'))
          batch.set(notifRef, {
            recipientEmail: email,
            type: 'admin_broadcast',
            title: title || 'ประกาศจากผู้ดูแลระบบ',
            message,
            imageURL: imageURL || null,
            projectId: null,
            projectName: null,
            taskId: null,
            taskTitle: null,
            senderEmail,
            senderName: authStore.fullName || senderEmail?.split('@')[0],
            read: false,
            createdAt: Timestamp.now()
          })
        }

        await batch.commit()
        successCount += chunk.length
      }

      loading.value = false
      return { success: successCount, total: recipientEmails.length }
    } catch (err) {
      console.error('Error sending admin notification:', err)
      loading.value = false
      throw err
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
    sendAdminNotification,
    markAsRead,
    markAllAsRead,
    cleanup
  }
})
