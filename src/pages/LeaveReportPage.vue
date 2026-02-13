<template>
  <q-page class="report-page">
    <div class="report-container">
      <!-- Header -->
      <div class="report-header">
        <div class="report-header-left">
          <div class="report-header-icon">
            <q-icon name="assessment" size="26px" />
          </div>
          <div>
            <div class="report-header-title">Leave Report</div>
            <div class="report-header-subtitle">รายงานการลาของพนักงาน</div>
          </div>
        </div>
        <div class="report-header-actions">
          <!-- View Toggle -->
          <div v-if="hasFetched && reportLeaves.length > 0" class="report-view-toggle">
            <button class="report-view-btn" :class="{ 'report-view-active': viewMode === 'list' }" @click="viewMode = 'list'">
              <q-icon name="list_alt" size="15px" />
              <span>รายการ</span>
            </button>
            <button class="report-view-btn" :class="{ 'report-view-active': viewMode === 'chart' }" @click="viewMode = 'chart'">
              <q-icon name="bar_chart" size="15px" />
              <span>กราฟ</span>
            </button>
          </div>
          <button v-if="reportLeaves.length > 0" class="report-export-btn" @click="exportToExcel">
            <q-icon name="download" size="16px" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="report-card report-filter-card">
        <div class="report-filter-row">
          <!-- Mode Toggle -->
          <div class="report-filter-group">
            <label class="report-filter-label">ประเภทรายงาน</label>
            <div class="report-mode-toggle">
              <button v-for="m in modes" :key="m.value"
                class="report-mode-btn" :class="{ 'report-mode-active': mode === m.value }"
                @click="mode = m.value">
                <q-icon :name="m.icon" size="15px" />
                <span>{{ m.label }}</span>
              </button>
            </div>
          </div>

          <!-- Person Selector (individual mode) -->
          <div v-if="mode === 'individual'" class="report-filter-group report-filter-grow">
            <label class="report-filter-label">พนักงาน</label>
            <q-select v-model="selectedUser" :options="filteredUsers" option-label="displayLabel"
              option-value="email" use-input input-debounce="200" @filter="filterUsers"
              emit-value map-options dense filled dark placeholder="ค้นหาชื่อหรืออีเมล..."
              class="report-select">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.firstName }} {{ scope.opt.lastName }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.email }} — {{ scope.opt.department || 'ไม่ระบุแผนก' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">ไม่พบพนักงาน</q-item-section></q-item>
              </template>
            </q-select>
          </div>

          <!-- Department Selector (department mode) -->
          <div v-if="mode === 'department'" class="report-filter-group report-filter-grow">
            <label class="report-filter-label">แผนก</label>
            <q-select v-model="selectedDept" :options="departmentsStore.departments" option-label="name"
              option-value="name" emit-value map-options dense filled dark placeholder="เลือกแผนก..."
              class="report-select">
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">ไม่พบแผนก</q-item-section></q-item>
              </template>
            </q-select>
          </div>

          <!-- Date Mode Toggle -->
          <div class="report-filter-group">
            <label class="report-filter-label">ช่วงเวลา</label>
            <q-btn-toggle v-model="dateMode" no-caps rounded unelevated toggle-color="deep-purple"
              text-color="grey-5" color="grey-10" :options="[
                { label: 'ทั้งปี', value: 'year' },
                { label: 'กำหนดเอง', value: 'custom' }
              ]" class="report-date-toggle" />
          </div>

          <!-- Year Selector (when mode = year) -->
          <div v-if="dateMode === 'year'" class="report-filter-group">
            <label class="report-filter-label">ปี</label>
            <q-select v-model="selectedYear" :options="yearOptions" emit-value map-options dense filled dark
              class="report-select report-year-select" />
          </div>

          <!-- Date Range Picker (when mode = custom) -->
          <div v-if="dateMode === 'custom'" class="report-filter-group">
            <label class="report-filter-label">ช่วงวันที่</label>
            <q-input :model-value="dateRangeDisplay" dense filled dark readonly
              class="report-select report-daterange-input">
              <template v-slot:append>
                <q-icon name="date_range" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateRange" range mask="YYYY-MM-DD" dark color="deep-purple" minimal>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="ตกลง" color="deep-purple" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Fetch Button -->
          <div class="report-filter-group report-filter-action">
            <button class="report-fetch-btn" :disabled="leaveStore.loading || !canFetch" @click="fetchReport">
              <q-spinner v-if="leaveStore.loading" size="16px" color="white" />
              <q-icon v-else name="search" size="16px" />
              <span>{{ leaveStore.loading ? 'กำลังโหลด...' : 'ดูรายงาน' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div v-if="hasFetched" class="report-summary-row">
        <!-- Per-type cards -->
        <div v-for="t in leaveStore.leaveTypes" :key="t.value" class="report-summary-card">
          <div class="report-summary-card-header">
            <span class="report-summary-icon">{{ t.icon }}</span>
            <span class="report-summary-label">{{ t.label }}</span>
          </div>
          <div class="report-summary-numbers">
            <div class="report-summary-stat">
              <span class="report-summary-value">{{ formatDays(summaryByType[t.value]?.days || 0) }}</span>
              <span class="report-summary-unit">วัน</span>
            </div>
            <div class="report-summary-stat">
              <span class="report-summary-value report-summary-count">{{ summaryByType[t.value]?.count || 0 }}</span>
              <span class="report-summary-unit">ครั้ง</span>
            </div>
          </div>
          <!-- Individual mode: quota info -->
          <div v-if="mode === 'individual' && individualQuota" class="report-quota-info">
            <template v-if="leaveStore.noQuotaTypes.includes(t.value)">
              <span>โควต้า {{ t.value === 'maternity' ? '90 วัน/ครั้ง' : 'ไม่จำกัด' }}</span>
            </template>
            <template v-else>
              <span>โควต้า {{ individualQuota[t.value] || 0 }} วัน</span>
              <span class="report-quota-sep">|</span>
              <span :class="{ 'report-quota-warning': (individualQuota[t.value] || 0) - (summaryByType[t.value]?.days || 0) <= 0 }">
                คงเหลือ {{ formatDays(Math.max(0, (individualQuota[t.value] || 0) - (summaryByType[t.value]?.days || 0))) }} วัน
              </span>
            </template>
          </div>
          <div class="report-summary-bar">
            <div class="report-summary-bar-fill" :style="{ width: getBarWidth(t.value), background: t.color }"></div>
          </div>
        </div>

        <!-- Status breakdown card -->
        <div class="report-summary-card report-status-card">
          <div class="report-summary-card-header">
            <q-icon name="donut_small" size="16px" style="color: #ce93d8;" />
            <span class="report-summary-label">สถานะ</span>
          </div>
          <div class="report-status-grid">
            <div v-for="s in statusSummary" :key="s.key" class="report-status-item">
              <div class="report-status-dot" :style="{ background: s.color }"></div>
              <span class="report-status-label">{{ s.label }}</span>
              <span class="report-status-count">{{ s.count }}</span>
            </div>
          </div>
          <div class="report-total-row">
            <span>ทั้งหมด</span>
            <strong>{{ reportLeaves.length }} รายการ</strong>
          </div>
        </div>
      </div>

      <!-- Chart View -->
      <div v-if="hasFetched && viewMode === 'chart' && reportLeaves.length > 0" class="report-chart-section">
        <div class="report-chart-grid">
          <!-- Chart 1: Leave Days by Type (Doughnut) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="donut_large" size="16px" style="color: #42a5f5;" />
              <span>สัดส่วนการลาตามประเภท</span>
            </div>
            <div class="report-chart-body">
              <Doughnut :data="typeChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Chart 2: Monthly Leave Trend (Stacked Bar) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="trending_up" size="16px" style="color: #66bb6a;" />
              <span>แนวโน้มการลารายเดือน</span>
            </div>
            <div class="report-chart-body">
              <Bar :data="monthlyChartData" :options="stackedBarOptions" />
            </div>
          </div>

          <!-- Chart 3: Status Distribution (Doughnut) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="pie_chart" size="16px" style="color: #ce93d8;" />
              <span>สัดส่วนสถานะคำขอ</span>
            </div>
            <div class="report-chart-body">
              <Doughnut :data="statusChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Chart 4: Department / Quota Usage (Horizontal Bar) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="leaderboard" size="16px" style="color: #ffb74d;" />
              <span>{{ mode === 'individual' ? 'การใช้โควต้า' : 'อันดับแผนก' }}</span>
            </div>
            <div class="report-chart-body">
              <Bar :data="fourthChartData" :options="horizontalBarOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Detail List -->
      <div v-if="hasFetched && viewMode === 'list'" class="report-card report-detail-card">
        <div class="report-card-header">
          <q-icon name="list_alt" size="18px" style="color: #42a5f5;" />
          <span class="report-card-title">รายละเอียดการลา</span>
          <q-badge v-if="reportLeaves.length > 0" :label="reportLeaves.length + ' รายการ'" class="report-count-badge" />
        </div>

        <div v-if="reportLeaves.length === 0" class="report-empty">
          <q-icon name="search_off" size="48px" style="color: #2a2b2e;" />
          <span>ไม่พบข้อมูลการลาตามเงื่อนไขที่เลือก</span>
        </div>

        <div v-else class="report-detail-list">
          <div v-for="leave in reportLeaves" :key="leave.id" class="report-detail-item">
            <div class="report-detail-top">
              <div class="report-detail-type">
                <span>{{ getTypeInfo(leave.leaveType).icon }}</span>
                <span>{{ getTypeInfo(leave.leaveType).label }}</span>
                <span v-if="leave.durationType && leave.durationType !== 'full_day'" class="report-duration-badge">
                  {{ getDurationLabel(leave) }}
                </span>
              </div>
              <div class="report-detail-status"
                :style="{ color: getStatusInfo(leave.status).color, background: getStatusInfo(leave.status).color + '15' }">
                <q-icon :name="getStatusInfo(leave.status).icon" size="12px" />
                <span>{{ getStatusInfo(leave.status).label }}</span>
              </div>
            </div>

            <div class="report-detail-name">{{ leave.firstName }} {{ leave.lastName }}</div>

            <div class="report-detail-meta">
              <span class="report-detail-dates">
                <q-icon name="date_range" size="13px" />
                {{ formatDate(leave.startDate) }}{{ leave.startDate !== leave.endDate ? ' — ' + formatDate(leave.endDate) : '' }}
              </span>
              <span class="report-detail-days">{{ getDisplayDays(leave) }} วัน</span>
              <span v-if="leave.department" class="report-detail-dept">
                <q-icon name="business" size="12px" />
                {{ leave.department }}
              </span>
            </div>

            <div v-if="leave.details" class="report-detail-reason">{{ leave.details }}</div>

            <div v-if="leave.headApproval || leave.hrApproval" class="report-detail-approvals">
              <span v-if="leave.headApproval" class="report-approval-chip">
                <q-icon name="check_circle" size="11px" style="color: #66bb6a;" />
                หัวหน้า: {{ leave.headApproval.approvedByName }}
              </span>
              <span v-if="leave.hrApproval" class="report-approval-chip">
                <q-icon name="check_circle" size="11px" style="color: #ce93d8;" />
                HR: {{ leave.hrApproval.approvedByName }}
              </span>
            </div>

            <div v-if="leave.status === 'rejected' && leave.rejectionReason" class="report-detail-rejected">
              <q-icon name="info" size="11px" />
              เหตุผล: {{ leave.rejectionReason }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (before fetch) -->
      <div v-if="!hasFetched" class="report-card report-intro-card">
        <div class="report-intro">
          <q-icon name="assessment" size="56px" style="color: #2a2b2e;" />
          <div class="report-intro-title">เลือกเงื่อนไขและกด "ดูรายงาน"</div>
          <div class="report-intro-desc">เลือกดูรายงานได้ทั้งรายบุคคล รายแผนก หรือทั้งหมด</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeaveStore } from 'stores/leave'
import { useAuthStore } from 'stores/auth'
import { useDepartmentsStore } from 'stores/departments'
import * as XLSX from 'xlsx'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

const leaveStore = useLeaveStore()
const authStore = useAuthStore()
const departmentsStore = useDepartmentsStore()

// --- View Mode ---
const viewMode = ref('list')

// --- Filter State ---
const modes = [
  { value: 'individual', label: 'รายบุคคล', icon: 'person' },
  { value: 'department', label: 'รายแผนก', icon: 'business' },
  { value: 'all', label: 'ทั้งหมด', icon: 'groups' }
]

const mode = ref('all')
const selectedUser = ref(null)
const selectedDept = ref(null)
const hasFetched = ref(false)
const filteredUsers = ref([])
const individualQuota = ref(null)

// --- Date Range ---
const currentYear = new Date().getFullYear()
const dateMode = ref('year') // 'year' or 'custom'
const selectedYear = ref(currentYear)
const dateRange = ref({ from: `${currentYear}-01-01`, to: `${currentYear}-12-31` })

const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i
}))

