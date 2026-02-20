<template>
  <q-page class="attendance-page">
    <div class="attendance-container">
      <!-- Header -->
      <div class="attendance-page-header">
        <div class="attendance-header-left">
          <div class="attendance-header-icon">
            <q-icon name="fingerprint" size="26px" />
          </div>
          <div>
            <div class="attendance-header-title">เวลาเข้า-ออก</div>
            <div class="attendance-header-subtitle">ข้อมูลเวลาสแกนนิ้วประจำเดือน</div>
          </div>
        </div>
        <div class="attendance-header-right">
          <button class="att-back-btn" @click="$router.back()">
            <q-icon name="arrow_back" size="18px" />
            <span>กลับ</span>
          </button>
        </div>
      </div>

      <!-- Controls -->
      <div class="att-controls">
        <div class="att-month-picker">
          <button class="att-month-btn" @click="changeMonth(-1)">
            <q-icon name="chevron_left" size="20px" />
          </button>
          <div class="att-month-display">
            <q-icon name="calendar_month" size="18px" />
            <span>{{ monthLabel }}</span>
          </div>
          <button class="att-month-btn" @click="changeMonth(1)">
            <q-icon name="chevron_right" size="20px" />
          </button>
        </div>

        <!-- User Selector (HR/Admin only) -->
        <div v-if="canViewAll" class="att-user-selector">
          <select v-model="selectedUserId" class="att-user-select">
            <option value="">-- ข้อมูลของฉัน --</option>
            <option v-for="u in allUsers" :key="u.email" :value="u.email">
              {{ u.firstName }} {{ u.lastName }} ({{ u.email }})
            </option>
          </select>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="att-view-toggle">
        <button class="att-view-btn" :class="{ 'att-view-btn-active': viewMode === 'table' }" @click="viewMode = 'table'">
          <q-icon name="view_list" size="18px" />
          <span>ตาราง</span>
        </button>
        <button class="att-view-btn" :class="{ 'att-view-btn-active': viewMode === 'calendar' }" @click="viewMode = 'calendar'">
          <q-icon name="calendar_view_month" size="18px" />
          <span>ปฏิทิน</span>
        </button>
      </div>

      <!-- Stats Row -->
      <div class="att-stats-row">
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #66bb6a;">
            <q-icon name="login" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.totalDays }}</div>
            <div class="att-stat-label">วันที่มาทำงาน</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #42a5f5;">
            <q-icon name="hourglass_bottom" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.totalHours }} <span class="att-stat-unit">ชม.</span></div>
            <div class="att-stat-label">ชั่วโมงทำงานรวม</div>
          </div>
        </div>
        <div class="att-stat-card" :class="{ 'att-stat-card-alert': stats.diffMin < 0, 'att-stat-card-good': stats.diffMin > 0 }">
          <div class="att-stat-icon" :style="{ color: stats.diffMin < 0 ? '#ef5350' : stats.diffMin > 0 ? '#66bb6a' : '#6b6c6f' }">
            <q-icon :name="stats.diffMin < 0 ? 'trending_down' : stats.diffMin > 0 ? 'trending_up' : 'remove'" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value" :class="{ 'att-stat-deficit': stats.diffMin < 0, 'att-stat-surplus': stats.diffMin > 0 }">{{ stats.diffLabel }} <span class="att-stat-unit">ชม.</span></div>
            <div class="att-stat-label">{{ stats.diffMin < 0 ? 'ชั่วโมงที่ขาด' : stats.diffMin > 0 ? 'ทำงานเกิน' : 'พอดี' }}</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #66bb6a;">
            <q-icon name="login" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.avgCheckIn || '-' }}</div>
            <div class="att-stat-label">เวลาเข้าเฉลี่ย</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #42a5f5;">
            <q-icon name="logout" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.avgCheckOut || '-' }}</div>
            <div class="att-stat-label">เวลาออกเฉลี่ย</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #ef5350;">
            <q-icon name="alarm" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.lateDays }}</div>
            <div class="att-stat-label">มาสาย</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #ffb74d;">
            <q-icon name="timer_off" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.shortDays }}</div>
            <div class="att-stat-label">ไม่ครบเวลา</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #ffb74d;">
            <q-icon name="warning_amber" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.missingOut }}</div>
            <div class="att-stat-label">ไม่มีเวลาออก</div>
          </div>
        </div>
        <div class="att-stat-card">
          <div class="att-stat-icon" style="color: #ab47bc;">
            <q-icon name="event_busy" size="22px" />
          </div>
          <div class="att-stat-info">
            <div class="att-stat-value">{{ stats.leaveDays }}</div>
            <div class="att-stat-label">วันลา</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="attendanceStore.loading" class="att-loading">
        <q-spinner size="28px" color="purple" />
        <span>กำลังโหลดข้อมูล...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="attendanceStore.error" class="att-empty">
        <q-icon name="error_outline" size="56px" style="color: #ef5350;" />
        <div class="att-empty-title">เกิดข้อผิดพลาด</div>
        <div class="att-empty-sub" style="color: #ef5350;">{{ attendanceStore.error }}</div>
        <div v-if="attendanceStore.error.includes('index')" class="att-empty-sub">
          กรุณาสร้าง Composite Index ใน Firebase Console (ดู Console log สำหรับลิงก์)
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="records.length === 0" class="att-empty">
        <q-icon name="event_busy" size="56px" style="color: #2a2b2e;" />
        <div class="att-empty-title">ยังไม่มีข้อมูลเวลาสแกนนิ้ว</div>
        <div class="att-empty-sub">สำหรับเดือน {{ monthLabel }}</div>
      </div>

      <!-- TABLE VIEW -->
      <div v-else-if="viewMode === 'table'" class="att-table-wrapper">
        <table class="att-table">
          <thead>
            <tr>
              <th class="att-th-date">วันที่</th>
              <th class="att-th-day">วัน</th>
              <th class="att-th-in">เวลาเข้า</th>
              <th class="att-th-out">เวลาออก</th>
              <th class="att-th-hours">ชั่วโมง</th>
              <th class="att-th-status">สถานะ</th>
              <th v-if="canViewAll" class="att-th-action"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in calendarDays" :key="day.date"
              :class="{
                'att-row-weekend': day.isWeekend,
                'att-row-today': day.isToday,
                'att-row-absent': !day.isWeekend && !day.record && day.isPast
              }">
              <td class="att-td-date">{{ day.dayNum }}</td>
              <td class="att-td-day" :class="{ 'att-day-weekend': day.isWeekend }">{{ day.dayName }}</td>
              <td class="att-td-in">
                <span v-if="day.record?.punchIn" class="att-time-in" :class="{ 'att-time-late': day.isLate }">
                  <q-icon v-if="day.record?.isManual" name="person" size="12px" class="att-manual-icon" />
                  {{ day.record.punchIn }}
                  <q-icon v-if="day.isLate" name="alarm" size="13px" class="att-late-icon" />
                </span>
                <span v-else-if="!day.isWeekend && day.isPast" class="att-time-absent">-</span>
              </td>
              <td class="att-td-out">
                <span v-if="day.record?.punchOut" class="att-time-out">{{ day.record.punchOut }}</span>
                <span v-else-if="day.record?.punchIn" class="att-time-missing">ไม่มีข้อมูล</span>
                <span v-else-if="!day.isWeekend && day.isPast" class="att-time-absent">-</span>
              </td>
              <td class="att-td-hours">
                <span v-if="day.hours">{{ day.hours }}</span>
              </td>
              <td class="att-td-status">
                <span v-if="day.isWeekend" class="att-badge att-badge-weekend">วันหยุด</span>
                <template v-else>
                  <span v-if="day.isLate" class="att-badge att-badge-late">
                    <q-icon name="alarm" size="11px" /> สาย
                  </span>
                  <span v-if="day.isShortHours" class="att-badge att-badge-short">
                    <q-icon name="timer_off" size="11px" /> ไม่ครบเวลา
                  </span>
                  <span v-else-if="!day.isLate && day.record?.punchIn && day.record?.punchOut" class="att-badge att-badge-normal">ปกติ</span>
                  <span v-else-if="day.record?.punchIn && !day.record?.punchOut" class="att-badge att-badge-warn">ไม่มีเวลาออก</span>
                  <span v-else-if="!day.record && !day.leave && day.isPast" class="att-badge att-badge-absent">ไม่มีข้อมูล</span>
                  <span v-if="day.leave" class="att-badge att-badge-leave" :class="{ 'att-badge-leave-pending': day.leave.status !== 'approved' }" :style="{ '--leave-color': (leaveTypeMap[day.leave.leaveType] || leaveTypeMap.other).color }">
                    {{ (leaveTypeMap[day.leave.leaveType] || leaveTypeMap.other).label }}
                    <template v-if="day.leave.durationType === 'half_day'"> (ครึ่งวัน)</template>
                    <template v-if="day.leave.status !== 'approved'"> ⏳</template>
                  </span>
                </template>
                <q-icon v-if="day.record?.note" name="sticky_note_2" size="13px" class="att-note-icon">
                  <q-tooltip class="att-note-tooltip">{{ day.record.note }}</q-tooltip>
                </q-icon>
              </td>
              <td v-if="canViewAll" class="att-td-action">
                <button class="att-edit-btn" @click="openEditDialog(day)">
                  <q-icon name="edit" size="14px" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CALENDAR VIEW -->
      <div v-else-if="viewMode === 'calendar'" class="cal-wrapper">
        <!-- Day-of-week headers -->
        <div class="cal-header">
          <div v-for="dn in calDayHeaders" :key="dn.short" class="cal-header-cell"
            :class="{ 'cal-header-weekend': dn.isWeekend }">
            {{ dn.short }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="cal-grid">
          <!-- Empty leading cells -->
          <div v-for="n in calLeadingBlanks" :key="'blank-' + n" class="cal-cell cal-cell-blank"></div>

          <!-- Day cells -->
          <div v-for="day in calendarDays" :key="day.date"
            class="cal-cell"
            :class="{
              'cal-cell-weekend': day.isWeekend,
              'cal-cell-today': day.isToday,
              'cal-cell-has-data': !!day.record && !day.isLate && !day.isShortHours,
              'cal-cell-late': day.isLate,
              'cal-cell-short': !day.isLate && day.isShortHours,
              'cal-cell-absent': !day.isWeekend && !day.record && !day.leave && day.isPast,
              'cal-cell-missing-out': !day.isLate && day.record?.punchIn && !day.record?.punchOut,
              'cal-cell-leave': !!day.leave && !day.isWeekend,
              'cal-cell-editable': canViewAll
            }"
            @click="canViewAll ? openEditDialog(day) : null">
            <!-- Edit icon on hover (HR only) -->
            <button v-if="canViewAll" class="cal-edit-btn" @click.stop="openEditDialog(day)">
              <q-icon name="edit" size="11px" />
            </button>

            <!-- Day number -->
            <div class="cal-day-num-row">
              <div class="cal-day-num" :class="{ 'cal-day-weekend-num': day.isWeekend, 'cal-day-today-num': day.isToday }">
                {{ day.dayNum }}
              </div>
              <q-icon v-if="day.isLate" name="alarm" size="12px" class="cal-late-icon" />
              <q-icon v-if="day.isShortHours" name="timer_off" size="12px" class="cal-short-icon" />
            </div>

            <!-- Punch data -->
            <div v-if="day.record" class="cal-punch-data">
              <div class="cal-punch-row">
                <q-icon name="login" size="10px" class="cal-icon-in" />
                <span class="cal-time-in">{{ day.record.punchIn }}</span>
              </div>
              <div v-if="day.record.punchOut" class="cal-punch-row">
                <q-icon name="logout" size="10px" class="cal-icon-out" />
                <span class="cal-time-out">{{ day.record.punchOut }}</span>
              </div>
              <div v-else class="cal-punch-row cal-no-out">
                <q-icon name="help_outline" size="10px" />
                <span>ไม่มี</span>
              </div>
              <div v-if="day.hours" class="cal-hours">{{ day.hours }} ชม.</div>
              <div v-if="day.record.note" class="cal-note-indicator">
                <q-icon name="sticky_note_2" size="10px" />
              </div>
            </div>

            <!-- Leave pill (shown alongside punch data or standalone) -->
            <div v-if="day.leave && !day.isWeekend" class="cal-leave-pill" :class="{ 'cal-leave-pending': day.leave.status !== 'approved' }" :style="{ '--leave-color': (leaveTypeMap[day.leave.leaveType] || leaveTypeMap.other).color }">
              {{ (leaveTypeMap[day.leave.leaveType] || leaveTypeMap.other).label }}<template v-if="day.leave.durationType === 'half_day'"> ½</template>
            </div>

            <!-- Weekend / No data indicators -->
            <div v-else-if="day.isWeekend" class="cal-weekend-label">หยุด</div>
            <div v-else-if="!day.record && day.isPast" class="cal-absent-label">-</div>
          </div>
        </div>

        <!-- Legend -->
        <div class="cal-legend">
          <div class="cal-legend-item">
            <q-icon name="login" size="13px" style="color: #66bb6a;" />
            <span>เวลาเข้า</span>
          </div>
          <div class="cal-legend-item">
            <q-icon name="logout" size="13px" style="color: #42a5f5;" />
            <span>เวลาออก</span>
          </div>
          <div class="cal-legend-item">
            <q-icon name="alarm" size="13px" style="color: #ef5350;" />
            <span>สาย (หลัง 9:15)</span>
          </div>
          <div class="cal-legend-item">
            <q-icon name="timer_off" size="13px" style="color: #ffb74d;" />
            <span>ไม่ครบเวลา</span>
          </div>
          <div class="cal-legend-item">
            <q-icon name="help_outline" size="13px" style="color: #ffb74d;" />
            <span>ไม่มีเวลาออก</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-border" style="border-color: #3a3b3e;"></div>
            <span>วันหยุด / ไม่มีข้อมูล</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-pill" style="background: rgba(239,83,80,0.16); color: #ef5350;">ลา</div>
            <span>ลาป่วย</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-pill" style="background: rgba(255,183,77,0.16); color: #ffb74d;">ลา</div>
            <span>ลากิจ</span>
          </div>
          <div class="cal-legend-item">
            <div class="cal-legend-pill" style="background: rgba(66,165,245,0.16); color: #42a5f5;">ลา</div>
            <span>ลาพักร้อน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Attendance Dialog -->
    <q-dialog v-model="showEditDialog" persistent class="att-edit-dialog-backdrop">
      <div class="att-edit-dialog">
        <div class="att-edit-header">
          <div class="att-edit-header-icon">
            <q-icon :name="editDay?.record ? 'edit' : 'add_circle_outline'" size="22px" />
          </div>
          <div>
            <div class="att-edit-title">{{ editDay?.record ? 'แก้ไขเวลาเข้า-ออก' : 'เพิ่มเวลาเข้า-ออก' }}</div>
            <div class="att-edit-subtitle">{{ editDay?.dayNum }} {{ monthLabel }} ({{ editDay?.dayName }})</div>
          </div>
        </div>

        <div class="att-edit-body">
          <div class="att-edit-fields-row">
            <div class="att-edit-field">
              <label class="att-edit-label">เวลาเข้า</label>
              <input v-model="editPunchIn" type="time" class="att-edit-input" />
            </div>
            <div class="att-edit-field">
              <label class="att-edit-label">เวลาออก</label>
              <input v-model="editPunchOut" type="time" class="att-edit-input" />
            </div>
          </div>

          <div class="att-edit-field">
            <label class="att-edit-label">หมายเหตุ / เหตุผล</label>
            <textarea v-model="editNote" class="att-edit-textarea" rows="3"
              placeholder="เช่น ไปทำงานต่างจังหวัด, ลืมสแกนนิ้ว..."></textarea>
          </div>

          <div v-if="editDay?.record?.isManual" class="att-edit-manual-hint">
            <q-icon name="person" size="14px" />
            <span>รายการนี้สร้างด้วยมือโดย HR</span>
          </div>
        </div>

        <div class="att-edit-actions">
          <button v-if="editDay?.record?.isManual" class="att-edit-delete-btn" :disabled="editSaving" @click="handleEditDelete">
            <q-icon name="delete_outline" size="16px" />
            <span>ลบ</span>
          </button>
          <div style="flex: 1;"></div>
          <button class="att-edit-cancel-btn" @click="closeEditDialog">
            <q-icon name="close" size="16px" />
            <span>ยกเลิก</span>
          </button>
          <button class="att-edit-save-btn" :disabled="editSaving" @click="handleEditSave">
            <q-spinner v-if="editSaving" size="14px" color="white" />
            <q-icon v-else name="save" size="16px" />
            <span>{{ editSaving ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAttendanceStore } from 'stores/attendance'
import { useAuthStore } from 'stores/auth'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const now = new Date()
const currentMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const selectedUserId = ref('')
const records = ref([])
const leaves = ref([])
const viewMode = ref('calendar')

const leaveTypeMap = {
  sick: { label: 'ลาป่วย', icon: '🤒', color: '#ef5350' },
  personal: { label: 'ลากิจ', icon: '📋', color: '#ffb74d' },
  vacation: { label: 'ลาพักร้อน', icon: '🏖️', color: '#42a5f5' },
  maternity: { label: 'ลาคลอด', icon: '🤱', color: '#ec407a' },
  unpaid: { label: 'ลาไม่รับค่าจ้าง', icon: '💼', color: '#9e9e9e' },
  other: { label: 'ลาอื่นๆ', icon: '📝', color: '#9e9e9e' }
}

const canViewAll = computed(() => authStore.isSuperAdmin || authStore.isHR)

const allUsers = computed(() => {
  return [...authStore.allProfiles].sort((a, b) =>
    (a.firstName || '').localeCompare(b.firstName || '')
  )
})

const effectiveUserId = computed(() => selectedUserId.value || authStore.profile?.email || '')

const monthLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-')
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${months[parseInt(m) - 1]} ${y}`
})

const changeMonth = (delta) => {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

const LATE_THRESHOLD = 9 * 60 + 15 // 09:15
const LUNCH_BREAK_MINUTES = 60
const REQUIRED_MINUTES = 450 // 7h30m

const calendarDays = computed(() => {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const recordMap = {}
  records.value.forEach(r => { recordMap[r.date] = r })

  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(y, m - 1, d)
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const record = recordMap[dateStr] || null

    let hours = ''
    let workedMinutes = 0
    let isLate = false
    let isShortHours = false

    if (record?.punchIn) {
      const [hIn, mIn] = record.punchIn.split(':').map(Number)
      const punchInMin = hIn * 60 + mIn
      isLate = punchInMin > LATE_THRESHOLD

      if (record.punchOut) {
        const [hOut, mOut] = record.punchOut.split(':').map(Number)
        const grossMinutes = (hOut * 60 + mOut) - punchInMin
        workedMinutes = grossMinutes > LUNCH_BREAK_MINUTES ? grossMinutes - LUNCH_BREAK_MINUTES : grossMinutes
        if (workedMinutes > 0) {
          const h = Math.floor(workedMinutes / 60)
          const min = workedMinutes % 60
          hours = `${h}:${String(min).padStart(2, '0')}`
        }
        if (workedMinutes > 0 && workedMinutes < REQUIRED_MINUTES) {
          isShortHours = true
        }
      }
    }

    const leave = leaves.value.find(l => l.startDate <= dateStr && l.endDate >= dateStr) || null

    days.push({
      dayNum: d,
      date: dateStr,
      dayName: dayNames[dayOfWeek],
      isWeekend,
      isToday: dateStr === todayStr,
      isPast: dateObj <= today,
      record,
      hours,
      isLate,
      isShortHours,
      workedMinutes,
      leave
    })
  }
  return days
})

// Calendar grid helpers
const calDayHeaders = [
  { short: 'จ.', isWeekend: false },
  { short: 'อ.', isWeekend: false },
  { short: 'พ.', isWeekend: false },
  { short: 'พฤ.', isWeekend: false },
  { short: 'ศ.', isWeekend: false },
  { short: 'ส.', isWeekend: true },
  { short: 'อา.', isWeekend: true }
]

const calLeadingBlanks = computed(() => {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1).getDay() // 0=Sun
  // Convert to Mon-based: Mon=0, Tue=1, ... Sun=6
  return firstDay === 0 ? 6 : firstDay - 1
})

const stats = computed(() => {
  const recs = records.value
  const totalDays = recs.length
  const withOut = recs.filter(r => r.punchIn && r.punchOut)
  const missingOut = recs.filter(r => r.punchIn && !r.punchOut).length

  const lateDays = calendarDays.value.filter(d => d.isLate).length
  const shortDays = calendarDays.value.filter(d => d.isShortHours).length

  let avgCheckIn = ''
  let avgCheckOut = ''

  if (recs.length > 0) {
    const inMinutes = recs.filter(r => r.punchIn).map(r => {
      const [h, m] = r.punchIn.split(':').map(Number)
      return h * 60 + m
    })
    if (inMinutes.length > 0) {
      const avg = Math.round(inMinutes.reduce((a, b) => a + b, 0) / inMinutes.length)
      avgCheckIn = `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`
    }
  }

  if (withOut.length > 0) {
    const outMinutes = withOut.map(r => {
      const [h, m] = r.punchOut.split(':').map(Number)
      return h * 60 + m
    })
    const avg = Math.round(outMinutes.reduce((a, b) => a + b, 0) / outMinutes.length)
    avgCheckOut = `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`
  }

  const leaveDays = calendarDays.value.filter(d => d.leave && d.leave.status === 'approved' && !d.isWeekend).length

  const totalWorkedMin = calendarDays.value.reduce((sum, d) => sum + d.workedMinutes, 0)
  const totalWorkedH = Math.floor(totalWorkedMin / 60)
  const totalWorkedM = totalWorkedMin % 60
  const totalHours = `${totalWorkedH}:${String(totalWorkedM).padStart(2, '0')}`

  const expectedMin = totalDays * REQUIRED_MINUTES
  const diffMin = totalWorkedMin - expectedMin
  const absDiffMin = Math.abs(diffMin)
  const diffH = Math.floor(absDiffMin / 60)
  const diffM = absDiffMin % 60
  const diffLabel = `${diffMin >= 0 ? '+' : '-'}${diffH}:${String(diffM).padStart(2, '0')}`

  return { totalDays, avgCheckIn, avgCheckOut, missingOut, lateDays, shortDays, leaveDays, totalHours, diffMin, diffLabel }
})

const loadData = async () => {
  if (!effectiveUserId.value) return
  const [data, userLeaves] = await Promise.all([
    attendanceStore.fetchMonthlyAttendance(effectiveUserId.value, currentMonth.value),
    attendanceStore.fetchUserLeaves(effectiveUserId.value, currentMonth.value)
  ])
  records.value = data
  leaves.value = userLeaves
}

// Watch for month or selected user changes to reload data
watch([currentMonth, selectedUserId], () => loadData())

// Watch for auth profile becoming available (initial load timing)
watch(() => authStore.profile?.email, (newEmail) => {
  if (newEmail && records.value.length === 0) {
    loadData()
  }
})

onMounted(async () => {
  if (canViewAll.value) {
    await authStore.fetchAllProfiles()
  }
  await loadData()
})

// ====== Edit Dialog ======
const showEditDialog = ref(false)
const editDay = ref(null)
const editPunchIn = ref('')
const editPunchOut = ref('')
const editNote = ref('')
const editSaving = ref(false)

const openEditDialog = (day) => {
  editDay.value = day
  editPunchIn.value = day.record?.punchIn || ''
  editPunchOut.value = day.record?.punchOut || ''
  editNote.value = day.record?.note || ''
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editDay.value = null
  editPunchIn.value = ''
  editPunchOut.value = ''
  editNote.value = ''
}

const handleEditSave = async () => {
  if (!editDay.value) return
  editSaving.value = true

  const day = editDay.value
  const hrEmail = authStore.profile?.email || ''

  let success = false

  if (day.record?.id) {
    success = await attendanceStore.updateRecord(day.record.id, {
      punchIn: editPunchIn.value || null,
      punchOut: editPunchOut.value || null,
      note: editNote.value,
      editedBy: hrEmail
    })
  } else {
    const targetUser = allUsers.value.find(u => u.email === effectiveUserId.value)
    success = await attendanceStore.upsertRecord({
      userId: effectiveUserId.value,
      userName: targetUser ? `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() : '',
      date: day.date,
      punchIn: editPunchIn.value || null,
      punchOut: editPunchOut.value || null,
      note: editNote.value,
      department: targetUser?.department || '',
      importMonth: currentMonth.value,
      editedBy: hrEmail
    })
  }

  editSaving.value = false

  if (success) {
    closeEditDialog()
    await loadData()
  }
}

