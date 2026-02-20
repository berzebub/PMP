<template>
  <q-page class="ct-page">
    <div class="ct-container">

      <!-- Back Button -->
      <div class="ct-back" @click="handleBack">
        <q-icon name="arrow_back" size="20px" />
        <span>{{ screen === 'intro' ? 'Arcade' : 'กลับ' }}</span>
      </div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Intro                              -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'intro'">
        <div class="ct-hero">
          <div class="ct-hero-icon">
            <q-icon name="quiz" size="36px" />
          </div>
          <div class="ct-hero-title">CEFR Placement Test</div>
          <div class="ct-hero-sub">ทดสอบระดับภาษาอังกฤษ Reading &amp; Listening แบบ Adaptive</div>
        </div>

        <!-- Best result badge -->
        <div v-if="store.cefrTestBest" class="ct-best-card">
          <div class="ct-best-badge" :style="{ '--badge-color': levelColor(store.cefrTestBest.passedLevel) }">
            <div class="ct-best-badge-level">{{ store.cefrTestBest.passedLevel }}</div>
            <div class="ct-best-badge-name">{{ levelName(store.cefrTestBest.passedLevel) }}</div>
          </div>
          <div class="ct-best-details">
            <div class="ct-best-label">ผลสอบดีที่สุด</div>
            <div class="ct-best-row">
              <q-icon name="menu_book" size="14px" color="blue-4" />
              Reading: <strong>{{ store.cefrTestBest.readingLevel || '—' }}</strong>
            </div>
            <div class="ct-best-row">
              <q-icon name="headphones" size="14px" color="purple-4" />
              Listening: <strong>{{ store.cefrTestBest.listeningLevel || '—' }}</strong>
            </div>
            <div class="ct-best-accuracy">Accuracy: {{ store.cefrTestBest.overallAccuracy }}%</div>
          </div>
        </div>

        <!-- Test info cards -->
        <div class="ct-info-grid">
          <div class="ct-info-card">
            <div class="ct-info-icon" style="background: rgba(66,165,245,0.12); color: #42a5f5">
              <q-icon name="menu_book" size="28px" />
            </div>
            <div class="ct-info-title">Reading</div>
            <div class="ct-info-desc">อ่านบทความและตอบคำถาม ปรับระดับอัตโนมัติ</div>
            <div class="ct-info-time">25 นาที</div>
          </div>
          <div class="ct-info-card">
            <div class="ct-info-icon" style="background: rgba(171,71,188,0.12); color: #ab47bc">
              <q-icon name="headphones" size="28px" />
            </div>
            <div class="ct-info-title">Listening</div>
            <div class="ct-info-desc">ฟังเสียงและตอบคำถาม หลากหลายสำเนียง</div>
            <div class="ct-info-time">25 นาที</div>
          </div>
        </div>

        <div class="ct-info-note">
          <q-icon name="info" size="16px" color="grey-6" />
          <span>Adaptive Test ปรับระดับตามคำตอบ &middot; เสียงจริงจาก Native Speaker</span>
        </div>

        <!-- Mode Selection -->
        <div class="ct-mode-grid">
          <button class="ct-mode-card ct-mode-full" @click="handleStartTest('full')">
            <div class="ct-mode-icon">
              <q-icon name="school" size="28px" />
            </div>
            <div class="ct-mode-title">สอบเต็ม</div>
            <div class="ct-mode-desc">Reading + Listening</div>
            <div class="ct-mode-time">50 นาที</div>
          </button>
          <button class="ct-mode-card ct-mode-reading" @click="handleStartTest('reading')">
            <div class="ct-mode-icon">
              <q-icon name="menu_book" size="28px" />
            </div>
            <div class="ct-mode-title">ซ้อม Reading</div>
            <div class="ct-mode-desc">Reading อย่างเดียว</div>
            <div class="ct-mode-time">25 นาที</div>
          </button>
          <button class="ct-mode-card ct-mode-listening" @click="handleStartTest('listening')">
            <div class="ct-mode-icon">
              <q-icon name="headphones" size="28px" />
            </div>
            <div class="ct-mode-title">ซ้อม Listening</div>
            <div class="ct-mode-desc">Listening อย่างเดียว</div>
            <div class="ct-mode-time">25 นาที</div>
          </button>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Reading                            -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'reading'">
        <div class="ct-test-header">
          <div class="ct-section-badge ct-section-reading">
            <q-icon name="menu_book" size="16px" />
            <span>Reading</span>
          </div>
          <div class="ct-level-badge" :style="{ background: currentLevelColor + '20', color: currentLevelColor, borderColor: currentLevelColor + '40' }">
            {{ currentLevel }}
          </div>
          <div class="ct-timer" :class="{ 'ct-timer-danger': st.readingTimeLeft <= 60 }">
            <q-icon name="timer" size="16px" />
            {{ formatTime(st.readingTimeLeft) }}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="ct-progress">
          <div class="ct-progress-text">
            Passage {{ st.reading.totalBlocks + 1 }} &middot;
            คำถาม {{ st.reading.currentQuestionIdx + 1 }}/{{ st.reading.currentBlock.questions.length }}
          </div>
          <div class="ct-progress-bar">
            <div
              class="ct-progress-fill"
              :style="{ width: readingProgress + '%', background: currentLevelColor }"
            />
          </div>
        </div>

        <!-- Passage -->
        <div class="ct-passage-card">
          <div class="ct-passage-title">{{ st.reading.currentBlock.title }}</div>
          <div class="ct-passage-text">{{ st.reading.currentBlock.passage }}</div>
        </div>

        <!-- Question -->
        <div class="ct-question-card">
          <div class="ct-question-text">
            {{ currentReadingQuestion.question }}
          </div>
          <div class="ct-choices">
            <button
              v-for="(choice, idx) in currentReadingQuestion.choices"
              :key="idx"
              class="ct-choice-btn"
              :class="{
                'ct-choice-correct': st.showingFeedback && choice === st.lastAnswer?.correctAnswer,
                'ct-choice-wrong': st.showingFeedback && choice === st.lastAnswer?.selected && !st.lastAnswer?.isCorrect,
                'ct-choice-disabled': st.showingFeedback,
              }"
              :disabled="st.showingFeedback"
              @click="handleReadingAnswer(idx)"
            >
              <span class="ct-choice-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="ct-choice-text">{{ choice }}</span>
            </button>
          </div>

          <!-- Feedback -->
          <transition name="ct-fade">
            <div v-if="st.showingFeedback" class="ct-feedback" :class="st.lastAnswer?.isCorrect ? 'ct-feedback-correct' : 'ct-feedback-wrong'">
              <q-icon :name="st.lastAnswer?.isCorrect ? 'check_circle' : 'cancel'" size="20px" />
              {{ st.lastAnswer?.isCorrect ? 'ถูกต้อง!' : 'ไม่ถูกต้อง' }}
            </div>
          </transition>

          <button v-if="st.showingFeedback" class="ct-next-btn" @click="handleAdvanceReading">
            ถัดไป
            <q-icon name="arrow_forward" size="18px" />
          </button>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Break                              -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'break'">
        <div class="ct-break">
          <div class="ct-break-icon">
            <q-icon name="check_circle" size="48px" color="green-4" />
          </div>
          <div class="ct-break-title">Reading Section เสร็จสิ้น!</div>

          <div v-if="st.readingResult" class="ct-break-result">
            <div class="ct-break-level" :style="{ color: levelColor(st.readingResult.passedLevel) }">
              {{ st.readingResult.passedLevel || 'Pre-A1' }}
            </div>
            <div class="ct-break-accuracy">Accuracy: {{ st.readingResult.accuracy }}%</div>
            <div class="ct-break-detail">
              {{ st.readingResult.totalCorrect }}/{{ st.readingResult.totalQuestions }} ข้อถูก
            </div>
          </div>

          <div class="ct-break-next">
            <q-icon name="headphones" size="24px" color="purple-4" />
            <div>
              <div class="ct-break-next-title">Listening Section</div>
              <div class="ct-break-next-sub">25 นาที &middot; ฟังเสียงและตอบคำถาม</div>
            </div>
          </div>

          <button class="ct-start-btn" @click="handleStartListening">
            <q-icon name="play_arrow" size="22px" />
            <span>เริ่ม Listening</span>
          </button>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Listening                          -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'listening'">
        <div class="ct-test-header">
          <div class="ct-section-badge ct-section-listening">
            <q-icon name="headphones" size="16px" />
            <span>Listening</span>
          </div>
          <div class="ct-level-badge" :style="{ background: currentLevelColor + '20', color: currentLevelColor, borderColor: currentLevelColor + '40' }">
            {{ currentLevel }}
          </div>
          <div class="ct-timer" :class="{ 'ct-timer-danger': st.listeningTimeLeft <= 60 }">
            <q-icon name="timer" size="16px" />
            {{ formatTime(st.listeningTimeLeft) }}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="ct-progress">
          <div class="ct-progress-text">
            Audio {{ st.listening.totalBlocks + 1 }} &middot;
            คำถาม {{ st.listening.currentQuestionIdx + 1 }}/{{ st.listening.currentBlock.questions.length }}
          </div>
          <div class="ct-progress-bar">
            <div
              class="ct-progress-fill"
              :style="{ width: listeningProgress + '%', background: currentLevelColor }"
            />
          </div>
        </div>

        <!-- Audio Player -->
        <div class="ct-audio-card">
          <div class="ct-audio-title">{{ st.listening.currentBlock.title }}</div>
          <div class="ct-audio-type">{{ st.listening.currentBlock.type }}</div>

          <div class="ct-audio-controls">
            <button
              v-if="!st.listening.audioReady"
              class="ct-audio-play-btn"
              :disabled="st.listening.audioLoading"
              @click="handlePlayAudio"
            >
              <q-spinner-dots v-if="st.listening.audioLoading" size="20px" color="white" />
              <template v-else>
                <q-icon name="play_circle" size="24px" />
                <span>สร้างเสียงและเล่น</span>
              </template>
            </button>

            <template v-else>
              <button class="ct-audio-play-btn ct-audio-play-btn-ready" @click="handlePlayAudio">
                <q-icon :name="store.audioPlaying ? 'pause_circle' : 'play_circle'" size="24px" />
                <span>{{ store.audioPlaying ? 'กำลังเล่น...' : 'เล่นอีกครั้ง' }}</span>
              </button>
              <div class="ct-audio-replays">
                <q-icon name="replay" size="14px" />
                เล่นซ้ำได้อีก {{ st.listening.replaysLeft }} ครั้ง
              </div>
            </template>
          </div>

          <div v-if="store.error" class="ct-audio-error">
            <q-icon name="error" size="14px" />
            {{ store.error }}
          </div>
        </div>

        <!-- Question -->
        <div class="ct-question-card">
          <div class="ct-question-text">
            {{ currentListeningQuestion.question }}
          </div>
          <div class="ct-choices">
            <button
              v-for="(choice, idx) in currentListeningQuestion.choices"
              :key="idx"
              class="ct-choice-btn"
              :class="{
                'ct-choice-correct': st.showingFeedback && choice === st.lastAnswer?.correctAnswer,
                'ct-choice-wrong': st.showingFeedback && choice === st.lastAnswer?.selected && !st.lastAnswer?.isCorrect,
                'ct-choice-disabled': st.showingFeedback,
              }"
              :disabled="st.showingFeedback"
              @click="handleListeningAnswer(idx)"
            >
              <span class="ct-choice-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="ct-choice-text">{{ choice }}</span>
            </button>
          </div>

          <transition name="ct-fade">
            <div v-if="st.showingFeedback" class="ct-feedback" :class="st.lastAnswer?.isCorrect ? 'ct-feedback-correct' : 'ct-feedback-wrong'">
              <q-icon :name="st.lastAnswer?.isCorrect ? 'check_circle' : 'cancel'" size="20px" />
              {{ st.lastAnswer?.isCorrect ? 'ถูกต้อง!' : 'ไม่ถูกต้อง' }}
            </div>
          </transition>

          <button v-if="st.showingFeedback" class="ct-next-btn" @click="handleAdvanceListening">
            ถัดไป
            <q-icon name="arrow_forward" size="18px" />
          </button>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Result                             -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'result'">
        <div class="ct-result">
          <div class="ct-result-header">
            {{ st.mode === 'reading' ? 'READING LEVEL' : st.mode === 'listening' ? 'LISTENING LEVEL' : 'YOUR CEFR LEVEL' }}
          </div>
          <div v-if="st.mode !== 'full'" class="ct-result-mode-badge">
            {{ st.mode === 'reading' ? 'ซ้อม Reading' : 'ซ้อม Listening' }}
          </div>

          <!-- Overall badge -->
          <div v-if="st.overallResult" class="ct-result-badge" :style="{ '--badge-color': levelColor(st.overallResult.passedLevel) }">
            <div class="ct-result-badge-level">{{ st.overallResult.passedLevel || 'Pre-A1' }}</div>
            <div class="ct-result-badge-name">{{ levelName(st.overallResult.passedLevel) }}</div>
          </div>

          <!-- Section results -->
          <div class="ct-result-sections" :class="{ 'ct-result-sections-single': st.mode !== 'full' }">
            <div v-if="st.mode !== 'listening'" class="ct-result-section-card">
              <div class="ct-result-section-icon" style="background: rgba(66,165,245,0.12); color: #42a5f5">
                <q-icon name="menu_book" size="22px" />
              </div>
              <div class="ct-result-section-title">Reading</div>
              <div class="ct-result-section-level" :style="{ color: levelColor(st.readingResult?.passedLevel) }">
                {{ st.readingResult?.passedLevel || 'Pre-A1' }}
              </div>
              <div class="ct-result-section-accuracy">{{ st.readingResult?.accuracy }}%</div>
              <div class="ct-result-section-detail">
                {{ st.readingResult?.totalCorrect }}/{{ st.readingResult?.totalQuestions }}
              </div>
            </div>
            <div v-if="st.mode !== 'reading'" class="ct-result-section-card">
              <div class="ct-result-section-icon" style="background: rgba(171,71,188,0.12); color: #ab47bc">
                <q-icon name="headphones" size="22px" />
              </div>
              <div class="ct-result-section-title">Listening</div>
              <div class="ct-result-section-level" :style="{ color: levelColor(st.listeningResult?.passedLevel) }">
                {{ st.listeningResult?.passedLevel || 'Pre-A1' }}
              </div>
              <div class="ct-result-section-accuracy">{{ st.listeningResult?.accuracy }}%</div>
              <div class="ct-result-section-detail">
                {{ st.listeningResult?.totalCorrect }}/{{ st.listeningResult?.totalQuestions }}
              </div>
            </div>
          </div>

          <!-- Level bar -->
          <div class="ct-result-level-bar">
            <div
              v-for="(lv, idx) in LEVELS"
              :key="lv"
              class="ct-result-level-seg"
              :class="{
                'ct-result-level-passed': st.overallResult && idx <= st.overallResult.passedLevelIdx,
                'ct-result-level-current': st.overallResult && idx === st.overallResult.passedLevelIdx,
              }"
              :style="{ '--seg-color': levelColor(lv) }"
            >
              <div class="ct-result-level-fill" />
              <span>{{ lv }}</span>
            </div>
          </div>

          <!-- Breakdown -->
          <div v-if="st.readingResult?.breakdown && st.mode !== 'listening'" class="ct-breakdown">
            <div class="ct-breakdown-title">Reading Breakdown</div>
            <div v-for="lv in Object.keys(st.readingResult.breakdown)" :key="'r-'+lv" class="ct-breakdown-row">
              <span class="ct-breakdown-level" :style="{ color: levelColor(lv) }">{{ lv }}</span>
              <div class="ct-breakdown-bar-track">
                <div
                  class="ct-breakdown-bar-fill"
                  :style="{
                    width: (st.readingResult.breakdown[lv].correct / st.readingResult.breakdown[lv].total * 100) + '%',
                    background: levelColor(lv),
                  }"
                />
              </div>
              <span class="ct-breakdown-score">{{ st.readingResult.breakdown[lv].correct }}/{{ st.readingResult.breakdown[lv].total }}</span>
            </div>
          </div>

          <div v-if="st.listeningResult?.breakdown && st.mode !== 'reading'" class="ct-breakdown">
            <div class="ct-breakdown-title">Listening Breakdown</div>
            <div v-for="lv in Object.keys(st.listeningResult.breakdown)" :key="'l-'+lv" class="ct-breakdown-row">
              <span class="ct-breakdown-level" :style="{ color: levelColor(lv) }">{{ lv }}</span>
              <div class="ct-breakdown-bar-track">
                <div
                  class="ct-breakdown-bar-fill"
                  :style="{
                    width: (st.listeningResult.breakdown[lv].correct / st.listeningResult.breakdown[lv].total * 100) + '%',
                    background: levelColor(lv),
                  }"
                />
              </div>
              <span class="ct-breakdown-score">{{ st.listeningResult.breakdown[lv].correct }}/{{ st.listeningResult.breakdown[lv].total }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="ct-result-actions">
            <button class="ct-start-btn" @click="handleRetake">
              <q-icon name="refresh" size="20px" />
              <span>ทดสอบอีกครั้ง</span>
            </button>
            <button class="ct-ghost-btn" @click="$router.push('/games')">
              <q-icon name="arrow_back" size="18px" />
              <span>กลับ Arcade</span>
            </button>
          </div>
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCefrTestStore } from 'src/stores/cefrTest'
import { READING_LEVELS, READING_LEVEL_META } from 'src/data/readingCEFR'
import { LISTENING_LEVEL_META } from 'src/data/listeningCEFR'

