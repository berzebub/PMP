<template>
  <q-page class="trash-page">
    <!-- Header -->
    <div class="trash-header">
      <div class="header-left">
        <q-btn flat round icon="arrow_back" size="sm" class="back-btn" @click="goBack" />
        <div class="header-icon-wrapper">
          <q-icon name="delete_outline" size="22px" />
        </div>
        <div>
          <div class="header-title">ถังขยะ</div>
          <div class="header-subtitle">{{ projectsStore.currentProject?.name }}</div>
        </div>
      </div>
      <div class="header-right">
        <q-btn v-if="trashedTasks.length > 0" flat icon="delete_forever" label="ล้างถังขยะ"
          class="empty-trash-btn" @click="confirmEmptyTrash" :disable="loading" />
        <q-btn flat round icon="refresh" size="sm" class="refresh-btn"
          @click="loadTrashedTasks" :loading="loading">
          <q-tooltip>รีเฟรช</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Content -->
    <div class="trash-body">
      <!-- Loading -->
      <div v-if="loading" class="state-container">
        <q-spinner-dots size="40px" style="color: #5c9ce6;" />
        <div class="state-text">กำลังโหลด...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="trashedTasks.length === 0" class="state-container">
        <div class="empty-icon-wrapper">
          <q-icon name="auto_delete" size="48px" style="color: #4b5563;" />
        </div>
        <div class="empty-title">ถังขยะว่างเปล่า</div>
        <div class="empty-desc">Tasks ที่ถูกลบจะแสดงที่นี่ สามารถกู้คืนหรือลบถาวรได้</div>
      </div>

      <!-- Trashed Tasks List -->
      <div v-else>
        <div class="trash-count">
          <q-icon name="inventory_2" size="16px" style="color: #6b6c6f;" />
          <span>{{ trashedTasks.length }} รายการในถังขยะ</span>
        </div>

        <div class="trash-list">
          <div v-for="task in trashedTasks" :key="task.id" class="trash-item">
            <!-- Priority indicator -->
            <div class="priority-bar" :style="{ background: getPriorityBarColor(task.priority) }"></div>

            <div class="item-content">
              <div class="item-main">
                <div class="item-title">{{ task.title }}</div>
                <div v-if="task.description" class="item-desc">{{ task.description }}</div>

                <div class="item-meta">
                  <div class="meta-chip meta-date">
                    <q-icon name="schedule" size="13px" />
                    <span>ลบเมื่อ {{ formatDate(task.deletedAt) }}</span>
                  </div>
                  <div v-if="task.status" class="meta-chip">
                    <div class="status-dot" :style="{ background: getStatusDotColor(task.status) }"></div>
                    <span>{{ getStatusName(task.status) }}</span>
                  </div>
                  <div v-if="task.priority" class="meta-chip" :class="'priority-' + task.priority">
                    <span>{{ getPriorityName(task.priority) }}</span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <q-btn flat round icon="restore" size="sm" class="action-restore"
                  @click="restoreTask(task)" :disable="loading">
                  <q-tooltip>กู้คืน</q-tooltip>
                </q-btn>
                <q-btn flat round icon="delete_forever" size="sm" class="action-delete"
                  @click="permanentDeleteTask(task)" :disable="loading">
                  <q-tooltip>ลบถาวร</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTasksStore } from 'stores/tasks'
import { useProjectsStore } from 'stores/projects'

const $q = useQuasar()
const router = useRouter()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const trashedTasks = ref([])
const loading = ref(false)

const loadTrashedTasks = async () => {
  if (!projectsStore.currentProject?.id) {
    $q.notify({ type: 'negative', message: 'ไม่พบโปรเจค', position: 'top' })
    return
  }

  try {
    loading.value = true
    trashedTasks.value = await tasksStore.fetchTrashedTasks(projectsStore.currentProject.id)
  } catch (error) {
    console.error('Error loading trashed tasks:', error)
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการโหลดถังขยะ', position: 'top' })
  } finally {
    loading.value = false
  }
}

const restoreTask = async (task) => {
  $q.dialog({
    title: 'กู้คืน Task',
    message: `คุณต้องการกู้คืน Task "${task.title}" หรือไม่?`,
    cancel: { label: 'ยกเลิก', flat: true },
    ok: { label: 'กู้คืน', color: 'positive', icon: 'restore' },
    dark: true
  }).onOk(async () => {
    try {
      await tasksStore.restoreFromTrash(task.id)
      const index = trashedTasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) trashedTasks.value.splice(index, 1)
      $q.notify({ type: 'positive', message: 'กู้คืน Task สำเร็จ!', icon: 'restore', position: 'top' })
    } catch (error) {
      console.error('Error restoring task:', error)
      $q.notify({ type: 'negative', message: `เกิดข้อผิดพลาด: ${error.message}`, position: 'top' })
    }
  })
}

const permanentDeleteTask = async (task) => {
  $q.dialog({
    title: 'ลบถาวร',
    message: `คุณต้องการลบ Task "${task.title}" ถาวรหรือไม่?<br><span style="color:#ef5350;">การกระทำนี้ไม่สามารถย้อนกลับได้</span>`,
    html: true,
    cancel: { label: 'ยกเลิก', flat: true },
    ok: { label: 'ลบถาวร', color: 'negative', icon: 'delete_forever' },
    dark: true
  }).onOk(async () => {
    try {
      await tasksStore.deleteTask(task.id)
      const index = trashedTasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) trashedTasks.value.splice(index, 1)
      $q.notify({ type: 'positive', message: 'ลบ Task ถาวรแล้ว', position: 'top' })
    } catch (error) {
      console.error('Error deleting task:', error)
      $q.notify({ type: 'negative', message: `เกิดข้อผิดพลาด: ${error.message}`, position: 'top' })
    }
  })
}

