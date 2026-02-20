import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection, doc, addDoc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'
import { readingPassages, READING_LEVELS, generateReadingBlock } from 'src/data/readingCEFR'
import { listeningScripts, LISTENING_LEVELS, generateListeningBlock } from 'src/data/listeningCEFR'

const SECTION_TIME = 25 * 60
const START_LEVEL_IDX = 2 // B1
const PASS_RATIO = 0.75
const FAIL_RATIO = 0.34

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

export const useCefrTestStore = defineStore('cefrTest', () => {
  const authStore = useAuthStore()

  const testState = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const elevenLabsApiKey = ref(localStorage.getItem('elevenLabsApiKey') || 'cc9da416583fc911e552caba1b586e47a1d9350282459baac25d5f9df0b73b14')
  const audioCache = {}
  const currentAudio = ref(null)
  const audioPlaying = ref(false)

  let timerInterval = null

  const myId = computed(() => authStore.user?.email || '')

  // ==================== ELEVENLABS TTS ====================

  function setApiKey(key) {
    elevenLabsApiKey.value = key
    localStorage.setItem('elevenLabsApiKey', key)
  }

  async function generateSpeech(text, voiceConfig = {}) {
    const apiKey = elevenLabsApiKey.value
    if (!apiKey) throw new Error('ElevenLabs API key not set')

    const cacheKey = `${text.length}-${text.substring(0, 80)}`
    if (audioCache[cacheKey]) return audioCache[cacheKey]

    const voiceId = voiceConfig.voiceId || DEFAULT_VOICE_ID

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: voiceConfig.stability ?? 0.5,
          similarity_boost: voiceConfig.similarity_boost ?? 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`ElevenLabs API ${res.status}: ${body}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    audioCache[cacheKey] = url
    return url
  }

  async function playAudio(url) {
    stopAudio()
    return new Promise((resolve, reject) => {
      const audio = new Audio(url)
      currentAudio.value = audio
      audioPlaying.value = true
      audio.onended = () => { audioPlaying.value = false; resolve() }
      audio.onerror = (e) => { audioPlaying.value = false; reject(e) }
      audio.play().catch(reject)
    })
  }

  function stopAudio() {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value = null
    }
    audioPlaying.value = false
  }

  // ==================== TIMER ====================

  function _startTimer() {
    _stopTimer()
    timerInterval = setInterval(() => {
      const st = testState.value
      if (!st) { _stopTimer(); return }

      if (st.currentSection === 'reading') {
        st.readingTimeLeft = Math.max(0, st.readingTimeLeft - 1)
        if (st.readingTimeLeft <= 0) _finishSection('reading')
      } else if (st.currentSection === 'listening') {
        st.listeningTimeLeft = Math.max(0, st.listeningTimeLeft - 1)
        if (st.listeningTimeLeft <= 0) _finishSection('listening')
      }
    }, 1000)
  }

  function _stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  }

  // ==================== TEST LIFECYCLE ====================

  function _makeReadingState(usedIds, firstBlock) {
    return {
      currentLevelIdx: START_LEVEL_IDX,
      currentBlock: firstBlock?.passage || null,
      currentQuestionIdx: 0,
      correctInBlock: 0,
      totalBlocks: 0,
      highestPassed: -1,
      usedIds,
      history: [],
      levelBreakdown: {},
    }
  }

  function _makeListeningState() {
    return {
      currentLevelIdx: START_LEVEL_IDX,
      currentBlock: null,
      currentQuestionIdx: 0,
      correctInBlock: 0,
      totalBlocks: 0,
      highestPassed: -1,
      usedIds: new Set(),
      history: [],
      levelBreakdown: {},
      replaysLeft: 0,
      audioUrl: null,
      audioLoading: false,
      audioReady: false,
    }
  }

  function startTest(mode = 'full') {
    if (mode === 'listening') {
      const ls = _makeListeningState()
      const firstBlock = generateListeningBlock(LISTENING_LEVELS[START_LEVEL_IDX], ls.usedIds)
      if (!firstBlock) return false
      ls.usedIds.add(firstBlock.scriptId)
      ls.currentBlock = firstBlock.script
      ls.replaysLeft = firstBlock.script.maxReplays

      testState.value = {
        mode,
        currentSection: 'listening',
        showingFeedback: false,
        lastAnswer: null,
        reading: _makeReadingState(new Set(), null),
        listening: ls,
        readingTimeLeft: SECTION_TIME,
        listeningTimeLeft: SECTION_TIME,
        readingResult: null,
        listeningResult: null,
        overallResult: null,
      }
      _startTimer()
      return true
    }

    const readingUsedIds = new Set()
    const firstBlock = generateReadingBlock(READING_LEVELS[START_LEVEL_IDX], readingUsedIds)
    if (!firstBlock) return false
    readingUsedIds.add(firstBlock.passageId)

    testState.value = {
      mode,
      currentSection: 'reading',
      showingFeedback: false,
      lastAnswer: null,
      reading: _makeReadingState(readingUsedIds, firstBlock),
      listening: _makeListeningState(),
      readingTimeLeft: SECTION_TIME,
      listeningTimeLeft: SECTION_TIME,
      readingResult: null,
      listeningResult: null,
      overallResult: null,
    }

    _startTimer()
    return true
  }

  // ==================== READING ====================

  function submitReadingAnswer(choiceIdx) {
    const st = testState.value
    if (!st || st.currentSection !== 'reading' || st.showingFeedback) return null

    const rd = st.reading
    const passage = rd.currentBlock
    const q = passage.questions[rd.currentQuestionIdx]
    const selected = q.choices[choiceIdx]
    const isCorrect = selected === q.correctAnswer

    if (isCorrect) rd.correctInBlock++

    const level = READING_LEVELS[rd.currentLevelIdx]
    if (!rd.levelBreakdown[level]) rd.levelBreakdown[level] = { total: 0, correct: 0 }
    rd.levelBreakdown[level].total++
    if (isCorrect) rd.levelBreakdown[level].correct++

    rd.history.push({
      level,
      passageId: passage.id,
      passageTitle: passage.title,
      question: q.question,
      selected,
      correctAnswer: q.correctAnswer,
      isCorrect,
    })

    st.lastAnswer = { isCorrect, correctAnswer: q.correctAnswer, selected }
    st.showingFeedback = true
    return st.lastAnswer
  }

  function advanceReading() {
    const st = testState.value
    if (!st || st.currentSection !== 'reading') return

    st.showingFeedback = false
    st.lastAnswer = null

    const rd = st.reading
    rd.currentQuestionIdx++

    if (rd.currentQuestionIdx >= rd.currentBlock.questions.length) {
      _evaluateBlock('reading')
    }
  }

  // ==================== LISTENING ====================

  function startListeningSection() {
    const st = testState.value
    if (!st || st.currentSection !== 'break') return false

    const ls = st.listening
    const firstBlock = generateListeningBlock(LISTENING_LEVELS[START_LEVEL_IDX], ls.usedIds)
    if (!firstBlock) return false

    ls.usedIds.add(firstBlock.scriptId)
    ls.currentBlock = firstBlock.script
    ls.replaysLeft = firstBlock.script.maxReplays
    ls.audioUrl = null
    ls.audioReady = false
    ls.currentQuestionIdx = 0
    ls.correctInBlock = 0

    st.currentSection = 'listening'
    _startTimer()
    return true
  }

  async function loadListeningAudio() {
    const st = testState.value
    if (!st || st.currentSection !== 'listening') return

    const ls = st.listening
    if (ls.audioUrl) return ls.audioUrl

    try {
      ls.audioLoading = true
      error.value = null
      const script = ls.currentBlock

      let url = script.audioUrl
      if (!url) {
        url = await generateSpeech(script.script, script.voiceConfig)
      }

      ls.audioUrl = url
      ls.audioReady = true
      ls.audioLoading = false
      return url
    } catch (e) {
      ls.audioLoading = false
      error.value = e.message
      return null
    }
  }

  async function playListeningAudio() {
    const st = testState.value
    if (!st || st.currentSection !== 'listening') return

    const ls = st.listening
    if (!ls.audioUrl) await loadListeningAudio()
    if (ls.audioUrl) {
      try {
        await playAudio(ls.audioUrl)
      } catch { /* ignore playback errors */ }
    }
  }

  function replayListeningAudio() {
    const st = testState.value
    if (!st || st.currentSection !== 'listening') return false

    const ls = st.listening
    if (ls.replaysLeft <= 0) return false

    ls.replaysLeft--
    playListeningAudio()
    return true
  }

  function submitListeningAnswer(choiceIdx) {
    const st = testState.value
    if (!st || st.currentSection !== 'listening' || st.showingFeedback) return null

    const ls = st.listening
    const script = ls.currentBlock
    const q = script.questions[ls.currentQuestionIdx]
    const selected = q.choices[choiceIdx]
    const isCorrect = selected === q.correctAnswer

    if (isCorrect) ls.correctInBlock++

    const level = LISTENING_LEVELS[ls.currentLevelIdx]
    if (!ls.levelBreakdown[level]) ls.levelBreakdown[level] = { total: 0, correct: 0 }
    ls.levelBreakdown[level].total++
    if (isCorrect) ls.levelBreakdown[level].correct++

    ls.history.push({
      level,
      scriptId: script.id,
      scriptTitle: script.title,
      question: q.question,
      selected,
      correctAnswer: q.correctAnswer,
      isCorrect,
    })

    st.lastAnswer = { isCorrect, correctAnswer: q.correctAnswer, selected }
    st.showingFeedback = true
    return st.lastAnswer
  }

  function advanceListening() {
    const st = testState.value
    if (!st || st.currentSection !== 'listening') return

    st.showingFeedback = false
    st.lastAnswer = null
    stopAudio()

    const ls = st.listening
    ls.currentQuestionIdx++

    if (ls.currentQuestionIdx >= ls.currentBlock.questions.length) {
      _evaluateBlock('listening')
    }
  }

  // ==================== ADAPTIVE ENGINE ====================

  function _evaluateBlock(section) {
    const st = testState.value
    const data = st[section]
    const LEVELS = section === 'reading' ? READING_LEVELS : LISTENING_LEVELS

    const totalQs = data.currentBlock.questions.length
    const accuracy = totalQs > 0 ? data.correctInBlock / totalQs : 0
    data.totalBlocks++

    if (accuracy >= PASS_RATIO) {
      data.highestPassed = Math.max(data.highestPassed, data.currentLevelIdx)
      if (data.currentLevelIdx >= LEVELS.length - 1) {
        _finishSection(section)
        return
      }
      data.currentLevelIdx++
    } else if (accuracy <= FAIL_RATIO) {
      if (data.totalBlocks >= 2 && data.currentLevelIdx <= 0) {
        _finishSection(section)
        return
      }
      if (data.currentLevelIdx > 0) data.currentLevelIdx--
    }

    const generateFn = section === 'reading' ? generateReadingBlock : generateListeningBlock
    const nextBlock = generateFn(LEVELS[data.currentLevelIdx], data.usedIds)

    if (!nextBlock) {
      _finishSection(section)
      return
    }

    if (section === 'reading') {
      data.usedIds.add(nextBlock.passageId)
      data.currentBlock = nextBlock.passage
    } else {
      data.usedIds.add(nextBlock.scriptId)
      data.currentBlock = nextBlock.script
      data.replaysLeft = nextBlock.script.maxReplays
      data.audioUrl = null
      data.audioReady = false
    }

    data.currentQuestionIdx = 0
    data.correctInBlock = 0
  }

  // ==================== FINISH ====================

  function finishSection(section) {
    _finishSection(section)
  }

  function _finishSection(section) {
    _stopTimer()
    stopAudio()
    const st = testState.value
    if (!st) return

    const data = st[section]
    const LEVELS = section === 'reading' ? READING_LEVELS : LISTENING_LEVELS

    if (data.currentBlock && data.currentQuestionIdx > 0 && data.currentQuestionIdx < data.currentBlock.questions.length) {
      const partialAccuracy = data.correctInBlock / data.currentQuestionIdx
      if (partialAccuracy >= PASS_RATIO) {
        data.highestPassed = Math.max(data.highestPassed, data.currentLevelIdx)
      }
    }

    const passedIdx = data.highestPassed
    const passedLevel = passedIdx >= 0 ? LEVELS[passedIdx] : null
    const nextIdx = passedIdx + 1
    const workingTowards = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null

    const totalQs = data.history.length
    const totalCorrect = data.history.filter(h => h.isCorrect).length

    const result = {
      passedLevel,
      passedLevelIdx: passedIdx,
      workingTowards,
      totalQuestions: totalQs,
      totalCorrect,
      accuracy: totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0,
      breakdown: { ...data.levelBreakdown },
    }

    st.showingFeedback = false
    st.lastAnswer = null

    if (section === 'reading') {
      st.readingResult = result
      if (st.mode === 'reading') {
        _calculateOverall()
        st.currentSection = 'finished'
        saveTestResult()
      } else {
        st.currentSection = 'break'
      }
    } else {
      st.listeningResult = result
      _calculateOverall()
      st.currentSection = 'finished'
      saveTestResult()
    }
  }

  function _calculateOverall() {
    const st = testState.value
    const r = st.readingResult
    const l = st.listeningResult

    if (st.mode === 'reading' && r) {
      st.overallResult = {
        passedLevel: r.passedLevel,
        passedLevelIdx: r.passedLevelIdx,
        readingLevel: r.passedLevel,
        listeningLevel: null,
        readingAccuracy: r.accuracy,
        listeningAccuracy: null,
        overallAccuracy: r.accuracy,
      }
      return
    }

    if (st.mode === 'listening' && l) {
      st.overallResult = {
        passedLevel: l.passedLevel,
        passedLevelIdx: l.passedLevelIdx,
        readingLevel: null,
        listeningLevel: l.passedLevel,
        readingAccuracy: null,
        listeningAccuracy: l.accuracy,
        overallAccuracy: l.accuracy,
      }
      return
    }

    if (!r || !l) return

    const avgIdx = Math.round((Math.max(r.passedLevelIdx, 0) + Math.max(l.passedLevelIdx, 0)) / 2)
    const clampedIdx = Math.min(Math.max(avgIdx, 0), READING_LEVELS.length - 1)

    st.overallResult = {
      passedLevel: READING_LEVELS[clampedIdx] || null,
      passedLevelIdx: clampedIdx,
      readingLevel: r.passedLevel,
      listeningLevel: l.passedLevel,
      readingAccuracy: r.accuracy,
      listeningAccuracy: l.accuracy,
      overallAccuracy: Math.round((r.accuracy + l.accuracy) / 2),
    }
  }

  // ==================== FIREBASE ====================

  const cefrTestBest = ref(null)

  async function fetchCefrTestBest() {
    if (!myId.value) return
    try {
      const snap = await getDoc(doc(db, 'profiles', myId.value))
      if (snap.exists()) cefrTestBest.value = snap.data().cefrTestBest || null
    } catch { /* ignore */ }
  }

  async function saveTestResult() {
    const st = testState.value
    if (!st?.overallResult || !myId.value) return

    try {
      const resultDoc = {
        ...st.overallResult,
        mode: st.mode,
        readingBreakdown: st.readingResult?.breakdown || null,
        listeningBreakdown: st.listeningResult?.breakdown || null,
        readingHistory: st.reading.history.length ? st.reading.history : null,
        listeningHistory: st.listening.history.length ? st.listening.history : null,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'profiles', myId.value, 'cefrTestResults'), resultDoc)

      const curr = cefrTestBest.value
      const isFullTest = st.mode === 'full'
      const isNewBest = isFullTest && (!curr ||
        st.overallResult.passedLevelIdx > curr.passedLevelIdx ||
        (st.overallResult.passedLevelIdx === curr.passedLevelIdx &&
          st.overallResult.overallAccuracy > curr.overallAccuracy))

      if (isNewBest) {
        const bestData = {
          passedLevel: st.overallResult.passedLevel,
          passedLevelIdx: st.overallResult.passedLevelIdx,
          readingLevel: st.overallResult.readingLevel,
          listeningLevel: st.overallResult.listeningLevel,
          overallAccuracy: st.overallResult.overallAccuracy,
          testedAt: new Date().toISOString(),
        }
        await updateDoc(doc(db, 'profiles', myId.value), { cefrTestBest: bestData })
        cefrTestBest.value = bestData
      }
    } catch { /* ignore */ }
  }

  // ==================== CLEANUP ====================

  function cleanup() {
    _stopTimer()
    stopAudio()
    Object.values(audioCache).forEach(url => {
      try { URL.revokeObjectURL(url) } catch { /* ignore */ }
    })
    for (const k of Object.keys(audioCache)) delete audioCache[k]
    testState.value = null
    currentAudio.value = null
    audioPlaying.value = false
    loading.value = false
    error.value = null
  }

  return {
    testState, loading, error, audioPlaying,
    elevenLabsApiKey, myId,

    setApiKey,
    startTest,

    submitReadingAnswer, advanceReading,

    startListeningSection,
    loadListeningAudio, playListeningAudio, replayListeningAudio,
    stopAudio,
    submitListeningAnswer, advanceListening,

    finishSection,

    cefrTestBest, fetchCefrTestBest,

    cleanup,
  }
})
