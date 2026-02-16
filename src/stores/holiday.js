import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useHolidayStore = defineStore('holiday', () => {
  const holidays = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadedYear = ref(null)

  const authStore = useAuthStore()

  // Set of date strings for O(1) lookup
  const holidaySet = computed(() => {
    return new Set(holidays.value.map(h => h.date))
  })

  // Check if a given date string (YYYY-MM-DD) is a company holiday
  const isHoliday = (dateStr) => {
    return holidaySet.value.has(dateStr)
  }

  // Get holiday name for a date
  const getHolidayName = (dateStr) => {
    const h = holidays.value.find(h => h.date === dateStr)
    return h ? h.name : ''
  }

  // Get holidays that fall within a date range
  const getHolidaysInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return []
    return holidays.value.filter(h => h.date >= startDate && h.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Fetch holidays for a specific year (stored as single document per year)
  const fetchHolidays = async (year) => {
    if (!year) year = new Date().getFullYear()

    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, 'companyHolidays', String(year))
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        holidays.value = (data.holidays || []).sort((a, b) => a.date.localeCompare(b.date))
      } else {
        holidays.value = []
      }
      loadedYear.value = year
    } catch (err) {
      console.error('Error fetching holidays:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Fetch holidays for multiple years (for leave spanning year boundary)
  const fetchHolidaysMultiYear = async (years) => {
    try {
      loading.value = true
      error.value = null

      const allHolidays = []
      for (const year of years) {
        const docRef = doc(db, 'companyHolidays', String(year))
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          allHolidays.push(...(data.holidays || []))
        }
      }

      holidays.value = allHolidays.sort((a, b) => a.date.localeCompare(b.date))
    } catch (err) {
      console.error('Error fetching multi-year holidays:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Save all holidays for a year (replaces entire document)
  const saveHolidays = async (year, holidayList) => {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, 'companyHolidays', String(year))
      const sorted = [...holidayList].sort((a, b) => a.date.localeCompare(b.date))

      await setDoc(docRef, {
        year: Number(year),
        holidays: sorted,
        updatedBy: authStore.user?.email || '',
        updatedAt: Timestamp.now()
      })

      if (loadedYear.value === year) {
        holidays.value = sorted
      }

      return true
    } catch (err) {
      console.error('Error saving holidays:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Add a single holiday to a year
  const addHoliday = async (year, date, name, type = 'company') => {
    const existing = holidays.value.filter(h => h.date !== date)
    const updated = [...existing, { date, name, type }]
    return saveHolidays(year, updated)
  }

  // Remove a single holiday from a year
  const removeHoliday = async (year, date) => {
    const updated = holidays.value.filter(h => h.date !== date)
    return saveHolidays(year, updated)
  }

  // Update a holiday
  const updateHoliday = async (year, oldDate, newDate, name, type = 'company') => {
    const updated = holidays.value.filter(h => h.date !== oldDate)
    updated.push({ date: newDate, name, type })
    return saveHolidays(year, updated)
  }

  // Copy holidays from one year to another (adjust dates)
  const copyFromYear = async (sourceYear, targetYear) => {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(db, 'companyHolidays', String(sourceYear))
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        error.value = `ไม่พบวันหยุดของปี ${sourceYear}`
        return false
      }

      const sourceData = docSnap.data()
      const sourceHolidays = sourceData.holidays || []

      // Adjust year in dates
      const copied = sourceHolidays.map(h => ({
        ...h,
        date: h.date.replace(/^\d{4}/, String(targetYear))
      }))

      // Merge with existing holidays (don't duplicate same dates)
      const targetDocRef = doc(db, 'companyHolidays', String(targetYear))
      const targetSnap = await getDoc(targetDocRef)
      let existing = []
      if (targetSnap.exists()) {
        existing = targetSnap.data().holidays || []
      }

      const existingDates = new Set(existing.map(h => h.date))
      const merged = [...existing, ...copied.filter(h => !existingDates.has(h.date))]

      return await saveHolidays(targetYear, merged)
    } catch (err) {
      console.error('Error copying holidays:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Thai national holiday presets
  const getThaiHolidayPresets = (year) => [
    { date: `${year}-01-01`, name: 'วันขึ้นปีใหม่', type: 'national' },
    { date: `${year}-02-12`, name: 'วันมาฆบูชา', type: 'national' },
    { date: `${year}-04-06`, name: 'วันจักรี', type: 'national' },
    { date: `${year}-04-13`, name: 'วันสงกรานต์', type: 'national' },
    { date: `${year}-04-14`, name: 'วันสงกรานต์', type: 'national' },
    { date: `${year}-04-15`, name: 'วันสงกรานต์', type: 'national' },
    { date: `${year}-05-01`, name: 'วันแรงงานแห่งชาติ', type: 'national' },
    { date: `${year}-05-04`, name: 'วันฉัตรมงคล', type: 'national' },
    { date: `${year}-06-03`, name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี', type: 'national' },
    { date: `${year}-07-28`, name: 'วันเฉลิมพระชนมพรรษา ร.10', type: 'national' },
    { date: `${year}-08-12`, name: 'วันแม่แห่งชาติ', type: 'national' },
    { date: `${year}-10-13`, name: 'วันคล้ายวันสวรรคต ร.9', type: 'national' },
    { date: `${year}-10-23`, name: 'วันปิยมหาราช', type: 'national' },
    { date: `${year}-12-05`, name: 'วันพ่อแห่งชาติ', type: 'national' },
    { date: `${year}-12-10`, name: 'วันรัฐธรรมนูญ', type: 'national' },
    { date: `${year}-12-31`, name: 'วันสิ้นปี', type: 'national' }
  ]

  // Cleanup
  const cleanup = () => {
    holidays.value = []
    loadedYear.value = null
  }

  return {
    holidays,
    loading,
    error,
    loadedYear,
    holidaySet,
    isHoliday,
    getHolidayName,
    getHolidaysInRange,
    fetchHolidays,
    fetchHolidaysMultiYear,
    saveHolidays,
    addHoliday,
    removeHoliday,
    updateHoliday,
    copyFromYear,
    getThaiHolidayPresets,
    cleanup
  }
})
