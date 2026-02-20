<template>
  <q-page class="gb-page">
    <div class="gb-container">

      <!-- ====== Back Button ====== -->
      <div class="gb-back" @click="handleBack">
        <q-icon name="arrow_back" size="20px" />
        <span>{{ screen === 'menu' ? 'Arcade' : 'กลับ' }}</span>
      </div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Mode Selection                      -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'menu'">
        <div class="gb-hero">
          <div class="gb-hero-icon">
            <q-icon name="spellcheck" size="36px" />
          </div>
          <div class="gb-hero-title">Grammar Battle</div>
          <div class="gb-hero-sub">ทดสอบ Grammar ภาษาอังกฤษ แบ่งตาม CEFR Level</div>
        </div>

        <div class="gb-mode-grid">
          <div class="gb-mode-card" @click="screen = 'sp-level'">
            <div class="gb-mode-icon" style="background: rgba(102,187,106,0.12); color: #66bb6a">
              <q-icon name="person" size="32px" />
            </div>
            <div class="gb-mode-name">Single Player</div>
            <div class="gb-mode-desc">เล่นคนเดียว ตอบไปเรื่อยๆ จนหมดหัวใจ</div>
          </div>
          <div class="gb-mode-card" @click="screen = 'mp-choice'">
            <div class="gb-mode-icon" style="background: rgba(38,166,154,0.12); color: #26a69a">
              <q-icon name="groups" size="32px" />
            </div>
            <div class="gb-mode-name">Multi Player</div>
            <div class="gb-mode-desc">Battle Royal 2-30 คน ผู้อยู่รอดคนสุดท้ายชนะ!</div>
            <div class="gb-mode-badge">2-30 Players</div>
          </div>
        </div>

        <!-- Review Wrong Grammar Card -->
        <div class="gb-review-card" @click="screen = 'review'">
          <div class="gb-review-card-icon">
            <q-icon name="auto_stories" size="28px" color="orange" />
          </div>
          <div class="gb-review-card-body">
            <div class="gb-review-card-title">ทบทวนข้อผิด</div>
            <div class="gb-review-card-sub">{{ store.wrongGrammar.length }} ข้อที่ต้องทบทวน</div>
          </div>
          <q-icon name="chevron_right" size="22px" color="grey-6" />
        </div>

        <!-- Adaptive CEFR Grammar Test Card -->
        <div class="gb-review-card" @click="startAdaptiveTestHandler">
          <div class="gb-review-card-icon">
            <q-icon name="quiz" size="28px" color="teal-4" />
          </div>
          <div class="gb-review-card-body">
            <div class="gb-review-card-title">ทดสอบระดับ Grammar CEFR</div>
            <div class="gb-review-card-sub">
              <template v-if="store.cefrGrammarBest?.passedLevel">
                ระดับปัจจุบัน: <strong class="gb-cefr-best-inline" :style="{ color: levelColor(store.cefrGrammarBest.passedLevel) }">{{ store.cefrGrammarBest.passedLevel }}</strong>
                · {{ store.cefrGrammarBest.accuracy }}%
              </template>
              <template v-else>Adaptive Test — วัดระดับ Grammar ของคุณ</template>
            </div>
          </div>
          <div v-if="store.cefrGrammarBest?.passedLevel" class="gb-cefr-best-badge" :style="{ background: levelColor(store.cefrGrammarBest.passedLevel) + '20', color: levelColor(store.cefrGrammarBest.passedLevel), borderColor: levelColor(store.cefrGrammarBest.passedLevel) + '40' }">
            {{ store.cefrGrammarBest.passedLevel }}
          </div>
          <q-icon v-else name="chevron_right" size="22px" color="grey-6" />
        </div>

        <!-- Leaderboard -->
        <div class="gb-lb-section">
          <div class="gb-lb-header">
            <q-icon name="emoji_events" size="22px" color="amber" />
            <span>Leaderboard</span>
          </div>

          <div v-if="gameStore.personalBest" class="gb-lb-personal">
            <q-icon name="star" size="16px" color="amber" />
            <span>คะแนนสูงสุดของคุณ: <strong>{{ gameStore.personalBest.score.toLocaleString() }}</strong></span>
          </div>

          <div v-if="gameStore.loading" class="gb-lb-loading">
            <q-spinner-dots size="24px" color="grey-6" />
          </div>
          <div v-else-if="gameStore.leaderboard.length === 0" class="gb-lb-empty">
            <q-icon name="leaderboard" size="32px" color="grey-7" />
            <div>ยังไม่มีคะแนน ลองเล่นเลย!</div>
          </div>
          <div v-else class="gb-lb-list">
            <div
              v-for="(entry, idx) in gameStore.leaderboard"
              :key="entry.id"
              class="gb-lb-item"
              :class="{ 'gb-lb-item-me': entry.userId === store.myId }"
            >
              <div class="gb-lb-rank">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else>#{{ idx + 1 }}</span>
              </div>
              <div class="gb-lb-avatar">
                <img v-if="entry.photoURL" :src="entry.photoURL" />
                <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="gb-lb-name">{{ entry.displayName }}</div>
              <div class="gb-lb-score">{{ entry.score.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: CEFR Level Selection (SP)           -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-level'">
        <div class="gb-section-header">
          <q-icon name="school" size="24px" color="amber" />
          <div>
            <div class="gb-section-title">เลือกระดับ Grammar</div>
            <div class="gb-section-sub">CEFR Level</div>
          </div>
        </div>

        <div class="gb-level-grid">
          <div
            v-for="lvl in levels"
            :key="lvl.id"
            class="gb-level-card"
            @click="startSP(lvl.id)"
          >
            <div class="gb-level-accent" :style="{ background: lvl.color }"></div>
            <div class="gb-level-body">
              <div class="gb-level-top">
                <div class="gb-level-badge" :style="{ background: lvl.color + '20', color: lvl.color }">
                  {{ lvl.id }}
                </div>
                <q-icon :name="lvl.icon" size="20px" :style="{ color: lvl.color }" />
              </div>
              <div class="gb-level-name">{{ lvl.name }}</div>
              <div class="gb-level-count">{{ lvl.questionCount }} ข้อ</div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Create or Join                   -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-choice'">
        <div class="gb-section-header">
          <q-icon name="groups" size="24px" color="teal-4" />
          <div>
            <div class="gb-section-title">Multi Player</div>
            <div class="gb-section-sub">สร้างห้องหรือเข้าร่วมห้อง</div>
          </div>
        </div>

        <div class="gb-mp-actions">
          <div class="gb-mp-action-card" @click="screen = 'mp-create'">
            <q-icon name="add_circle" size="40px" color="green-5" />
            <div class="gb-mp-action-title">สร้างห้อง</div>
            <div class="gb-mp-action-desc">สร้างห้องใหม่และเชิญเพื่อนเข้ามา</div>
          </div>
          <div class="gb-mp-action-card" @click="showJoinDialog = true">
            <q-icon name="login" size="40px" color="blue-5" />
            <div class="gb-mp-action-title">เข้าร่วมห้อง</div>
            <div class="gb-mp-action-desc">ใส่รหัสห้องเพื่อเข้าร่วมเกม</div>
          </div>
        </div>

        <div v-if="showJoinDialog" class="gb-dialog-overlay" @click.self="showJoinDialog = false">
          <div class="gb-dialog">
            <div class="gb-dialog-title">เข้าห้อง</div>
            <div class="gb-dialog-body">
              <label class="gb-dialog-label">รหัสห้อง (4 ตัวอักษร)</label>
              <input
                v-model="joinCode"
                maxlength="4"
                placeholder="ABCD"
                class="gb-dialog-input gb-dialog-input-code"
                @keyup.enter="handleJoinRoom"
              />
              <div v-if="store.error" class="gb-dialog-error">{{ store.error }}</div>
            </div>
            <div class="gb-dialog-actions">
              <button class="gb-dialog-btn gb-dialog-btn-ghost" @click="showJoinDialog = false">ยกเลิก</button>
              <button
                class="gb-dialog-btn gb-dialog-btn-primary"
                :disabled="store.loading || joinCode.length < 4"
                @click="handleJoinRoom"
              >
                <q-spinner-dots v-if="store.loading" size="14px" />
                <span v-else>เข้าร่วม</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Create Room                      -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-create'">
        <div class="gb-section-header">
          <q-icon name="tune" size="24px" color="green-5" />
          <div>
            <div class="gb-section-title">ตั้งค่าห้อง</div>
            <div class="gb-section-sub">กำหนดค่าเกมก่อนสร้างห้อง</div>
          </div>
        </div>

        <div class="gb-settings-card">
          <div class="gb-setting-row">
            <div class="gb-setting-label">
              <q-icon name="school" size="18px" />
              <span>CEFR Level</span>
            </div>
            <div class="gb-setting-chips">
              <button
                v-for="lvl in levels"
                :key="lvl.id"
                class="gb-chip"
                :class="{ 'gb-chip-active': mpSettings.level === lvl.id }"
                :style="mpSettings.level === lvl.id ? { background: lvl.color + '25', color: lvl.color, borderColor: lvl.color + '50' } : {}"
                @click="mpSettings.level = lvl.id"
              >{{ lvl.id }}</button>
            </div>
          </div>

          <div class="gb-setting-row">
            <div class="gb-setting-label">
              <q-icon name="favorite" size="18px" color="red-5" />
              <span>หัวใจ ({{ mpSettings.hearts }})</span>
            </div>
            <q-slider
              v-model="mpSettings.hearts"
              :min="1" :max="10" :step="1"
              color="red-5"
              label
              class="gb-slider"
            />
            <div class="gb-setting-hint">
              น้อย = คะแนนสูง (x{{ getHeartMultiplier(mpSettings.hearts) }})
            </div>
          </div>

          <div class="gb-setting-row">
            <div class="gb-setting-label">
              <q-icon name="timer" size="18px" color="amber" />
              <span>เวลาต่อข้อ ({{ mpSettings.timerSeconds }}s)</span>
            </div>
            <q-slider
              v-model="mpSettings.timerSeconds"
              :min="5" :max="30" :step="1"
              color="amber"
              label
              class="gb-slider"
            />
          </div>

          <q-btn
            label="สร้างห้อง"
            color="green-6"
            icon="add"
            no-caps
            unelevated
            class="gb-btn-full"
            :loading="store.loading"
            @click="handleCreateRoom"
          />
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Lobby                            -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-lobby'">
        <div class="gb-lobby">
          <div class="gb-lobby-header">
            <div class="gb-lobby-code-box">
              <div class="gb-lobby-code-label">รหัสห้อง</div>
              <div class="gb-lobby-code">{{ store.room?.roomCode }}</div>
            </div>
            <div class="gb-lobby-info">
              <div class="gb-lobby-tag">
                <q-icon name="school" size="14px" />
                {{ store.room?.settings?.level }}
              </div>
              <div class="gb-lobby-tag">
                <q-icon name="favorite" size="14px" color="red-5" />
                {{ store.room?.settings?.hearts }}
              </div>
              <div class="gb-lobby-tag">
                <q-icon name="timer" size="14px" />
                {{ store.room?.settings?.timerSeconds }}s
              </div>
            </div>
          </div>

          <div v-if="store.isHost" class="gb-lobby-settings">
            <div class="gb-setting-row">
              <div class="gb-setting-label">
                <q-icon name="school" size="16px" />
                <span>Level</span>
              </div>
              <div class="gb-setting-chips">
                <button
                  v-for="lvl in levels"
                  :key="lvl.id"
                  class="gb-chip gb-chip-sm"
                  :class="{ 'gb-chip-active': store.room?.settings?.level === lvl.id }"
                  :style="store.room?.settings?.level === lvl.id ? { background: lvl.color + '25', color: lvl.color, borderColor: lvl.color + '50' } : {}"
                  @click="store.updateSettings({ level: lvl.id })"
                >{{ lvl.id }}</button>
              </div>
            </div>
            <div class="gb-setting-row">
              <div class="gb-setting-label">
                <q-icon name="favorite" size="16px" color="red-5" />
                <span>Hearts</span>
              </div>
              <q-slider
                :model-value="store.room?.settings?.hearts || 5"
                @update:model-value="v => store.updateSettings({ hearts: v })"
                :min="1" :max="10" :step="1"
                color="red-5" label
                class="gb-slider"
              />
            </div>
            <div class="gb-setting-row">
              <div class="gb-setting-label">
                <q-icon name="timer" size="16px" />
                <span>Timer</span>
              </div>
              <q-slider
                :model-value="store.room?.settings?.timerSeconds || 10"
                @update:model-value="v => store.updateSettings({ timerSeconds: v })"
                :min="5" :max="30" :step="1"
                color="amber" label
                class="gb-slider"
              />
            </div>
          </div>

          <div class="gb-lobby-players-title">
            ผู้เล่น ({{ store.playerCount }}/30)
          </div>
          <div class="gb-lobby-players">
            <div
              v-for="(p, pid) in store.room?.players"
              :key="pid"
              class="gb-lobby-player"
              :class="{ 'gb-lobby-player-ready': p.isReady }"
            >
              <div class="gb-lobby-player-avatar">
                <img v-if="p.photoURL" :src="p.photoURL" />
                <span v-else>{{ (p.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="gb-lobby-player-name">
                {{ p.displayName }}
                <span v-if="pid === store.room?.hostId" class="gb-host-badge">HOST</span>
              </div>
              <div class="gb-lobby-player-status">
                <q-icon
                  :name="p.isReady ? 'check_circle' : 'radio_button_unchecked'"
                  :color="p.isReady ? 'green-5' : 'grey-6'"
                  size="20px"
                />
              </div>
            </div>
          </div>

          <div class="gb-lobby-actions">
            <q-btn
              v-if="!store.isHost"
              :label="store.room?.players?.[store.myId]?.isReady ? 'ยกเลิกพร้อม' : 'พร้อม!'"
              :color="store.room?.players?.[store.myId]?.isReady ? 'grey-7' : 'green-6'"
              :icon="store.room?.players?.[store.myId]?.isReady ? 'cancel' : 'check'"
              no-caps unelevated
              class="gb-btn-full"
              @click="store.toggleReady()"
            />
            <q-btn
              v-if="store.isHost"
              label="เริ่มเกม!"
              color="teal-6"
              icon="play_arrow"
              no-caps unelevated
              class="gb-btn-full"
              :disable="store.playerCount < 2"
              @click="store.startGame()"
            />
            <q-btn
              label="ออกจากห้อง"
              color="red-6"
              icon="logout"
              no-caps flat
              class="gb-btn-full"
              @click="handleLeaveRoom"
            />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Review Wrong Grammar                 -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'review'">
        <div class="gb-section-header">
          <q-icon name="auto_stories" size="24px" color="orange" />
          <div>
            <div class="gb-section-title">ทบทวนข้อผิด</div>
            <div class="gb-section-sub">{{ store.wrongGrammar.length }} ข้อที่ตอบผิด</div>
          </div>
        </div>

        <div v-if="store.wrongGrammar.length === 0" class="gb-review-empty">
          <q-icon name="check_circle" size="56px" color="green-5" />
          <div class="gb-review-empty-title">ไม่มีข้อผิด</div>
          <div class="gb-review-empty-sub">เก่งมาก! ลองเล่นเพิ่มแล้วกลับมาทบทวนนะ</div>
        </div>

        <template v-else>
          <q-btn
            label="ฝึกทบทวน"
            color="orange-7"
            icon="play_arrow"
            no-caps unelevated
            class="gb-btn-full"
            style="margin-bottom: 16px;"
            :disable="filteredWrongGrammar.length < 4"
            @click="startReviewPractice"
          />
          <div v-if="filteredWrongGrammar.length < 4 && filteredWrongGrammar.length > 0" class="gb-review-hint">
            ต้องมีอย่างน้อย 4 ข้อ จึงจะเริ่มฝึกได้
          </div>

          <div class="gb-review-filters">
            <button
              class="gb-chip"
              :class="{ 'gb-chip-active': reviewFilter === 'all' }"
              @click="reviewFilter = 'all'"
            >ทั้งหมด ({{ store.wrongGrammar.length }})</button>
            <button
              v-for="lvl in reviewLevels"
              :key="lvl"
              class="gb-chip"
              :class="{ 'gb-chip-active': reviewFilter === lvl }"
              @click="reviewFilter = lvl"
            >{{ lvl }} ({{ store.wrongGrammar.filter(w => w.level === lvl).length }})</button>
          </div>

          <div class="gb-review-list">
            <div v-for="w in filteredWrongGrammar" :key="w.sentence" class="gb-review-item">
              <div class="gb-review-grammar-info">
                <div class="gb-review-sentence">{{ w.sentence }}</div>
                <div class="gb-review-answer">
                  <q-icon name="check" size="12px" color="green-5" />
                  {{ w.correctAnswer }}
                  <span v-if="w.grammarPoint" class="gb-review-gp">· {{ w.grammarPoint }}</span>
                </div>
              </div>
              <div class="gb-review-meta">
                <span class="gb-review-level-tag" :style="{ background: levelColor(w.level) + '20', color: levelColor(w.level) }">{{ w.level }}</span>
                <span class="gb-review-wrong-count">ผิด {{ w.wrongCount }}x</span>
                <button class="gb-review-remove" @click="store.removeWrongGrammar(w.sentence)">
                  <q-icon name="close" size="14px" />
                </button>
              </div>
            </div>
          </div>

          <q-btn
            label="ล้างทั้งหมด"
            color="red-6"
            icon="delete_sweep"
            no-caps flat
            class="gb-btn-full"
            style="margin-top: 16px;"
            @click="confirmClearWrongGrammar"
          />
        </template>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Single Player Gameplay              -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-game' && store.spState">
        <div class="gb-game">
          <canvas ref="spFxCanvas" class="gb-fx-canvas"></canvas>
          <div class="gb-hud">
            <div class="gb-hud-panel gb-hud-score">
              <q-icon name="stars" size="22px" color="amber" />
              <div class="gb-hud-val">{{ store.spState.score.toLocaleString() }}</div>
            </div>
            <div class="gb-hud-center">
              <div class="gb-game-hearts">
                <q-icon
                  v-for="i in store.spState.maxHearts"
                  :key="i"
                  :name="i <= store.spState.hearts ? 'favorite' : 'favorite_border'"
                  :color="i <= store.spState.hearts ? 'red-5' : 'grey-7'"
                  size="22px"
                  class="gb-heart-icon"
                />
              </div>
              <div class="gb-hud-qnum">Q{{ spQuestionNum + 1 }}</div>
            </div>
            <div class="gb-hud-panel gb-hud-combo" :class="{ 'gb-hud-combo-hot': store.spState.combo >= 5 }">
              <q-icon name="local_fire_department" size="22px" :color="store.spState.combo >= 3 ? 'orange' : 'grey-6'" />
              <div class="gb-hud-val" :class="{ 'gb-combo-hot': store.spState.combo >= 5 }">{{ store.spState.combo }}x</div>
            </div>
          </div>

          <div class="gb-timer">
            <div class="gb-timer-track">
              <div class="gb-timer-fill" :style="{ width: timerPercent + '%', background: timerColor }"></div>
            </div>
            <div class="gb-timer-text" :style="{ color: timerColor }">{{ spTimerRemaining.toFixed(1) }}s</div>
          </div>

          <div v-if="currentSPQuestion && !store.spState.isFinished" class="gb-question-card">
            <div class="gb-question-direction">
              {{ currentSPQuestion.grammarPoint }}
            </div>
            <div class="gb-question-word" :class="{ 'gb-question-sentence': currentSPQuestion.type === 'fill' }">
              <template v-if="currentSPQuestion.type === 'fill'">
                <span v-for="(part, pi) in splitSentence(currentSPQuestion.sentence)" :key="pi"><span v-if="part === '___'" class="gb-blank">______</span><span v-else>{{ part }}</span></span>
              </template>
              <template v-else>{{ currentSPQuestion.sentence }}</template>
            </div>

            <transition name="gb-fade">
              <div
                v-if="spFeedback"
                class="gb-feedback"
                :class="spFeedback === 'correct' ? 'gb-feedback-correct' : 'gb-feedback-wrong'"
              >
                <q-icon :name="spFeedback === 'correct' ? 'check_circle' : 'cancel'" size="28px" />
                <span>{{ spFeedback === 'correct' ? `+${store.spState.lastPoints}` : `ผิด! — ${currentSPQuestion.correctAnswer}` }}</span>
              </div>
            </transition>

            <div class="gb-choices">
              <button
                v-for="(choice, idx) in currentSPQuestion.choices"
                :key="idx"
                class="gb-choice-btn"
                :class="{
                  'gb-choice-correct': spAnswered && idx === currentSPQuestion.correctIndex,
                  'gb-choice-wrong': spAnswered && spSelectedIndex === idx && idx !== currentSPQuestion.correctIndex,
                  'gb-choice-disabled': spAnswered
                }"
                :disabled="spAnswered"
                @click="handleSPAnswer(idx)"
              >
                <span class="gb-choice-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="gb-choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Multi Player Gameplay               -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-game' && store.room">
        <div class="gb-game">
          <canvas ref="mpFxCanvas" class="gb-fx-canvas"></canvas>
          <div class="gb-hud">
            <div class="gb-hud-panel gb-hud-score">
              <q-icon name="stars" size="22px" color="amber" />
              <div class="gb-hud-val">{{ (store.room?.players?.[store.myId]?.score || 0).toLocaleString() }}</div>
            </div>
            <div class="gb-hud-center">
              <div class="gb-game-hearts">
                <q-icon
                  v-for="i in (store.room?.settings?.hearts || 5)"
                  :key="i"
                  :name="i <= mpLocalHearts ? 'favorite' : 'favorite_border'"
                  :color="i <= mpLocalHearts ? 'red-5' : 'grey-7'"
                  size="22px"
                  class="gb-heart-icon"
                />
              </div>
              <div class="gb-hud-qnum">Q{{ mpLocalQIndex + 1 }}</div>
            </div>
            <div class="gb-hud-panel gb-hud-combo" :class="{ 'gb-hud-combo-hot': mpCombo >= 5 }">
              <q-icon name="local_fire_department" size="22px" :color="mpCombo >= 3 ? 'orange' : 'grey-6'" />
              <div class="gb-hud-val" :class="{ 'gb-combo-hot': mpCombo >= 5 }">{{ mpCombo }}x</div>
              <div class="gb-hud-alive">
                <q-icon name="people" size="14px" color="blue-4" />
                <span>{{ store.alivePlayers.length }}</span>
              </div>
            </div>
          </div>

          <div class="gb-timer">
            <div class="gb-timer-track">
              <div class="gb-timer-fill" :style="{ width: timerPercent + '%', background: timerColor }"></div>
            </div>
            <div class="gb-timer-text" :style="{ color: timerColor }">{{ mpTimerRemaining.toFixed(1) }}s</div>
          </div>

          <div v-if="mpLocalHearts <= 0" class="gb-eliminated">
            <q-icon name="sentiment_very_dissatisfied" size="56px" color="red-4" />
            <div class="gb-eliminated-title">คุณถูกคัดออก!</div>
            <div class="gb-eliminated-score">คะแนนรวม: {{ (store.room?.players?.[store.myId]?.score || 0).toLocaleString() }}</div>
          </div>

          <div v-else-if="currentMPQuestion" class="gb-question-card">
            <div class="gb-question-direction">
              {{ currentMPQuestion.grammarPoint }}
            </div>
            <div class="gb-question-word" :class="{ 'gb-question-sentence': currentMPQuestion.type === 'fill' }">
              <template v-if="currentMPQuestion.type === 'fill'">
                <span v-for="(part, pi) in splitSentence(currentMPQuestion.sentence)" :key="pi"><span v-if="part === '___'" class="gb-blank">______</span><span v-else>{{ part }}</span></span>
              </template>
              <template v-else>{{ currentMPQuestion.sentence }}</template>
            </div>

            <transition name="gb-fade">
              <div
                v-if="mpFeedback"
                class="gb-feedback"
                :class="mpFeedback === 'correct' ? 'gb-feedback-correct' : 'gb-feedback-wrong'"
              >
                <q-icon :name="mpFeedback === 'correct' ? 'check_circle' : 'cancel'" size="28px" />
                <span>{{ mpFeedback === 'correct' ? `+${mpLastPoints}` : `ผิด! — ${currentMPQuestion.correctAnswer}` }}</span>
              </div>
            </transition>

            <div class="gb-choices">
              <button
                v-for="(choice, idx) in currentMPQuestion.choices"
                :key="idx"
                class="gb-choice-btn"
                :class="{
                  'gb-choice-correct': mpAnswered && idx === currentMPQuestion.correctIndex,
                  'gb-choice-wrong': mpAnswered && mpSelectedIndex === idx && idx !== currentMPQuestion.correctIndex,
                  'gb-choice-disabled': mpAnswered
                }"
                :disabled="mpAnswered"
                @click="handleMPAnswer(idx)"
              >
                <span class="gb-choice-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="gb-choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>

          <div class="gb-mp-players-bar">
            <div
              v-for="(p, pid) in store.room?.players"
              :key="pid"
              class="gb-mp-player-mini"
              :class="{ 'gb-mp-player-dead': !p.isAlive, 'gb-mp-player-me': pid === store.myId }"
            >
              <div class="gb-mp-player-avatar-sm">
                <img v-if="p.photoURL" :src="p.photoURL" />
                <span v-else>{{ (p.displayName || 'U').charAt(0) }}</span>
              </div>
              <div class="gb-mp-player-info-sm">
                <div class="gb-mp-player-name-sm">{{ p.displayName?.split(' ')[0] }}</div>
                <div class="gb-mp-player-hearts-sm">
                  <q-icon name="favorite" size="10px" color="red-5" />
                  {{ p.hearts || 0 }}
                  <span class="gb-mp-player-score-sm">{{ (p.score || 0).toLocaleString() }}</span>
                </div>
              </div>
              <span class="gb-mp-player-qnum">Q{{ (p.questionIndex || 0) + 1 }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: SP Results                          -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-result'">
        <div class="gb-result">
          <canvas ref="spConfettiCanvas" class="gb-confetti-canvas"></canvas>
          <div class="gb-result-trophy">🏆</div>
          <div class="gb-result-title">Game Over!</div>
          <div class="gb-result-score-wrap">
            <div class="gb-result-score">{{ spFinalScore.toLocaleString() }}</div>
            <div class="gb-result-label">SCORE</div>
          </div>

          <div class="gb-result-stats">
            <div class="gb-result-stat">
              <div class="gb-result-stat-val">{{ spFinalStats.correct }}/{{ spFinalStats.total }}</div>
              <div class="gb-result-stat-label">ตอบถูก</div>
            </div>
            <div class="gb-result-stat">
              <div class="gb-result-stat-val">{{ spFinalStats.maxCombo }}x</div>
              <div class="gb-result-stat-label">Max Combo</div>
            </div>
            <div class="gb-result-stat">
              <div class="gb-result-stat-val">{{ spFinalStats.level }}</div>
              <div class="gb-result-stat-label">Level</div>
            </div>
          </div>

          <div class="gb-result-actions">
            <q-btn label="เล่นอีกครั้ง" color="teal-6" icon="replay" no-caps unelevated class="gb-btn-full" @click="playAgainSP" />
            <q-btn label="กลับเมนู" color="grey-7" icon="home" no-caps flat class="gb-btn-full" @click="backToMenu" />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Results                          -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-result'">
        <div class="gb-result">
          <canvas ref="mpConfettiCanvas" class="gb-confetti-canvas"></canvas>
          <div class="gb-result-icon">{{ mpWinner === store.myId ? '🏆' : '🎮' }}</div>
          <div class="gb-result-title">{{ mpWinner === store.myId ? 'คุณชนะ!' : 'Game Over!' }}</div>

          <div v-if="mpWinner && store.room?.players?.[mpWinner]" class="gb-result-winner">
            <div class="gb-result-winner-avatar">
              <img v-if="store.room.players[mpWinner].photoURL" :src="store.room.players[mpWinner].photoURL" />
              <span v-else>{{ (store.room.players[mpWinner].displayName || 'W').charAt(0) }}</span>
            </div>
            <div class="gb-result-winner-name">{{ store.room.players[mpWinner].displayName }}</div>
            <div class="gb-result-winner-label">ผู้ชนะ</div>
          </div>

          <div class="gb-result-ranking">
            <div
              v-for="(p, idx) in mpRanking"
              :key="p.id"
              class="gb-result-rank-item"
              :class="{ 'gb-result-rank-me': p.id === store.myId }"
            >
              <div class="gb-result-rank-pos">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else>#{{ idx + 1 }}</span>
              </div>
              <div class="gb-result-rank-name">{{ p.displayName }}</div>
              <div class="gb-result-rank-score">{{ (p.score || 0).toLocaleString() }}</div>
            </div>
          </div>

          <div class="gb-result-actions">
            <q-btn label="กลับเมนู" color="grey-7" icon="home" no-caps flat class="gb-btn-full" @click="handleLeaveAndMenu" />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Adaptive CEFR Grammar Test           -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'adaptive-test' && store.adaptiveState">
        <div class="gb-game">
          <canvas ref="adaptiveFxCanvas" class="gb-fx-canvas"></canvas>

          <div class="gb-adaptive-hud">
            <div class="gb-adaptive-hud-progress">
              Q{{ store.adaptiveState.totalQuestions + 1 }}/30
            </div>
            <div class="gb-adaptive-hud-level-badge" :style="{ background: levelColor(GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx]) + '20', color: levelColor(GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx]), borderColor: levelColor(GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx]) + '50' }">
              {{ GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx] }}
            </div>
            <div class="gb-adaptive-hud-accuracy">
              {{ store.adaptiveState.totalQuestions > 0 ? Math.round((store.adaptiveState.totalCorrect / store.adaptiveState.totalQuestions) * 100) : 0 }}%
            </div>
          </div>

          <div class="gb-adaptive-level-bar">
            <div
              v-for="(lvl, idx) in GRAMMAR_LEVELS"
              :key="lvl"
              class="gb-adaptive-level-seg"
              :class="{
                'gb-adaptive-level-seg-active': idx === store.adaptiveState.currentLevelIdx,
                'gb-adaptive-level-seg-passed': idx <= store.adaptiveState.highestPassed,
              }"
              :style="{ '--seg-color': levelColor(lvl) }"
            >
              <div class="gb-adaptive-level-seg-fill"></div>
              <span class="gb-adaptive-level-seg-label">{{ lvl }}</span>
            </div>
          </div>

          <div class="gb-timer">
            <div class="gb-timer-track">
              <div class="gb-timer-fill" :style="{ width: adaptiveTimerPercent + '%', background: adaptiveTimerColor }"></div>
            </div>
            <div class="gb-timer-text" :style="{ color: adaptiveTimerColor }">{{ adaptiveTimerRemaining.toFixed(1) }}s</div>
          </div>

          <div v-if="store.adaptiveState.currentQuestion" class="gb-question-card">
            <div class="gb-question-direction">
              {{ store.adaptiveState.currentQuestion.grammarPoint }}
            </div>
            <div class="gb-question-word" :class="{ 'gb-question-sentence': store.adaptiveState.currentQuestion.type === 'fill' }">
              <template v-if="store.adaptiveState.currentQuestion.type === 'fill'">
                <span v-for="(part, pi) in splitSentence(store.adaptiveState.currentQuestion.sentence)" :key="pi"><span v-if="part === '___'" class="gb-blank">______</span><span v-else>{{ part }}</span></span>
              </template>
              <template v-else>{{ store.adaptiveState.currentQuestion.sentence }}</template>
            </div>

            <transition name="gb-fade">
              <div
                v-if="adaptiveFeedback"
                class="gb-feedback"
                :class="adaptiveFeedback === 'correct' ? 'gb-feedback-correct' : 'gb-feedback-wrong'"
              >
                <q-icon :name="adaptiveFeedback === 'correct' ? 'check_circle' : 'cancel'" size="28px" />
                <span>{{ adaptiveFeedback === 'correct' ? 'ถูกต้อง!' : 'ผิด! — ' + store.adaptiveState.currentQuestion.correctAnswer }}</span>
              </div>
            </transition>

            <div class="gb-choices">
              <button
                v-for="(choice, idx) in store.adaptiveState.currentQuestion.choices"
                :key="idx"
                class="gb-choice-btn"
                :class="{
                  'gb-choice-correct': adaptiveAnswered && idx === store.adaptiveState.currentQuestion.correctIndex,
                  'gb-choice-wrong': adaptiveAnswered && adaptiveSelectedIdx === idx && idx !== store.adaptiveState.currentQuestion.correctIndex,
                  'gb-choice-disabled': adaptiveAnswered
                }"
                :disabled="adaptiveAnswered"
                @click="handleAdaptiveAnswer(idx)"
              >
                <span class="gb-choice-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="gb-choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Adaptive Test Result                  -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'adaptive-result' && adaptiveResult">
        <div class="gb-result">
          <canvas ref="adaptiveConfettiCanvas" class="gb-confetti-canvas"></canvas>

          <div class="gb-adaptive-result-header">ผลการทดสอบ Grammar CEFR</div>

          <div v-if="isAdaptiveNewBest && adaptiveResult.passedLevel" class="gb-adaptive-new-best">
            <q-icon name="celebration" size="18px" />
            New Best!
          </div>
          <div v-else-if="store.cefrGrammarBest?.passedLevel && !isAdaptiveNewBest" class="gb-adaptive-prev-best">
            สูงสุด: <strong :style="{ color: levelColor(store.cefrGrammarBest.passedLevel) }">{{ store.cefrGrammarBest.passedLevel }}</strong> · {{ store.cefrGrammarBest.accuracy }}%
          </div>

          <div class="gb-adaptive-result-badge" :style="{ '--badge-color': adaptiveResult.passedLevel ? levelColor(adaptiveResult.passedLevel) : '#6b6c6f' }">
            <div class="gb-adaptive-result-badge-level">
              {{ adaptiveResult.passedLevel || '—' }}
            </div>
            <div class="gb-adaptive-result-badge-name">
              {{ adaptiveResult.passedLevel ? GRAMMAR_LEVEL_META[adaptiveResult.passedLevel]?.name : 'ยังไม่ผ่าน A1' }}
            </div>
          </div>

          <div v-if="adaptiveResult.workingTowards" class="gb-adaptive-result-towards">
            กำลังพัฒนาสู่ <strong :style="{ color: levelColor(adaptiveResult.workingTowards) }">{{ adaptiveResult.workingTowards }} — {{ GRAMMAR_LEVEL_META[adaptiveResult.workingTowards]?.name }}</strong>
          </div>

          <div class="gb-adaptive-result-bar">
            <div
              v-for="(lvl, idx) in GRAMMAR_LEVELS"
              :key="lvl"
              class="gb-adaptive-result-bar-seg"
              :class="{
                'gb-adaptive-result-bar-passed': idx <= adaptiveResult.passedLevelIdx,
                'gb-adaptive-result-bar-working': idx === adaptiveResult.passedLevelIdx + 1,
              }"
              :style="{ '--seg-color': levelColor(lvl) }"
            >
              <div class="gb-adaptive-result-bar-fill"></div>
              <span>{{ lvl }}</span>
            </div>
          </div>

          <div class="gb-adaptive-stats">
            <div class="gb-adaptive-stat">
              <div class="gb-adaptive-stat-val">{{ adaptiveResult.totalCorrect }}/{{ adaptiveResult.totalQuestions }}</div>
              <div class="gb-adaptive-stat-label">ตอบถูก</div>
            </div>
            <div class="gb-adaptive-stat">
              <div class="gb-adaptive-stat-val">{{ adaptiveResult.accuracy }}%</div>
              <div class="gb-adaptive-stat-label">ความแม่นยำ</div>
            </div>
          </div>

          <div v-if="Object.keys(adaptiveResult.breakdown).length" class="gb-adaptive-breakdown">
            <div class="gb-adaptive-breakdown-title">รายละเอียดแต่ละระดับ</div>
            <div
              v-for="lvl in GRAMMAR_LEVELS.filter(l => adaptiveResult.breakdown[l])"
              :key="lvl"
              class="gb-adaptive-breakdown-row"
            >
              <span class="gb-adaptive-breakdown-level" :style="{ color: levelColor(lvl) }">{{ lvl }}</span>
              <div class="gb-adaptive-breakdown-bar-track">
                <div
                  class="gb-adaptive-breakdown-bar-fill"
                  :style="{ width: (adaptiveResult.breakdown[lvl].total > 0 ? (adaptiveResult.breakdown[lvl].correct / adaptiveResult.breakdown[lvl].total) * 100 : 0) + '%', background: levelColor(lvl) }"
                ></div>
              </div>
              <span class="gb-adaptive-breakdown-score">
                {{ adaptiveResult.breakdown[lvl].correct }}/{{ adaptiveResult.breakdown[lvl].total }}
              </span>
            </div>
          </div>

          <div class="gb-result-actions">
            <q-btn label="ทดสอบอีกครั้ง" color="teal-6" icon="replay" no-caps unelevated class="gb-btn-full" @click="startAdaptiveTestHandler" />
            <q-btn label="กลับเมนู" color="grey-7" icon="home" no-caps flat class="gb-btn-full" @click="backToMenu" />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  OVERLAY: Heart Damage Vignette              -->
      <!-- ═══════════════════════════════════════════ -->
      <div
        v-if="heartDamagePulse || isLowHealth"
        class="gb-heart-vignette"
        :class="{
          'gb-heart-vignette-once': heartDamagePulse && !isLowHealth,
          'gb-heart-vignette-loop': isLowHealth
        }"
        @animationend="heartDamagePulse = false"
      ></div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  OVERLAY: Combo Mini Game                    -->
      <!-- ═══════════════════════════════════════════ -->
      <transition name="gb-fade">
        <div v-if="showMiniGame" class="gb-mini-overlay">
          <div class="gb-mini-content">
            <div class="gb-mini-title">🔥 Bonus Combo!</div>
            <div class="gb-mini-sub">คลิกรัวๆ ให้ได้มากที่สุดใน 10 วินาที!</div>

            <div class="gb-mini-timer">{{ miniGameTimer.toFixed(1) }}s</div>

            <div
              class="gb-mini-physics-wrap"
              :class="{ 'gb-mini-target-active': miniGameActive }"
              @click="miniGameClick($event)"
            >
              <canvas ref="miniGamePhysicsCanvas" class="gb-mini-physics-canvas"></canvas>
              <div class="gb-mini-clicks-overlay">{{ miniGameClicks }}</div>
            </div>

            <div v-if="!miniGameActive && miniGameDone" class="gb-mini-result">
              <div class="gb-mini-result-clicks">{{ miniGameClicks }} คลิก!</div>
              <div class="gb-mini-result-bonus">+{{ miniGameBonus }} คะแนน</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarBattleStore } from 'src/stores/grammarBattle'
