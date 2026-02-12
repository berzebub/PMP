import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const allProjects = ref([])
  const currentProject = ref(null)
  const myCompletedTasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  // Get projects that user has access to
  const fetchProjects = async () => {
    if (!authStore.user) return

    try {
      loading.value = true
      error.value = null

      console.log('Fetching projects for user UID:', authStore.user.uid)
      console.log('User email:', authStore.user.email)

      const projectsRef = collection(db, 'projects')
      const q = query(projectsRef, where('members', 'array-contains', authStore.user.email))

      const querySnapshot = await getDocs(q)
      const fetchedProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Fetched projects:', fetchedProjects.map(p => ({
        id: p.id,
        name: p.name,
        members: p.members,
        createdBy: p.createdBy
      })))

      projects.value = fetchedProjects
    } catch (err) {
      error.value = err.message
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Listen to projects changes in real-time
  const subscribeToProjects = () => {
    if (!authStore.user) return

    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, where('members', 'array-contains', authStore.user.email))

    return onSnapshot(q, (querySnapshot) => {
      projects.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }, (err) => {
      error.value = err.message
      console.error('Error listening to projects:', err)
    })
  }

  // Fetch ALL projects (for admin use)
  const fetchAllProjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'projects'))
      allProjects.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('Error fetching all projects:', err)
    }
  }

  // Create new project
  const createProject = async (projectData) => {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const newProject = {
        name: projectData.name,
        description: projectData.description || '',
        members: [authStore.user.email], // Creator is automatically a member
        createdBy: authStore.user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'projects'), newProject)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update project
  const updateProject = async (projectId, updateData) => {
    try {
      loading.value = true
      error.value = null

      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        ...updateData,
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      loading.value = true
      error.value = null

      const projectRef = doc(db, 'projects', projectId)
      await deleteDoc(projectRef)

      // Clear current project if it was deleted
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add member to project
  const addMember = async (projectId, memberEmail) => {
    try {
      const normalizedEmail = memberEmail.toLowerCase().trim()
      const project = projects.value.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

      const updatedMembers = [...project.members, normalizedEmail]
      await updateProject(projectId, { members: updatedMembers })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Remove member from project
  const removeMember = async (projectId, memberEmail) => {
    try {
      const project = projects.value.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

      const updatedMembers = project.members.filter(email => email !== memberEmail)
      await updateProject(projectId, { members: updatedMembers })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Set current project
  const setCurrentProject = (project) => {
    if (project && project.id) {
      currentProject.value = project
    } else {
      console.warn('Invalid project provided to setCurrentProject:', project)
      currentProject.value = null
    }
  }

  // Clear current project
  const clearCurrentProject = () => {
    currentProject.value = null
  }

  // Fetch completed tasks assigned to current user (for portfolio)
  const fetchMyCompletedTasks = async (maxResults = 200) => {
    if (!authStore.user?.email) return

    try {
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', authStore.user.email),
        where('completed', '==', true),
        orderBy('completedAt', 'desc'),
        limit(maxResults)
      )

      const snapshot = await getDocs(q)
      const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // Enrich with project names
      const projectIds = [...new Set(tasks.map(t => t.projectId).filter(Boolean))]
      const projectNameMap = {}
      for (const pid of projectIds) {
        const proj = projects.value.find(p => p.id === pid) || allProjects.value.find(p => p.id === pid)
        if (proj) {
          projectNameMap[pid] = proj.name
        }
      }
      myCompletedTasks.value = tasks.map(t => ({
        ...t,
        projectName: projectNameMap[t.projectId] || ''
      }))
    } catch (err) {
      console.error('Error fetching completed tasks:', err)
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    projects,
    allProjects,
    currentProject,
    myCompletedTasks,
    loading,
    error,
    fetchProjects,
    fetchAllProjects,
    fetchMyCompletedTasks,
    subscribeToProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    setCurrentProject,
    clearCurrentProject,
    clearError
  }
})
