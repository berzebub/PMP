<template>
  <q-page class="report-page">
    <div class="report-container">
      <!-- Header -->
      <div class="report-header">
        <div class="report-header-left">
          <div class="report-header-icon">
            <q-icon name="receipt_long" size="26px" />
          </div>
          <div>
            <div class="report-header-title">Expense Report</div>
            <div class="report-header-subtitle">รายงานการเบิกค่าใช้จ่ายของพนักงาน</div>
          </div>
        </div>
        <div class="report-header-actions">
          <!-- View Toggle -->
          <div v-if="hasFetched && reportExpenses.length > 0" class="report-view-toggle">
            <button class="report-view-btn" :class="{ 'report-view-active': viewMode === 'list' }" @click="viewMode = 'list'">
              <q-icon name="list_alt" size="15px" />
              <span>รายการ</span>
            </button>
            <button class="report-view-btn" :class="{ 'report-view-active': viewMode === 'chart' }" @click="viewMode = 'chart'">
              <q-icon name="bar_chart" size="15px" />
              <span>กราฟ</span>
            </button>
          </div>
          <button v-if="reportExpenses.length > 0" class="report-export-btn" @click="exportToExcel">
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
            <q-btn-toggle v-model="dateMode" no-caps rounded unelevated toggle-color="green-7"
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
                    <q-date v-model="dateRange" range mask="YYYY-MM-DD" dark color="green-7" minimal>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="ตกลง" color="green-7" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Fetch Button -->
          <div class="report-filter-group report-filter-action">
            <button class="report-fetch-btn" :disabled="expenseStore.fetching || !canFetch" @click="fetchReport">
              <q-spinner v-if="expenseStore.fetching" size="16px" color="white" />
              <q-icon v-else name="search" size="16px" />
              <span>{{ expenseStore.fetching ? 'กำลังโหลด...' : 'ดูรายงาน' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div v-if="hasFetched" class="report-summary-row">
        <!-- Total Amount Card -->
        <div class="report-summary-card">
          <div class="report-summary-card-header">
            <q-icon name="account_balance_wallet" size="16px" style="color: #66bb6a;" />
            <span class="report-summary-label">ยอดรวมทั้งหมด</span>
          </div>
          <div class="report-summary-numbers">
            <div class="report-summary-stat">
              <span class="report-summary-value">{{ formatAmount(totalAmount) }}</span>
              <span class="report-summary-unit">บาท</span>
            </div>
            <div class="report-summary-stat">
              <span class="report-summary-value report-summary-count">{{ reportExpenses.length }}</span>
              <span class="report-summary-unit">รายการ</span>
            </div>
          </div>
          <div class="report-summary-bar">
            <div class="report-summary-bar-fill" style="width: 100%; background: #66bb6a;"></div>
          </div>
        </div>

        <!-- Per-status cards -->
        <div v-for="s in statusCards" :key="s.key" class="report-summary-card">
          <div class="report-summary-card-header">
            <q-icon :name="s.icon" size="16px" :style="{ color: s.color }" />
            <span class="report-summary-label">{{ s.label }}</span>
          </div>
          <div class="report-summary-numbers">
            <div class="report-summary-stat">
              <span class="report-summary-value">{{ formatAmount(s.amount) }}</span>
              <span class="report-summary-unit">บาท</span>
            </div>
            <div class="report-summary-stat">
              <span class="report-summary-value report-summary-count">{{ s.count }}</span>
              <span class="report-summary-unit">ครั้ง</span>
            </div>
          </div>
          <div class="report-summary-bar">
            <div class="report-summary-bar-fill" :style="{ width: getBarWidth(s.amount), background: s.color }"></div>
          </div>
        </div>
      </div>

      <!-- Chart View -->
      <div v-if="hasFetched && viewMode === 'chart' && reportExpenses.length > 0" class="report-chart-section">
        <div class="report-chart-grid">
          <!-- Chart 1: Amount by Status (Doughnut) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="donut_large" size="16px" style="color: #42a5f5;" />
              <span>สัดส่วนยอดเบิกตามสถานะ</span>
            </div>
            <div class="report-chart-body">
              <Doughnut :data="statusAmountChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Chart 2: Monthly Expense Trend (Bar) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="trending_up" size="16px" style="color: #66bb6a;" />
              <span>แนวโน้มการเบิกรายเดือน</span>
            </div>
            <div class="report-chart-body">
              <Bar :data="monthlyChartData" :options="barOptions" />
            </div>
          </div>

          <!-- Chart 3: Status Count Distribution (Doughnut) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="pie_chart" size="16px" style="color: #ce93d8;" />
              <span>สัดส่วนจำนวนคำขอตามสถานะ</span>
            </div>
            <div class="report-chart-body">
              <Doughnut :data="statusCountChartData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- Chart 4: Department Ranking (Horizontal Bar) -->
          <div class="report-chart-card">
            <div class="report-chart-card-header">
              <q-icon name="leaderboard" size="16px" style="color: #ffb74d;" />
              <span>{{ mode === 'individual' ? 'ยอดเบิกรายเดือน' : 'อันดับแผนก' }}</span>
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
          <q-icon name="list_alt" size="18px" style="color: #66bb6a;" />
          <span class="report-card-title">รายละเอียดการเบิก</span>
          <q-badge v-if="reportExpenses.length > 0" :label="reportExpenses.length + ' รายการ'" class="report-count-badge" />
        </div>

        <div v-if="reportExpenses.length === 0" class="report-empty">
          <q-icon name="search_off" size="48px" style="color: #2a2b2e;" />
          <span>ไม่พบข้อมูลการเบิกตามเงื่อนไขที่เลือก</span>
        </div>

        <div v-else class="report-detail-list">
          <div v-for="expense in reportExpenses" :key="expense.id" class="report-detail-item">
            <div class="report-detail-top">
              <div class="report-detail-type">
                <q-icon name="receipt" size="14px" style="color: #66bb6a;" />
                <span>{{ formatAmount(expense.totalAmount) }} บาท</span>
                <span class="report-items-badge">{{ expense.items?.length || 0 }} รายการ</span>
              </div>
              <div class="report-detail-status"
                :style="{ color: getStatusInfo(expense.status).color, background: getStatusInfo(expense.status).color + '15' }">
                <q-icon :name="getStatusInfo(expense.status).icon" size="12px" />
                <span>{{ getStatusInfo(expense.status).label }}</span>
              </div>
            </div>

            <div class="report-detail-name">{{ expense.firstName }} {{ expense.lastName }}</div>

            <div class="report-detail-meta">
              <span class="report-detail-dates">
                <q-icon name="schedule" size="13px" />
                {{ formatTimestamp(expense.submittedAt) }}
              </span>
              <span v-if="expense.department" class="report-detail-dept">
                <q-icon name="business" size="12px" />
                {{ expense.department }}
              </span>
            </div>

            <!-- Expense Items -->
            <div v-if="expense.items && expense.items.length > 0" class="report-expense-items">
              <div v-for="item in expense.items" :key="item.seq" class="report-expense-item-row">
                <span class="report-expense-item-desc">{{ item.description }}</span>
                <span class="report-expense-item-amount">{{ formatAmount(item.amount) }} ฿</span>
              </div>
            </div>

            <div v-if="expense.note" class="report-detail-reason">{{ expense.note }}</div>

            <div v-if="expense.hrReviewedByName || expense.paidByName" class="report-detail-approvals">
              <span v-if="expense.hrReviewedByName" class="report-approval-chip">
                <q-icon name="check_circle" size="11px" style="color: #ce93d8;" />
                HR: {{ expense.hrReviewedByName }}
              </span>
              <span v-if="expense.paidByName" class="report-approval-chip">
                <q-icon name="paid" size="11px" style="color: #66bb6a;" />
                จ่ายโดย: {{ expense.paidByName }}
                <template v-if="expense.paymentMethod"> ({{ expense.paymentMethod === 'transfer' ? 'โอน' : 'เงินสด' }})</template>
              </span>
            </div>

            <div v-if="expense.status === 'rejected' && expense.rejectionReason" class="report-detail-rejected">
              <q-icon name="info" size="11px" />
              เหตุผล: {{ expense.rejectionReason }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (before fetch) -->
      <div v-if="!hasFetched" class="report-card report-intro-card">
        <div class="report-intro">
          <q-icon name="receipt_long" size="56px" style="color: #2a2b2e;" />
          <div class="report-intro-title">เลือกเงื่อนไขและกด "ดูรายงาน"</div>
          <div class="report-intro-desc">เลือกดูรายงานการเบิกได้ทั้งรายบุคคล รายแผนก หรือทั้งหมด</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from 'stores/expense'
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

const expenseStore = useExpenseStore()
const authStore = useAuthStore()
const departmentsStore = useDepartmentsStore()

const viewMode = ref('list')

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

const currentYear = new Date().getFullYear()
const dateMode = ref('year')
const selectedYear = ref(currentYear)
const dateRange = ref({ from: `${currentYear}-01-01`, to: `${currentYear}-12-31` })

const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i
}))