// Display formatted date range in the input
const dateRangeDisplay = computed(() => {
  if (!dateRange.value) return ''
  if (typeof dateRange.value === 'string') {
    // Single date selected (from === to)
    return dateRange.value
  }
  return `${dateRange.value.from} ~ ${dateRange.value.to}`
})

// Compute effective start/end based on mode
const getEffectiveDateRange = () => {
  if (dateMode.value === 'year') {
    const y = selectedYear.value
    return { startDate: `${y}-01-01`, endDate: `${y}-12-31` }
  }
  // Custom range
  if (typeof dateRange.value === 'string') {
    return { startDate: dateRange.value, endDate: dateRange.value }
  }
  return { startDate: dateRange.value.from, endDate: dateRange.value.to }
}

const reportLeaves = computed(() => leaveStore.reportLeaves)

const canFetch = computed(() => {
  if (mode.value === 'individual') return !!selectedUser.value
  if (mode.value === 'department') return !!selectedDept.value
  return true
})

// --- Init ---
onMounted(async () => {
  await Promise.all([
    authStore.allProfiles.length === 0 ? authStore.fetchAllProfiles() : Promise.resolve(),
    departmentsStore.departments.length === 0 ? departmentsStore.fetchDepartments() : Promise.resolve(),
    leaveStore.fetchLeaveQuota()
  ])

  filteredUsers.value = buildUserList()
})

