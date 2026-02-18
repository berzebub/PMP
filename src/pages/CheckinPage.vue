<template>
  <q-page class="checkin-page">
    <div class="checkin-container">
      <!-- Header -->
      <div class="checkin-page-header">
        <div class="checkin-header-left">
          <div class="checkin-header-icon">
            <q-icon name="event_available" size="26px" />
          </div>
          <div>
            <div class="checkin-header-title">Daily Standup</div>
            <div class="checkin-header-subtitle">ติดตามการเช็คชื่อ Agile Standup ของคุณ</div>
          </div>
        </div>
        <div class="checkin-header-right"></div>
      </div>

      <!-- Stats Cards Row -->
      <div class="stats-row">
        <div class="stat-card stat-streak">
          <div class="stat-card-icon streak-fire-icon"
            :class="`streak-tier-${checkinStore.streakTier.tier}`">🔥</div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ checkinStore.currentStreak }}</div>
            <div class="stat-card-label">{{ checkinStore.streakTier.label || 'Streak' }}</div>
          </div>
        </div>
        <div class="stat-card stat-longest">
          <div class="stat-card-icon">🏆</div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ checkinStore.longestStreak }}</div>
            <div class="stat-card-label">Streak สูงสุด</div>
          </div>
        </div>
        <div class="stat-card stat-level">
          <div class="stat-card-icon">{{ checkinStore.currentLevel.icon }}</div>
          <div class="stat-card-info">
            <div class="stat-card-value">Lv.{{ checkinStore.currentLevel.level }}</div>
            <div class="stat-card-label">{{ checkinStore.currentLevel.name }}</div>
          </div>
          <div class="stat-level-progress">
            <div class="stat-level-bar" :style="{ width: checkinStore.currentLevel.progress + '%' }"></div>
          </div>
        </div>
        <div class="stat-card stat-month">
          <div class="stat-card-icon">📅</div>
          <div class="stat-card-info">
            <div class="stat-card-value">{{ checkinStore.thisMonthCount }}</div>
            <div class="stat-card-label">วันเดือนนี้</div>
          </div>
        </div>
      </div>

      <!-- Badges Section -->
      <div v-if="checkinStore.badges.length > 0" class="badges-section">
        <div class="badges-header">
          <q-icon name="military_tech" size="18px" style="color: #ffa726;" />
          <span class="badges-title">Achievements</span>
          <q-badge :label="checkinStore.badges.length" class="badges-count" />
        </div>
        <div class="badges-grid">
          <div v-for="badge in checkinStore.badges" :key="badge.id" class="badge-item">
            <span class="badge-icon">{{ badge.icon }}</span>
            <div class="badge-info">
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-desc">{{ badge.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="checkin-grid">
        <!-- Left: Calendar Heatmap -->
        <div class="checkin-card calendar-card">
          <div class="card-header">
            <q-icon name="calendar_month" size="18px" style="color: #5c9ce6;" />
            <span class="card-title">ปฏิทินการเช็คชื่อ</span>
            <div style="flex:1"></div>
            <button class="month-nav-btn" @click="prevMonth">
              <q-icon name="chevron_left" size="18px" />
            </button>
            <span class="month-label">{{ currentMonthLabel }}</span>
            <button class="month-nav-btn" @click="nextMonth" :disabled="isCurrentMonth">
              <q-icon name="chevron_right" size="18px" />
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="cal-weekdays">
            <div v-for="day in weekDays" :key="day" class="cal-weekday">{{ day }}</div>
          </div>
          <div class="cal-grid">
            <div v-for="(cell, idx) in calendarCells" :key="idx"
              class="cal-cell"
              :class="{
                'cal-empty': !cell.day,
                'cal-checked': cell.checkedIn,
                'cal-today': cell.isToday,
                'cal-future': cell.isFuture
              }"
              @mouseenter="hoveredCell = cell"
              @mouseleave="hoveredCell = null">
              <span v-if="cell.day" class="cal-day-num">{{ cell.day }}</span>
              <span v-if="cell.checkedIn && cell.mood" class="cal-mood">{{ cell.mood }}</span>
              <span v-else-if="cell.checkedIn" class="cal-check-dot"></span>
            </div>
          </div>

          <!-- Hover tooltip -->
          <div v-if="hoveredCell?.checkedIn" class="cal-tooltip">
            <div class="cal-tooltip-top">
              <span class="cal-tooltip-date">{{ hoveredCell.dateStr }}</span>
              <span v-if="hoveredCell.mood" class="cal-tooltip-mood">{{ hoveredCell.mood }}</span>
            </div>
            <span class="cal-tooltip-time">เช็คชื่อเวลา {{ hoveredCell.time }}</span>
            <div v-if="hoveredCell.yesterday" class="cal-tooltip-answer">
              <span class="cal-tooltip-label">⏪</span> {{ hoveredCell.yesterday }}
            </div>
            <div v-if="hoveredCell.today" class="cal-tooltip-answer">
              <span class="cal-tooltip-label">🎯</span> {{ hoveredCell.today }}
            </div>
            <div v-if="hoveredCell.blockers" class="cal-tooltip-answer">
              <span class="cal-tooltip-label">🚧</span> {{ hoveredCell.blockers }}
            </div>
            <div v-if="hoveredCell.note && !hoveredCell.yesterday" class="cal-tooltip-answer">
              "{{ hoveredCell.note }}"
            </div>
          </div>

          <!-- Legend -->
          <div class="cal-legend">
            <div class="cal-legend-item">
              <span class="cal-legend-dot cal-legend-checked"></span>
              <span>เช็คชื่อแล้ว</span>
            </div>
            <div class="cal-legend-item">
              <span class="cal-legend-dot cal-legend-today"></span>
              <span>วันนี้</span>
            </div>
            <div class="cal-legend-item">
              <span class="cal-legend-dot cal-legend-missed"></span>
              <span>ไม่ได้เช็คชื่อ</span>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="checkin-right-col">
          <!-- Team Check-in Today -->
          <div class="checkin-card team-card">
            <div class="card-header">
              <q-icon name="groups" size="18px" style="color: #66bb6a;" />
              <span class="card-title">ทีมวันนี้</span>
              <q-badge :label="checkinStore.teamCheckins.length" class="team-count-badge" />
              <div style="flex:1"></div>
              <button class="refresh-btn" @click="checkinStore.fetchTeamCheckins()">
                <q-icon name="refresh" size="16px" />
              </button>
            </div>

            <div v-if="checkinStore.teamCheckins.length === 0" class="team-empty">
              <q-icon name="group_off" size="36px" style="color: #2a2b2e;" />
              <span>ยังไม่มีใครเช็คชื่อวันนี้</span>
            </div>

            <div v-else class="team-list">
              <div v-for="ci in sortedTeamCheckins" :key="ci.id" class="team-item-card"
                @click="expandedTeamId = expandedTeamId === ci.id ? null : ci.id">
                <div class="team-item-header">
                  <div class="team-avatar">
                    <img v-if="authStore.getPhotoURL(ci.userId)" :src="authStore.getPhotoURL(ci.userId)" class="team-avatar-img" />
                    <span v-else>{{ ci.userName?.charAt(0).toUpperCase() || '?' }}</span>
                  </div>
                  <div class="team-info">
                    <div class="team-name">{{ ci.userName }}</div>
                    <div class="team-time">{{ formatTime(ci.checkedInAt) }}</div>
                  </div>
                  <div v-if="ci.mood" class="team-mood">{{ ci.mood }}</div>
                  <q-icon :name="expandedTeamId === ci.id ? 'expand_less' : 'expand_more'" size="16px" class="team-expand-icon" />
                </div>
                <div v-if="expandedTeamId === ci.id" class="team-answers">
                  <div class="team-answer" v-if="ci.yesterday || ci.note">
                    <span class="team-answer-label">⏪ เมื่อวาน:</span>
                    <span class="team-answer-text">{{ ci.yesterday || ci.note }}</span>
                  </div>
                  <div class="team-answer" v-if="ci.today">
                    <span class="team-answer-label">🎯 วันนี้:</span>
                    <span class="team-answer-text">{{ ci.today }}</span>
                  </div>
                  <div class="team-answer" v-if="ci.blockers">
                    <span class="team-answer-label">🚧 อุปสรรค:</span>
                    <span class="team-answer-text">{{ ci.blockers }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent History -->
          <div class="checkin-card history-card">
            <div class="card-header">
              <q-icon name="history" size="18px" style="color: #ffb74d;" />
              <span class="card-title">ประวัติล่าสุด</span>
            </div>

            <div v-if="recentHistory.length === 0" class="history-empty">
              <span>ยังไม่มีประวัติ</span>
            </div>

            <div v-else class="history-list">
              <div v-for="ci in recentHistory" :key="ci.id" class="history-item-card"
                @click="expandedHistoryId = expandedHistoryId === ci.id ? null : ci.id">
                <div class="history-item-header">
                  <div class="history-dot"></div>
                  <div class="history-info">
                    <div class="history-date">{{ formatHistoryDate(ci.date) }}</div>
                    <div class="history-time">{{ formatTime(ci.checkedInAt) }}</div>
                  </div>
                  <div v-if="ci.mood" class="history-mood">{{ ci.mood }}</div>
                  <q-icon :name="expandedHistoryId === ci.id ? 'expand_less' : 'expand_more'" size="14px" class="history-expand-icon" />
                </div>
                <div v-if="expandedHistoryId === ci.id" class="history-answers">
                  <div class="history-answer" v-if="ci.yesterday || ci.note">
                    <span class="history-answer-label">⏪ เมื่อวาน</span>
                    <span class="history-answer-text">{{ ci.yesterday || ci.note }}</span>
                  </div>
                  <div class="history-answer" v-if="ci.today">
                    <span class="history-answer-label">🎯 วันนี้</span>
                    <span class="history-answer-text">{{ ci.today }}</span>
                  </div>
                  <div class="history-answer" v-if="ci.blockers">
                    <span class="history-answer-label">🚧 อุปสรรค</span>
                    <span class="history-answer-text">{{ ci.blockers }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckinStore } from 'stores/checkin'
import { useAuthStore } from 'stores/auth'

const checkinStore = useCheckinStore()
const authStore = useAuthStore()

const hoveredCell = ref(null)
const expandedTeamId = ref(null)
const expandedHistoryId = ref(null)
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

onMounted(async () => {
  await checkinStore.fetchCheckinHistory(365)
  await checkinStore.fetchTeamCheckins()
})

// Calendar navigation
const currentMonthLabel = computed(() => {
  const date = new Date(calendarYear.value, calendarMonth.value)
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return calendarMonth.value === now.getMonth() && calendarYear.value === now.getFullYear()
})

const prevMonth = () => {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

const nextMonth = () => {
  if (isCurrentMonth.value) return
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

// Generate calendar cells for the current month view
const calendarCells = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayStr = checkinStore.getTodayDateStr()

  const cells = []

  // Empty cells for days before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null })
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const checkin = checkinStore.checkinHistory.find(c => c.date === dateStr)
    const cellDate = new Date(year, month, d)
    const isToday = dateStr === todayStr
    const isFuture = cellDate > today && !isToday

    let time = ''
    if (checkin?.checkedInAt) {
      const t = checkin.checkedInAt.toDate ? checkin.checkedInAt.toDate() : new Date(checkin.checkedInAt)
      time = t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    cells.push({
      day: d,
      dateStr,
      checkedIn: !!checkin,
      isToday,
      isFuture,
      mood: checkin?.mood || '',
      note: checkin?.note || '',
      yesterday: checkin?.yesterday || '',
      today: checkin?.today || '',
      blockers: checkin?.blockers || '',
      time
    })
  }

  return cells
})

// Team check-ins sorted by time
const sortedTeamCheckins = computed(() => {
  return [...checkinStore.teamCheckins].sort((a, b) => {
    const timeA = a.checkedInAt?.toDate ? a.checkedInAt.toDate() : new Date(a.checkedInAt || 0)
    const timeB = b.checkedInAt?.toDate ? b.checkedInAt.toDate() : new Date(b.checkedInAt || 0)
    return timeA - timeB
  })
})

// Recent 10 check-ins
const recentHistory = computed(() => {
  return [...checkinStore.checkinHistory]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
})

// Helpers
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const formatHistoryDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.checkin-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.checkin-container {
  max-width: 960px;
  margin: 0 auto;
}

/* ====== Header ====== */
.checkin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.checkin-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkin-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.12);
  color: #66bb6a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkin-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.checkin-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.checkin-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.checkin-back-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

