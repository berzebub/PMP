<template>
  <q-page class="vb-page">
    <div class="vb-container">

      <!-- ====== Back Button (always visible) ====== -->
      <div class="vb-back" @click="handleBack">
        <q-icon name="arrow_back" size="20px" />
        <span>{{ screen === 'menu' ? 'Arcade' : 'กลับ' }}</span>
      </div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Mode Selection                      -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'menu'">
        <div class="vb-hero">
          <div class="vb-hero-icon">
            <q-icon name="translate" size="36px" />
          </div>
          <div class="vb-hero-title">Vocab Battle</div>
          <div class="vb-hero-sub">จับคู่คำศัพท์ไทย-อังกฤษ แบ่งตาม CEFR Level</div>
        </div>

        <div class="vb-mode-grid">
          <div class="vb-mode-card" @click="screen = 'sp-level'">
            <div class="vb-mode-icon" style="background: rgba(102,187,106,0.12); color: #66bb6a">
              <q-icon name="person" size="32px" />
            </div>
            <div class="vb-mode-name">Single Player</div>
            <div class="vb-mode-desc">เล่นคนเดียว ตอบไปเรื่อยๆ จนหมดหัวใจ</div>
          </div>
          <div class="vb-mode-card" @click="screen = 'mp-choice'">
            <div class="vb-mode-icon" style="background: rgba(124,77,255,0.12); color: #7c4dff">
              <q-icon name="groups" size="32px" />
            </div>
            <div class="vb-mode-name">Multi Player</div>
            <div class="vb-mode-desc">Battle Royal 2-30 คน ผู้อยู่รอดคนสุดท้ายชนะ!</div>
            <div class="vb-mode-badge">2-30 Players</div>
          </div>
        </div>

        <!-- Review Wrong Words Card -->
        <div class="vb-review-card" @click="screen = 'review'">
          <div class="vb-review-card-icon">
            <q-icon name="auto_stories" size="28px" color="orange" />
          </div>
          <div class="vb-review-card-body">
            <div class="vb-review-card-title">ทบทวนคำผิด</div>
            <div class="vb-review-card-sub">{{ store.wrongWords.length }} คำที่ต้องทบทวน</div>
          </div>
          <q-icon name="chevron_right" size="22px" color="grey-6" />
        </div>

        <!-- Leaderboard -->
        <div class="vb-lb-section">
          <div class="vb-lb-header">
            <q-icon name="emoji_events" size="22px" color="amber" />
            <span>Leaderboard</span>
          </div>

          <div v-if="gameStore.personalBest" class="vb-lb-personal">
            <q-icon name="star" size="16px" color="amber" />
            <span>คะแนนสูงสุดของคุณ: <strong>{{ gameStore.personalBest.score.toLocaleString() }}</strong></span>
          </div>

          <div v-if="gameStore.loading" class="vb-lb-loading">
            <q-spinner-dots size="24px" color="grey-6" />
          </div>
          <div v-else-if="gameStore.leaderboard.length === 0" class="vb-lb-empty">
            <q-icon name="leaderboard" size="32px" color="grey-7" />
            <div>ยังไม่มีคะแนน ลองเล่นเลย!</div>
          </div>
          <div v-else class="vb-lb-list">
            <div
              v-for="(entry, idx) in gameStore.leaderboard"
              :key="entry.id"
              class="vb-lb-item"
              :class="{ 'vb-lb-item-me': entry.userId === store.myId }"
            >
              <div class="vb-lb-rank">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else>#{{ idx + 1 }}</span>
              </div>
              <div class="vb-lb-avatar">
                <img v-if="entry.photoURL" :src="entry.photoURL" />
                <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="vb-lb-name">{{ entry.displayName }}</div>
              <div class="vb-lb-score">{{ entry.score.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: CEFR Level Selection (SP)           -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-level'">
        <div class="vb-section-header">
          <q-icon name="school" size="24px" color="amber" />
          <div>
            <div class="vb-section-title">เลือกระดับคำศัพท์</div>
            <div class="vb-section-sub">CEFR Level</div>
          </div>
        </div>

        <div class="vb-level-grid">
          <div
            v-for="lvl in levels"
            :key="lvl.id"
            class="vb-level-card"
            @click="startSP(lvl.id)"
          >
            <div class="vb-level-accent" :style="{ background: lvl.color }"></div>
            <div class="vb-level-body">
              <div class="vb-level-top">
                <div class="vb-level-badge" :style="{ background: lvl.color + '20', color: lvl.color }">
                  {{ lvl.id }}
                </div>
                <q-icon :name="lvl.icon" size="20px" :style="{ color: lvl.color }" />
              </div>
              <div class="vb-level-name">{{ lvl.name }}</div>
              <div class="vb-level-count">{{ lvl.wordCount }} คำ</div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Create or Join                   -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-choice'">
        <div class="vb-section-header">
          <q-icon name="groups" size="24px" color="deep-purple-4" />
          <div>
            <div class="vb-section-title">Multi Player</div>
            <div class="vb-section-sub">สร้างห้องหรือเข้าร่วมห้อง</div>
          </div>
        </div>

        <div class="vb-mp-actions">
          <div class="vb-mp-action-card" @click="screen = 'mp-create'">
            <q-icon name="add_circle" size="40px" color="green-5" />
            <div class="vb-mp-action-title">สร้างห้อง</div>
            <div class="vb-mp-action-desc">สร้างห้องใหม่และเชิญเพื่อนเข้ามา</div>
          </div>
          <div class="vb-mp-action-card" @click="showJoinDialog = true">
            <q-icon name="login" size="40px" color="blue-5" />
            <div class="vb-mp-action-title">เข้าร่วมห้อง</div>
            <div class="vb-mp-action-desc">ใส่รหัสห้องเพื่อเข้าร่วมเกม</div>
          </div>
        </div>

        <!-- Join Room Dialog Overlay -->
        <div v-if="showJoinDialog" class="vb-dialog-overlay" @click.self="showJoinDialog = false">
          <div class="vb-dialog">
            <div class="vb-dialog-title">เข้าห้อง</div>
            <div class="vb-dialog-body">
              <label class="vb-dialog-label">รหัสห้อง (4 ตัวอักษร)</label>
              <input
                v-model="joinCode"
                maxlength="4"
                placeholder="ABCD"
                class="vb-dialog-input vb-dialog-input-code"
                @keyup.enter="handleJoinRoom"
              />
              <div v-if="store.error" class="vb-dialog-error">{{ store.error }}</div>
            </div>
            <div class="vb-dialog-actions">
              <button class="vb-dialog-btn vb-dialog-btn-ghost" @click="showJoinDialog = false">ยกเลิก</button>
              <button
                class="vb-dialog-btn vb-dialog-btn-primary"
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
        <div class="vb-section-header">
          <q-icon name="tune" size="24px" color="green-5" />
          <div>
            <div class="vb-section-title">ตั้งค่าห้อง</div>
            <div class="vb-section-sub">กำหนดค่าเกมก่อนสร้างห้อง</div>
          </div>
        </div>

        <div class="vb-settings-card">
          <div class="vb-setting-row">
            <div class="vb-setting-label">
              <q-icon name="school" size="18px" />
              <span>CEFR Level</span>
            </div>
            <div class="vb-setting-chips">
              <button
                v-for="lvl in levels"
                :key="lvl.id"
                class="vb-chip"
                :class="{ 'vb-chip-active': mpSettings.level === lvl.id }"
                :style="mpSettings.level === lvl.id ? { background: lvl.color + '25', color: lvl.color, borderColor: lvl.color + '50' } : {}"
                @click="mpSettings.level = lvl.id"
              >{{ lvl.id }}</button>
            </div>
          </div>

          <div class="vb-setting-row">
            <div class="vb-setting-label">
              <q-icon name="favorite" size="18px" color="red-5" />
              <span>หัวใจ ({{ mpSettings.hearts }})</span>
            </div>
            <q-slider
              v-model="mpSettings.hearts"
              :min="1" :max="10" :step="1"
              color="red-5"
              label
              class="vb-slider"
            />
            <div class="vb-setting-hint">
              น้อย = คะแนนสูง (x{{ getHeartMultiplier(mpSettings.hearts) }})
            </div>
          </div>

          <div class="vb-setting-row">
            <div class="vb-setting-label">
              <q-icon name="timer" size="18px" color="amber" />
              <span>เวลาต่อข้อ ({{ mpSettings.timerSeconds }}s)</span>
            </div>
            <q-slider
              v-model="mpSettings.timerSeconds"
              :min="5" :max="30" :step="1"
              color="amber"
              label
              class="vb-slider"
            />
          </div>

          <q-btn
            label="สร้างห้อง"
            color="green-6"
            icon="add"
            no-caps
            unelevated
            class="vb-btn-full"
            :loading="store.loading"
            @click="handleCreateRoom"
          />
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Lobby                            -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-lobby'">
        <div class="vb-lobby">
          <div class="vb-lobby-header">
            <div class="vb-lobby-code-box">
              <div class="vb-lobby-code-label">รหัสห้อง</div>
              <div class="vb-lobby-code">{{ store.room?.roomCode }}</div>
            </div>
            <div class="vb-lobby-info">
              <div class="vb-lobby-tag">
                <q-icon name="school" size="14px" />
                {{ store.room?.settings?.level }}
              </div>
              <div class="vb-lobby-tag">
                <q-icon name="favorite" size="14px" color="red-5" />
                {{ store.room?.settings?.hearts }}
              </div>
              <div class="vb-lobby-tag">
                <q-icon name="timer" size="14px" />
                {{ store.room?.settings?.timerSeconds }}s
              </div>
            </div>
          </div>

          <!-- Settings panel (host only) -->
          <div v-if="store.isHost" class="vb-lobby-settings">
            <div class="vb-setting-row">
              <div class="vb-setting-label">
                <q-icon name="school" size="16px" />
                <span>Level</span>
              </div>
              <div class="vb-setting-chips">
                <button
                  v-for="lvl in levels"
                  :key="lvl.id"
                  class="vb-chip vb-chip-sm"
                  :class="{ 'vb-chip-active': store.room?.settings?.level === lvl.id }"
                  :style="store.room?.settings?.level === lvl.id ? { background: lvl.color + '25', color: lvl.color, borderColor: lvl.color + '50' } : {}"
                  @click="store.updateSettings({ level: lvl.id })"
                >{{ lvl.id }}</button>
              </div>
            </div>
            <div class="vb-setting-row">
              <div class="vb-setting-label">
                <q-icon name="favorite" size="16px" color="red-5" />
                <span>Hearts</span>
              </div>
              <q-slider
                :model-value="store.room?.settings?.hearts || 5"
                @update:model-value="v => store.updateSettings({ hearts: v })"
                :min="1" :max="10" :step="1"
                color="red-5" label
                class="vb-slider"
              />
            </div>
            <div class="vb-setting-row">
              <div class="vb-setting-label">
                <q-icon name="timer" size="16px" />
                <span>Timer</span>
              </div>
              <q-slider
                :model-value="store.room?.settings?.timerSeconds || 10"
                @update:model-value="v => store.updateSettings({ timerSeconds: v })"
                :min="5" :max="30" :step="1"
                color="amber" label
                class="vb-slider"
              />
            </div>
          </div>

          <!-- Player list -->
          <div class="vb-lobby-players-title">
            ผู้เล่น ({{ store.playerCount }}/30)
          </div>
          <div class="vb-lobby-players">
            <div
              v-for="(p, pid) in store.room?.players"
              :key="pid"
              class="vb-lobby-player"
              :class="{ 'vb-lobby-player-ready': p.isReady }"
            >
              <div class="vb-lobby-player-avatar">
                <img v-if="p.photoURL" :src="p.photoURL" />
                <span v-else>{{ (p.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="vb-lobby-player-name">
                {{ p.displayName }}
                <span v-if="pid === store.room?.hostId" class="vb-host-badge">HOST</span>
              </div>
              <div class="vb-lobby-player-status">
                <q-icon
                  :name="p.isReady ? 'check_circle' : 'radio_button_unchecked'"
                  :color="p.isReady ? 'green-5' : 'grey-6'"
                  size="20px"
                />
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="vb-lobby-actions">
            <q-btn
              v-if="!store.isHost"
              :label="store.room?.players?.[store.myId]?.isReady ? 'ยกเลิกพร้อม' : 'พร้อม!'"
              :color="store.room?.players?.[store.myId]?.isReady ? 'grey-7' : 'green-6'"
              :icon="store.room?.players?.[store.myId]?.isReady ? 'cancel' : 'check'"
              no-caps unelevated
              class="vb-btn-full"
              @click="store.toggleReady()"
            />
            <q-btn
              v-if="store.isHost"
              label="เริ่มเกม!"
              color="deep-purple-6"
              icon="play_arrow"
              no-caps unelevated
              class="vb-btn-full"
              :disable="store.playerCount < 2"
              @click="store.startGame()"
            />
            <q-btn
              label="ออกจากห้อง"
              color="red-6"
              icon="logout"
              no-caps flat
              class="vb-btn-full"
              @click="handleLeaveRoom"
            />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Review Wrong Words                   -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'review'">
        <div class="vb-section-header">
          <q-icon name="auto_stories" size="24px" color="orange" />
          <div>
            <div class="vb-section-title">ทบทวนคำผิด</div>
            <div class="vb-section-sub">{{ store.wrongWords.length }} คำที่ตอบผิด</div>
          </div>
        </div>

        <div v-if="store.wrongWords.length === 0" class="vb-review-empty">
          <q-icon name="check_circle" size="56px" color="green-5" />
          <div class="vb-review-empty-title">ไม่มีคำผิด</div>
          <div class="vb-review-empty-sub">เก่งมาก! ลองเล่นเพิ่มแล้วกลับมาทบทวนนะ</div>
        </div>

        <template v-else>
          <q-btn
            label="ฝึกทบทวน"
            color="orange-7"
            icon="play_arrow"
            no-caps unelevated
            class="vb-btn-full"
            style="margin-bottom: 16px;"
            :disable="filteredWrongWords.length < 4"
            @click="startReviewPractice"
          />
          <div v-if="filteredWrongWords.length < 4 && filteredWrongWords.length > 0" class="vb-review-hint">
            ต้องมีอย่างน้อย 4 คำ จึงจะเริ่มฝึกได้
          </div>

          <div class="vb-review-filters">
            <button
              class="vb-chip"
              :class="{ 'vb-chip-active': reviewFilter === 'all' }"
              @click="reviewFilter = 'all'"
            >ทั้งหมด ({{ store.wrongWords.length }})</button>
            <button
              v-for="lvl in reviewLevels"
              :key="lvl"
              class="vb-chip"
              :class="{ 'vb-chip-active': reviewFilter === lvl }"
              @click="reviewFilter = lvl"
            >{{ lvl }} ({{ store.wrongWords.filter(w => w.level === lvl).length }})</button>
          </div>

          <div class="vb-review-list">
            <div v-for="w in filteredWrongWords" :key="w.en + w.th" class="vb-review-item">
              <div class="vb-review-word-pair">
                <span class="vb-review-en">{{ w.en }}</span>
                <q-icon name="swap_horiz" size="16px" color="grey-6" />
                <span class="vb-review-th">{{ w.th }}</span>
              </div>
              <div class="vb-review-meta">
                <span class="vb-review-level-tag" :style="{ background: levelColor(w.level) + '20', color: levelColor(w.level) }">{{ w.level }}</span>
                <span class="vb-review-wrong-count">ผิด {{ w.wrongCount }}x</span>
                <button class="vb-review-remove" @click="store.removeWrongWord(w.en, w.th)">
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
            class="vb-btn-full"
            style="margin-top: 16px;"
            @click="confirmClearWrongWords"
          />
        </template>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Single Player Gameplay              -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-game' && store.spState">
        <div class="vb-game">
          <canvas ref="spFxCanvas" class="vb-fx-canvas"></canvas>
          <!-- HUD -->
          <div class="vb-hud">
            <div class="vb-hud-panel vb-hud-score">
              <q-icon name="stars" size="22px" color="amber" />
              <div class="vb-hud-val">{{ store.spState.score.toLocaleString() }}</div>
            </div>
            <div class="vb-hud-center">
              <div class="vb-game-hearts">
                <q-icon
                  v-for="i in store.spState.maxHearts"
                  :key="i"
                  :name="i <= store.spState.hearts ? 'favorite' : 'favorite_border'"
                  :color="i <= store.spState.hearts ? 'red-5' : 'grey-7'"
                  size="22px"
                  class="vb-heart-icon"
                />
              </div>
              <div class="vb-hud-qnum">Q{{ spQuestionNum + 1 }}</div>
            </div>
            <div class="vb-hud-panel vb-hud-combo" :class="{ 'vb-hud-combo-hot': store.spState.combo >= 5 }">
              <q-icon name="local_fire_department" size="22px" :color="store.spState.combo >= 3 ? 'orange' : 'grey-6'" />
              <div class="vb-hud-val" :class="{ 'vb-combo-hot': store.spState.combo >= 5 }">{{ store.spState.combo }}x</div>
            </div>
          </div>

          <!-- Timer -->
          <div class="vb-timer">
            <div class="vb-timer-track">
              <div class="vb-timer-fill" :style="{ width: timerPercent + '%', background: timerColor }"></div>
            </div>
            <div class="vb-timer-text" :style="{ color: timerColor }">{{ spTimerRemaining.toFixed(1) }}s</div>
          </div>

          <!-- Question -->
          <div v-if="currentSPQuestion && !store.spState.isFinished" class="vb-question-card">
            <div class="vb-question-direction">
              {{ currentSPQuestion.direction === 'en-to-th' ? 'English → Thai' : 'Thai → English' }}
            </div>
            <div class="vb-question-word">{{ currentSPQuestion.word }}</div>

            <transition name="vb-fade">
              <div
                v-if="spFeedback"
                class="vb-feedback"
                :class="spFeedback === 'correct' ? 'vb-feedback-correct' : 'vb-feedback-wrong'"
              >
                <q-icon :name="spFeedback === 'correct' ? 'check_circle' : 'cancel'" size="28px" />
                <span>{{ spFeedback === 'correct' ? `+${store.spState.lastPoints}` : 'ผิด! -1 ❤️' }}</span>
              </div>
            </transition>

            <div class="vb-choices">
              <button
                v-for="(choice, idx) in currentSPQuestion.choices"
                :key="idx"
                class="vb-choice-btn"
                :class="{
                  'vb-choice-correct': spAnswered && idx === currentSPQuestion.correctIndex,
                  'vb-choice-wrong': spAnswered && spSelectedIndex === idx && idx !== currentSPQuestion.correctIndex,
                  'vb-choice-disabled': spAnswered
                }"
                :disabled="spAnswered"
                @click="handleSPAnswer(idx)"
              >
                <span class="vb-choice-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="vb-choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: Multi Player Gameplay               -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-game' && store.room">
        <div class="vb-game">
          <canvas ref="mpFxCanvas" class="vb-fx-canvas"></canvas>
          <!-- HUD -->
          <div class="vb-hud">
            <div class="vb-hud-panel vb-hud-score">
              <q-icon name="stars" size="22px" color="amber" />
              <div class="vb-hud-val">{{ (store.room?.players?.[store.myId]?.score || 0).toLocaleString() }}</div>
            </div>
            <div class="vb-hud-center">
              <div class="vb-game-hearts">
                <q-icon
                  v-for="i in (store.room?.settings?.hearts || 5)"
                  :key="i"
                  :name="i <= mpLocalHearts ? 'favorite' : 'favorite_border'"
                  :color="i <= mpLocalHearts ? 'red-5' : 'grey-7'"
                  size="22px"
                  class="vb-heart-icon"
                />
              </div>
              <div class="vb-hud-qnum">Q{{ mpLocalQIndex + 1 }}</div>
            </div>
            <div class="vb-hud-panel vb-hud-combo" :class="{ 'vb-hud-combo-hot': mpCombo >= 5 }">
              <q-icon name="local_fire_department" size="22px" :color="mpCombo >= 3 ? 'orange' : 'grey-6'" />
              <div class="vb-hud-val" :class="{ 'vb-combo-hot': mpCombo >= 5 }">{{ mpCombo }}x</div>
              <div class="vb-hud-alive">
                <q-icon name="people" size="14px" color="blue-4" />
                <span>{{ store.alivePlayers.length }}</span>
              </div>
            </div>
          </div>

          <!-- Timer -->
          <div class="vb-timer">
            <div class="vb-timer-track">
              <div class="vb-timer-fill" :style="{ width: timerPercent + '%', background: timerColor }"></div>
            </div>
            <div class="vb-timer-text" :style="{ color: timerColor }">{{ mpTimerRemaining.toFixed(1) }}s</div>
          </div>

          <!-- My status: eliminated -->
          <div v-if="mpLocalHearts <= 0" class="vb-eliminated">
            <q-icon name="sentiment_very_dissatisfied" size="56px" color="red-4" />
            <div class="vb-eliminated-title">คุณถูกคัดออก!</div>
            <div class="vb-eliminated-score">คะแนนรวม: {{ (store.room?.players?.[store.myId]?.score || 0).toLocaleString() }}</div>
          </div>

          <!-- Question area -->
          <div v-else-if="currentMPQuestion" class="vb-question-card">
            <div class="vb-question-direction">
              {{ currentMPQuestion.direction === 'en-to-th' ? 'English → Thai' : 'Thai → English' }}
            </div>
            <div class="vb-question-word">{{ currentMPQuestion.word }}</div>

            <transition name="vb-fade">
              <div
                v-if="mpFeedback"
                class="vb-feedback"
                :class="mpFeedback === 'correct' ? 'vb-feedback-correct' : 'vb-feedback-wrong'"
              >
                <q-icon :name="mpFeedback === 'correct' ? 'check_circle' : 'cancel'" size="28px" />
                <span>{{ mpFeedback === 'correct' ? `+${mpLastPoints}` : 'ผิด! -1 ❤️' }}</span>
              </div>
            </transition>

            <div class="vb-choices">
              <button
                v-for="(choice, idx) in currentMPQuestion.choices"
                :key="idx"
                class="vb-choice-btn"
                :class="{
                  'vb-choice-correct': mpAnswered && idx === currentMPQuestion.correctIndex,
                  'vb-choice-wrong': mpAnswered && mpSelectedIndex === idx && idx !== currentMPQuestion.correctIndex,
                  'vb-choice-disabled': mpAnswered
                }"
                :disabled="mpAnswered"
                @click="handleMPAnswer(idx)"
              >
                <span class="vb-choice-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="vb-choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>

          <!-- Player status bar -->
          <div class="vb-mp-players-bar">
            <div
              v-for="(p, pid) in store.room?.players"
              :key="pid"
              class="vb-mp-player-mini"
              :class="{ 'vb-mp-player-dead': !p.isAlive, 'vb-mp-player-me': pid === store.myId }"
            >
              <div class="vb-mp-player-avatar-sm">
                <img v-if="p.photoURL" :src="p.photoURL" />
                <span v-else>{{ (p.displayName || 'U').charAt(0) }}</span>
              </div>
              <div class="vb-mp-player-info-sm">
                <div class="vb-mp-player-name-sm">{{ p.displayName?.split(' ')[0] }}</div>
                <div class="vb-mp-player-hearts-sm">
                  <q-icon name="favorite" size="10px" color="red-5" />
                  {{ p.hearts || 0 }}
                  <span class="vb-mp-player-score-sm">{{ (p.score || 0).toLocaleString() }}</span>
                </div>
              </div>
              <span class="vb-mp-player-qnum">Q{{ (p.questionIndex || 0) + 1 }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: SP Results                          -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'sp-result'">
        <div class="vb-result">
          <canvas ref="spConfettiCanvas" class="vb-confetti-canvas"></canvas>
          <div class="vb-result-trophy">🏆</div>
          <div class="vb-result-title">Game Over!</div>
          <div class="vb-result-score-wrap">
            <div class="vb-result-score">{{ spFinalScore.toLocaleString() }}</div>
            <div class="vb-result-label">SCORE</div>
          </div>

          <div class="vb-result-stats">
            <div class="vb-result-stat">
              <div class="vb-result-stat-val">{{ spFinalStats.correct }}/{{ spFinalStats.total }}</div>
              <div class="vb-result-stat-label">ตอบถูก</div>
            </div>
            <div class="vb-result-stat">
              <div class="vb-result-stat-val">{{ spFinalStats.maxCombo }}x</div>
              <div class="vb-result-stat-label">Max Combo</div>
            </div>
            <div class="vb-result-stat">
              <div class="vb-result-stat-val">{{ spFinalStats.level }}</div>
              <div class="vb-result-stat-label">Level</div>
            </div>
          </div>

          <div class="vb-result-actions">
            <q-btn label="เล่นอีกครั้ง" color="deep-purple-6" icon="replay" no-caps unelevated class="vb-btn-full" @click="playAgainSP" />
            <q-btn label="กลับเมนู" color="grey-7" icon="home" no-caps flat class="vb-btn-full" @click="backToMenu" />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  SCREEN: MP Results                          -->
      <!-- ═══════════════════════════════════════════ -->
      <template v-if="screen === 'mp-result'">
        <div class="vb-result">
          <canvas ref="mpConfettiCanvas" class="vb-confetti-canvas"></canvas>
          <div class="vb-result-icon">{{ mpWinner === store.myId ? '🏆' : '🎮' }}</div>
          <div class="vb-result-title">{{ mpWinner === store.myId ? 'คุณชนะ!' : 'Game Over!' }}</div>

          <div v-if="mpWinner && store.room?.players?.[mpWinner]" class="vb-result-winner">
            <div class="vb-result-winner-avatar">
              <img v-if="store.room.players[mpWinner].photoURL" :src="store.room.players[mpWinner].photoURL" />
              <span v-else>{{ (store.room.players[mpWinner].displayName || 'W').charAt(0) }}</span>
            </div>
            <div class="vb-result-winner-name">{{ store.room.players[mpWinner].displayName }}</div>
            <div class="vb-result-winner-label">ผู้ชนะ</div>
          </div>

          <!-- Ranking -->
          <div class="vb-result-ranking">
            <div
              v-for="(p, idx) in mpRanking"
              :key="p.id"
              class="vb-result-rank-item"
              :class="{ 'vb-result-rank-me': p.id === store.myId }"
            >
              <div class="vb-result-rank-pos">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else>#{{ idx + 1 }}</span>
              </div>
              <div class="vb-result-rank-name">{{ p.displayName }}</div>
              <div class="vb-result-rank-score">{{ (p.score || 0).toLocaleString() }}</div>
            </div>
          </div>

          <div class="vb-result-actions">
            <q-btn label="กลับเมนู" color="grey-7" icon="home" no-caps flat class="vb-btn-full" @click="handleLeaveAndMenu" />
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════ -->
      <!--  OVERLAY: Heart Damage Vignette              -->
      <!-- ═══════════════════════════════════════════ -->
      <div
        v-if="heartDamagePulse || isLowHealth"
        class="vb-heart-vignette"
        :class="{
          'vb-heart-vignette-once': heartDamagePulse && !isLowHealth,
          'vb-heart-vignette-loop': isLowHealth
        }"
        @animationend="heartDamagePulse = false"
      ></div>

      <!-- ═══════════════════════════════════════════ -->
      <!--  OVERLAY: Combo Mini Game                    -->
      <!-- ═══════════════════════════════════════════ -->
      <transition name="vb-fade">
        <div v-if="showMiniGame" class="vb-mini-overlay">
          <div class="vb-mini-content">
            <div class="vb-mini-title">🔥 Bonus Combo!</div>
            <div class="vb-mini-sub">คลิกรัวๆ ให้ได้มากที่สุดใน 10 วินาที!</div>

            <div class="vb-mini-timer">{{ miniGameTimer.toFixed(1) }}s</div>

            <div
              class="vb-mini-physics-wrap"
              :class="{ 'vb-mini-target-active': miniGameActive }"
              @click="miniGameClick($event)"
            >
              <canvas ref="miniGamePhysicsCanvas" class="vb-mini-physics-canvas"></canvas>
              <div class="vb-mini-clicks-overlay">{{ miniGameClicks }}</div>
            </div>

            <div v-if="!miniGameActive && miniGameDone" class="vb-mini-result">
              <div class="vb-mini-result-clicks">{{ miniGameClicks }} คลิก!</div>
              <div class="vb-mini-result-bonus">+{{ miniGameBonus }} คะแนน</div>
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
import { useVocabBattleStore } from 'src/stores/vocabBattle'
import { useGameStore } from 'src/stores/game'
import { vocabByLevel, LEVELS, LEVEL_META } from 'src/data/vocabCEFR'
import { usePhysicsFX } from 'src/composables/usePhysicsFX'
import { useMiniGamePhysics } from 'src/composables/useMiniGamePhysics'

const router = useRouter()
const store = useVocabBattleStore()
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
  LEVELS.map(id => ({
    id,
    ...LEVEL_META[id],
    wordCount: vocabByLevel[id]?.length || 0,
  }))
)

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
  if (screen.value === 'sp-game') {
    return (spTimerRemaining.value / spTimerMax.value) * 100
  }
  if (screen.value === 'mp-game') {
    return (mpTimerRemaining.value / mpTimerMax.value) * 100
  }
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
  if (screen.value === 'sp-game' && store.spState) {
    return store.spState.hearts === 1
  }
  if (screen.value === 'mp-game') {
    return mpLocalHearts.value === 1
  }
  return false
})

