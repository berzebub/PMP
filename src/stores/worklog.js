import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { db, storage } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useWorklogStore = defineStore('worklog', () => {
  const todayLog = ref(null)
  const myLogs = ref([])
  const teamLogs = ref([])
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0) // 0-100
  const error = ref(null)

  const authStore = useAuthStore()

  // Helper: get date string in YYYY-MM-DD format (local timezone)
  const getDateStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getTodayDateStr = () => getDateStr(new Date())

  // Computed
  const hasSubmittedToday = computed(() => !!todayLog.value)

  // Fetch today's work log
  const fetchTodayLog = async () => {
    if (!authStore.user?.email) return

    try {
      const todayStr = getTodayDateStr()
      const q = query(
        collection(db, 'worklogs'),
        where('userId', '==', authStore.user.email),
        where('date', '==', todayStr),
        limit(1)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        todayLog.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      } else {
        todayLog.value = null
      }
    } catch (err) {
      console.error('Error fetching today worklog:', err)
    }
  }

  // --- File Attachment Helpers ---
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB per file
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

  // Upload files to Firebase Storage and return attachment metadata array
  const uploadAttachments = async (files, userId, date) => {
    const results = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `worklogs/${userId}/${date}/${timestamp}_${safeName}`
      const fileRef = storageRef(storage, path)

      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)

      results.push({
        name: file.name,
        url,
        size: file.size,
        type: file.type,
        path
      })

      // Update progress
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    }
    return results
  }

  // Delete a single attachment from Firebase Storage
  const deleteAttachment = async (storagePath) => {
    try {
      const fileRef = storageRef(storage, storagePath)
      await deleteObject(fileRef)
    } catch (err) {
      console.error('Error deleting attachment:', err)
      // Don't throw — file may already be deleted
    }
  }

  // Submit or update today's work log
  const submitLog = async ({ entries, summary = '', newFiles = [], existingAttachments = [] }) => {
    if (!authStore.user?.email) return false

    try {
      loading.value = true
      error.value = null

      const todayStr = getTodayDateStr()
      // Filter out empty entries
      const cleanEntries = entries.filter(e => e.trim() !== '')

      if (cleanEntries.length === 0) {
        error.value = 'กรุณาเพิ่มรายการอย่างน้อย 1 รายการ'
        return false
      }

      // Upload new files if any
      let uploadedAttachments = []
      if (newFiles.length > 0) {
        uploading.value = true
        uploadProgress.value = 0
        uploadedAttachments = await uploadAttachments(newFiles, authStore.user.email, todayStr)
        uploading.value = false
      }

      // Merge existing + newly uploaded attachments
      const allAttachments = [...existingAttachments, ...uploadedAttachments]

      if (todayLog.value) {
        // Update existing
        const logRef = doc(db, 'worklogs', todayLog.value.id)
        const updateData = {
          entries: cleanEntries,
          summary: summary.trim(),
          attachments: allAttachments,
          updatedAt: Timestamp.now()
        }
        await updateDoc(logRef, updateData)
        todayLog.value = { ...todayLog.value, ...updateData }
      } else {
        // Create new
        const logData = {
          userId: authStore.user.email,
          userName: authStore.user.displayName || authStore.user.email.split('@')[0],
          date: todayStr,
          entries: cleanEntries,
          summary: summary.trim(),
          attachments: allAttachments,
          submittedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
        const docRef = await addDoc(collection(db, 'worklogs'), logData)
        todayLog.value = { id: docRef.id, ...logData }
      }

      return true
    } catch (err) {
      console.error('Error submitting worklog:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch personal work log history
  const fetchMyLogs = async (days = 30) => {
    if (!authStore.user?.email) return

    try {
      loading.value = true
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startStr = getDateStr(startDate)

      const q = query(
        collection(db, 'worklogs'),
        where('userId', '==', authStore.user.email),
        where('date', '>=', startStr),
        orderBy('date', 'desc')
      )

      const snapshot = await getDocs(q)
      myLogs.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching my worklogs:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch all team work logs for a specific date
  const fetchTeamLogs = async (dateStr) => {
    try {
      loading.value = true
      const targetDate = dateStr || getTodayDateStr()

      const q = query(
        collection(db, 'worklogs'),
        where('date', '==', targetDate)
      )

      const snapshot = await getDocs(q)
      teamLogs.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching team worklogs:', err)
    } finally {
      loading.value = false
    }
  }

  // Add a single auto-generated entry to today's worklog (fire-and-forget from callers)
  const addAutoEntry = async (text) => {
    if (!authStore.user?.email || !text) return false
    try {
      await fetchTodayLog() // ensure fresh state
      const todayStr = getTodayDateStr()
      if (todayLog.value) {
        const updatedEntries = [...todayLog.value.entries, text]
        const logRef = doc(db, 'worklogs', todayLog.value.id)
        await updateDoc(logRef, { entries: updatedEntries, updatedAt: Timestamp.now() })
        todayLog.value = { ...todayLog.value, entries: updatedEntries }
      } else {
        const logData = {
          userId: authStore.user.email,
          userName: authStore.user.displayName || authStore.user.email.split('@')[0],
          date: todayStr,
          entries: [text],
          summary: '',
          submittedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
        const docRef = await addDoc(collection(db, 'worklogs'), logData)
        todayLog.value = { id: docRef.id, ...logData }
      }
      return true
    } catch (err) {
      console.error('Error adding auto entry to worklog:', err)
      return false
    }
  }

  // Cleanup
  const cleanup = () => {
    todayLog.value = null
    myLogs.value = []
    teamLogs.value = []
  }

  return {
    todayLog,
    myLogs,
    teamLogs,
    loading,
    uploading,
    uploadProgress,
    error,
    hasSubmittedToday,
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    getTodayDateStr,
    getDateStr,
    fetchTodayLog,
    submitLog,
    deleteAttachment,
    fetchMyLogs,
    fetchTeamLogs,
    addAutoEntry,
    cleanup
  }
})
