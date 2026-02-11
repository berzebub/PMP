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
  orderBy,
  getDocs,
  getDoc,
  onSnapshot
} from 'firebase/firestore'
import { db, storage } from 'boot/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { useAuthStore } from './auth'
import { useProjectsStore } from './projects'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const subtasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()

  // Task statuses for Kanban board (now dynamic)
  const taskStatuses = ref([
    { id: 'todo', name: 'To Do', color: '#9E9E9E', order: 0 },
    { id: 'in-progress', name: 'In Progress', color: '#cecfd2', order: 1 },
    { id: 'review', name: 'Review', color: '#FFD54F', order: 2 },
    { id: 'done', name: 'Done', color: '#cecfd2', order: 3 }
  ])

  // Get tasks grouped by status
  const tasksByStatus = computed(() => {
    const grouped = {}
    taskStatuses.value.forEach(status => {
      grouped[status.id] = tasks.value.filter(task => task.status === status.id)
    })
    return grouped
  })

  // Get tasks by project (exclude deleted/trashed tasks)
  const fetchTasks = async (projectId) => {
    if (!projectId) return

    try {
      loading.value = true
      error.value = null

      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        where('projectId', '==', projectId),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      tasks.value = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(task => task.isDeleted !== true) // Filter in JS to avoid composite index requirement
    } catch (err) {
      error.value = err.message
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  // Get deleted/trashed tasks
  const fetchTrashedTasks = async (projectId) => {
    if (!projectId) return []

    try {
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        where('projectId', '==', projectId),
        where('isDeleted', '==', true)
      )

      const querySnapshot = await getDocs(q)
      const trashedTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort by deletedAt in JavaScript
      return trashedTasks.sort((a, b) => {
        const aDate = a.deletedAt?.toDate ? a.deletedAt.toDate() : new Date(a.deletedAt || 0)
        const bDate = b.deletedAt?.toDate ? b.deletedAt.toDate() : new Date(b.deletedAt || 0)
        return bDate - aDate // descending order (newest first)
      })
    } catch (err) {
      console.error('Error fetching trashed tasks:', err)
      return []
    }
  }

  // Listen to tasks changes in real-time (optimized to prevent flickering)
  const subscribeToTasks = (projectId) => {
    if (!projectId) return

    const tasksRef = collection(db, 'tasks')
    const q = query(
      tasksRef,
      where('projectId', '==', projectId),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      // Use docChanges to update only changed documents (prevents full re-render)
      querySnapshot.docChanges().forEach((change) => {
        const taskData = {
          id: change.doc.id,
          ...change.doc.data()
        }

        // Skip deleted tasks
        if (taskData.isDeleted === true) {
          // Remove from tasks array if it exists
          const index = tasks.value.findIndex(t => t.id === taskData.id)
          if (index !== -1) {
            tasks.value.splice(index, 1)
          }
          return
        }

        if (change.type === 'added') {
          // Check if task already exists (to prevent duplicates on initial load)
          const existingIndex = tasks.value.findIndex(t => t.id === taskData.id)
          if (existingIndex === -1) {
            tasks.value.push(taskData)
          }
        } else if (change.type === 'modified') {
          // Update existing task
          const index = tasks.value.findIndex(t => t.id === taskData.id)
          if (index !== -1) {
            // Check if this is an optimistic update (recent local change)
            const currentTask = tasks.value[index]
            const timeSinceUpdate = currentTask._localUpdateTime 
              ? Date.now() - currentTask._localUpdateTime 
              : Infinity
            
            // If updated locally within last 2 seconds, skip Firebase update to prevent flicker
            if (timeSinceUpdate < 2000) {
              // Remove the flag after skipping
              delete currentTask._localUpdateTime
            } else {
              // Update from Firebase
              tasks.value[index] = taskData
            }
          }
        } else if (change.type === 'removed') {
          // Remove deleted task
          const index = tasks.value.findIndex(t => t.id === taskData.id)
          if (index !== -1) {
            tasks.value.splice(index, 1)
          }
        }
      })

      // Sort tasks after changes
      tasks.value.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0)
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }, (err) => {
      error.value = err.message
      console.error('Error listening to tasks:', err)
    })
  }

  // Create new task
  const createTask = async (taskData) => {
    if (!authStore.user) throw new Error('User not authenticated')
    if (!projectsStore.currentProject) throw new Error('No project selected')

    try {
      loading.value = true
      error.value = null

      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        projectId: projectsStore.currentProject.id,
        createdBy: authStore.user.uid,
        assignedTo: taskData.assignedTo || null,
        dueDate: taskData.dueDate || null,
        order: taskData.order || 0,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'tasks'), newTask)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update task
  const updateTask = async (taskId, updateData, options = {}) => {
    const { silent = false } = options
    
    try {
      if (!silent) {
        loading.value = true
      }
      error.value = null

      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updateData,
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  // Move task to trash (soft delete)
  const moveToTrash = async (taskId) => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: authStore.user?.uid || null,
        updatedAt: new Date()
      })

      // Remove from local state
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Restore task from trash
  const restoreFromTrash = async (taskId) => {
    try {
      loading.value = true
      error.value = null

      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Permanent delete task
  const deleteTask = async (taskId) => {
    try {
      loading.value = true
      error.value = null

      // Delete all subtasks first
      const subtasksRef = collection(db, 'subtasks')
      const q = query(subtasksRef, where('taskId', '==', taskId))
      const querySnapshot = await getDocs(q)
      
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Empty trash - permanently delete all trashed tasks
  const emptyTrash = async (projectId) => {
    try {
      loading.value = true
      error.value = null

      const trashedTasks = await fetchTrashedTasks(projectId)
      
      for (const task of trashedTasks) {
        await deleteTask(task.id)
      }
      
      return trashedTasks.length
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Move task to different status
  const moveTask = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus })
  }

  // Get subtasks by task
  const fetchSubtasks = async (taskId) => {
    try {
      const subtasksRef = collection(db, 'subtasks')
      const q = query(
        subtasksRef,
        where('taskId', '==', taskId),
        orderBy('createdAt', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`fetchSubtasks(${taskId}):`, result)

      // Update the store with fetched subtasks
      if (result && result.length > 0) {
        // Add projectId to subtasks if missing
        const subtasksWithProjectId = result.map(subtask => ({
          ...subtask,
          projectId: subtask.projectId || projectsStore.currentProject?.id
        }))

        // Merge with existing subtasks in store
        const existingSubtasks = subtasks.value || []
        const otherSubtasks = existingSubtasks.filter(st => st.taskId !== taskId)
        subtasks.value = [...otherSubtasks, ...subtasksWithProjectId]

        console.log(`fetchSubtasks(${taskId}) - Updated store with subtasks:`, subtasksWithProjectId)
      }

      return result
    } catch (err) {
      error.value = err.message
      console.error('Error fetching subtasks:', err)
      return []
    }
  }

  // Fetch all subtasks for a project (for debugging)
  const fetchProjectSubtasks = async (projectId) => {
    try {
      console.log('Fetching all subtasks for project:', projectId)

      const subtasksRef = collection(db, 'subtasks')
      const q = query(
        subtasksRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Fetched project subtasks:', result)
      return result
    } catch (err) {
      error.value = err.message
      console.error('Error fetching project subtasks:', err)
      return []
    }
  }

  // Listen to subtasks changes in real-time for a specific task
  const subscribeToSubtasks = (taskId) => {
    if (!taskId) return

    const subtasksRef = collection(db, 'subtasks')
    const q = query(
      subtasksRef,
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const updatedSubtasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Update the subtasks array in the store
      subtasks.value = updatedSubtasks

      console.log('Subtasks updated for task', taskId, ':', updatedSubtasks)
    }, (err) => {
      error.value = err.message
      console.error('Error listening to subtasks:', err)
    })
  }

  // Listen to all subtasks changes for the current project
  const subscribeToProjectSubtasks = (projectId) => {
    if (!projectId) return

    console.log('Setting up project subtasks subscription for project:', projectId)

    const subtasksRef = collection(db, 'subtasks')
    const q = query(
      subtasksRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'asc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const updatedSubtasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Project subtasks query result:', {
        projectId,
        docsCount: querySnapshot.docs.length,
        subtasks: updatedSubtasks
      })

      // Update the subtasks array in the store
      subtasks.value = updatedSubtasks

      console.log('All project subtasks updated:', updatedSubtasks)
    }, (err) => {
      error.value = err.message
      console.error('Error listening to project subtasks:', err)
    })
  }

  // Create subtask
  const createSubtask = async (subtaskData) => {
    if (!authStore.user) throw new Error('User not authenticated')
    if (!projectsStore.currentProject) throw new Error('No project selected')

    try {
      loading.value = true
      error.value = null

      const newSubtask = {
        title: subtaskData.title,
        description: subtaskData.description || '',
        taskId: subtaskData.taskId,
        projectId: projectsStore.currentProject.id,
        assignedTo: subtaskData.assignedTo || null,
        dueDate: subtaskData.dueDate || null,
        completed: false,
        createdBy: authStore.user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'subtasks'), newSubtask)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update subtask
  const updateSubtask = async (subtaskId, updateData) => {
    try {
      // loading.value = true
      error.value = null

      const subtaskRef = doc(db, 'subtasks', subtaskId)
      await updateDoc(subtaskRef, {
        ...updateData,
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      // loading.value = false
    }
  }

  // Delete subtask
  const deleteSubtask = async (subtaskId) => {
    try {
      loading.value = true
      error.value = null

      const subtaskRef = doc(db, 'subtasks', subtaskId)
      await deleteDoc(subtaskRef)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle subtask completion
  const toggleSubtask = async (subtaskId) => {
    try {
      // Get subtask from database directly
      const subtaskRef = doc(db, 'subtasks', subtaskId)
      const subtaskDoc = await getDoc(subtaskRef)


      if (subtaskDoc.exists()) {
        const subtaskData = subtaskDoc.data()
        const newCompleted = !subtaskData.completed


        await updateSubtask(subtaskId, { completed: newCompleted })

        console.log('Subtask toggled successfully:', subtaskId, 'new completed:', newCompleted)
      } else {
        console.error('Subtask not found:', subtaskId)
        throw new Error('Subtask not found')
      }
    } catch (error) {
      console.error('Error toggling subtask:', error)
      throw error
    }
  }


  // Get task summary (due date and collaborators from subtasks)
  const getTaskSummary = async (taskId) => {
    const taskSubtasks = await fetchSubtasks(taskId)
    const dueDates = taskSubtasks
      .filter(st => st.dueDate)
      .map(st => new Date(st.dueDate))
      .sort((a, b) => a - b)

    const collaborators = [...new Set(taskSubtasks
      .filter(st => st.assignedTo)
      .map(st => st.assignedTo)
    )]

    return {
      earliestDueDate: dueDates[0] || null,
      latestDueDate: dueDates[dueDates.length - 1] || null,
      collaborators
    }
  }

  // Reorder tasks within the same status
  const reorderTasks = async (taskId, newOrder, status) => {
    try {
      loading.value = true
      error.value = null

      // Get all tasks in the same status
      const tasksInStatus = tasks.value.filter(task => task.status === status)

      // Sort by current order
      tasksInStatus.sort((a, b) => (a.order || 0) - (b.order || 0))

      // Find the task being moved
      const taskIndex = tasksInStatus.findIndex(task => task.id === taskId)
      if (taskIndex === -1) return

      // Remove the task from its current position
      const [movedTask] = tasksInStatus.splice(taskIndex, 1)

      // Insert it at the new position
      tasksInStatus.splice(newOrder, 0, movedTask)

      // Update order for all tasks in the status
      const updatePromises = tasksInStatus.map((task, index) => {
        if (task.order !== index) {
          return updateTask(task.id, { order: index })
        }
        return Promise.resolve()
      })

      await Promise.all(updatePromises)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Column management functions
  const addColumn = async (columnData) => {
    try {
      loading.value = true
      error.value = null

      const newColumn = {
        name: columnData.name,
        color: columnData.color || '#9E9E9E',
        order: taskStatuses.value.length,
        projectId: projectsStore.currentProject?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to database first
      const docRef = await addDoc(collection(db, 'columns'), newColumn)

      // Add to local state with Firebase document ID
      const columnWithId = {
        ...newColumn,
        id: docRef.id
      }
      taskStatuses.value.push(columnWithId)

      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateColumn = async (columnId, updateData) => {
    console.log('columnId: ', columnId);
    try {
      loading.value = true
      error.value = null

      const columnRef = doc(db, 'columns', columnId)
      await updateDoc(columnRef, {
        ...updateData,
        updatedAt: new Date()
      })

      // Update local state
      const columnIndex = taskStatuses.value.findIndex(col => col.id === columnId)
      if (columnIndex !== -1) {
        taskStatuses.value[columnIndex] = {
          ...taskStatuses.value[columnIndex],
          ...updateData,
          updatedAt: new Date()
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteColumn = async (columnId) => {
    try {
      loading.value = true
      error.value = null

      // Move all tasks in this column to 'todo' column
      const tasksInColumn = tasks.value.filter(task => task.status === columnId)
      for (const task of tasksInColumn) {
        await updateTask(task.id, { status: 'todo' })
      }

      // Delete column from database
      const columnRef = doc(db, 'columns', columnId)
      await deleteDoc(columnRef)

      // Remove from local state
      taskStatuses.value = taskStatuses.value.filter(col => col.id !== columnId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const reorderColumns = async (columnId, newOrder) => {
    try {
      loading.value = true
      error.value = null

      // Update local state immediately
      const columnIndex = taskStatuses.value.findIndex(col => col.id === columnId)
      if (columnIndex !== -1) {
        const [movedColumn] = taskStatuses.value.splice(columnIndex, 1)
        taskStatuses.value.splice(newOrder, 0, movedColumn)

        // Update order for all columns
        taskStatuses.value.forEach((column, index) => {
          if (column.order !== index) {
            column.order = index
            updateColumn(column.id, { order: index })
          }
        })
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchColumns = async (projectId) => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching columns for project:', projectId)
      console.log('taskStatuses ref before fetch:', taskStatuses)
      console.log('taskStatuses.value before fetch:', taskStatuses.value)

      const columnsRef = collection(db, 'columns')
      const q = query(
        columnsRef,
        where('projectId', '==', projectId)
      )

      const querySnapshot = await getDocs(q)
      const columns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log('Found columns:', columns.length, columns)

      // Use existing columns or empty array
      if (columns.length === 0) {
        console.log('No columns found, starting with empty array')
        taskStatuses.value = []
      } else {
        // Sort columns by order after fetching
        console.log('Using existing columns:', columns)
        taskStatuses.value = columns.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
      console.log('taskStatuses.value set to:', taskStatuses.value)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching columns:', err)
    } finally {
      loading.value = false
    }
  }

  // Get subtasks for a specific task
  const getSubtasksForTask = (taskId) => {



    const result = subtasks.value.filter(subtask => subtask.taskId === taskId)
    console.log(`getSubtasksForTask(${taskId}):`, result, 'from total subtasks:', subtasks.value.length)
    return result
  }

  // Get subtask count and completed count for a task
  const getSubtaskStats = (taskId) => {
    const taskSubtasks = getSubtasksForTask(taskId)
    const total = taskSubtasks.length
    const completed = taskSubtasks.filter(st => st.completed).length
    return { total, completed }
  }

  // Comments functions
  const createComment = async (commentData) => {
    if (!authStore.user) throw new Error('User not authenticated')
    
    try {
      const newComment = {
        taskId: commentData.taskId,
        text: commentData.text,
        userEmail: commentData.userEmail,
        userName: commentData.userName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'comments'), newComment)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  // Activity log function
  const createActivity = async (activityData) => {
    if (!authStore.user) throw new Error('User not authenticated')
    
    try {
      const newActivity = {
        taskId: activityData.taskId,
        text: activityData.text,
        type: 'activity',
        activityType: activityData.activityType || 'status_change',
        fromStatus: activityData.fromStatus || null,
        toStatus: activityData.toStatus || null,
        userEmail: activityData.userEmail,
        userName: activityData.userName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'comments'), newActivity)
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // File attachment functions
  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

  const uploadAttachment = async (taskId, file, onProgress) => {
    if (!authStore.user) throw new Error('User not authenticated')
    if (!file) throw new Error('No file provided')
    if (file.size > MAX_FILE_SIZE) throw new Error('ไฟล์มีขนาดเกิน 100MB')

    try {
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `attachments/${taskId}/${timestamp}_${safeName}`
      const fileRef = storageRef(storage, filePath)

      const uploadTask = uploadBytesResumable(fileRef, file)

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            if (onProgress) onProgress(progress)
          },
          (err) => {
            error.value = err.message
            reject(err)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

              // Save attachment metadata to Firestore
              const attachmentData = {
                taskId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                filePath,
                downloadURL,
                uploadedBy: authStore.user.email,
                uploadedByName: authStore.user.displayName || authStore.user.email.split('@')[0],
                createdAt: new Date()
              }

              const docRef = await addDoc(collection(db, 'attachments'), attachmentData)
              resolve({ id: docRef.id, ...attachmentData })
            } catch (err) {
              reject(err)
            }
          }
        )
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchAttachments = async (taskId) => {
    if (!taskId) return []

    try {
      const attachmentsRef = collection(db, 'attachments')
      const q = query(
        attachmentsRef,
        where('taskId', '==', taskId),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      // If index not ready, fetch without orderBy
      try {
        const attachmentsRef = collection(db, 'attachments')
        const q = query(
          attachmentsRef,
          where('taskId', '==', taskId)
        )
        const querySnapshot = await getDocs(q)
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        return results.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })
      } catch (fallbackErr) {
        error.value = fallbackErr.message
        console.error('Error fetching attachments:', fallbackErr)
        return []
      }
    }
  }

  const deleteAttachment = async (attachment) => {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      // Delete from Storage
      if (attachment.filePath) {
        try {
          const fileRef = storageRef(storage, attachment.filePath)
          await deleteObject(fileRef)
        } catch (storageErr) {
          console.warn('File may already be deleted from storage:', storageErr)
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'attachments', attachment.id))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const subscribeToAttachments = (taskId, callback) => {
    if (!taskId) return

    const attachmentsRef = collection(db, 'attachments')
    let q
    try {
      q = query(
        attachmentsRef,
        where('taskId', '==', taskId),
        orderBy('createdAt', 'desc')
      )
    } catch (e) {
      q = query(
        attachmentsRef,
        where('taskId', '==', taskId)
      )
    }

    return onSnapshot(q, (querySnapshot) => {
      const attachments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(attachments)
    }, (err) => {
      error.value = err.message
      console.error('Error listening to attachments:', err)
    })
  }

  const fetchComments = async (taskId) => {
    if (!taskId) return []
    
    try {
      const commentsRef = collection(db, 'comments')
      const q = query(
        commentsRef,
        where('taskId', '==', taskId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching comments:', err)
      return []
    }
  }
  
  const subscribeToComments = (taskId, callback) => {
    if (!taskId) return
    
    const commentsRef = collection(db, 'comments')
    const q = query(
      commentsRef,
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(comments)
    }, (err) => {
      error.value = err.message
      console.error('Error listening to comments:', err)
    })
  }
  
  const deleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, 'comments', commentId)
      await deleteDoc(commentRef)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    tasks,
    subtasks,
    loading,
    error,
    taskStatuses,
    fetchTasks,
    fetchTrashedTasks,
    subscribeToTasks,
    createTask,
    updateTask,
    deleteTask,
    moveToTrash,
    restoreFromTrash,
    emptyTrash,
    moveTask,
    reorderTasks,
    fetchSubtasks,
    fetchProjectSubtasks,
    subscribeToSubtasks,
    subscribeToProjectSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    tasksByStatus,
    getTaskSummary,
    getSubtasksForTask,
    getSubtaskStats,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    fetchColumns,
    createComment,
    createActivity,
    fetchComments,
    subscribeToComments,
    deleteComment,
    uploadAttachment,
    fetchAttachments,
    deleteAttachment,
    subscribeToAttachments,
    clearError
  }
})