function triggerHeartDamage() {
  heartDamagePulse.value = false
  requestAnimationFrame(() => { heartDamagePulse.value = true })
}

// ==================== MINI GAME STATE (shared SP & MP) ====================

const showMiniGame = computed(() => store.spState?.showMiniGame || mpShowMiniGame.value)
const miniGameMode = ref('sp')
const miniGameActive = ref(false)
const miniGameDone = ref(false)
const miniGameClicks = ref(0)
const miniGameTimer = ref(10)
const miniGameBonus = ref(0)
let miniGameInterval = null

// ==================== WRONG WORD HELPER ====================

function resolveWordPair(question) {
  if (!question) return null
  if (question.direction === 'en-to-th') {
    return { en: question.word, th: question.correctAnswer }
  }
  return { en: question.correctAnswer, th: question.word }
}

// ==================== REVIEW STATE ====================

const reviewFilter = ref('all')

const reviewLevels = computed(() => {
  const lvls = new Set(store.wrongWords.map(w => w.level))
  return LEVELS.filter(l => lvls.has(l))
})

const filteredWrongWords = computed(() => {
  const words = store.wrongWords
  if (reviewFilter.value === 'all') return [...words].sort((a, b) => b.lastWrong - a.lastWrong)
  return words.filter(w => w.level === reviewFilter.value).sort((a, b) => b.lastWrong - a.lastWrong)
})

