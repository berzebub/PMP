<template>
  <q-page class="ww-page">
    <div class="ww-container">
      <!-- Header -->
      <div class="ww-header">
        <button class="ww-back-btn" @click="handleBack">
          <q-icon name="arrow_back" size="18px" />
          <span>Arcade</span>
        </button>
        <div class="ww-title">
          <q-icon name="pets" size="20px" style="color: #ef5350;" />
          <span>Werewolf</span>
          <span class="ww-subtitle">Multiplayer</span>
        </div>
        <div v-if="store.room?.roomCode" class="ww-room-code">
          <q-icon name="tag" size="14px" />
          <span>{{ store.room.roomCode }}</span>
        </div>
      </div>

      <!-- ==================== LOBBY ==================== -->
      <div v-if="view === 'lobby'" class="ww-lobby">
        <div class="ww-lobby-icon">🐺</div>
        <div class="ww-lobby-title">Werewolf</div>
        <div class="ww-lobby-desc">เกมหมาป่า แบบ Multiplayer 6-10 คน<br/>ใช้ไหวพริบหาหมาป่า หรือซ่อนตัวให้รอด!</div>

        <div class="ww-lobby-actions">
          <button class="ww-btn ww-btn-primary" @click="showCreate = true">
            <q-icon name="add_circle" size="18px" />
            <span>สร้างห้อง</span>
          </button>
          <button class="ww-btn ww-btn-secondary" @click="showJoin = true">
            <q-icon name="meeting_room" size="18px" />
            <span>เข้าห้อง</span>
          </button>
        </div>

        <div v-if="store.error" class="ww-error">{{ store.error }}</div>

        <!-- Create Dialog -->
        <div v-if="showCreate" class="ww-dialog-overlay" @click.self="showCreate = false">
          <div class="ww-dialog">
            <div class="ww-dialog-title">สร้างห้องใหม่</div>
            <div class="ww-dialog-body">
              <label class="ww-label">เวลากลางวัน (วินาที)</label>
              <input v-model.number="createSettings.dayDuration" type="number" min="30" max="180" class="ww-input" />
              <label class="ww-label">เวลากลางคืน (วินาที)</label>
              <input v-model.number="createSettings.nightDuration" type="number" min="15" max="60" class="ww-input" />
            </div>
            <div class="ww-dialog-actions">
              <button class="ww-btn ww-btn-ghost" @click="showCreate = false">ยกเลิก</button>
              <button class="ww-btn ww-btn-primary" @click="handleCreateRoom" :disabled="store.loading">
                <q-spinner-dots v-if="store.loading" size="14px" />
                <span v-else>สร้าง</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Join Dialog -->
        <div v-if="showJoin" class="ww-dialog-overlay" @click.self="showJoin = false">
          <div class="ww-dialog">
            <div class="ww-dialog-title">เข้าห้อง</div>
            <div class="ww-dialog-body">
              <label class="ww-label">รหัสห้อง (4 ตัวอักษร)</label>
              <input v-model="joinCode" maxlength="4" placeholder="ABCD" class="ww-input ww-input-code"
                     @keyup.enter="handleJoinRoom" />
            </div>
            <div class="ww-dialog-actions">
              <button class="ww-btn ww-btn-ghost" @click="showJoin = false">ยกเลิก</button>
              <button class="ww-btn ww-btn-primary" @click="handleJoinRoom" :disabled="store.loading || joinCode.length < 4">
                <q-spinner-dots v-if="store.loading" size="14px" />
                <span v-else>เข้าร่วม</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== WAITING ROOM ==================== -->
      <div v-else-if="view === 'waiting'" class="ww-waiting">
        <div class="ww-waiting-header">
          <div class="ww-waiting-title">ห้องรอ</div>
          <div class="ww-waiting-code">
            <span>รหัสห้อง:</span>
            <span class="ww-code-badge">{{ store.room?.roomCode }}</span>
            <button class="ww-copy-btn" @click="copyRoomCode">
              <q-icon name="content_copy" size="14px" />
            </button>
          </div>
        </div>

        <!-- Player List -->
        <div class="ww-player-list">
          <div v-for="pid in (store.room?.playerOrder || [])" :key="pid"
               class="ww-player-card" :class="{ 'ww-player-host': pid === store.room?.hostId, 'ww-player-ready': store.room?.players[pid]?.isReady }">
            <div class="ww-player-avatar">
              <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
              <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="ww-player-info">
              <div class="ww-player-name">{{ store.room?.players[pid]?.displayName || pid }}</div>
              <div class="ww-player-tags">
                <span v-if="pid === store.room?.hostId" class="ww-tag ww-tag-host">Host</span>
                <span v-if="store.room?.players[pid]?.isReady" class="ww-tag ww-tag-ready">Ready</span>
                <span v-if="pid === store.myId" class="ww-tag ww-tag-me">คุณ</span>
              </div>
            </div>
            <q-icon v-if="store.room?.players[pid]?.isReady" name="check_circle" size="20px" style="color: #66bb6a;" />
          </div>
        </div>

        <div class="ww-waiting-info">
          <q-icon name="people" size="16px" />
          <span>{{ store.playerCount }} / 10 คน (ต้องมีอย่างน้อย 6 คน)</span>
        </div>

        <!-- Role Config (Host only) -->
        <div v-if="store.isHost" class="ww-role-config">
          <div class="ww-config-title">
            <q-icon name="tune" size="16px" />
            <span>ตั้งค่าบทบาท</span>
            <button class="ww-btn-link" @click="applyRecommended">ใช้ค่าแนะนำ</button>
          </div>
          <div class="ww-role-grid">
            <div v-for="role in selectableRoles" :key="role.id" class="ww-role-item">
              <div class="ww-role-icon" :style="{ background: role.color + '20', color: role.color }">
                <span>{{ role.emoji }}</span>
              </div>
              <div class="ww-role-name">{{ role.name }}</div>
              <div class="ww-role-counter">
                <button class="ww-counter-btn" @click="adjustRole(role.id, -1)" :disabled="(roleConfig[role.id] || 0) <= 0">-</button>
                <span>{{ roleConfig[role.id] || 0 }}</span>
                <button class="ww-counter-btn" @click="adjustRole(role.id, 1)">+</button>
              </div>
            </div>
          </div>
          <div class="ww-role-summary">
            บทบาทที่กำหนด: {{ assignedCount }} / {{ store.playerCount }} คน
            <span v-if="villagerCount > 0">(ชาวบ้าน {{ villagerCount }} คน)</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="ww-waiting-actions">
          <button v-if="!store.isHost" class="ww-btn ww-btn-secondary" @click="store.toggleReady()">
            <q-icon :name="store.room?.players[store.myId]?.isReady ? 'close' : 'check'" size="18px" />
            <span>{{ store.room?.players[store.myId]?.isReady ? 'ยกเลิก Ready' : 'Ready' }}</span>
          </button>
          <button v-if="store.isHost" class="ww-btn ww-btn-primary" @click="handleStartGame"
                  :disabled="store.playerCount < 6 || !allReady">
            <q-icon name="play_arrow" size="20px" />
            <span>เริ่มเกม</span>
          </button>
          <button class="ww-btn ww-btn-ghost" @click="handleLeave">
            <q-icon name="logout" size="16px" />
            <span>ออกจากห้อง</span>
          </button>
        </div>
      </div>

      <!-- ==================== ROLE REVEAL ==================== -->
      <div v-else-if="view === 'role_reveal'" class="ww-reveal">
        <div class="ww-reveal-card" :class="{ 'ww-reveal-show': revealShow }">
          <div class="ww-reveal-emoji">{{ store.myRoleDef?.emoji || '❓' }}</div>
          <div class="ww-reveal-role" :style="{ color: store.myRoleDef?.color }">{{ store.myRoleDef?.name }}</div>
          <div class="ww-reveal-team" :class="store.myRoleDef?.team === 'wolf' ? 'ww-team-wolf' : 'ww-team-village'">
            ฝ่าย{{ store.myRoleDef?.team === 'wolf' ? 'หมาป่า' : 'ชาวบ้าน' }}
          </div>
          <div class="ww-reveal-desc">{{ store.myRoleDef?.description }}</div>
          <div v-if="store.mySecret?.wolfTeam?.length" class="ww-reveal-wolves">
            <div class="ww-reveal-wolves-title">หมาป่าในทีม:</div>
            <div v-for="wid in store.mySecret.wolfTeam" :key="wid" class="ww-reveal-wolf-name">
              🐺 {{ store.room?.players[wid]?.displayName || wid }}
            </div>
          </div>
        </div>
        <div class="ww-reveal-timer">เกมจะเริ่มใน {{ phaseCountdown }} วินาที</div>
      </div>

      <!-- ==================== GAME VIEW ==================== -->
      <div v-else-if="view === 'game'" class="ww-game">
        <!-- Phase Bar -->
        <div class="ww-phase-bar" :class="phaseBarClass">
          <div class="ww-phase-icon">{{ phaseIcon }}</div>
          <div class="ww-phase-text">{{ phaseText }}</div>
          <div class="ww-phase-timer">{{ phaseCountdown }}s</div>
          <div class="ww-phase-round">รอบ {{ store.room?.round }}</div>
        </div>

        <!-- My Role Badge -->
        <div v-if="store.myRoleDef" class="ww-my-role" :style="{ borderColor: store.myRoleDef.color + '40' }">
          <span class="ww-my-role-emoji">{{ store.myRoleDef.emoji }}</span>
          <div class="ww-my-role-info">
            <span class="ww-my-role-name" :style="{ color: store.myRoleDef.color }">{{ store.myRoleDef.name }}</span>
            <span class="ww-my-role-desc">{{ store.myRoleDef.description }}</span>
          </div>
        </div>

        <!-- Player Circle -->
        <div class="ww-circle">
          <div v-for="(pid, idx) in (store.room?.playerOrder || [])" :key="pid"
               class="ww-seat" :style="seatStyle(idx)"
               :class="{
                 'ww-seat-dead': !store.room?.players[pid]?.isAlive,
                 'ww-seat-me': pid === store.myId,
                 'ww-seat-selected': selectedTarget === pid,
                 'ww-seat-voted': currentPhaseVoted(pid),
                 'ww-seat-clickable': canSelectTarget(pid)
               }"
               @click="handleSelectPlayer(pid)">
            <div class="ww-seat-avatar">
              <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
              <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
              <div v-if="!store.room?.players[pid]?.isAlive" class="ww-seat-dead-overlay">💀</div>
              <div v-if="isWolfAlly(pid)" class="ww-seat-wolf-badge">🐺</div>
            </div>
            <div class="ww-seat-name">{{ shortName(store.room?.players[pid]?.displayName || pid) }}</div>
            <div v-if="getVoteCount(pid) > 0" class="ww-seat-votes">{{ getVoteCount(pid) }}</div>
            <!-- Wolf night target indicator: show other wolves' targets -->
            <div v-if="getWolfTargetCount(pid) > 0 && isNightPhase && store.myRole === 'werewolf'"
                 class="ww-seat-wolf-target">
              🐺 {{ getWolfTargetCount(pid) }}
            </div>
            <!-- Show role after death or game over -->
            <div v-if="showPlayerRole(pid)" class="ww-seat-role" :style="{ color: getPlayerRoleColor(pid) }">
              {{ getPlayerRoleEmoji(pid) }}
            </div>
          </div>
        </div>

        <!-- Night Action Result Banner -->
        <div v-if="store.room?.phase === 'night_result' && store.room?.lastNightResult" class="ww-result-banner">
          <template v-if="store.room.lastNightResult.killedId">
            <div class="ww-result-icon">💀</div>
            <div class="ww-result-text">
              {{ store.room.players[store.room.lastNightResult.killedId]?.displayName }} ถูกหมาป่ากัดตาย!
            </div>
          </template>
          <template v-else-if="store.room.lastNightResult.savedByDoctor">
            <div class="ww-result-icon">🛡️</div>
            <div class="ww-result-text">มีคนได้รับการปกป้อง! ไม่มีใครตาย</div>
          </template>
          <template v-else>
            <div class="ww-result-icon">🌅</div>
            <div class="ww-result-text">คืนนี้สงบสุข ไม่มีใครตาย</div>
          </template>
        </div>

        <!-- Vote Result Banner -->
        <div v-if="store.room?.phase === 'vote_result' && store.room?.lastVoteResult" class="ww-result-banner">
          <template v-if="store.room.lastVoteResult.eliminatedId">
            <div class="ww-result-icon">⚖️</div>
            <div class="ww-result-text">
              {{ store.room.players[store.room.lastVoteResult.eliminatedId]?.displayName }} ถูกโหวตกำจัด!
            </div>
          </template>
          <template v-else>
            <div class="ww-result-icon">🤷</div>
            <div class="ww-result-text">ไม่มีเสียงข้างมาก ไม่มีใครถูกกำจัด</div>
          </template>
        </div>

        <!-- Action Panel -->
        <div v-if="store.isAlive && showActionPanel" class="ww-action-panel">
          <!-- Night actions -->
          <template v-if="isNightPhase && store.myRoleDef?.hasNightAction">
            <div class="ww-action-title">
              <span>{{ store.myRoleDef.emoji }} {{ store.myRoleDef.nightPrompt }}</span>
            </div>
            <div v-if="nightActionSubmitted" class="ww-action-done">
              <q-icon name="check_circle" size="20px" style="color: #66bb6a;" />
              <span>เลือก {{ store.room?.players[selectedTarget]?.displayName }} แล้ว รอผู้เล่นอื่น...</span>
            </div>
            <template v-else>
              <!-- Witch special UI -->
              <div v-if="store.myRole === 'witch'" class="ww-witch-actions">
                <button v-if="store.mySecret?.hasSavePotion" class="ww-btn ww-btn-heal"
                        @click="handleWitchAction('save')" :disabled="!store.room?.lastNightResult?.killedId">
                  <span>💊 ยาช่วยชีวิต</span>
                </button>
                <button v-if="store.mySecret?.hasPoisonPotion" class="ww-btn ww-btn-poison"
                        @click="witchMode = 'poison'">
                  <span>☠️ ยาพิษ</span>
                </button>
                <button class="ww-btn ww-btn-ghost" @click="handleSkipNight">ไม่ใช้ยา</button>
              </div>
              <div v-else class="ww-action-hint">เลือกผู้เล่นจากวงด้านบน</div>
            </template>
          </template>

          <!-- Day vote -->
          <template v-if="store.room?.phase === 'day_vote'">
            <div class="ww-action-title">🗳️ เลือกคนที่จะกำจัด</div>
            <div v-if="hasVoted" class="ww-action-done">
              <q-icon name="check_circle" size="20px" style="color: #66bb6a;" />
              <span>โหวตแล้ว รอผู้เล่นอื่น...</span>
            </div>
            <template v-else>
              <div class="ww-action-hint">เลือกผู้เล่นจากวงด้านบน หรือ</div>
              <button class="ww-btn ww-btn-ghost" @click="handleSkipVote">งดออกเสียง</button>
            </template>
          </template>

          <!-- Seer investigation result -->
          <div v-if="store.myRole === 'seer' && store.mySecret?.lastInvestigation && store.room?.phase === 'night_result'" class="ww-seer-result">
            <div class="ww-seer-title">🔮 ผลการตรวจสอบ</div>
            <div class="ww-seer-target">
              {{ store.room?.players[store.mySecret.lastInvestigation.target]?.displayName }}
              <span :class="store.mySecret.lastInvestigation.isWolf ? 'ww-seer-wolf' : 'ww-seer-safe'">
                {{ store.mySecret.lastInvestigation.isWolf ? '🐺 เป็นหมาป่า!' : '✅ ไม่ใช่หมาป่า' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dead player notice -->
        <div v-if="!store.isAlive && store.room?.phase !== 'game_over'" class="ww-dead-notice">
          <span class="ww-dead-ghost-icon">👻</span>
          <span>คุณตายแล้ว กำลังดูเกมในฐานะผี — แชทกับผีคนอื่นได้ด้านล่าง</span>
        </div>

        <!-- Chat Panel -->
        <div class="ww-chat" :class="{ 'ww-chat-night': isNightPhase && store.isAlive, 'ww-chat-ghost': !store.isAlive }">
          <div class="ww-chat-header">
            <q-icon :name="isNightPhase && store.myRole === 'werewolf' ? 'forum' : 'chat'" size="16px" />
            <span>{{ chatTitle }}</span>
          </div>
          <div class="ww-chat-messages" ref="chatMessages">
            <div v-for="msg in filteredMessages" :key="msg.id"
                 class="ww-msg" :class="{
                   'ww-msg-system': msg.senderId === 'system',
                   'ww-msg-me': msg.senderId === store.myId,
                   'ww-msg-wolf': msg.channel === 'wolf',
                   'ww-msg-ghost': msg.channel === 'ghost'
                 }">
              <span v-if="msg.channel === 'ghost' && msg.senderId !== store.myId" class="ww-msg-channel-tag ww-tag-ghost">👻</span>
              <span v-if="msg.channel === 'wolf' && msg.senderId !== store.myId" class="ww-msg-channel-tag ww-tag-wolf">🐺</span>
              <span v-if="msg.senderId !== 'system' && msg.senderId !== store.myId" class="ww-msg-name">{{ msg.senderName }}</span>
              <span class="ww-msg-text">{{ msg.text }}</span>
            </div>
          </div>
          <div v-if="canChat" class="ww-chat-input">
            <input v-model="chatText" :placeholder="!store.isAlive ? '👻 คุยกับผีคนอื่น...' : 'พิมพ์ข้อความ...'" @keyup.enter="handleSend" maxlength="200" />
            <button @click="handleSend" :disabled="!chatText.trim()">
              <q-icon name="send" size="18px" />
            </button>
          </div>
        </div>
      </div>

      <!-- ==================== GAME OVER ==================== -->
      <div v-else-if="view === 'game_over'" class="ww-gameover">
        <div class="ww-gameover-banner" :class="store.room?.winner === 'wolf' ? 'ww-win-wolf' : 'ww-win-village'">
          <div class="ww-gameover-emoji">{{ store.room?.winner === 'wolf' ? '🐺' : '🎉' }}</div>
          <div class="ww-gameover-title">
            {{ store.room?.winner === 'wolf' ? 'ฝ่ายหมาป่าชนะ!' : 'ฝ่ายชาวบ้านชนะ!' }}
          </div>
        </div>

        <!-- All roles revealed -->
        <div class="ww-gameover-roles">
          <div class="ww-gameover-roles-title">เปิดเผยบทบาททั้งหมด</div>
          <div class="ww-gameover-role-list">
            <div v-for="pid in (store.room?.playerOrder || [])" :key="pid" class="ww-gameover-player">
              <div class="ww-gameover-avatar">
                <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
                <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="ww-gameover-info">
                <div class="ww-gameover-name">{{ store.room?.players[pid]?.displayName }}</div>
                <div class="ww-gameover-role-badge" :style="{ color: getRevealedRoleColor(pid) }">
                  {{ getRevealedRoleEmoji(pid) }} {{ getRevealedRoleName(pid) }}
                </div>
              </div>
              <div class="ww-gameover-status">
                <span v-if="store.room?.players[pid]?.isAlive" style="color: #66bb6a;">รอดชีวิต</span>
                <span v-else style="color: #9e9fa3;">ตาย</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ww-gameover-actions">
          <button class="ww-btn ww-btn-primary" @click="handleBack">
            <q-icon name="home" size="18px" />
            <span>กลับ Arcade</span>
          </button>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useWerewolfStore } from 'src/stores/werewolf'