const handleEditDelete = async () => {
  if (!editDay.value?.record?.id || !editDay.value.record.isManual) return
  const confirmed = confirm('ต้องการลบรายการนี้ใช่หรือไม่?')
  if (!confirmed) return

  editSaving.value = true
  const success = await attendanceStore.deleteRecord(editDay.value.record.id)
  editSaving.value = false

  if (success) {
    closeEditDialog()
    await loadData()
  }
}
</script>

<style scoped>
.attendance-page {
  padding: 20px;
  min-height: 100vh;
}

.attendance-container {
  max-width: 900px;
  margin: 0 auto;
}

.attendance-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.attendance-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.attendance-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(171, 71, 188, 0.15) 0%, rgba(123, 31, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ab47bc;
}

.attendance-header-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #e4e5e7;
}

.attendance-header-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.att-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #cecfd2;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.att-back-btn:hover {
  background: rgba(58, 59, 62, 0.15);
}

/* Controls */
.att-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.att-month-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(24, 25, 28, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 4px;
}

.att-month-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #cecfd2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.att-month-btn:hover {
  background: rgba(58, 59, 62, 0.2);
}

.att-month-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e4e5e7;
  min-width: 100px;
  justify-content: center;
}

.att-user-selector {
  flex: 1;
  min-width: 200px;
}

