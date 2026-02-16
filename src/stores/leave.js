import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'
import { useHolidayStore } from './holiday'

export const useLeaveStore = defineStore('leave', () => {
  const myLeaves = ref([])
  const teamLeaves = ref([])
  const pendingApprovals = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // --- Work-hour constants ---
  const WORK_HOURS_PER_DAY = 7.5
  const LUNCH_START = '12:00'
  const LUNCH_END = '13:00'

  // Duration type labels
  const durationTypes = [
    { value: 'full_day', label: 'เต็มวัน', icon: 'today' },
    { value: 'half_morning', label: 'ครึ่งเช้า', icon: 'wb_sunny', hint: '9:00-12:00' },
    { value: 'half_afternoon', label: 'ครึ่งบ่าย', icon: 'wb_twilight', hint: '13:00-17:30' },
    { value: 'custom', label: 'กำหนดเอง', icon: 'schedule' }
  ]

  // Calculate working hours for custom time range (subtracts lunch overlap)
  const calcCustomHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const startMin = toMinutes(startTime)
    const endMin = toMinutes(endTime)
    if (endMin <= startMin) return 0

    let totalMin = endMin - startMin

    // Subtract lunch overlap (12:00-13:00)
    const lunchStartMin = toMinutes(LUNCH_START)
    const lunchEndMin = toMinutes(LUNCH_END)
    const overlapStart = Math.max(startMin, lunchStartMin)
    const overlapEnd = Math.min(endMin, lunchEndMin)
    if (overlapStart < overlapEnd) {
      totalMin -= (overlapEnd - overlapStart)
    }

    return Math.round((totalMin / 60) * 100) / 100
  }

  // Calculate leave totals based on duration type
  const calcLeaveTotals = (durationType, startDate, endDate, customStartTime, customEndTime) => {
    if (durationType === 'half_morning') {
      return { totalHours: 3.0, totalDays: Math.round((3.0 / WORK_HOURS_PER_DAY) * 100) / 100 }
    }
    if (durationType === 'half_afternoon') {
      return { totalHours: 4.5, totalDays: Math.round((4.5 / WORK_HOURS_PER_DAY) * 100) / 100 }
    }
    if (durationType === 'custom') {
      const hours = calcCustomHours(customStartTime, customEndTime)
      return { totalHours: hours, totalDays: Math.round((hours / WORK_HOURS_PER_DAY) * 100) / 100 }
    }
    // full_day
    const bizDays = calcBusinessDays(startDate, endDate)
    return { totalHours: bizDays * WORK_HOURS_PER_DAY, totalDays: bizDays }
  }

  // Leave types
  const leaveTypes = [
    { value: 'sick', label: 'ลาป่วย', icon: '🤒', color: '#ef5350' },
    { value: 'personal', label: 'ลากิจ', icon: '📋', color: '#ffb74d' },
    { value: 'vacation', label: 'ลาพักร้อน', icon: '🏖️', color: '#42a5f5' },
    { value: 'maternity', label: 'ลาคลอด', icon: '🤱', color: '#ec407a' },
    { value: 'unpaid', label: 'ลาไม่รับค่าจ้าง', icon: '💼', color: '#9e9e9e' },
    { value: 'other', label: 'ลาอื่นๆ', icon: '📝', color: '#78909c' }
  ]

  // Leave types that have no quota limit
  const noQuotaTypes = ['unpaid', 'maternity', 'other']

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
  const submitLeave = async ({ firstName, lastName, leaveType, startDate, endDate, details = '', durationType = 'full_day', customStartTime = null, customEndTime = null }) => {
    if (!authStore.user?.email) return false

    try {
      loading.value = true
      error.value = null

      const userRole = authStore.profile.role

      // Determine initial status:
      // - sick leave: auto-approved (no approval needed)
      // - head / super_admin: skip head step, go straight to HR
      // - skipHeadApproval flag: skip head step, go straight to HR
      // - employee: start at pending_head
      // - unpaid: same approval flow as personal/vacation
      let initialStatus
      if (leaveType === 'sick') {
        initialStatus = 'approved'
      } else if (userRole === 'head' || userRole === 'super_admin' || authStore.profile.skipHeadApproval) {
        initialStatus = 'pending_hr'
      } else {
        initialStatus = 'pending_head'
      }

      // Use profile data as fallback for firstName/lastName
      const finalFirstName = firstName.trim() || authStore.profile.firstName || ''
      const finalLastName = lastName.trim() || authStore.profile.lastName || ''

      // Calculate leave totals (hours and days)
      const { totalHours, totalDays } = calcLeaveTotals(durationType, startDate, endDate, customStartTime, customEndTime)

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
        rejectionReason: '',
        // Partial-day fields
        durationType,
        customStartTime: durationType === 'custom' ? customStartTime : null,
        customEndTime: durationType === 'custom' ? customEndTime : null,
        totalHours,
        totalDays
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
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      // Verify current status before cancelling
      const leaveSnap = await getDoc(leaveRef)
      const currentStatus = leaveSnap.data()?.status
      if (currentStatus !== 'pending_head' && currentStatus !== 'pending_hr') {
        error.value = 'ไม่สามารถยกเลิกใบลาที่ไม่ได้อยู่ในสถานะรออนุมัติ'
        return false
      }

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

  // Admin cancel approved leave (HR / super_admin only)
  const adminCancelLeave = async (leaveId, reason = '') => {
    const role = authStore.profile.role
    if (role !== 'hr' && role !== 'super_admin') return false

    try {
      loading.value = true
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      // Verify current status before cancelling
      const leaveSnap = await getDoc(leaveRef)
      if (leaveSnap.data()?.status !== 'approved') {
        error.value = 'สามารถยกเลิกได้เฉพาะใบลาที่อนุมัติแล้วเท่านั้น'
        return false
      }

      await updateDoc(leaveRef, {
        status: 'cancelled',
        cancelledBy: authStore.user.email,
        cancelledByName: authStore.fullName,
        cancelReason: reason.trim(),
        cancelledAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Update local arrays
      const idx = myLeaves.value.findIndex(l => l.id === leaveId)
      if (idx !== -1) {
        myLeaves.value[idx].status = 'cancelled'
      }
      const tIdx = teamLeaves.value.findIndex(l => l.id === leaveId)
      if (tIdx !== -1) {
        teamLeaves.value[tIdx].status = 'cancelled'
      }
      return true
    } catch (err) {
      console.error('Error admin cancelling leave:', err)
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
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      // Verify current status to prevent race conditions
      const leaveSnap = await getDoc(leaveRef)
      if (leaveSnap.data()?.status !== 'pending_head') {
        error.value = 'สถานะใบลาเปลี่ยนไปแล้ว กรุณารีเฟรชข้อมูล'
        return false
      }

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
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      // Verify current status to prevent race conditions
      const leaveSnap = await getDoc(leaveRef)
      if (leaveSnap.data()?.status !== 'pending_hr') {
        error.value = 'สถานะใบลาเปลี่ยนไปแล้ว กรุณารีเฟรชข้อมูล'
        return false
      }

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
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      // Verify current status to prevent race conditions
      const leaveSnap = await getDoc(leaveRef)
      const currentStatus = leaveSnap.data()?.status
      if (currentStatus !== 'pending_head' && currentStatus !== 'pending_hr') {
        error.value = 'สถานะใบลาเปลี่ยนไปแล้ว กรุณารีเฟรชข้อมูล'
        return false
      }

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

  // Head revokes their approval (pending_hr -> rejected)
  const headRevokeApproval = async (leaveId, reason = '') => {
    const role = authStore.profile.role
    if (role !== 'head' && role !== 'hr' && role !== 'super_admin') return false

    try {
      loading.value = true
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      const leaveSnap = await getDoc(leaveRef)
      if (leaveSnap.data()?.status !== 'pending_hr') {
        error.value = 'สถานะใบลาเปลี่ยนไปแล้ว (อาจถูก HR ดำเนินการแล้ว) กรุณารีเฟรชข้อมูล'
        return false
      }

      await updateDoc(leaveRef, {
        status: 'rejected',
        rejectedBy: authStore.user.email,
        rejectionReason: reason.trim(),
        headApproval: null,
        revokedFrom: 'pending_hr',
        updatedAt: Timestamp.now()
      })

      // Update local arrays
      const tIdx = teamLeaves.value.findIndex(l => l.id === leaveId)
      if (tIdx !== -1) {
        teamLeaves.value[tIdx].status = 'rejected'
        teamLeaves.value[tIdx].rejectedBy = authStore.user.email
        teamLeaves.value[tIdx].rejectionReason = reason.trim()
        teamLeaves.value[tIdx].headApproval = null
        teamLeaves.value[tIdx].revokedFrom = 'pending_hr'
      }
      pendingApprovals.value = pendingApprovals.value.filter(l => l.id !== leaveId)
      return true
    } catch (err) {
      console.error('Error revoking head approval:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // HR revokes their approval (approved -> rejected)
  const hrRevokeApproval = async (leaveId, reason = '') => {
    const role = authStore.profile.role
    if (role !== 'hr' && role !== 'super_admin') return false

    try {
      loading.value = true
      error.value = null
      const leaveRef = doc(db, 'leaves', leaveId)

      const leaveSnap = await getDoc(leaveRef)
      if (leaveSnap.data()?.status !== 'approved') {
        error.value = 'สถานะใบลาเปลี่ยนไปแล้ว กรุณารีเฟรชข้อมูล'
        return false
      }

      await updateDoc(leaveRef, {
        status: 'rejected',
        rejectedBy: authStore.user.email,
        rejectionReason: reason.trim(),
        hrApproval: null,
        revokedFrom: 'approved',
        updatedAt: Timestamp.now()
      })

      // Update local arrays
      const tIdx = teamLeaves.value.findIndex(l => l.id === leaveId)
      if (tIdx !== -1) {
        teamLeaves.value[tIdx].status = 'rejected'
        teamLeaves.value[tIdx].rejectedBy = authStore.user.email
        teamLeaves.value[tIdx].rejectionReason = reason.trim()
        teamLeaves.value[tIdx].hrApproval = null
        teamLeaves.value[tIdx].revokedFrom = 'approved'
      }
      const mIdx = myLeaves.value.findIndex(l => l.id === leaveId)
      if (mIdx !== -1) {
        myLeaves.value[mIdx].status = 'rejected'
      }
      return true
    } catch (err) {
      console.error('Error revoking HR approval:', err)
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

  // --- Leave Quota ---
  const leaveQuota = ref({ sick: 30, personal: 10, vacation: 6, maternity: 90, unpaid: 999, other: 999 })
  const quotaMeta = ref({ updatedAt: null, updatedBy: '' })

  // --- Individual Quota ---
  const myIndividualQuota = ref(null) // null = use global, object = override

  // Effective quota: individual overrides global
  const effectiveQuota = computed(() => {
    if (myIndividualQuota.value) {
      return {
        sick: myIndividualQuota.value.sick ?? leaveQuota.value.sick,
        personal: myIndividualQuota.value.personal ?? leaveQuota.value.personal,
        vacation: myIndividualQuota.value.vacation ?? leaveQuota.value.vacation,
        maternity: 90,
        unpaid: 999,
        other: 999
      }
    }
    return { ...leaveQuota.value }
  })

  // Fetch individual quota for current user
  const fetchMyIndividualQuota = async () => {
    if (!authStore.user?.email) return
    try {
      const docRef = doc(db, 'leaveQuotas', authStore.user.email)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        myIndividualQuota.value = docSnap.data()
      } else {
        myIndividualQuota.value = null
      }
    } catch (err) {
      console.error('Error fetching individual quota:', err)
    }
  }

  // Fetch individual quota for a specific user (HR use)
  const fetchUserIndividualQuota = async (email) => {
    try {
      const docRef = doc(db, 'leaveQuotas', email)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data()
      }
      return null
    } catch (err) {
      console.error('Error fetching user individual quota:', err)
      return null
    }
  }

  // Set individual quota for a user (HR/super_admin)
  const setUserIndividualQuota = async (email, quotaData) => {
    try {
      loading.value = true
      error.value = null
      const docRef = doc(db, 'leaveQuotas', email)
      const payload = {
        sick: Number(quotaData.sick) || 0,
        personal: Number(quotaData.personal) || 0,
        vacation: Number(quotaData.vacation) || 0,
        updatedAt: Timestamp.now(),
        updatedBy: authStore.user?.email || ''
      }
      await setDoc(docRef, payload)
      // Update local state if it's the current user
      if (email === authStore.user?.email) {
        myIndividualQuota.value = payload
      }
      return true
    } catch (err) {
      console.error('Error setting individual quota:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Reset user to global quota (delete individual quota doc)
  const resetUserToGlobalQuota = async (email) => {
    try {
      loading.value = true
      error.value = null
      const docRef = doc(db, 'leaveQuotas', email)
      await deleteDoc(docRef)
      // Update local state if it's the current user
      if (email === authStore.user?.email) {
        myIndividualQuota.value = null
      }
      return true
    } catch (err) {
      console.error('Error resetting to global quota:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Calculate business days between two dates (inclusive, Mon-Fri only, excluding company holidays)
  const calcBusinessDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0
    const current = new Date(start)

    const holidayStore = useHolidayStore()

    while (current <= end) {
      const day = current.getDay()
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
      if (day !== 0 && day !== 6 && !holidayStore.isHoliday(dateStr)) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  // Fetch leave quota settings from Firestore
  const fetchLeaveQuota = async () => {
    try {
      const docRef = doc(db, 'settings', 'leaveQuota')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        leaveQuota.value = {
          sick: data.sick ?? 30,
          personal: data.personal ?? 10,
          vacation: data.vacation ?? 6,
          maternity: 90,
          unpaid: 999,
          other: 999
        }
        quotaMeta.value = {
          updatedAt: data.updatedAt || null,
          updatedBy: data.updatedBy || ''
        }
      }
    } catch (err) {
      console.error('Error fetching leave quota:', err)
    }
  }

  // Update leave quota (HR / super_admin only)
  const updateLeaveQuota = async (quotaData) => {
    try {
      loading.value = true
      error.value = null
      const docRef = doc(db, 'settings', 'leaveQuota')
      const payload = {
        sick: Number(quotaData.sick) || 0,
        personal: Number(quotaData.personal) || 0,
        vacation: Number(quotaData.vacation) || 0,
        updatedAt: Timestamp.now(),
        updatedBy: authStore.user?.email || ''
      }
      await setDoc(docRef, payload)
      leaveQuota.value = { sick: payload.sick, personal: payload.personal, vacation: payload.vacation, maternity: 90, unpaid: 999, other: 999 }
      quotaMeta.value = { updatedAt: payload.updatedAt, updatedBy: payload.updatedBy }
      return true
    } catch (err) {
      console.error('Error updating leave quota:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Compute used days per leave type for current year (from myLeaves)
  const usedDaysMap = computed(() => {
    const currentYear = new Date().getFullYear()
    const yearStart = `${currentYear}-01-01`
    const yearEnd = `${currentYear}-12-31`
    const map = { sick: 0, personal: 0, vacation: 0, maternity: 0, unpaid: 0, other: 0 }

    for (const leave of myLeaves.value) {
      // Only count non-rejected, non-cancelled
      if (leave.status === 'rejected' || leave.status === 'cancelled') continue
      // Only count leaves within current year
      if (!leave.startDate || !leave.endDate) continue
      // Check if leave overlaps with current year
      const start = leave.startDate < yearStart ? yearStart : leave.startDate
      const end = leave.endDate > yearEnd ? yearEnd : leave.endDate
      if (start > end) continue

      // Use totalDays if available (new records), fall back to calcBusinessDays (legacy)
      let days
      if (leave.totalDays !== undefined && leave.totalDays !== null) {
        days = leave.totalDays
      } else {
        days = calcBusinessDays(start, end)
      }

      if (map[leave.leaveType] !== undefined) {
        map[leave.leaveType] += days
      }
    }
    return map
  })

  // Get remaining days for a specific leave type (uses effective quota)
  const getRemainingDays = (type) => {
    const quota = effectiveQuota.value[type] || 0
    const used = usedDaysMap.value[type] || 0
    return Math.round(Math.max(0, quota - used) * 100) / 100
  }

  // Import historical leave records (batch write)
  const importLeaves = async (records) => {
    const result = { success: 0, errors: [] }

    try {
      loading.value = true
      error.value = null

      // Firestore writeBatch limit is 500 operations per batch
      const BATCH_SIZE = 500
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const chunk = records.slice(i, i + BATCH_SIZE)
        const batch = writeBatch(db)

        for (const record of chunk) {
          try {
            const docRef = doc(collection(db, 'leaves'))

            // Parse submittedAt date or default to now
            let submittedAt = Timestamp.now()
            if (record.submittedAt) {
              const parsed = new Date(record.submittedAt)
              if (!isNaN(parsed.getTime())) {
                submittedAt = Timestamp.fromDate(parsed)
              }
            }

            const leaveData = {
              userId: record.userId || '',
              userName: `${record.firstName || ''} ${record.lastName || ''}`.trim(),
              firstName: record.firstName || '',
              lastName: record.lastName || '',
              leaveType: record.leaveType || '',
              startDate: record.startDate || '',
              endDate: record.endDate || '',
              details: record.details || '',
              department: record.department || '',
              status: 'approved',
              submittedAt,
              updatedAt: Timestamp.now(),
              headApproval: null,
              hrApproval: null,
              rejectedBy: null,
              rejectionReason: '',
              imported: true
            }

            batch.set(docRef, leaveData)
            result.success++
          } catch (rowErr) {
            result.errors.push({ row: record._rowIndex, message: rowErr.message })
          }
        }

        await batch.commit()
      }

      return result
    } catch (err) {
      console.error('Error importing leaves:', err)
      error.value = err.message
      result.errors.push({ row: -1, message: err.message })
      return result
    } finally {
      loading.value = false
    }
  }

  // --- Leave Report ---
  const reportLeaves = ref([])

  // Fetch leave report with filters
  const fetchLeaveReport = async ({ mode = 'all', userId = '', department = '', year = new Date().getFullYear(), startDate = '', endDate = '' }) => {
    try {
      loading.value = true
      error.value = null
      reportLeaves.value = []

      // Use custom date range if provided, otherwise full year
      const rangeStart = startDate || `${year}-01-01`
      const rangeEnd = endDate || `${year}-12-31`

      // For individual and department modes, fetch all leaves for the range
      // then filter client-side to avoid Firestore composite index requirements
      const q = query(
        collection(db, 'leaves'),
        where('startDate', '>=', rangeStart),
        where('startDate', '<=', rangeEnd),
        orderBy('startDate', 'desc')
      )

      const snapshot = await getDocs(q)
      let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // Apply client-side filters
      if (mode === 'individual' && userId) {
        results = results.filter(leave => leave.userId === userId)
      } else if (mode === 'department' && department) {
        results = results.filter(leave => leave.department === department)
      }

      reportLeaves.value = results
      return reportLeaves.value
    } catch (err) {
      console.error('Error fetching leave report:', err)
      error.value = err.message
      reportLeaves.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // Cleanup
  const cleanup = () => {
    myLeaves.value = []
    teamLeaves.value = []
    pendingApprovals.value = []
    reportLeaves.value = []
  }

  return {
    myLeaves,
    teamLeaves,
    pendingApprovals,
    loading,
    error,
    leaveTypes,
    noQuotaTypes,
    statusLabels,
    durationTypes,
    pendingCount,
    pendingApprovalCount,
    leaveQuota,
    quotaMeta,
    myIndividualQuota,
    effectiveQuota,
    usedDaysMap,
    WORK_HOURS_PER_DAY,
    getDateStr,
    calcBusinessDays,
    calcCustomHours,
    calcLeaveTotals,
    getRemainingDays,
    fetchLeaveQuota,
    updateLeaveQuota,
    fetchMyIndividualQuota,
    fetchUserIndividualQuota,
    setUserIndividualQuota,
    resetUserToGlobalQuota,
    submitLeave,
    cancelLeave,
    adminCancelLeave,
    headApprove,
    hrApprove,
    rejectLeave,
    headRevokeApproval,
    hrRevokeApproval,
    fetchMyLeaves,
    fetchPendingApprovals,
    fetchTeamLeaves,
    importLeaves,
    reportLeaves,
    fetchLeaveReport,
    cleanup
  }
})