import { ROLES, getRecommendedConfig, getSelectableRoles } from 'src/data/werewolfRoles'

const router = useRouter()
const store = useWerewolfStore()

// ==================== LOCAL STATE ====================

const showCreate = ref(false)
const showJoin = ref(false)
const joinCode = ref('')
const chatText = ref('')
const selectedTarget = ref(null)
const nightActionSubmitted = ref(false)
const hasVoted = ref(false)
const revealShow = ref(false)
const witchMode = ref(null)
const chatMessages = ref(null)

const createSettings = ref({ dayDuration: 90, nightDuration: 30 })

const roleConfig = ref({})
const selectableRoles = getSelectableRoles()

// All revealed roles (populated at game over)
const revealedRoles = ref({})

// ==================== COMPUTED ====================

const view = computed(() => {
  if (!store.room) return 'lobby'
  if (store.room.status === 'waiting') return 'waiting'
  if (store.room.phase === 'role_reveal') return 'role_reveal'
  if (store.room.phase === 'game_over') return 'game_over'
  if (store.room.status === 'playing') return 'game'
  return 'lobby'
})

const isNightPhase = computed(() => {
  const p = store.room?.phase
  return p === 'night' || p === 'night_result'
})

const phaseBarClass = computed(() => {
  const p = store.room?.phase
  if (p === 'night' || p === 'night_result') return 'ww-phase-night'
  if (p === 'day_discussion' || p === 'day_vote' || p === 'vote_result') return 'ww-phase-day'
  return ''
})