const buildUserList = () => {
  return authStore.allProfiles.map(p => ({
    ...p,
    email: p.id || p.email,
    displayLabel: `${p.firstName || ''} ${p.lastName || ''} (${p.id || p.email})`.trim()
  }))
}

const filterUsers = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredUsers.value = buildUserList().filter(p =>
      p.displayLabel.toLowerCase().includes(needle) ||
      (p.department || '').toLowerCase().includes(needle)
    )
  })
}

// --- Fetch Report ---
const fetchReport = async () => {
  const { startDate, endDate } = getEffectiveDateRange()
  await leaveStore.fetchLeaveReport({
    mode: mode.value,
    userId: mode.value === 'individual' ? selectedUser.value : '',
    department: mode.value === 'department' ? selectedDept.value : '',
    year: dateMode.value === 'year' ? selectedYear.value : new Date(startDate).getFullYear(),
    startDate,
    endDate
  })
  hasFetched.value = true

  // Fetch individual quota if in individual mode
  if (mode.value === 'individual' && selectedUser.value) {
    const iq = await leaveStore.fetchUserIndividualQuota(selectedUser.value)
    if (iq) {
      individualQuota.value = { sick: iq.sick, personal: iq.personal, vacation: iq.vacation, maternity: 90, unpaid: 999, other: 999 }
    } else {
      individualQuota.value = { ...leaveStore.leaveQuota }
    }
  } else {
    individualQuota.value = null
  }
}

