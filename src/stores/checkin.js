import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useCheckinStore = defineStore('checkin', () => {
  const todayCheckin = ref(null)
  const checkinHistory = ref([])
  const teamCheckins = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // Helper: get today's date string in YYYY-MM-DD format (local timezone)
  const getTodayDateStr = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  // Helper: get date string from a Date object
  const getDateStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  // Computed: has checked in today
  const hasCheckedInToday = computed(() => !!todayCheckin.value)

  // Helper: check if a date is a weekend (Saturday=6, Sunday=0)
  const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  // Computed: current streak (consecutive workdays, weekends don't break streak)
  const currentStreak = computed(() => {
    if (checkinHistory.value.length === 0) return 0

    const sorted = [...checkinHistory.value].sort((a, b) => b.date.localeCompare(a.date))
    const today = getTodayDateStr()
    const checkinDates = new Set(sorted.map(c => c.date))

    let streak = 0
    let checkDate = new Date()

    // If today is a workday and not checked in yet, start from yesterday
    if (!isWeekend(checkDate) && !checkinDates.has(today)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = getDateStr(checkDate)

      if (isWeekend(checkDate)) {
        // Weekend: skip without breaking streak
        // But if user checked in on weekend, count it as bonus
        if (checkinDates.has(dateStr)) {
          streak++
        }
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // Workday: must have check-in to continue streak
        if (checkinDates.has(dateStr)) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    return streak
  })

  // Computed: longest streak (weekends don't break streak)
  const longestStreak = computed(() => {
    if (checkinHistory.value.length === 0) return 0

    const sorted = [...checkinHistory.value].sort((a, b) => a.date.localeCompare(b.date))
    const checkinDates = new Set(sorted.map(c => c.date))

    // Find the date range (first check-in to today)
    const firstDate = new Date(sorted[0].date)
    const today = new Date()
    let maxStreak = 0
    let current = 0

    let d = new Date(firstDate)
    while (d <= today) {
      const dateStr = getDateStr(d)

      if (isWeekend(d)) {
        // Weekend: skip without breaking streak, count if checked in
        if (checkinDates.has(dateStr)) {
          current++
        }
      } else {
        // Workday
        if (checkinDates.has(dateStr)) {
          current++
        } else {
          maxStreak = Math.max(maxStreak, current)
          current = 0
        }
      }

      d.setDate(d.getDate() + 1)
    }

    maxStreak = Math.max(maxStreak, current)
    return maxStreak
  })

  // Computed: total check-ins this month
  const thisMonthCount = computed(() => {
    const now = new Date()
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return checkinHistory.value.filter(c => c.date.startsWith(monthPrefix)).length
  })

  // Fetch today's check-in
  const fetchTodayCheckin = async () => {
    if (!authStore.user?.email) return

    try {
      const todayStr = getTodayDateStr()
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', authStore.user.email),
        where('date', '==', todayStr),
        limit(1)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        todayCheckin.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      } else {
        todayCheckin.value = null
      }
    } catch (err) {
      console.error('Error fetching today checkin:', err)
    }
  }

  // Computed: level based on total check-ins
  const levels = [
    { name: 'Newbie', icon: '🌱', min: 0 },
    { name: 'Regular', icon: '⭐', min: 5 },
    { name: 'Committed', icon: '💎', min: 15 },
    { name: 'Dedicated', icon: '🏅', min: 30 },
    { name: 'Champion', icon: '👑', min: 60 }
  ]

  const currentLevel = computed(() => {
    const total = checkinHistory.value.length
    let level = levels[0]
    for (const l of levels) {
      if (total >= l.min) level = l
    }
    const idx = levels.indexOf(level)
    const nextLevel = levels[idx + 1] || null
    const progress = nextLevel
      ? Math.min(100, Math.round(((total - level.min) / (nextLevel.min - level.min)) * 100))
      : 100
    return { ...level, level: idx + 1, total, nextLevel, progress }
  })

  // Computed: streak fire tier
  const streakTier = computed(() => {
    const s = currentStreak.value
    if (s >= 30) return { emoji: '🔥🔥🔥', label: 'Legendary' }
    if (s >= 7) return { emoji: '🔥🔥', label: 'On Fire' }
    if (s >= 1) return { emoji: '🔥', label: 'Started' }
    return { emoji: '', label: '' }
  })

  // Computed: earned badges
  const badges = computed(() => {
    const total = checkinHistory.value.length
    const streak = currentStreak.value
    const longest = longestStreak.value
    const list = []

    if (total >= 1) list.push({ id: 'first', icon: '🎯', name: 'First Step', desc: 'เช็คชื่อครั้งแรก' })
    if (longest >= 7 || streak >= 7) list.push({ id: 'week', icon: '⚔️', name: 'Week Warrior', desc: 'Streak 7 วัน' })
    if (longest >= 30 || streak >= 30) list.push({ id: 'month', icon: '🏆', name: 'Month Master', desc: 'Streak 30 วัน' })
    if (total >= 50) list.push({ id: 'fifty', icon: '💯', name: 'Half Century', desc: 'เช็คชื่อ 50 ครั้ง' })
    if (total >= 100) list.push({ id: 'hundred', icon: '🌟', name: 'Centurion', desc: 'เช็คชื่อ 100 ครั้ง' })

    return list
  })

  // Check in (Agile standup: yesterday, today, blockers + mood)
  const checkIn = async ({ yesterday = '', today = '', blockers = '', mood = '' } = {}) => {
    if (!authStore.user?.email) return
    if (hasCheckedInToday.value) return // Already checked in

    try {
      loading.value = true
      error.value = null

      const todayStr = getTodayDateStr()
      const checkinData = {
        userId: authStore.user.email,
        userName: authStore.user.displayName || authStore.user.email.split('@')[0],
        date: todayStr,
        checkedInAt: Timestamp.now(),
        yesterday: yesterday || '',
        today: today || '',
        blockers: blockers || '',
        mood: mood || ''
      }

      const docRef = await addDoc(collection(db, 'checkins'), checkinData)
      todayCheckin.value = { id: docRef.id, ...checkinData }

      // Add to history
      checkinHistory.value.push({ id: docRef.id, ...checkinData })

      return true
    } catch (err) {
      console.error('Error checking in:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Update today's check-in (edit standup answers)
  const updateTodayCheckin = async ({ yesterday = '', today = '', blockers = '' }) => {
    if (!todayCheckin.value?.id) return false

    try {
      loading.value = true
      error.value = null

      const updates = {
        yesterday: yesterday || '',
        today: today || '',
        blockers: blockers || '',
        updatedAt: Timestamp.now()
      }

      await updateDoc(doc(db, 'checkins', todayCheckin.value.id), updates)

      // Update local state
      todayCheckin.value = { ...todayCheckin.value, ...updates }

      // Update in history array
      const idx = checkinHistory.value.findIndex(c => c.id === todayCheckin.value.id)
      if (idx !== -1) {
        checkinHistory.value[idx] = { ...checkinHistory.value[idx], ...updates }
      }

      return true
    } catch (err) {
      console.error('Error updating today checkin:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch personal check-in history (last N days)
  const fetchCheckinHistory = async (days = 90) => {
    if (!authStore.user?.email) return

    try {
      loading.value = true
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startStr = getDateStr(startDate)

      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', authStore.user.email),
        where('date', '>=', startStr),
        orderBy('date', 'desc')
      )

      const snapshot = await getDocs(q)
      checkinHistory.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching checkin history:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch team check-ins for today (all users)
  const fetchTeamCheckins = async () => {
    try {
      const todayStr = getTodayDateStr()
      const q = query(
        collection(db, 'checkins'),
        where('date', '==', todayStr)
      )

      const snapshot = await getDocs(q)
      teamCheckins.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching team checkins:', err)
    }
  }

  // Cleanup
  const cleanup = () => {
    todayCheckin.value = null
    checkinHistory.value = []
    teamCheckins.value = []
  }

  return {
    todayCheckin,
    checkinHistory,
    teamCheckins,
    loading,
    error,
    hasCheckedInToday,
    currentStreak,
    longestStreak,
    thisMonthCount,
    currentLevel,
    streakTier,
    badges,
    levels,
    getTodayDateStr,
    getDateStr,
    fetchTodayCheckin,
    checkIn,
    updateTodayCheckin,
    fetchCheckinHistory,
    fetchTeamCheckins,
    cleanup
  }
})
