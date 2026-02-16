import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc,
  query, where, limit, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'
import { generateQuestionBatch, vocabByLevel } from 'src/data/vocabCEFR'

const COLLECTION = 'vocabBattleRooms'

// Scoring constants
const BASE_POINTS = { A1: 10, A2: 20, B1: 30, B2: 40, C1: 50, C2: 60 }
const COMBO_THRESHOLDS = [
  { min: 10, multiplier: 2.0 },
  { min: 8, multiplier: 1.8 },
  { min: 5, multiplier: 1.5 },
  { min: 3, multiplier: 1.2 },
]
const HEART_MULTIPLIERS = [
  { min: 8, multiplier: 0.6 },
  { min: 6, multiplier: 0.8 },
  { min: 4, multiplier: 1.0 },
  { min: 3, multiplier: 1.5 },
  { min: 1, multiplier: 2.0 },
]
const COMBO_MINI_GAME_FIRST = 10
const COMBO_MINI_GAME_STEP_START = 15
const COMBO_MINI_GAME_STEP_INC = 5

export const useVocabBattleStore = defineStore('vocabBattle', () => {
  const authStore = useAuthStore()

  // ==================== STATE ====================

  const room = ref(null)
  const roomId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Single player state
  const spState = ref(null)

  // Multiplayer local question cache
  const mpQuestions = ref([])

  // Local pending player data (not yet reflected by Firestore snapshot)
  const mpPendingMyData = ref(null)

  // Unsubscribe for listeners
  let unsubRoom = null

  // ==================== COMPUTED ====================

  const myId = computed(() => authStore.user?.email || '')
  const myDisplayName = computed(() => authStore.fullName || authStore.user?.email?.split('@')[0] || '')
  const myPhotoURL = computed(() => authStore.profile?.photoURL || '')

  const isHost = computed(() => room.value?.hostId === myId.value)

  const playerCount = computed(() => {
    if (!room.value?.players) return 0
    return Object.keys(room.value.players).length
  })

  const alivePlayers = computed(() => {
    if (!room.value?.players) return []
    return Object.entries(room.value.players)
      .filter(([, p]) => p.isAlive)
      .map(([id, p]) => ({ id, ...p }))
  })

  const isGameActive = computed(() => room.value?.status === 'playing')

  const myPlayerData = computed(() => room.value?.players?.[myId.value] || null)

  const myCurrentQuestion = computed(() => {
    if (!myPlayerData.value || !myPlayerData.value.isAlive) return null
    const idx = myPlayerData.value.questionIndex || 0
    return mpQuestions.value[idx] || null
  })

  // ==================== SCORING ====================

  function getComboMultiplier(combo) {
    for (const t of COMBO_THRESHOLDS) {
      if (combo >= t.min) return t.multiplier
    }
    return 1.0
  }

  function getHeartMultiplier(hearts) {
    for (const h of HEART_MULTIPLIERS) {
      if (hearts >= h.min) return h.multiplier
    }
    return 1.0
  }

  function calculatePoints(level, combo, heartSetting = 5) {
    const base = BASE_POINTS[level] || 10
    const comboMult = getComboMultiplier(combo)
    const heartMult = getHeartMultiplier(heartSetting)
    return Math.round(base * comboMult * heartMult)
  }

  function shouldTriggerMiniGame(combo) {
    if (!spState.value) return false
    return combo > 0 && combo === spState.value.nextMiniGameAt
  }

  // ==================== SINGLE PLAYER ====================

  function startSingleGame(level, customQuestions = null) {
    const questions = customQuestions || generateQuestionBatch(level, 100)
    if (questions.length === 0) return false

    spState.value = {
      level,
      questions,
      currentIndex: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      hearts: 5,
      maxHearts: 5,
      totalCorrect: 0,
      totalAnswered: 0,
      isFinished: false,
      showMiniGame: false,
      miniGamePending: false,
      nextMiniGameAt: COMBO_MINI_GAME_FIRST,
      miniGameStep: COMBO_MINI_GAME_STEP_START,
      lastAnswerCorrect: null,
      lastPoints: 0,
    }
    return true
  }

  function spGetCurrentQuestion() {
    if (!spState.value || spState.value.isFinished) return null
    return spState.value.questions[spState.value.currentIndex] || null
  }

  function spSubmitAnswer(choiceIndex) {
    if (!spState.value || spState.value.isFinished) return null
    const st = spState.value
    const question = st.questions[st.currentIndex]
    if (!question) return null

    const isCorrect = choiceIndex === question.correctIndex
    st.totalAnswered++

    if (isCorrect) {
      st.combo++
      st.totalCorrect++
      if (st.combo > st.maxCombo) st.maxCombo = st.combo
      const points = calculatePoints(st.level, st.combo)
      st.score += points
      st.lastPoints = points
      st.lastAnswerCorrect = true

      if (shouldTriggerMiniGame(st.combo)) {
        st.miniGamePending = true
        st.nextMiniGameAt = st.combo + st.miniGameStep
        st.miniGameStep += COMBO_MINI_GAME_STEP_INC
      }
    } else {
      st.combo = 0
      st.hearts--
      st.lastAnswerCorrect = false
      st.lastPoints = 0

      if (st.hearts <= 0) {
        st.isFinished = true
        return { isCorrect, gameOver: true }
      }
    }

    return { isCorrect, gameOver: false, points: st.lastPoints }
  }

  function spTimeOut() {
    if (!spState.value || spState.value.isFinished) return null
    const st = spState.value
    st.combo = 0
    st.hearts--
    st.totalAnswered++
    st.lastAnswerCorrect = false
    st.lastPoints = 0

    if (st.hearts <= 0) {
      st.isFinished = true
      return { gameOver: true }
    }
    return { gameOver: false }
  }

  function spNextQuestion() {
    if (!spState.value || spState.value.isFinished) return false
    const st = spState.value
    st.currentIndex++
    st.lastAnswerCorrect = null
    st.lastPoints = 0

    if (st.currentIndex >= st.questions.length) {
      const moreQuestions = generateQuestionBatch(st.level, 100)
      st.questions.push(...moreQuestions)
    }
    return true
  }

  function spStartMiniGame() {
    if (!spState.value) return
    spState.value.showMiniGame = true
    spState.value.miniGamePending = false
  }

  function spEndMiniGame(clicks) {
    if (!spState.value) return
    const st = spState.value
    const base = BASE_POINTS[st.level] || 10
    const bonus = Math.round(clicks * (base / 5))
    st.score += bonus
    st.showMiniGame = false
    return bonus
  }

  function endSingleGame() {
    if (spState.value) {
      spState.value.isFinished = true
    }
  }

  // ==================== MULTIPLAYER — ROOM MANAGEMENT ====================

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function createRoom(settings = {}) {
    if (!myId.value) return null
    loading.value = true
    error.value = null

    try {
      const level = settings.level || 'A1'
      const hearts = Math.min(10, Math.max(1, settings.hearts || 5))
      const timerSeconds = Math.min(30, Math.max(5, settings.timerSeconds || 10))

      const roomData = {
        hostId: myId.value,
        roomCode: generateRoomCode(),
        status: 'waiting',
        settings: { level, hearts, timerSeconds },
        players: {
          [myId.value]: {
            displayName: myDisplayName.value,
            photoURL: myPhotoURL.value,
            hearts,
            score: 0,
            combo: 0,
            maxCombo: 0,
            totalCorrect: 0,
            totalAnswered: 0,
            questionIndex: 0,
            isAlive: true,
            isReady: false,
            lastAnswer: null,
          }
        },
        eliminationLog: [],
        winner: null,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, COLLECTION), roomData)
      roomId.value = docRef.id
      listenToRoom(docRef.id)
      return docRef.id
    } catch (err) {
      console.error('Error creating room:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function joinRoom(code) {
    if (!myId.value) return null
    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, COLLECTION),
        where('roomCode', '==', code.toUpperCase()),
        where('status', '==', 'waiting'),
        limit(1)
      )

      const { getDocs } = await import('firebase/firestore')
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        error.value = 'ไม่พบห้องนี้ หรือเกมเริ่มไปแล้ว'
        return null
      }

      const roomDoc = snapshot.docs[0]
      const roomData = roomDoc.data()

      const playerIds = Object.keys(roomData.players || {})
      if (playerIds.length >= 30) {
        error.value = 'ห้องเต็มแล้ว'
        return null
      }
      if (playerIds.includes(myId.value)) {
        roomId.value = roomDoc.id
        listenToRoom(roomDoc.id)
        return roomDoc.id
      }

      const hearts = roomData.settings?.hearts || 5

      const updatedPlayers = { ...(roomData.players || {}) }
      updatedPlayers[myId.value] = {
        displayName: myDisplayName.value,
        photoURL: myPhotoURL.value,
        hearts,
        score: 0,
        combo: 0,
        maxCombo: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        questionIndex: 0,
        isAlive: true,
        isReady: false,
        lastAnswer: null,
      }

      await updateDoc(doc(db, COLLECTION, roomDoc.id), { players: updatedPlayers })

      roomId.value = roomDoc.id
      listenToRoom(roomDoc.id)
      return roomDoc.id
    } catch (err) {
      console.error('Error joining room:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function leaveRoom() {
    if (!roomId.value || !myId.value) return

    try {
      const roomRef = doc(db, COLLECTION, roomId.value)
      const roomSnap = await getDoc(roomRef)
      if (!roomSnap.exists()) return

      const roomData = roomSnap.data()

      if (roomData.hostId === myId.value) {
        await deleteDoc(roomRef)
      } else {
        const updatedPlayers = { ...(roomData.players || {}) }
        delete updatedPlayers[myId.value]
        await updateDoc(roomRef, { players: updatedPlayers })
      }
    } catch (err) {
      console.error('Error leaving room:', err)
    } finally {
      cleanup()
    }
  }

  async function toggleReady() {
    if (!roomId.value || !myId.value || !room.value) return
    const current = room.value.players?.[myId.value]?.isReady || false
    try {
      const players = clonePlayers({ [myId.value]: { isReady: !current } })
      await updateDoc(doc(db, COLLECTION, roomId.value), { players })
    } catch (err) {
      console.error('Error toggling ready:', err)
    }
  }

  async function updateSettings(settings) {
    if (!roomId.value || !isHost.value) return
    try {
      await updateDoc(doc(db, COLLECTION, roomId.value), {
        'settings.level': settings.level || room.value?.settings?.level,
        'settings.hearts': Math.min(10, Math.max(1, settings.hearts || room.value?.settings?.hearts || 5)),
        'settings.timerSeconds': Math.min(30, Math.max(5, settings.timerSeconds || room.value?.settings?.timerSeconds || 10)),
      })
    } catch (err) {
      console.error('Error updating settings:', err)
    }
  }

  // ==================== MULTIPLAYER — GAMEPLAY ====================

  function clonePlayers(overrides = {}) {
    const base = JSON.parse(JSON.stringify(room.value?.players || {}))
    if (mpPendingMyData.value && myId.value && base[myId.value]) {
      Object.assign(base[myId.value], mpPendingMyData.value)
    }
    for (const [pid, updates] of Object.entries(overrides)) {
      if (base[pid]) {
        Object.assign(base[pid], updates)
      }
    }
    return base
  }

  async function startGame() {
    if (!roomId.value || !isHost.value || !room.value) return
    const settings = room.value.settings
    const questions = generateQuestionBatch(settings.level, 100)
    if (questions.length === 0) return

    mpQuestions.value = questions

    const players = JSON.parse(JSON.stringify(room.value.players || {}))
    for (const pid of Object.keys(players)) {
      players[pid].hearts = settings.hearts
      players[pid].score = 0
      players[pid].combo = 0
      players[pid].maxCombo = 0
      players[pid].totalCorrect = 0
      players[pid].totalAnswered = 0
      players[pid].questionIndex = 0
      players[pid].isAlive = true
      players[pid].lastAnswer = null
    }

    try {
      await updateDoc(doc(db, COLLECTION, roomId.value), {
        status: 'playing',
        eliminationLog: [],
        winner: null,
        _questionsBatch: JSON.stringify(questions),
        players,
      })
    } catch (err) {
      console.error('Error starting game:', err)
    }
  }

  async function submitMultiAnswer(isCorrect, localQIndex) {
    if (!roomId.value || !myId.value || !room.value) return null
    const me = room.value.players?.[myId.value]
    if (!me || !me.isAlive) return null

    const currentCombo = me.combo || 0
    const newCombo = isCorrect ? currentCombo + 1 : 0
    const nextIdx = localQIndex + 1

    const myUpdate = {
      lastAnswer: isCorrect ? 1 : -1,
      totalAnswered: (me.totalAnswered || 0) + 1,
      questionIndex: nextIdx,
    }

    if (isCorrect) {
      const points = calculatePoints(
        room.value.settings.level,
        newCombo,
        room.value.settings.hearts
      )
      myUpdate.combo = newCombo
      myUpdate.totalCorrect = (me.totalCorrect || 0) + 1
      myUpdate.score = (me.score || 0) + points
      if (newCombo > (me.maxCombo || 0)) {
        myUpdate.maxCombo = newCombo
      }
    } else {
      const newHearts = (me.hearts || 1) - 1
      myUpdate.combo = 0
      myUpdate.hearts = newHearts
      if (newHearts <= 0) {
        myUpdate.isAlive = false
      }
    }

    mpPendingMyData.value = { ...(mpPendingMyData.value || {}), ...myUpdate }

    try {
      const players = clonePlayers({ [myId.value]: myUpdate })

      if (nextIdx >= mpQuestions.value.length - 10) {
        const more = generateQuestionBatch(room.value.settings.level, 100)
        mpQuestions.value.push(...more)
        await updateDoc(doc(db, COLLECTION, roomId.value), {
          players,
          _questionsBatch: JSON.stringify(mpQuestions.value),
        })
      } else {
        await updateDoc(doc(db, COLLECTION, roomId.value), { players })
      }

      mpPendingMyData.value = null

      await checkGameOver(players)

      return { isCorrect, points: isCorrect ? myUpdate.score - (me.score || 0) : 0 }
    } catch (err) {
      console.error('Error submitting answer:', err)
      mpPendingMyData.value = null
      return null
    }
  }

  async function multiTimeOut(localQIndex) {
    if (!roomId.value || !myId.value || !room.value) return
    const me = room.value.players?.[myId.value]
    if (!me || !me.isAlive) return

    const newHearts = (me.hearts || 1) - 1
    const nextIdx = localQIndex + 1

    const myUpdate = {
      lastAnswer: -1,
      combo: 0,
      hearts: newHearts,
      totalAnswered: (me.totalAnswered || 0) + 1,
      questionIndex: nextIdx,
    }

    if (newHearts <= 0) {
      myUpdate.isAlive = false
    }

    mpPendingMyData.value = { ...(mpPendingMyData.value || {}), ...myUpdate }

    try {
      const players = clonePlayers({ [myId.value]: myUpdate })

      if (nextIdx >= mpQuestions.value.length - 10) {
        const more = generateQuestionBatch(room.value.settings.level, 100)
        mpQuestions.value.push(...more)
        await updateDoc(doc(db, COLLECTION, roomId.value), {
          players,
          _questionsBatch: JSON.stringify(mpQuestions.value),
        })
      } else {
        await updateDoc(doc(db, COLLECTION, roomId.value), { players })
      }

      mpPendingMyData.value = null

      await checkGameOver(players)
    } catch (err) {
      console.error('Error handling timeout:', err)
      mpPendingMyData.value = null
    }
  }

  async function mpEndMiniGame(clicks) {
    if (!roomId.value || !myId.value || !room.value) return 0
    const me = room.value.players?.[myId.value]
    if (!me) return 0

    const base = BASE_POINTS[room.value.settings?.level] || 10
    const bonus = Math.round(clicks * (base / 5))

    try {
      const players = clonePlayers({
        [myId.value]: { score: (me.score || 0) + bonus }
      })
      await updateDoc(doc(db, COLLECTION, roomId.value), { players })
      return bonus
    } catch (err) {
      console.error('Error ending mini game:', err)
      return 0
    }
  }

  async function checkGameOver(updatedPlayers) {
    if (!roomId.value) return

    const alive = Object.entries(updatedPlayers || {})
      .filter(([, p]) => p.isAlive)

    if (alive.length <= 1) {
      const winner = alive.length === 1 ? alive[0][0] : null
      try {
        await updateDoc(doc(db, COLLECTION, roomId.value), {
          status: 'finished',
          winner,
        })
      } catch (err) {
        console.error('Error checking game over:', err)
      }
    }
  }

  function loadQuestionBatch() {
    if (!room.value?._questionsBatch) return
    try {
      mpQuestions.value = JSON.parse(room.value._questionsBatch)
    } catch {
      mpQuestions.value = []
    }
  }

  // ==================== LISTENERS ====================

  function listenToRoom(id) {
    stopListening()
    unsubRoom = onSnapshot(doc(db, COLLECTION, id), (snap) => {
      if (snap.exists()) {
        room.value = { id: snap.id, ...snap.data() }
      } else {
        room.value = null
        roomId.value = null
      }
    })
  }

  function stopListening() {
    if (unsubRoom) {
      unsubRoom()
      unsubRoom = null
    }
  }

  // ==================== WRONG WORDS (localStorage) ====================

  const WRONG_WORDS_KEY = 'vb-wrong-words'

  const wrongWords = ref(loadWrongWordsFromStorage())

  function loadWrongWordsFromStorage() {
    try {
      const data = localStorage.getItem(WRONG_WORDS_KEY)
      return data ? JSON.parse(data) : []
    } catch { return [] }
  }

  function saveWrongWordsToStorage() {
    try {
      localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(wrongWords.value))
    } catch { /* quota exceeded etc. */ }
  }

  function addWrongWord({ en, th, level }) {
    const idx = wrongWords.value.findIndex(w => w.en === en && w.th === th)
    if (idx >= 0) {
      wrongWords.value[idx].wrongCount = (wrongWords.value[idx].wrongCount || 1) + 1
      wrongWords.value[idx].lastWrong = Date.now()
    } else {
      wrongWords.value.push({
        en, th, level: level || '?',
        wrongCount: 1,
        lastWrong: Date.now(),
      })
    }
    saveWrongWordsToStorage()
  }

  function removeWrongWord(en, th) {
    wrongWords.value = wrongWords.value.filter(w => !(w.en === en && w.th === th))
    saveWrongWordsToStorage()
  }

  function clearAllWrongWords() {
    wrongWords.value = []
    saveWrongWordsToStorage()
  }

  // ==================== CLEANUP ====================

  function cleanup() {
    stopListening()
    room.value = null
    roomId.value = null
    spState.value = null
    mpQuestions.value = []
    mpPendingMyData.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    room,
    roomId,
    loading,
    error,
    spState,
    mpQuestions,

    // Computed
    myId,
    myDisplayName,
    myPhotoURL,
    isHost,
    playerCount,
    alivePlayers,
    isGameActive,
    myPlayerData,
    myCurrentQuestion,

    // Scoring
    calculatePoints,
    getComboMultiplier,
    getHeartMultiplier,
    shouldTriggerMiniGame,

    // Single Player
    startSingleGame,
    spGetCurrentQuestion,
    spSubmitAnswer,
    spTimeOut,
    spNextQuestion,
    spStartMiniGame,
    spEndMiniGame,
    endSingleGame,

    // Multiplayer Room
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    updateSettings,

    // Multiplayer Gameplay
    startGame,
    submitMultiAnswer,
    multiTimeOut,
    mpEndMiniGame,
    loadQuestionBatch,

    // Wrong Words
    wrongWords,
    addWrongWord,
    removeWrongWord,
    clearAllWrongWords,

    // General
    cleanup,
  }
})
