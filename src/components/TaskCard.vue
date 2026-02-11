<template>
  <div class="tc" :class="{ 'tc-dragging': isDragging, 'tc-completed': task.completed }"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    style="user-select: none;"
    >

    <!-- Priority Accent Bar -->
    <div v-if="task.priority && !task.completed" class="tc-accent" :class="'tc-accent-' + task.priority"></div>
    <div v-else-if="task.completed" class="tc-accent tc-accent-completed"></div>

    <!-- Drag Handle -->
    <div v-if="draggable" class="tc-drag"
      draggable="true"
      @dragstart.stop="handleDragStart"
      @dragend.stop="handleDragEnd"
      @mousedown.stop
      title="ลากเพื่อเรียงลำดับ">
      <q-icon name="drag_indicator" size="14px" />
    </div>

    <!-- Card Body -->
    <div class="tc-body">
      <!-- Title Row with Complete Toggle -->
      <div class="tc-title-row">
        <button class="tc-check" :class="{ 'tc-check-done': task.completed }" @click.stop="toggleComplete">
          <q-icon :name="task.completed ? 'check_circle' : 'radio_button_unchecked'" size="18px" />
        </button>
        <div class="tc-title" :class="{ 'tc-title-done': task.completed }">{{ task.title }}</div>
      </div>

      <!-- Description -->
      <div v-if="task.description" class="tc-desc">{{ task.description }}</div>

      <!-- Tags Row -->
      <div class="tc-tags">
        <!-- Priority Pill -->
        <span v-if="task.priority" class="tc-tag" :class="'tc-tag-' + task.priority">
          {{ getPriorityName(task.priority) }}
        </span>

        <!-- Due Date -->
        <span v-if="task.dueDate" class="tc-tag" :class="{ 'tc-tag-overdue': isOverdue, 'tc-tag-soon': isDueSoon && !isOverdue }">
          <q-icon name="schedule" size="11px" />
          {{ formatDate(task.dueDate) }}
        </span>
      </div>

      <!-- Subtask Progress -->
      <div v-if="subtaskCount > 0" class="tc-progress">
        <div class="tc-progress-bar">
          <div class="tc-progress-fill" :style="{ width: subtaskProgress + '%' }"
            :class="{ 'tc-progress-done': subtaskProgress === 100 }"></div>
        </div>
        <span class="tc-progress-text">
          <q-icon name="checklist" size="11px" />
          {{ completedSubtasks }}/{{ subtaskCount }}
        </span>
      </div>

      <!-- Footer: Members -->
      <div v-if="taskMembers.length > 0" class="tc-footer">
        <div class="tc-avatars">
          <div v-for="(member, i) in taskMembers.slice(0, 4)" :key="member.email"
            class="tc-avatar" :style="{ zIndex: 10 - i }">
            <img v-if="member.photoURL" :src="member.photoURL" class="tc-avatar-img" />
            <span v-else>{{ member.avatar }}</span>
          </div>
          <span v-if="taskMembers.length > 4" class="tc-avatar-more">+{{ taskMembers.length - 4 }}</span>
        </div>
      </div>

      <!-- Labels -->
      <div v-if="task.labels?.length" class="tc-labels">
        <span v-for="label in task.labels" :key="label" class="tc-label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTasksStore } from 'stores/tasks'
import { useProjectsStore } from 'stores/projects'
import { useAuthStore } from 'stores/auth'
import { useWorklogStore } from 'stores/worklog'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  draggable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave'])

const tasksStore = useTasksStore()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const worklogStore = useWorklogStore()

const isDragging = ref(false)
const showDragHint = ref(false)

// Subtask stats
const subtaskStats = computed(() => tasksStore.getSubtaskStats(props.task.id))
const subtaskCount = computed(() => subtaskStats.value.total)
const completedSubtasks = computed(() => subtaskStats.value.completed)
const subtaskProgress = computed(() => {
  if (subtaskCount.value === 0) return 0
  return Math.round((completedSubtasks.value / subtaskCount.value) * 100)
})

// Due date status
const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  const dueDate = new Date(props.task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
})

const isDueSoon = computed(() => {
  if (!props.task.dueDate || isOverdue.value) return false
  const dueDate = new Date(props.task.dueDate)
  const today = new Date()
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(today.getDate() + 3)
  return dueDate <= threeDaysFromNow
})

const taskMembers = computed(() => {
  const members = new Set()
  if (props.task.assignedTo) {
    if (Array.isArray(props.task.assignedTo)) {
      props.task.assignedTo.forEach(m => members.add(m))
    } else {
      members.add(props.task.assignedTo)
    }
  }
  const taskSubtasks = tasksStore.getSubtasksForTask(props.task.id)
  if (taskSubtasks && taskSubtasks.length > 0) {
    taskSubtasks.forEach(subtask => {
      if (subtask.assignedTo) {
        if (Array.isArray(subtask.assignedTo)) {
          subtask.assignedTo.forEach(m => members.add(m))
        } else {
          members.add(subtask.assignedTo)
        }
      }
    })
  }
  return Array.from(members).map(email => ({
    email,
    name: email.split('@')[0],
    avatar: email.charAt(0).toUpperCase(),
    photoURL: authStore.getPhotoURL(email)
  }))
})

