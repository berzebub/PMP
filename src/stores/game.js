import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'

export const useGameStore = defineStore('game', () => {
  const leaderboard = ref([])
  const personalBest = ref(null)
  const recentScores = ref([])
  const loading = ref(false)

  const authStore = useAuthStore()

  /**
   * Fetch leaderboard for a specific game.
   * Returns top scores grouped by user (best score per user).
   */
  const fetchLeaderboard = async (gameId, topN = 10) => {
    try {
      loading.value = true

      // Fetch top scores ordered by score desc
      // We fetch more than topN to account for duplicate users, then deduplicate
      const q = query(
        collection(db, 'gameScores'),
        where('gameId', '==', gameId),
        orderBy('score', 'desc'),
        limit(topN * 5)
      )

      const snapshot = await getDocs(q)
      const allScores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Deduplicate: keep only the best score per user
      const bestByUser = new Map()
      for (const entry of allScores) {
        if (!bestByUser.has(entry.userId) || entry.score > bestByUser.get(entry.userId).score) {
          bestByUser.set(entry.userId, entry)
        }
      }

      // Sort by score desc and take top N
      const topEntries = Array.from(bestByUser.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)

      // Enrich with current profile data (photoURL, displayName)
      const uniqueUserIds = [...new Set(topEntries.map(e => e.userId))]
      const profileMap = new Map()
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', userId))
            if (profileDoc.exists()) {
              profileMap.set(userId, profileDoc.data())
            }
          } catch (_) { /* ignore individual profile fetch errors */ }
        })
      )

      leaderboard.value = topEntries.map(entry => {
        const profile = profileMap.get(entry.userId)
        if (profile) {
          const firstName = profile.firstName?.trim() || ''
          const lastName = profile.lastName?.trim() || ''
          const currentName = (firstName || lastName)
            ? `${firstName} ${lastName}`.trim()
            : entry.displayName
          return {
            ...entry,
            displayName: currentName,
            photoURL: profile.photoURL || entry.photoURL
          }
        }
        return entry
      })

    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch personal best score for a specific game.
   */
  const fetchPersonalBest = async (gameId) => {
    if (!authStore.user?.email) return

    try {
      const q = query(
        collection(db, 'gameScores'),
        where('gameId', '==', gameId),
        where('userId', '==', authStore.user.email),
        orderBy('score', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        personalBest.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      } else {
        personalBest.value = null
      }
    } catch (err) {
      console.error('Error fetching personal best:', err)
    }
  }

  /**
   * Fetch recent scores for a specific game (current user).
   */
  const fetchRecentScores = async (gameId, count = 5) => {
    if (!authStore.user?.email) return

    try {
      const q = query(
        collection(db, 'gameScores'),
        where('gameId', '==', gameId),
        where('userId', '==', authStore.user.email),
        orderBy('createdAt', 'desc'),
        limit(count)
      )

      const snapshot = await getDocs(q)
      recentScores.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching recent scores:', err)
    }
  }

  /**
   * Submit a score for a specific game.
   * Only saves if score > 0.
   */
  const submitScore = async (gameId, score) => {
    if (!authStore.user?.email || score <= 0) return null

    try {
      const scoreData = {
        gameId,
        userId: authStore.user.email,
        displayName: authStore.user.displayName || authStore.user.email.split('@')[0],
        photoURL: authStore.profile?.photoURL || '',
        score: Math.floor(score),
        createdAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'gameScores'), scoreData)

      // Update personal best if this score is higher
      if (!personalBest.value || score > personalBest.value.score) {
        personalBest.value = { id: docRef.id, ...scoreData }
      }

      return { id: docRef.id, ...scoreData }
    } catch (err) {
      console.error('Error submitting score:', err)
      return null
    }
  }

  /**
   * Get the current user's rank in a leaderboard.
   */
  const getMyRank = () => {
    if (!authStore.user?.email || leaderboard.value.length === 0) return null
    const idx = leaderboard.value.findIndex(e => e.userId === authStore.user.email)
    return idx >= 0 ? idx + 1 : null
  }

  /**
   * Cleanup store state.
   */
  const cleanup = () => {
    leaderboard.value = []
    personalBest.value = null
    recentScores.value = []
  }

  return {
    leaderboard,
    personalBest,
    recentScores,
    loading,
    fetchLeaderboard,
    fetchPersonalBest,
    fetchRecentScores,
    submitScore,
    getMyRank,
    cleanup
  }
})
