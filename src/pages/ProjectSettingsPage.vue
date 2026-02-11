<template>
  <q-page class="settings-page">
    <!-- Header -->
    <div class="settings-header">
      <div class="header-left">
        <q-btn flat round icon="arrow_back" size="sm" class="back-btn" @click="$router.back()" />
        <div>
          <div class="header-title">{{ projectsStore.currentProject?.name }}</div>
          <div class="header-subtitle">การตั้งค่าโปรเจค</div>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="settings-body">
      <div class="settings-grid">

        <!-- Left Column -->
        <div class="settings-col">
          <!-- Project Info Card -->
          <div class="card">
            <div class="card-header">
              <q-icon name="info" size="20px" style="color: #5c9ce6;" />
              <span class="card-title">ข้อมูลโปรเจค</span>
            </div>

            <div class="card-content">
              <div class="field">
                <label class="field-label">ชื่อโปรเจค</label>
                <q-input v-model="projectForm.name" outlined dense dark
                  placeholder="กรอกชื่อโปรเจค" class="field-input" />
              </div>

              <div class="field">
                <label class="field-label">คำอธิบาย</label>
                <q-input v-model="projectForm.description" outlined dense dark
                  type="textarea" rows="3" placeholder="เพิ่มคำอธิบายโปรเจค..."
                  class="field-input" />
              </div>

              <div class="row justify-end q-gutter-sm q-mt-md">
                <q-btn flat label="รีเซ็ต" class="btn-cancel" @click="resetForm" />
                <q-btn label="บันทึกการเปลี่ยนแปลง" icon="save" class="btn-primary"
                  :disable="!projectForm.name?.trim()" :loading="projectsStore.loading"
                  @click="updateProjectInfo" />
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="card card-danger">
            <div class="card-header">
              <q-icon name="warning" size="20px" style="color: #ef5350;" />
              <span class="card-title" style="color: #ef5350;">พื้นที่อันตราย</span>
            </div>

            <div class="card-content">
              <div class="danger-info">
                <div>
                  <div class="danger-action-title">ลบโปรเจค</div>
                  <div class="danger-action-desc">เมื่อลบแล้วจะไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะถูกลบถาวร</div>
                </div>
                <q-btn v-if="isProjectOwner" outline label="ลบโปรเจค" class="btn-danger"
                  icon="delete_forever" @click="confirmDeleteProject" :loading="deletingProject" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="settings-col">
          <!-- Members Card -->
          <div class="card">
            <div class="card-header">
              <q-icon name="group" size="20px" style="color: #4caf50;" />
              <span class="card-title">สมาชิก</span>
              <q-badge :label="projectMembers.length" class="member-count-badge" />
            </div>

            <div class="card-content">
              <!-- Members List -->
              <div class="members-list">
                <div v-for="member in projectMembers" :key="member.id" class="member-row">
                  <q-avatar size="38px" class="member-avatar"
                    :style="{ background: authStore.getPhotoURL(member.email) ? 'transparent' : (member.email === projectsStore.currentProject?.createdBy ? 'rgba(92,156,230,0.15)' : 'rgba(58,59,62,0.5)') }">
                    <img v-if="authStore.getPhotoURL(member.email)" :src="authStore.getPhotoURL(member.email)" style="width:100%;height:100%;object-fit:cover;" />
                    <span v-else :style="{ color: member.email === projectsStore.currentProject?.createdBy ? '#5c9ce6' : '#9ca3af' }">
                      {{ member.email.charAt(0).toUpperCase() }}
                    </span>
                  </q-avatar>

                  <div class="member-info">
                    <div class="member-email">{{ member.email }}</div>
                    <div class="member-role">
                      <q-badge v-if="member.email === projectsStore.currentProject?.createdBy"
                        label="เจ้าของ" class="role-badge owner" />
                      <q-badge v-else label="สมาชิก" class="role-badge member" />
                    </div>
                  </div>

                  <q-btn v-if="member.email !== projectsStore.currentProject?.createdBy && isProjectOwner"
                    flat round icon="person_remove" size="sm" class="remove-member-btn"
                    @click="removeMember(member.email)">
                    <q-tooltip>ลบสมาชิก</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Add Member -->
              <div class="add-member-section">
                <div class="add-member-label">
                  <q-icon name="person_add" size="16px" style="color: #4caf50;" />
                  <span>เพิ่มสมาชิกใหม่</span>
                </div>
                <div class="add-member-form">
                  <q-input v-model="newMemberEmail" outlined dense dark
                    placeholder="กรอกอีเมลสมาชิก" class="field-input"
                    @keyup.enter="addNewMember">
                    <template v-slot:prepend>
                      <q-icon name="mail" size="18px" style="color: #6b6c6f;" />
                    </template>
                  </q-input>
                  <q-btn icon="add" class="btn-add-member" :loading="addingMember"
                    :disable="!newMemberEmail?.trim() || !isValidEmail(newMemberEmail)"
                    @click="addNewMember" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card class="delete-dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="error" size="24px" style="color: #ef5350;" class="q-mr-sm" />
          <div class="delete-dialog-title">ยืนยันการลบโปรเจค</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;"
            @click="showDeleteDialog = false" />
        </q-card-section>

        <q-separator style="background: rgba(239, 83, 80, 0.2);" />

        <q-card-section class="q-pt-md">
          <div class="delete-warning-text">
            คุณกำลังจะลบโปรเจค <strong>"{{ projectsStore.currentProject?.name }}"</strong>
          </div>

          <div class="delete-consequences">
            <div class="consequence-item">
              <q-icon name="task" size="16px" style="color: #ef5350;" />
              <span>งานทั้งหมดในโปรเจค</span>
            </div>
            <div class="consequence-item">
              <q-icon name="checklist" size="16px" style="color: #ef5350;" />
              <span>Subtask ทั้งหมด</span>
            </div>
            <div class="consequence-item">
              <q-icon name="attach_file" size="16px" style="color: #ef5350;" />
              <span>ไฟล์แนบและความคิดเห็นทั้งหมด</span>
            </div>
          </div>

          <div class="delete-confirm-input q-mt-md">
            <label class="field-label">
              พิมพ์ <strong style="color: #ef5350;">{{ projectsStore.currentProject?.name }}</strong> เพื่อยืนยัน
            </label>
            <q-input v-model="confirmProjectName" outlined dense dark
              placeholder="พิมพ์ชื่อโปรเจค" class="field-input" />
          </div>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="ยกเลิก" class="btn-cancel" @click="showDeleteDialog = false" />
            <q-btn label="ลบโปรเจคถาวร" icon="delete_forever" class="btn-danger-solid"
              :loading="deletingProject"
              :disable="confirmProjectName !== projectsStore.currentProject?.name"
              @click="deleteProject" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useProjectsStore } from 'stores/projects'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()

