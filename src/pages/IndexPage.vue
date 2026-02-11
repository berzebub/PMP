<template>
  <q-page class="index-page">
    <div class="hero-section">
      <div class="text-center">
        <div class="text-h2 text-primary q-mb-md">Task Management</div>
        <div class="text-h6 text-secondary q-mb-lg">จัดการงานของคุณอย่างมีประสิทธิภาพ</div>

        <div v-if="projectsStore.projects.length === 0" class="empty-state">
          <q-icon name="folder_open" size="64px" class="text-secondary q-mb-md" />
          <div class="text-h6 text-secondary q-mb-md">ยังไม่มีโปรเจค</div>
          <div class="text-body2 text-secondary q-mb-lg">เริ่มต้นด้วยการสร้างโปรเจคแรกของคุณ</div>
          <q-btn color="primary" size="lg" icon="add" label="สร้างโปรเจคแรก" @click="showCreateProjectDialog = true" />
        </div>

        <div v-else class="projects-grid">
          <div class="text-h5 text-primary q-mb-md">โปรเจคของคุณ</div>
          <div class="row q-gutter-md justify-center">
            <q-card v-for="project in projectsStore.projects" :key="project.id" class="project-card cursor-pointer"
              @click="selectProject(project)">
              <q-card-section>
                <div class="text-h6 text-primary">{{ project.name }}</div>
                <div class="text-caption text-secondary">{{ project.description }}</div>
                <div class="text-caption text-secondary q-mt-sm">
                  <q-icon name="group" size="xs" class="q-mr-xs" />
                  {{ project.members?.length || 0 }} สมาชิก
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Dialog -->
    <q-dialog v-model="showCreateProjectDialog">
      <q-card class="create-project-card">
        <q-card-section>
          <div class="text-h6 text-primary">สร้างโปรเจคใหม่</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleCreateProject" class="q-gutter-md">
            <q-input v-model="newProject.name" label="ชื่อโปรเจค" outlined
              :rules="[val => !!val || 'กรุณากรอกชื่อโปรเจค']" />

            <q-input v-model="newProject.description" label="คำอธิบาย" outlined type="textarea" rows="3" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="ยกเลิก" @click="showCreateProjectDialog = false" class="cancel-btn" />
              <q-btn type="submit" label="สร้าง" :loading="projectsStore.loading" class="create-btn" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from 'stores/projects'

const router = useRouter()
const projectsStore = useProjectsStore()

const showCreateProjectDialog = ref(false)
const newProject = ref({
  name: '',
  description: ''
})

const selectProject = (project) => {
  projectsStore.setCurrentProject(project)
  router.push(`/project/${project.id}`)
}

const handleCreateProject = async () => {
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
/* Override Quasar heading sizes */
.text-h2 {
  font-size: 2.625rem !important;
}

.text-h5 {
  font-size: 1.05rem !important;
}

.text-h6 {
  font-size: 0.875rem !important;
}

.index-page {
  background: transparent;
  min-height: 100vh;
}

.hero-section {
  padding: 80px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  padding: 40px;
}

.projects-grid {
  max-width: 600px;
  margin: 0 auto;
}

.project-card {
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 59, 62, 0.5);
  min-width: 200px;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.project-card:hover {
  border-color: #cecfd2;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(206, 207, 210, 0.2);
}

.text-primary {
  color: #cecfd2;
}

.text-secondary {
  color: #9E9E9E;
}

.create-project-card {
  min-width: 500px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid rgba(206, 207, 210, 0.2);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.create-project-card .q-field__control {
  background: #FFFFFF;
  border: 2px solid #E1E5E9;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.create-project-card .q-field__control:hover {
  border-color: #cecfd2;
}

.create-project-card .q-field--focused .q-field__control {
  border-color: #cecfd2;
  box-shadow: 0 0 0 3px rgba(206, 207, 210, 0.1);
}

.create-project-card .q-field__native {
  color: #3a3b3e;
  font-weight: 500;
}

.create-project-card .q-field__label {
  color: #6C757D;
  font-weight: 600;
}

.cancel-btn {
  color: #6C757D !important;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(108, 117, 125, 0.1) !important;
  color: #495057 !important;
}

.create-btn {
  background: linear-gradient(135deg, #cecfd2, #cecfd2) !important;
  color: #18191a !important;
  font-weight: 700;
  padding: 8px 24px;
  border-radius: 8px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(206, 207, 210, 0.3);
  transition: all 0.3s ease;
  min-width: 80px;
}

.create-btn:hover {
  background: linear-gradient(135deg, #e0e1e4, #e0e1e4) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(206, 207, 210, 0.4);
}

.create-btn:active {
  transform: translateY(0);
}
</style>
