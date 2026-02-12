<template>
  <q-page class="projects-page">
    <div class="projects-container">
      <!-- Header -->
      <div class="projects-header">
        <div class="projects-header-left">
          <div class="projects-header-icon">
            <q-icon name="folder" size="26px" />
          </div>
          <div>
            <div class="projects-header-title">Projects</div>
            <div class="projects-header-subtitle">โปรเจคทั้งหมดที่คุณเข้าร่วม</div>
          </div>
        </div>
        <button class="projects-create-btn" @click="showCreateProjectDialog = true">
          <q-icon name="add" size="16px" />
          <span>New Project</span>
        </button>
      </div>

      <!-- Search & Stats Bar -->
      <div class="projects-toolbar" v-if="projectsStore.projects.length > 0">
        <div class="projects-search">
          <q-icon name="search" size="16px" class="projects-search-icon" />
          <input v-model="searchQuery" type="text" placeholder="ค้นหาโปรเจค..." class="projects-search-input" />
          <q-icon v-if="searchQuery" name="close" size="14px" class="projects-search-clear" @click="searchQuery = ''" />
        </div>
        <div class="projects-stats">
          <div class="projects-stat">
            <q-icon name="folder" size="14px" />
            <span>{{ projectsStore.projects.length }} โปรเจค</span>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-if="filteredProjects.length > 0" class="projects-grid">
        <div v-for="project in filteredProjects" :key="project.id"
          class="project-card" @click="selectProject(project)">
          <div class="project-card-accent" :style="{ background: getProjectColor(project) }"></div>
          <div class="project-card-body">
            <div class="project-card-top">
              <div class="project-card-icon" :style="{ background: getProjectColor(project) + '18', color: getProjectColor(project) }">
                <q-icon name="folder_open" size="20px" />
              </div>
              <div class="project-card-arrow">
                <q-icon name="arrow_forward" size="16px" />
              </div>
            </div>
            <div class="project-card-name">{{ project.name }}</div>
            <div v-if="project.description" class="project-card-desc">{{ project.description }}</div>
            <div class="project-card-footer">
              <div class="project-card-members">
                <div class="project-card-avatars">
                  <div v-for="(member, idx) in (project.members || []).slice(0, 4)" :key="idx"
                    class="project-card-avatar" :style="{ zIndex: 5 - idx }">
                    <img v-if="getPhotoURL(member)" :src="getPhotoURL(member)" class="project-card-avatar-img" />
                    <span v-else>{{ getInitial(member) }}</span>
                  </div>
                  <div v-if="(project.members || []).length > 4" class="project-card-avatar project-card-avatar-more">
                    +{{ project.members.length - 4 }}
                  </div>
                </div>
                <span class="project-card-member-count">{{ (project.members || []).length }} สมาชิก</span>
              </div>
              <div v-if="project.createdAt" class="project-card-date">
                <q-icon name="schedule" size="11px" />
                {{ formatDate(project.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state: no search results -->
      <div v-else-if="searchQuery && projectsStore.projects.length > 0" class="projects-empty">
        <div class="projects-empty-icon">
          <q-icon name="search_off" size="48px" />
        </div>
        <div class="projects-empty-title">ไม่พบโปรเจคที่ค้นหา</div>
        <div class="projects-empty-desc">ลองค้นหาด้วยคำอื่น หรือ <span class="projects-link" @click="searchQuery = ''">ดูทั้งหมด</span></div>
      </div>

      <!-- Empty state: no projects -->
      <div v-else-if="projectsStore.projects.length === 0" class="projects-empty">
        <div class="projects-empty-icon projects-empty-icon-big">
          <q-icon name="rocket_launch" size="56px" />
        </div>
        <div class="projects-empty-title">เริ่มต้นสร้างโปรเจคแรกของคุณ</div>
        <div class="projects-empty-desc">สร้างโปรเจคเพื่อจัดการงาน มอบหมาย Subtask และติดตามความคืบหน้าของทีม</div>
        <button class="projects-create-btn projects-create-btn-large" @click="showCreateProjectDialog = true">
          <q-icon name="add" size="18px" />
          <span>สร้างโปรเจคใหม่</span>
        </button>
      </div>
    </div>

    <!-- Create Project Dialog -->
    <q-dialog v-model="showCreateProjectDialog">
      <div class="project-dialog-overlay">
        <div class="project-dialog-card">
          <div class="project-dialog-header">
            <div class="project-dialog-header-left">
              <div class="project-dialog-icon">
                <q-icon name="create_new_folder" size="22px" />
              </div>
              <div>
                <div class="project-dialog-title">สร้างโปรเจคใหม่</div>
                <div class="project-dialog-subtitle">กรอกข้อมูลเพื่อเริ่มต้น</div>
              </div>
            </div>
            <button class="project-dialog-close" @click="showCreateProjectDialog = false">
              <q-icon name="close" size="18px" />
            </button>
          </div>
          <div class="project-dialog-body">
            <div class="project-dialog-field">
              <label class="project-dialog-label">ชื่อโปรเจค <span class="project-dialog-required">*</span></label>
              <input v-model="newProject.name" type="text" class="project-dialog-input"
                placeholder="เช่น Website Redesign, Mobile App..." @keyup.enter="handleCreateProject" />
            </div>
            <div class="project-dialog-field">
              <label class="project-dialog-label">คำอธิบาย</label>
              <textarea v-model="newProject.description" class="project-dialog-input project-dialog-textarea"
                placeholder="อธิบายรายละเอียดของโปรเจค (ไม่จำเป็น)" rows="3"></textarea>
            </div>
          </div>
          <div class="project-dialog-footer">
            <button class="project-dialog-btn-cancel" @click="showCreateProjectDialog = false">ยกเลิก</button>
            <button class="project-dialog-btn-create" :disabled="!newProject.name?.trim() || projectsStore.loading"
              @click="handleCreateProject">
              <q-spinner v-if="projectsStore.loading" size="14px" color="white" />
              <q-icon v-else name="add" size="16px" />
              <span>สร้างโปรเจค</span>
            </button>
          </div>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from 'stores/projects'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const showCreateProjectDialog = ref(false)
const searchQuery = ref('')
const newProject = ref({
  name: '',
  description: ''
})

const projectColors = ['#5c9ce6', '#66bb6a', '#ff8a65', '#ce93d8', '#ffb74d', '#42a5f5', '#ef5350', '#26a69a', '#ab47bc', '#ec407a']

const getProjectColor = (project) => {
  // Deterministic color based on project id
  let hash = 0
  const str = project.id || project.name || ''
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return projectColors[Math.abs(hash) % projectColors.length]
}

const getPhotoURL = (email) => {
  return authStore.getPhotoURL(email)
}

const getInitial = (email) => {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return projectsStore.projects
  const needle = searchQuery.value.toLowerCase()
  return projectsStore.projects.filter(p =>
    (p.name || '').toLowerCase().includes(needle) ||
    (p.description || '').toLowerCase().includes(needle)
  )
})

const formatDate = (dateVal) => {
  if (!dateVal) return ''
  const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const selectProject = (project) => {
  projectsStore.setCurrentProject(project)
  router.push(`/project/${project.id}`)
}

const handleCreateProject = async () => {
  if (!newProject.value.name?.trim()) return
  try {
    await projectsStore.createProject(newProject.value)
    newProject.value = { name: '', description: '' }
    showCreateProjectDialog.value = false
  } catch (error) {
    console.error('Error creating project:', error)
  }
}
</script>

<style scoped>
.projects-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.projects-container {
  max-width: 960px;
  margin: 0 auto;
}

/* ====== Header ====== */
.projects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.projects-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.projects-header-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.projects-header-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #e0e1e4;
}

.projects-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.projects-create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 9px;
  border: none;
  background: linear-gradient(135deg, #5c9ce6 0%, #3d7bc7 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(92, 156, 230, 0.2);
}

.projects-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(92, 156, 230, 0.35);
}

.projects-create-btn-large {
  padding: 12px 28px;
  font-size: 0.85rem;
  margin-top: 16px;
}

/* ====== Toolbar ====== */
.projects-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}

