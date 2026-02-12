<template>
  <q-page class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-page-header">
        <div class="admin-header-left">
          <div class="admin-header-icon">
            <q-icon name="admin_panel_settings" size="26px" />
          </div>
          <div>
            <div class="admin-header-title">Admin Panel</div>
            <div class="admin-header-subtitle">จัดการผู้ใช้และแผนก</div>
          </div>
        </div>
        <div class="admin-header-right">
          <button class="admin-back-btn" @click="$router.back()">
            <q-icon name="arrow_back" size="18px" />
            <span>กลับ</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab" :class="{ 'admin-tab-active': activeTab === 'users' }"
          @click="activeTab = 'users'">
          <q-icon name="people" size="18px" />
          <span>จัดการผู้ใช้</span>
          <q-badge v-if="authStore.allProfiles.length" :label="authStore.allProfiles.length" class="admin-tab-badge" />
        </button>
        <button class="admin-tab" :class="{ 'admin-tab-active': activeTab === 'departments' }"
          @click="activeTab = 'departments'">
          <q-icon name="business" size="18px" />
          <span>จัดการแผนก</span>
          <q-badge v-if="deptStore.departments.length" :label="deptStore.departments.length" class="admin-tab-badge" />
        </button>
        <button v-if="authStore.profile.role === 'super_admin'" class="admin-tab"
          :class="{ 'admin-tab-active': activeTab === 'import' }" @click="activeTab = 'import'">
          <q-icon name="upload_file" size="18px" />
          <span>นำเข้าข้อมูล</span>
        </button>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="admin-section">
        <!-- Search -->
        <div class="admin-search-bar">
          <q-icon name="search" size="18px" style="color: #6b6c6f;" />
          <input v-model="userSearch" class="admin-search-input" placeholder="ค้นหาผู้ใช้ด้วย email หรือชื่อ..." />
        </div>

        <!-- User List -->
        <div class="admin-user-list">
          <div v-if="filteredUsers.length === 0" class="admin-empty">
            <q-icon name="person_off" size="40px" style="color: #2a2b2e;" />
            <span>ไม่พบผู้ใช้</span>
          </div>

          <div v-for="usr in filteredUsers" :key="usr.id" class="admin-user-card">
            <div class="admin-user-top">
              <div class="admin-user-avatar">
                <img v-if="usr.photoURL" :src="usr.photoURL" class="admin-user-avatar-img" />
                <span v-else>{{ usr.email?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div class="admin-user-info">
                <div class="admin-user-name">
                  {{ usr.firstName && usr.lastName ? `${usr.firstName} ${usr.lastName}` : usr.email?.split('@')[0] }}
                </div>
                <div class="admin-user-email">{{ usr.email }}</div>
              </div>
              <div class="admin-user-current-role">
                <q-icon :name="authStore.roleLabels[usr.role || 'employee']?.icon || 'person'" size="14px" />
                <span>{{ authStore.roleLabels[usr.role || 'employee']?.label || 'พนักงาน' }}</span>
              </div>
            </div>

            <!-- Projects -->
            <div v-if="getUserProjects(usr.email).length" class="admin-user-projects">
              <div class="admin-user-projects-label">
                <q-icon name="folder" size="13px" />
                <span>Projects</span>
              </div>
              <div class="admin-user-projects-list">
                <span v-for="proj in getUserProjects(usr.email)" :key="proj.id" class="admin-project-chip">
                  {{ proj.name }}
                </span>
              </div>
            </div>
            <div v-else class="admin-user-projects admin-user-projects-empty">
              <div class="admin-user-projects-label">
                <q-icon name="folder_off" size="13px" />
                <span>ยังไม่ได้อยู่ในโปรเจคใด</span>
              </div>
            </div>

            <div class="admin-user-fields">
              <div class="admin-field">
                <label class="admin-field-label">Role</label>
                <select :value="getEditRole(usr)" @change="setEditRole(usr, $event.target.value)" class="admin-select">
                  <option value="employee">พนักงาน</option>
                  <option value="head">หัวหน้าแผนก</option>
                  <option value="hr">HR</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div class="admin-field">
                <label class="admin-field-label">แผนก</label>
                <select :value="getEditDept(usr)" @change="setEditDept(usr, $event.target.value)" class="admin-select">
                  <option value="">-- ไม่ระบุ --</option>
                  <option v-for="dept in deptStore.departments" :key="dept.id" :value="dept.name">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <button class="admin-save-btn"
                :disabled="!isUserChanged(usr) || savingUser === usr.id"
                @click="handleSaveUser(usr)">
                <q-spinner v-if="savingUser === usr.id" size="14px" color="white" />
                <q-icon v-else name="save" size="14px" />
                <span>{{ savingUser === usr.id ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
              </button>
            </div>

            <!-- Save success message -->
            <div v-if="savedUser === usr.id" class="admin-save-success">
              <q-icon name="check_circle" size="14px" />
              <span>บันทึกเรียบร้อย</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Departments Tab -->
      <div v-if="activeTab === 'departments'" class="admin-section">
        <!-- Add Department -->
        <div class="admin-add-dept">
          <input v-model="newDeptName" class="admin-dept-input" placeholder="ชื่อแผนกใหม่..."
            @keyup.enter="handleAddDept" />
          <button class="admin-add-dept-btn" :disabled="!newDeptName.trim() || deptStore.loading"
            @click="handleAddDept">
            <q-icon name="add" size="18px" />
            <span>เพิ่มแผนก</span>
          </button>
        </div>

        <!-- Department List -->
        <div class="admin-dept-list">
          <div v-if="deptStore.departments.length === 0" class="admin-empty">
            <q-icon name="business" size="40px" style="color: #2a2b2e;" />
            <span>ยังไม่มีแผนก</span>
          </div>

          <div v-for="dept in deptStore.departments" :key="dept.id" class="admin-dept-card">
            <div v-if="editingDept === dept.id" class="admin-dept-edit">
              <input v-model="editDeptName" class="admin-dept-input" @keyup.enter="handleUpdateDept(dept.id)"
                @keyup.esc="editingDept = null" ref="editDeptInput" />
              <button class="admin-dept-save-btn" @click="handleUpdateDept(dept.id)">
                <q-icon name="check" size="16px" />
              </button>
              <button class="admin-dept-cancel-btn" @click="editingDept = null">
                <q-icon name="close" size="16px" />
              </button>
            </div>
            <div v-else class="admin-dept-row">
              <div class="admin-dept-icon">
                <q-icon name="business" size="18px" />
              </div>
              <div class="admin-dept-name">{{ dept.name }}</div>
              <div class="admin-dept-count">
                {{ getUserCountByDept(dept.name) }} คน
              </div>
              <div class="admin-dept-actions">
                <button class="admin-dept-action-btn" @click="startEditDept(dept)">
                  <q-icon name="edit" size="14px" />
                </button>
                <button class="admin-dept-action-btn admin-dept-delete-btn" @click="handleDeleteDept(dept)">
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Import Tab -->
      <div v-if="activeTab === 'import'" class="admin-section">
        <div class="import-card">
          <div class="import-card-header">
            <q-icon name="upload_file" size="20px" style="color: #ffb74d;" />
            <span class="import-card-title">นำเข้าข้อมูลการลา</span>
          </div>

          <div class="import-card-body">
            <!-- Step info -->
            <div class="import-info-box">
              <q-icon name="info" size="16px" />
              <span>นำเข้าประวัติการลาจากไฟล์ Excel (.xlsx) — ข้อมูลที่นำเข้าจะมีสถานะ "อนุมัติแล้ว" ทั้งหมด</span>
            </div>

            <!-- Download Template -->
            <button class="import-template-btn" @click="downloadTemplate">
              <q-icon name="download" size="16px" />
              <span>ดาวน์โหลด Template Excel</span>
            </button>

            <!-- Upload Area -->
            <div class="import-upload-area"
              :class="{ 'import-upload-dragover': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop">
              <div v-if="!importFile" class="import-upload-placeholder">
                <q-icon name="cloud_upload" size="40px" />
                <span class="import-upload-text">ลากไฟล์ Excel มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</span>
                <span class="import-upload-hint">.xlsx เท่านั้น</span>
                <label class="import-browse-btn">
                  <q-icon name="folder_open" size="16px" />
                  <span>เลือกไฟล์</span>
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleFileSelect" />
                </label>
              </div>
              <div v-else class="import-upload-selected">
                <q-icon name="description" size="24px" style="color: #66bb6a;" />
                <div class="import-file-info">
                  <span class="import-file-name">{{ importFile.name }}</span>
                  <span class="import-file-size">{{ (importFile.size / 1024).toFixed(1) }} KB</span>
                </div>
                <button class="import-remove-btn" @click="clearImport">
                  <q-icon name="close" size="16px" />
                </button>
              </div>
            </div>

            <!-- Parse Error -->
            <div v-if="importParseError" class="import-error-box">
              <q-icon name="error_outline" size="16px" />
              <span>{{ importParseError }}</span>
            </div>

            <!-- Preview Table -->
            <div v-if="importPreview.length > 0" class="import-preview-section">
              <div class="import-preview-header">
                <span class="import-preview-title">ตรวจสอบข้อมูล</span>
                <div class="import-preview-summary">
                  <span class="import-summary-total">ทั้งหมด {{ importPreview.length }} รายการ</span>
                  <span class="import-summary-valid">ถูกต้อง {{ validRows.length }}</span>
                  <span v-if="invalidRows.length > 0" class="import-summary-invalid">ผิดพลาด {{ invalidRows.length }}</span>
                </div>
              </div>

              <div class="import-table-wrapper">
                <table class="import-table">
                  <thead>
                    <tr>
                      <th class="import-th-seq">#</th>
                      <th>อีเมล</th>
                      <th>ชื่อ</th>
                      <th>นามสกุล</th>
                      <th>ประเภท</th>
                      <th>วันที่เริ่ม</th>
                      <th>วันที่สิ้นสุด</th>
                      <th>แผนก</th>
                      <th class="import-th-status">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in importPreview" :key="idx"
                      :class="{ 'import-row-invalid': row._errors.length > 0 }">
                      <td class="import-td-seq">{{ idx + 1 }}</td>
                      <td>{{ row.userId }}</td>
                      <td>{{ row.firstName }}</td>
                      <td>{{ row.lastName }}</td>
                      <td>
                        <span class="import-type-pill">{{ getLeaveTypeLabel(row.leaveType) }}</span>
                      </td>
                      <td>{{ row.startDate }}</td>
                      <td>{{ row.endDate }}</td>
                      <td>{{ row.department || '-' }}</td>
                      <td class="import-td-status">
                        <span v-if="row._errors.length === 0" class="import-status-ok">
                          <q-icon name="check_circle" size="13px" /> OK
                        </span>
                        <span v-else class="import-status-error" :title="row._errors.join(', ')">
                          <q-icon name="error" size="13px" /> {{ row._errors[0] }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Import Actions -->
              <div class="import-actions">
                <button class="import-clear-btn" @click="clearImport">
                  <q-icon name="delete_outline" size="16px" />
                  <span>ล้างข้อมูล</span>
                </button>
                <div style="flex: 1;"></div>
                <div v-if="invalidRows.length > 0" class="import-skip-hint">
                  <q-icon name="warning" size="14px" style="color: #ffb74d;" />
                  <span>จะนำเข้าเฉพาะ {{ validRows.length }} รายการที่ถูกต้อง (ข้าม {{ invalidRows.length }} รายการที่ผิดพลาด)</span>
                </div>
                <button class="import-submit-btn"
                  :disabled="validRows.length === 0 || leaveStore.loading"
                  @click="handleImport">
                  <q-spinner v-if="leaveStore.loading" size="16px" color="white" />
                  <q-icon v-else name="cloud_upload" size="16px" />
                  <span>{{ leaveStore.loading ? 'กำลังนำเข้า...' : `นำเข้า ${validRows.length} รายการ` }}</span>
                </button>
              </div>
            </div>

            <!-- Import Result -->
            <div v-if="importResult" class="import-result-box" :class="importResult.errors.length > 0 ? 'import-result-warn' : 'import-result-success'">
              <q-icon :name="importResult.errors.length > 0 ? 'warning' : 'check_circle'" size="20px" />
              <div>
                <div class="import-result-title">นำเข้าสำเร็จ {{ importResult.success }} รายการ</div>
                <div v-if="importResult.errors.length > 0" class="import-result-errors">
                  ผิดพลาด {{ importResult.errors.length }} รายการ
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
import { useAuthStore } from 'stores/auth'
import { useDepartmentsStore } from 'stores/departments'
import { useProjectsStore } from 'stores/projects'
import { useLeaveStore } from 'stores/leave'
import * as XLSX from 'xlsx'

const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const projectsStore = useProjectsStore()
const leaveStore = useLeaveStore()

const activeTab = ref('users')
const userSearch = ref('')
const newDeptName = ref('')
const editingDept = ref(null)
const editDeptName = ref('')
const savingUser = ref(null)
const savedUser = ref(null)
const editState = ref({}) // { [email]: { role, department } }

onMounted(async () => {
  await Promise.all([
    authStore.fetchAllProfiles(),
    deptStore.fetchDepartments(),
    projectsStore.fetchAllProjects()
  ])

  // Initialize edit state for each user
  authStore.allProfiles.forEach(u => {
    editState.value[u.email || u.id] = {
      role: u.role || 'employee',
      department: u.department || ''
    }
  })
})

// Filtered users based on search
const filteredUsers = computed(() => {
  const s = userSearch.value.toLowerCase().trim()
  if (!s) return authStore.allProfiles
  return authStore.allProfiles.filter(u =>
    (u.email || '').toLowerCase().includes(s) ||
    (u.firstName || '').toLowerCase().includes(s) ||
    (u.lastName || '').toLowerCase().includes(s)
  )
})

// Helpers for edit state
const getEditRole = (usr) => editState.value[usr.email || usr.id]?.role || usr.role || 'employee'
const getEditDept = (usr) => editState.value[usr.email || usr.id]?.department ?? usr.department ?? ''
const setEditRole = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '' }
  editState.value[key].role = val
}
const setEditDept = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '' }
  editState.value[key].department = val
}
const isUserChanged = (usr) => {
  const e = editState.value[usr.email || usr.id]
  if (!e) return false
  return e.role !== (usr.role || 'employee') || e.department !== (usr.department || '')
}

// Get projects a user belongs to
const getUserProjects = (email) => {
  return projectsStore.allProjects.filter(p => p.members && p.members.includes(email))
}

// Count users per department
const getUserCountByDept = (deptName) => {
  return authStore.allProfiles.filter(u => u.department === deptName).length
}

// Save user role/department
const handleSaveUser = async (usr) => {
  const key = usr.email || usr.id
  const edit = editState.value[key]
  if (!edit) return

  savingUser.value = usr.id
  const success = await authStore.updateUserRole(key, {
    role: edit.role,
    department: edit.department
  })
  savingUser.value = null
  if (success) {
    savedUser.value = usr.id
    setTimeout(() => {
      if (savedUser.value === usr.id) savedUser.value = null
    }, 2000)
  }
}

// Department CRUD
const handleAddDept = async () => {
  if (!newDeptName.value.trim()) return
  const success = await deptStore.addDepartment(newDeptName.value)
  if (success) newDeptName.value = ''
}

const startEditDept = (dept) => {
  editingDept.value = dept.id
  editDeptName.value = dept.name
}

const handleUpdateDept = async (id) => {
  if (!editDeptName.value.trim()) return
  const success = await deptStore.updateDepartment(id, editDeptName.value)
  if (success) editingDept.value = null
}

const handleDeleteDept = async (dept) => {
  const count = getUserCountByDept(dept.name)
  if (count > 0) {
    if (!confirm(`แผนก "${dept.name}" มีผู้ใช้ ${count} คน ต้องการลบหรือไม่?`)) return
  }
  await deptStore.deleteDepartment(dept.id)
}

// ====== Import Leave Data ======
const isDragging = ref(false)
const importFile = ref(null)
const importPreview = ref([])
const importParseError = ref('')
const importResult = ref(null)

// Leave type mapping (Thai -> value)
const leaveTypeMap = {
  'ลาป่วย': 'sick',
  'ลากิจ': 'personal',
  'ลาพักร้อน': 'vacation',
  'ลาคลอด': 'maternity',
  'ลาไม่รับค่าจ้าง': 'unpaid',
  'ลาอื่นๆ': 'other',
  'sick': 'sick',
  'personal': 'personal',
  'vacation': 'vacation',
  'maternity': 'maternity',
  'unpaid': 'unpaid',
  'other': 'other'
}

const getLeaveTypeLabel = (type) => {
  const found = leaveStore.leaveTypes.find(t => t.value === type)
  return found ? `${found.icon} ${found.label}` : type || '-'
}

// Validate a single row
const validateRow = (row) => {
  const errors = []
  if (!row.userId || !row.userId.trim()) errors.push('ไม่มีอีเมล')
  if (!row.firstName || !row.firstName.trim()) errors.push('ไม่มีชื่อ')
  if (!row.lastName || !row.lastName.trim()) errors.push('ไม่มีนามสกุล')
  if (!row.leaveType) errors.push('ประเภทการลาไม่ถูกต้อง')
  if (!row.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.startDate)) errors.push('วันที่เริ่มไม่ถูกต้อง')
  if (!row.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.endDate)) errors.push('วันที่สิ้นสุดไม่ถูกต้อง')
  if (row.startDate && row.endDate && row.startDate > row.endDate) errors.push('วันที่เริ่ม > วันที่สิ้นสุด')
  return errors
}