function generateReviewQuestions(words) {
  if (words.length < 4) return []
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  const questions = []

  for (const w of shuffled) {
    const direction = Math.random() < 0.5 ? 'en-to-th' : 'th-to-en'
    const word = direction === 'en-to-th' ? w.en : w.th
    const correctAnswer = direction === 'en-to-th' ? w.th : w.en

    const others = words.filter(x => x.en !== w.en)
    let distractors = []

    if (others.length >= 3) {
      const sh = [...others].sort(() => Math.random() - 0.5)
      distractors = sh.slice(0, 3).map(d => direction === 'en-to-th' ? d.th : d.en)
    } else {
      const pool = vocabByLevel[w.level] || vocabByLevel['A1'] || []
      const otherPool = pool.filter(p => p.en !== w.en)
      const sh = [...otherPool].sort(() => Math.random() - 0.5)
      distractors = sh.slice(0, 3).map(d => direction === 'en-to-th' ? d.th : d.en)
    }

    if (distractors.length < 3) continue

    const allChoices = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5)
    questions.push({
      word,
      correctAnswer,
      choices: allChoices,
      direction,
      correctIndex: allChoices.indexOf(correctAnswer),
    })
  }
  return questions
}

function startReviewPractice() {
  const source = reviewFilter.value === 'all'
    ? store.wrongWords
    : store.wrongWords.filter(w => w.level === reviewFilter.value)
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

function confirmClearWrongWords() {
  if (confirm('ล้างคำผิดทั้งหมด?')) {
    store.clearAllWrongWords()
  }
}

function levelColor(lvl) {
  return LEVEL_META[lvl]?.color || '#7c4dff'
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
  } else if (screen.value === 'sp-result' || screen.value === 'mp-result') {
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
  gameStore.fetchLeaderboard('vocab-battle')
  gameStore.fetchPersonalBest('vocab-battle')
}

// ── Single Player ──

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
    const pair = resolveWordPair(currentSPQuestion.value)
    if (pair) store.addWrongWord({ ...pair, level: spLastLevel.value })
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
  const pair = resolveWordPair(currentSPQuestion.value)
  if (pair) store.addWrongWord({ ...pair, level: spLastLevel.value })
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
    gameStore.submitScore('vocab-battle', st.score).then(() => {
      gameStore.fetchLeaderboard('vocab-battle')
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
    const pair = resolveWordPair(origQ)
    if (pair) store.addWrongWord({ ...pair, level: store.room?.settings?.level || 'A1' })
    triggerHeartDamage()
    if (mpLocalHearts.value <= 0) {
      return
    }
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
  const pair = resolveWordPair(origQ)
  if (pair) store.addWrongWord({ ...pair, level: store.room?.settings?.level || 'A1' })
  triggerHeartDamage()

  store.multiTimeOut(mpLocalQIndex.value)

  if (mpLocalHearts.value <= 0) {
    return
  }

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
  if (miniGameInterval) {
    clearInterval(miniGameInterval)
    miniGameInterval = null
  }
}

// ==================== WATCHERS ====================

// Watch screen changes for physics FX init/cleanup
watch(screen, async (newScreen, oldScreen) => {
  if (oldScreen === 'sp-game') spFx.cleanup()
  if (oldScreen === 'mp-game') mpFx.cleanup()
  if (oldScreen === 'sp-result' || oldScreen === 'mp-result') confettiFx.cleanup()

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
        palette: isWinner ? ['#FFD740', '#7C4DFF', '#E040FB', '#FFB74D'] : undefined,
      })
    }
  }
})