.projects-search {
  position: relative;
  flex: 1;
  max-width: 340px;
}

.projects-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #4a4b4e;
  pointer-events: none;
}

.projects-search-input {
  width: 100%;
  padding: 8px 32px 8px 36px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(30, 33, 36, 0.6);
  color: #cecfd2;
  font-size: 0.78rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.projects-search-input:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.projects-search-input::placeholder {
  color: #4a4b4e;
}

.projects-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b6c6f;
  cursor: pointer;
  transition: color 0.15s;
}

.projects-search-clear:hover {
  color: #9e9e9e;
}

.projects-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.projects-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #6b6c6f;
}

/* ====== Projects Grid ====== */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.project-card {
  position: relative;
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(10px);
}

.project-card:hover {
  border-color: rgba(92, 156, 230, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
}

.project-card-accent {
  height: 3px;
  width: 100%;
}

.project-card-body {
  padding: 18px;
}

.project-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.project-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card-arrow {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(58, 59, 62, 0.2);
  color: #3a3b3e;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.project-card:hover .project-card-arrow {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
}

.project-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 4px;
  line-height: 1.3;
}

.project-card-desc {
  font-size: 0.72rem;
  color: #6b6c6f;
  line-height: 1.45;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
}

.project-card-members {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-card-avatars {
  display: flex;
  align-items: center;
}

.project-card-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.2);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 700;
  border: 2px solid rgba(30, 33, 36, 0.9);
  margin-left: -6px;
  position: relative;
  overflow: hidden;
}