const router = useRouter()
const store = useCefrTestStore()

const screen = ref('intro')

const LEVELS = READING_LEVELS
const LEVEL_COLORS = {
  A1: '#66bb6a', A2: '#42a5f5', B1: '#ffa726',
  B2: '#ef5350', C1: '#ab47bc', C2: '#ec407a',
}

const st = computed(() => store.testState)

const currentLevel = computed(() => {
  if (!st.value) return 'B1'
  const section = st.value.currentSection
  if (section === 'reading') return READING_LEVELS[st.value.reading.currentLevelIdx]
  if (section === 'listening') return READING_LEVELS[st.value.listening.currentLevelIdx]
  return 'B1'
})

const currentLevelColor = computed(() => LEVEL_COLORS[currentLevel.value] || '#ffa726')

const currentReadingQuestion = computed(() => {
  if (!st.value?.reading?.currentBlock) return {}
  return st.value.reading.currentBlock.questions[st.value.reading.currentQuestionIdx] || {}
})

const currentListeningQuestion = computed(() => {
  if (!st.value?.listening?.currentBlock) return {}
  return st.value.listening.currentBlock.questions[st.value.listening.currentQuestionIdx] || {}
})

const readingProgress = computed(() => {
  if (!st.value?.reading?.currentBlock) return 0
  const rd = st.value.reading
  const totalQ = rd.currentBlock.questions.length
  return totalQ > 0 ? Math.round((rd.currentQuestionIdx / totalQ) * 100) : 0
})