// --- Summary Computeds ---
const summaryByType = computed(() => {
  const map = { sick: { days: 0, count: 0 }, personal: { days: 0, count: 0 }, vacation: { days: 0, count: 0 }, maternity: { days: 0, count: 0 }, unpaid: { days: 0, count: 0 }, other: { days: 0, count: 0 } }
  for (const leave of reportLeaves.value) {
    if (leave.status === 'rejected' || leave.status === 'cancelled') continue
    const type = leave.leaveType
    if (!map[type]) continue
    const days = leave.totalDays !== undefined && leave.totalDays !== null
      ? leave.totalDays
      : leaveStore.calcBusinessDays(leave.startDate, leave.endDate)
    map[type].days += days
    map[type].count++
  }
  // Round days
  for (const key of Object.keys(map)) {
    map[key].days = Math.round(map[key].days * 100) / 100
  }
  return map
})

const statusSummary = computed(() => {
  const counts = {}
  for (const leave of reportLeaves.value) {
    counts[leave.status] = (counts[leave.status] || 0) + 1
  }
  const statuses = ['approved', 'pending_head', 'pending_hr', 'rejected', 'cancelled']
  return statuses
    .filter(s => counts[s])
    .map(s => ({
      key: s,
      label: leaveStore.statusLabels[s]?.label || s,
      color: leaveStore.statusLabels[s]?.color || '#9e9e9e',
      count: counts[s] || 0
    }))
})

