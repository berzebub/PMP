<template>
  <div class="gantt-view">
    <!-- Header Controls -->
    <div class="gantt-header">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <span class="gantt-title">Gantt Chart</span>
          <q-badge :label="`${filteredTasks.length} Tasks`" class="gantt-badge" />
        </div>
        <div class="row items-center q-gutter-sm">
          <!-- Zoom Controls -->
          <q-btn-group flat class="zoom-controls">
            <q-btn flat :class="{ 'zoom-active': zoomLevel === 'day' }" label="วัน" size="sm"
              @click="zoomLevel = 'day'" />
            <q-btn flat :class="{ 'zoom-active': zoomLevel === 'week' }" label="สัปดาห์" size="sm"
              @click="zoomLevel = 'week'" />
            <q-btn flat :class="{ 'zoom-active': zoomLevel === 'month' }" label="เดือน" size="sm"
              @click="zoomLevel = 'month'" />
          </q-btn-group>

          <q-separator vertical dark class="q-mx-xs" style="height: 24px;" />

          <!-- Navigation -->
          <q-btn flat round icon="chevron_left" size="sm" class="nav-btn" @click="navigateBack">
            <q-tooltip>ย้อนกลับ</q-tooltip>
          </q-btn>
          <q-btn flat round icon="today" size="sm" class="nav-btn" @click="goToToday">
            <q-tooltip>วันนี้</q-tooltip>
          </q-btn>
          <q-btn flat round icon="chevron_right" size="sm" class="nav-btn" @click="navigateForward">
            <q-tooltip>ถัดไป</q-tooltip>
          </q-btn>

          <span class="date-range-label">{{ dateRangeLabel }}</span>

          <!-- Filter -->
          <q-select v-model="filterStatus" :options="statusOptions" emit-value map-options outlined dense dark
            class="filter-select" style="min-width: 130px;" label="สถานะ" />
        </div>
      </div>
    </div>

    <!-- Gantt Chart Body -->
    <div class="gantt-body" ref="ganttBody">
      <!-- Left Panel: Task Names -->
      <div class="gantt-sidebar">
        <div class="sidebar-header">
          <span>Task</span>
        </div>
        <div class="sidebar-tasks">
          <div v-for="task in filteredTasks" :key="task.id" class="sidebar-task-row"
            @click="$emit('task-click', task)">
            <div class="task-priority-dot" :style="{ background: getPriorityColor(task.priority) }"></div>
            <div class="task-info">
              <div class="task-name" :title="task.title">{{ task.title }}</div>
              <div class="task-meta">
                <q-badge :label="getStatusName(task.status)" :style="{ background: getStatusColor(task.status) }"
                  class="task-status-badge" />
              </div>
            </div>
          </div>
          <div v-if="filteredTasks.length === 0" class="no-tasks-sidebar">
            ไม่มี Task ที่มีวันกำหนด
          </div>
        </div>
      </div>

      <!-- Right Panel: Timeline -->
      <div class="gantt-timeline" ref="ganttTimeline" @scroll="handleScroll">
        <!-- Timeline Header -->
        <div class="timeline-header">
          <div class="timeline-header-row">
            <div v-for="header in timelineHeaders" :key="header.key" class="timeline-header-cell"
              :style="{ width: header.width + 'px' }">
              {{ header.label }}
            </div>
          </div>
          <div class="timeline-subheader-row">
            <div v-for="col in timelineColumns" :key="col.key" class="timeline-subheader-cell"
              :class="{ 'is-today': col.isToday, 'is-weekend': col.isWeekend }"
              :style="{ width: columnWidth + 'px' }">
              {{ col.label }}
            </div>
          </div>
        </div>

        <!-- Timeline Rows -->
        <div class="timeline-rows">
          <!-- Today Indicator -->
          <div v-if="todayOffset !== null" class="today-indicator" :style="{ left: todayOffset + 'px' }"></div>

          <!-- Grid Lines -->
          <div class="grid-lines">
            <div v-for="col in timelineColumns" :key="'grid-' + col.key" class="grid-line"
              :class="{ 'is-weekend': col.isWeekend }" :style="{ left: col.offset + 'px', width: columnWidth + 'px' }">
            </div>
          </div>

          <!-- Task Bars -->
          <div v-for="(task, index) in filteredTasks" :key="task.id" class="timeline-row"
            :style="{ top: (index * rowHeight) + 'px' }">
            <div v-if="getTaskBar(task)" class="task-bar" :class="getTaskBarClass(task)"
              :style="getTaskBarStyle(task)" @click="$emit('task-click', task)">
              <div class="task-bar-fill" :style="{ width: getTaskProgress(task) + '%' }"></div>
              <span class="task-bar-label">{{ task.title }}</span>
              <span v-if="getTaskProgress(task) > 0" class="task-bar-progress">{{ getTaskProgress(task) }}%</span>
            </div>
            <!-- No date indicator -->
            <div v-else class="no-date-indicator">
              <q-icon name="event_busy" size="14px" />
              <span>ไม่มีวันกำหนด</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTasksStore } from 'stores/tasks'