.att-user-select {
  width: 100%;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(24, 25, 28, 0.5);
  color: #e4e5e7;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.att-user-select:focus {
  border-color: rgba(171, 71, 188, 0.5);
}

/* Stats */
.att-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.att-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(24, 25, 28, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.2);
  border-radius: 12px;
}

.att-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(58, 59, 62, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.att-stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e4e5e7;
}

.att-stat-label {
  font-size: 0.7rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.att-stat-unit {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6b6c6f;
}

.att-stat-card-alert {
  border-color: rgba(239, 83, 80, 0.25);
  background: rgba(239, 83, 80, 0.04);
}

.att-stat-card-good {
  border-color: rgba(102, 187, 106, 0.25);
  background: rgba(102, 187, 106, 0.04);
}

.att-stat-deficit { color: #ef5350; }
.att-stat-surplus { color: #66bb6a; }

/* Loading/Empty */
.att-loading, .att-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b6c6f;
  font-size: 0.85rem;
}

.att-empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #cecfd2;
}

.att-empty-sub {
  font-size: 0.78rem;
  color: #6b6c6f;
}

/* Table */
.att-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(58, 59, 62, 0.2);
  border-radius: 12px;
  background: rgba(24, 25, 28, 0.3);
}

.att-table-wrapper::-webkit-scrollbar { width: 4px; height: 4px; }
.att-table-wrapper::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.4); border-radius: 2px; }