import { useGameStore } from 'src/stores/game'
import { grammarByLevel, GRAMMAR_LEVELS, GRAMMAR_LEVEL_META } from 'src/data/grammarCEFR'
import { usePhysicsFX } from 'src/composables/usePhysicsFX'
import { useMiniGamePhysics } from 'src/composables/useMiniGamePhysics'

const router = useRouter()
const store = useGrammarBattleStore()
const gameStore = useGameStore()

const { getHeartMultiplier } = store

// ==================== PHYSICS FX ====================

const spFxCanvas = ref(null)
const mpFxCanvas = ref(null)
const miniGamePhysicsCanvas = ref(null)
const spConfettiCanvas = ref(null)
const mpConfettiCanvas = ref(null)

const spFx = usePhysicsFX()
const mpFx = usePhysicsFX()
const miniPhysics = useMiniGamePhysics()
const confettiFx = usePhysicsFX()

function getGameFxCenter() {
  const canvas = screen.value === 'sp-game' ? spFxCanvas.value : mpFxCanvas.value
  if (!canvas) return { x: 200, y: 200 }
  return { x: canvas.width / 2, y: canvas.height * 0.4 }
}

// ==================== SCREEN STATE ====================

const screen = ref('menu')

// ==================== LEVEL DATA ====================