const getBarWidth = (type) => {
  if (!individualQuota.value) {
    const maxDays = Math.max(...Object.values(summaryByType.value).map(v => v.days), 1)
    return ((summaryByType.value[type]?.days || 0) / maxDays * 100) + '%'
  }
  const quota = individualQuota.value[type] || 1
  return Math.min(100, ((summaryByType.value[type]?.days || 0) / quota * 100)) + '%'
}

// --- Helpers ---
const getTypeInfo = (type) => {
  return leaveStore.leaveTypes.find(t => t.value === type) || { icon: '📄', label: type, color: '#9e9e9e' }
}

const getStatusInfo = (status) => {
  return leaveStore.statusLabels[status] || { label: status, color: '#9e9e9e', icon: 'info' }
}

const getDurationLabel = (leave) => {
  if (!leave.durationType || leave.durationType === 'full_day') return ''
  const dt = leaveStore.durationTypes.find(d => d.value === leave.durationType)
  if (leave.durationType === 'custom' && leave.customStartTime && leave.customEndTime) {
    return `${leave.customStartTime}-${leave.customEndTime}`
  }
  return dt?.label || leave.durationType
}

const getDisplayDays = (leave) => {
  if (leave.totalDays !== undefined && leave.totalDays !== null) {
    return formatDays(leave.totalDays)
  }
  return leaveStore.calcBusinessDays(leave.startDate, leave.endDate)
}