const tasksStore = useTasksStore()
const emit = defineEmits(['task-click'])

const ganttBody = ref(null)
const ganttTimeline = ref(null)

// State
const zoomLevel = ref('week')
const viewStartDate = ref(getStartOfWeek(new Date()))
const filterStatus = ref('all')

const rowHeight = 44

// Column width based on zoom level
const columnWidth = computed(() => {
  switch (zoomLevel.value) {
    case 'day': return 60
    case 'week': return 40
    case 'month': return 30
    default: return 40
  }
})

// Number of columns to display
const visibleColumns = computed(() => {
  switch (zoomLevel.value) {
    case 'day': return 24 // hours in a day
    case 'week': return 28 // 4 weeks
    case 'month': return 31 // days in a month view
    default: return 28
  }
})

// Status filter options
const statusOptions = computed(() => {
  const taskStatuses = tasksStore.taskStatuses?.value || tasksStore.taskStatuses || []
  const options = [{ label: 'ทั้งหมด', value: 'all' }]
  if (Array.isArray(taskStatuses)) {
    taskStatuses.forEach(status => {
      options.push({ label: status.name, value: status.id })
    })
  }
  return options
})

// Filtered tasks
const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks || []
  // Filter out deleted
  tasks = tasks.filter(t => !t.isDeleted)

  if (filterStatus.value !== 'all') {
    tasks = tasks.filter(t => t.status === filterStatus.value)
  }

  // Sort: tasks with dueDate first, then by dueDate
  return [...tasks].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate) : null
    const bDate = b.dueDate ? new Date(b.dueDate) : null
    if (aDate && !bDate) return -1
    if (!aDate && bDate) return 1
    if (aDate && bDate) return aDate - bDate
    return 0
  })
})

// Timeline date range
const timelineDates = computed(() => {
  const dates = []
  const start = new Date(viewStartDate.value)

  if (zoomLevel.value === 'day') {
    // Show hours of a single day
    for (let h = 0; h < 24; h++) {
      const d = new Date(start)
      d.setHours(h, 0, 0, 0)
      dates.push(d)
    }
  } else {
    // Show days
    const numDays = zoomLevel.value === 'month' ? 42 : 28
    for (let i = 0; i < numDays; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
  }
  return dates
})

// Timeline columns (subheader)
const timelineColumns = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return timelineDates.value.map((date, index) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    let label = ''
    let key = ''

    if (zoomLevel.value === 'day') {
      label = `${date.getHours()}:00`
      key = `h-${date.getHours()}`
    } else {
      label = date.getDate().toString()
      key = date.toISOString().split('T')[0]
    }

    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    return {
      date,
      label,
      key,
      isToday: dateOnly.getTime() === today.getTime(),
      isWeekend,
      offset: index * columnWidth.value
    }
  })
})

// Timeline headers (top row - grouped)
const timelineHeaders = computed(() => {
  if (zoomLevel.value === 'day') {
    const d = viewStartDate.value
    return [{
      key: 'day-header',
      label: d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      width: 24 * columnWidth.value
    }]
  }

  // Group by month
  const headers = []
  let currentMonth = null
  let currentCount = 0

  timelineDates.value.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (monthKey !== currentMonth) {
      if (currentMonth !== null) {
        headers.push({
          key: currentMonth,
          label: headers.length === 0
            ? timelineDates.value[0].toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
            : date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
          width: currentCount * columnWidth.value
        })
      }
      currentMonth = monthKey
      currentCount = 1
    } else {
      currentCount++
    }
  })

  // Push last group
  if (currentMonth !== null) {
    const lastDate = timelineDates.value[timelineDates.value.length - 1]
    headers.push({
      key: currentMonth,
      label: lastDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
      width: currentCount * columnWidth.value
    })
  }

  // Fix first header label
  if (headers.length > 0) {
    const firstDate = timelineDates.value[0]
    headers[0].label = firstDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
  }

  return headers
})

