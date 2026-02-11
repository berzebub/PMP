<template>
  <div class="calendar-view">
    <div class="calendar-header q-mb-md">
      <div class="row items-center justify-between">
        <div class="text-h5 text-primary">{{ currentMonthYear }}</div>
        <div class="row q-gutter-sm">
          <q-btn flat round icon="chevron_left" @click="previousMonth" />
          <q-btn flat round icon="chevron_right" @click="nextMonth" />
          <q-btn flat round icon="today" @click="goToToday" />
        </div>
      </div>
    </div>

    <div class="calendar-grid">
      <!-- Days of week header -->
      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday-header text-center text-secondary">
          {{ day }}
        </div>
      </div>

      <!-- Calendar days -->
      <div class="calendar-days">
        <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{
          'is-today': day.isToday,
          'is-other-month': day.isOtherMonth,
          'has-tasks': day.tasks.length > 0
        }" @click="selectDay(day)">
          <div class="day-number">{{ day.dayNumber }}</div>

          <!-- Task indicators -->
          <div v-if="day.tasks.length > 0" class="task-indicators">
            <div v-for="task in day.tasks.slice(0, 3)" :key="task.id" class="task-indicator"
              :style="{ backgroundColor: getTaskColor(task) }" />
            <div v-if="day.tasks.length > 3" class="more-tasks">
              +{{ day.tasks.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day detail panel -->
    <q-dialog v-model="showDayDetail" maximized>
      <q-card class="day-detail-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">
            {{ formatSelectedDate(selectedDay?.date) }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="selectedDay?.tasks.length === 0" class="text-center text-secondary q-py-xl">
            <q-icon name="event_available" size="64px" class="q-mb-md" />
            <div class="text-h6">ไม่มีงานในวันนี้</div>
            <q-btn color="primary" icon="add" label="เพิ่มงาน" @click="createTaskForDate" class="q-mt-md" />
          </div>

          <div v-else>
            <div class="text-h6 text-primary q-mb-md">งานในวันนี้ ({{ selectedDay.tasks.length }})</div>

            <q-card v-for="task in selectedDay.tasks" :key="task.id" class="task-card q-mb-sm"
              @click="selectTask(task)">
              <q-card-section>
                <div class="row items-center">
                  <div class="task-color-indicator" :style="{ backgroundColor: getTaskColor(task) }" />
                  <div class="col">
                    <div class="text-subtitle1 text-primary">{{ task.title }}</div>
                    <div class="text-caption text-secondary">{{ task.description }}</div>
                    <div class="text-caption">
                      <q-icon name="schedule" size="xs" />
                      {{ formatTime(task.dueDate) }}
                    </div>
                  </div>
                  <q-chip :color="getTaskStatusColor(task.status)" text-color="white" size="sm">
                    {{ getTaskStatusName(task.status) }}
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>

            <q-btn flat color="primary" icon="add" label="เพิ่มงาน" @click="createTaskForDate" class="q-mt-md" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from 'stores/tasks'

const tasksStore = useTasksStore()

const currentDate = ref(new Date())
const showDayDetail = ref(false)
const selectedDay = ref(null)

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // Get first day of month and calculate starting date
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayTasks = getTasksForDate(date)

    days.push({
      date: new Date(date),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      isOtherMonth: date.getMonth() !== month,
      tasks: dayTasks
    })
  }

  return days
})

const getTasksForDate = (date) => {
  return tasksStore.tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate.toDateString() === date.toDateString()
  })
}

const getTaskColor = (task) => {
  const statusColors = {
    'todo': '#9E9E9E',
    'in-progress': '#26C6DA',
    'review': '#FFD54F',
    'done': '#1DE9B6'
  }
  return statusColors[task.status] || '#9E9E9E'
}

const getTaskStatusColor = (status) => {
  const statusColors = {
    'todo': 'grey',
    'in-progress': 'info',
    'review': 'warning',
    'done': 'positive'
  }
  return statusColors[status] || 'grey'
}

const getTaskStatusName = (status) => {
  const statusNames = {
    'todo': 'To Do',
    'in-progress': 'กำลังทำ',
    'review': 'ตรวจสอบ',
    'done': 'เสร็จแล้ว'
  }
  return statusNames[status] || status
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectDay = (day) => {
  selectedDay.value = day
  showDayDetail.value = true
}

const selectTask = (task) => {
  // This would open task detail dialog
  console.log('Selected task:', task)
}

const createTaskForDate = () => {
  // This would open create task dialog with pre-filled date
  console.log('Create task for date:', selectedDay.value?.date)
}

const formatSelectedDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Load tasks for current month
  // This would be handled by the parent component
})
</script>

<style scoped>
/* Override Quasar heading sizes */
.text-h5 {
  font-size: 1.05rem !important;
}

.text-h6 {
  font-size: 0.875rem !important;
}

.calendar-view {
  background: transparent;
  min-height: 100vh;
  padding: 20px;
}

.calendar-header {
  background: rgba(26, 34, 44, 0.9);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(44, 58, 69, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.calendar-grid {
  background: rgba(26, 34, 44, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(44, 58, 69, 0.5);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(44, 58, 69, 0.8);
}

.weekday-header {
  padding: 12px;
  font-weight: 600;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(44, 58, 69, 0.8);
}

.calendar-day {
  background: rgba(26, 34, 44, 0.9);
  min-height: 120px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover {
  background: rgba(44, 58, 69, 0.6);
}

.calendar-day.is-today {
  background: rgba(0, 191, 166, 0.1);
  border: 1px solid #00BFA6;
}

.calendar-day.is-other-month {
  opacity: 0.3;
}

.calendar-day.has-tasks {
  border-left: 3px solid #00BFA6;
}

.day-number {
  font-weight: 600;
  color: #E0E0E0;
  margin-bottom: 4px;
}

.task-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
}

.task-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.more-tasks {
  font-size: 10px;
  color: #9E9E9E;
  margin-left: 4px;
}

.day-detail-card {
  background: rgba(26, 34, 44, 0.9);
  backdrop-filter: blur(10px);
}

.task-card {
  background: rgba(14, 20, 27, 0.8);
  border: 1px solid rgba(44, 58, 69, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  border-color: #00BFA6;
  box-shadow: 0 4px 16px rgba(0, 191, 166, 0.2);
}

.task-color-indicator {
  width: 4px;
  height: 100%;
  border-radius: 2px;
  margin-right: 12px;
}

.text-primary {
  color: #00BFA6;
}

.text-secondary {
  color: #9E9E9E;
}
</style>
