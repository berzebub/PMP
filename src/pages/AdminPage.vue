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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useDepartmentsStore } from 'stores/departments'
import { useProjectsStore } from 'stores/projects'

const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const projectsStore = useProjectsStore()

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

@media (max-width: 640px) {
  .admin-page { padding: 16px; }
  .admin-user-fields { flex-direction: column; gap: 8px; }
  .admin-user-fields .admin-save-btn { width: 100%; justify-content: center; }
  .admin-add-dept { flex-direction: column; }
}
</style>