const levels = computed(() =>
  GRAMMAR_LEVELS.map(id => ({
    id,
    ...GRAMMAR_LEVEL_META[id],
    questionCount: grammarByLevel[id]?.length || 0,
  }))
)

// ==================== HELPER ====================

function splitSentence(sentence) {
  return sentence.split(/(___)/g)
}

// ==================== SP STATE ====================

const spAnswered = ref(false)
const spSelectedIndex = ref(-1)
const spFeedback = ref(null)
const spLastLevel = ref('A1')
let spTimer = null
const spTimerRemaining = ref(10)
const SP_TIMER_BASE = 10
const spQuestionNum = ref(0)

function getSPTimerSeconds() {
  const n = spQuestionNum.value
  const reduced = SP_TIMER_BASE - Math.floor(n / 5) * 0.5
  return Math.max(3, reduced)
}

function getMPTimerSeconds() {
  const base = store.room?.settings?.timerSeconds || 10
  const n = mpLocalQIndex.value
  const reduced = base - Math.floor(n / 5) * 0.5
  return Math.max(3, reduced)
}

const spFinalScore = ref(0)
const spFinalStats = ref({ correct: 0, total: 0, maxCombo: 0, level: '' })

const currentSPQuestion = computed(() => store.spGetCurrentQuestion())