.att-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.att-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.att-table th {
  padding: 10px 14px;
  background: rgba(24, 25, 28, 0.95);
  color: #6b6c6f;
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: left;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
}

.att-table td {
  padding: 10px 14px;
  color: #cecfd2;
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
}

.att-table tbody tr:hover {
  background: rgba(58, 59, 62, 0.06);
}

.att-row-weekend {
  background: rgba(58, 59, 62, 0.04);
}

.att-row-weekend td { color: #4a4b4e; }

.att-row-today {
  background: rgba(171, 71, 188, 0.06) !important;
}

.att-row-today td {
  color: #e4e5e7;
}

.att-row-absent td {
  color: #4a4b4e;
}

.att-day-weekend {
  color: #ef5350 !important;
}

.att-td-date {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  width: 50px;
}

.att-td-day {
  width: 50px;
}

.att-time-in {
  color: #66bb6a;
  font-family: monospace;
  font-weight: 600;
}

.att-time-out {
  color: #42a5f5;
  font-family: monospace;
  font-weight: 600;
}

.att-time-missing {
  color: #ffb74d;
  font-size: 0.72rem;
  font-style: italic;
}

.att-time-absent {
  color: #3a3b3e;
}

.att-td-hours {
  font-family: monospace;
  font-variant-numeric: tabular-nums;
  color: #9e9fa2;
}

/* Badges */
.att-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 600;
}