const formatDays = (days) => {
  if (days === Math.floor(days)) return days
  return Math.round(days * 100) / 100
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

// --- Chart Data ---
const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const darkTooltip = {
  backgroundColor: 'rgba(30, 33, 36, 0.95)',
  titleColor: '#e0e1e4',
  bodyColor: '#cecfd2',
  borderColor: 'rgba(58, 59, 62, 0.4)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: 600 },
  bodyFont: { size: 11 }
}

const darkLegend = {
  labels: {
    color: '#9e9e9e',
    font: { size: 11 },
    padding: 14,
    usePointStyle: true,
    pointStyleWidth: 8
  }
}

const darkGridColor = 'rgba(58, 59, 62, 0.25)'

// Chart 1: Leave Days by Type (Doughnut)
const typeChartData = computed(() => {
  const types = leaveStore.leaveTypes
  return {
    labels: types.map(t => t.label),
    datasets: [{
      data: types.map(t => summaryByType.value[t.value]?.days || 0),
      backgroundColor: types.map(t => t.color + 'cc'),
      borderColor: types.map(t => t.color),
      borderWidth: 2,
      hoverOffset: 6
    }]
  }
})

// Chart 2: Monthly Leave Trend (Stacked Bar)
const monthlyChartData = computed(() => {
  const monthBuckets = {}
  for (let i = 0; i < 12; i++) {
    monthBuckets[i] = { sick: 0, personal: 0, vacation: 0, maternity: 0, unpaid: 0, other: 0 }
  }
  for (const leave of reportLeaves.value) {
    if (leave.status === 'rejected' || leave.status === 'cancelled') continue
    if (!leave.startDate) continue
    const month = parseInt(leave.startDate.split('-')[1], 10) - 1
    const type = leave.leaveType
    if (monthBuckets[month] && type in monthBuckets[month]) {
      const days = leave.totalDays != null ? leave.totalDays : leaveStore.calcBusinessDays(leave.startDate, leave.endDate)
      monthBuckets[month][type] += days
    }
  }
  const types = leaveStore.leaveTypes
  return {
    labels: monthLabels,
    datasets: types.map(t => ({
      label: t.label,
      data: Array.from({ length: 12 }, (_, i) => Math.round((monthBuckets[i][t.value] || 0) * 100) / 100),
      backgroundColor: t.color + 'aa',
      borderColor: t.color,
      borderWidth: 1,
      borderRadius: 4,
      maxBarThickness: 28
    }))
  }
})

// Chart 3: Status Distribution (Doughnut)
const statusChartData = computed(() => {
  const allStatuses = ['approved', 'pending_head', 'pending_hr', 'rejected', 'cancelled']
  const counts = {}
  for (const leave of reportLeaves.value) {
    counts[leave.status] = (counts[leave.status] || 0) + 1
  }
  const activeStatuses = allStatuses.filter(s => counts[s])
  return {
    labels: activeStatuses.map(s => leaveStore.statusLabels[s]?.label || s),
    datasets: [{
      data: activeStatuses.map(s => counts[s] || 0),
      backgroundColor: activeStatuses.map(s => (leaveStore.statusLabels[s]?.color || '#9e9e9e') + 'cc'),
      borderColor: activeStatuses.map(s => leaveStore.statusLabels[s]?.color || '#9e9e9e'),
      borderWidth: 2,
      hoverOffset: 6
    }]
  }
})

// Chart 4: Dept ranking OR individual quota usage
const fourthChartData = computed(() => {
  if (mode.value === 'individual' && individualQuota.value) {
    // Quota usage bars (used vs remaining) — only for quota-based types
    const quotaTypes = leaveStore.leaveTypes.filter(t => !leaveStore.noQuotaTypes.includes(t.value))
    return {
      labels: quotaTypes.map(t => t.label),
      datasets: [
        {
          label: 'ใช้ไปแล้ว',
          data: quotaTypes.map(t => summaryByType.value[t.value]?.days || 0),
          backgroundColor: quotaTypes.map(t => t.color + 'aa'),
          borderColor: quotaTypes.map(t => t.color),
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 32
        },
        {
          label: 'คงเหลือ',
          data: quotaTypes.map(t => Math.max(0, (individualQuota.value[t.value] || 0) - (summaryByType.value[t.value]?.days || 0))),
          backgroundColor: 'rgba(58, 59, 62, 0.4)',
          borderColor: 'rgba(58, 59, 62, 0.6)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 32
        }
      ]
    }
  }

  // Department ranking (top 10)
  const deptMap = {}
  for (const leave of reportLeaves.value) {
    if (leave.status === 'rejected' || leave.status === 'cancelled') continue
    const dept = leave.department || 'ไม่ระบุแผนก'
    const days = leave.totalDays != null ? leave.totalDays : leaveStore.calcBusinessDays(leave.startDate, leave.endDate)
    deptMap[dept] = (deptMap[dept] || 0) + days
  }
  const sorted = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return {
    labels: sorted.map(([dept]) => dept),
    datasets: [{
      label: 'จำนวนวันลา',
      data: sorted.map(([, days]) => Math.round(days * 100) / 100),
      backgroundColor: '#ff8a65aa',
      borderColor: '#ff8a65',
      borderWidth: 1,
      borderRadius: 4,
      maxBarThickness: 28
    }]
  }
})

// Chart Options
const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: { ...darkLegend, position: 'bottom' },
    tooltip: darkTooltip
  }
}))

const stackedBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { ...darkLegend, position: 'top' },
    tooltip: darkTooltip
  },
  scales: {
    x: {
      stacked: true,
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor },
      title: { display: true, text: 'วัน', color: '#6b6c6f', font: { size: 10 } }
    }
  }
}))

const horizontalBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: mode.value === 'individual' ? 'x' : 'y',
  plugins: {
    legend: {
      ...darkLegend,
      position: 'top',
      display: mode.value === 'individual'
    },
    tooltip: darkTooltip
  },
  scales: {
    x: {
      beginAtZero: true,
      stacked: mode.value === 'individual',
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor },
      ...(mode.value !== 'individual' && { title: { display: true, text: 'วัน', color: '#6b6c6f', font: { size: 10 } } })
    },
    y: {
      stacked: mode.value === 'individual',
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor }
    }
  }
}))

