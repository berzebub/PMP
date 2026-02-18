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
  Timestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useExpenseStore = defineStore('expense', () => {
  const myExpenses = ref([])
  const allExpenses = ref([])
  const pendingExpenses = ref([])
  const reportExpenses = ref([])
  const submitting = ref(false)
  const fetching = ref(false)
  const processing = ref(false)
  const loading = computed(() => submitting.value || fetching.value || processing.value)
  const error = ref(null)

  const authStore = useAuthStore()

  // Status labels
  const statusLabels = {
    pending_hr: { label: 'รอ HR ตรวจสอบ', color: '#ce93d8', icon: 'hourglass_empty' },
    pending_ceo: { label: 'รอ CEO อนุมัติ', color: '#ffb74d', icon: 'hourglass_top' },
    approved: { label: 'CEO อนุมัติแล้ว', color: '#42a5f5', icon: 'verified' },
    paid: { label: 'จ่ายเงินแล้ว', color: '#66bb6a', icon: 'check_circle' },
    rejected: { label: 'ไม่อนุมัติ', color: '#ef5350', icon: 'cancel' },
    cancelled: { label: 'ยกเลิกแล้ว', color: '#9e9e9e', icon: 'block' }
  }

  // Computed: pending count for my expenses
  const myPendingCount = computed(() => {
    return myExpenses.value.filter(e =>
      e.status === 'pending_hr' || e.status === 'approved'
    ).length
  })

  // Computed: pending HR action count
  const pendingActionCount = computed(() => pendingExpenses.value.length)

  // Upload receipt file to Storage
  const uploadReceipt = async (expenseId, seq, file) => {
    try {
      const fileRef = storageRef(storage, `expenses/${expenseId}/receipt-${seq}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      return url
    } catch (err) {
      console.error('Error uploading receipt:', err)
      return ''
    }
  }

  // Submit expense request
  const submitExpense = async ({ items, note = '', receiptFiles = {}, receiveMethod = '', promptPayPhone = '', bankName = '', accountNumber = '', accountName = '' }) => {
    if (!authStore.user?.email) return false

    try {
      submitting.value = true
      error.value = null

      const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

      // Prepare items without files first
      const cleanItems = items.map((item, idx) => ({
        seq: idx + 1,
        description: item.description.trim(),
        amount: Number(item.amount) || 0,
        receiptURL: ''
      }))

      const expenseData = {
        userId: authStore.user.email,
        userName: authStore.fullName || authStore.user.email.split('@')[0],
        firstName: authStore.profile.firstName || '',
        lastName: authStore.profile.lastName || '',
        department: authStore.profile.department || '',
        items: cleanItems,
        totalAmount,
        note: note.trim(),
        receiveMethod: receiveMethod || '',
        promptPayPhone: (promptPayPhone || '').trim(),
        bankName: (bankName || '').trim(),
        accountNumber: (accountNumber || '').trim(),
        accountName: (accountName || '').trim(),
        status: 'pending_hr',
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        hrReviewedBy: '',
        hrReviewedByName: '',
        hrReviewedAt: null,
        ceoApprovedAt: null,
        ceoMarkedBy: '',
        paymentMethod: '',
        paymentSlipURL: '',
        paymentNote: '',
        paidAt: null,
        paidBy: '',
        paidByName: '',
        rejectedBy: '',
        rejectedByName: '',
        rejectionReason: '',
        rejectedAt: null
      }

      const docRef = await addDoc(collection(db, 'expenses'), expenseData)

      // Upload receipt files if any
      let hasUploads = false
      for (const [seqKey, file] of Object.entries(receiptFiles)) {
        if (file) {
          const url = await uploadReceipt(docRef.id, seqKey, file)
          if (url) {
            const itemIdx = cleanItems.findIndex(i => i.seq === Number(seqKey))
            if (itemIdx !== -1) {
              cleanItems[itemIdx].receiptURL = url
              hasUploads = true
            }
          }
        }
      }

      // Update doc with receipt URLs if any were uploaded
      if (hasUploads) {
        await updateDoc(doc(db, 'expenses', docRef.id), { items: cleanItems })
        expenseData.items = cleanItems
      }

      myExpenses.value.unshift({ id: docRef.id, ...expenseData })
      return docRef.id
    } catch (err) {
      console.error('Error submitting expense:', err)
      error.value = err.message
      return false
    } finally {
      submitting.value = false
    }
  }

  // Cancel expense (only if pending_hr)
  const cancelExpense = async (expenseId) => {
    const expense = myExpenses.value.find(e => e.id === expenseId)
    if (expense && expense.status !== 'pending_hr') return false

    try {
      processing.value = true
      await updateDoc(doc(db, 'expenses', expenseId), {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      })
      const idx = myExpenses.value.findIndex(e => e.id === expenseId)
      if (idx !== -1) myExpenses.value[idx].status = 'cancelled'
      pendingExpenses.value = pendingExpenses.value.filter(e => e.id !== expenseId)
      return true
    } catch (err) {
      console.error('Error cancelling expense:', err)
      return false
    } finally {
      processing.value = false
    }
  }

  // HR: Mark as pending CEO (pending_hr -> pending_ceo)
  const markPendingCEO = async (expenseId) => {
    try {
      processing.value = true
      await updateDoc(doc(db, 'expenses', expenseId), {
        status: 'pending_ceo',
        hrReviewedBy: authStore.user.email,
        hrReviewedByName: authStore.fullName,
        hrReviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      // Update local
      const idx = pendingExpenses.value.findIndex(e => e.id === expenseId)
      if (idx !== -1) {
        pendingExpenses.value[idx].status = 'pending_ceo'
        pendingExpenses.value[idx].hrReviewedByName = authStore.fullName
      }
      return true
    } catch (err) {
      console.error('Error marking pending CEO:', err)
      return false
    } finally {
      processing.value = false
    }
  }

  // HR: Mark CEO approved (pending_hr -> approved)
  const markCEOApproved = async (expenseId) => {
    try {
      processing.value = true
      await updateDoc(doc(db, 'expenses', expenseId), {
        status: 'approved',
        hrReviewedBy: authStore.user.email,
        hrReviewedByName: authStore.fullName,
        hrReviewedAt: Timestamp.now(),
        ceoApprovedAt: Timestamp.now(),
        ceoMarkedBy: authStore.user.email,
        updatedAt: Timestamp.now()
      })
      const idx = pendingExpenses.value.findIndex(e => e.id === expenseId)
      if (idx !== -1) pendingExpenses.value[idx].status = 'approved'
      return true
    } catch (err) {
      console.error('Error marking CEO approved:', err)
      return false
    } finally {
      processing.value = false
    }
  }

  // HR: Mark as paid (approved -> paid)
  const markPaid = async (expenseId, { method, slipFile, note }) => {
    try {
      processing.value = true

      let slipURL = ''
      if (slipFile) {
        const fileRef = storageRef(storage, `expenses/${expenseId}/payment-slip`)
        await uploadBytes(fileRef, slipFile)
        slipURL = await getDownloadURL(fileRef)
      }

      await updateDoc(doc(db, 'expenses', expenseId), {
        status: 'paid',
        paymentMethod: method,
        paymentSlipURL: slipURL,
        paymentNote: (note || '').trim(),
        paidAt: Timestamp.now(),
        paidBy: authStore.user.email,
        paidByName: authStore.fullName,
        updatedAt: Timestamp.now()
      })

      pendingExpenses.value = pendingExpenses.value.filter(e => e.id !== expenseId)
      return true
    } catch (err) {
      console.error('Error marking paid:', err)
      return false
    } finally {
      processing.value = false
    }
  }

  // HR: Reject expense
  const rejectExpense = async (expenseId, reason = '') => {
    try {
      processing.value = true
      await updateDoc(doc(db, 'expenses', expenseId), {
        status: 'rejected',
        rejectedBy: authStore.user.email,
        rejectedByName: authStore.fullName,
        rejectionReason: reason.trim(),
        rejectedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      pendingExpenses.value = pendingExpenses.value.filter(e => e.id !== expenseId)
      return true
    } catch (err) {
      console.error('Error rejecting expense:', err)
      return false
    } finally {
      processing.value = false
    }
  }

  // Fetch my expenses
  const fetchMyExpenses = async () => {
    if (!authStore.user?.email) return
    try {
      fetching.value = true
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', authStore.user.email),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      myExpenses.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('Error fetching my expenses:', err)
    } finally {
      fetching.value = false
    }
  }

  // Fetch pending expenses (HR / super_admin)
  const fetchPendingExpenses = async () => {
    if (!authStore.user?.email) return
    const role = authStore.profile.role
    if (role !== 'hr' && role !== 'super_admin') {
      pendingExpenses.value = []
      return
    }

    try {
      fetching.value = true
      // HR sees pending_hr + approved (not yet paid)
      const q = query(
        collection(db, 'expenses'),
        where('status', 'in', ['pending_hr', 'approved']),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      pendingExpenses.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('Error fetching pending expenses:', err)
    } finally {
      fetching.value = false
    }
  }

  // Fetch all expenses (for history/export)
  const fetchAllExpenses = async () => {
    try {
      fetching.value = true
      const q = query(
        collection(db, 'expenses'),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      allExpenses.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('Error fetching all expenses:', err)
    } finally {
      fetching.value = false
    }
  }

  // Fetch expense report with filters (for admin report page)
  const fetchExpenseReport = async ({ mode = 'all', userId = '', department = '', startDate = '', endDate = '' }) => {
    try {
      fetching.value = true
      error.value = null
      reportExpenses.value = []

      const rangeStart = startDate ? Timestamp.fromDate(new Date(startDate + 'T00:00:00')) : Timestamp.fromDate(new Date(`${new Date().getFullYear()}-01-01T00:00:00`))
      const rangeEnd = endDate ? Timestamp.fromDate(new Date(endDate + 'T23:59:59')) : Timestamp.fromDate(new Date(`${new Date().getFullYear()}-12-31T23:59:59`))

      const q = query(
        collection(db, 'expenses'),
        where('submittedAt', '>=', rangeStart),
        where('submittedAt', '<=', rangeEnd),
        orderBy('submittedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      if (mode === 'individual' && userId) {
        results = results.filter(e => e.userId === userId)
      } else if (mode === 'department' && department) {
        results = results.filter(e => e.department === department)
      }

      reportExpenses.value = results
      return reportExpenses.value
    } catch (err) {
      console.error('Error fetching expense report:', err)
      error.value = err.message
      reportExpenses.value = []
      return []
    } finally {
      fetching.value = false
    }
  }

  // Cleanup
  const cleanup = () => {
    myExpenses.value = []
    allExpenses.value = []
    pendingExpenses.value = []
    reportExpenses.value = []
  }

  return {
    myExpenses,
    allExpenses,
    pendingExpenses,
    reportExpenses,
    loading,
    submitting,
    fetching,
    processing,
    error,
    statusLabels,
    myPendingCount,
    pendingActionCount,
    submitExpense,
    cancelExpense,
    markPendingCEO,
    markCEOApproved,
    markPaid,
    rejectExpense,
    fetchMyExpenses,
    fetchPendingExpenses,
    fetchAllExpenses,
    fetchExpenseReport,
    cleanup
  }
})