.att-badge-normal {
  background: rgba(102, 187, 106, 0.1);
  color: #66bb6a;
}

.att-badge-warn {
  background: rgba(255, 183, 77, 0.1);
  color: #ffb74d;
}

.att-badge-absent {
  background: rgba(239, 83, 80, 0.08);
  color: #ef5350;
}

.att-badge-late {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
  gap: 3px;
}

.att-badge-short {
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
  gap: 3px;
}

.att-badge-weekend {
  background: rgba(58, 59, 62, 0.1);
  color: #4a4b4e;
}

.att-badge-leave {
  background: color-mix(in srgb, var(--leave-color) 14%, transparent);
  color: var(--leave-color);
  gap: 3px;
}

.att-badge-leave-pending {
  opacity: 0.6;
  border: 1px dashed var(--leave-color);
}

/* Late icon inline with punch-in time */
.att-time-late {
  color: #ef5350 !important;
}

.att-late-icon {
  color: #ef5350;
  margin-left: 4px;
  vertical-align: middle;
}

/* View Toggle */
.att-view-toggle {
  display: flex;
  gap: 2px;
  background: rgba(24, 25, 28, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 16px;
  width: fit-content;
}

.att-view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.att-view-btn:hover {
  color: #cecfd2;
}

.att-view-btn-active {
  background: rgba(171, 71, 188, 0.15);
  color: #ce93d8;
}

/* Calendar View */
.cal-wrapper {
  border: 1px solid rgba(58, 59, 62, 0.2);
  border-radius: 14px;
  background: rgba(24, 25, 28, 0.3);
  overflow: hidden;
}

.cal-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid rgba(58, 59, 62, 0.25);
}

