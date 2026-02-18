<template>
  <q-page class="meeting-page">
    <div class="meeting-container">
      <!-- Header -->
      <div class="meeting-page-header">
        <div class="meeting-header-left">
          <div class="meeting-header-icon">
            <q-icon name="meeting_room" size="26px" />
          </div>
          <div>
            <div class="meeting-header-title">Meeting Room Booking</div>
            <div class="meeting-header-subtitle">จองห้องประชุม — เลือกวัน เวลา และแนบบันทึกการประชุมได้</div>
          </div>
        </div>
        <button class="meeting-add-btn" @click="openNewBooking">
          <q-icon name="add" size="18px" />
          <span>จองห้องประชุม</span>
        </button>
      </div>

      <!-- Main Grid: Calendar + Bookings -->
      <div class="meeting-grid">
        <!-- Calendar Card -->
        <div class="meeting-card calendar-card">
          <div class="card-header">
            <q-icon name="calendar_month" size="18px" style="color: #26c6da;" />
            <span class="card-title">ปฏิทิน</span>
            <div style="flex:1"></div>
            <button class="month-nav-btn" @click="prevMonth">
              <q-icon name="chevron_left" size="18px" />
            </button>
            <span class="month-label">{{ currentMonthLabel }}</span>
            <button class="month-nav-btn" @click="nextMonth">
              <q-icon name="chevron_right" size="18px" />
            </button>
          </div>

          <div class="cal-weekdays">
            <div v-for="day in weekDays" :key="day" class="cal-weekday">{{ day }}</div>
          </div>
          <div class="cal-grid">
            <div
              v-for="(cell, idx) in calendarCells"
              :key="idx"
              class="cal-cell"
              :class="{
                'cal-empty': !cell.day,
                'cal-today': cell.isToday,
                'cal-selected': cell.dateStr === selectedDate,
                'cal-has-booking': cell.bookingCount > 0
              }"
              @click="cell.day && selectDate(cell.dateStr)"
            >
              <span v-if="cell.day" class="cal-day-num">{{ cell.day }}</span>
              <div v-if="cell.bookingCount > 0" class="cal-dots">
                <span
                  v-for="n in Math.min(cell.bookingCount, 3)"
                  :key="n"
                  class="cal-dot"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bookings List Card -->
        <div class="meeting-card bookings-card">
          <div class="card-header">
            <q-icon name="list_alt" size="18px" style="color: #66bb6a;" />
            <span class="card-title">{{ selectedDateLabel }}</span>
            <div style="flex:1"></div>
            <q-badge v-if="selectedDayBookings.length" :label="selectedDayBookings.length" class="bookings-count-badge" />
          </div>

          <div v-if="meetingStore.fetching" class="bookings-loading">
            <q-spinner-dots size="32px" color="cyan" />
          </div>

          <div v-else-if="selectedDayBookings.length === 0" class="bookings-empty">
            <q-icon name="event_busy" size="48px" />
            <span>ไม่มีการจองในวันนี้</span>
            <button class="empty-add-btn" @click="openNewBooking">
              <q-icon name="add" size="16px" />
              จองห้องประชุม
            </button>
          </div>

          <div v-else class="bookings-list">
            <div
              v-for="booking in selectedDayBookings"
              :key="booking.id"
              class="booking-item"
              :class="{ 'booking-cancelled': booking.status === 'cancelled' }"
              @click="openDetail(booking)"
            >
              <div class="booking-time-col">
                <span class="booking-start">{{ booking.startTime }}</span>
                <span class="booking-sep">—</span>
                <span class="booking-end">{{ booking.endTime }}</span>
              </div>
              <div class="booking-info-col">
                <div class="booking-topic">{{ booking.topic }}</div>
                <div class="booking-meta">
                  <span class="booking-room">
                    <q-icon name="meeting_room" size="13px" />
                    {{ booking.roomName }}
                  </span>
                  <span class="booking-booker">
                    <q-icon name="person" size="13px" />
                    {{ booking.bookedByName }}
                  </span>
                  <span v-if="booking.attendees?.length" class="booking-attendees-count">
                    <q-icon name="group" size="13px" />
                    {{ booking.attendees.length }} คน
                  </span>
                </div>
              </div>
              <div class="booking-status-col">
                <span class="booking-status-badge" :class="'status-' + booking.status">
                  {{ booking.status === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก' }}
                </span>
                <q-icon v-if="booking.attachments?.length > 0 || booking.meetingNotes" name="attach_file" size="16px" class="has-notes-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Booking Dialog -->
      <q-dialog v-model="showNewDialog" persistent>
        <div class="dialog-card new-booking-dialog">
          <div class="dialog-header">
            <q-icon name="add_circle" size="22px" style="color: #26c6da;" />
            <span class="dialog-title">จองห้องประชุม</span>
            <div style="flex:1"></div>
            <button class="dialog-close-btn" @click="showNewDialog = false">
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label class="form-label">วันที่</label>
              <q-input
                v-model="form.date"
                type="date"
                outlined
                dense
                dark
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group form-half">
                <label class="form-label">เวลาเริ่ม</label>
                <q-input
                  v-model="form.startTime"
                  outlined
                  dense
                  dark
                  mask="##:##"
                  placeholder="09:00"
                  class="form-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" size="18px" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer" size="18px">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="form.startTime" format24h dark />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="form-group form-half">
                <label class="form-label">เวลาสิ้นสุด</label>
                <q-input
                  v-model="form.endTime"
                  outlined
                  dense
                  dark
                  mask="##:##"
                  placeholder="10:00"
                  class="form-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" size="18px" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer" size="18px">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="form.endTime" format24h dark />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">ห้องประชุม</label>
              <q-select
                v-model="form.roomName"
                :options="meetingStore.ROOMS"
                outlined
                dense
                dark
                emit-value
                map-options
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">หัวข้อการประชุม</label>
              <q-input
                v-model="form.topic"
                outlined
                dense
                dark
                placeholder="เช่น Sprint Planning, Weekly Sync"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">รายละเอียด (ถ้ามี)</label>
              <q-input
                v-model="form.description"
                outlined
                dense
                dark
                type="textarea"
                rows="2"
                placeholder="รายละเอียดเพิ่มเติม..."
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">ผู้เข้าร่วมประชุม</label>
              <q-select
                v-model="form.selectedAttendees"
                :options="filteredAttendeeOptions"
                multiple
                outlined
                dense
                dark
                use-chips
                use-input
                input-debounce="200"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                @filter="filterAttendees"
                placeholder="พิมพ์ชื่อหรือเลือกผู้เข้าร่วม"
                class="form-input attendees-select"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">ไม่พบผู้ใช้</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Conflict Warning -->
          <div v-if="conflictWarning" class="conflict-banner">
            <q-icon name="warning" size="18px" />
            <span>{{ conflictWarning }}</span>
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" @click="showNewDialog = false">ยกเลิก</button>
            <button
              class="btn-submit"
              :disabled="!canSubmit || meetingStore.submitting || !!conflictWarning"
              @click="submitBooking"
            >
              <q-spinner-dots v-if="meetingStore.submitting" size="16px" />
              <template v-else>
                <q-icon name="check" size="16px" />
                ยืนยันการจอง
              </template>
            </button>
          </div>
        </div>
      </q-dialog>

      <!-- Booking Detail Dialog -->
      <q-dialog v-model="showDetailDialog">
        <div class="dialog-card detail-dialog" v-if="detailBooking">
          <div class="dialog-header">
            <q-icon name="info" size="22px" style="color: #42a5f5;" />
            <span class="dialog-title">รายละเอียดการจอง</span>
            <div style="flex:1"></div>
            <span class="detail-status-badge" :class="'status-' + detailBooking.status">
              {{ detailBooking.status === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก' }}
            </span>
            <button class="dialog-close-btn" @click="showDetailDialog = false">
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <div class="dialog-body">
            <!-- Booking Info -->
            <div class="detail-section">
              <div class="detail-topic">{{ detailBooking.topic }}</div>
              <div v-if="detailBooking.description" class="detail-description">{{ detailBooking.description }}</div>

              <div class="detail-info-grid">
                <div class="detail-info-item">
                  <q-icon name="calendar_today" size="16px" />
                  <span>{{ formatDisplayDate(detailBooking.date) }}</span>
                </div>
                <div class="detail-info-item">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ detailBooking.startTime }} — {{ detailBooking.endTime }}</span>
                </div>
                <div class="detail-info-item">
                  <q-icon name="meeting_room" size="16px" />
                  <span>{{ detailBooking.roomName }}</span>
                </div>
                <div class="detail-info-item">
                  <q-icon name="person" size="16px" />
                  <span>จองโดย: {{ detailBooking.bookedByName }}</span>
                </div>
              </div>

              <!-- Attendees -->
              <div v-if="detailBooking.attendeeNames?.length" class="detail-attendees">
                <div class="detail-label">
                  <q-icon name="group" size="16px" />
                  ผู้เข้าร่วม ({{ detailBooking.attendeeNames.length }})
                </div>
                <div class="attendee-chips">
                  <span v-for="(name, i) in detailBooking.attendeeNames" :key="i" class="attendee-chip">
                    {{ name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Meeting Notes Section -->
            <div class="detail-section notes-section">
              <div class="detail-label">
                <q-icon name="description" size="16px" />
                บันทึกการประชุม
              </div>

              <q-input
                v-if="meetingStore.canEdit(detailBooking)"
                v-model="notesForm.text"
                outlined
                dense
                dark
                type="textarea"
                rows="3"
                placeholder="เขียนบันทึกการประชุม..."
                class="form-input"
              />
              <div v-else-if="detailBooking.meetingNotes" class="notes-readonly">
                {{ detailBooking.meetingNotes }}
              </div>
              <div v-else class="notes-empty">ยังไม่มีบันทึก</div>

              <!-- Existing Attachments -->
              <div v-if="detailBooking.attachments?.length > 0" class="existing-attachments">
                <div class="detail-sub-label">ไฟล์แนบ</div>
                <div class="attachment-list">
                  <a
                    v-for="(att, i) in detailBooking.attachments"
                    :key="i"
                    :href="att.url"
                    target="_blank"
                    class="attachment-item"
                  >
                    <q-icon :name="getFileIcon(att.type)" size="18px" />
                    <span class="attachment-name">{{ att.name }}</span>
                    <q-icon name="open_in_new" size="14px" class="attachment-open" />
                  </a>
                </div>
              </div>

              <!-- File Upload -->
              <div v-if="meetingStore.canEdit(detailBooking)" class="file-upload-zone">
                <label class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    class="file-input-hidden"
                    @change="handleFileSelect"
                  />
                  <q-icon name="cloud_upload" size="28px" />
                  <span>คลิกหรือลากไฟล์มาวาง (PDF, PNG, JPG)</span>
                </label>
                <div v-if="notesForm.files.length > 0" class="pending-files">
                  <div v-for="(file, i) in notesForm.files" :key="i" class="pending-file">
                    <q-icon :name="getFileIcon(file.type)" size="16px" />
                    <span>{{ file.name }}</span>
                    <button class="remove-file-btn" @click="notesForm.files.splice(i, 1)">
                      <q-icon name="close" size="14px" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                v-if="meetingStore.canEdit(detailBooking)"
                class="btn-save-notes"
                :disabled="meetingStore.uploading"
                @click="saveNotes"
              >
                <q-spinner-dots v-if="meetingStore.uploading" size="16px" />
                <template v-else>
                  <q-icon name="save" size="16px" />
                  บันทึก
                </template>
              </button>
            </div>
          </div>

          <!-- Footer Actions -->
          <div v-if="meetingStore.canEdit(detailBooking) && detailBooking.status === 'confirmed'" class="dialog-footer">
            <button class="btn-cancel-booking" @click="handleCancelBooking">
              <q-icon name="cancel" size="16px" />
              ยกเลิกการจอง
            </button>
          </div>
        </div>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMeetingRoomStore } from 'stores/meetingRoom'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const meetingStore = useMeetingRoomStore()
const authStore = useAuthStore()

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth() + 1)
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const selectedDate = ref(today)

const showNewDialog = ref(false)
const showDetailDialog = ref(false)
const detailBooking = ref(null)

const form = ref(resetForm())
const notesForm = ref({ text: '', files: [] })

const attendeeOptions = ref([])
const filteredAttendeeOptions = ref([])

function resetForm () {
  return {
    date: selectedDate.value,
    startTime: '09:00',
    endTime: '10:00',
    roomName: meetingStore.ROOMS[0],
    topic: '',
    description: '',
    selectedAttendees: []
  }
}

const currentMonthLabel = computed(() => {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${months[calMonth.value - 1]} ${calYear.value + 543}`
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return 'เลือกวันที่'
  return formatDisplayDate(selectedDate.value)
})

const selectedDayBookings = computed(() => {
  return (meetingStore.bookingsByDate[selectedDate.value] || [])
    .concat(
      meetingStore.bookings.filter(
        b => b.date === selectedDate.value && b.status === 'cancelled'
      )
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const calendarCells = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value - 1, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value, 0).getDate()
  const cells = []

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear.value}-${String(calMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const count = (meetingStore.bookingsByDate[dateStr] || []).length
    cells.push({
      day: d,
      dateStr,
      isToday: dateStr === today,
      bookingCount: count
    })
  }
  return cells
})

const canSubmit = computed(() => {
  return form.value.date && form.value.startTime && form.value.endTime && form.value.topic.trim() && form.value.roomName
})

function prevMonth () {
  if (calMonth.value === 1) {
    calMonth.value = 12
    calYear.value--
  } else {
    calMonth.value--
  }
}

function nextMonth () {
  if (calMonth.value === 12) {
    calMonth.value = 1
    calYear.value++
  } else {
    calMonth.value++
  }
}

function selectDate (dateStr) {
  selectedDate.value = dateStr
}

function formatDisplayDate (dateStr) {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const [y, m, d] = dateStr.split('-')
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const dt = new Date(+y, +m - 1, +d)
  return `วัน${dayNames[dt.getDay()]}ที่ ${+d} ${months[+m - 1]} ${+y + 543}`
}

function openNewBooking () {
  form.value = resetForm()
  showNewDialog.value = true
  loadAttendeeOptions()
}

async function loadAttendeeOptions () {
  if (authStore.allProfiles.length === 0) {
    await authStore.fetchAllProfiles()
  }
  attendeeOptions.value = authStore.allProfiles
    .filter(p => p.email !== authStore.user?.email)
    .map(p => ({
      label: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
      value: p.email,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email
    }))
  filteredAttendeeOptions.value = attendeeOptions.value
}

function filterAttendees (val, update) {
  update(() => {
    if (!val) {
      filteredAttendeeOptions.value = attendeeOptions.value
    } else {
      const needle = val.toLowerCase()
      filteredAttendeeOptions.value = attendeeOptions.value.filter(
        o => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle)
      )
    }
  })
}

const conflictWarning = ref('')

async function checkFormConflict () {
  conflictWarning.value = ''
  const { date, startTime, endTime, roomName } = form.value
  if (!date || !startTime || !endTime || !roomName) return
  if (startTime >= endTime) return

  const conflicts = await meetingStore.checkConflict({ date, startTime, endTime, roomName })
  if (conflicts.length > 0) {
    const c = conflicts[0]
    conflictWarning.value = `${roomName} ถูกจองแล้วช่วง ${c.startTime}–${c.endTime} ("${c.topic}" โดย ${c.bookedByName})`
  }
}

async function submitBooking () {
  conflictWarning.value = ''
  const attendeeEmails = form.value.selectedAttendees
  const attendeeNamesList = attendeeEmails.map(email => {
    const opt = attendeeOptions.value.find(o => o.value === email)
    return opt ? opt.name : email
  })

  const id = await meetingStore.createBooking({
    date: form.value.date,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    topic: form.value.topic,
    description: form.value.description,
    roomName: form.value.roomName,
    attendees: attendeeEmails,
    attendeeNames: attendeeNamesList
  })

  if (id) {
    showNewDialog.value = false
    $q.notify({ type: 'positive', message: 'จองห้องประชุมสำเร็จ', icon: 'check_circle' })
  } else if (meetingStore.error) {
    conflictWarning.value = meetingStore.error
  } else {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่', icon: 'error' })
  }
}

function openDetail (booking) {
  detailBooking.value = booking
  notesForm.value = {
    text: booking.meetingNotes || '',
    files: []
  }
  showDetailDialog.value = true
}

function getFileIcon (type) {
  if (!type) return 'insert_drive_file'
  if (type.includes('pdf')) return 'picture_as_pdf'
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return 'image'
  return 'insert_drive_file'
}

function handleFileSelect (e) {
  const files = Array.from(e.target.files || [])
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  for (const f of files) {
    if (allowed.includes(f.type)) {
      notesForm.value.files.push(f)
    }
  }
  e.target.value = ''
}

function handleDrop (e) {
  const files = Array.from(e.dataTransfer.files || [])
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  for (const f of files) {
    if (allowed.includes(f.type)) {
      notesForm.value.files.push(f)
    }
  }
}

async function saveNotes () {
  if (!detailBooking.value) return
  const ok = await meetingStore.saveMeetingNotes(detailBooking.value.id, {
    notes: notesForm.value.text,
    files: notesForm.value.files
  })
  if (ok) {
    notesForm.value.files = []
    $q.notify({ type: 'positive', message: 'บันทึกเรียบร้อย', icon: 'check_circle' })
  } else {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด', icon: 'error' })
  }
}

async function handleCancelBooking () {
  $q.dialog({
    title: 'ยกเลิกการจอง',
    message: `ยืนยันการยกเลิกการจอง "${detailBooking.value.topic}" หรือไม่?`,
    cancel: { flat: true, label: 'ไม่', color: 'grey' },
    ok: { label: 'ยกเลิกการจอง', color: 'negative', flat: true },
    dark: true,
    class: 'meeting-confirm-dialog'
  }).onOk(async () => {
    const ok = await meetingStore.cancelBooking(detailBooking.value.id)
    if (ok) {
      showDetailDialog.value = false
      $q.notify({ type: 'info', message: 'ยกเลิกการจองแล้ว', icon: 'cancel' })
    }
  })
}

watch([calYear, calMonth], () => {
  meetingStore.fetchBookings(calYear.value, calMonth.value)
}, { immediate: false })

watch(
  () => [form.value.date, form.value.startTime, form.value.endTime, form.value.roomName],
  () => {
    if (showNewDialog.value) checkFormConflict()
  }
)

onMounted(() => {
  meetingStore.fetchBookings(calYear.value, calMonth.value)
})
</script>

<style scoped>
.meeting-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.meeting-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ====== Header ====== */
.meeting-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.meeting-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meeting-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(38, 198, 218, 0.12);
  color: #26c6da;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meeting-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.meeting-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.meeting-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: rgba(38, 198, 218, 0.15);
  color: #26c6da;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.meeting-add-btn:hover {
  background: rgba(38, 198, 218, 0.28);
}

/* ====== Grid ====== */
.meeting-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.meeting-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  padding: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.card-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #c8c9cc;
}

.month-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.month-nav-btn:hover {
  border-color: rgba(38, 198, 218, 0.4);
  color: #26c6da;
}

.month-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #b0b1b4;
  min-width: 90px;
  text-align: center;
}

/* ====== Calendar ====== */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.cal-weekday {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: #6b6c6f;
  padding: 4px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  gap: 2px;
}

.cal-cell:not(.cal-empty):hover {
  background: rgba(38, 198, 218, 0.08);
}

.cal-cell.cal-selected {
  background: rgba(38, 198, 218, 0.18);
  border: 1px solid rgba(38, 198, 218, 0.4);
}

.cal-cell.cal-today .cal-day-num {
  color: #26c6da;
  font-weight: 700;
}

.cal-cell.cal-empty {
  cursor: default;
}

.cal-day-num {
  font-size: 0.78rem;
  color: #b0b1b4;
  font-weight: 500;
}

.cal-dots {
  display: flex;
  gap: 3px;
}

.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #26c6da;
}

/* ====== Bookings List ====== */
.bookings-count-badge {
  background: rgba(38, 198, 218, 0.18) !important;
  color: #26c6da !important;
  font-size: 0.7rem;
  font-weight: 600;
}

.bookings-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.bookings-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #4a4b4e;
  font-size: 0.82rem;
}

.empty-add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid rgba(38, 198, 218, 0.3);
  background: transparent;
  color: #26c6da;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.empty-add-btn:hover {
  background: rgba(38, 198, 218, 0.1);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 480px;
  overflow-y: auto;
}

.booking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(24, 26, 28, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.2);
  cursor: pointer;
  transition: all 0.15s;
}

.booking-item:hover {
  border-color: rgba(38, 198, 218, 0.3);
  background: rgba(38, 198, 218, 0.04);
}

.booking-item.booking-cancelled {
  opacity: 0.5;
}

.booking-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
}

.booking-start {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e0e1e4;
}

.booking-sep {
  font-size: 0.65rem;
  color: #4a4b4e;
}

.booking-end {
  font-size: 0.72rem;
  color: #8a8b8e;
}

.booking-info-col {
  flex: 1;
  min-width: 0;
}

.booking-topic {
  font-size: 0.84rem;
  font-weight: 600;
  color: #d0d1d4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  font-size: 0.7rem;
  color: #7a7b7e;
}

.booking-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.booking-status-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.booking-status-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-confirmed {
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
}

.status-cancelled {
  background: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
}

.has-notes-icon {
  color: #ffb74d;
}

/* ====== Dialogs ====== */
.dialog-card {
  background: #1a1d20;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 16px;
  min-width: 480px;
  max-width: 580px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
}

.dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e1e4;
}

.dialog-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.dialog-close-btn:hover {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.dialog-body {
  padding: 18px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid rgba(58, 59, 62, 0.3);
}

/* ====== Form ====== */
.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8a8b8e;
  margin-bottom: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-half {
  flex: 1;
}

.form-input :deep(.q-field__control) {
  background: rgba(24, 26, 28, 0.6);
  border-radius: 8px;
}

.form-input :deep(.q-field__native),
.form-input :deep(.q-field__input) {
  color: #d0d1d4;
  font-size: 0.82rem;
}

.attendees-select :deep(.q-chip) {
  background: rgba(38, 198, 218, 0.12);
  color: #26c6da;
  font-size: 0.72rem;
}

.btn-cancel {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  border-color: rgba(239, 83, 80, 0.3);
  color: #ef5350;
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: rgba(38, 198, 218, 0.18);
  color: #26c6da;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-submit:hover:not(:disabled) {
  background: rgba(38, 198, 218, 0.3);
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== Conflict Banner ====== */
.conflict-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.25);
  color: #ef5350;
  font-size: 0.78rem;
  line-height: 1.5;
  margin: 0 20px 4px;
}

.conflict-banner .q-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ====== Detail Dialog ====== */
.detail-status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.detail-section {
  margin-bottom: 18px;
}

.detail-topic {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 4px;
}

.detail-description {
  font-size: 0.82rem;
  color: #8a8b8e;
  margin-bottom: 12px;
  line-height: 1.5;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.detail-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #a0a1a4;
  padding: 8px 10px;
  background: rgba(24, 26, 28, 0.5);
  border-radius: 8px;
}

.detail-info-item .q-icon {
  color: #6b6c6f;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #8a8b8e;
  margin-bottom: 8px;
}

.detail-sub-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  margin-top: 12px;
  margin-bottom: 6px;
}

.detail-attendees {
  margin-top: 14px;
}

.attendee-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.attendee-chip {
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(66, 165, 245, 0.1);
  color: #42a5f5;
}

/* ====== Notes Section ====== */
.notes-section {
  padding-top: 16px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
}

.notes-readonly {
  font-size: 0.82rem;
  color: #b0b1b4;
  line-height: 1.6;
  padding: 10px 12px;
  background: rgba(24, 26, 28, 0.5);
  border-radius: 8px;
  white-space: pre-wrap;
}

.notes-empty {
  font-size: 0.78rem;
  color: #4a4b4e;
  padding: 10px 12px;
}

/* ====== Attachments ====== */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(24, 26, 28, 0.5);
  color: #a0a1a4;
  text-decoration: none;
  font-size: 0.78rem;
  transition: all 0.15s;
}

.attachment-item:hover {
  background: rgba(38, 198, 218, 0.06);
  color: #26c6da;
}

.attachment-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-open {
  opacity: 0.4;
}

.attachment-item:hover .attachment-open {
  opacity: 1;
}

/* ====== File Upload ====== */
.file-upload-zone {
  margin-top: 12px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed rgba(58, 59, 62, 0.4);
  color: #6b6c6f;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.upload-area:hover {
  border-color: rgba(38, 198, 218, 0.4);
  color: #26c6da;
  background: rgba(38, 198, 218, 0.04);
}

.file-input-hidden {
  display: none;
}

.pending-files {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.pending-file {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(38, 198, 218, 0.08);
  color: #a0a1a4;
  font-size: 0.75rem;
}

.pending-file span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.remove-file-btn:hover {
  opacity: 1;
}

.btn-save-notes {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-save-notes:hover:not(:disabled) {
  background: rgba(102, 187, 106, 0.28);
}

.btn-save-notes:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-cancel-booking {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid rgba(239, 83, 80, 0.3);
  background: transparent;
  color: #ef5350;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel-booking:hover {
  background: rgba(239, 83, 80, 0.1);
}

/* ====== Responsive ====== */
@media (max-width: 900px) {
  .meeting-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .meeting-page {
    padding: 16px;
  }

  .meeting-page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dialog-card {
    min-width: unset;
    max-width: 100%;
    margin: 8px;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

/* ====== Scrollbar ====== */
.bookings-list::-webkit-scrollbar,
.dialog-card::-webkit-scrollbar {
  width: 4px;
}

.bookings-list::-webkit-scrollbar-track,
.dialog-card::-webkit-scrollbar-track {
  background: transparent;
}

.bookings-list::-webkit-scrollbar-thumb,
.dialog-card::-webkit-scrollbar-thumb {
  background: rgba(58, 59, 62, 0.4);
  border-radius: 4px;
}
</style>
