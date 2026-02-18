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
import { useNotificationsStore } from './notifications'

export const useMeetingRoomStore = defineStore('meetingRoom', () => {
  const bookings = ref([])
  const submitting = ref(false)
  const fetching = ref(false)
  const uploading = ref(false)
  const loading = computed(() => submitting.value || fetching.value || uploading.value)
  const error = ref(null)

  const authStore = useAuthStore()
  const notificationsStore = useNotificationsStore()

  const ROOMS = [
    'ห้องประชุมหลัก',
    'ห้องกินข้าว',
    'โซฟา'
  ]

  const bookingsByDate = computed(() => {
    const map = {}
    for (const b of bookings.value) {
      if (b.status === 'cancelled') continue
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    }
    return map
  })

  const notifyAttendees = async (attendees, { type, topic, date, startTime, endTime, roomName }) => {
    const bookerName = authStore.fullName || authStore.user?.email?.split('@')[0]
    const dateLabel = date
    const timeLabel = `${startTime}–${endTime}`

    let message = ''
    if (type === 'meeting_invite') {
      message = `${bookerName} เชิญคุณเข้าร่วมประชุม "${topic}" วันที่ ${dateLabel} เวลา ${timeLabel} ที่ ${roomName}`
    } else if (type === 'meeting_cancelled') {
      message = `การประชุม "${topic}" วันที่ ${dateLabel} เวลา ${timeLabel} ที่ ${roomName} ถูกยกเลิกแล้ว`
    }

    for (const email of attendees) {
      await notificationsStore.createNotification({
        recipientEmail: email,
        type,
        title: type === 'meeting_invite' ? 'คุณได้รับเชิญเข้าร่วมประชุม' : 'การประชุมถูกยกเลิก',
        message,
        senderEmail: authStore.user?.email,
        senderName: bookerName
      })
    }
  }

  const fetchBookings = async (year, month) => {
    try {
      fetching.value = true
      error.value = null

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`

      const q = query(
        collection(db, 'meetingBookings'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date'),
        orderBy('startTime')
      )

      const snap = await getDocs(q)
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      const existingOtherMonths = bookings.value.filter(
        b => !b.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
      )
      bookings.value = [...existingOtherMonths, ...results]
    } catch (err) {
      console.error('Error fetching bookings:', err)
      error.value = err.message
    } finally {
      fetching.value = false
    }
  }

  const checkConflict = async ({ date, startTime, endTime, roomName, excludeId }) => {
    const q = query(
      collection(db, 'meetingBookings'),
      where('date', '==', date),
      where('roomName', '==', roomName),
      where('status', '==', 'confirmed')
    )
    const snap = await getDocs(q)
    const conflicts = []
    for (const d of snap.docs) {
      if (excludeId && d.id === excludeId) continue
      const b = d.data()
      if (startTime < b.endTime && endTime > b.startTime) {
        conflicts.push({ id: d.id, ...b })
      }
    }
    return conflicts
  }

  const createBooking = async ({ date, startTime, endTime, topic, description, roomName, attendees, attendeeNames }) => {
    if (!authStore.user?.email) return false

    try {
      submitting.value = true
      error.value = null

      const conflicts = await checkConflict({ date, startTime, endTime, roomName })
      if (conflicts.length > 0) {
        const c = conflicts[0]
        error.value = `ห้อง ${roomName} ถูกจองแล้วในช่วง ${c.startTime}–${c.endTime} (${c.topic}) โดย ${c.bookedByName}`
        return false
      }

      const data = {
        date,
        startTime,
        endTime,
        topic: topic.trim(),
        description: (description || '').trim(),
        roomName,
        bookedBy: authStore.user.email,
        bookedByName: authStore.fullName || authStore.user.email.split('@')[0],
        attendees: attendees || [],
        attendeeNames: attendeeNames || [],
        status: 'confirmed',
        meetingNotes: '',
        attachments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'meetingBookings'), data)
      bookings.value.push({ id: docRef.id, ...data })
      bookings.value.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

      if (data.attendees.length > 0) {
        notifyAttendees(data.attendees, {
          type: 'meeting_invite',
          topic: data.topic,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          roomName: data.roomName
        })
      }

      return docRef.id
    } catch (err) {
      console.error('Error creating booking:', err)
      error.value = err.message
      return false
    } finally {
      submitting.value = false
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      submitting.value = true
      error.value = null

      const booking = bookings.value.find(b => b.id === bookingId)

      await updateDoc(doc(db, 'meetingBookings', bookingId), {
        status: 'cancelled',
        updatedAt: Timestamp.now()
      })

      if (booking) {
        booking.status = 'cancelled'
        booking.updatedAt = Timestamp.now()

        if (booking.attendees?.length > 0) {
          notifyAttendees(booking.attendees, {
            type: 'meeting_cancelled',
            topic: booking.topic,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            roomName: booking.roomName
          })
        }
      }
      return true
    } catch (err) {
      console.error('Error cancelling booking:', err)
      error.value = err.message
      return false
    } finally {
      submitting.value = false
    }
  }

  const uploadAttachment = async (bookingId, file) => {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `meeting-rooms/${bookingId}/${Date.now()}_${safeName}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file)
      return await getDownloadURL(fileRef)
    } catch (err) {
      console.error('Error uploading attachment:', err)
      return ''
    }
  }

  const saveMeetingNotes = async (bookingId, { notes, files }) => {
    try {
      uploading.value = true
      error.value = null

      const booking = bookings.value.find(b => b.id === bookingId)
      const existingAttachments = booking?.attachments || []

      const newAttachments = []
      if (files && files.length > 0) {
        for (const file of files) {
          const url = await uploadAttachment(bookingId, file)
          if (url) {
            newAttachments.push({
              name: file.name,
              url,
              type: file.type || 'application/octet-stream'
            })
          }
        }
      }

      const allAttachments = [...existingAttachments, ...newAttachments]

      await updateDoc(doc(db, 'meetingBookings', bookingId), {
        meetingNotes: (notes || '').trim(),
        attachments: allAttachments,
        updatedAt: Timestamp.now()
      })

      if (booking) {
        booking.meetingNotes = (notes || '').trim()
        booking.attachments = allAttachments
        booking.updatedAt = Timestamp.now()
      }
      return true
    } catch (err) {
      console.error('Error saving meeting notes:', err)
      error.value = err.message
      return false
    } finally {
      uploading.value = false
    }
  }

  const canEdit = (booking) => {
    if (!booking || !authStore.user?.email) return false
    return booking.bookedBy === authStore.user.email || authStore.isSuperAdmin
  }

  return {
    bookings,
    submitting,
    fetching,
    uploading,
    loading,
    error,
    ROOMS,
    bookingsByDate,
    fetchBookings,
    checkConflict,
    createBooking,
    cancelBooking,
    saveMeetingNotes,
    canEdit
  }
})