const spTimerMax = ref(10)
const mpTimerMax = ref(10)

const timerPercent = computed(() => {
  if (screen.value === 'sp-game') return (spTimerRemaining.value / spTimerMax.value) * 100
  if (screen.value === 'mp-game') return (mpTimerRemaining.value / mpTimerMax.value) * 100
  return 100
})

const timerColor = computed(() => {
  const pct = timerPercent.value
  if (pct > 50) return '#66bb6a'
  if (pct > 25) return '#ffa726'
  return '#ef5350'
})

// ==================== MP STATE ====================

const mpSettings = ref({ level: 'A1', hearts: 5, timerSeconds: 10 })
const showJoinDialog = ref(false)
const joinCode = ref('')
const mpAnswered = ref(false)
const mpSelectedIndex = ref(-1)
const mpFeedback = ref(null)
const mpLocalQIndex = ref(0)
const mpLocalHearts = ref(5)
let mpTimer = null
const mpTimerRemaining = ref(10)

const mpShuffledQuestion = ref(null)
const mpChoiceMap = ref([0, 1, 2, 3])

function shuffleMPQuestion() {
  const q = (store.mpQuestions && store.mpQuestions.length > 0)
    ? store.mpQuestions[mpLocalQIndex.value] || null
    : null
  if (!q) {
    mpShuffledQuestion.value = null
    return
  }
  const indices = [0, 1, 2, 3]
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  mpChoiceMap.value = indices
  mpShuffledQuestion.value = {
    ...q,
    choices: indices.map(i => q.choices[i]),
    correctIndex: indices.indexOf(q.correctIndex),
  }
}

const currentMPQuestion = computed(() => mpShuffledQuestion.value)

const mpWinner = computed(() => store.room?.winner || null)

const mpRanking = computed(() => {
  if (!store.room?.players) return []
  return Object.entries(store.room.players)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
})

// ==================== MP COMBO / MINI GAME ====================

const mpCombo = ref(0)
const mpLastPoints = ref(0)
const mpNextMiniGameAt = ref(10)
const mpMiniGameStep = ref(15)
const mpMiniGamePending = ref(false)
const mpShowMiniGame = ref(false)

// ==================== HEART DAMAGE EFFECT ====================

const heartDamagePulse = ref(false)

const isLowHealth = computed(() => {
  if (screen.value === 'sp-game' && store.spState) return store.spState.hearts === 1
  if (screen.value === 'mp-game') return mpLocalHearts.value === 1
  return false
})

function triggerHeartDamage() {
  heartDamagePulse.value = false
  requestAnimationFrame(() => { heartDamagePulse.value = true })
}

// ==================== MINI GAME STATE ====================

const showMiniGame = computed(() => store.spState?.showMiniGame || mpShowMiniGame.value)
const miniGameMode = ref('sp')
const miniGameActive = ref(false)
const miniGameDone = ref(false)
const miniGameClicks = ref(0)
const miniGameTimer = ref(10)
const miniGameBonus = ref(0)
let miniGameInterval = null

// ==================== WRONG GRAMMAR HELPER ====================

function resolveWrongData(question) {
  if (!question) return null
  return {
    sentence: question.sentence,
    correctAnswer: question.correctAnswer,
    grammarPoint: question.grammarPoint || '',
  }
}

// ==================== REVIEW STATE ====================

const reviewFilter = ref('all')

const reviewLevels = computed(() => {
  const lvls = new Set(store.wrongGrammar.map(w => w.level))
  return GRAMMAR_LEVELS.filter(l => lvls.has(l))
})

const filteredWrongGrammar = computed(() => {
  const items = store.wrongGrammar
  if (reviewFilter.value === 'all') return [...items].sort((a, b) => b.lastWrong - a.lastWrong)
  return items.filter(w => w.level === reviewFilter.value).sort((a, b) => b.lastWrong - a.lastWrong)
})

function generateReviewQuestions(items) {
  if (items.length < 4) return []
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  const questions = []

  const pool = grammarByLevel[items[0]?.level] || grammarByLevel['A1'] || []

  for (const w of shuffled) {
    const sourceQ = pool.find(q => q.sentence === w.sentence)
    if (!sourceQ) continue

    const others = pool.filter(q => q.sentence !== w.sentence)
    const distractors = others.length >= 3
      ? [...others].sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.correctAnswer)
      : []
    if (distractors.length < 3) continue

    const allChoices = [sourceQ.correctAnswer, ...distractors].sort(() => Math.random() - 0.5)
    questions.push({
      type: sourceQ.type,
      sentence: sourceQ.sentence,
      correctAnswer: sourceQ.correctAnswer,
      choices: allChoices,
      correctIndex: allChoices.indexOf(sourceQ.correctAnswer),
      grammarPoint: sourceQ.grammarPoint,
      relatedVocab: sourceQ.relatedVocab || [],
    })
  }
  return questions
}

function startReviewPractice() {
  const source = reviewFilter.value === 'all'
    ? store.wrongGrammar
    : store.wrongGrammar.filter(w => w.level === reviewFilter.value)
  const questions = generateReviewQuestions(source)
  if (questions.length === 0) return
  spLastLevel.value = 'review'
  const ok = store.startSingleGame('A1', questions)
  if (!ok) return
  spQuestionNum.value = 0
  screen.value = 'sp-game'
  spAnswered.value = false
  spSelectedIndex.value = -1
  spFeedback.value = null
  startSPTimer()
}

function confirmClearWrongGrammar() {
  if (confirm('ล้างข้อผิดทั้งหมด?')) {
    store.clearAllWrongGrammar()
  }
}

function levelColor(lvl) {
  return GRAMMAR_LEVEL_META[lvl]?.color || '#26a69a'
}

// ==================== ADAPTIVE TEST STATE ====================

const adaptiveFxCanvas = ref(null)
const adaptiveConfettiCanvas = ref(null)
const adaptiveFx = usePhysicsFX()
const adaptiveConfetti = usePhysicsFX()

const adaptiveAnswered = ref(false)
const adaptiveSelectedIdx = ref(-1)
const adaptiveFeedback = ref(null)
const adaptiveTimerRemaining = ref(15)
const ADAPTIVE_TIMER = 15
let adaptiveTimer = null

const adaptiveResult = computed(() => store.getAdaptiveResult())

const isAdaptiveNewBest = computed(() => {
  const r = adaptiveResult.value
  const best = store.cefrGrammarBest
  if (!r) return false
  if (!best) return r.passedLevelIdx >= 0
  return r.passedLevelIdx > best.passedLevelIdx ||
    (r.passedLevelIdx === best.passedLevelIdx && r.accuracy > best.accuracy)
})

const adaptiveTimerPercent = computed(() => (adaptiveTimerRemaining.value / ADAPTIVE_TIMER) * 100)
const adaptiveTimerColor = computed(() => {
  const pct = adaptiveTimerPercent.value
  if (pct > 50) return '#66bb6a'
  if (pct > 25) return '#ffa726'
  return '#ef5350'
})

function startAdaptiveTestHandler() {
  const ok = store.startAdaptiveTest()
  if (!ok) return
  screen.value = 'adaptive-test'
  adaptiveAnswered.value = false
  adaptiveSelectedIdx.value = -1
  adaptiveFeedback.value = null
  startAdaptiveTimer()
}

function startAdaptiveTimer() {
  clearAdaptiveTimer()
  adaptiveTimerRemaining.value = ADAPTIVE_TIMER
  const startTime = Date.now()
  adaptiveTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    adaptiveTimerRemaining.value = Math.max(0, ADAPTIVE_TIMER - elapsed)
    if (adaptiveTimerRemaining.value <= 0) {
      clearAdaptiveTimer()
      handleAdaptiveTimeout()
    }
  }, 50)
}

function clearAdaptiveTimer() {
  if (adaptiveTimer) {
    clearInterval(adaptiveTimer)
    adaptiveTimer = null
  }
}

function handleAdaptiveAnswer(idx) {
  if (adaptiveAnswered.value) return
  adaptiveAnswered.value = true
  adaptiveSelectedIdx.value = idx
  clearAdaptiveTimer()

  const result = store.submitAdaptiveAnswer(idx)
  if (!result) return

  adaptiveFeedback.value = result.isCorrect ? 'correct' : 'wrong'

  const center = getAdaptiveFxCenter()
  if (result.isCorrect) {
    adaptiveFx.spawnCorrect(center.x, center.y)
  } else {
    adaptiveFx.spawnWrong(center.x, center.y)
    const q = store.adaptiveState?.currentQuestion
    if (q) {
      const data = resolveWrongData(q)
      if (data) store.addWrongGrammar({ ...data, level: q.level || GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx] })
    }
  }

  setTimeout(() => advanceAdaptiveQuestion(), 1200)
}