.project-card-avatar:first-child {
  margin-left: 0;
}

.project-card-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card-avatar-more {
  background: rgba(58, 59, 62, 0.5);
  color: #9e9e9e;
  font-size: 0.5rem;
}

.project-card-member-count {
  font-size: 0.65rem;
  color: #6b6c6f;
}

.project-card-date {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6rem;
  color: #4a4b4e;
}

/* ====== Empty State ====== */
.projects-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 20px;
}

.projects-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(58, 59, 62, 0.15);
  color: #3a3b3e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.projects-empty-icon-big {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: rgba(92, 156, 230, 0.08);
  color: #5c9ce6;
}

.projects-empty-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cecfd2;
  margin-bottom: 6px;
}

.projects-empty-desc {
  font-size: 0.75rem;
  color: #6b6c6f;
  max-width: 360px;
  line-height: 1.5;
}

.projects-link {
  color: #5c9ce6;
  cursor: pointer;
  font-weight: 600;
}

.projects-link:hover {
  text-decoration: underline;
}

/* ====== Dialog ====== */
.project-dialog-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-dialog-card {
  width: 460px;
  max-width: 95vw;
  background: rgba(30, 33, 36, 0.97);
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.project-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.25);
}

.project-dialog-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-dialog-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-dialog-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e1e4;
}

.project-dialog-subtitle {
  font-size: 0.65rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.project-dialog-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(58, 59, 62, 0.2);
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.project-dialog-close:hover {
  background: rgba(58, 59, 62, 0.4);
  color: #9e9e9e;
}

.project-dialog-body {
  padding: 20px;
}

.project-dialog-field {
  margin-bottom: 16px;
}

.project-dialog-field:last-child {
  margin-bottom: 0;
}

.project-dialog-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9e9e9e;
  margin-bottom: 6px;
}

.project-dialog-required {
  color: #ef5350;
}

.project-dialog-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(24, 25, 26, 0.6);
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.project-dialog-input:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.project-dialog-input::placeholder {
  color: #4a4b4e;
}

.project-dialog-textarea {
  resize: vertical;
  min-height: 70px;
}

.project-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid rgba(58, 59, 62, 0.25);
}

.project-dialog-btn-cancel {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.project-dialog-btn-cancel:hover {
  background: rgba(58, 59, 62, 0.2);
  color: #cecfd2;
}

.project-dialog-btn-create {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #5c9ce6 0%, #3d7bc7 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.project-dialog-btn-create:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92, 156, 230, 0.3);
}

.project-dialog-btn-create:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .projects-page { padding: 16px; }
  .projects-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .projects-create-btn { width: 100%; justify-content: center; }
  .projects-grid { grid-template-columns: 1fr; }
  .projects-toolbar { flex-direction: column; align-items: stretch; }
  .projects-search { max-width: none; }
}
</style>