const phaseIcon = computed(() => {
  const p = store.room?.phase
  if (p === 'night') return '🌙'
  if (p === 'night_result') return '💀'
  if (p === 'day_discussion') return '☀️'
  if (p === 'day_vote') return '🗳️'
  if (p === 'vote_result') return '⚖️'
  return '🎮'
})

const phaseText = computed(() => {
  const p = store.room?.phase
  if (p === 'night') return 'กลางคืน'
  if (p === 'night_result') return 'ผลกลางคืน'
  if (p === 'day_discussion') return 'อภิปราย'
  if (p === 'day_vote') return 'โหวต'
  if (p === 'vote_result') return 'ผลโหวต'
  return ''
})

const phaseCountdown = computed(() => {
  if (!store.room?.phaseEndAt) return 0
  const endMs = store.room.phaseEndAt.toMillis ? store.room.phaseEndAt.toMillis() : store.room.phaseEndAt.seconds * 1000
  const left = Math.max(0, Math.ceil((endMs - now.value) / 1000))
  return left
})

const showActionPanel = computed(() => {
  const p = store.room?.phase
  return p === 'night' || p === 'day_vote' || p === 'night_result'
})

const canChat = computed(() => {
  const p = store.room?.phase
  if (!p || p === 'game_over') return false

  // Dead players can always chat in ghost channel
  if (!store.isAlive) return true

  // Living players: day discussion/vote = public, night wolves = wolf
  if (p === 'day_discussion' || p === 'day_vote') return true
  if (isNightPhase.value && store.myRole === 'werewolf') return true
  return false
})