// Watch MP room status changes
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

// Watch if room is deleted
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
  if ((screen.value === 'sp-result' && spConfettiCanvas.value) ||
      (screen.value === 'mp-result' && mpConfettiCanvas.value)) {
    const canvas = spConfettiCanvas.value || mpConfettiCanvas.value
    const el = canvas?.parentElement
    if (el) confettiFx.resize(el.clientWidth, el.clientHeight)
  }
}

onMounted(() => {
  gameStore.fetchLeaderboard('vocab-battle')
  gameStore.fetchPersonalBest('vocab-battle')
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('resize', handleResize)
  spFx.cleanup()
  mpFx.cleanup()
  miniPhysics.cleanup()
  confettiFx.cleanup()
  if (screen.value === 'mp-lobby' || screen.value === 'mp-game') {
    store.leaveRoom()
  }
  store.cleanup()
})
</script>

<style scoped>
.vb-page {
  padding: 20px;
  min-height: 100vh;
}

.vb-container {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

/* ====== Back ====== */
.vb-back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b6c6f;
  font-size: 0.82rem;
  cursor: pointer;
  margin-bottom: 20px;
  transition: color 0.15s;
  width: fit-content;
}
.vb-back:hover { color: #e0e1e4; }

/* ====== Hero ====== */
.vb-hero {
  text-align: center;
  margin-bottom: 36px;
}
.vb-hero-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(124, 77, 255, 0.12);
  color: #7c4dff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid rgba(124, 77, 255, 0.2);
  box-shadow: 0 0 24px rgba(124, 77, 255, 0.12);
  animation: vb-hero-float 3s ease-in-out infinite alternate;
}
@keyframes vb-hero-float {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}
.vb-hero-title {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 16px rgba(124, 77, 255, 0.2);
  letter-spacing: 0.02em;
}
.vb-hero-sub {
  font-size: 0.85rem;
  color: #9e9fa3;
  margin-top: 6px;
}