function handleAdaptiveTimeout() {
  if (adaptiveAnswered.value) return
  adaptiveAnswered.value = true
  adaptiveSelectedIdx.value = -1
  adaptiveFeedback.value = 'wrong'

  const q = store.adaptiveState?.currentQuestion
  if (q) {
    const data = resolveWrongData(q)
    if (data) store.addWrongGrammar({ ...data, level: q.level || GRAMMAR_LEVELS[store.adaptiveState.currentLevelIdx] })
  }

  store.adaptiveTimeOut()

  const center = getAdaptiveFxCenter()
  adaptiveFx.spawnWrong(center.x, center.y)

  setTimeout(() => advanceAdaptiveQuestion(), 1200)
}

function advanceAdaptiveQuestion() {
  store.adaptiveAdvance()

  if (store.adaptiveState?.isFinished) {
    clearAdaptiveTimer()
    screen.value = 'adaptive-result'
    return
  }

  adaptiveAnswered.value = false
  adaptiveSelectedIdx.value = -1
  adaptiveFeedback.value = null
  startAdaptiveTimer()
}

function getAdaptiveFxCenter() {
  if (adaptiveFxCanvas.value) {
    return { x: adaptiveFxCanvas.value.width / 2, y: adaptiveFxCanvas.value.height * 0.4 }
  }
  return { x: 200, y: 200 }
}

// ==================== HANDLERS ====================

function handleBack() {
  if (screen.value === 'menu') {
    router.push('/games')
  } else if (screen.value === 'sp-game') {
    store.endSingleGame()
    showSPResult()
  } else if (screen.value === 'mp-game' || screen.value === 'mp-lobby') {
    store.leaveRoom()
    screen.value = 'menu'
  } else if (screen.value === 'adaptive-test') {
    clearAdaptiveTimer()
    backToMenu()
  } else if (screen.value === 'sp-result' || screen.value === 'mp-result' || screen.value === 'adaptive-result') {
    backToMenu()
  } else if (screen.value === 'sp-level' || screen.value === 'mp-choice' || screen.value === 'review') {
    screen.value = 'menu'
  } else if (screen.value === 'mp-create') {
    screen.value = 'mp-choice'
  } else {
    screen.value = 'menu'
  }
}

function backToMenu() {
  store.cleanup()
  screen.value = 'menu'
  clearTimers()
  gameStore.fetchLeaderboard('grammar-battle')
  gameStore.fetchPersonalBest('grammar-battle')
  store.fetchCefrGrammarBest()
}

function startSP(level) {
  spLastLevel.value = level
  const ok = store.startSingleGame(level)
  if (!ok) return
  spQuestionNum.value = 0
  screen.value = 'sp-game'
  spAnswered.value = false
  spSelectedIndex.value = -1
  spFeedback.value = null
  startSPTimer()
}

function startSPTimer() {
  clearSPTimer()
  const timerSec = getSPTimerSeconds()
  spTimerMax.value = timerSec
  spTimerRemaining.value = timerSec
  const startTime = Date.now()
  spTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    spTimerRemaining.value = Math.max(0, timerSec - elapsed)
    if (spTimerRemaining.value <= 0) {
      clearSPTimer()
      handleSPTimeout()
    }
  }, 50)
}

function clearSPTimer() {
  if (spTimer) {
    clearInterval(spTimer)
    spTimer = null
  }
}

function handleSPAnswer(idx) {
  if (spAnswered.value) return
  spAnswered.value = true
  spSelectedIndex.value = idx
  clearSPTimer()

  const result = store.spSubmitAnswer(idx)
  if (!result) return

  spFeedback.value = result.isCorrect ? 'correct' : 'wrong'

  const center = getGameFxCenter()
  if (result.isCorrect) {
    spFx.spawnCorrect(center.x, center.y)
  } else {
    spFx.spawnWrong(center.x, center.y)
  }

  if (!result.isCorrect) {
    const data = resolveWrongData(currentSPQuestion.value)
    if (data) store.addWrongGrammar({ ...data, level: spLastLevel.value })
    triggerHeartDamage()
  }

  if (result.gameOver) {
    setTimeout(() => showSPResult(), 1500)
    return
  }

  setTimeout(() => {
    if (store.spState?.miniGamePending) {
      store.spStartMiniGame()
      miniGameMode.value = 'sp'
      startMiniGameTimer()
      return
    }
    advanceSPQuestion()
  }, 1200)
}

function handleSPTimeout() {
  if (spAnswered.value) return
  spAnswered.value = true
  spSelectedIndex.value = -1
  spFeedback.value = 'wrong'
  const center = getGameFxCenter()
  spFx.spawnWrong(center.x, center.y)

  const data = resolveWrongData(currentSPQuestion.value)
  if (data) store.addWrongGrammar({ ...data, level: spLastLevel.value })
  triggerHeartDamage()

  const result = store.spTimeOut()
  if (result?.gameOver) {
    setTimeout(() => showSPResult(), 1500)
    return
  }
  setTimeout(() => advanceSPQuestion(), 1200)
}

function advanceSPQuestion() {
  store.spNextQuestion()
  spQuestionNum.value++
  spAnswered.value = false
  spSelectedIndex.value = -1
  spFeedback.value = null
  startSPTimer()
}

function showSPResult() {
  clearSPTimer()
  const st = store.spState
  if (st) {
    spFinalScore.value = st.score
    spFinalStats.value = {
      correct: st.totalCorrect,
      total: st.totalAnswered,
      maxCombo: st.maxCombo,
      level: st.level,
    }
    gameStore.submitScore('grammar-battle', st.score).then(() => {
      gameStore.fetchLeaderboard('grammar-battle')
    })
  }
  screen.value = 'sp-result'
}

function playAgainSP() {
  startSP(spLastLevel.value)
}

// ── Multi Player ──

async function handleCreateRoom() {
  const id = await store.createRoom(mpSettings.value)
  if (id) screen.value = 'mp-lobby'
}

async function handleJoinRoom() {
  if (joinCode.value.length < 4) return
  const id = await store.joinRoom(joinCode.value.trim())
  if (id) {
    showJoinDialog.value = false
    screen.value = 'mp-lobby'
    joinCode.value = ''
  }
}

function handleLeaveRoom() {
  store.leaveRoom()
  clearMPTimer()
  screen.value = 'menu'
}

function handleLeaveAndMenu() {
  store.leaveRoom()
  backToMenu()
}

function handleMPAnswer(idx) {
  if (mpAnswered.value) return
  mpAnswered.value = true
  mpSelectedIndex.value = idx
  clearMPTimer()

  const question = currentMPQuestion.value
  if (!question) return
  const isCorrect = idx === question.correctIndex

  mpFeedback.value = isCorrect ? 'correct' : 'wrong'

  const center = getGameFxCenter()
  if (isCorrect) {
    mpFx.spawnCorrect(center.x, center.y)
  } else {
    mpFx.spawnWrong(center.x, center.y)
  }

  store.submitMultiAnswer(isCorrect, mpLocalQIndex.value)

  if (isCorrect) {
    mpCombo.value++
    mpLastPoints.value = store.calculatePoints(
      store.room?.settings?.level || 'A1',
      mpCombo.value,
      store.room?.settings?.hearts || 5
    )
    if (mpCombo.value === mpNextMiniGameAt.value) {
      mpMiniGamePending.value = true
      mpNextMiniGameAt.value = mpCombo.value + mpMiniGameStep.value
      mpMiniGameStep.value += 5
    }
  } else {
    mpLastPoints.value = 0
    mpCombo.value = 0
    mpLocalHearts.value--
    const origQ = store.mpQuestions[mpLocalQIndex.value]
    const data = resolveWrongData(origQ)
    if (data) store.addWrongGrammar({ ...data, level: store.room?.settings?.level || 'A1' })
    triggerHeartDamage()
    if (mpLocalHearts.value <= 0) return
  }

  setTimeout(() => {
    if (mpMiniGamePending.value) {
      mpMiniGamePending.value = false
      mpShowMiniGame.value = true
      miniGameMode.value = 'mp'
      startMiniGameTimer()
      return
    }
    advanceMPQuestion()
  }, 1200)
}

function handleMPTimeout() {
  if (mpAnswered.value) return
  mpAnswered.value = true
  mpSelectedIndex.value = -1
  mpFeedback.value = 'wrong'
  const center = getGameFxCenter()
  mpFx.spawnWrong(center.x, center.y)
  mpCombo.value = 0
  mpLocalHearts.value--
  const origQ = store.mpQuestions[mpLocalQIndex.value]
  const data = resolveWrongData(origQ)
  if (data) store.addWrongGrammar({ ...data, level: store.room?.settings?.level || 'A1' })
  triggerHeartDamage()

  store.multiTimeOut(mpLocalQIndex.value)

  if (mpLocalHearts.value <= 0) return

  setTimeout(() => advanceMPQuestion(), 1200)
}

function advanceMPQuestion() {
  mpLocalQIndex.value++
  shuffleMPQuestion()
  mpAnswered.value = false
  mpSelectedIndex.value = -1
  mpFeedback.value = null
  startMPTimer()
}

function startMPTimer() {
  clearMPTimer()
  const timerSec = getMPTimerSeconds()
  mpTimerMax.value = timerSec
  mpTimerRemaining.value = timerSec
  const startTime = Date.now()
  mpTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    mpTimerRemaining.value = Math.max(0, timerSec - elapsed)
    if (mpTimerRemaining.value <= 0) {
      clearMPTimer()
      handleMPTimeout()
    }
  }, 50)
}

function clearMPTimer() {
  if (mpTimer) {
    clearInterval(mpTimer)
    mpTimer = null
  }
}

// ── Mini Game ──

function startMiniGameTimer() {
  miniGameActive.value = true
  miniGameDone.value = false
  miniGameClicks.value = 0
  miniGameTimer.value = 10

  nextTick(() => {
    if (miniGamePhysicsCanvas.value) {
      miniPhysics.init(miniGamePhysicsCanvas.value, 300, 300)
    }
  })

  const startTime = Date.now()

  miniGameInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    miniGameTimer.value = Math.max(0, 10 - elapsed)
    if (miniGameTimer.value <= 0) {
      clearInterval(miniGameInterval)
      miniGameInterval = null
      miniGameActive.value = false
      miniGameDone.value = true

      if (miniGameMode.value === 'mp') {
        store.mpEndMiniGame(miniGameClicks.value).then(bonus => {
          miniGameBonus.value = bonus || 0
        })
      } else {
        miniGameBonus.value = store.spEndMiniGame(miniGameClicks.value) || 0
      }

      setTimeout(() => closeMiniGame(), 1500)
    }
  }, 50)
}

function miniGameClick(event) {
  if (miniGameActive.value) {
    miniGameClicks.value++
    if (miniGamePhysicsCanvas.value && event) {
      const rect = miniGamePhysicsCanvas.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      miniPhysics.spawnBall(x, y)
    }
  }
}

function closeMiniGame() {
  const mode = miniGameMode.value
  miniPhysics.cleanup()
  miniGameDone.value = false
  miniGameClicks.value = 0
  miniGameTimer.value = 10
  miniGameBonus.value = 0
  mpShowMiniGame.value = false

  if (mode === 'mp') {
    advanceMPQuestion()
  } else {
    advanceSPQuestion()
  }
}

function clearTimers() {
  clearSPTimer()
  clearMPTimer()
  clearAdaptiveTimer()
  if (miniGameInterval) {
    clearInterval(miniGameInterval)
    miniGameInterval = null
  }
}

// ==================== WATCHERS ====================