const listeningProgress = computed(() => {
  if (!st.value?.listening?.currentBlock) return 0
  const ls = st.value.listening
  const totalQ = ls.currentBlock.questions.length
  return totalQ > 0 ? Math.round((ls.currentQuestionIdx / totalQ) * 100) : 0
})

function levelColor(level) { return LEVEL_COLORS[level] || '#9e9fa3' }

function levelName(level) {
  return READING_LEVEL_META[level]?.name || LISTENING_LEVEL_META[level]?.name || ''
}

function formatTime(seconds) {
  if (seconds == null) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function handleBack() {
  if (screen.value === 'intro') {
    router.push('/games')
  } else if (screen.value === 'reading' || screen.value === 'listening') {
    if (confirm('ออกจากการสอบ? ผลสอบจะไม่ถูกบันทึก')) {
      store.cleanup()
      screen.value = 'intro'
    }
  } else if (screen.value === 'break') {
    screen.value = 'intro'
    store.cleanup()
  } else {
    screen.value = 'intro'
  }
}

function handleStartTest(mode = 'full') {
  const ok = store.startTest(mode)
  if (!ok) return
  if (mode === 'listening') {
    screen.value = 'listening'
    store.loadListeningAudio()
  } else {
    screen.value = 'reading'
  }
}

function handleReadingAnswer(idx) {
  store.submitReadingAnswer(idx)
}

function handleAdvanceReading() {
  store.advanceReading()
  if (st.value?.currentSection === 'finished') {
    screen.value = 'result'
  } else if (st.value?.currentSection === 'break') {
    screen.value = 'break'
  }
}

function handleStartListening() {
  const ok = store.startListeningSection()
  if (ok) {
    screen.value = 'listening'
    store.loadListeningAudio()
  }
}

async function handlePlayAudio() {
  if (!st.value?.listening?.audioReady) {
    await store.loadListeningAudio()
    if (st.value?.listening?.audioReady) {
      store.playListeningAudio()
    }
  } else if (st.value.listening.replaysLeft > 0 || store.audioPlaying) {
    if (store.audioPlaying) {
      store.stopAudio()
    } else {
      store.replayListeningAudio()
    }
  }
}

function handleListeningAnswer(idx) {
  store.submitListeningAnswer(idx)
}

function handleAdvanceListening() {
  store.advanceListening()
  if (st.value?.currentSection === 'finished') {
    screen.value = 'result'
  } else if (st.value?.currentSection === 'listening') {
    const ls = st.value.listening
    if (ls.currentQuestionIdx === 0 && !ls.audioReady) {
      store.loadListeningAudio()
    }
  }
}

function handleRetake() {
  store.cleanup()
  screen.value = 'intro'
}

watch(() => st.value?.currentSection, (section) => {
  if (section === 'finished' && screen.value !== 'result') screen.value = 'result'
  else if (section === 'break' && screen.value !== 'break') screen.value = 'break'
})

onMounted(() => {
  store.fetchCefrTestBest()
})

onBeforeUnmount(() => {
  store.cleanup()
})
</script>

<style scoped>
.ct-page { padding: 20px; min-height: 100vh; }
.ct-container { max-width: 720px; margin: 0 auto; position: relative; }
.ct-back { display: flex; align-items: center; gap: 6px; color: #6b6c6f; font-size: 0.82rem; cursor: pointer; margin-bottom: 20px; transition: color 0.15s; width: fit-content; }
.ct-back:hover { color: #e0e1e4; }

/* Hero */
.ct-hero { text-align: center; margin-bottom: 28px; }
.ct-hero-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(92,107,192,0.12); color: #5c6bc0; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid rgba(92,107,192,0.2); box-shadow: 0 0 24px rgba(92,107,192,0.12); animation: ct-float 3s ease-in-out infinite alternate; }
@keyframes ct-float { from { transform: translateY(0); } to { transform: translateY(-4px); } }
.ct-hero-title { font-size: 2rem; font-weight: 900; color: #fff; text-shadow: 0 2px 16px rgba(92,107,192,0.2); letter-spacing: 0.02em; }
.ct-hero-sub { font-size: 0.85rem; color: #9e9fa3; margin-top: 6px; }

/* Best card */
.ct-best-card { display: flex; align-items: center; gap: 20px; padding: 18px 22px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border-radius: 16px; border: 1px solid rgba(92,107,192,0.15); margin-bottom: 20px; }
.ct-best-badge { width: 72px; height: 72px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15,15,25,0.6); border: 2px solid var(--badge-color); box-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 20%, transparent); flex-shrink: 0; }
.ct-best-badge-level { font-size: 1.6rem; font-weight: 900; color: var(--badge-color); line-height: 1; }
.ct-best-badge-name { font-size: 0.55rem; font-weight: 700; color: #9e9fa3; margin-top: 2px; }
.ct-best-details { flex: 1; }
.ct-best-label { font-size: 0.72rem; color: #6b6c6f; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
.ct-best-row { font-size: 0.8rem; color: #b0b1b4; display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.ct-best-row strong { color: #fff; }
.ct-best-accuracy { font-size: 0.75rem; color: #66bb6a; font-weight: 700; margin-top: 4px; }

/* Info grid */
.ct-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.ct-info-card { background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(35,36,42,0.95)); border-radius: 16px; padding: 22px; border: 1px solid rgba(80,80,110,0.2); text-align: center; transition: all 0.2s; }
.ct-info-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.ct-info-title { font-size: 1.05rem; font-weight: 800; color: #fff; }
.ct-info-desc { font-size: 0.72rem; color: #9e9fa3; margin-top: 6px; line-height: 1.45; }
.ct-info-time { font-size: 0.68rem; font-weight: 700; color: #5c6bc0; background: rgba(92,107,192,0.1); padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 10px; border: 1px solid rgba(92,107,192,0.15); }

.ct-info-note { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #6b6c6f; margin-bottom: 20px; padding: 10px 14px; background: rgba(15,15,25,0.4); border-radius: 10px; border: 1px solid rgba(80,80,110,0.1); }

/* Mode selection */
.ct-mode-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px; }
.ct-mode-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 14px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(35,36,42,0.95)); border: 2px solid rgba(80,80,110,0.2); cursor: pointer; text-align: left; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); color: #e0e1e4; }
.ct-mode-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
.ct-mode-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ct-mode-title { font-size: 1rem; font-weight: 800; color: #fff; }
.ct-mode-desc { font-size: 0.72rem; color: #9e9fa3; margin-top: 2px; }
.ct-mode-time { font-size: 0.65rem; font-weight: 700; padding: 3px 10px; border-radius: 16px; display: inline-block; margin-top: 4px; }
.ct-mode-full { border-color: rgba(92,107,192,0.3); }
.ct-mode-full:hover { border-color: rgba(92,107,192,0.6); }
.ct-mode-full .ct-mode-icon { background: rgba(92,107,192,0.12); color: #5c6bc0; }
.ct-mode-full .ct-mode-time { background: rgba(92,107,192,0.12); color: #5c6bc0; border: 1px solid rgba(92,107,192,0.15); }
.ct-mode-reading { border-color: rgba(66,165,245,0.2); }
.ct-mode-reading:hover { border-color: rgba(66,165,245,0.5); }
.ct-mode-reading .ct-mode-icon { background: rgba(66,165,245,0.12); color: #42a5f5; }
.ct-mode-reading .ct-mode-time { background: rgba(66,165,245,0.1); color: #42a5f5; border: 1px solid rgba(66,165,245,0.15); }
.ct-mode-listening { border-color: rgba(171,71,188,0.2); }
.ct-mode-listening:hover { border-color: rgba(171,71,188,0.5); }
.ct-mode-listening .ct-mode-icon { background: rgba(171,71,188,0.12); color: #ab47bc; }
.ct-mode-listening .ct-mode-time { background: rgba(171,71,188,0.1); color: #ab47bc; border: 1px solid rgba(171,71,188,0.15); }

/* Start button */
.ct-start-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; border: none; border-radius: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #5c6bc0, #3f51b5); color: #fff; box-shadow: 0 4px 20px rgba(92,107,192,0.3); transition: all 0.2s; }
.ct-start-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(92,107,192,0.4); }
.ct-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ct-ghost-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border: 1px solid rgba(80,80,110,0.3); border-radius: 14px; font-size: 0.88rem; font-weight: 600; cursor: pointer; background: transparent; color: #9e9fa3; transition: all 0.15s; }
.ct-ghost-btn:hover { color: #e0e1e4; border-color: rgba(92,107,192,0.3); }

/* Test header */
.ct-test-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.ct-section-badge { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 800; }
.ct-section-reading { background: rgba(66,165,245,0.12); color: #42a5f5; border: 1px solid rgba(66,165,245,0.2); }
.ct-section-listening { background: rgba(171,71,188,0.12); color: #ab47bc; border: 1px solid rgba(171,71,188,0.2); }
.ct-level-badge { padding: 5px 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 900; border: 1.5px solid; letter-spacing: 0.04em; }
.ct-timer { display: flex; align-items: center; gap: 5px; margin-left: auto; font-size: 0.92rem; font-weight: 800; color: #e0e1e4; font-variant-numeric: tabular-nums; background: rgba(15,15,25,0.5); padding: 6px 14px; border-radius: 10px; border: 1px solid rgba(80,80,110,0.15); }
.ct-timer-danger { color: #ef5350; border-color: rgba(239,83,80,0.3); background: rgba(239,83,80,0.08); animation: ct-timer-blink 1s infinite; }
@keyframes ct-timer-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

/* Progress */
.ct-progress { margin-bottom: 16px; }
.ct-progress-text { font-size: 0.72rem; color: #6b6c6f; font-weight: 600; margin-bottom: 6px; }
.ct-progress-bar { height: 4px; background: rgba(20,20,30,0.6); border-radius: 2px; overflow: hidden; }
.ct-progress-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }

/* Passage */
.ct-passage-card { background: linear-gradient(145deg, rgba(25,25,38,0.95), rgba(35,36,42,0.95)); border-radius: 16px; padding: 22px; border: 1px solid rgba(66,165,245,0.12); margin-bottom: 16px; }
.ct-passage-title { font-size: 0.95rem; font-weight: 800; color: #42a5f5; margin-bottom: 12px; }
.ct-passage-text { font-size: 0.92rem; color: #d0d1d4; line-height: 1.75; white-space: pre-wrap; }

/* Audio */
.ct-audio-card { background: linear-gradient(145deg, rgba(25,25,38,0.95), rgba(35,36,42,0.95)); border-radius: 16px; padding: 22px; border: 1px solid rgba(171,71,188,0.12); margin-bottom: 16px; text-align: center; }
.ct-audio-title { font-size: 0.95rem; font-weight: 800; color: #ab47bc; margin-bottom: 4px; }
.ct-audio-type { font-size: 0.7rem; color: #6b6c6f; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
.ct-audio-controls { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.ct-audio-play-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #ab47bc, #8e24aa); color: #fff; box-shadow: 0 4px 16px rgba(171,71,188,0.3); transition: all 0.2s; }
.ct-audio-play-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(171,71,188,0.4); }
.ct-audio-play-btn:disabled { opacity: 0.5; cursor: wait; }
.ct-audio-play-btn-ready { background: linear-gradient(135deg, #7e57c2, #5c6bc0); box-shadow: 0 4px 16px rgba(126,87,194,0.3); }
.ct-audio-replays { font-size: 0.72rem; color: #9e9fa3; display: flex; align-items: center; gap: 5px; }
.ct-audio-error { font-size: 0.75rem; color: #ef5350; margin-top: 10px; display: flex; align-items: center; gap: 5px; justify-content: center; }

/* Question */
.ct-question-card { background: rgba(15,15,25,0.5); border-radius: 20px; padding: 24px; border: 1px solid rgba(92,107,192,0.12); position: relative; }
.ct-question-text { font-size: 1.05rem; font-weight: 700; color: #fff; text-align: center; margin-bottom: 20px; line-height: 1.5; }
.ct-choices { display: grid; grid-template-columns: 1fr; gap: 10px; max-width: 560px; margin: 0 auto; }
.ct-choice-btn { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border: 2px solid rgba(80,80,110,0.25); color: #e0e1e4; font-size: 0.88rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); text-align: left; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.ct-choice-btn:hover:not(:disabled) { border-color: rgba(92,107,192,0.5); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(92,107,192,0.1); }
.ct-choice-btn:active:not(:disabled) { transform: translateY(1px); }
.ct-choice-letter { width: 30px; height: 30px; border-radius: 8px; background: rgba(92,107,192,0.12); border: 1px solid rgba(92,107,192,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #7986cb; flex-shrink: 0; }
.ct-choice-text { flex: 1; font-weight: 600; }
.ct-choice-correct { border-color: #66bb6a !important; background: linear-gradient(145deg, rgba(102,187,106,0.15), rgba(102,187,106,0.06)) !important; }
.ct-choice-correct .ct-choice-letter { background: #66bb6a; border-color: #66bb6a; color: #fff; }
.ct-choice-wrong { border-color: #ef5350 !important; background: linear-gradient(145deg, rgba(239,83,80,0.15), rgba(239,83,80,0.06)) !important; }
.ct-choice-wrong .ct-choice-letter { background: #ef5350; border-color: #ef5350; color: #fff; }
.ct-choice-disabled { cursor: not-allowed; opacity: 0.7; }

/* Feedback */
.ct-feedback { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 0.92rem; font-weight: 800; margin-top: 16px; }
.ct-feedback-correct { background: rgba(102,187,106,0.15); color: #66bb6a; border: 1px solid rgba(102,187,106,0.2); }
.ct-feedback-wrong { background: rgba(239,83,80,0.15); color: #ef5350; border: 1px solid rgba(239,83,80,0.2); }
.ct-fade-enter-active, .ct-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.ct-fade-enter-from { opacity: 0; transform: translateY(-6px); }
.ct-fade-leave-to { opacity: 0; transform: translateY(6px); }

.ct-next-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 16px auto 0; padding: 10px 32px; border: none; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #5c6bc0, #3f51b5); color: #fff; box-shadow: 0 4px 16px rgba(92,107,192,0.25); transition: all 0.15s; }
.ct-next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(92,107,192,0.35); }

/* Break */
.ct-break { text-align: center; padding: 40px 0; }
.ct-break-icon { margin-bottom: 16px; }
.ct-break-title { font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 20px; }
.ct-break-result { margin-bottom: 32px; padding: 20px; background: rgba(15,15,25,0.5); border-radius: 16px; border: 1px solid rgba(80,80,110,0.15); }
.ct-break-level { font-size: 2.5rem; font-weight: 900; line-height: 1; }
.ct-break-accuracy { font-size: 0.88rem; color: #66bb6a; font-weight: 700; margin-top: 8px; }
.ct-break-detail { font-size: 0.78rem; color: #9e9fa3; margin-top: 4px; }
.ct-break-next { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border-radius: 14px; border: 1px solid rgba(171,71,188,0.15); margin-bottom: 20px; text-align: left; }
.ct-break-next-title { font-size: 0.95rem; font-weight: 700; color: #fff; }
.ct-break-next-sub { font-size: 0.72rem; color: #9e9fa3; margin-top: 2px; }

/* Result */
.ct-result { text-align: center; padding: 20px 0; }
.ct-result-header { font-size: 0.82rem; font-weight: 700; color: #9e9fa3; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
.ct-result-badge { width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15,15,25,0.6); border: 3px solid var(--badge-color); box-shadow: 0 0 40px color-mix(in srgb, var(--badge-color) 25%, transparent), inset 0 0 30px color-mix(in srgb, var(--badge-color) 10%, transparent); animation: ct-badge-pulse 2.5s ease-in-out infinite alternate; }
@keyframes ct-badge-pulse { from { box-shadow: 0 0 30px color-mix(in srgb, var(--badge-color) 20%, transparent); } to { box-shadow: 0 0 50px color-mix(in srgb, var(--badge-color) 35%, transparent), inset 0 0 40px color-mix(in srgb, var(--badge-color) 15%, transparent); } }
.ct-result-badge-level { font-size: 2.8rem; font-weight: 900; color: var(--badge-color); line-height: 1; text-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 40%, transparent); }
.ct-result-badge-name { font-size: 0.7rem; font-weight: 700; color: #9e9fa3; margin-top: 4px; }

.ct-result-mode-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; color: #9e9fa3; background: rgba(80,80,110,0.15); padding: 4px 14px; border-radius: 16px; border: 1px solid rgba(80,80,110,0.2); margin-bottom: 16px; }

/* Section result cards */
.ct-result-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
.ct-result-sections-single { grid-template-columns: 1fr; max-width: 320px; margin-left: auto; margin-right: auto; margin-bottom: 24px; }
.ct-result-section-card { background: linear-gradient(145deg, rgba(25,25,38,0.9), rgba(35,36,42,0.9)); border-radius: 16px; padding: 20px; border: 1px solid rgba(80,80,110,0.15); text-align: center; }
.ct-result-section-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.ct-result-section-title { font-size: 0.82rem; font-weight: 700; color: #9e9fa3; margin-bottom: 8px; }
.ct-result-section-level { font-size: 1.6rem; font-weight: 900; }
.ct-result-section-accuracy { font-size: 0.82rem; color: #66bb6a; font-weight: 700; margin-top: 4px; }
.ct-result-section-detail { font-size: 0.72rem; color: #6b6c6f; margin-top: 2px; }

/* Level bar */
.ct-result-level-bar { display: flex; gap: 4px; margin-bottom: 24px; }
.ct-result-level-seg { flex: 1; height: 32px; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(30,30,42,0.6); border: 1px solid rgba(80,80,110,0.15); font-size: 0.7rem; font-weight: 800; color: #6b6c6f; transition: all 0.5s; }
.ct-result-level-fill { position: absolute; inset: 0; background: var(--seg-color); opacity: 0; transition: opacity 0.5s; border-radius: 8px; }
.ct-result-level-seg span { position: relative; z-index: 1; }
.ct-result-level-passed { border-color: var(--seg-color); }
.ct-result-level-passed .ct-result-level-fill { opacity: 0.25; }
.ct-result-level-passed span { color: var(--seg-color); }
.ct-result-level-current { box-shadow: 0 0 16px color-mix(in srgb, var(--seg-color) 30%, transparent); transform: scaleY(1.1); }

/* Breakdown */
.ct-breakdown { background: rgba(15,15,25,0.5); border-radius: 16px; padding: 16px 20px; margin-bottom: 16px; border: 1px solid rgba(80,80,110,0.1); text-align: left; }
.ct-breakdown-title { font-size: 0.75rem; font-weight: 700; color: #9e9fa3; margin-bottom: 12px; letter-spacing: 0.06em; }
.ct-breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ct-breakdown-row:last-child { margin-bottom: 0; }
.ct-breakdown-level { font-size: 0.78rem; font-weight: 800; width: 28px; text-align: center; }
.ct-breakdown-bar-track { flex: 1; height: 8px; background: rgba(40,40,55,0.6); border-radius: 4px; overflow: hidden; }
.ct-breakdown-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); min-width: 2px; }
.ct-breakdown-score { font-size: 0.75rem; font-weight: 700; color: #b0b1b4; width: 36px; text-align: right; font-variant-numeric: tabular-nums; }

/* Result actions */
.ct-result-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; max-width: 340px; margin-left: auto; margin-right: auto; }

/* Responsive */
@media (max-width: 600px) {
  .ct-page { padding: 14px; }
  .ct-hero-title { font-size: 1.5rem; }
  .ct-info-grid { grid-template-columns: 1fr; }
  .ct-result-sections { grid-template-columns: 1fr; }
  .ct-result-sections-single { max-width: 100%; }
  .ct-result-badge { width: 120px; height: 120px; }
  .ct-result-badge-level { font-size: 2.2rem; }
  .ct-passage-text { font-size: 0.85rem; }
  .ct-question-text { font-size: 0.95rem; }
}
</style>