// --- Export ---
const exportToExcel = () => {
  if (!reportLeaves.value || reportLeaves.value.length === 0) return

  const rows = reportLeaves.value.map(leave => {
    const typeInfo = getTypeInfo(leave.leaveType)
    const statusInfo = getStatusInfo(leave.status)
    const days = getDisplayDays(leave)
    const submitted = leave.submittedAt
      ? (leave.submittedAt.toDate ? leave.submittedAt.toDate() : new Date(leave.submittedAt))
      : null

    return {
      'ชื่อ-นามสกุล': `${leave.firstName || ''} ${leave.lastName || ''}`.trim(),
      'แผนก': leave.department || '',
      'ประเภทการลา': typeInfo.label,
      'ช่วงเวลา': getDurationLabel(leave) || 'เต็มวัน',
      'วันที่เริ่ม': leave.startDate || '',
      'วันที่สิ้นสุด': leave.endDate || '',
      'ชั่วโมง': leave.totalHours ?? '',
      'จำนวนวัน': days,
      'เหตุผล': leave.details || '',
      'สถานะ': statusInfo.label,
      'หัวหน้าอนุมัติ': leave.headApproval?.approvedByName || '-',
      'HR อนุมัติ': leave.hrApproval?.approvedByName || '-',
      'เหตุผลที่ไม่อนุมัติ': leave.rejectionReason || '-',
      'วันที่ส่ง': submitted ? submitted.toLocaleDateString('th-TH') + ' ' + submitted.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = Object.keys(rows[0]).map(key => {
    const maxLen = Math.max(key.length, ...rows.map(r => String(r[key] || '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  const modeLabel = mode.value === 'individual' ? 'รายบุคคล' : mode.value === 'department' ? 'รายแผนก' : 'ทั้งหมด'
  XLSX.utils.book_append_sheet(wb, ws, `รายงานการลา ${modeLabel}`)

  const today = new Date().toISOString().slice(0, 10)
  const { startDate: sd, endDate: ed } = getEffectiveDateRange()
  XLSX.writeFile(wb, `leave-report-${mode.value}-${sd}_${ed}-${today}.xlsx`)
}
</script>

<style scoped>
.report-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.report-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* ====== Header ====== */
.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.report-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 138, 101, 0.12);
  color: #ff8a65;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.report-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.report-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-view-toggle {
  display: flex;
  background: rgba(36, 37, 40, 0.6);
  border-radius: 8px;
  padding: 2px;
}

.report-view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.report-view-btn:hover { color: #9e9e9e; }

.report-view-active {
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
}

.report-export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.25);
  background: rgba(76, 175, 80, 0.08);
  color: #66bb6a;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.report-export-btn:hover {
  background: rgba(76, 175, 80, 0.18);
  border-color: rgba(76, 175, 80, 0.4);
}

/* ====== Card ====== */
.report-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  margin-bottom: 16px;
}

.report-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.report-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.report-count-badge {
  background: rgba(66, 165, 245, 0.15) !important;
  color: #42a5f5 !important;
  font-size: 0.58rem !important;
}

/* ====== Filter Bar ====== */
.report-filter-card {
  padding: 16px;
}

.report-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.report-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-filter-grow {
  flex: 1;
  min-width: 200px;
}

.report-filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b6c6f;
}

.report-filter-action {
  justify-content: flex-end;
}

.report-mode-toggle {
  display: flex;
  background: rgba(36, 37, 40, 0.6);
  border-radius: 8px;
  padding: 2px;
}

.report-mode-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.report-mode-btn:hover { color: #9e9e9e; }

.report-mode-active {
  background: rgba(255, 138, 101, 0.12);
  color: #ff8a65;
}

.report-select {
  min-width: 180px;
}

.report-select .q-field__control {
  background: rgba(30, 33, 36, 0.6) !important;
  border: 1px solid rgba(58, 59, 62, 0.4) !important;
  border-radius: 8px !important;
  min-height: 36px !important;
}

.report-select .q-field__control::before,
.report-select .q-field__control::after {
  border: none !important;
}

.report-select .q-field__native {
  color: #cecfd2 !important;
  font-size: 0.8rem !important;
}

.report-date-toggle {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.report-year-select {
  min-width: 100px;
  max-width: 110px;
}

.report-daterange-input {
  min-width: 230px;
  max-width: 280px;
}

.report-fetch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ff8a65 0%, #ef6c00 100%);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.report-fetch-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3);
}

.report-fetch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== Summary Cards ====== */
.report-summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.report-summary-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
}

.report-summary-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.report-summary-icon { font-size: 1rem; }

.report-summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cecfd2;
}

.report-summary-numbers {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.report-summary-stat {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.report-summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #e0e1e4;
}

.report-summary-count {
  font-size: 1rem;
  color: #9e9e9e;
}

.report-summary-unit {
  font-size: 0.65rem;
  color: #6b6c6f;
}

.report-summary-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(58, 59, 62, 0.3);
  overflow: hidden;
  margin-top: 6px;
}

.report-summary-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.report-quota-info {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-bottom: 4px;
}

.report-quota-sep {
  margin: 0 4px;
  color: #3a3b3e;
}

.report-quota-warning {
  color: #ef5350;
  font-weight: 600;
}

/* ====== Status Card ====== */
.report-status-card {
  display: flex;
  flex-direction: column;
}

.report-status-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.report-status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
}

.report-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.report-status-label {
  color: #9e9e9e;
  flex: 1;
}

.report-status-count {
  font-weight: 700;
  color: #cecfd2;
}

.report-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
  font-size: 0.7rem;
  color: #6b6c6f;
}

