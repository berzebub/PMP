<template>
  <q-page class="worklog-page">
    <div class="worklog-container">
      <!-- Header -->
      <div class="wl-page-header">
        <div class="wl-header-left">
          <div class="wl-header-icon">
            <q-icon name="edit_note" size="26px" />
          </div>
          <div>
            <div class="wl-header-title">บันทึกการทำงาน</div>
            <div class="wl-header-subtitle">บันทึกสิ่งที่ทำในแต่ละวัน</div>
          </div>
        </div>
        <div class="wl-header-right">
          <button class="wl-back-btn" @click="$router.back()">
            <q-icon name="arrow_back" size="18px" />
            <span>กลับ</span>
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="wl-grid">
        <!-- Left: Today's Form -->
        <div class="wl-card wl-form-card">
          <div class="wl-card-header">
            <div class="wl-card-header-left">
              <q-icon name="today" size="18px" style="color: #ab47bc;" />
              <span class="wl-card-title">บันทึกวันนี้</span>
            </div>
            <div class="wl-date-label">{{ todayLabel }}</div>
            <div v-if="worklogStore.hasSubmittedToday" class="wl-status wl-status-done">
              <q-icon name="check_circle" size="14px" />
              <span>ส่งแล้ว</span>
            </div>
            <div v-else class="wl-status wl-status-pending">
              <q-icon name="schedule" size="14px" />
              <span>ยังไม่ส่ง</span>
            </div>
          </div>

          <!-- Late Warning -->
          <div v-if="isLate && !worklogStore.hasSubmittedToday" class="wl-late-warning">
            <q-icon name="warning" size="16px" />
            <span>เลย 17:30 แล้ว กรุณาส่งบันทึกการทำงานโดยเร็ว</span>
          </div>

          <!-- Entries Form -->
          <div class="wl-form-body">
            <div class="wl-entries-label">
              <span>รายการงานที่ทำวันนี้</span>
              <span class="wl-entries-count">{{ entries.filter(e => e.trim()).length }} รายการ</span>
            </div>

            <div class="wl-entries-list">
              <div v-for="(entry, idx) in entries" :key="idx" class="wl-entry-row">
                <span class="wl-entry-num">{{ idx + 1 }}</span>
                <input
                  v-model="entries[idx]"
                  class="wl-entry-input"
                  :placeholder="`รายการที่ ${idx + 1}...`"
                  @keydown.enter.prevent="handleEntryEnter(idx)"
                  @keydown.backspace="handleEntryBackspace(idx, $event)"
                />
                <button v-if="entries.length > 1" class="wl-entry-remove" @click="removeEntry(idx)">
                  <q-icon name="close" size="14px" />
                </button>
              </div>
            </div>

            <button class="wl-add-entry-btn" @click="addEntry">
              <q-icon name="add" size="16px" />
              <span>เพิ่มรายการ</span>
            </button>

            <!-- Summary -->
            <div class="wl-summary-field">
              <label class="wl-field-label">สรุปภาพรวม (ไม่บังคับ)</label>
              <textarea
                v-model="summary"
                class="wl-summary-textarea"
                placeholder="สรุปสั้นๆ เช่น วันนี้โฟกัสเรื่อง..."
                rows="2"
                maxlength="300"
              ></textarea>
              <div class="wl-char-count">{{ summary.length }}/300</div>
            </div>

            <!-- Submit -->
            <button
              class="wl-submit-btn"
              :disabled="worklogStore.loading || !hasValidEntries"
              @click="handleSubmit"
            >
              <q-spinner v-if="worklogStore.loading" size="18px" color="white" class="q-mr-sm" />
              <q-icon v-else :name="worklogStore.hasSubmittedToday ? 'update' : 'send'" size="18px" class="q-mr-sm" />
              <span>{{ worklogStore.loading ? 'กำลังบันทึก...' : worklogStore.hasSubmittedToday ? 'อัปเดตบันทึก' : 'ส่งบันทึก' }}</span>
            </button>

            <div v-if="submitSuccess" class="wl-success-msg">
              <q-icon name="check_circle" size="16px" />
              <span>{{ worklogStore.hasSubmittedToday ? 'อัปเดตเรียบร้อยแล้ว' : 'บันทึกเรียบร้อยแล้ว' }}</span>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="wl-right-col">
          <!-- Tabs -->
          <div class="wl-tabs">
            <button class="wl-tab" :class="{ 'wl-tab-active': activeTab === 'history' }" @click="switchTab('history')">
              <q-icon name="history" size="16px" />
              <span>ประวัติของฉัน</span>
            </button>
            <button class="wl-tab" :class="{ 'wl-tab-active': activeTab === 'team' }" @click="switchTab('team')">
              <q-icon name="groups" size="16px" />
              <span>ทีมวันนี้</span>
              <q-badge v-if="worklogStore.teamLogs.length > 0" :label="worklogStore.teamLogs.length" class="wl-team-badge" />
            </button>
          </div>

          <!-- My History Tab -->
          <div v-if="activeTab === 'history'" class="wl-card wl-history-card">
            <div v-if="worklogStore.myLogs.length === 0 && !worklogStore.loading" class="wl-empty">
              <q-icon name="description" size="40px" style="color: #2a2b2e;" />
              <span>ยังไม่มีประวัติบันทึก</span>
            </div>

            <div v-else class="wl-history-list">
              <div v-for="log in worklogStore.myLogs" :key="log.id" class="wl-history-item">
                <div class="wl-history-header">
                  <div class="wl-history-date">{{ formatLogDate(log.date) }}</div>
                  <div class="wl-history-time">{{ formatTime(log.submittedAt) }}</div>
                  <div v-if="log.updatedAt && log.updatedAt !== log.submittedAt" class="wl-history-edited">
                    (แก้ไข)
                  </div>
                </div>
                <ul class="wl-history-entries">
                  <li v-for="(entry, i) in log.entries" :key="i">{{ entry }}</li>
                </ul>
                <div v-if="log.summary" class="wl-history-summary">
                  "{{ log.summary }}"
                </div>
              </div>
            </div>
          </div>

          <!-- Team Tab -->
          <div v-if="activeTab === 'team'" class="wl-card wl-team-card">
            <!-- Date Picker for Team View -->
            <div class="wl-team-date-picker">
              <button class="wl-date-nav" @click="teamDatePrev">
                <q-icon name="chevron_left" size="18px" />
              </button>
              <span class="wl-team-date-label">{{ teamDateLabel }}</span>
              <button class="wl-date-nav" :disabled="isTeamDateToday" @click="teamDateNext">
                <q-icon name="chevron_right" size="18px" />
              </button>
            </div>

            <div v-if="worklogStore.teamLogs.length === 0 && !worklogStore.loading" class="wl-empty">
              <q-icon name="group_off" size="40px" style="color: #2a2b2e;" />
              <span>ยังไม่มีใครส่งบันทึกในวันนี้</span>
            </div>

            <div v-else class="wl-team-list">
              <div v-for="log in sortedTeamLogs" :key="log.id" class="wl-team-item">
                <div class="wl-team-item-header">
                  <div class="wl-team-avatar">
                    <img v-if="authStore.getPhotoURL(log.userId)" :src="authStore.getPhotoURL(log.userId)" class="wl-team-avatar-img" />
                    <span v-else>{{ log.userName?.charAt(0).toUpperCase() || '?' }}</span>
                  </div>
                  <div class="wl-team-info">
                    <div class="wl-team-name">{{ log.userName }}</div>
                    <div class="wl-team-time">ส่งเมื่อ {{ formatTime(log.submittedAt) }}</div>
                  </div>
                  <div class="wl-team-entry-count">{{ log.entries?.length || 0 }} รายการ</div>
                </div>
                <ul class="wl-team-entries">
                  <li v-for="(entry, i) in log.entries" :key="i">{{ entry }}</li>
                </ul>
                <div v-if="log.summary" class="wl-team-summary">
                  "{{ log.summary }}"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useWorklogStore } from 'stores/worklog'