/* ====== Mode Grid ====== */
.vb-mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.vb-mode-card {
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(35, 36, 42, 0.95));
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(80, 80, 110, 0.2);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.vb-mode-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(124, 77, 255, 0.08), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}
.vb-mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(124, 77, 255, 0.08);
  border-color: rgba(124, 77, 255, 0.25);
}
.vb-mode-card:hover::before {
  opacity: 1;
}
.vb-mode-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  position: relative;
  z-index: 1;
}
.vb-mode-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  position: relative;
  z-index: 1;
}
.vb-mode-desc {
  font-size: 0.75rem;
  color: #9e9fa3;
  margin-top: 6px;
  line-height: 1.45;
  position: relative;
  z-index: 1;
}
.vb-mode-badge {
  margin-top: 12px;
  font-size: 0.65rem;
  background: rgba(124, 77, 255, 0.12);
  color: #b39ddb;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  font-weight: 700;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(124, 77, 255, 0.15);
}

/* ====== Review Card (Menu) ====== */
.vb-review-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 16px 18px;
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(38, 38, 52, 0.9));
  border-radius: 14px;
  border: 1px solid rgba(255, 152, 0, 0.12);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.vb-review-card:hover {
  border-color: rgba(255, 152, 0, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
.vb-review-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 152, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.vb-review-card-body {
  flex: 1;
}
.vb-review-card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
}
.vb-review-card-sub {
  font-size: 0.72rem;
  color: #9e9fa3;
  margin-top: 2px;
}

/* ====== Leaderboard (Menu) ====== */
.vb-lb-section {
  margin-top: 24px;
  background: linear-gradient(145deg, rgba(25, 25, 38, 0.9), rgba(35, 36, 42, 0.9));
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(80, 80, 110, 0.2);
}
.vb-lb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 14px;
}
.vb-lb-personal {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #b0b1b4;
  padding: 8px 12px;
  background: rgba(255, 183, 77, 0.06);
  border-radius: 10px;
  border: 1px solid rgba(255, 183, 77, 0.1);
  margin-bottom: 12px;
}
.vb-lb-personal strong {
  color: #ffb74d;
}
.vb-lb-loading {
  text-align: center;
  padding: 20px;
}
.vb-lb-empty {
  text-align: center;
  padding: 20px;
  color: #6b6c6f;
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.vb-lb-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vb-lb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s;
}
.vb-lb-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.vb-lb-item-me {
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.12);
}
.vb-lb-rank {
  width: 28px;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 800;
  color: #6b6c6f;
  flex-shrink: 0;
}
.vb-lb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #9e9fa3;
  overflow: hidden;
  flex-shrink: 0;
}
.vb-lb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-lb-name {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e0e1e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vb-lb-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffb74d;
  font-variant-numeric: tabular-nums;
}