// Toggle task completion
const toggleComplete = async () => {
  const isCompleting = !props.task.completed
  try {
    await tasksStore.updateTask(props.task.id, {
      completed: isCompleting,
      completedAt: isCompleting ? new Date() : null
    }, { silent: true })
    // Fire-and-forget worklog entry
    if (isCompleting) {
      worklogStore.addAutoEntry(`✅ เสร็จสิ้น: ${props.task.title}`)
    } else {
      worklogStore.addAutoEntry(`↩️ ยกเลิกเสร็จสิ้น: ${props.task.title}`)
    }
  } catch (e) {
    console.error('Error toggling task complete:', e)
  }
}

const getPriorityName = (priority) => {
  const names = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', urgent: 'เร่งด่วน' }
  return names[priority] || priority
}

const formatDate = (date) => new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

// Drag handlers
const handleDragStart = (event) => {
  if (props.draggable) {
    isDragging.value = true
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', event.target.innerHTML)
    emit('dragstart', event, props.task)
  }
}
const handleDragEnd = (event) => { isDragging.value = false; emit('dragend', event) }
const handleDragOver = (event) => { emit('dragover', event, props.task) }
const handleDragEnter = (event) => { emit('dragenter', event, props.task) }
const handleDragLeave = (event) => { emit('dragleave', event, props.task) }

// Load subtasks
const loadSubtasks = async () => {
  try { await tasksStore.fetchSubtasks(props.task.id) } catch (e) { /* silent */ }
}

watch(() => tasksStore.subtasks, () => {}, { deep: true })

onMounted(async () => { await loadSubtasks() })
</script>

<style scoped>
.tc {
  position: relative;
  background: #1e2022;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 6px;
  max-width: 280px;
  width: 100%;
  overflow: hidden;
}

.tc:hover {
  border-color: rgba(92, 156, 230, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
}

.tc:hover .tc-drag {
  opacity: 1;
}

.tc-dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(1.03);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: #5c9ce6;
}

/* Priority Accent Bar */
.tc-accent {
  height: 3px;
  width: 100%;
}
.tc-accent-low { background: linear-gradient(90deg, #4caf50, transparent 70%); }
.tc-accent-medium { background: linear-gradient(90deg, #ffb74d, transparent 70%); }
.tc-accent-high { background: linear-gradient(90deg, #ff9800, transparent 70%); }
.tc-accent-urgent { background: linear-gradient(90deg, #ef5350, transparent 70%); }
.tc-accent-completed { background: linear-gradient(90deg, #4caf50, transparent 40%); }

/* Drag Handle */
.tc-drag {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: grab;
  opacity: 0;
  transition: all 0.15s ease;
  z-index: 10;
  color: #5a5b5e;
  background: rgba(30, 32, 34, 0.8);
}

.tc-drag:hover {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
}

.tc-drag:active {
  cursor: grabbing;
  transform: scale(0.95);
}

/* Body */
.tc-body {
  padding: 12px 14px;
}

/* Title Row */
.tc-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.tc-check {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  margin-top: 1px;
  border: none;
  background: none;
  cursor: pointer;
  color: #4a4b4e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.tc-check:hover {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
  transform: scale(1.15);
}

.tc-check-done {
  color: #4caf50 !important;
  animation: tc-pop 0.35s ease;
}

@keyframes tc-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Title */
.tc-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e0e1e4;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  flex: 1;
}

.tc-title-done {
  text-decoration: line-through;
  color: #5a5b5e;
}

/* Completed card state */
.tc-completed {
  opacity: 0.65;
}

.tc-completed .tc-body {
  position: relative;
}

.tc-completed .tc-desc {
  color: #4a4b4e;
}

.tc-completed .tc-tag {
  opacity: 0.5;
}

.tc-completed:hover {
  opacity: 0.9;
}

/* Description */
.tc-desc {
  font-size: 0.7rem;
  color: #6b6c6f;
  line-height: 1.4;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* Tags Row */
.tc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.tc-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1;
}

.tc-tag-low {
  background: rgba(76, 175, 80, 0.1);
  color: #66bb6a;
}
.tc-tag-medium {
  background: rgba(255, 183, 77, 0.1);
  color: #ffb74d;
}
.tc-tag-high {
  background: rgba(255, 152, 0, 0.1);
  color: #ffa726;
}
.tc-tag-urgent {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.tc-tag-overdue {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}
.tc-tag-soon {
  background: rgba(255, 183, 77, 0.1);
  color: #ffb74d;
}

/* Due date default (no overdue/soon) */
.tc-tag:not(.tc-tag-low):not(.tc-tag-medium):not(.tc-tag-high):not(.tc-tag-urgent):not(.tc-tag-overdue):not(.tc-tag-soon) {
  background: rgba(58, 59, 62, 0.25);
  color: #9e9e9e;
}

/* Progress */
.tc-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.tc-progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(58, 59, 62, 0.4);
  border-radius: 2px;
  overflow: hidden;
}

.tc-progress-fill {
  height: 100%;
  background: #4caf50;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.tc-progress-done {
  background: #66bb6a;
}

.tc-progress-text {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  color: #5a5b5e;
  white-space: nowrap;
}

/* Footer / Avatars */
.tc-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.tc-avatars {
  display: flex;
  align-items: center;
}

.tc-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1e2022;
  margin-left: -6px;
  position: relative;
  overflow: hidden;
}

.tc-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tc-avatar:first-child {
  margin-left: 0;
}

.tc-avatar-more {
  font-size: 0.55rem;
  color: #5a5b5e;
  margin-left: 4px;
}

/* Labels */
.tc-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 8px;
}

.tc-label {
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 0.58rem;
  font-weight: 500;
  background: rgba(92, 156, 230, 0.08);
  color: #7eadd8;
}
</style>
