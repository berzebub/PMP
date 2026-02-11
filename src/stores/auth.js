import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from 'boot/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref({ firstName: '', lastName: '', role: 'employee', department: '', photoURL: '' })
  const allProfiles = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Full display name from profile
  const fullName = computed(() => {
    const f = profile.value.firstName?.trim() || ''
    const l = profile.value.lastName?.trim() || ''
    if (f || l) return `${f} ${l}`.trim()
    return user.value?.displayName || user.value?.email?.split('@')[0] || ''
  })

  // Role helpers
  const isSuperAdmin = computed(() => profile.value.role === 'super_admin')
  const isHR = computed(() => profile.value.role === 'hr')
  const isHead = computed(() => profile.value.role === 'head')
  const isEmployee = computed(() => profile.value.role === 'employee')
  const canApproveHead = computed(() => profile.value.role === 'head')
  const canApproveHR = computed(() => profile.value.role === 'hr' || profile.value.role === 'super_admin')
  const canManageUsers = computed(() => profile.value.role === 'super_admin')

  const roleLabels = {
    super_admin: { label: 'Super Admin', icon: 'shield', color: '#ef5350' },
    hr: { label: 'HR', icon: 'badge', color: '#ce93d8' },
    head: { label: 'หัวหน้าแผนก', icon: 'supervisor_account', color: '#ffb74d' },
    employee: { label: 'พนักงาน', icon: 'person', color: '#66bb6a' }
  }

  // Initialize auth state listener
  const initAuth = () => {
    loading.value = true
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  // Fetch profile from Firestore (auto-create if not exists)
  const fetchProfile = async () => {
    if (!user.value?.email) return
    try {
      const docRef = doc(db, 'profiles', user.value.email)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        profile.value = {
          firstName: '',
          lastName: '',
          role: 'employee',
          department: '',
          photoURL: '',
          ...snap.data()
        }
      } else {
        // Auto-create profile for new user
        const defaultProfile = {
          firstName: '',
          lastName: '',
          email: user.value.email,
          role: 'employee',
          department: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await setDoc(docRef, defaultProfile)
        profile.value = { ...defaultProfile }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  // Upload avatar to Storage and save URL to Firestore
  const uploadAvatar = async (file) => {
    if (!user.value?.email || !file) return false
    try {
      loading.value = true
      const fileRef = storageRef(storage, `avatars/${user.value.email}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      await setDoc(doc(db, 'profiles', user.value.email), { photoURL: url, updatedAt: new Date() }, { merge: true })
      profile.value = { ...profile.value, photoURL: url }
      return true
    } catch (err) {
      console.error('Error uploading avatar:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Get profile photo URL by email (from allProfiles cache)
  const getPhotoURL = (email) => {
    if (!email) return ''
    // Current user
    if (email === user.value?.email) return profile.value.photoURL || ''
    // Other users from allProfiles
    const p = allProfiles.value.find(u => u.email === email || u.id === email)
    return p?.photoURL || ''
  }

  // Save profile to Firestore (user edits own name)
  const saveProfile = async ({ firstName, lastName }) => {
    if (!user.value?.email) return false
    try {
      loading.value = true
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: user.value.email,
        updatedAt: new Date()
      }
      await setDoc(doc(db, 'profiles', user.value.email), data, { merge: true })
      profile.value = { ...profile.value, firstName: data.firstName, lastName: data.lastName }
      return true
    } catch (err) {
      console.error('Error saving profile:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch all profiles (for super_admin user management)
  const fetchAllProfiles = async () => {
    try {
      loading.value = true
      const snapshot = await getDocs(collection(db, 'profiles'))
      allProfiles.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    } catch (err) {
      console.error('Error fetching all profiles:', err)
    } finally {
      loading.value = false
    }
  }

  // Update another user's role/department (super_admin only)
  const updateUserRole = async (email, { role, department }) => {
    if (profile.value.role !== 'super_admin') return false
    try {
      loading.value = true
      const data = { role, department, updatedAt: new Date() }
      await updateDoc(doc(db, 'profiles', email), data)
      // Update local allProfiles
      const idx = allProfiles.value.findIndex(p => p.id === email || p.email === email)
      if (idx !== -1) {
        allProfiles.value[idx] = { ...allProfiles.value[idx], ...data }
      }
      return true
    } catch (err) {
      console.error('Error updating user role:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Register with email and password
  const register = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(auth)
      user.value = null
      profile.value = { firstName: '', lastName: '', role: 'employee', department: '', photoURL: '' }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    user,
    profile,
    allProfiles,
    loading,
    error,
    isAuthenticated,
    fullName,
    isSuperAdmin,
    isHR,
    isHead,
    isEmployee,
    canApproveHead,
    canApproveHR,
    canManageUsers,
    roleLabels,
    initAuth,
    login,
    register,
    logout,
    clearError,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    getPhotoURL,
    fetchAllProfiles,
    updateUserRole
  }
})