const projectForm = ref({
  name: '',
  description: ''
})

const newMemberEmail = ref('')
const addingMember = ref(false)
const deletingProject = ref(false)
const showDeleteDialog = ref(false)
const confirmProjectName = ref('')

const isProjectOwner = computed(() => {
  return projectsStore.currentProject?.createdBy === authStore.user?.email
})

const projectMembers = computed(() => {
  return projectsStore.currentProject?.members?.map(memberEmail => ({
    id: memberEmail,
    email: memberEmail,
    uid: memberEmail
  })) || []
})

onMounted(async () => {
  const projectId = route.params.id

  if (!projectId) {
    router.push('/')
    return
  }

  try {
    if (projectsStore.projects.length === 0) {
      await projectsStore.fetchProjects()
    }

    if (!projectsStore.currentProject || projectsStore.currentProject.id !== projectId) {
      const project = projectsStore.projects.find(p => p.id === projectId)
      if (project) {
        projectsStore.setCurrentProject(project)
      } else {
        router.push('/')
        return
      }
    }

    if (projectsStore.currentProject) {
      projectForm.value = {
        name: projectsStore.currentProject.name,
        description: projectsStore.currentProject.description || ''
      }
    }
  } catch (error) {
    console.error('Error loading project settings:', error)
    router.push('/')
  }
})

const resetForm = () => {
  if (projectsStore.currentProject) {
    projectForm.value = {
      name: projectsStore.currentProject.name,
      description: projectsStore.currentProject.description || ''
    }
  }
}

const updateProjectInfo = async () => {
  if (!projectForm.value.name?.trim()) return
  try {
    await projectsStore.updateProject(projectsStore.currentProject.id, {
      name: projectForm.value.name,
      description: projectForm.value.description
    })
  } catch (error) {
    console.error('Error updating project:', error)
  }
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const addNewMember = async () => {
  if (!newMemberEmail.value?.trim() || !isValidEmail(newMemberEmail.value)) return
  try {
    addingMember.value = true
    await projectsStore.addMember(projectsStore.currentProject.id, newMemberEmail.value)
    newMemberEmail.value = ''
  } catch (error) {
    console.error('Error adding member:', error)
  } finally {
    addingMember.value = false
  }
}

const removeMember = async (memberEmail) => {
  try {
    await projectsStore.removeMember(projectsStore.currentProject.id, memberEmail)
  } catch (error) {
    console.error('Error removing member:', error)
  }
}

const confirmDeleteProject = () => {
  showDeleteDialog.value = true
  confirmProjectName.value = ''
}

const deleteProject = async () => {
  try {
    deletingProject.value = true
    await projectsStore.deleteProject(projectsStore.currentProject.id)
    router.push('/')
  } catch (error) {
    console.error('Error deleting project:', error)
  } finally {
    deletingProject.value = false
    showDeleteDialog.value = false
  }
}
</script>

<style scoped>
/* Page */
.settings-page {
  background: #18191a;
  min-height: 100vh;
}

/* Header */
.settings-header {
  padding: 16px 24px;
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

.back-btn {
  color: #6b6c6f !important;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #cecfd2 !important;
  background: rgba(58, 59, 62, 0.3) !important;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #cecfd2;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #6b6c6f;
  margin-top: 1px;
}

/* Body */
.settings-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.settings-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card */
.card {
  background: #1e2124;
  border: 1px solid rgba(44, 58, 69, 0.4);
  border-radius: 12px;
  overflow: hidden;
}

.card-danger {
  border-color: rgba(239, 83, 80, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(44, 58, 69, 0.3);
  background: rgba(20, 22, 24, 0.4);
}

.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #cecfd2;
}

.card-content {
  padding: 18px;
}

/* Fields */
.field {
  margin-bottom: 14px;
}

.field-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
}

.field-input :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.8) !important;
  border-color: rgba(58, 59, 62, 0.5) !important;
  border-radius: 8px !important;
}