const chatTitle = computed(() => {
  if (!store.isAlive) return '👻 Ghost Chat (คนตายคุยกัน)'
  if (isNightPhase.value && store.myRole === 'werewolf') return '🐺 Wolf Chat (ลับ)'
  return '💬 แชท'
})

const filteredMessages = computed(() => {
  return store.messages.filter(msg => {
    // System messages always visible
    if (msg.senderId === 'system') return true

    // Ghost channel: visible only to dead players or at game over
    if (msg.channel === 'ghost') {
      return !store.isAlive || store.room?.phase === 'game_over'
    }
    // Wolf channel: visible only to wolves or at game over
    if (msg.channel === 'wolf') {
      return store.myRole === 'werewolf' || store.room?.phase === 'game_over'
    }
    return true
  })
})

const assignedCount = computed(() => {
  return Object.values(roleConfig.value).reduce((sum, v) => sum + v, 0)
})

const villagerCount = computed(() => {
  return Math.max(0, store.playerCount - assignedCount.value)
})

const allReady = computed(() => {
  if (!store.room?.players) return false
  const players = store.room.players
  for (const [pid, p] of Object.entries(players)) {
    if (pid !== store.room.hostId && !p.isReady) return false
  }
  return true
})

// ==================== PHASE TIMER ====================

const now = ref(Date.now())
let countdownInterval = null

onMounted(() => {
  countdownInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  store.cleanup()
})

// ==================== WATCHERS ====================