import { useAuthStore } from 'stores/auth'

const worklogStore = useWorklogStore()
const authStore = useAuthStore()

const entries = ref([''])
const summary = ref('')
const activeTab = ref('history')
const submitSuccess = ref(false)
const teamDate = ref(new Date())

onMounted(async () => {
  await worklogStore.fetchTodayLog()
  await worklogStore.fetchMyLogs(30)
  worklogStore.fetchTeamLogs()

  // Populate form if already submitted today
  if (worklogStore.todayLog) {
    entries.value = [...(worklogStore.todayLog.entries || []), '']
    summary.value = worklogStore.todayLog.summary || ''
  }
})

// Computed
const todayLabel = computed(() => {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const isLate = computed(() => {
  const now = new Date()
  return now.getHours() >= 17 && now.getMinutes() >= 30
})

const hasValidEntries = computed(() => {
  return entries.value.some(e => e.trim() !== '')
})

const sortedTeamLogs = computed(() => {
  return [...worklogStore.teamLogs].sort((a, b) => {
    const timeA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0)
    const timeB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0)
    return timeA - timeB
  })
})

const teamDateLabel = computed(() => {
  return teamDate.value.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const isTeamDateToday = computed(() => {
  const today = new Date()
  return teamDate.value.toDateString() === today.toDateString()
})

// Entry management
const addEntry = () => {
  entries.value.push('')
  nextTick(() => {
    const inputs = document.querySelectorAll('.wl-entry-input')
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus()
    }
  })
}

const removeEntry = (idx) => {
  entries.value.splice(idx, 1)
  if (entries.value.length === 0) {
    entries.value.push('')
  }
}

const handleEntryEnter = (idx) => {
  // If current entry has text, add a new row
  if (entries.value[idx].trim() !== '') {
    entries.value.splice(idx + 1, 0, '')
    nextTick(() => {
      const inputs = document.querySelectorAll('.wl-entry-input')
      if (inputs[idx + 1]) {
        inputs[idx + 1].focus()
      }
    })
  }
}

const handleEntryBackspace = (idx, event) => {
  // If entry is empty and not the first one, remove it and focus previous
  if (entries.value[idx] === '' && idx > 0) {
    event.preventDefault()
    entries.value.splice(idx, 1)
    nextTick(() => {
      const inputs = document.querySelectorAll('.wl-entry-input')
      if (inputs[idx - 1]) {
        inputs[idx - 1].focus()
      }
    })
  }
}

// Submit
const handleSubmit = async () => {
  submitSuccess.value = false
  const success = await worklogStore.submitLog({
    entries: entries.value,
    summary: summary.value
  })
  if (success) {
    submitSuccess.value = true
    // Refresh history
    worklogStore.fetchMyLogs(30)
    worklogStore.fetchTeamLogs(worklogStore.getDateStr(teamDate.value))
    // Auto hide success message
    setTimeout(() => { submitSuccess.value = false }, 3000)
  }
}

// Tab switch
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'team') {
    worklogStore.fetchTeamLogs(worklogStore.getDateStr(teamDate.value))
  }
}

