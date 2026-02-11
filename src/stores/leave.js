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
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useLeaveStore = defineStore('leave', () => {
  const myLeaves = ref([])
  const teamLeaves = ref([])
  const pendingApprovals = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // Leave types
  const leaveTypes = [
    { value: 'sick', label: 'ลาป่วย', icon: '🤒', color: '#ef5350' },
    { value: 'personal', label: 'ลากิจ', icon: '📋', color: '#ffb74d' },
    { value: 'vacation', label: 'ลาพักร้อน', icon: '🏖️', color: '#42a5f5' }
  ]

  // Status labels (new 2-step flow)
  const statusLabels = {
    pending_head: { label: 'รอหัวหน้าอนุมัติ', color: '#ffb74d', icon: 'hourglass_empty' },
    pending_hr: { label: 'รอ HR อนุมัติ', color: '#ce93d8', icon: 'hourglass_top' },
    approved: { label: 'อนุมัติแล้ว', color: '#66bb6a', icon: 'check_circle' },
    rejected: { label: 'ไม่อนุมัติ', color: '#ef5350', icon: 'cancel' },
    cancelled: { label: 'ยกเลิกแล้ว', color: '#9e9e9e', icon: 'block' }
  }

  // Helper
  const getDateStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // Computed: pending count for my leaves
  const pendingCount = computed(() => {
    return myLeaves.value.filter(l => l.status === 'pending_head' || l.status === 'pending_hr').length
  })

  // Computed: pending approvals count
  const pendingApprovalCount = computed(() => pendingApprovals.value.length)

  // Submit a leave request
  const submitLeave = async ({ firstName, lastName, leaveType, startDate, endDate, details = '' }) => {
    if (!authStore.user?.email) return false

    try {
      loading.value = true
      error.value = null

      const userRole = authStore.profile.role

      // Determine initial status:
      // - sick leave: auto-approved (no approval needed)
      // - head / super_admin: skip head step, go straight to HR
      // - employee: start at pending_head
      let initialStatus
      if (leaveType === 'sick') {
        initialStatus = 'approved'
      } else if (userRole === 'head' || userRole === 'super_admin') {
        initialStatus = 'pending_hr'
      } else {
        initialStatus = 'pending_head'
      }

      // Use profile data as fallback for firstName/lastName
      const finalFirstName = firstName.trim() || authStore.profile.firstName || ''
      const finalLastName = lastName.trim() || authStore.profile.lastName || ''

      const leaveData = {
        userId: authStore.user.email,
        userName: authStore.fullName || authStore.user.email.split('@')[0],
        firstName: finalFirstName,
        lastName: finalLastName,
        leaveType,
        startDate,
        endDate,
        details: details.trim(),
        department: authStore.profile.department || '',
        status: initialStatus,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        headApproval: null,
        hrApproval: null,
        rejectedBy: null,
        rejectionReason: ''
      }

      const docRef = await addDoc(collection(db, 'leaves'), leaveData)
      myLeaves.value.unshift({ id: docRef.id, ...leaveData })

      return true
    } catch (err) {
      console.error('Error submitting leave:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Cancel a leave request (only if pending_head or pending_hr)
  const cancelLeave = async (leaveId) => {
    try {
      loading.value = true
      const leaveRef = doc(db, 'leaves', leaveId)
      await updateDoc(leaveRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      })

      const idx = myLeaves.value.findIndex(l => l.id === leaveId)
      if (idx !== -1) {
        myLeaves.value[idx].status = 'cancelled'
      }
      // Remove from pending approvals if present
      pendingApprovals.value = pendingApprovals.value.filter(l => l.id !== leaveId)
      return true
    } catch (err) {
      console.error('Error cancelling leave:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Head approves (pending_head -> pending_hr)
  const headApprove = async (leaveId) => {
    try {
      loading.value = true
      const leaveRef = doc(db, 'leaves', leaveId)
      const approvalData = {
        approvedBy: authStore.user.email,
        approvedByName: authStore.fullName,
        approvedAt: Timestamp.now(),
        comment: ''
      }
      await updateDoc(leaveRef, {
        status: 'pending_hr',
        headApproval: approvalData,
        updatedAt: Timestamp.now()
      })
      // Remove from pending
      pendingApprovals.value = pendingApprovals.value.filter(l => l.id !== leaveId)
      return true
    } catch (err) {
      console.error('Error head approving:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // HR approves (pending_hr -> approved)
  const hrApprove = async (leaveId) => {
    try {
      loading.value = true
      const leaveRef = doc(db, 'leaves', leaveId)
      const approvalData = {
        approvedBy: authStore.user.email,
        approvedByName: authStore.fullName,
        approvedAt: Timestamp.now(),
        comment: ''
      }
      await updateDoc(leaveRef, {
        status: 'approved',
        hrApproval: approvalData,
        updatedAt: Timestamp.now()
      })
      // Remove from pending
      pendingApprovals.value = pendingApprovals.value.filter(l => l.id !== leaveId)
      return true
    } catch (err) {
      console.error('Error HR approving:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Reject leave (by head or HR)
  const rejectLeave = async (leaveId, reason = '') => {
    try {
      loading.value = true
      const leaveRef = doc(db, 'leaves', leaveId)
      await updateDoc(leaveRef, {
        status: 'rejected',
        rejectedBy: authStore.user.email,
        rejectionReason: reason.trim(),
        updatedAt: Timestamp.now()
      })
      // Remove from pending
      pendingApprovals.value = pendingApprovals.value.filter(l => l.id !== leaveId)
      return true
    } catch (err) {
      console.error('Error rejecting leave:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch my leave requests
  const fetchMyLeaves = async () => {
    if (!authStore.user?.email) return

    try {
      loading.value = true
      const q = query(
        collection(db, 'leaves'),
        where('userId', '==', authStore.user.email),
        orderBy('submittedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      myLeaves.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching my leaves:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch pending approvals for current user's role
  const fetchPendingApprovals = async () => {
    if (!authStore.user?.email) return

    try {
      loading.value = true
      const role = authStore.profile.role
      let q

      if (role === 'head') {
        // Head sees pending_head from their department
        q = query(
          collection(db, 'leaves'),
          where('status', '==', 'pending_head'),
          where('department', '==', authStore.profile.department),
          orderBy('submittedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        pendingApprovals.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      } else if (role === 'super_admin') {
        // Super admin approves as head role: sees pending_head from all departments
        q = query(
          collection(db, 'leaves'),
          where('status', '==', 'pending_head'),
          orderBy('submittedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        pendingApprovals.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      } else if (role === 'hr') {
        // HR sees pending_hr from all departments
        q = query(
          collection(db, 'leaves'),
          where('status', '==', 'pending_hr'),
          orderBy('submittedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        pendingApprovals.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      } else {
        pendingApprovals.value = []
        loading.value = false
        return
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch all team leaves
  const fetchTeamLeaves = async () => {
    try {
      loading.value = true
      const q = query(
        collection(db, 'leaves'),
        orderBy('submittedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      teamLeaves.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching team leaves:', err)
    } finally {
      loading.value = false
    }
  }

  // Cleanup
  const cleanup = () => {
    myLeaves.value = []
    teamLeaves.value = []
    pendingApprovals.value = []
  }

  return {
    myLeaves,
    teamLeaves,
    pendingApprovals,
    loading,
    error,
    leaveTypes,
    statusLabels,
    pendingCount,
    pendingApprovalCount,
    getDateStr,
    submitLeave,
    cancelLeave,
    headApprove,
    hrApprove,
    rejectLeave,
    fetchMyLeaves,
    fetchPendingApprovals,
    fetchTeamLeaves,
    cleanup
  }
})