/* ====== Review Screen ====== */
.vb-review-empty {
  text-align: center;
  padding: 48px 20px;
  background: rgba(15, 15, 25, 0.5);
  border-radius: 20px;
  border: 1px solid rgba(102, 187, 106, 0.12);
}
.vb-review-empty-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #66bb6a;
  margin-top: 12px;
}
.vb-review-empty-sub {
  font-size: 0.82rem;
  color: #9e9fa3;
  margin-top: 4px;
}
.vb-review-hint {
  font-size: 0.72rem;
  color: #ff9800;
  text-align: center;
  margin-bottom: 12px;
}
.vb-review-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.vb-review-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}
.vb-review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(38, 38, 52, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(80, 80, 110, 0.15);
  transition: border-color 0.15s;
  gap: 10px;
}
.vb-review-item:hover {
  border-color: rgba(124, 77, 255, 0.2);
}
.vb-review-word-pair {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.vb-review-en {
  font-weight: 700;
  color: #fff;
  font-size: 0.88rem;
}
.vb-review-th {
  font-weight: 600;
  color: #b39ddb;
  font-size: 0.88rem;
}
.vb-review-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.vb-review-level-tag {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}
.vb-review-wrong-count {
  font-size: 0.68rem;
  color: #ef5350;
  font-weight: 700;
}
.vb-review-remove {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.vb-review-remove:hover {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

/* ====== Section Header ====== */
.vb-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.vb-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}
.vb-section-sub {
  font-size: 0.72rem;
  color: #6b6c6f;
}

/* ====== Level Grid ====== */
.vb-level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}
.vb-level-card {
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(35, 36, 42, 0.95));
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(80, 80, 110, 0.2);
}
.vb-level-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(124, 77, 255, 0.2);
}
.vb-level-accent {
  height: 3px;
}
.vb-level-body {
  padding: 14px;
}
.vb-level-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.vb-level-badge {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 8px;
}
.vb-level-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e0e1e4;
}
.vb-level-count {
  font-size: 0.68rem;
  color: #9e9fa3;
  margin-top: 2px;
}

/* ====== MP Actions ====== */
.vb-mp-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.vb-mp-action-card {
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(35, 36, 42, 0.95));
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(80, 80, 110, 0.2);
  cursor: pointer;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.vb-mp-action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
  border-color: rgba(124, 77, 255, 0.2);
}
.vb-mp-action-title {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin-top: 12px;
}
.vb-mp-action-desc {
  font-size: 0.72rem;
  color: #9e9fa3;
  margin-top: 6px;
}