/* ====== Stats Row ====== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  backdrop-filter: blur(10px);
}

.stat-card-icon {
  font-size: 1.5rem;
}

.stat-card-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #e0e1e4;
}

.stat-card-label {
  font-size: 0.65rem;
  color: #6b6c6f;
  font-weight: 500;
  margin-top: 2px;
}

/* ====== Content Grid ====== */
.checkin-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

.checkin-right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====== Cards ====== */
.checkin-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

/* ====== Calendar ====== */
.month-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #9e9e9e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.month-nav-btn:hover:not(:disabled) {
  background: rgba(58, 59, 62, 0.3);
  color: #e0e1e4;
}

.month-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
  min-width: 120px;
  text-align: center;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 16px 0;
}

.cal-weekday {
  text-align: center;
  font-size: 0.62rem;
  font-weight: 600;
  color: #6b6c6f;
  padding: 4px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 4px 16px 16px;
  gap: 3px;
}

.cal-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.15s;
  cursor: default;
}

.cal-cell:not(.cal-empty):not(.cal-future):hover {
  background: rgba(58, 59, 62, 0.2);
}

.cal-cell.cal-checked {
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.cal-cell.cal-checked:hover {
  background: rgba(76, 175, 80, 0.2);
}

.cal-cell.cal-today {
  border: 1px solid rgba(92, 156, 230, 0.4);
}

.cal-cell.cal-today.cal-checked {
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.15);
}