// Date range label
const dateRangeLabel = computed(() => {
  if (timelineDates.value.length === 0) return ''
  const start = timelineDates.value[0]
  const end = timelineDates.value[timelineDates.value.length - 1]

  if (zoomLevel.value === 'day') {
    return start.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const startStr = start.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  const endStr = end.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startStr} - ${endStr}`
})

// Today indicator position
const todayOffset = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (zoomLevel.value === 'day') {
    const viewDate = new Date(viewStartDate.value)
    viewDate.setHours(0, 0, 0, 0)
    if (today.getTime() === viewDate.getTime()) {
      const now = new Date()
      return (now.getHours() + now.getMinutes() / 60) * columnWidth.value
    }
    return null
  }

  const start = new Date(viewStartDate.value)
  start.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))

  if (diffDays >= 0 && diffDays < timelineDates.value.length) {
    return diffDays * columnWidth.value + columnWidth.value / 2
  }
  return null
})

// Get task bar position and width
function getTaskBar(task) {
  if (!task.createdAt && !task.dueDate) return null
  return true
}

function getTaskBarStyle(task) {
  const startDate = getTaskStartDate(task)
  const endDate = getTaskEndDate(task)

  if (!startDate && !endDate) return { display: 'none' }

  const timelineStart = new Date(viewStartDate.value)
  timelineStart.setHours(0, 0, 0, 0)

  const effectiveStart = startDate || endDate
  const effectiveEnd = endDate || new Date(effectiveStart.getTime() + 86400000) // +1 day if no end

  if (zoomLevel.value === 'day') {
    // For day zoom, position by hours
    const viewDate = new Date(viewStartDate.value)
    viewDate.setHours(0, 0, 0, 0)

    const startHours = Math.max(0, (effectiveStart - viewDate) / (1000 * 60 * 60))
    const endHours = Math.min(24, (effectiveEnd - viewDate) / (1000 * 60 * 60))

    if (endHours <= 0 || startHours >= 24) return { display: 'none' }

    return {
      left: Math.max(0, startHours) * columnWidth.value + 'px',
      width: Math.max(columnWidth.value, (endHours - Math.max(0, startHours)) * columnWidth.value) + 'px'
    }
  }

  // Day/week/month zoom
  const startDiff = (effectiveStart - timelineStart) / (1000 * 60 * 60 * 24)
  const duration = Math.max(1, (effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24))

  const totalDays = timelineDates.value.length

  // Check if bar is visible
  if (startDiff + duration < 0 || startDiff > totalDays) return { display: 'none' }

  const left = Math.max(0, startDiff) * columnWidth.value
  const barDuration = Math.min(totalDays - Math.max(0, startDiff), duration - Math.max(0, -startDiff))
  const width = Math.max(columnWidth.value * 0.8, barDuration * columnWidth.value)

  return {
    left: left + 'px',
    width: width + 'px'
  }
}

function getTaskStartDate(task) {
  if (task.createdAt) {
    const d = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
    d.setHours(0, 0, 0, 0)
    return d
  }
  return null
}

function getTaskEndDate(task) {
  if (task.dueDate) {
    const d = new Date(task.dueDate)
    d.setHours(23, 59, 59, 999)
    return d
  }
  return null
}

function getTaskBarClass(task) {
  return {
    'priority-low': task.priority === 'low',
    'priority-medium': task.priority === 'medium',
    'priority-high': task.priority === 'high',
    'priority-urgent': task.priority === 'urgent',
    'is-overdue': isOverdue(task),
    'is-completed': isCompleted(task)
  }
}

function isOverdue(task) {
  if (!task.dueDate) return false
  const now = new Date()
  const due = new Date(task.dueDate)
  return due < now && !isCompleted(task)
}

function isCompleted(task) {
  const completedStatuses = ['done', 'completed', 'เสร็จแล้ว']
  return completedStatuses.includes(task.status?.toLowerCase?.() || task.status)
}

function getTaskProgress(task) {
  // Calculate based on subtasks if available
  const subtasks = tasksStore.subtasks?.filter(st => st.taskId === task.id) || []
  if (subtasks.length === 0) {
    return isCompleted(task) ? 100 : 0
  }
  const completed = subtasks.filter(st => st.completed).length
  return Math.round((completed / subtasks.length) * 100)
}

// Helper functions
function getPriorityColor(priority) {
  const colors = {
    low: '#4caf50',
    medium: '#ffa726',
    high: '#ff7043',
    urgent: '#ef5350'
  }
  return colors[priority] || colors.medium
}

function getStatusColor(status) {
  const taskStatuses = tasksStore.taskStatuses?.value || tasksStore.taskStatuses || []
  // Try to find from columns
  if (Array.isArray(taskStatuses)) {
    const idx = taskStatuses.findIndex(s => s.id === status)
    if (idx !== -1) {
      const colorsArr = ['#9E9E9E', '#42A5F5', '#FFD54F', '#66BB6A', '#FF7043', '#AB47BC']
      return colorsArr[idx % colorsArr.length]
    }
  }
  const fallback = {
    'todo': '#9E9E9E',
    'in-progress': '#42A5F5',
    'review': '#FFD54F',
    'done': '#66BB6A'
  }
  return fallback[status] || '#9E9E9E'
}

function getStatusName(status) {
  const taskStatuses = tasksStore.taskStatuses?.value || tasksStore.taskStatuses || []
  if (Array.isArray(taskStatuses)) {
    const found = taskStatuses.find(s => s.id === status)
    if (found) return found.name
  }
  return status
}

function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Navigation
function navigateBack() {
  const d = new Date(viewStartDate.value)
  switch (zoomLevel.value) {
    case 'day':
      d.setDate(d.getDate() - 1)
      break
    case 'week':
      d.setDate(d.getDate() - 7)
      break
    case 'month':
      d.setMonth(d.getMonth() - 1)
      break
  }
  viewStartDate.value = d
}

function navigateForward() {
  const d = new Date(viewStartDate.value)
  switch (zoomLevel.value) {
    case 'day':
      d.setDate(d.getDate() + 1)
      break
    case 'week':
      d.setDate(d.getDate() + 7)
      break
    case 'month':
      d.setMonth(d.getMonth() + 1)
      break
  }
  viewStartDate.value = d
}

function goToToday() {
  const today = new Date()
  switch (zoomLevel.value) {
    case 'day':
      today.setHours(0, 0, 0, 0)
      viewStartDate.value = today
      break
    case 'week':
      viewStartDate.value = getStartOfWeek(today)
      break
    case 'month':
      today.setDate(1)
      today.setHours(0, 0, 0, 0)
      viewStartDate.value = today
      break
  }
}

function handleScroll() {
  // Sync scroll if needed
}

// Reset view when zoom changes
watch(zoomLevel, () => {
  goToToday()
})

onMounted(() => {
  goToToday()
})
</script>

<style scoped>
.gantt-view {
  background: transparent;
  min-height: 100vh;
  padding: 20px;
}

/* Header */
.gantt-header {
  background: rgba(26, 34, 44, 0.9);
  backdrop-filter: blur(10px);
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid rgba(44, 58, 69, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.gantt-title {
  font-size: 1rem;
  font-weight: 700;
  color: #cecfd2;
  letter-spacing: 0.5px;
}

.gantt-badge {
  background: rgba(92, 156, 230, 0.15) !important;
  color: #5c9ce6 !important;
  font-size: 0.7rem !important;
}

.zoom-controls .q-btn {
  color: #6b6c6f !important;
  font-size: 0.75rem !important;
  border-radius: 6px !important;
  min-height: 30px !important;
}

.zoom-controls .zoom-active {
  color: #cecfd2 !important;
  background: rgba(206, 207, 210, 0.1) !important;
}

.nav-btn {
  color: #9ca3af !important;
}

.nav-btn:hover {
  color: #cecfd2 !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

.date-range-label {
  color: #9ca3af;
  font-size: 0.8rem;
  white-space: nowrap;
}

.filter-select :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.8) !important;
  border-color: rgba(58, 59, 62, 0.5) !important;
  border-radius: 8px !important;
  min-height: 32px !important;
}

.filter-select :deep(.q-field__label) {
  color: #6b6c6f !important;
  font-size: 0.75rem !important;
}

.filter-select :deep(.q-field__native) {
  color: #cecfd2 !important;
  font-size: 0.78rem !important;
}

/* Body */
.gantt-body {
  display: flex;
  background: rgba(26, 34, 44, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(44, 58, 69, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 400px;
}

/* Sidebar */
.gantt-sidebar {
  width: 260px;
  min-width: 260px;
  border-right: 1px solid rgba(44, 58, 69, 0.6);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(44, 58, 69, 0.6);
  background: rgba(20, 24, 30, 0.5);
}

.sidebar-tasks {
  flex: 1;
  overflow-y: auto;
}

.sidebar-task-row {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  border-bottom: 1px solid rgba(44, 58, 69, 0.25);
  cursor: pointer;
  transition: background 0.15s ease;
}

.sidebar-task-row:hover {
  background: rgba(58, 59, 62, 0.25);
}

.task-priority-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
}

.task-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-name {
  color: #cecfd2;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-meta {
  display: flex;
  align-items: center;
}

.task-status-badge {
  font-size: 0.62rem !important;
  padding: 1px 6px !important;
  border-radius: 3px !important;
}

.no-tasks-sidebar {
  padding: 40px 16px;
  text-align: center;
  color: #6b6c6f;
  font-size: 0.8rem;
}

/* Timeline */
.gantt-timeline {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
}

.timeline-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(20, 24, 30, 0.95);
  border-bottom: 1px solid rgba(44, 58, 69, 0.6);
}

.timeline-header-row {
  display: flex;
  height: 34px;
  border-bottom: 1px solid rgba(44, 58, 69, 0.3);
}

.timeline-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
  border-right: 1px solid rgba(44, 58, 69, 0.2);
}

.timeline-subheader-row {
  display: flex;
  height: 36px;
}

.timeline-subheader-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #6b6c6f;
  border-right: 1px solid rgba(44, 58, 69, 0.15);
}

.timeline-subheader-cell.is-today {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  font-weight: 700;
}

.timeline-subheader-cell.is-weekend {
  background: rgba(255, 255, 255, 0.02);
}

/* Timeline Rows */
.timeline-rows {
  position: relative;
  min-height: 300px;
}

.today-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #5c9ce6;
  z-index: 5;
  opacity: 0.7;
}

.today-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 10px;
  height: 10px;
  background: #5c9ce6;
  border-radius: 50%;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid rgba(44, 58, 69, 0.12);
}

.grid-line.is-weekend {
  background: rgba(255, 255, 255, 0.015);
}

.timeline-row {
  position: absolute;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(44, 58, 69, 0.15);
}

/* Task Bars */
.task-bar {
  position: absolute;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.task-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  z-index: 3;
}

.task-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  opacity: 0.3;
  transition: width 0.3s ease;
}

.task-bar-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 1;
  flex: 1;
}

.task-bar-progress {
  font-size: 0.62rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 6px;
  position: relative;
  z-index: 1;
}

/* Priority colors */
.task-bar.priority-low {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
}

.task-bar.priority-low .task-bar-fill {
  background: #4caf50;
}

.task-bar.priority-medium {
  background: linear-gradient(135deg, #8a6d1b, #c49b2a);
}

.task-bar.priority-medium .task-bar-fill {
  background: #ffa726;
}

.task-bar.priority-high {
  background: linear-gradient(135deg, #944a2d, #c75b3a);
}

.task-bar.priority-high .task-bar-fill {
  background: #ff7043;
}

.task-bar.priority-urgent {
  background: linear-gradient(135deg, #8b2020, #c62828);
}

.task-bar.priority-urgent .task-bar-fill {
  background: #ef5350;
}

.task-bar.is-completed {
  background: linear-gradient(135deg, #1b5e20, #388e3c) !important;
  opacity: 0.7;
}

.task-bar.is-overdue {
  border: 1px solid #ef5350;
  animation: overduePulse 2s ease-in-out infinite;
}

@keyframes overduePulse {
  0%, 100% { box-shadow: 0 2px 6px rgba(239, 83, 80, 0.3); }
  50% { box-shadow: 0 2px 12px rgba(239, 83, 80, 0.6); }
}

.no-date-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  color: #4b5563;
  font-size: 0.7rem;
}

/* Scrollbar */
.gantt-timeline::-webkit-scrollbar {
  height: 8px;
}

.gantt-timeline::-webkit-scrollbar-track {
  background: rgba(20, 24, 30, 0.5);
}

.gantt-timeline::-webkit-scrollbar-thumb {
  background: rgba(58, 59, 62, 0.6);
  border-radius: 4px;
}

.gantt-timeline::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 59, 62, 0.9);
}

.sidebar-tasks::-webkit-scrollbar {
  width: 4px;
}

.sidebar-tasks::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-tasks::-webkit-scrollbar-thumb {
  background: rgba(58, 59, 62, 0.5);
  border-radius: 2px;
}
</style>
