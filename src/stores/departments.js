import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'

export const useDepartmentsStore = defineStore('departments', () => {
  const departments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      loading.value = true
      const q = query(collection(db, 'departments'), orderBy('name', 'asc'))
      const snapshot = await getDocs(q)
      departments.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching departments:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Add a department
  const addDepartment = async (name) => {
    try {
      loading.value = true
      error.value = null
      const data = {
        name: name.trim(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      const docRef = await addDoc(collection(db, 'departments'), data)
      departments.value.push({ id: docRef.id, ...data })
      // Sort by name
      departments.value.sort((a, b) => a.name.localeCompare(b.name))
      return true
    } catch (err) {
      console.error('Error adding department:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Update a department name
  const updateDepartment = async (id, name) => {
    try {
      loading.value = true
      error.value = null
      await updateDoc(doc(db, 'departments', id), {
        name: name.trim(),
        updatedAt: Timestamp.now()
      })
      const idx = departments.value.findIndex(d => d.id === id)
      if (idx !== -1) {
        departments.value[idx].name = name.trim()
      }
      departments.value.sort((a, b) => a.name.localeCompare(b.name))
      return true
    } catch (err) {
      console.error('Error updating department:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Delete a department
  const deleteDepartment = async (id) => {
    try {
      loading.value = true
      error.value = null
      await deleteDoc(doc(db, 'departments', id))
      departments.value = departments.value.filter(d => d.id !== id)
      return true
    } catch (err) {
      console.error('Error deleting department:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Get department names as simple array (for dropdowns)
  const departmentNames = () => departments.value.map(d => d.name)

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    departmentNames
  }
})