/* ====== Settings Card ====== */
/* ====== Join Dialog (Werewolf style) ====== */
.vb-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vb-dialog {
  background: #2a2b30;
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  border: 1px solid rgba(58,59,62,0.4);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.vb-dialog-title {
  font-size: 1rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 16px;
}
.vb-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vb-dialog-label {
  font-size: 0.75rem;
  color: #9e9fa3;
}
.vb-dialog-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(58,59,62,0.3);
  border: 1px solid rgba(58,59,62,0.5);
  border-radius: 8px;
  color: #e0e1e4;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}
.vb-dialog-input:focus {
  border-color: #7c4dff;
}
.vb-dialog-input-code {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.vb-dialog-error {
  font-size: 0.72rem;
  color: #ef5350;
}
.vb-dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
.vb-dialog-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.vb-dialog-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.vb-dialog-btn-primary {
  background: linear-gradient(135deg, #7c4dff, #651fff);
  color: #fff;
  box-shadow: 0 4px 16px rgba(124,77,255,0.3);
}
.vb-dialog-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(124,77,255,0.4);
}
.vb-dialog-btn-ghost {
  background: transparent;
  color: #9e9fa3;
  padding: 8px 16px;
}
.vb-dialog-btn-ghost:hover {
  color: #e0e1e4;
}

.vb-settings-card {
  background: linear-gradient(145deg, rgba(25, 25, 38, 0.9), rgba(35, 36, 42, 0.9));
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(80, 80, 110, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.vb-setting-row {
  margin-bottom: 16px;
}
.vb-setting-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #9e9fa3;
  margin-bottom: 8px;
}
.vb-setting-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.vb-chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid rgba(58,59,62,0.4);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.vb-chip:hover { background: rgba(58,59,62,0.25); color: #9e9fa3; }
.vb-chip-active { border-color: #7c4dff; color: #7c4dff; background: rgba(124,77,255,0.12); }
.vb-chip-sm { padding: 3px 10px; font-size: 0.68rem; }
.vb-setting-hint {
  font-size: 0.68rem;
  color: #6b6c6f;
  margin-top: 4px;
}
.vb-slider { padding: 0 4px; }
.vb-btn-full { width: 100%; margin-top: 8px; }

/* ====== Lobby ====== */
.vb-lobby {
  background: linear-gradient(145deg, rgba(25, 25, 38, 0.9), rgba(35, 36, 42, 0.9));
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(80, 80, 110, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.vb-lobby-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(58,59,62,0.2);
}
.vb-lobby-code-label {
  font-size: 0.68rem;
  color: #6b6c6f;
}
.vb-lobby-code {
  font-size: 1.8rem;
  font-weight: 800;
  color: #7c4dff;
  letter-spacing: 4px;
  font-family: monospace;
}
.vb-lobby-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.vb-lobby-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #9e9fa3;
  background: rgba(58,59,62,0.25);
  padding: 4px 10px;
  border-radius: 20px;
}
.vb-lobby-settings {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(58,59,62,0.2);
}
.vb-lobby-players-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #9e9fa3;
  margin-bottom: 10px;
}
.vb-lobby-players {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.vb-lobby-player {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s;
}
.vb-lobby-player:hover { background: rgba(58,59,62,0.2); }
.vb-lobby-player-ready { background: rgba(102,187,106,0.06); }
.vb-lobby-player-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9e9fa3;
  overflow: hidden;
}
.vb-lobby-player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-lobby-player-name {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e0e1e4;
  display: flex;
  align-items: center;
  gap: 6px;
}
.vb-host-badge {
  font-size: 0.58rem;
  background: rgba(255,183,77,0.15);
  color: #ffb74d;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}
.vb-lobby-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ====== Physics FX Canvas ====== */
.vb-fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}
.vb-confetti-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.vb-mini-physics-wrap {
  width: 300px;
  height: 300px;
  margin: 0 auto 24px;
  cursor: pointer;
  user-select: none;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255, 152, 0, 0.25);
  background: rgba(10, 10, 20, 0.6);
  transition: box-shadow 0.3s;
}
.vb-mini-physics-wrap:active {
  transform: scale(0.97);
}
.vb-mini-physics-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.vb-mini-clicks-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3.5rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.15);
  pointer-events: none;
  text-shadow: 0 0 20px rgba(255, 152, 0, 0.2);
  font-variant-numeric: tabular-nums;
}

/* ====== Gameplay ====== */
.vb-game {
  position: relative;
  overflow: hidden;
}

/* ── HUD ── */
.vb-hud {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}
.vb-hud-panel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(15, 15, 25, 0.65);
  border-radius: 12px;
  border: 1px solid rgba(124, 77, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.vb-hud-score {
  border-color: rgba(255, 183, 77, 0.2);
}
.vb-hud-combo {
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 56px;
}
.vb-hud-combo-hot {
  border-color: rgba(255, 152, 0, 0.4);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 152, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.vb-hud-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
}
.vb-hud-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.vb-hud-qnum {
  font-size: 0.65rem;
  font-weight: 700;
  color: #7c4dff;
  background: rgba(124, 77, 255, 0.12);
  padding: 1px 10px;
  border-radius: 10px;
  letter-spacing: 0.05em;
}
.vb-hud-alive {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #90caf9;
}
.vb-game-hearts {
  display: flex;
  gap: 3px;
  filter: drop-shadow(0 0 4px rgba(244, 67, 54, 0.35));
}
.vb-heart-icon {
  transition: transform 0.2s, opacity 0.2s;
}
.vb-combo-hot {
  color: #ff9800 !important;
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
  animation: vb-combo-pulse 0.5s infinite alternate;
}
@keyframes vb-combo-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.18); }
}

/* ── Timer ── */
.vb-timer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.vb-timer-track {
  flex: 1;
  height: 8px;
  background: rgba(20, 20, 30, 0.6);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}
.vb-timer-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.1s linear, background 0.3s;
  box-shadow: 0 0 10px var(--timer-glow, rgba(102, 187, 106, 0.4));
  position: relative;
}
.vb-timer-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 3px 3px 0 0;
}
.vb-timer-text {
  font-size: 0.82rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
  text-align: right;
  text-shadow: 0 0 8px currentColor;
}

/* ── Question Card ── */
.vb-question-card {
  text-align: center;
  position: relative;
  padding: 32px 24px 28px;
  background: rgba(15, 15, 25, 0.5);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(6px);
}
.vb-question-direction {
  font-size: 0.75rem;
  color: #b39ddb;
  margin-bottom: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.vb-question-word {
  font-size: 2.4rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 28px;
  line-height: 1.3;
  text-shadow: 0 2px 16px rgba(124, 77, 255, 0.2);
  letter-spacing: 0.01em;
}

/* ── Feedback ── */
.vb-feedback {
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 24px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 800;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}
.vb-feedback-correct {
  background: rgba(102, 187, 106, 0.18);
  color: #66bb6a;
  box-shadow: 0 4px 24px rgba(102, 187, 106, 0.25), inset 0 0 16px rgba(102, 187, 106, 0.08);
  border: 1px solid rgba(102, 187, 106, 0.25);
}
.vb-feedback-wrong {
  background: rgba(239, 83, 80, 0.18);
  color: #ef5350;
  box-shadow: 0 4px 24px rgba(239, 83, 80, 0.25), inset 0 0 16px rgba(239, 83, 80, 0.08);
  border: 1px solid rgba(239, 83, 80, 0.25);
}
.vb-fade-enter-active, .vb-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.vb-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
.vb-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

/* ── Choices ── */
.vb-choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 540px;
  margin: 0 auto;
}
.vb-choice-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(30, 30, 42, 0.9), rgba(38, 38, 52, 0.9));
  border: 2px solid rgba(80, 80, 110, 0.25);
  color: #e0e1e4;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
.vb-choice-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(124, 77, 255, 0.1), transparent 60%);
  opacity: 0;
  transition: opacity 0.25s;
}
.vb-choice-btn:hover:not(:disabled) {
  border-color: rgba(124, 77, 255, 0.5);
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 24px rgba(124, 77, 255, 0.12), 0 4px 14px rgba(0, 0, 0, 0.3);
}
.vb-choice-btn:hover:not(:disabled)::before {
  opacity: 1;
}
.vb-choice-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
  transition-duration: 0.08s;
}
.vb-choice-letter {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(124, 77, 255, 0.12);
  border: 1px solid rgba(124, 77, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 800;
  color: #b39ddb;
  flex-shrink: 0;
  transition: all 0.2s;
}
.vb-choice-text {
  flex: 1;
  font-weight: 600;
  min-width: 0;
  word-break: break-word;
  position: relative;
  z-index: 1;
}
.vb-choice-correct {
  border-color: #66bb6a !important;
  background: linear-gradient(145deg, rgba(102, 187, 106, 0.15), rgba(102, 187, 106, 0.06)) !important;
  box-shadow: 0 0 24px rgba(102, 187, 106, 0.15), 0 4px 14px rgba(0, 0, 0, 0.2) !important;
}
.vb-choice-correct .vb-choice-letter {
  background: #66bb6a;
  border-color: #66bb6a;
  color: #fff;
  box-shadow: 0 0 12px rgba(102, 187, 106, 0.4);
}
.vb-choice-wrong {
  border-color: #ef5350 !important;
  background: linear-gradient(145deg, rgba(239, 83, 80, 0.15), rgba(239, 83, 80, 0.06)) !important;
  box-shadow: 0 0 24px rgba(239, 83, 80, 0.15), 0 4px 14px rgba(0, 0, 0, 0.2) !important;
}
.vb-choice-wrong .vb-choice-letter {
  background: #ef5350;
  border-color: #ef5350;
  color: #fff;
  box-shadow: 0 0 12px rgba(239, 83, 80, 0.4);
}
.vb-choice-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* ── Eliminated ── */
.vb-eliminated {
  text-align: center;
  padding: 48px 20px;
  background: rgba(15, 15, 25, 0.5);
  border-radius: 20px;
  border: 1px solid rgba(239, 83, 80, 0.15);
}
.vb-eliminated-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ef5350;
  margin-top: 14px;
  text-shadow: 0 0 20px rgba(239, 83, 80, 0.3);
}
.vb-eliminated-score {
  font-size: 0.95rem;
  color: #9e9fa3;
  margin-top: 8px;
}