const confirmEmptyTrash = () => {
  $q.dialog({
    title: 'ล้างถังขยะ',
    message: `คุณต้องการลบ Tasks ทั้งหมด (${trashedTasks.value.length} รายการ) ถาวรหรือไม่?<br><br><span style="color:#ef5350;font-weight:600;">การกระทำนี้ไม่สามารถย้อนกลับได้</span>`,
    html: true,
    cancel: { label: 'ยกเลิก', flat: true },
    ok: { label: 'ล้างถังขยะ', color: 'negative', icon: 'delete_forever' },
    dark: true
  }).onOk(async () => {
    try {
      loading.value = true
      const count = await tasksStore.emptyTrash(projectsStore.currentProject.id)
      trashedTasks.value = []
      $q.notify({ type: 'positive', message: `ล้างถังขยะสำเร็จ (${count} รายการ)`, position: 'top' })
    } catch (error) {
      console.error('Error emptying trash:', error)
      $q.notify({ type: 'negative', message: `เกิดข้อผิดพลาด: ${error.message}`, position: 'top' })
    } finally {
      loading.value = false
    }
  })
}

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusName = (statusId) => {
  const statuses = tasksStore.taskStatuses?.value || tasksStore.taskStatuses || []
  if (Array.isArray(statuses)) {
    const found = statuses.find(s => s.id === statusId)
    if (found) return found.name
  }
  return statusId
}

const getStatusDotColor = (statusId) => {
  const statuses = tasksStore.taskStatuses?.value || tasksStore.taskStatuses || []
  if (Array.isArray(statuses)) {
    const idx = statuses.findIndex(s => s.id === statusId)
    if (idx !== -1) {
      const colors = ['#9E9E9E', '#42A5F5', '#FFD54F', '#66BB6A', '#FF7043', '#AB47BC']
      return colors[idx % colors.length]
    }
  }
  return '#9E9E9E'
}

const getPriorityBarColor = (priority) => {
  const colors = { low: '#4caf50', medium: '#ffa726', high: '#ff7043', urgent: '#ef5350' }
  return colors[priority] || '#6b6c6f'
}

const getPriorityName = (priority) => {
  const names = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', urgent: 'เร่งด่วน' }
  return names[priority] || priority
}

onMounted(() => {
  loadTrashedTasks()
})
</script>

<style scoped>
/* Page */
.trash-page {
  background: #18191a;
  min-height: 100vh;
}

/* Header */
.trash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(44, 58, 69, 0.4);
  background: rgba(24, 25, 26, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  color: #6b6c6f !important;
}

.back-btn:hover {
  color: #cecfd2 !important;
  background: rgba(58, 59, 62, 0.3) !important;
}

.header-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(239, 83, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef5350;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #cecfd2;
}

.header-subtitle {
  font-size: 0.73rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.empty-trash-btn {
  color: #ef5350 !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(239, 83, 80, 0.2) !important;
}

.empty-trash-btn:hover {
  background: rgba(239, 83, 80, 0.1) !important;
  border-color: rgba(239, 83, 80, 0.4) !important;
}

.refresh-btn {
  color: #6b6c6f !important;
}

.refresh-btn:hover {
  color: #cecfd2 !important;
  background: rgba(58, 59, 62, 0.3) !important;
}

/* Body */
.trash-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 24px;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.state-text {
  font-size: 0.82rem;
  color: #6b6c6f;
  margin-top: 12px;
}

.empty-icon-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(58, 59, 62, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #cecfd2;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 0.82rem;
  color: #6b6c6f;
  line-height: 1.5;
  max-width: 320px;
}

/* Trash List */
.trash-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-bottom: 14px;
}

.trash-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trash-item {
  display: flex;
  background: #1e2124;
  border: 1px solid rgba(44, 58, 69, 0.35);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.trash-item:hover {
  border-color: rgba(58, 59, 62, 0.6);
  background: #222528;
}

.priority-bar {
  width: 4px;
  min-height: 100%;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
}

.item-main {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #cecfd2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 0.75rem;
  color: #6b6c6f;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #6b6c6f;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(58, 59, 62, 0.2);
}

.meta-date {
  color: #9ca3af;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.priority-low {
  color: #4caf50 !important;
  background: rgba(76, 175, 80, 0.1) !important;
}

.priority-medium {
  color: #ffa726 !important;
  background: rgba(255, 167, 38, 0.1) !important;
}

.priority-high {
  color: #ff7043 !important;
  background: rgba(255, 112, 67, 0.1) !important;
}

.priority-urgent {
  color: #ef5350 !important;
  background: rgba(239, 83, 80, 0.1) !important;
}

/* Actions */
.item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.trash-item:hover .item-actions {
  opacity: 1;
}

.action-restore {
  color: #4caf50 !important;
}

.action-restore:hover {
  background: rgba(76, 175, 80, 0.1) !important;
}

.action-delete {
  color: #6b6c6f !important;
}

.action-delete:hover {
  color: #ef5350 !important;
  background: rgba(239, 83, 80, 0.1) !important;
}
</style>
