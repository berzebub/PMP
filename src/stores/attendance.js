import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'

export const useAttendanceStore = defineStore('attendance', () => {
  const loading = ref(false)
  const records = ref([])
  const error = ref(null)

  /**
   * Check for existing attendance records for given users in a specific month
   * @param {string[]} userIds - array of user emails
   * @param {string} yearMonth - format YYYY-MM
   * @returns {Object} { [userId]: count }
   */
  const checkDuplicates = async (userIds, yearMonth) => {
    if (!userIds.length || !yearMonth) return {}

    try {
      const duplicates = {}
      // Query in batches of 10 (Firestore 'in' limit is 30, but keep batches small)
      const batchSize = 10
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)
        const q = query(
          collection(db, 'attendance'),
          where('userId', 'in', batch),
          where('importMonth', '==', yearMonth)
        )
        const snap = await getDocs(q)
        snap.forEach(d => {
          const data = d.data()
          if (!duplicates[data.userId]) duplicates[data.userId] = 0
          duplicates[data.userId]++
        })
      }
      return duplicates
    } catch (err) {
      console.error('Error checking duplicates:', err)
      return {}
    }
  }

  /**
   * Delete all attendance records for a user in a specific month
   */
  const deleteMonthAttendance = async (userId, yearMonth) => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('importMonth', '==', yearMonth)
      )
      const snap = await getDocs(q)
      const batch = writeBatch(db)
      snap.forEach(d => batch.delete(d.ref))
      await batch.commit()
      return true
    } catch (err) {
      console.error('Error deleting month attendance:', err)
      return false
    }
  }

  /**
   * Import attendance records with duplicate handling
   * @param {Array} attendanceRecords - array of records to import
   * @param {string[]} overwriteUserIds - user IDs to overwrite (delete existing first)
   * @returns {{ success: number, errors: string[] }}
   */
  const importAttendance = async (attendanceRecords, overwriteUserIds = []) => {
    if (!attendanceRecords.length) return { success: 0, errors: [] }

    loading.value = true
    error.value = null
    const errors = []
    let successCount = 0

    try {
      // Delete existing records for overwrite users
      for (const userId of overwriteUserIds) {
        const yearMonth = attendanceRecords.find(r => r.userId === userId)?.importMonth
        if (yearMonth) {
          await deleteMonthAttendance(userId, yearMonth)
        }
      }

      // Batch write (Firestore limit: 500 per batch)
      const batchSize = 450
      for (let i = 0; i < attendanceRecords.length; i += batchSize) {
        const chunk = attendanceRecords.slice(i, i + batchSize)
        const batch = writeBatch(db)

        for (const record of chunk) {
          const docRef = doc(collection(db, 'attendance'))
          batch.set(docRef, {
            userId: record.userId,
            userName: record.userName || '',
            punchId: record.punchId || '',
            date: record.date,
            punchIn: record.punchIn || null,
            punchOut: record.punchOut || null,
            department: record.department || '',
            shift: record.shift || '',
            importedAt: Timestamp.now(),
            importedBy: record.importedBy || '',
            importMonth: record.importMonth || ''
          })
        }

        try {
          await batch.commit()
          successCount += chunk.length
        } catch (err) {
          console.error('Batch write error:', err)
          errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${err.message}`)
        }
      }
    } catch (err) {
      console.error('Import error:', err)
      errors.push(err.message)
    } finally {
      loading.value = false
    }

    return { success: successCount, errors }
  }

  /**
   * Fetch monthly attendance for a specific user
   */
  const fetchMonthlyAttendance = async (userId, yearMonth) => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('importMonth', '==', yearMonth)
      )
      const snap = await getDocs(q)
      records.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return records.value
    } catch (err) {
      console.error('Error fetching attendance:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all attendance for a month (HR/admin view)
   */
  const fetchAllMonthlyAttendance = async (yearMonth) => {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'attendance'),
        where('importMonth', '==', yearMonth)
      )
      const snap = await getDocs(q)
      records.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return records.value
    } catch (err) {
      console.error('Error fetching all attendance:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    records,
    error,
    checkDuplicates,
    deleteMonthAttendance,
    importAttendance,
    fetchMonthlyAttendance,
    fetchAllMonthlyAttendance
  }
})