watch(screen, async (newScreen, oldScreen) => {
  if (oldScreen === 'sp-game') spFx.cleanup()
  if (oldScreen === 'mp-game') mpFx.cleanup()
  if (oldScreen === 'adaptive-test') adaptiveFx.cleanup()
  if (oldScreen === 'sp-result' || oldScreen === 'mp-result') confettiFx.cleanup()
  if (oldScreen === 'adaptive-result') adaptiveConfetti.cleanup()

  await nextTick()

  if (newScreen === 'sp-game' && spFxCanvas.value) {
    spFx.init(spFxCanvas.value)
    const el = spFxCanvas.value.parentElement
    if (el) spFx.resize(el.clientWidth, el.clientHeight)
  }
  if (newScreen === 'mp-game' && mpFxCanvas.value) {
    mpFx.init(mpFxCanvas.value)
    const el = mpFxCanvas.value.parentElement
    if (el) mpFx.resize(el.clientWidth, el.clientHeight)
  }
  if (newScreen === 'adaptive-test' && adaptiveFxCanvas.value) {
    adaptiveFx.init(adaptiveFxCanvas.value)
    const el = adaptiveFxCanvas.value.parentElement
    if (el) adaptiveFx.resize(el.clientWidth, el.clientHeight)
  }
  if (newScreen === 'sp-result' && spConfettiCanvas.value) {
    confettiFx.init(spConfettiCanvas.value)
    const el = spConfettiCanvas.value.parentElement
    if (el) {
      confettiFx.resize(el.clientWidth, el.clientHeight)
      confettiFx.spawnConfetti(el.clientWidth, el.clientHeight)
    }
  }
  if (newScreen === 'mp-result' && mpConfettiCanvas.value) {
    confettiFx.init(mpConfettiCanvas.value)
    const el = mpConfettiCanvas.value.parentElement
    if (el) {
      confettiFx.resize(el.clientWidth, el.clientHeight)
      const isWinner = mpWinner.value === store.myId
      confettiFx.spawnConfetti(el.clientWidth, el.clientHeight, {
        palette: isWinner ? ['#FFD740', '#26A69A', '#E040FB', '#FFB74D'] : undefined,
      })
    }
  }
  if (newScreen === 'adaptive-result' && adaptiveConfettiCanvas.value) {
    adaptiveConfetti.init(adaptiveConfettiCanvas.value)
    const el = adaptiveConfettiCanvas.value.parentElement
    if (el) {
      adaptiveConfetti.resize(el.clientWidth, el.clientHeight)
      adaptiveConfetti.spawnConfetti(el.clientWidth, el.clientHeight)
    }
  }
})

watch(() => store.room?.status, (newStatus, oldStatus) => {
  if (newStatus === 'playing' && oldStatus === 'waiting') {
    store.loadQuestionBatch()
    mpLocalQIndex.value = 0
    mpLocalHearts.value = store.room?.settings?.hearts || 5
    mpCombo.value = 0
    mpNextMiniGameAt.value = 10
    mpMiniGameStep.value = 15
    mpMiniGamePending.value = false
    mpShowMiniGame.value = false
    shuffleMPQuestion()
    screen.value = 'mp-game'
    mpAnswered.value = false
    mpSelectedIndex.value = -1
    mpFeedback.value = null
    startMPTimer()
  }
  if (newStatus === 'finished') {
    clearMPTimer()
    screen.value = 'mp-result'
  }
})

watch(() => store.room, (r) => {
  if (r === null && (screen.value === 'mp-lobby' || screen.value === 'mp-game')) {
    screen.value = 'menu'
  }
})

// ==================== LIFECYCLE ====================

function handleResize() {
  if (screen.value === 'sp-game' && spFxCanvas.value) {
    const el = spFxCanvas.value.parentElement
    if (el) spFx.resize(el.clientWidth, el.clientHeight)
  }
  if (screen.value === 'mp-game' && mpFxCanvas.value) {
    const el = mpFxCanvas.value.parentElement
    if (el) mpFx.resize(el.clientWidth, el.clientHeight)
  }
  if (screen.value === 'adaptive-test' && adaptiveFxCanvas.value) {
    const el = adaptiveFxCanvas.value.parentElement
    if (el) adaptiveFx.resize(el.clientWidth, el.clientHeight)
  }
  if ((screen.value === 'sp-result' && spConfettiCanvas.value) ||
      (screen.value === 'mp-result' && mpConfettiCanvas.value)) {
    const canvas = spConfettiCanvas.value || mpConfettiCanvas.value
    const el = canvas?.parentElement
    if (el) confettiFx.resize(el.clientWidth, el.clientHeight)
  }
  if (screen.value === 'adaptive-result' && adaptiveConfettiCanvas.value) {
    const el = adaptiveConfettiCanvas.value.parentElement
    if (el) adaptiveConfetti.resize(el.clientWidth, el.clientHeight)
  }
}

onMounted(() => {
  gameStore.fetchLeaderboard('grammar-battle')
  gameStore.fetchPersonalBest('grammar-battle')
  store.fetchCefrGrammarBest()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('resize', handleResize)
  spFx.cleanup()
  mpFx.cleanup()
  miniPhysics.cleanup()
  confettiFx.cleanup()
  adaptiveFx.cleanup()
  adaptiveConfetti.cleanup()
  if (screen.value === 'mp-lobby' || screen.value === 'mp-game') {
    store.leaveRoom()
  }
  store.cleanup()
})
</script>