.cal-header-cell {
  padding: 10px 4px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.cal-header-weekend {
  color: #ef5350;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
  min-height: 90px;
  padding: 6px 7px;
  border-right: 1px solid rgba(58, 59, 62, 0.1);
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
  display: flex;
  flex-direction: column;
  transition: background 0.15s;
  position: relative;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

.cal-cell:hover {
  background: rgba(58, 59, 62, 0.06);
}

.cal-cell-blank {
  background: transparent;
  min-height: 0;
  height: 0;
  padding: 0;
  border: none;
}

.cal-cell-weekend {
  background: rgba(58, 59, 62, 0.03);
}

.cal-cell-today {
  background: rgba(171, 71, 188, 0.06);
}

.cal-cell-today::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ab47bc, #7b1fa2);
}

.cal-cell-has-data {
  border-left: 2px solid rgba(102, 187, 106, 0.4);
}

.cal-cell-absent {
  border-left: 2px solid rgba(239, 83, 80, 0.15);
}

.cal-cell-missing-out {
  border-left: 2px solid rgba(255, 183, 77, 0.4);
}

.cal-cell-late {
  border-left: 2px solid rgba(239, 83, 80, 0.5);
  background: rgba(239, 83, 80, 0.03);
}

.cal-cell-short {
  border-left: 2px solid rgba(255, 183, 77, 0.5);
  background: rgba(255, 183, 77, 0.03);
}

.cal-cell-leave {
  border-left: 2px solid rgba(171, 71, 188, 0.45);
  background: rgba(171, 71, 188, 0.03);
}

/* Day number row (number + late icon) */
.cal-day-num-row {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 4px;
}

.cal-late-icon {
  color: #ef5350;
}

.cal-short-icon {
  color: #ffb74d;
}

/* Day number */
.cal-day-num {
  font-size: 0.78rem;
  font-weight: 700;
  color: #9e9fa2;
}

.cal-day-weekend-num {
  color: #ef5350;
  opacity: 0.6;
}

.cal-day-today-num {
  color: #ce93d8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(171, 71, 188, 0.2);
}

/* Punch data in cell */
.cal-punch-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.cal-punch-row {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-family: monospace;
  line-height: 1.3;
}

.cal-icon-in { color: #66bb6a; }
.cal-icon-out { color: #42a5f5; }

.cal-time-in { color: #66bb6a; font-weight: 600; }
.cal-time-out { color: #42a5f5; font-weight: 600; }

.cal-no-out {
  color: #ffb74d;
  font-family: inherit;
  font-size: 0.62rem;
}

.cal-hours {
  font-size: 0.6rem;
  color: #6b6c6f;
  margin-top: 1px;
  font-family: monospace;
}

.cal-weekend-label {
  font-size: 0.62rem;
  color: #3a3b3e;
  margin-top: auto;
  text-align: center;
}

.cal-absent-label {
  font-size: 0.72rem;
  color: #3a3b3e;
  margin-top: auto;
  text-align: center;
}

/* Legend */
.cal-legend {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  border-top: 1px solid rgba(58, 59, 62, 0.15);
  flex-wrap: wrap;
}

.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #6b6c6f;
}

.cal-legend-border {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border-left: 3px solid;
  background: rgba(58, 59, 62, 0.06);
}

.cal-legend-pill {
  font-size: 0.55rem;
  font-weight: 700;
  padding: 0px 4px;
  border-radius: 4px;
  line-height: 1.5;
}

/* Table edit column */
.att-th-action {
  width: 40px;
}

.att-td-action {
  text-align: center;
}

.att-edit-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.att-edit-btn:hover {
  background: rgba(171, 71, 188, 0.12);
  color: #ce93d8;
}

/* Note icon */
.att-note-icon {
  color: #ffb74d;
  margin-left: 5px;
  vertical-align: middle;
  cursor: help;
}

.att-note-tooltip {
  font-size: 0.78rem;
  max-width: 260px;
}

/* Manual badge */
.att-manual-icon {
  color: #7e57c2;
  margin-right: 3px;
  vertical-align: middle;
}

/* Calendar edit button (hover) */
.cal-edit-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: none;
  background: rgba(171, 71, 188, 0.15);
  color: #ce93d8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 2;
}

.cal-cell-editable {
  cursor: pointer;
}

.cal-cell-editable:hover .cal-edit-btn {
  opacity: 1;
}

/* Calendar note indicator */
.cal-note-indicator {
  color: #ffb74d;
  font-size: 0.58rem;
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Calendar leave pill */
.cal-leave-pill {
  font-size: 0.58rem;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 6px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: color-mix(in srgb, var(--leave-color) 16%, transparent);
  color: var(--leave-color);
}

.cal-leave-pending {
  opacity: 0.6;
  border: 1px dashed var(--leave-color);
}

/* Edit Dialog */
.att-edit-dialog {
  background: #1e1f22;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 16px;
  padding: 0;
  min-width: 380px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.att-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.att-edit-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(171, 71, 188, 0.15) 0%, rgba(123, 31, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ab47bc;
}

.att-edit-title {
  font-size: 1rem;
  font-weight: 700;
  color: #e4e5e7;
}

.att-edit-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.att-edit-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.att-edit-fields-row {
  display: flex;
  gap: 12px;
}

.att-edit-fields-row .att-edit-field {
  flex: 1;
}

.att-edit-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.att-edit-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.att-edit-input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(24, 25, 28, 0.6);
  color: #e4e5e7;
  font-size: 0.9rem;
  font-family: monospace;
  outline: none;
  transition: border-color 0.2s;
}

.att-edit-input:focus {
  border-color: rgba(171, 71, 188, 0.5);
}

.att-edit-textarea {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(24, 25, 28, 0.6);
  color: #e4e5e7;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s;
}

.att-edit-textarea:focus {
  border-color: rgba(171, 71, 188, 0.5);
}

.att-edit-manual-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #7e57c2;
  padding: 6px 10px;
  background: rgba(126, 87, 194, 0.08);
  border-radius: 8px;
}

.att-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
}

.att-edit-cancel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #cecfd2;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.att-edit-cancel-btn:hover {
  background: rgba(58, 59, 62, 0.15);
}

.att-edit-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.att-edit-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(171, 71, 188, 0.3);
}