.cal-cell.cal-future {
  opacity: 0.25;
}

.cal-day-num {
  font-size: 0.68rem;
  font-weight: 600;
  color: #9e9e9e;
}

.cal-checked .cal-day-num {
  color: #66bb6a;
}

.cal-today .cal-day-num {
  color: #5c9ce6;
}

.cal-today.cal-checked .cal-day-num {
  color: #66bb6a;
}

.cal-mood {
  font-size: 0.6rem;
  line-height: 1;
  margin-top: 1px;
}

.cal-check-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #66bb6a;
  margin-top: 2px;
}

/* Calendar tooltip */
.cal-tooltip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  margin: 0 16px 12px;
  border-radius: 8px;
  background: rgba(20, 21, 23, 0.9);
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.cal-tooltip-date {
  font-size: 0.72rem;
  font-weight: 600;
  color: #cecfd2;
}

.cal-tooltip-mood {
  font-size: 1rem;
}

.cal-tooltip-time {
  font-size: 0.68rem;
  color: #6b6c6f;
}

.cal-tooltip-note {
  font-size: 0.72rem;
  color: #9e9e9e;
  font-style: italic;
  margin-top: 2px;
}

/* Calendar Legend */
.cal-legend {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid rgba(58, 59, 62, 0.15);
}