const dateRangeDisplay = computed(() => {
  if (!dateRange.value) return ''
  if (typeof dateRange.value === 'string') return dateRange.value
  return `${dateRange.value.from} ~ ${dateRange.value.to}`
})

const getEffectiveDateRange = () => {
  if (dateMode.value === 'year') {
    const y = selectedYear.value
    return { startDate: `${y}-01-01`, endDate: `${y}-12-31` }
  }
  if (typeof dateRange.value === 'string') {
    return { startDate: dateRange.value, endDate: dateRange.value }
  }
  return { startDate: dateRange.value.from, endDate: dateRange.value.to }
}

const reportExpenses = computed(() => expenseStore.reportExpenses)

const canFetch = computed(() => {
  if (mode.value === 'individual') return !!selectedUser.value
  if (mode.value === 'department') return !!selectedDept.value
  return true
})

onMounted(async () => {
  await Promise.all([
    authStore.allProfiles.length === 0 ? authStore.fetchAllProfiles() : Promise.resolve(),
    departmentsStore.departments.length === 0 ? departmentsStore.fetchDepartments() : Promise.resolve()
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

const fetchReport = async () => {
  const { startDate, endDate } = getEffectiveDateRange()
  await expenseStore.fetchExpenseReport({
    mode: mode.value,
    userId: mode.value === 'individual' ? selectedUser.value : '',
    department: mode.value === 'department' ? selectedDept.value : '',
    startDate,
    endDate
  })
  hasFetched.value = true
}

// --- Summary ---
const allStatuses = ['pending_hr', 'pending_ceo', 'approved', 'paid', 'rejected', 'cancelled']

const summaryByStatus = computed(() => {
  const map = {}
  for (const s of allStatuses) {
    map[s] = { count: 0, amount: 0 }
  }
  for (const exp of reportExpenses.value) {
    if (map[exp.status]) {
      map[exp.status].count++
      map[exp.status].amount += exp.totalAmount || 0
    }
  }
  for (const key of Object.keys(map)) {
    map[key].amount = Math.round(map[key].amount * 100) / 100
  }
  return map
})

const totalAmount = computed(() => {
  return Math.round(reportExpenses.value.reduce((sum, e) => sum + (e.totalAmount || 0), 0) * 100) / 100
})

const statusCards = computed(() => {
  return allStatuses
    .filter(s => summaryByStatus.value[s]?.count > 0)
    .map(s => {
      const info = expenseStore.statusLabels[s] || { label: s, color: '#9e9e9e', icon: 'info' }
      return {
        key: s,
        label: info.label,
        color: info.color,
        icon: info.icon,
        count: summaryByStatus.value[s].count,
        amount: summaryByStatus.value[s].amount
      }
    })
})

const getBarWidth = (amount) => {
  if (totalAmount.value === 0) return '0%'
  return Math.min(100, (amount / totalAmount.value) * 100) + '%'
}

// --- Helpers ---
const getStatusInfo = (status) => {
  return expenseStore.statusLabels[status] || { label: status, color: '#9e9e9e', icon: 'info' }
}

const formatAmount = (amount) => {
  if (amount == null) return '0'
  return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const formatTimestamp = (ts) => {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
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
  bodyFont: { size: 11 },
  callbacks: {
    label: (ctx) => {
      const val = ctx.parsed.y ?? ctx.parsed
      return `${ctx.dataset.label || ctx.label}: ${Number(val).toLocaleString('th-TH')} บาท`
    }
  }
}

const darkTooltipCount = {
  ...darkTooltip,
  callbacks: {
    label: (ctx) => {
      const val = ctx.parsed ?? ctx.raw
      return `${ctx.label}: ${val} รายการ`
    }
  }
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

const statusAmountChartData = computed(() => {
  const active = allStatuses.filter(s => summaryByStatus.value[s]?.amount > 0)
  return {
    labels: active.map(s => getStatusInfo(s).label),
    datasets: [{
      data: active.map(s => summaryByStatus.value[s].amount),
      backgroundColor: active.map(s => (getStatusInfo(s).color) + 'cc'),
      borderColor: active.map(s => getStatusInfo(s).color),
      borderWidth: 2,
      hoverOffset: 6
    }]
  }
})

const monthlyChartData = computed(() => {
  const buckets = Array.from({ length: 12 }, () => 0)
  for (const exp of reportExpenses.value) {
    if (exp.status === 'rejected' || exp.status === 'cancelled') continue
    if (!exp.submittedAt) continue
    const date = exp.submittedAt.toDate ? exp.submittedAt.toDate() : new Date(exp.submittedAt)
    const month = date.getMonth()
    buckets[month] += exp.totalAmount || 0
  }
  return {
    labels: monthLabels,
    datasets: [{
      label: 'ยอดเบิก',
      data: buckets.map(v => Math.round(v * 100) / 100),
      backgroundColor: '#66bb6aaa',
      borderColor: '#66bb6a',
      borderWidth: 1,
      borderRadius: 4,
      maxBarThickness: 28
    }]
  }
})

const statusCountChartData = computed(() => {
  const active = allStatuses.filter(s => summaryByStatus.value[s]?.count > 0)
  return {
    labels: active.map(s => getStatusInfo(s).label),
    datasets: [{
      data: active.map(s => summaryByStatus.value[s].count),
      backgroundColor: active.map(s => (getStatusInfo(s).color) + 'cc'),
      borderColor: active.map(s => getStatusInfo(s).color),
      borderWidth: 2,
      hoverOffset: 6
    }]
  }
})

const fourthChartData = computed(() => {
  if (mode.value === 'individual') {
    const buckets = Array.from({ length: 12 }, () => 0)
    for (const exp of reportExpenses.value) {
      if (exp.status === 'rejected' || exp.status === 'cancelled') continue
      if (!exp.submittedAt) continue
      const date = exp.submittedAt.toDate ? exp.submittedAt.toDate() : new Date(exp.submittedAt)
      buckets[date.getMonth()] += exp.totalAmount || 0
    }
    return {
      labels: monthLabels,
      datasets: [{
        label: 'ยอดเบิก',
        data: buckets.map(v => Math.round(v * 100) / 100),
        backgroundColor: '#66bb6aaa',
        borderColor: '#66bb6a',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 28
      }]
    }
  }

  const deptMap = {}
  for (const exp of reportExpenses.value) {
    if (exp.status === 'rejected' || exp.status === 'cancelled') continue
    const dept = exp.department || 'ไม่ระบุแผนก'
    deptMap[dept] = (deptMap[dept] || 0) + (exp.totalAmount || 0)
  }
  const sorted = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return {
    labels: sorted.map(([dept]) => dept),
    datasets: [{
      label: 'ยอดเบิก (บาท)',
      data: sorted.map(([, amt]) => Math.round(amt * 100) / 100),
      backgroundColor: '#66bb6aaa',
      borderColor: '#66bb6a',
      borderWidth: 1,
      borderRadius: 4,
      maxBarThickness: 28
    }]
  }
})

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: { ...darkLegend, position: 'bottom' },
    tooltip: darkTooltip
  }
}))

const doughnutCountOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: { ...darkLegend, position: 'bottom' },
    tooltip: darkTooltipCount
  }
}))

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { ...darkLegend, position: 'top' },
    tooltip: darkTooltip
  },
  scales: {
    x: {
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor }
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor },
      title: { display: true, text: 'บาท', color: '#6b6c6f', font: { size: 10 } }
    }
  }
}))

const horizontalBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: mode.value === 'individual' ? 'x' : 'y',
  plugins: {
    legend: { ...darkLegend, position: 'top', display: false },
    tooltip: darkTooltip
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor },
      ...(mode.value !== 'individual' && { title: { display: true, text: 'บาท', color: '#6b6c6f', font: { size: 10 } } })
    },
    y: {
      ticks: { color: '#6b6c6f', font: { size: 10 } },
      grid: { color: darkGridColor }
    }
  }
}))

// --- Export ---
const exportToExcel = () => {
  if (!reportExpenses.value || reportExpenses.value.length === 0) return

  const rows = reportExpenses.value.map(exp => {
    const statusInfo = getStatusInfo(exp.status)
    const submitted = exp.submittedAt
      ? (exp.submittedAt.toDate ? exp.submittedAt.toDate() : new Date(exp.submittedAt))
      : null
    const itemDescs = (exp.items || []).map(i => `${i.description} (${formatAmount(i.amount)}฿)`).join(', ')

    return {
      'ชื่อ-นามสกุล': `${exp.firstName || ''} ${exp.lastName || ''}`.trim(),
      'แผนก': exp.department || '',
      'รายการเบิก': itemDescs,
      'จำนวนรายการ': exp.items?.length || 0,
      'ยอดรวม (บาท)': exp.totalAmount || 0,
      'หมายเหตุ': exp.note || '',
      'สถานะ': statusInfo.label,
      'HR ตรวจสอบ': exp.hrReviewedByName || '-',
      'วิธีจ่าย': exp.paymentMethod === 'transfer' ? 'โอน' : exp.paymentMethod === 'cash' ? 'เงินสด' : '-',
      'จ่ายโดย': exp.paidByName || '-',
      'เหตุผลที่ไม่อนุมัติ': exp.rejectionReason || '-',
      'วันที่ส่ง': submitted ? submitted.toLocaleDateString('th-TH') + ' ' + submitted.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = Object.keys(rows[0]).map(key => {
    const maxLen = Math.max(key.length, ...rows.map(r => String(r[key] || '').length))
    return { wch: Math.min(maxLen + 2, 50) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  const modeLabel = mode.value === 'individual' ? 'รายบุคคล' : mode.value === 'department' ? 'รายแผนก' : 'ทั้งหมด'
  XLSX.utils.book_append_sheet(wb, ws, `รายงานการเบิก ${modeLabel}`)

  const today = new Date().toISOString().slice(0, 10)
  const { startDate: sd, endDate: ed } = getEffectiveDateRange()
  XLSX.writeFile(wb, `expense-report-${mode.value}-${sd}_${ed}-${today}.xlsx`)
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
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
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
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
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
  background: rgba(102, 187, 106, 0.15) !important;
  color: #66bb6a !important;
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
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
}

.report-select {
  min-width: 180px;
}

.report-select :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.6) !important;
  border: 1px solid rgba(58, 59, 62, 0.4) !important;
  border-radius: 8px !important;
  min-height: 36px !important;
}

.report-select :deep(.q-field__control::before),
.report-select :deep(.q-field__control::after) {
  border: none !important;
}

.report-select :deep(.q-field__native) {
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
  background: linear-gradient(135deg, #66bb6a 0%, #388e3c 100%);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.report-fetch-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
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

.report-items-badge {
  display: inline-flex;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
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

.report-detail-dept {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #6b6c6f;
  font-size: 0.65rem;
}

.report-expense-items {
  margin: 6px 0;
  padding: 8px 12px;
  background: rgba(36, 37, 40, 0.4);
  border-radius: 8px;
}

.report-expense-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 0.68rem;
}

.report-expense-item-row + .report-expense-item-row {
  border-top: 1px solid rgba(58, 59, 62, 0.15);
}

.report-expense-item-desc {
  color: #9e9e9e;
}

.report-expense-item-amount {
  color: #cecfd2;
  font-weight: 600;
  white-space: nowrap;
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