.att-edit-save-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.att-edit-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  border: 1px solid rgba(239, 83, 80, 0.3);
  background: rgba(239, 83, 80, 0.08);
  color: #ef5350;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.att-edit-delete-btn:hover:not(:disabled) {
  background: rgba(239, 83, 80, 0.18);
  border-color: rgba(239, 83, 80, 0.5);
}

.att-edit-delete-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 640px) {
  .attendance-page { padding: 14px; }
  .att-controls { flex-direction: column; align-items: stretch; }
  .att-stats-row { grid-template-columns: repeat(2, 1fr); }
  .att-table { font-size: 0.75rem; }
  .att-table th, .att-table td { padding: 8px 10px; }

  .cal-cell { min-height: 70px; padding: 4px 3px; }
  .cal-day-num { font-size: 0.68rem; }
  .cal-punch-row { font-size: 0.58rem; gap: 2px; }
  .cal-punch-row .q-icon { font-size: 8px !important; }
  .cal-hours { font-size: 0.52rem; }
  .cal-no-out { font-size: 0.54rem; }
  .cal-header-cell { font-size: 0.62rem; padding: 8px 2px; }
  .att-edit-dialog { min-width: unset; max-width: 100%; }
  .att-edit-fields-row { flex-direction: column; gap: 12px; }
}
</style>