.report-total-row strong {
  color: #cecfd2;
}

/* ====== Detail List ====== */
.report-detail-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 4px 0;
}

.report-detail-list::-webkit-scrollbar { width: 3px; }
.report-detail-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.report-detail-item {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
  transition: background 0.15s;
}

.report-detail-item:hover { background: rgba(58, 59, 62, 0.08); }
.report-detail-item:last-child { border-bottom: none; }

.report-detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.report-detail-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #e0e1e4;
}

.report-duration-badge {
  display: inline-flex;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
  font-size: 0.58rem;
  font-weight: 600;
}

.report-detail-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.6rem;
  font-weight: 700;
}

.report-detail-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cecfd2;
  margin-bottom: 4px;
}

.report-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  color: #9e9e9e;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.report-detail-dates {
  display: flex;
  align-items: center;
  gap: 4px;
}

.report-detail-days {
  font-weight: 700;
  color: #cecfd2;
  font-size: 0.68rem;
}

.report-detail-dept {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #6b6c6f;
  font-size: 0.65rem;
}

.report-detail-reason {
  font-size: 0.7rem;
  color: #6b6c6f;
  font-style: italic;
  margin-bottom: 4px;
  line-height: 1.4;
}

.report-detail-approvals {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.report-approval-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  color: #9e9e9e;
}

.report-detail-rejected {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #ef5350;
  margin-top: 2px;
}

/* ====== Chart Section ====== */
.report-chart-section {
  margin-bottom: 16px;
}

.report-chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.report-chart-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  overflow: hidden;
}

.report-chart-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
  font-size: 0.78rem;
  font-weight: 700;
  color: #cecfd2;
}

.report-chart-body {
  padding: 16px;
  height: 280px;
  position: relative;
}

/* ====== Empty / Intro ====== */
.report-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  color: #4a4b4e;
  font-size: 0.78rem;
}

.report-intro-card {
  margin-top: 20px;
}

.report-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  text-align: center;
}

.report-intro-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b6c6f;
}

.report-intro-desc {
  font-size: 0.72rem;
  color: #4a4b4e;
}

/* ====== Responsive ====== */
@media (max-width: 900px) {
  .report-summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .report-page { padding: 16px; }
  .report-filter-row { flex-direction: column; align-items: stretch; }
  .report-filter-grow { min-width: auto; }
  .report-summary-row { grid-template-columns: 1fr; }
  .report-chart-grid { grid-template-columns: 1fr; }
  .report-mode-toggle { flex-wrap: wrap; }
  .report-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .report-header-actions { width: 100%; justify-content: flex-end; }
}
</style>