// Team date navigation
const teamDatePrev = () => {
  const d = new Date(teamDate.value)
  d.setDate(d.getDate() - 1)
  teamDate.value = d
  worklogStore.fetchTeamLogs(worklogStore.getDateStr(d))
}

const teamDateNext = () => {
  if (isTeamDateToday.value) return
  const d = new Date(teamDate.value)
  d.setDate(d.getDate() + 1)
  teamDate.value = d
  worklogStore.fetchTeamLogs(worklogStore.getDateStr(d))
}

// Helpers
const formatLogDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.worklog-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.worklog-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ====== Header ====== */
.wl-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.wl-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wl-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(171, 71, 188, 0.12);
  color: #ce93d8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wl-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.wl-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.wl-back-btn {
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

.wl-back-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

/* ====== Grid ====== */
.wl-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.wl-right-col {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ====== Card ====== */
.wl-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.wl-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.wl-card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wl-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.wl-date-label {
  font-size: 0.68rem;
  color: #6b6c6f;
  margin-left: auto;
}

.wl-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.wl-status-done {
  background: rgba(76, 175, 80, 0.12);
  color: #66bb6a;
}

.wl-status-pending {
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
}

/* ====== Late Warning ====== */
.wl-late-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(239, 83, 80, 0.08);
  border-bottom: 1px solid rgba(239, 83, 80, 0.1);
  color: #ef5350;
  font-size: 0.72rem;
  font-weight: 500;
}

/* ====== Form Body ====== */
.wl-form-body {
  padding: 16px;
}

.wl-entries-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9e9e9e;
  margin-bottom: 10px;
}

.wl-entries-count {
  font-size: 0.65rem;
  color: #6b6c6f;
  font-weight: 500;
}

/* ====== Entry Rows ====== */
.wl-entries-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.wl-entry-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wl-entry-num {
  width: 20px;
  min-width: 20px;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #4b5563;
}

.wl-entry-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(24, 25, 26, 0.5);
  color: #cecfd2;
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.wl-entry-input:focus {
  border-color: rgba(171, 71, 188, 0.5);
}

.wl-entry-input::placeholder {
  color: #3a3b3e;
}

.wl-entry-remove {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.wl-entry-remove:hover {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}

.wl-add-entry-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px dashed rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 16px;
}

.wl-add-entry-btn:hover {
  border-color: rgba(171, 71, 188, 0.3);
  color: #ce93d8;
  background: rgba(171, 71, 188, 0.05);
}

/* ====== Summary ====== */
.wl-summary-field {
  margin-bottom: 16px;
}