watch(() => store.room?.phase, (newPhase, oldPhase) => {
  if (newPhase === 'role_reveal') {
    setTimeout(() => { revealShow.value = true }, 300)
  }
  if (newPhase === 'night' || newPhase === 'day_vote') {
    selectedTarget.value = null
    nightActionSubmitted.value = false
    hasVoted.value = false
    witchMode.value = null
  }
  if (newPhase === 'game_over') {
    fetchAllRoles()
  }
})

watch(() => store.messages.length, () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
})

// ==================== METHODS ====================

async function handleCreateRoom() {
  const result = await store.createRoom(createSettings.value)
  if (result) showCreate.value = false
}

async function handleJoinRoom() {
  const result = await store.joinRoom(joinCode.value)
  if (result) showJoin.value = false
}

function handleBack() {
  store.cleanup()
  router.push('/games')
}

async function handleLeave() {
  await store.leaveRoom()
}

async function handleStartGame() {
  await store.startGame(roleConfig.value)
}

function applyRecommended() {
  const config = getRecommendedConfig(store.playerCount)
  roleConfig.value = { ...config }
}

function adjustRole(roleId, delta) {
  const current = roleConfig.value[roleId] || 0
  const next = Math.max(0, current + delta)
  if (next === 0) {
    const c = { ...roleConfig.value }
    delete c[roleId]
    roleConfig.value = c
  } else {
    roleConfig.value = { ...roleConfig.value, [roleId]: next }
  }
}

function copyRoomCode() {
  if (store.room?.roomCode) {
    navigator.clipboard?.writeText(store.room.roomCode)
  }
}

function seatStyle(idx) {
  const total = store.room?.playerOrder?.length || 1
  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
  const rx = 42 // % radius x
  const ry = 38 // % radius y
  return {
    left: `calc(50% + ${Math.cos(angle) * rx}% - 28px)`,
    top: `calc(50% + ${Math.sin(angle) * ry}% - 28px)`
  }
}

function shortName(name) {
  if (!name) return '?'
  return name.length > 8 ? name.substring(0, 7) + '.' : name
}

function canSelectTarget(pid) {
  if (pid === store.myId) return false
  if (!store.room?.players[pid]?.isAlive) return false
  if (!store.isAlive) return false

  const phase = store.room?.phase
  if (phase === 'night' && store.myRoleDef?.hasNightAction && !nightActionSubmitted.value) {
    if (store.myRole === 'witch') return witchMode.value === 'poison'
    // Werewolves cannot target fellow wolves at night
    if (store.myRole === 'werewolf') {
      const wolfTeam = store.mySecret?.wolfTeam || []
      if (wolfTeam.includes(pid)) return false
    }
    return true
  }
  if (phase === 'day_vote' && !hasVoted.value) return true
  return false
}

async function handleSelectPlayer(pid) {
  if (!canSelectTarget(pid)) return
  selectedTarget.value = pid

  const phase = store.room?.phase
  if (phase === 'night') {
    if (store.myRole === 'witch' && witchMode.value === 'poison') {
      await store.submitNightAction('poison', pid)
      nightActionSubmitted.value = true
    } else {
      await store.submitNightAction(store.myRole, pid)
      nightActionSubmitted.value = true
    }
  } else if (phase === 'day_vote') {
    await store.submitVote(pid)
    hasVoted.value = true
  }
}

async function handleWitchAction(action) {
  if (action === 'save') {
    await store.submitNightAction('save', store.room?.lastNightResult?.killedId)
    nightActionSubmitted.value = true
  }
}

async function handleSkipNight() {
  await store.submitNightAction('skip', null)
  nightActionSubmitted.value = true
}

async function handleSkipVote() {
  await store.submitVote('skip')
  hasVoted.value = true
}

async function handleSend() {
  if (!chatText.value.trim()) return
  let channel = 'public'
  if (!store.isAlive) {
    channel = 'ghost'
  } else if (isNightPhase.value && store.myRole === 'werewolf') {
    channel = 'wolf'
  }
  await store.sendMessage(chatText.value, channel)
  chatText.value = ''
}

function currentPhaseVoted(pid) {
  if (store.room?.phase !== 'day_vote') return false
  const votes = store.room?.currentVotes || {}
  return Object.values(votes).includes(pid)
}

function getVoteCount(pid) {
  if (store.room?.phase !== 'day_vote') return 0
  const votes = store.room?.currentVotes || {}
  return Object.values(votes).filter(v => v === pid).length
}

// Check if a player is a fellow wolf (visible only during game, not game_over)
function isWolfAlly(pid) {
  if (store.myRole !== 'werewolf') return false
  if (store.room?.phase === 'game_over') return false
  if (pid === store.myId) return false
  const wolfTeam = store.mySecret?.wolfTeam || []
  return wolfTeam.includes(pid)
}

// Wolf night target count (how many wolves are targeting this player)
function getWolfTargetCount(pid) {
  const targets = store.wolfNightTargets || {}
  let count = 0
  for (const [wolfId, targetId] of Object.entries(targets)) {
    // Show other wolves' targets (not our own)
    if (wolfId !== store.myId && targetId === pid) count++
  }
  return count
}

// Role display helpers
function showPlayerRole(pid) {
  if (store.room?.phase === 'game_over') return true
  if (!store.room?.players[pid]?.isAlive) {
    const log = store.room?.eliminationLog || []
    return log.some(e => e.playerId === pid)
  }
  return false
}

function getPlayerRoleFromLog(pid) {
  const log = store.room?.eliminationLog || []
  const entry = log.find(e => e.playerId === pid)
  return entry?.role || revealedRoles.value[pid] || null
}

function getPlayerRoleColor(pid) {
  const role = getPlayerRoleFromLog(pid)
  return ROLES[role]?.color || '#9e9fa3'
}

function getPlayerRoleEmoji(pid) {
  const role = getPlayerRoleFromLog(pid)
  return ROLES[role]?.emoji || '❓'
}

function getRevealedRoleColor(pid) {
  const role = revealedRoles.value[pid]
  return ROLES[role]?.color || '#9e9fa3'
}