.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.62rem;
  color: #6b6c6f;
}

.cal-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
}

.cal-legend-checked {
  background: rgba(76, 175, 80, 0.35);
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.cal-legend-today {
  background: transparent;
  border: 1px solid rgba(92, 156, 230, 0.5);
}

.cal-legend-missed {
  background: rgba(58, 59, 62, 0.3);
  border: 1px solid rgba(58, 59, 62, 0.3);
}

/* ====== Badges Section ====== */
.badges-section {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  overflow: hidden;
}

.badges-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.badges-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.badges-count {
  background: rgba(255, 167, 38, 0.15) !important;
  color: #ffa726 !important;
  font-size: 0.6rem !important;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 167, 38, 0.06);
  border: 1px solid rgba(255, 167, 38, 0.12);
  transition: all 0.2s ease;
}

.badge-item:hover {
  background: rgba(255, 167, 38, 0.1);
  border-color: rgba(255, 167, 38, 0.25);
}

.badge-icon {
  font-size: 1.3rem;
}

.badge-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #e0e1e4;
}

.badge-desc {
  font-size: 0.6rem;
  color: #6b6c6f;
  margin-top: 1px;
}

/* ====== Level Progress in Stat Card ====== */
.stat-level-progress {
  position: absolute;
  bottom: 4px;
  left: 12px;
  right: 12px;
  height: 3px;
  border-radius: 2px;
  background: rgba(58, 59, 62, 0.3);
  overflow: hidden;
}