.wl-field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9e9e9e;
  margin-bottom: 6px;
}

.wl-summary-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(24, 25, 26, 0.5);
  color: #cecfd2;
  font-size: 0.78rem;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.wl-summary-textarea:focus {
  border-color: rgba(171, 71, 188, 0.5);
}

.wl-summary-textarea::placeholder {
  color: #3a3b3e;
}

.wl-char-count {
  text-align: right;
  font-size: 0.6rem;
  color: #3a3b3e;
  margin-top: 3px;
}

/* ====== Submit ====== */
.wl-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(171, 71, 188, 0.2);
}

.wl-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(171, 71, 188, 0.3);
}

.wl-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wl-success-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  margin-top: 10px;
  border-radius: 8px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.15);
  color: #66bb6a;
  font-size: 0.72rem;
  font-weight: 600;
}

/* ====== Tabs ====== */
.wl-tabs {
  display: flex;
  gap: 2px;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-bottom: none;
  border-radius: 14px 14px 0 0;
  padding: 6px 6px 0;
  backdrop-filter: blur(10px);
}

.wl-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px 8px 0 0;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.wl-tab:hover {
  color: #9e9e9e;
  background: rgba(58, 59, 62, 0.15);
}

.wl-tab-active {
  color: #ce93d8 !important;
  background: rgba(171, 71, 188, 0.08) !important;
  border-bottom: 2px solid #ab47bc;
}

.wl-team-badge {
  background: rgba(171, 71, 188, 0.2) !important;
  color: #ce93d8 !important;
  font-size: 0.58rem !important;
  min-height: 16px !important;
  padding: 0 5px !important;
}

/* ====== History Card ====== */
.wl-history-card,
.wl-team-card {
  border-radius: 0 0 14px 14px;
  max-height: 600px;
  overflow-y: auto;
}

.wl-history-card::-webkit-scrollbar,
.wl-team-card::-webkit-scrollbar { width: 3px; }
.wl-history-card::-webkit-scrollbar-thumb,
.wl-team-card::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.wl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: #4a4b4e;
  font-size: 0.75rem;
}

/* ====== History Items ====== */
.wl-history-list {
  padding: 4px 0;
}

.wl-history-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
  transition: background 0.15s;
}

.wl-history-item:hover {
  background: rgba(58, 59, 62, 0.1);
}

.wl-history-item:last-child {
  border-bottom: none;
}

.wl-history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.wl-history-date {
  font-size: 0.75rem;
  font-weight: 700;
  color: #cecfd2;
}

.wl-history-time {
  font-size: 0.62rem;
  color: #6b6c6f;
}

.wl-history-edited {
  font-size: 0.6rem;
  color: #4b5563;
  font-style: italic;
}

.wl-history-entries {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wl-history-entries li {
  position: relative;
  padding-left: 14px;
  font-size: 0.75rem;
  color: #9e9e9e;
  line-height: 1.7;
}

.wl-history-entries li::before {
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

.wl-history-summary {
  font-size: 0.7rem;
  color: #6b6c6f;
  font-style: italic;
  margin-top: 4px;
  padding-left: 14px;
}

/* ====== Team Card ====== */
.wl-team-date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.15);
}

.wl-date-nav {
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

.wl-date-nav:hover:not(:disabled) {
  background: rgba(58, 59, 62, 0.3);
  color: #e0e1e4;
}

.wl-date-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.wl-team-date-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
  min-width: 160px;
  text-align: center;
}

.wl-team-list {
  padding: 4px 0;
}

.wl-team-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
  transition: background 0.15s;
}

.wl-team-item:hover {
  background: rgba(58, 59, 62, 0.1);
}

.wl-team-item:last-child {
  border-bottom: none;
}

.wl-team-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.wl-team-avatar {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 8px;
  background: rgba(171, 71, 188, 0.12);
  color: #ce93d8;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.wl-team-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wl-team-info {
  flex: 1;
}

.wl-team-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
}

.wl-team-time {
  font-size: 0.6rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.wl-team-entry-count {
  font-size: 0.62rem;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.wl-team-entries {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wl-team-entries li {
  position: relative;
  padding-left: 14px;
  font-size: 0.72rem;
  color: #9e9e9e;
  line-height: 1.7;
}

.wl-team-entries li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ce93d8;
}

.wl-team-summary {
  font-size: 0.68rem;
  color: #6b6c6f;
  font-style: italic;
  margin-top: 4px;
  padding-left: 14px;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .worklog-page {
    padding: 16px;
  }

  .wl-grid {
    grid-template-columns: 1fr;
  }
}
</style>