const validRows = computed(() => importPreview.value.filter(r => r._errors.length === 0))
const invalidRows = computed(() => importPreview.value.filter(r => r._errors.length > 0))

// Format Excel date serial number or string to YYYY-MM-DD
const formatExcelDate = (val) => {
  if (!val) return ''
  // If it's already a YYYY-MM-DD string
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim()
  // If it's a string like "2025-01-15" with extra chars
  if (typeof val === 'string') {
    const match = val.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
    // Try DD/MM/YYYY or D/M/YYYY
    const slashMatch = val.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/)
    if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`
  }
  // If it's an Excel serial number
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  }
  return String(val).trim()
}

// Parse uploaded Excel file
const parseExcel = (file) => {
  importPreview.value = []
  importParseError.value = ''
  importResult.value = null

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      if (!sheet) {
        importParseError.value = 'ไม่พบข้อมูลใน Sheet แรก'
        return
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      if (rows.length === 0) {
        importParseError.value = 'ไม่พบข้อมูลในไฟล์ (ไฟล์ว่าง)'
        return
      }

      // Map columns
      importPreview.value = rows.map((row, idx) => {
        const rawType = String(row['ประเภทการลา'] || row['leaveType'] || '').trim()
        const mapped = {
          _rowIndex: idx + 2, // +2 for 1-based + header row
          userId: String(row['อีเมลพนักงาน'] || row['userId'] || row['email'] || '').trim(),
          firstName: String(row['ชื่อ'] || row['firstName'] || '').trim(),
          lastName: String(row['นามสกุล'] || row['lastName'] || '').trim(),
          leaveType: leaveTypeMap[rawType] || '',
          startDate: formatExcelDate(row['วันที่เริ่ม'] || row['startDate'] || ''),
          endDate: formatExcelDate(row['วันที่สิ้นสุด'] || row['endDate'] || ''),
          department: String(row['แผนก'] || row['department'] || '').trim(),
          details: String(row['รายละเอียด'] || row['details'] || '').trim(),
          submittedAt: formatExcelDate(row['วันที่ส่ง'] || row['submittedAt'] || ''),
          _errors: []
        }
        mapped._errors = validateRow(mapped)
        return mapped
      })
    } catch (err) {
      console.error('Error parsing Excel:', err)
      importParseError.value = 'ไม่สามารถอ่านไฟล์ได้ — กรุณาตรวจสอบรูปแบบไฟล์'
    }
  }
  reader.readAsArrayBuffer(file)
}

// File handlers
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    importFile.value = file
    parseExcel(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    importFile.value = file
    parseExcel(file)
  } else {
    importParseError.value = 'กรุณาใช้ไฟล์ .xlsx เท่านั้น'
  }
}

const clearImport = () => {
  importFile.value = null
  importPreview.value = []
  importParseError.value = ''
  importResult.value = null
  isDragging.value = false
}

// Download blank template
const downloadTemplate = () => {
  const headers = [
    { 'อีเมลพนักงาน': 'user@example.com', 'ชื่อ': 'สมชาย', 'นามสกุล': 'ใจดี', 'ประเภทการลา': 'ลาป่วย', 'วันที่เริ่ม': '2025-01-15', 'วันที่สิ้นสุด': '2025-01-16', 'แผนก': 'IT', 'รายละเอียด': 'ไม่สบาย', 'วันที่ส่ง': '2025-01-14' }
  ]
  const ws = XLSX.utils.json_to_sheet(headers)

  // Column widths
  ws['!cols'] = [
    { wch: 25 }, // อีเมลพนักงาน
    { wch: 15 }, // ชื่อ
    { wch: 15 }, // นามสกุล
    { wch: 15 }, // ประเภทการลา
    { wch: 14 }, // วันที่เริ่ม
    { wch: 14 }, // วันที่สิ้นสุด
    { wch: 15 }, // แผนก
    { wch: 25 }, // รายละเอียด
    { wch: 14 }  // วันที่ส่ง
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'LeaveImport')
  XLSX.writeFile(wb, 'leave-import-template.xlsx')
}

// Execute import
const handleImport = async () => {
  if (validRows.value.length === 0) return

  const confirmed = confirm(`ยืนยันนำเข้าข้อมูลการลา ${validRows.value.length} รายการ?`)
  if (!confirmed) return

  const result = await leaveStore.importLeaves(validRows.value)
  importResult.value = result

  if (result.success > 0) {
    // Clear preview after successful import
    importPreview.value = []
    importFile.value = null
  }
}
</script>

<style scoped>
.admin-page {
  background: #16181a;
  min-height: 100vh;
  padding: 24px;
}

.admin-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.admin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(239, 83, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef5350;
}

.admin-header-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e1e2e5;
  letter-spacing: 0.3px;
}

.admin-header-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.admin-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9ca3af;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-back-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 4px;
  background: rgba(30, 33, 36, 0.6);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
}

.admin-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-tab:hover {
  color: #9ca3af;
}

.admin-tab-active {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
}

.admin-tab-badge {
  background: rgba(92, 156, 230, 0.2) !important;
  color: #5c9ce6 !important;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Search */
.admin-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  margin-bottom: 16px;
}

.admin-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
}

.admin-search-input::placeholder {
  color: #4b5563;
}

/* Empty */
.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #4b5563;
  font-size: 0.82rem;
}

/* User Card */
.admin-user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-user-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s;
}

.admin-user-card:hover {
  border-color: rgba(92, 156, 230, 0.3);
}

.admin-user-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.admin-user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.admin-user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-user-info {
  flex: 1;
  min-width: 0;
}

.admin-user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
}

.admin-user-email {
  font-size: 0.75rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.admin-user-current-role {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(58, 59, 62, 0.3);
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* User Projects */
.admin-user-projects {
  margin-bottom: 12px;
}

.admin-user-projects-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.admin-user-projects-empty .admin-user-projects-label {
  color: #4b5563;
  margin-bottom: 0;
}

.admin-user-projects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-project-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(92, 156, 230, 0.1);
  color: #7db8f0;
  font-size: 0.72rem;
  font-weight: 500;
  border: 1px solid rgba(92, 156, 230, 0.15);
}

.admin-user-fields {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.admin-field {
  flex: 1;
}

.admin-field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.admin-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(22, 24, 26, 0.8);
  color: #cecfd2;
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  appearance: auto;
}

.admin-select:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92, 156, 230, 0.3);
}

.admin-save-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.admin-save-success {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #66bb6a;
}

/* Department */
.admin-add-dept {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.admin-dept-input {
  flex: 1;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(30, 33, 36, 0.6);
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.admin-dept-input:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-dept-input::placeholder {
  color: #4b5563;
}

.admin-add-dept-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-add-dept-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.admin-add-dept-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.admin-dept-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-dept-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.admin-dept-card:hover {
  border-color: rgba(58, 59, 62, 0.5);
}

.admin-dept-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.admin-dept-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
}

.admin-dept-edit .admin-dept-input {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-dept-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(92, 156, 230, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c9ce6;
  flex-shrink: 0;
}

.admin-dept-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
}

.admin-dept-count {
  font-size: 0.75rem;
  color: #6b6c6f;
  padding: 3px 8px;
  background: rgba(58, 59, 62, 0.2);
  border-radius: 6px;
}

.admin-dept-actions {
  display: flex;
  gap: 4px;
}

.admin-dept-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-action-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

.admin-dept-delete-btn:hover {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.admin-dept-save-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-save-btn:hover {
  background: rgba(102, 187, 106, 0.25);
}

.admin-dept-cancel-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-cancel-btn:hover {
  background: rgba(239, 83, 80, 0.2);
}

/* ====== Import Section ====== */
.import-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  overflow: hidden;
}

.import-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.import-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #cecfd2;
}

.import-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.12);
  font-size: 0.75rem;
  color: #42a5f5;
}

.import-template-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(102, 187, 106, 0.3);
  background: rgba(102, 187, 106, 0.08);
  color: #66bb6a;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.import-template-btn:hover {
  background: rgba(102, 187, 106, 0.16);
  border-color: rgba(102, 187, 106, 0.5);
}

/* Upload Area */
.import-upload-area {
  border: 2px dashed rgba(58, 59, 62, 0.4);
  border-radius: 12px;
  transition: all 0.2s;
  background: rgba(24, 25, 28, 0.3);
}

.import-upload-area:hover {
  border-color: rgba(92, 156, 230, 0.3);
}

.import-upload-dragover {
  border-color: rgba(92, 156, 230, 0.6) !important;
  background: rgba(92, 156, 230, 0.04) !important;
}

.import-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 20px;
  color: #4b5563;
}

.import-upload-text {
  font-size: 0.78rem;
  color: #6b6c6f;
}

.import-upload-hint {
  font-size: 0.65rem;
  color: #4b5563;
}

.import-browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid rgba(92, 156, 230, 0.3);
  background: rgba(92, 156, 230, 0.08);
  color: #5c9ce6;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.import-browse-btn:hover {
  background: rgba(92, 156, 230, 0.16);
  border-color: rgba(92, 156, 230, 0.5);
}

.import-upload-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.import-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.import-file-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e1e2e5;
}

.import-file-size {
  font-size: 0.68rem;
  color: #6b6c6f;
}

.import-remove-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.import-remove-btn:hover {
  background: rgba(239, 83, 80, 0.2);
}

/* Parse Error */
.import-error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(239, 83, 80, 0.06);
  border: 1px solid rgba(239, 83, 80, 0.12);
  font-size: 0.75rem;
  color: #ef5350;
}

/* Preview Section */
.import-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.import-preview-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.import-preview-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.import-summary-total { color: #9ca3af; }
.import-summary-valid { color: #66bb6a; }
.import-summary-invalid { color: #ef5350; }

/* Preview Table */
.import-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.import-table-wrapper::-webkit-scrollbar { width: 4px; height: 4px; }
.import-table-wrapper::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.4); border-radius: 2px; }

.import-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}

.import-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.import-table th {
  padding: 8px 10px;
  background: rgba(24, 25, 28, 0.9);
  color: #6b6c6f;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
}

.import-table td {
  padding: 7px 10px;
  color: #cecfd2;
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
  white-space: nowrap;
}

.import-table tbody tr:hover {
  background: rgba(58, 59, 62, 0.06);
}

.import-row-invalid {
  background: rgba(239, 83, 80, 0.04) !important;
}

.import-row-invalid td {
  color: #ef5350 !important;
}

.import-th-seq, .import-td-seq {
  width: 36px;
  text-align: center;
}

.import-td-seq {
  font-weight: 700;
  color: #6b6c6f !important;
}

.import-type-pill {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 183, 77, 0.08);
  font-size: 0.68rem;
}

.import-th-status {
  width: 140px;
}

.import-td-status {
  width: 140px;
}

.import-status-ok {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #66bb6a;
  font-weight: 600;
}

.import-status-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ef5350;
  font-weight: 600;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.import-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.import-clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.import-clear-btn:hover {
  border-color: rgba(239, 83, 80, 0.3);
  color: #ef5350;
}

.import-skip-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #ffb74d;
}

.import-submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ffb74d 0%, #ef6c00 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.import-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.25);
}

.import-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Import Result */
.import-result-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
}

.import-result-success {
  background: rgba(102, 187, 106, 0.08);
  border: 1px solid rgba(102, 187, 106, 0.2);
  color: #66bb6a;
}

.import-result-warn {
  background: rgba(255, 183, 77, 0.08);
  border: 1px solid rgba(255, 183, 77, 0.2);
  color: #ffb74d;
}

.import-result-title {
  font-size: 0.82rem;
  font-weight: 700;
}

.import-result-errors {
  font-size: 0.72rem;
  margin-top: 2px;
  opacity: 0.8;
}

@media (max-width: 640px) {
  .admin-page { padding: 16px; }
  .admin-user-fields { flex-direction: column; gap: 8px; }
  .admin-user-fields .admin-save-btn { width: 100%; justify-content: center; }
  .admin-add-dept { flex-direction: column; }
  .import-actions { flex-direction: column; align-items: stretch; }
  .import-skip-hint { order: -1; }
}
</style>