function getRevealedRoleEmoji(pid) {
  const role = revealedRoles.value[pid]
  return ROLES[role]?.emoji || '❓'
}

function getRevealedRoleName(pid) {
  const role = revealedRoles.value[pid]
  return ROLES[role]?.name || 'ไม่ทราบ'
}

function fetchAllRoles() {
  // Read revealedRoles from room doc (written by host at endGame)
  if (store.room?.revealedRoles) {
    revealedRoles.value = { ...store.room.revealedRoles }
    return
  }
  // Fallback: use elimination log + own secret
  const log = store.room?.eliminationLog || []
  const roles = {}
  for (const entry of log) {
    roles[entry.playerId] = entry.role
  }
  if (store.mySecret?.role) {
    roles[store.myId] = store.mySecret.role
  }
  revealedRoles.value = roles
}
</script>

<style scoped>
.ww-page { padding: 24px; min-height: 100vh; }
.ww-container { max-width: 900px; margin: 0 auto; }

/* ====== Header ====== */
.ww-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.ww-back-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.3);
  color: #9e9fa3; padding: 6px 14px; border-radius: 8px;
  cursor: pointer; font-size: 0.78rem; font-weight: 500; transition: all 0.15s;
}
.ww-back-btn:hover { background: rgba(58,59,62,0.5); color: #e0e1e4; }
.ww-title { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; font-weight: 700; color: #e0e1e4; }
.ww-subtitle { font-size: 0.72rem; color: #6b6c6f; font-weight: 500; }
.ww-room-code {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 700; color: #ef5350;
  background: rgba(239,83,80,0.1); padding: 4px 12px; border-radius: 16px;
}

/* ====== Buttons ====== */
.ww-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px;
  border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.ww-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ww-btn-primary {
  background: linear-gradient(135deg, #ef5350, #ff7043); color: #fff;
  box-shadow: 0 4px 16px rgba(239,83,80,0.3);
}
.ww-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(239,83,80,0.4); }
.ww-btn-secondary { background: rgba(58,59,62,0.4); color: #e0e1e4; border: 1px solid rgba(58,59,62,0.5); }
.ww-btn-secondary:hover:not(:disabled) { background: rgba(58,59,62,0.6); }
.ww-btn-ghost { background: transparent; color: #9e9fa3; padding: 8px 16px; }
.ww-btn-ghost:hover { color: #e0e1e4; }
.ww-btn-heal { background: rgba(66,165,245,0.2); color: #42a5f5; border: 1px solid rgba(66,165,245,0.3); }
.ww-btn-poison { background: rgba(126,87,194,0.2); color: #7e57c2; border: 1px solid rgba(126,87,194,0.3); }
.ww-btn-link { background: none; border: none; color: #ef5350; font-size: 0.72rem; cursor: pointer; padding: 2px 6px; }

/* ====== Lobby ====== */
.ww-lobby { text-align: center; padding: 60px 0; }
.ww-lobby-icon { font-size: 3rem; margin-bottom: 8px; }
.ww-lobby-title { font-size: 1.6rem; font-weight: 800; color: #e0e1e4; }
.ww-lobby-desc { font-size: 0.82rem; color: #9e9fa3; margin-top: 8px; line-height: 1.6; }
.ww-lobby-actions { display: flex; gap: 12px; justify-content: center; margin-top: 28px; }
.ww-error { margin-top: 16px; font-size: 0.78rem; color: #ef5350; }

/* ====== Dialogs ====== */
.ww-dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.ww-dialog {
  background: #2a2b30; border-radius: 16px; padding: 24px; min-width: 320px;
  border: 1px solid rgba(58,59,62,0.4); box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.ww-dialog-title { font-size: 1rem; font-weight: 700; color: #e0e1e4; margin-bottom: 16px; }
.ww-dialog-body { display: flex; flex-direction: column; gap: 10px; }
.ww-dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.ww-label { font-size: 0.75rem; color: #9e9fa3; }
.ww-input {
  width: 100%; padding: 8px 12px; background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.5);
  border-radius: 8px; color: #e0e1e4; font-size: 0.85rem; outline: none;
}
.ww-input:focus { border-color: #ef5350; }
.ww-input-code { text-align: center; font-size: 1.4rem; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; }

/* ====== Waiting Room ====== */
.ww-waiting { display: flex; flex-direction: column; }
.ww-waiting-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ww-waiting-title { font-size: 1.1rem; font-weight: 700; color: #e0e1e4; }
.ww-waiting-code { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #9e9fa3; }
.ww-code-badge { font-size: 1.1rem; font-weight: 800; color: #ef5350; letter-spacing: 0.1em; }
.ww-copy-btn { background: none; border: none; color: #9e9fa3; cursor: pointer; padding: 4px; }

.ww-player-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 16px; }
.ww-player-card {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: #23242a; border-radius: 10px; border: 1px solid rgba(58,59,62,0.3);
  transition: all 0.15s;
}
.ww-player-host { border-color: rgba(239,83,80,0.3); }
.ww-player-ready { border-color: rgba(102,187,106,0.3); background: rgba(102,187,106,0.05); }
.ww-player-avatar {
  width: 36px; height: 36px; min-width: 36px; border-radius: 50%; background: #2a2b2e;
  display: flex; align-items: center; justify-content: center; font-size: 0.78rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden;
}
.ww-player-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ww-player-info { flex: 1; min-width: 0; }
.ww-player-name { font-size: 0.82rem; font-weight: 600; color: #e0e1e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ww-player-tags { display: flex; gap: 4px; margin-top: 2px; }
.ww-tag { font-size: 0.6rem; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
.ww-tag-host { background: rgba(239,83,80,0.15); color: #ef5350; }
.ww-tag-ready { background: rgba(102,187,106,0.15); color: #66bb6a; }
.ww-tag-me { background: rgba(66,165,245,0.15); color: #42a5f5; }

.ww-waiting-info { font-size: 0.78rem; color: #9e9fa3; display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }

/* ====== Role Config ====== */
.ww-role-config {
  background: #23242a; border-radius: 12px; padding: 16px; margin-bottom: 16px;
  border: 1px solid rgba(58,59,62,0.3);
}
.ww-config-title { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: #e0e1e4; margin-bottom: 12px; }
.ww-role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.ww-role-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  background: rgba(58,59,62,0.15); border-radius: 8px;
}
.ww-role-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.ww-role-name { flex: 1; font-size: 0.78rem; font-weight: 600; color: #e0e1e4; }
.ww-role-counter { display: flex; align-items: center; gap: 6px; }
.ww-counter-btn {
  width: 22px; height: 22px; border-radius: 50%; background: rgba(58,59,62,0.4);
  border: 1px solid rgba(58,59,62,0.6); color: #e0e1e4; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.ww-counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.ww-role-summary { margin-top: 10px; font-size: 0.72rem; color: #9e9fa3; }

.ww-waiting-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ====== Role Reveal ====== */
.ww-reveal { text-align: center; padding: 60px 0; }
.ww-reveal-card {
  display: inline-block; padding: 32px 48px; background: #23242a; border-radius: 20px;
  border: 2px solid rgba(58,59,62,0.4); transform: scale(0.5) rotateY(90deg);
  opacity: 0; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ww-reveal-show { transform: scale(1) rotateY(0); opacity: 1; }
.ww-reveal-emoji { font-size: 3rem; margin-bottom: 8px; }
.ww-reveal-role { font-size: 1.6rem; font-weight: 800; }
.ww-reveal-team { font-size: 0.85rem; font-weight: 600; margin-top: 4px; }
.ww-team-wolf { color: #ef5350; }
.ww-team-village { color: #66bb6a; }
.ww-reveal-desc { font-size: 0.78rem; color: #9e9fa3; margin-top: 10px; max-width: 300px; margin-inline: auto; }
.ww-reveal-wolves { margin-top: 16px; padding: 10px 16px; background: rgba(239,83,80,0.1); border-radius: 10px; }
.ww-reveal-wolves-title { font-size: 0.75rem; color: #ef5350; font-weight: 600; margin-bottom: 4px; }
.ww-reveal-wolf-name { font-size: 0.82rem; color: #e0e1e4; }
.ww-reveal-timer { margin-top: 24px; font-size: 0.82rem; color: #9e9fa3; }

/* ====== Game View ====== */
.ww-game { display: flex; flex-direction: column; }

/* Phase Bar */
.ww-phase-bar {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  border-radius: 12px; margin-bottom: 16px; transition: all 0.3s;
}
.ww-phase-night { background: rgba(26,27,50,0.8); border: 1px solid rgba(63,81,181,0.3); }
.ww-phase-day { background: rgba(50,40,20,0.6); border: 1px solid rgba(255,183,77,0.3); }
.ww-phase-icon { font-size: 1.2rem; }
.ww-phase-text { font-size: 0.92rem; font-weight: 700; color: #e0e1e4; }
.ww-phase-timer {
  margin-left: auto; font-size: 1rem; font-weight: 800; color: #ffb74d;
  font-variant-numeric: tabular-nums;
}
.ww-phase-round { font-size: 0.72rem; color: #9e9fa3; }

/* My Role Badge */
.ww-my-role {
  display: flex; align-items: center; gap: 10px; padding: 8px 14px;
  background: rgba(35,36,42,0.8); border: 1px solid; border-radius: 10px;
  margin-bottom: 12px;
}
.ww-my-role-emoji { font-size: 1.4rem; }
.ww-my-role-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ww-my-role-name { font-size: 0.82rem; font-weight: 700; }
.ww-my-role-desc { font-size: 0.65rem; color: #9e9fa3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Player Circle */
.ww-circle {
  position: relative; width: 100%; height: 320px;
  margin-bottom: 16px;
}
.ww-seat {
  position: absolute; width: 56px; text-align: center; cursor: default;
  transition: all 0.2s;
}
.ww-seat-clickable { cursor: pointer; }
.ww-seat-clickable:hover .ww-seat-avatar { transform: scale(1.1); box-shadow: 0 0 12px rgba(239,83,80,0.4); }
.ww-seat-selected .ww-seat-avatar { box-shadow: 0 0 0 3px #ef5350; }
.ww-seat-dead { opacity: 0.45; filter: grayscale(0.7); }
.ww-seat-me .ww-seat-avatar { box-shadow: 0 0 0 2px #42a5f5; }
.ww-seat-voted .ww-seat-avatar { box-shadow: 0 0 0 2px #ffb74d; }
.ww-seat-avatar {
  width: 48px; height: 48px; border-radius: 50%; background: #2a2b2e; margin: 0 auto;
  display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden; position: relative;
  transition: all 0.2s;
}
.ww-seat-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ww-seat-dead-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  border-radius: 50%;
}
.ww-seat-wolf-badge {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; background: rgba(0,0,0,0.45);
  border-radius: 50%;
}
.ww-seat-dead .ww-seat-name { text-decoration: line-through; color: #6b6c70; }
.ww-seat-name { font-size: 0.62rem; color: #9e9fa3; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ww-seat-votes {
  position: absolute; top: -4px; right: -4px; width: 18px; height: 18px;
  border-radius: 50%; background: #ef5350; color: #fff; font-size: 0.6rem;
  font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.ww-seat-role {
  font-size: 0.82rem; margin-top: 1px;
}
.ww-seat-wolf-target {
  position: absolute; top: -6px; left: -6px;
  background: rgba(239,83,80,0.85); color: #fff; font-size: 0.55rem;
  font-weight: 700; padding: 1px 5px; border-radius: 8px;
  white-space: nowrap; animation: wolfTargetPulse 1.5s ease-in-out infinite;
}
@keyframes wolfTargetPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.15); opacity: 1; }
}

/* Result Banners */
.ww-result-banner {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  background: rgba(58,59,62,0.2); border-radius: 10px; margin-bottom: 12px;
  animation: bannerIn 0.3s ease-out;
}
@keyframes bannerIn { 0% { opacity: 0; transform: translateY(-8px); } 100% { opacity: 1; transform: translateY(0); } }
.ww-result-icon { font-size: 1.3rem; }
.ww-result-text { font-size: 0.85rem; font-weight: 600; color: #e0e1e4; }

/* Action Panel */
.ww-action-panel {
  padding: 14px 16px; background: #23242a; border-radius: 12px;
  border: 1px solid rgba(58,59,62,0.3); margin-bottom: 12px;
}
.ww-action-title { font-size: 0.88rem; font-weight: 700; color: #e0e1e4; margin-bottom: 8px; }
.ww-action-hint { font-size: 0.75rem; color: #9e9fa3; }
.ww-action-done { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #66bb6a; }
.ww-witch-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.ww-seer-result { margin-top: 10px; padding: 10px 14px; background: rgba(171,71,188,0.1); border-radius: 8px; }
.ww-seer-title { font-size: 0.78rem; font-weight: 600; color: #ab47bc; margin-bottom: 4px; }
.ww-seer-target { font-size: 0.88rem; font-weight: 700; color: #e0e1e4; display: flex; align-items: center; gap: 8px; }
.ww-seer-wolf { color: #ef5350; }
.ww-seer-safe { color: #66bb6a; }

.ww-dead-notice {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px;
  background: rgba(171,71,188,0.08); border: 1px solid rgba(171,71,188,0.2);
  border-radius: 10px; margin-bottom: 12px;
  font-size: 0.78rem; color: #ce93d8;
}
.ww-dead-ghost-icon { font-size: 1.1rem; }

/* ====== Chat ====== */
.ww-chat {
  background: #23242a; border-radius: 12px; border: 1px solid rgba(58,59,62,0.3);
  overflow: hidden;
}
.ww-chat-night { border-color: rgba(239,83,80,0.2); }
.ww-chat-ghost { border-color: rgba(171,71,188,0.25); }
.ww-chat-ghost .ww-chat-header { color: #ce93d8; }
.ww-chat-header {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  font-size: 0.82rem; font-weight: 700; color: #e0e1e4;
  border-bottom: 1px solid rgba(58,59,62,0.3);
}
.ww-chat-messages {
  height: 200px; overflow-y: auto; padding: 10px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.ww-msg { max-width: 85%; }
.ww-msg-system {
  text-align: center; max-width: 100%; font-size: 0.72rem; color: #9e9fa3;
  padding: 4px 0; font-style: italic;
}
.ww-msg-me { align-self: flex-end; }
.ww-msg-me .ww-msg-text {
  background: rgba(66,165,245,0.15); color: #e0e1e4;
  padding: 5px 10px; border-radius: 10px 10px 2px 10px; font-size: 0.78rem;
}
.ww-msg:not(.ww-msg-me):not(.ww-msg-system) .ww-msg-text {
  background: rgba(58,59,62,0.3); color: #e0e1e4;
  padding: 5px 10px; border-radius: 10px 10px 10px 2px; font-size: 0.78rem;
  display: inline-block;
}
.ww-msg-wolf .ww-msg-text { background: rgba(239,83,80,0.15) !important; }
.ww-msg-ghost .ww-msg-text { background: rgba(171,71,188,0.12) !important; color: #ce93d8 !important; font-style: italic; }
.ww-msg-ghost.ww-msg-me .ww-msg-text { background: rgba(171,71,188,0.2) !important; color: #e1bee7 !important; }
.ww-msg-channel-tag { font-size: 0.65rem; margin-right: 2px; }
.ww-msg-name { font-size: 0.62rem; color: #9e9fa3; font-weight: 600; display: block; margin-bottom: 1px; }

.ww-chat-input {
  display: flex; gap: 8px; padding: 8px 14px; border-top: 1px solid rgba(58,59,62,0.3);
}
.ww-chat-input input {
  flex: 1; background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.4);
  border-radius: 8px; padding: 6px 10px; color: #e0e1e4; font-size: 0.78rem; outline: none;
}
.ww-chat-input input:focus { border-color: #ef5350; }
.ww-chat-input button {
  background: rgba(239,83,80,0.2); border: none; border-radius: 8px;
  padding: 6px 10px; color: #ef5350; cursor: pointer;
}
.ww-chat-input button:disabled { opacity: 0.3; }

/* ====== Game Over ====== */
.ww-gameover { text-align: center; padding: 30px 0; }
.ww-gameover-banner {
  padding: 24px; border-radius: 16px; margin-bottom: 24px;
}
.ww-win-wolf { background: linear-gradient(135deg, rgba(239,83,80,0.15), rgba(239,83,80,0.05)); border: 1px solid rgba(239,83,80,0.3); }
.ww-win-village { background: linear-gradient(135deg, rgba(102,187,106,0.15), rgba(102,187,106,0.05)); border: 1px solid rgba(102,187,106,0.3); }
.ww-gameover-emoji { font-size: 2.5rem; margin-bottom: 8px; }
.ww-gameover-title { font-size: 1.4rem; font-weight: 800; color: #e0e1e4; }

.ww-gameover-roles { text-align: left; margin-bottom: 20px; }
.ww-gameover-roles-title { font-size: 0.92rem; font-weight: 700; color: #e0e1e4; margin-bottom: 12px; }
.ww-gameover-role-list { display: flex; flex-direction: column; gap: 6px; }
.ww-gameover-player {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  background: #23242a; border-radius: 10px;
}
.ww-gameover-avatar {
  width: 32px; height: 32px; min-width: 32px; border-radius: 50%; background: #2a2b2e;
  display: flex; align-items: center; justify-content: center; font-size: 0.72rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden;
}
.ww-gameover-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ww-gameover-info { flex: 1; min-width: 0; }
.ww-gameover-name { font-size: 0.82rem; font-weight: 600; color: #e0e1e4; }
.ww-gameover-role-badge { font-size: 0.75rem; font-weight: 600; }
.ww-gameover-status { font-size: 0.72rem; font-weight: 600; }
.ww-gameover-actions { margin-top: 16px; }

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .ww-page { padding: 12px; }
  .ww-circle { height: 260px; }
  .ww-player-list { grid-template-columns: 1fr; }
  .ww-lobby-actions { flex-direction: column; align-items: center; }
  .ww-header { flex-wrap: wrap; gap: 8px; }
  .ww-room-code { margin-left: 0; }
}
</style>