/* ── MP Player Bar ── */
.vb-mp-players-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(15, 15, 25, 0.4);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.vb-mp-player-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 10px;
  background: rgba(40, 40, 55, 0.5);
  font-size: 0.68rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: opacity 0.3s;
}
.vb-mp-player-dead {
  opacity: 0.3;
  text-decoration: line-through;
}
.vb-mp-player-me {
  background: rgba(124, 77, 255, 0.12);
  border-color: rgba(124, 77, 255, 0.25);
}
.vb-mp-player-avatar-sm {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 600;
  color: #9e9fa3;
  overflow: hidden;
}
.vb-mp-player-avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-mp-player-name-sm {
  font-weight: 600;
  color: #e0e1e4;
}
.vb-mp-player-hearts-sm {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #9e9fa3;
}
.vb-mp-player-score-sm {
  margin-left: 4px;
  color: #ffb74d;
  font-weight: 600;
}
.vb-mp-player-qnum {
  font-size: 0.6rem;
  color: #b39ddb;
  font-weight: 700;
  background: rgba(124, 77, 255, 0.1);
  padding: 2px 7px;
  border-radius: 6px;
}

/* ====== Results ====== */
.vb-result {
  text-align: center;
  padding: 24px 0;
  position: relative;
  overflow: hidden;
}
.vb-result-trophy {
  font-size: 3.5rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 12px rgba(255, 183, 77, 0.3));
  animation: vb-trophy-float 2s ease-in-out infinite alternate;
}
@keyframes vb-trophy-float {
  from { transform: translateY(0); }
  to { transform: translateY(-6px); }
}
.vb-result-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
  text-shadow: 0 2px 12px rgba(124, 77, 255, 0.2);
}
.vb-result-score-wrap {
  margin-bottom: 28px;
}
.vb-result-score {
  font-size: 3rem;
  font-weight: 900;
  color: #ffb74d;
  text-shadow: 0 0 20px rgba(255, 183, 77, 0.3);
  font-variant-numeric: tabular-nums;
}
.vb-result-label {
  font-size: 0.72rem;
  color: #9e9fa3;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-top: 4px;
}
.vb-result-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;
}
.vb-result-stat {
  text-align: center;
  padding: 12px 16px;
  background: rgba(15, 15, 25, 0.5);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 80px;
}
.vb-result-stat-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
}
.vb-result-stat-label {
  font-size: 0.65rem;
  color: #9e9fa3;
  margin-top: 4px;
  font-weight: 600;
}
.vb-result-actions {
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Winner ── */
.vb-result-winner {
  margin: 16px 0;
}
.vb-result-winner-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #9e9fa3;
  margin: 0 auto 10px;
  overflow: hidden;
  border: 2px solid rgba(255, 183, 77, 0.3);
  box-shadow: 0 0 20px rgba(255, 183, 77, 0.15);
}
.vb-result-winner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vb-result-winner-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
}
.vb-result-winner-label {
  font-size: 0.7rem;
  color: #ffb74d;
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* ── Ranking ── */
.vb-result-ranking {
  background: rgba(15, 15, 25, 0.5);
  border-radius: 16px;
  padding: 14px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}
.vb-result-rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.15s;
}
.vb-result-rank-me {
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.15);
}
.vb-result-rank-pos {
  width: 28px;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 800;
  color: #6b6c6f;
}
.vb-result-rank-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e0e1e4;
}
.vb-result-rank-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffb74d;
}

/* ====== Mini Game Overlay ====== */
.vb-mini-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.vb-mini-content {
  text-align: center;
  max-width: 400px;
  padding: 36px;
}
.vb-mini-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #ff9800;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(255, 152, 0, 0.4);
}
.vb-mini-sub {
  font-size: 0.85rem;
  color: #b0b1b4;
  margin-bottom: 24px;
}
.vb-mini-timer {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 20px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
}
.vb-mini-target {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 152, 0, 0.12);
  color: #ff9800;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  cursor: pointer;
  transition: transform 0.08s, background 0.15s;
  user-select: none;
  border: 2px solid rgba(255, 152, 0, 0.2);
}
.vb-mini-target:active {
  transform: scale(0.9);
  background: rgba(255, 152, 0, 0.3);
}
.vb-mini-target-active {
  animation: vb-mini-glow 0.4s infinite alternate;
}
@keyframes vb-mini-glow {
  from { box-shadow: 0 0 15px rgba(255, 152, 0, 0.3); }
  to { box-shadow: 0 0 40px rgba(255, 152, 0, 0.6), 0 0 80px rgba(255, 152, 0, 0.15); }
}
.vb-mini-clicks {
  font-size: 1.3rem;
  font-weight: 900;
  color: #fff;
  margin-top: 4px;
}
.vb-mini-result {
  margin-top: 20px;
}
.vb-mini-result-clicks {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
}
.vb-mini-result-bonus {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ff9800;
  margin: 8px 0 16px;
  text-shadow: 0 0 12px rgba(255, 152, 0, 0.3);
}

/* ====== Heart Damage Vignette ====== */
.vb-heart-vignette {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  border-radius: 0;
  box-shadow: inset 0 0 80px 30px rgba(220, 30, 30, 0),
              inset 0 0 160px 60px rgba(220, 30, 30, 0);
}
.vb-heart-vignette-once {
  animation: vb-vignette-hit 0.6s ease-out forwards;
}
.vb-heart-vignette-loop {
  animation: vb-vignette-breathe 1.4s ease-in-out infinite;
}
@keyframes vb-vignette-hit {
  0%   { box-shadow: inset 0 0 80px 30px rgba(220, 30, 30, 0),   inset 0 0 160px 60px rgba(220, 30, 30, 0); }
  20%  { box-shadow: inset 0 0 100px 40px rgba(220, 30, 30, 0.55), inset 0 0 200px 80px rgba(180, 10, 10, 0.3); }
  100% { box-shadow: inset 0 0 80px 30px rgba(220, 30, 30, 0),   inset 0 0 160px 60px rgba(220, 30, 30, 0); }
}
@keyframes vb-vignette-breathe {
  0%, 100% { box-shadow: inset 0 0 70px 25px rgba(220, 30, 30, 0.15), inset 0 0 140px 50px rgba(180, 10, 10, 0.08); }
  50%      { box-shadow: inset 0 0 100px 40px rgba(220, 30, 30, 0.4),  inset 0 0 200px 70px rgba(180, 10, 10, 0.2); }
}

/* ====== Responsive ====== */
@media (max-width: 600px) {
  .vb-page { padding: 14px; }
  .vb-mode-grid { grid-template-columns: 1fr; }
  .vb-mp-actions { grid-template-columns: 1fr; }
  .vb-level-grid { grid-template-columns: 1fr 1fr; }
  .vb-choices { grid-template-columns: 1fr; }
  .vb-question-word { font-size: 1.7rem; }
  .vb-question-card { padding: 24px 16px 20px; }
  .vb-hud-panel { padding: 6px 10px; }
  .vb-hud-val { font-size: 0.95rem; }
  .vb-result-score { font-size: 2.2rem; }
  .vb-lobby-header { flex-direction: column; gap: 10px; text-align: center; }
  .vb-hero-title { font-size: 1.6rem; }
}
</style>