<style scoped>
.gb-page { padding: 20px; min-height: 100vh; }
.gb-container { max-width: 700px; margin: 0 auto; position: relative; }
.gb-back { display: flex; align-items: center; gap: 6px; color: #6b6c6f; font-size: 0.82rem; cursor: pointer; margin-bottom: 20px; transition: color 0.15s; width: fit-content; }
.gb-back:hover { color: #e0e1e4; }
.gb-hero { text-align: center; margin-bottom: 36px; }
.gb-hero-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(38,166,154,0.12); color: #26a69a; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid rgba(38,166,154,0.2); box-shadow: 0 0 24px rgba(38,166,154,0.12); animation: gb-hero-float 3s ease-in-out infinite alternate; }
@keyframes gb-hero-float { from { transform: translateY(0); } to { transform: translateY(-4px); } }
.gb-hero-title { font-size: 2rem; font-weight: 900; color: #fff; text-shadow: 0 2px 16px rgba(38,166,154,0.2); letter-spacing: 0.02em; }
.gb-hero-sub { font-size: 0.85rem; color: #9e9fa3; margin-top: 6px; }
.gb-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.gb-mode-card { background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(35,36,42,0.95)); border-radius: 16px; padding: 28px; border: 1px solid rgba(80,80,110,0.2); cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); text-align: center; position: relative; overflow: hidden; }
.gb-mode-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(38,166,154,0.08), transparent 70%); opacity: 0; transition: opacity 0.3s; }
.gb-mode-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.35), 0 0 20px rgba(38,166,154,0.08); border-color: rgba(38,166,154,0.25); }
.gb-mode-card:hover::before { opacity: 1; }
.gb-mode-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; position: relative; z-index: 1; }
.gb-mode-name { font-size: 1.05rem; font-weight: 800; color: #fff; position: relative; z-index: 1; }
.gb-mode-desc { font-size: 0.75rem; color: #9e9fa3; margin-top: 6px; line-height: 1.45; position: relative; z-index: 1; }
.gb-mode-badge { margin-top: 12px; font-size: 0.65rem; background: rgba(38,166,154,0.12); color: #80cbc4; padding: 4px 12px; border-radius: 20px; display: inline-block; font-weight: 700; position: relative; z-index: 1; border: 1px solid rgba(38,166,154,0.15); }
.gb-review-card { display: flex; align-items: center; gap: 14px; margin-top: 16px; padding: 16px 18px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border-radius: 14px; border: 1px solid rgba(255,152,0,0.12); cursor: pointer; transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
.gb-review-card:hover { border-color: rgba(255,152,0,0.3); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
.gb-review-card-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,152,0,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gb-review-card-body { flex: 1; }
.gb-review-card-title { font-size: 0.92rem; font-weight: 700; color: #fff; }
.gb-review-card-sub { font-size: 0.72rem; color: #9e9fa3; margin-top: 2px; }
.gb-lb-section { margin-top: 24px; background: linear-gradient(145deg, rgba(25,25,38,0.9), rgba(35,36,42,0.9)); border-radius: 16px; padding: 18px; border: 1px solid rgba(80,80,110,0.2); }
.gb-lb-header { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 14px; }
.gb-lb-personal { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #b0b1b4; padding: 8px 12px; background: rgba(255,183,77,0.06); border-radius: 10px; border: 1px solid rgba(255,183,77,0.1); margin-bottom: 12px; }
.gb-lb-personal strong { color: #ffb74d; }
.gb-lb-loading { text-align: center; padding: 20px; }
.gb-lb-empty { text-align: center; padding: 20px; color: #6b6c6f; font-size: 0.82rem; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.gb-lb-list { display: flex; flex-direction: column; gap: 4px; }
.gb-lb-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; transition: background 0.15s; }
.gb-lb-item:hover { background: rgba(255,255,255,0.03); }
.gb-lb-item-me { background: rgba(38,166,154,0.08); border: 1px solid rgba(38,166,154,0.12); }
.gb-lb-rank { width: 28px; text-align: center; font-size: 0.88rem; font-weight: 800; color: #6b6c6f; flex-shrink: 0; }
.gb-lb-avatar { width: 32px; height: 32px; border-radius: 50%; background: #2a2b2e; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #9e9fa3; overflow: hidden; flex-shrink: 0; }
.gb-lb-avatar img { width: 100%; height: 100%; object-fit: cover; }
.gb-lb-name { flex: 1; font-size: 0.82rem; font-weight: 600; color: #e0e1e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gb-lb-score { font-size: 0.85rem; font-weight: 800; color: #ffb74d; font-variant-numeric: tabular-nums; }
.gb-review-empty { text-align: center; padding: 48px 20px; background: rgba(15,15,25,0.5); border-radius: 20px; border: 1px solid rgba(102,187,106,0.12); }
.gb-review-empty-title { font-size: 1.2rem; font-weight: 800; color: #66bb6a; margin-top: 12px; }
.gb-review-empty-sub { font-size: 0.82rem; color: #9e9fa3; margin-top: 4px; }
.gb-review-hint { font-size: 0.72rem; color: #ff9800; text-align: center; margin-bottom: 12px; }
.gb-review-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.gb-review-list { display: flex; flex-direction: column; gap: 6px; max-height: 480px; overflow-y: auto; padding-right: 4px; }
.gb-review-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border-radius: 12px; border: 1px solid rgba(80,80,110,0.15); transition: border-color 0.15s; gap: 10px; }
.gb-review-item:hover { border-color: rgba(38,166,154,0.2); }
.gb-review-grammar-info { flex: 1; min-width: 0; }
.gb-review-sentence { font-weight: 700; color: #fff; font-size: 0.85rem; line-height: 1.4; }
.gb-review-answer { font-size: 0.72rem; color: #80cbc4; margin-top: 3px; display: flex; align-items: center; gap: 4px; }
.gb-review-gp { color: #9e9fa3; }
.gb-review-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.gb-review-level-tag { font-size: 0.6rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
.gb-review-wrong-count { font-size: 0.68rem; color: #ef5350; font-weight: 700; }
.gb-review-remove { width: 24px; height: 24px; border-radius: 6px; background: transparent; border: none; color: #6b6c6f; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.gb-review-remove:hover { background: rgba(239,83,80,0.12); color: #ef5350; }
.gb-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.gb-section-title { font-size: 1.1rem; font-weight: 700; color: #e0e1e4; }
.gb-section-sub { font-size: 0.72rem; color: #6b6c6f; }
.gb-level-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.gb-level-card { background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(35,36,42,0.95)); border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.22s cubic-bezier(0.4,0,0.2,1); border: 1px solid rgba(80,80,110,0.2); }
.gb-level-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: rgba(38,166,154,0.2); }
.gb-level-accent { height: 3px; }
.gb-level-body { padding: 14px; }
.gb-level-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.gb-level-badge { font-size: 0.78rem; font-weight: 800; padding: 3px 12px; border-radius: 8px; }
.gb-level-name { font-size: 0.82rem; font-weight: 700; color: #e0e1e4; }
.gb-level-count { font-size: 0.68rem; color: #9e9fa3; margin-top: 2px; }
.gb-mp-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.gb-mp-action-card { background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(35,36,42,0.95)); border-radius: 16px; padding: 28px; border: 1px solid rgba(80,80,110,0.2); cursor: pointer; text-align: center; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.gb-mp-action-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.3); border-color: rgba(38,166,154,0.2); }
.gb-mp-action-title { font-size: 1rem; font-weight: 800; color: #fff; margin-top: 12px; }
.gb-mp-action-desc { font-size: 0.72rem; color: #9e9fa3; margin-top: 6px; }
.gb-dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; }
.gb-dialog { background: #2a2b30; border-radius: 16px; padding: 24px; min-width: 320px; border: 1px solid rgba(58,59,62,0.4); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
.gb-dialog-title { font-size: 1rem; font-weight: 700; color: #e0e1e4; margin-bottom: 16px; }
.gb-dialog-body { display: flex; flex-direction: column; gap: 10px; }
.gb-dialog-label { font-size: 0.75rem; color: #9e9fa3; }
.gb-dialog-input { width: 100%; padding: 8px 12px; background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.5); border-radius: 8px; color: #e0e1e4; font-size: 0.85rem; outline: none; box-sizing: border-box; }
.gb-dialog-input:focus { border-color: #26a69a; }
.gb-dialog-input-code { text-align: center; font-size: 1.4rem; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; }
.gb-dialog-error { font-size: 0.72rem; color: #ef5350; }
.gb-dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.gb-dialog-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.gb-dialog-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.gb-dialog-btn-primary { background: linear-gradient(135deg, #26a69a, #00897b); color: #fff; box-shadow: 0 4px 16px rgba(38,166,154,0.3); }
.gb-dialog-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(38,166,154,0.4); }
.gb-dialog-btn-ghost { background: transparent; color: #9e9fa3; padding: 8px 16px; }
.gb-dialog-btn-ghost:hover { color: #e0e1e4; }
.gb-settings-card { background: linear-gradient(145deg, rgba(25,25,38,0.9), rgba(35,36,42,0.9)); border-radius: 16px; padding: 22px; border: 1px solid rgba(80,80,110,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.gb-setting-row { margin-bottom: 16px; }
.gb-setting-label { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: #9e9fa3; margin-bottom: 8px; }
.gb-setting-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.gb-chip { padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(58,59,62,0.4); background: transparent; color: #6b6c6f; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.gb-chip:hover { background: rgba(58,59,62,0.25); color: #9e9fa3; }
.gb-chip-active { border-color: #26a69a; color: #26a69a; background: rgba(38,166,154,0.12); }
.gb-chip-sm { padding: 3px 10px; font-size: 0.68rem; }
.gb-setting-hint { font-size: 0.68rem; color: #6b6c6f; margin-top: 4px; }
.gb-slider { padding: 0 4px; }
.gb-btn-full { width: 100%; margin-top: 8px; }
.gb-lobby { background: linear-gradient(145deg, rgba(25,25,38,0.9), rgba(35,36,42,0.9)); border-radius: 16px; padding: 22px; border: 1px solid rgba(80,80,110,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.gb-lobby-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(58,59,62,0.2); }
.gb-lobby-code-label { font-size: 0.68rem; color: #6b6c6f; }
.gb-lobby-code { font-size: 1.8rem; font-weight: 800; color: #26a69a; letter-spacing: 4px; font-family: monospace; }
.gb-lobby-info { display: flex; gap: 8px; flex-wrap: wrap; }
.gb-lobby-tag { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #9e9fa3; background: rgba(58,59,62,0.25); padding: 4px 10px; border-radius: 20px; }
.gb-lobby-settings { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(58,59,62,0.2); }
.gb-lobby-players-title { font-size: 0.82rem; font-weight: 600; color: #9e9fa3; margin-bottom: 10px; }
.gb-lobby-players { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.gb-lobby-player { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; transition: background 0.15s; }
.gb-lobby-player:hover { background: rgba(58,59,62,0.2); }
.gb-lobby-player-ready { background: rgba(102,187,106,0.06); }
.gb-lobby-player-avatar { width: 32px; height: 32px; border-radius: 50%; background: #2a2b2e; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 600; color: #9e9fa3; overflow: hidden; }
.gb-lobby-player-avatar img { width: 100%; height: 100%; object-fit: cover; }
.gb-lobby-player-name { flex: 1; font-size: 0.82rem; font-weight: 600; color: #e0e1e4; display: flex; align-items: center; gap: 6px; }
.gb-host-badge { font-size: 0.58rem; background: rgba(255,183,77,0.15); color: #ffb74d; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
.gb-lobby-actions { display: flex; flex-direction: column; gap: 4px; }
.gb-fx-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20; }
.gb-confetti-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.gb-mini-physics-wrap { width: 300px; height: 300px; margin: 0 auto 24px; cursor: pointer; user-select: none; position: relative; border-radius: 16px; overflow: hidden; border: 2px solid rgba(255,152,0,0.25); background: rgba(10,10,20,0.6); transition: box-shadow 0.3s; }
.gb-mini-physics-wrap:active { transform: scale(0.97); }
.gb-mini-physics-canvas { width: 100%; height: 100%; display: block; }
.gb-mini-clicks-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 3.5rem; font-weight: 900; color: rgba(255,255,255,0.15); pointer-events: none; text-shadow: 0 0 20px rgba(255,152,0,0.2); font-variant-numeric: tabular-nums; }
.gb-game { position: relative; overflow: hidden; }
.gb-hud { display: flex; align-items: stretch; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
.gb-hud-panel { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(15,15,25,0.65); border-radius: 12px; border: 1px solid rgba(38,166,154,0.15); backdrop-filter: blur(8px); box-shadow: 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04); }
.gb-hud-score { border-color: rgba(255,183,77,0.2); }
.gb-hud-combo { flex-direction: column; align-items: center; gap: 2px; min-width: 56px; }
.gb-hud-combo-hot { border-color: rgba(255,152,0,0.4); box-shadow: 0 2px 12px rgba(0,0,0,0.25), 0 0 20px rgba(255,152,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04); }
.gb-hud-val { font-size: 1.1rem; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 0 8px rgba(255,255,255,0.15); }
.gb-hud-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.gb-hud-qnum { font-size: 0.65rem; font-weight: 700; color: #26a69a; background: rgba(38,166,154,0.12); padding: 1px 10px; border-radius: 10px; letter-spacing: 0.05em; }
.gb-hud-alive { display: flex; align-items: center; gap: 3px; font-size: 0.65rem; font-weight: 600; color: #90caf9; }
.gb-game-hearts { display: flex; gap: 3px; filter: drop-shadow(0 0 4px rgba(244,67,54,0.35)); }
.gb-heart-icon { transition: transform 0.2s, opacity 0.2s; }
.gb-combo-hot { color: #ff9800 !important; text-shadow: 0 0 10px rgba(255,152,0,0.5); animation: gb-combo-pulse 0.5s infinite alternate; }
@keyframes gb-combo-pulse { from { transform: scale(1); } to { transform: scale(1.18); } }
.gb-timer { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.gb-timer-track { flex: 1; height: 8px; background: rgba(20,20,30,0.6); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.04); box-shadow: inset 0 2px 4px rgba(0,0,0,0.4); }
.gb-timer-fill { height: 100%; border-radius: 3px; transition: width 0.1s linear, background 0.3s; box-shadow: 0 0 10px var(--timer-glow, rgba(102,187,106,0.4)); position: relative; }
.gb-timer-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.2), transparent); border-radius: 3px 3px 0 0; }
.gb-timer-text { font-size: 0.82rem; font-weight: 800; font-variant-numeric: tabular-nums; min-width: 40px; text-align: right; text-shadow: 0 0 8px currentColor; }
.gb-question-card { text-align: center; position: relative; padding: 32px 24px 28px; background: rgba(15,15,25,0.5); border-radius: 20px; border: 1px solid rgba(38,166,154,0.12); box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03); backdrop-filter: blur(6px); }
.gb-question-direction { font-size: 0.75rem; color: #80cbc4; margin-bottom: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
.gb-question-word { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 28px; line-height: 1.3; text-shadow: 0 2px 16px rgba(38,166,154,0.2); letter-spacing: 0.01em; }
.gb-question-sentence { font-size: 1.5rem; font-weight: 700; }
.gb-blank { color: #26a69a; text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 6px; font-weight: 900; letter-spacing: 0.1em; }
.gb-feedback { position: absolute; left: 50%; top: 8px; transform: translateX(-50%); display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 24px; border-radius: 14px; font-size: 1rem; font-weight: 800; z-index: 10; pointer-events: none; white-space: nowrap; backdrop-filter: blur(10px); }
.gb-feedback-correct { background: rgba(102,187,106,0.18); color: #66bb6a; box-shadow: 0 4px 24px rgba(102,187,106,0.25), inset 0 0 16px rgba(102,187,106,0.08); border: 1px solid rgba(102,187,106,0.25); }
.gb-feedback-wrong { background: rgba(239,83,80,0.18); color: #ef5350; box-shadow: 0 4px 24px rgba(239,83,80,0.25), inset 0 0 16px rgba(239,83,80,0.08); border: 1px solid rgba(239,83,80,0.25); }
.gb-fade-enter-active, .gb-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.gb-fade-enter-from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
.gb-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-4px); }
.gb-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 540px; margin: 0 auto; }
.gb-choice-btn { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-radius: 14px; background: linear-gradient(145deg, rgba(30,30,42,0.9), rgba(38,38,52,0.9)); border: 2px solid rgba(80,80,110,0.25); color: #e0e1e4; font-size: 0.92rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); text-align: left; position: relative; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
.gb-choice-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(38,166,154,0.1), transparent 60%); opacity: 0; transition: opacity 0.25s; }
.gb-choice-btn:hover:not(:disabled) { border-color: rgba(38,166,154,0.5); transform: translateY(-2px) scale(1.01); box-shadow: 0 8px 24px rgba(38,166,154,0.12), 0 4px 14px rgba(0,0,0,0.3); }
.gb-choice-btn:hover:not(:disabled)::before { opacity: 1; }
.gb-choice-btn:active:not(:disabled) { transform: translateY(1px) scale(0.98); transition-duration: 0.08s; }
.gb-choice-letter { width: 32px; height: 32px; border-radius: 10px; background: rgba(38,166,154,0.12); border: 1px solid rgba(38,166,154,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; color: #80cbc4; flex-shrink: 0; transition: all 0.2s; }
.gb-choice-text { flex: 1; font-weight: 600; min-width: 0; word-break: break-word; position: relative; z-index: 1; }
.gb-choice-correct { border-color: #66bb6a !important; background: linear-gradient(145deg, rgba(102,187,106,0.15), rgba(102,187,106,0.06)) !important; box-shadow: 0 0 24px rgba(102,187,106,0.15), 0 4px 14px rgba(0,0,0,0.2) !important; }
.gb-choice-correct .gb-choice-letter { background: #66bb6a; border-color: #66bb6a; color: #fff; box-shadow: 0 0 12px rgba(102,187,106,0.4); }
.gb-choice-wrong { border-color: #ef5350 !important; background: linear-gradient(145deg, rgba(239,83,80,0.15), rgba(239,83,80,0.06)) !important; box-shadow: 0 0 24px rgba(239,83,80,0.15), 0 4px 14px rgba(0,0,0,0.2) !important; }
.gb-choice-wrong .gb-choice-letter { background: #ef5350; border-color: #ef5350; color: #fff; box-shadow: 0 0 12px rgba(239,83,80,0.4); }
.gb-choice-disabled { cursor: not-allowed; opacity: 0.65; }
.gb-eliminated { text-align: center; padding: 48px 20px; background: rgba(15,15,25,0.5); border-radius: 20px; border: 1px solid rgba(239,83,80,0.15); }
.gb-eliminated-title { font-size: 1.5rem; font-weight: 800; color: #ef5350; margin-top: 14px; text-shadow: 0 0 20px rgba(239,83,80,0.3); }
.gb-eliminated-score { font-size: 0.95rem; color: #9e9fa3; margin-top: 8px; }
.gb-mp-players-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; padding: 12px; background: rgba(15,15,25,0.4); border-radius: 14px; border: 1px solid rgba(255,255,255,0.04); }
.gb-mp-player-mini { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 10px; background: rgba(40,40,55,0.5); font-size: 0.68rem; border: 1px solid rgba(255,255,255,0.04); transition: opacity 0.3s; }
.gb-mp-player-dead { opacity: 0.3; text-decoration: line-through; }
.gb-mp-player-me { background: rgba(38,166,154,0.12); border-color: rgba(38,166,154,0.25); }
.gb-mp-player-avatar-sm { width: 20px; height: 20px; border-radius: 50%; background: #2a2b2e; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 600; color: #9e9fa3; overflow: hidden; }
.gb-mp-player-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
.gb-mp-player-name-sm { font-weight: 600; color: #e0e1e4; }
.gb-mp-player-hearts-sm { display: flex; align-items: center; gap: 2px; color: #9e9fa3; }
.gb-mp-player-score-sm { margin-left: 4px; color: #ffb74d; font-weight: 600; }
.gb-mp-player-qnum { font-size: 0.6rem; color: #80cbc4; font-weight: 700; background: rgba(38,166,154,0.1); padding: 2px 7px; border-radius: 6px; }
.gb-result { text-align: center; padding: 24px 0; position: relative; overflow: hidden; }
.gb-result-trophy { font-size: 3.5rem; margin-bottom: 8px; filter: drop-shadow(0 4px 12px rgba(255,183,77,0.3)); animation: gb-trophy-float 2s ease-in-out infinite alternate; }
@keyframes gb-trophy-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.gb-result-title { font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 16px; text-shadow: 0 2px 12px rgba(38,166,154,0.2); }
.gb-result-score-wrap { margin-bottom: 28px; }
.gb-result-score { font-size: 3rem; font-weight: 900; color: #ffb74d; text-shadow: 0 0 20px rgba(255,183,77,0.3); font-variant-numeric: tabular-nums; }
.gb-result-label { font-size: 0.72rem; color: #9e9fa3; font-weight: 700; letter-spacing: 0.2em; margin-top: 4px; }
.gb-result-stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 32px; }
.gb-result-stat { text-align: center; padding: 12px 16px; background: rgba(15,15,25,0.5); border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); min-width: 80px; }
.gb-result-stat-val { font-size: 1.2rem; font-weight: 800; color: #fff; }
.gb-result-stat-label { font-size: 0.65rem; color: #9e9fa3; margin-top: 4px; font-weight: 600; }
.gb-result-actions { max-width: 300px; margin: 0 auto; display: flex; flex-direction: column; gap: 6px; }
.gb-result-icon { font-size: 3.5rem; margin-bottom: 8px; }
.gb-result-winner { margin: 16px 0; }
.gb-result-winner-avatar { width: 64px; height: 64px; border-radius: 50%; background: #2a2b2e; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #9e9fa3; margin: 0 auto 10px; overflow: hidden; border: 2px solid rgba(255,183,77,0.3); box-shadow: 0 0 20px rgba(255,183,77,0.15); }
.gb-result-winner-avatar img { width: 100%; height: 100%; object-fit: cover; }
.gb-result-winner-name { font-size: 1.05rem; font-weight: 800; color: #fff; }
.gb-result-winner-label { font-size: 0.7rem; color: #ffb74d; font-weight: 700; letter-spacing: 0.1em; }
.gb-result-ranking { background: rgba(15,15,25,0.5); border-radius: 16px; padding: 14px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05); text-align: left; }
.gb-result-rank-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; transition: background 0.15s; }
.gb-result-rank-me { background: rgba(38,166,154,0.1); border: 1px solid rgba(38,166,154,0.15); }
.gb-result-rank-pos { width: 28px; text-align: center; font-size: 0.88rem; font-weight: 800; color: #6b6c6f; }
.gb-result-rank-name { flex: 1; font-size: 0.85rem; font-weight: 600; color: #e0e1e4; }
.gb-result-rank-score { font-size: 0.85rem; font-weight: 800; color: #ffb74d; }
.gb-mini-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.gb-mini-content { text-align: center; max-width: 400px; padding: 36px; }
.gb-mini-title { font-size: 1.6rem; font-weight: 900; color: #ff9800; margin-bottom: 8px; text-shadow: 0 0 20px rgba(255,152,0,0.4); }
.gb-mini-sub { font-size: 0.85rem; color: #b0b1b4; margin-bottom: 24px; }
.gb-mini-timer { font-size: 2.2rem; font-weight: 900; color: #fff; margin-bottom: 20px; font-variant-numeric: tabular-nums; text-shadow: 0 0 12px rgba(255,255,255,0.2); }
.gb-mini-target-active { animation: gb-mini-glow 0.4s infinite alternate; }
@keyframes gb-mini-glow { from { box-shadow: 0 0 15px rgba(255,152,0,0.3); } to { box-shadow: 0 0 40px rgba(255,152,0,0.6), 0 0 80px rgba(255,152,0,0.15); } }
.gb-mini-result { margin-top: 20px; }
.gb-mini-result-clicks { font-size: 1.4rem; font-weight: 800; color: #fff; }
.gb-mini-result-bonus { font-size: 1.2rem; font-weight: 800; color: #ff9800; margin: 8px 0 16px; text-shadow: 0 0 12px rgba(255,152,0,0.3); }
.gb-heart-vignette { position: fixed; inset: 0; z-index: 50; pointer-events: none; border-radius: 0; box-shadow: inset 0 0 80px 30px rgba(220,30,30,0), inset 0 0 160px 60px rgba(220,30,30,0); }
.gb-heart-vignette-once { animation: gb-vignette-hit 0.6s ease-out forwards; }
.gb-heart-vignette-loop { animation: gb-vignette-breathe 1.4s ease-in-out infinite; }
@keyframes gb-vignette-hit { 0% { box-shadow: inset 0 0 80px 30px rgba(220,30,30,0), inset 0 0 160px 60px rgba(220,30,30,0); } 20% { box-shadow: inset 0 0 100px 40px rgba(220,30,30,0.55), inset 0 0 200px 80px rgba(180,10,10,0.3); } 100% { box-shadow: inset 0 0 80px 30px rgba(220,30,30,0), inset 0 0 160px 60px rgba(220,30,30,0); } }
@keyframes gb-vignette-breathe { 0%, 100% { box-shadow: inset 0 0 70px 25px rgba(220,30,30,0.15), inset 0 0 140px 50px rgba(180,10,10,0.08); } 50% { box-shadow: inset 0 0 100px 40px rgba(220,30,30,0.4), inset 0 0 200px 70px rgba(180,10,10,0.2); } }
.gb-adaptive-hud { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; padding: 10px 16px; background: rgba(15,15,25,0.65); border-radius: 14px; border: 1px solid rgba(38,166,154,0.15); backdrop-filter: blur(8px); }
.gb-adaptive-hud-progress { font-size: 0.85rem; font-weight: 700; color: #9e9fa3; font-variant-numeric: tabular-nums; }
.gb-adaptive-hud-level-badge { padding: 5px 16px; border-radius: 10px; font-size: 1rem; font-weight: 900; border: 2px solid; letter-spacing: 0.05em; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
.gb-adaptive-hud-accuracy { font-size: 0.9rem; font-weight: 800; color: #66bb6a; font-variant-numeric: tabular-nums; }
.gb-adaptive-level-bar { display: flex; gap: 4px; margin-bottom: 16px; }
.gb-adaptive-level-seg { flex: 1; position: relative; height: 28px; background: rgba(30,30,42,0.7); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(80,80,110,0.15); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
.gb-adaptive-level-seg-fill { position: absolute; inset: 0; background: var(--seg-color); opacity: 0; transition: opacity 0.4s; border-radius: 8px; }
.gb-adaptive-level-seg-passed .gb-adaptive-level-seg-fill { opacity: 0.2; }
.gb-adaptive-level-seg-active { border-color: var(--seg-color); box-shadow: 0 0 12px color-mix(in srgb, var(--seg-color) 30%, transparent); transform: scaleY(1.15); }
.gb-adaptive-level-seg-active .gb-adaptive-level-seg-fill { opacity: 0.35; }
.gb-adaptive-level-seg-label { position: relative; z-index: 1; font-size: 0.65rem; font-weight: 800; color: #9e9fa3; letter-spacing: 0.04em; transition: color 0.3s; }
.gb-adaptive-level-seg-active .gb-adaptive-level-seg-label { color: #fff; }
.gb-adaptive-level-seg-passed .gb-adaptive-level-seg-label { color: var(--seg-color); }
.gb-adaptive-result-header { font-size: 0.85rem; font-weight: 700; color: #9e9fa3; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.gb-adaptive-new-best { display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; border-radius: 20px; background: rgba(255,215,64,0.15); color: #ffd740; font-size: 0.82rem; font-weight: 800; margin-bottom: 16px; border: 1px solid rgba(255,215,64,0.25); animation: gb-new-best-glow 1.5s ease-in-out infinite alternate; }
@keyframes gb-new-best-glow { from { box-shadow: 0 0 8px rgba(255,215,64,0.15); } to { box-shadow: 0 0 20px rgba(255,215,64,0.3); } }
.gb-adaptive-prev-best { font-size: 0.8rem; color: #9e9fa3; margin-bottom: 16px; }
.gb-cefr-best-badge { padding: 4px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 900; border: 1.5px solid; letter-spacing: 0.04em; flex-shrink: 0; }
.gb-cefr-best-inline { font-weight: 900; }
.gb-adaptive-result-badge { width: 160px; height: 160px; border-radius: 50%; margin: 0 auto 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15,15,25,0.6); border: 3px solid var(--badge-color); box-shadow: 0 0 40px color-mix(in srgb, var(--badge-color) 25%, transparent), inset 0 0 30px color-mix(in srgb, var(--badge-color) 10%, transparent); animation: gb-badge-pulse 2.5s ease-in-out infinite alternate; }
@keyframes gb-badge-pulse { from { box-shadow: 0 0 30px color-mix(in srgb, var(--badge-color) 20%, transparent), inset 0 0 20px color-mix(in srgb, var(--badge-color) 8%, transparent); } to { box-shadow: 0 0 50px color-mix(in srgb, var(--badge-color) 35%, transparent), inset 0 0 40px color-mix(in srgb, var(--badge-color) 15%, transparent); } }
.gb-adaptive-result-badge-level { font-size: 3rem; font-weight: 900; color: var(--badge-color); line-height: 1; text-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 40%, transparent); }
.gb-adaptive-result-badge-name { font-size: 0.75rem; font-weight: 700; color: #9e9fa3; margin-top: 4px; letter-spacing: 0.06em; }
.gb-adaptive-result-towards { font-size: 0.9rem; color: #b0b1b4; margin-bottom: 24px; }
.gb-adaptive-result-bar { display: flex; gap: 4px; margin: 0 auto 28px; max-width: 400px; }
.gb-adaptive-result-bar-seg { flex: 1; height: 36px; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(30,30,42,0.6); border: 1px solid rgba(80,80,110,0.15); font-size: 0.7rem; font-weight: 800; color: #6b6c6f; transition: all 0.5s; }
.gb-adaptive-result-bar-fill { position: absolute; inset: 0; background: var(--seg-color); opacity: 0; transition: opacity 0.5s; }
.gb-adaptive-result-bar-seg span { position: relative; z-index: 1; }
.gb-adaptive-result-bar-passed { border-color: var(--seg-color); }
.gb-adaptive-result-bar-passed .gb-adaptive-result-bar-fill { opacity: 0.3; }
.gb-adaptive-result-bar-passed span { color: var(--seg-color); }
.gb-adaptive-result-bar-working { border-color: var(--seg-color); border-style: dashed; }
.gb-adaptive-result-bar-working .gb-adaptive-result-bar-fill { opacity: 0.1; animation: gb-bar-working-pulse 1.5s ease-in-out infinite alternate; }
@keyframes gb-bar-working-pulse { from { opacity: 0.08; } to { opacity: 0.2; } }
.gb-adaptive-result-bar-working span { color: var(--seg-color); opacity: 0.7; }
.gb-adaptive-stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 24px; }
.gb-adaptive-stat { text-align: center; padding: 14px 20px; background: rgba(15,15,25,0.5); border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); min-width: 90px; }
.gb-adaptive-stat-val { font-size: 1.3rem; font-weight: 800; color: #fff; }
.gb-adaptive-stat-label { font-size: 0.68rem; color: #9e9fa3; margin-top: 4px; font-weight: 600; }
.gb-adaptive-breakdown { background: rgba(15,15,25,0.5); border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); }
.gb-adaptive-breakdown-title { font-size: 0.75rem; font-weight: 700; color: #9e9fa3; margin-bottom: 14px; letter-spacing: 0.06em; }
.gb-adaptive-breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.gb-adaptive-breakdown-row:last-child { margin-bottom: 0; }
.gb-adaptive-breakdown-level { font-size: 0.78rem; font-weight: 800; width: 28px; text-align: center; }
.gb-adaptive-breakdown-bar-track { flex: 1; height: 8px; background: rgba(40,40,55,0.6); border-radius: 4px; overflow: hidden; }
.gb-adaptive-breakdown-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); min-width: 2px; }
.gb-adaptive-breakdown-score { font-size: 0.75rem; font-weight: 700; color: #b0b1b4; width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
@media (max-width: 600px) {
  .gb-page { padding: 14px; }
  .gb-mode-grid { grid-template-columns: 1fr; }
  .gb-mp-actions { grid-template-columns: 1fr; }
  .gb-level-grid { grid-template-columns: 1fr 1fr; }
  .gb-choices { grid-template-columns: 1fr; }
  .gb-question-word { font-size: 1.4rem; }
  .gb-question-sentence { font-size: 1.2rem; }
  .gb-question-card { padding: 24px 16px 20px; }
  .gb-hud-panel { padding: 6px 10px; }
  .gb-hud-val { font-size: 0.95rem; }
  .gb-result-score { font-size: 2.2rem; }
  .gb-lobby-header { flex-direction: column; gap: 10px; text-align: center; }
  .gb-hero-title { font-size: 1.6rem; }
  .gb-adaptive-result-badge { width: 130px; height: 130px; }
  .gb-adaptive-result-badge-level { font-size: 2.4rem; }
  .gb-adaptive-level-seg-label { font-size: 0.55rem; }
}
</style>