.stat-level-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #ffb74d, #ffa726);
  transition: width 0.5s ease;
}

.stat-card.stat-level {
  position: relative;
  padding-bottom: 14px;
}

/* ====== Team Card ====== */
.team-count-badge {
  background: rgba(76, 175, 80, 0.15) !important;
  color: #66bb6a !important;
  font-size: 0.6rem !important;
}

.refresh-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.refresh-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

.team-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  color: #4a4b4e;
  font-size: 0.75rem;
}

.team-list {
  padding: 4px 0;
  max-height: 340px;
  overflow-y: auto;
}

.team-list::-webkit-scrollbar { width: 3px; }
.team-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.team-item-card {
  padding: 0;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
}

.team-item-card:hover {
  background: rgba(58, 59, 62, 0.1);
}

.team-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
}

.team-avatar {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 8px;
  background: rgba(76, 175, 80, 0.12);
  color: #66bb6a;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.team-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
}

.team-time {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.team-mood {
  font-size: 0.9rem;
}

.team-expand-icon {
  color: #4b5563;
  transition: color 0.15s;
}

.team-item-card:hover .team-expand-icon {
  color: #9e9e9e;
}

.team-answers {
  padding: 0 16px 12px 56px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: team-expand 0.2s ease;
}

@keyframes team-expand {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.team-answer {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.team-answer-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #6b6c6f;
  white-space: nowrap;
  flex-shrink: 0;
}

.team-answer-text {
  font-size: 0.72rem;
  color: #cecfd2;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ====== History Card ====== */
.history-empty {
  padding: 28px 16px;
  text-align: center;
  color: #4a4b4e;
  font-size: 0.75rem;
}

.history-list {
  padding: 4px 0;
  max-height: 360px;
  overflow-y: auto;
}

.history-list::-webkit-scrollbar { width: 3px; }
.history-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.history-item-card {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
}

.history-item-card:hover {
  background: rgba(58, 59, 62, 0.1);
}

.history-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
}

.history-dot {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border-radius: 50%;
  background: #66bb6a;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cecfd2;
}

.history-time {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.history-mood {
  font-size: 0.85rem;
}

.history-expand-icon {
  color: #4b5563;
  transition: color 0.15s;
}

.history-item-card:hover .history-expand-icon {
  color: #9e9e9e;
}

.history-answers {
  padding: 0 16px 10px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: team-expand 0.2s ease;
}

.history-answer {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.history-answer-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: #6b6c6f;
}

.history-answer-text {
  font-size: 0.72rem;
  color: #cecfd2;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ====== Calendar Tooltip additions ====== */
.cal-tooltip-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cal-tooltip-answer {
  font-size: 0.68rem;
  color: #9e9e9e;
  line-height: 1.4;
}

.cal-tooltip-label {
  font-size: 0.65rem;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .checkin-page {
    padding: 16px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .checkin-grid {
    grid-template-columns: 1fr;
  }
}

/* ====== Streak Fire Tier Animations ====== */
.streak-fire-icon {
  display: inline-block;
}

.streak-fire-icon.streak-tier-1 {
  filter: drop-shadow(0 0 3px rgba(255, 152, 0, 0.4));
}

.streak-fire-icon.streak-tier-2 {
  animation: fire-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(255, 152, 0, 0.6));
}

.streak-fire-icon.streak-tier-3 {
  animation: fire-legendary 1s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 87, 34, 0.8)) drop-shadow(0 0 20px rgba(255, 152, 0, 0.4));
}

@keyframes fire-pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 4px rgba(255, 152, 0, 0.5));
  }
  50% {
    transform: scale(1.12);
    filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.8));
  }
}

@keyframes fire-legendary {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 8px rgba(255, 87, 34, 0.8)) drop-shadow(0 0 16px rgba(255, 152, 0, 0.4));
  }
  25% {
    transform: scale(1.1) rotate(-3deg);
  }
  50% {
    transform: scale(1.18) rotate(0deg);
    filter: drop-shadow(0 0 14px rgba(255, 87, 34, 1)) drop-shadow(0 0 28px rgba(255, 152, 0, 0.6));
  }
  75% {
    transform: scale(1.1) rotate(3deg);
  }
}
</style>
