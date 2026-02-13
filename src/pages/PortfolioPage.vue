<template>
  <q-page class="portfolio-page">
    <div class="portfolio-container">
      <!-- Header -->
      <div class="pf-header">
        <div class="pf-header-left">
          <div class="pf-header-icon">
            <q-icon name="work_history" size="26px" />
          </div>
          <div>
            <div class="pf-header-title">{{ viewingOtherUser ? `Portfolio - ${viewingUserName}` : 'My Portfolio' }}</div>
            <div class="pf-header-subtitle">{{ viewingOtherUser ? `กำลังดูผลงานของ ${viewingUserName}` : 'ผลงานและกิจกรรมทั้งหมดของคุณ' }}</div>
          </div>
        </div>
      </div>

      <!-- Super Admin / HR: User Selector -->
      <div v-if="authStore.isSuperAdmin || authStore.isHR" class="pf-user-selector">
        <div class="pf-selector-label">
          <q-icon name="shield" size="16px" style="color: #ef5350;" />
          <span>ดู Portfolio ของ</span>
        </div>
        <q-select
          v-model="selectedUserEmail"
          :options="userOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          dense
          outlined
          dark
          class="pf-user-select"
          popup-content-class="pf-select-popup"
          @update:model-value="onUserChange"
        >
          <template v-slot:selected>
            <div class="pf-selected-user">
              <q-avatar size="22px" v-if="selectedUserPhoto">
                <img :src="selectedUserPhoto" />
              </q-avatar>
              <q-avatar size="22px" color="grey-8" text-color="white" v-else>
                <q-icon name="person" size="14px" />
              </q-avatar>
              <span>{{ selectedUserLabel }}</span>
            </div>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" dense>
              <q-item-section avatar style="min-width: 32px;">
                <q-avatar size="24px" v-if="scope.opt.photo">
                  <img :src="scope.opt.photo" />
                </q-avatar>
                <q-avatar size="24px" color="grey-8" text-color="white" v-else>
                  <q-icon name="person" size="14px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label style="font-size: 0.75rem; color: #e0e1e4;">{{ scope.opt.label }}</q-item-label>
                <q-item-label caption style="font-size: 0.62rem; color: #6b6c6f;">{{ scope.opt.email }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="scope.opt.role">
                <q-badge :color="getRoleBadgeColor(scope.opt.role)" :label="getRoleLabel(scope.opt.role)" style="font-size: 0.55rem;" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Stats Cards -->
      <div class="pf-stats-row">
        <div class="pf-stat-card">
          <div class="pf-stat-icon" style="background: rgba(171, 71, 188, 0.12); color: #ce93d8;">
            <q-icon name="edit_note" size="22px" />
          </div>
          <div class="pf-stat-info">
            <div class="pf-stat-value">{{ worklogStore.myLogs.length }}</div>
            <div class="pf-stat-label">WorkLog</div>
          </div>
        </div>
        <div class="pf-stat-card">
          <div class="pf-stat-icon" style="background: rgba(76, 175, 80, 0.12); color: #66bb6a;">
            <q-icon name="task_alt" size="22px" />
          </div>
          <div class="pf-stat-info">
            <div class="pf-stat-value">{{ projectsStore.myCompletedTasks.length }}</div>
            <div class="pf-stat-label">Task สำเร็จ</div>
          </div>
        </div>
        <div class="pf-stat-card">
          <div class="pf-stat-icon" style="background: rgba(255, 167, 38, 0.12); color: #ffa726;">
            <q-icon name="attach_file" size="22px" />
          </div>
          <div class="pf-stat-info">
            <div class="pf-stat-value">{{ totalAttachments }}</div>
            <div class="pf-stat-label">ไฟล์แนบ</div>
          </div>
        </div>
        <div class="pf-stat-card">
          <div class="pf-stat-icon" style="background: rgba(92, 156, 230, 0.12); color: #5c9ce6;">
            <q-icon name="local_fire_department" size="22px" />
          </div>
          <div class="pf-stat-info">
            <div class="pf-stat-value">{{ checkinStore.currentStreak }}</div>
            <div class="pf-stat-label">Streak {{ checkinStore.streakTier.emoji }}</div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="pf-filter-bar">
        <div class="pf-filter-left">
          <button v-for="preset in datePresets" :key="preset.value"
            class="pf-preset-btn" :class="{ 'pf-preset-active': dateRange === preset.value }"
            @click="dateRange = preset.value">
            {{ preset.label }}
          </button>
        </div>
        <div class="pf-filter-right">
          <button class="pf-type-btn" :class="{ 'pf-type-active': showWorklogs }" @click="showWorklogs = !showWorklogs">
            <q-icon name="edit_note" size="14px" />
            <span>WorkLog</span>
          </button>
          <button class="pf-type-btn" :class="{ 'pf-type-active': showTasks }" @click="showTasks = !showTasks">
            <q-icon name="task_alt" size="14px" />
            <span>Task</span>
          </button>
          <button class="pf-type-btn" :class="{ 'pf-type-active': showCheckins }" @click="showCheckins = !showCheckins">
            <q-icon name="event_available" size="14px" />
            <span>Check-in</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="pf-loading">
        <q-spinner size="28px" color="purple" />
        <span>กำลังโหลดข้อมูล...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTimeline.length === 0" class="pf-empty">
        <q-icon name="inbox" size="48px" style="color: #2a2b2e;" />
        <span>ไม่พบข้อมูลในช่วงเวลาที่เลือก</span>
      </div>

      <!-- Timeline -->
      <div v-else class="pf-timeline">
        <template v-for="(group, gIdx) in groupedTimeline" :key="gIdx">
          <!-- Date Header -->
          <div class="pf-date-header">
            <div class="pf-date-dot"></div>
            <div class="pf-date-label">{{ formatDateHeader(group.date) }}</div>
            <div class="pf-date-count">{{ group.items.length }} รายการ</div>
          </div>

          <!-- Items for this date -->
          <div v-for="(item, iIdx) in group.items" :key="gIdx + '-' + iIdx" class="pf-timeline-item">
            <div class="pf-timeline-line"></div>

            <!-- WorkLog Item -->
            <div v-if="item.type === 'worklog'" class="pf-card pf-card-worklog">
              <div class="pf-card-header">
                <div class="pf-card-type-badge pf-badge-worklog">
                  <q-icon name="edit_note" size="14px" />
                  <span>WorkLog</span>
                </div>
                <span class="pf-card-time">{{ formatTime(item.data.submittedAt) }}</span>
              </div>
              <ul class="pf-worklog-entries">
                <li v-for="(entry, ei) in item.data.entries" :key="ei">{{ entry }}</li>
              </ul>
              <div v-if="item.data.summary" class="pf-worklog-summary">
                "{{ item.data.summary }}"
              </div>
              <!-- Attachments -->
              <div v-if="item.data.attachments?.length" class="pf-attach-gallery">
                <div v-for="(att, ai) in item.data.attachments" :key="ai"
                  class="pf-attach-item"
                  @click="att.type?.startsWith('image/') ? openLightbox(att) : openPdf(att.url)">
                  <img v-if="att.type?.startsWith('image/')" :src="att.url" class="pf-attach-thumb" />
                  <div v-else class="pf-attach-pdf">
                    <q-icon name="picture_as_pdf" size="20px" />
                  </div>
                  <div class="pf-attach-name">{{ att.name }}</div>
                </div>
              </div>
            </div>

            <!-- Task Item -->
            <div v-else-if="item.type === 'task'" class="pf-card pf-card-task">
              <div class="pf-card-header">
                <div class="pf-card-type-badge pf-badge-task">
                  <q-icon name="task_alt" size="14px" />
                  <span>Task สำเร็จ</span>
                </div>
                <span v-if="item.data.projectName" class="pf-task-project">{{ item.data.projectName }}</span>
              </div>
              <div class="pf-task-title">{{ item.data.title }}</div>
              <div v-if="item.data.description" class="pf-task-desc">{{ item.data.description }}</div>
              <div class="pf-task-meta">
                <span v-if="item.data.priority" class="pf-priority-badge"
                  :class="'pf-priority-' + item.data.priority">
                  {{ item.data.priority }}
                </span>
                <span class="pf-task-date">
                  <q-icon name="check_circle" size="12px" />
                  {{ formatCompletedDate(item.data.completedAt) }}
                </span>
              </div>
            </div>

            <!-- Check-in Item -->
            <div v-else-if="item.type === 'checkin'" class="pf-card pf-card-checkin">
              <div class="pf-card-header">
                <div class="pf-card-type-badge pf-badge-checkin">
                  <q-icon name="event_available" size="14px" />
                  <span>Check-in</span>
                </div>
                <span v-if="item.data.mood" class="pf-checkin-mood">{{ item.data.mood }}</span>
                <span class="pf-card-time">{{ formatTime(item.data.checkedInAt) }}</span>
              </div>
              <div class="pf-checkin-answers">
                <div v-if="item.data.yesterday" class="pf-checkin-answer">
                  <span class="pf-checkin-label">⏪</span>
                  <span class="pf-checkin-text">{{ item.data.yesterday }}</span>
                </div>
                <div v-if="item.data.today" class="pf-checkin-answer">
                  <span class="pf-checkin-label">🎯</span>
                  <span class="pf-checkin-text">{{ item.data.today }}</span>
                </div>
                <div v-if="item.data.blockers" class="pf-checkin-answer">
                  <span class="pf-checkin-label">🚧</span>
                  <span class="pf-checkin-text">{{ item.data.blockers }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Image Lightbox -->
    <q-dialog v-model="showLightbox" maximized>
      <div class="pf-lightbox" @click="showLightbox = false">
        <button class="pf-lightbox-close" @click.stop="showLightbox = false">
          <q-icon name="close" size="24px" />
        </button>
        <img v-if="lightboxImage" :src="lightboxImage.url" class="pf-lightbox-img" @click.stop />
        <div v-if="lightboxImage" class="pf-lightbox-name">{{ lightboxImage.name }}</div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorklogStore } from 'stores/worklog'
import { useProjectsStore } from 'stores/projects'
import { useCheckinStore } from 'stores/checkin'
import { useAuthStore } from 'stores/auth'

const worklogStore = useWorklogStore()
const projectsStore = useProjectsStore()
const checkinStore = useCheckinStore()
const authStore = useAuthStore()

// Super Admin: user selector
const selectedUserEmail = ref(null) // null = ตัวเอง

const canViewOthers = computed(() => authStore.isSuperAdmin || authStore.isHR)

const viewingOtherUser = computed(() => {
  return canViewOthers.value && selectedUserEmail.value && selectedUserEmail.value !== authStore.user?.email
})

const viewingUserName = computed(() => {
  if (!selectedUserEmail.value) return ''
  const p = authStore.allProfiles.find(u => u.email === selectedUserEmail.value || u.id === selectedUserEmail.value)
  if (p) {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim()
    return name || p.email
  }
  return selectedUserEmail.value
})

const userOptions = computed(() => {
  const options = [
    { label: 'ตัวเอง (My Portfolio)', value: null, email: authStore.user?.email || '', photo: authStore.profile.photoURL, role: null }
  ]
  for (const p of authStore.allProfiles) {
    if (p.email === authStore.user?.email || p.id === authStore.user?.email) continue
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim()
    options.push({
      label: name || p.email || p.id,
      value: p.email || p.id,
      email: p.email || p.id,
      photo: p.photoURL || '',
      role: p.role || 'employee'
    })
  }
  return options
})

const selectedUserPhoto = computed(() => {
  if (!selectedUserEmail.value) return authStore.profile.photoURL || ''
  const p = authStore.allProfiles.find(u => u.email === selectedUserEmail.value || u.id === selectedUserEmail.value)
  return p?.photoURL || ''
})

const selectedUserLabel = computed(() => {
  if (!selectedUserEmail.value) return 'ตัวเอง (My Portfolio)'
  const p = authStore.allProfiles.find(u => u.email === selectedUserEmail.value || u.id === selectedUserEmail.value)
  if (p) {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim()
    return name || p.email || p.id
  }
  return selectedUserEmail.value
})

const getRoleBadgeColor = (role) => {
  const colors = { super_admin: 'red-5', hr: 'purple-3', head: 'orange-5', employee: 'green-5' }
  return colors[role] || 'grey-6'
}

const getRoleLabel = (role) => {
  return authStore.roleLabels[role]?.label || role
}

const onUserChange = () => {
  fetchData()
}

// Filter state
const dateRange = ref('90')
const showWorklogs = ref(true)
const showTasks = ref(true)
const showCheckins = ref(true)

// Lightbox
const showLightbox = ref(false)
const lightboxImage = ref(null)

// Loading tracker
const isLoading = ref(true)

const datePresets = [
  { label: 'เดือนนี้', value: 'month' },
  { label: '30 วัน', value: '30' },
  { label: '90 วัน', value: '90' },
  { label: 'ทั้งหมด', value: 'all' }
]

// Fetch data on mount and when dateRange changes
const fetchData = async () => {
  isLoading.value = true
  const days = dateRange.value === 'all' ? 3650 : dateRange.value === 'month' ? 31 : parseInt(dateRange.value)
  const targetEmail = selectedUserEmail.value || null

  await Promise.all([
    worklogStore.fetchMyLogs(days, targetEmail),
    projectsStore.fetchProjects().then(() => projectsStore.fetchMyCompletedTasks(200, targetEmail)),
    checkinStore.fetchCheckinHistory(days, targetEmail)
  ])
  isLoading.value = false
}

onMounted(fetchData)

watch(dateRange, fetchData)

// Compute date cutoff
const dateCutoff = computed(() => {
  if (dateRange.value === 'all') return '2000-01-01'
  const days = dateRange.value === 'month' ? 31 : parseInt(dateRange.value)
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// Stats
const totalAttachments = computed(() => {
  let count = 0
  for (const log of worklogStore.myLogs) {
    count += (log.attachments?.length || 0)
  }
  return count
})

// Helper: extract date string from various formats
const getDateStr = (val) => {
  if (!val) return ''
  if (typeof val === 'string') return val.substring(0, 10)
  if (val.toDate) {
    const d = val.toDate()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  if (val instanceof Date) {
    return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`
  }
  return ''
}

// Filtered + merged timeline
const filteredTimeline = computed(() => {
  const items = []
  const cutoff = dateCutoff.value

  if (showWorklogs.value) {
    for (const log of worklogStore.myLogs) {
      if (log.date >= cutoff) {
        items.push({ type: 'worklog', date: log.date, data: log })
      }
    }
  }

  if (showTasks.value) {
    for (const task of projectsStore.myCompletedTasks) {
      const d = getDateStr(task.completedAt)
      if (d && d >= cutoff) {
        items.push({ type: 'task', date: d, data: task })
      }
    }
  }

  if (showCheckins.value) {
    for (const ci of checkinStore.checkinHistory) {
      if (ci.date >= cutoff) {
        items.push({ type: 'checkin', date: ci.date, data: ci })
      }
    }
  }

  // Sort newest first
  return items.sort((a, b) => b.date.localeCompare(a.date))
})

// Group by date
const groupedTimeline = computed(() => {
  const groups = []
  let currentDate = null
  let currentGroup = null

  for (const item of filteredTimeline.value) {
    if (item.date !== currentDate) {
      currentDate = item.date
      currentGroup = { date: item.date, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push(item)
  }

  return groups
})

// Formatters
const formatDateHeader = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (dateStr === todayStr) return 'วันนี้'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (dateStr === yesterdayStr) return 'เมื่อวาน'
  return date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const formatCompletedDate = (val) => {
  if (!val) return ''
  const date = val.toDate ? val.toDate() : new Date(val)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const openLightbox = (att) => {
  lightboxImage.value = att
  showLightbox.value = true
}

const openPdf = (url) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.portfolio-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.portfolio-container {
  max-width: 780px;
  margin: 0 auto;
}

/* ====== Header ====== */
.pf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pf-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pf-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(126, 87, 194, 0.12);
  color: #b39ddb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pf-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.pf-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

/* ====== Super Admin User Selector ====== */
.pf-user-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 83, 80, 0.04);
  border: 1px solid rgba(239, 83, 80, 0.15);
  margin-bottom: 16px;
}

.pf-selector-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #ef5350;
  white-space: nowrap;
}

.pf-user-select {
  flex: 1;
  max-width: 360px;
}

.pf-user-select :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.8) !important;
  border-color: rgba(58, 59, 62, 0.3) !important;
  border-radius: 8px !important;
  min-height: 34px !important;
  padding: 0 10px !important;
}

.pf-user-select :deep(.q-field__native) {
  color: #e0e1e4 !important;
  font-size: 0.72rem !important;
  padding: 0 !important;
  min-height: 34px !important;
}

.pf-user-select :deep(.q-field__append) {
  color: #6b6c6f !important;
}

.pf-selected-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: #e0e1e4;
}

.pf-select-popup {
  background: #1e2124 !important;
  border: 1px solid rgba(58, 59, 62, 0.4) !important;
  border-radius: 10px !important;
}

.pf-select-popup .q-item {
  padding: 6px 12px !important;
  min-height: 40px !important;
}

.pf-select-popup .q-item:hover {
  background: rgba(126, 87, 194, 0.08) !important;
}

.pf-select-popup .q-item--active {
  background: rgba(126, 87, 194, 0.12) !important;
}

/* ====== Stats ====== */
.pf-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.pf-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  backdrop-filter: blur(10px);
}

.pf-stat-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pf-stat-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #e0e1e4;
}

.pf-stat-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  font-weight: 500;
  margin-top: 1px;
}

/* ====== Filter Bar ====== */
.pf-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pf-filter-left,
.pf-filter-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pf-preset-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.pf-preset-btn:hover {
  color: #9e9e9e;
  background: rgba(58, 59, 62, 0.2);
}

.pf-preset-active {
  color: #b39ddb !important;
  background: rgba(126, 87, 194, 0.1) !important;
  border-color: rgba(126, 87, 194, 0.25) !important;
}

.pf-type-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #4b5563;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.pf-type-btn:hover {
  color: #9e9e9e;
  border-color: rgba(58, 59, 62, 0.5);
}

.pf-type-active {
  color: #cecfd2 !important;
  background: rgba(126, 87, 194, 0.08) !important;
  border-color: rgba(126, 87, 194, 0.3) !important;
}

/* ====== Loading & Empty ====== */
.pf-loading,
.pf-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 20px;
  color: #6b6c6f;
  font-size: 0.78rem;
}

/* ====== Timeline ====== */
.pf-timeline {
  position: relative;
  padding-left: 20px;
}

.pf-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(58, 59, 62, 0.2);
  border-radius: 1px;
}

/* Date Header */
.pf-date-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  margin-bottom: 8px;
  position: relative;
}

.pf-date-dot {
  position: absolute;
  left: -18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7e57c2;
  border: 2px solid rgba(30, 33, 36, 1);
  z-index: 1;
}

.pf-date-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.pf-date-count {
  font-size: 0.6rem;
  color: #4b5563;
  font-weight: 500;
}

/* Timeline Item */
.pf-timeline-item {
  position: relative;
  margin-bottom: 10px;
  margin-left: 4px;
}

.pf-timeline-line {
  position: absolute;
  left: -18px;
  top: 16px;
  width: 10px;
  height: 1px;
  background: rgba(58, 59, 62, 0.2);
}

/* ====== Cards ====== */
.pf-card {
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s;
}

.pf-card:hover {
  border-color: rgba(58, 59, 62, 0.5);
}

.pf-card-worklog { border-left: 3px solid rgba(171, 71, 188, 0.5); }
.pf-card-task { border-left: 3px solid rgba(76, 175, 80, 0.5); }
.pf-card-checkin { border-left: 3px solid rgba(92, 156, 230, 0.5); }

.pf-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pf-card-type-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.6rem;
  font-weight: 700;
}

.pf-badge-worklog {
  background: rgba(171, 71, 188, 0.1);
  color: #ce93d8;
}

.pf-badge-task {
  background: rgba(76, 175, 80, 0.1);
  color: #66bb6a;
}

.pf-badge-checkin {
  background: rgba(92, 156, 230, 0.1);
  color: #5c9ce6;
}

.pf-card-time {
  font-size: 0.62rem;
  color: #4b5563;
  margin-left: auto;
}

/* WorkLog */
.pf-worklog-entries {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pf-worklog-entries li {
  position: relative;
  padding-left: 14px;
  font-size: 0.75rem;
  color: #9e9e9e;
  line-height: 1.7;
}

.pf-worklog-entries li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ab47bc;
}

.pf-worklog-summary {
  font-size: 0.7rem;
  color: #6b6c6f;
  font-style: italic;
  margin-top: 4px;
  padding-left: 14px;
}

/* Attachment Gallery */
.pf-attach-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pf-attach-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px;
  transition: background 0.15s;
}

.pf-attach-item:hover {
  background: rgba(171, 71, 188, 0.08);
}

.pf-attach-thumb {
  width: 52px;
  height: 52px;
  border-radius: 5px;
  object-fit: cover;
  background: rgba(58, 59, 62, 0.3);
  border: 1px solid rgba(58, 59, 62, 0.2);
}

.pf-attach-pdf {
  width: 52px;
  height: 52px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 83, 80, 0.06);
  border: 1px solid rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.pf-attach-name {
  font-size: 0.55rem;
  color: #6b6c6f;
  text-align: center;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 56px;
}

/* Task */
.pf-task-project {
  font-size: 0.62rem;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.pf-task-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cecfd2;
}

.pf-task-desc {
  font-size: 0.7rem;
  color: #6b6c6f;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pf-task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.pf-priority-badge {
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
}

.pf-priority-low { background: rgba(76, 175, 80, 0.1); color: #66bb6a; }
.pf-priority-medium { background: rgba(255, 183, 77, 0.1); color: #ffb74d; }
.pf-priority-high { background: rgba(255, 112, 67, 0.1); color: #ff7043; }
.pf-priority-urgent { background: rgba(239, 83, 80, 0.1); color: #ef5350; }

.pf-task-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.62rem;
  color: #66bb6a;
}

/* Check-in */
.pf-checkin-mood {
  font-size: 1rem;
}

.pf-checkin-answers {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pf-checkin-answer {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.pf-checkin-label {
  font-size: 0.68rem;
  flex-shrink: 0;
}

.pf-checkin-text {
  font-size: 0.72rem;
  color: #9e9e9e;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ====== Lightbox ====== */
.pf-lightbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.92);
  cursor: pointer;
  position: relative;
}

.pf-lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.pf-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.pf-lightbox-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  cursor: default;
}

.pf-lightbox-name {
  margin-top: 12px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .portfolio-page {
    padding: 16px;
  }

  .pf-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .pf-filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .pf-user-selector {
    flex-direction: column;
    align-items: flex-start;
  }

  .pf-user-select {
    max-width: 100%;
    width: 100%;
  }
}
</style>