.field-input :deep(.q-field__control:hover) {
  border-color: rgba(92, 156, 230, 0.3) !important;
}

.field-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #5c9ce6 !important;
}

.field-input :deep(.q-field__native) {
  color: #cecfd2 !important;
  font-size: 0.85rem !important;
}

.field-input :deep(.q-field__native::placeholder) {
  color: #4b5563 !important;
}

/* Members */
.member-count-badge {
  background: rgba(76, 175, 80, 0.12) !important;
  color: #4caf50 !important;
  font-size: 0.68rem !important;
  margin-left: auto;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.member-row:hover {
  background: rgba(58, 59, 62, 0.2);
}

.member-avatar {
  font-size: 0.85rem;
  font-weight: 700;
}

.member-info {
  flex: 1;
  overflow: hidden;
}

.member-email {
  font-size: 0.82rem;
  font-weight: 500;
  color: #cecfd2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  margin-top: 2px;
}

.role-badge {
  font-size: 0.62rem !important;
  padding: 1px 8px !important;
  border-radius: 4px !important;
}

.role-badge.owner {
  background: rgba(92, 156, 230, 0.12) !important;
  color: #5c9ce6 !important;
}

.role-badge.member {
  background: rgba(107, 108, 111, 0.2) !important;
  color: #6b6c6f !important;
}

.remove-member-btn {
  color: #6b6c6f !important;
  opacity: 0;
  transition: all 0.2s;
}

.member-row:hover .remove-member-btn {
  opacity: 1;
}

.remove-member-btn:hover {
  color: #ef5350 !important;
  background: rgba(239, 83, 80, 0.1) !important;
}

/* Add Member */
.add-member-section {
  border-top: 1px solid rgba(44, 58, 69, 0.3);
  padding-top: 14px;
}

.add-member-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 8px;
}

.add-member-form {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.add-member-form .field-input {
  flex: 1;
}

.btn-add-member {
  min-width: 40px;
  height: 40px;
  background: rgba(76, 175, 80, 0.12) !important;
  color: #4caf50 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(76, 175, 80, 0.2) !important;
}

.btn-add-member:hover {
  background: rgba(76, 175, 80, 0.22) !important;
}

/* Danger Zone */
.danger-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.danger-action-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #cecfd2;
  margin-bottom: 4px;
}

.danger-action-desc {
  font-size: 0.75rem;
  color: #6b6c6f;
  line-height: 1.5;
}

/* Buttons */
.btn-cancel {
  color: #6b6c6f !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
}

.btn-cancel:hover {
  background: rgba(58, 59, 62, 0.3) !important;
  color: #9ca3af !important;
}

.btn-primary {
  background: rgba(92, 156, 230, 0.12) !important;
  color: #5c9ce6 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(92, 156, 230, 0.2) !important;
}

.btn-primary:hover {
  background: rgba(92, 156, 230, 0.22) !important;
}

.btn-primary.disabled {
  opacity: 0.4 !important;
}

.btn-danger {
  color: #ef5350 !important;
  border-color: rgba(239, 83, 80, 0.4) !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  white-space: nowrap;
}

.btn-danger:hover {
  background: rgba(239, 83, 80, 0.1) !important;
  border-color: rgba(239, 83, 80, 0.6) !important;
}

.btn-danger-solid {
  background: rgba(239, 83, 80, 0.15) !important;
  color: #ef5350 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(239, 83, 80, 0.3) !important;
}

.btn-danger-solid:hover {
  background: rgba(239, 83, 80, 0.25) !important;
}

.btn-danger-solid.disabled {
  opacity: 0.35 !important;
}

/* Delete Dialog */
.delete-dialog-card {
  min-width: 460px;
  max-width: 520px;
  background: #1e2124 !important;
  border: 1px solid rgba(239, 83, 80, 0.2);
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

.delete-dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ef5350;
}

.delete-warning-text {
  font-size: 0.85rem;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 14px;
}

.delete-warning-text strong {
  color: #cecfd2;
}

.delete-consequences {
  background: rgba(239, 83, 80, 0.06);
  border: 1px solid rgba(239, 83, 80, 0.12);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.consequence-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #9ca3af;
}

.delete-confirm-input .field-label {
  color: #9ca3af;
}

.delete-confirm-input .field-label strong {
  color: #ef5350;
}
</style>
