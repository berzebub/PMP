<template>
  <q-page class="uno-page">
    <div class="uno-container">
      <!-- Header -->
      <div class="uno-header">
        <button class="uno-back-btn" @click="handleBack">
          <q-icon name="arrow_back" size="18px" />
          <span>Arcade</span>
        </button>
        <div class="uno-title">
          <q-icon name="style" size="20px" style="color: #ff9800;" />
          <span>UNO</span>
          <span class="uno-subtitle">Multiplayer</span>
        </div>
        <div v-if="store.room?.roomCode" class="uno-room-code">
          <q-icon name="tag" size="14px" />
          <span>{{ store.room.roomCode }}</span>
        </div>
      </div>

      <!-- ==================== LOBBY ==================== -->
      <div v-if="view === 'lobby'" class="uno-lobby">
        <div class="uno-lobby-icon">🃏</div>
        <div class="uno-lobby-title">UNO</div>
        <div class="uno-lobby-desc">เกมไพ่ UNO แบบ Multiplayer 2-10 คน<br/>ทิ้งไพ่ให้หมดมือก่อนใคร เป็นคนชนะ!</div>

        <div class="uno-lobby-actions">
          <button class="uno-btn uno-btn-primary" @click="showCreate = true">
            <q-icon name="add_circle" size="18px" />
            <span>สร้างห้อง</span>
          </button>
          <button class="uno-btn uno-btn-secondary" @click="showJoin = true">
            <q-icon name="meeting_room" size="18px" />
            <span>เข้าห้อง</span>
          </button>
        </div>

        <div v-if="store.error" class="uno-error">{{ store.error }}</div>

        <!-- Create Dialog -->
        <div v-if="showCreate" class="uno-dialog-overlay" @click.self="showCreate = false">
          <div class="uno-dialog">
            <div class="uno-dialog-title">สร้างห้องใหม่</div>
            <div class="uno-dialog-body">
              <div class="uno-dialog-hint">กดสร้างเพื่อรับรหัสห้องสำหรับเชิญเพื่อน</div>
            </div>
            <div class="uno-dialog-actions">
              <button class="uno-btn uno-btn-ghost" @click="showCreate = false">ยกเลิก</button>
              <button class="uno-btn uno-btn-primary" @click="handleCreateRoom" :disabled="store.loading">
                <q-spinner-dots v-if="store.loading" size="14px" />
                <span v-else>สร้าง</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Join Dialog -->
        <div v-if="showJoin" class="uno-dialog-overlay" @click.self="showJoin = false">
          <div class="uno-dialog">
            <div class="uno-dialog-title">เข้าห้อง</div>
            <div class="uno-dialog-body">
              <label class="uno-label">รหัสห้อง (4 ตัวอักษร)</label>
              <input v-model="joinCode" maxlength="4" placeholder="ABCD" class="uno-input uno-input-code"
                     @keyup.enter="handleJoinRoom" />
            </div>
            <div class="uno-dialog-actions">
              <button class="uno-btn uno-btn-ghost" @click="showJoin = false">ยกเลิก</button>
              <button class="uno-btn uno-btn-primary" @click="handleJoinRoom" :disabled="store.loading || joinCode.length < 4">
                <q-spinner-dots v-if="store.loading" size="14px" />
                <span v-else>เข้าร่วม</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== WAITING ROOM ==================== -->
      <div v-else-if="view === 'waiting'" class="uno-waiting">
        <div class="uno-waiting-header">
          <div class="uno-waiting-title">ห้องรอ</div>
          <div class="uno-waiting-code">
            <span>รหัสห้อง:</span>
            <span class="uno-code-badge">{{ store.room?.roomCode }}</span>
            <button class="uno-copy-btn" @click="copyRoomCode">
              <q-icon name="content_copy" size="14px" />
            </button>
          </div>
        </div>

        <!-- Player List -->
        <div class="uno-player-list">
          <div v-for="pid in (store.room?.playerOrder || [])" :key="pid"
               class="uno-player-card" :class="{ 'uno-player-host': pid === store.room?.hostId, 'uno-player-ready': store.room?.players[pid]?.isReady }">
            <div class="uno-player-avatar">
              <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
              <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="uno-player-info">
              <div class="uno-player-name">{{ store.room?.players[pid]?.displayName || pid }}</div>
              <div class="uno-player-tags">
                <span v-if="pid === store.room?.hostId" class="uno-tag uno-tag-host">Host</span>
                <span v-if="store.room?.players[pid]?.isReady" class="uno-tag uno-tag-ready">Ready</span>
                <span v-if="pid === store.myId" class="uno-tag uno-tag-me">คุณ</span>
              </div>
            </div>
            <q-icon v-if="store.room?.players[pid]?.isReady" name="check_circle" size="20px" style="color: #66bb6a;" />
          </div>
        </div>

        <div class="uno-waiting-info">
          <q-icon name="people" size="16px" />
          <span>{{ store.playerCount }} / 10 คน (ต้องมีอย่างน้อย 2 คน)</span>
        </div>

        <!-- Actions -->
        <div class="uno-waiting-actions">
          <button v-if="!store.isHost" class="uno-btn uno-btn-secondary" @click="store.toggleReady()">
            <q-icon :name="store.room?.players[store.myId]?.isReady ? 'close' : 'check'" size="18px" />
            <span>{{ store.room?.players[store.myId]?.isReady ? 'ยกเลิก Ready' : 'Ready' }}</span>
          </button>
          <button v-if="store.isHost" class="uno-btn uno-btn-primary" @click="handleStartGame"
                  :disabled="store.playerCount < 2 || !allReady">
            <q-icon name="play_arrow" size="20px" />
            <span>เริ่มเกม</span>
          </button>
          <button class="uno-btn uno-btn-ghost" @click="handleLeave">
            <q-icon name="logout" size="16px" />
            <span>ออกจากห้อง</span>
          </button>
        </div>
      </div>

      <!-- ==================== GAME VIEW ==================== -->
      <div v-else-if="view === 'playing'" class="uno-game">
        <!-- Full-screen glow when it's my turn -->
        <div v-if="store.isMyTurn && store.room?.status === 'playing'" class="uno-turn-flash"></div>

        <!-- LEFT: Main Area -->
        <div class="uno-main-area ">
          <!-- Turn Info Bar -->
          <div class="uno-turn-bar " :class="{ 'uno-my-turn': store.isMyTurn, 'uno-my-turn-glow': store.isMyTurn && !mustDrawFirst, 'uno-must-draw': mustDrawFirst }">
            <div class="uno-turn-icon">{{ mustDrawFirst ? '⚠️' : store.isMyTurn ? '👆' : '⏳' }}</div>
            <div class="uno-turn-text">
              <span v-if="mustDrawFirst" class="uno-turn-warning">คุณต้องจั่วไพ่ {{ store.room?.pendingDrawCount }} ใบ!</span>
              <span v-else-if="store.isMyTurn" class="uno-turn-highlight">ตาของคุณ!</span>
              <span v-else>ตาของ {{ currentPlayerName }}</span>
            </div>
            <div class="uno-direction">
              <q-icon :name="store.direction === 1 ? 'rotate_right' : 'rotate_left'" size="18px" />
            </div>
            <div v-if="store.room?.drawPileCount" class="uno-deck-count">
              <q-icon name="layers" size="14px" />
              <span>{{ store.room.drawPileCount }}</span>
            </div>
          </div>

          <!-- Last Action Banner -->
          <div v-if="lastActionText" class="uno-action-banner">
            <span>{{ lastActionText }}</span>
          </div>

          <!-- Circle Area: players around, cards in center -->
          <div class="uno-circle ">
            <!-- Player Seats -->
            <div v-for="(pid, idx) in (store.room?.playerOrder || [])" :key="pid"
                 class="uno-seat" :style="seatStyle(idx)"
                 :class="{
                   'uno-seat-me': pid === store.myId,
                   'uno-seat-active': currentPlayerId === pid,
                   'uno-seat-uno': store.room?.players[pid]?.handCount === 1
                 }">
              <!-- Turn ring glow -->
              <div v-if="currentPlayerId === pid" class="uno-seat-turn-ring"></div>
              <div class="uno-seat-avatar">
                <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
                <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="uno-seat-name" :class="{ 'uno-seat-name-active': currentPlayerId === pid }">
                {{ shortName(store.room?.players[pid]?.displayName || pid) }}
              </div>
              <div class="uno-seat-count" :class="{ 'uno-seat-count-low': (store.room?.players[pid]?.handCount || 0) <= 2 }">
                {{ store.room?.players[pid]?.handCount || 0 }}
              </div>
              <!-- Turn arrow indicator -->
              <div v-if="currentPlayerId === pid" class="uno-seat-turn-label">TURN</div>
              <!-- Challenge UNO -->
              <div v-if="pid !== store.myId && store.room?.players[pid]?.handCount === 1 && !store.room?.players[pid]?.calledUno"
                   class="uno-challenge-btn" @click="store.challengeUno(pid)">
                จับ!
              </div>
            </div>

            <!-- Center: Discard + Draw + Color + UNO -->
            <div class="uno-center">
              <div class="uno-color-indicator" :style="{ background: currentColorHex }">
                {{ currentColorName }}
              </div>
              <div class="uno-center-cards">
                <div class="uno-discard" v-if="store.topCard">
                  <div class="uno-card-large" :class="topCardClass">
                    <div class="uno-card-value">{{ topCardLabel }}</div>
                  </div>
                </div>
                <div class="uno-draw-pile" :class="{ 'uno-draw-clickable': canDraw }" @click="handleDraw">
                  <div class="uno-card-back-large">
                    <div class="uno-card-back-text">UNO</div>
                  </div>
                  <div v-if="canDraw" class="uno-draw-hint">จั่วไพ่</div>
                </div>
              </div>
              <!-- UNO Button (in center) -->
              <button v-if="showUnoButton" class="uno-uno-btn" @click="store.callUno()">
                UNO!
              </button>
            </div>
          </div>

          <!-- Forced Draw Notice -->
          <div v-if="store.room?.mustDrawPlayer === store.myId" class="uno-forced-draw">
            <q-icon name="warning" size="18px" />
            <span>คุณต้องจั่ว {{ store.room?.pendingDrawCount }} ใบ!</span>
            <button class="uno-btn uno-btn-primary uno-btn-sm" @click="handleDraw">จั่วเลย</button>
          </div>
        </div>

        <!-- RIGHT: Hand Panel -->
        <div class="uno-right-panel">
          <div class="uno-hand-label">
            <q-icon name="back_hand" size="16px" />
            <span>ไพ่ของคุณ ({{ store.myHand.length }})</span>
          </div>
          <div class="uno-hand">
            <div v-for="(card, idx) in store.myHand" :key="card.id"
                 class="uno-card" :class="[cardColorClass(card), { 'uno-card-playable': isCardPlayable(card) && !mustDrawFirst, 'uno-card-disabled': !isCardPlayable(card) || !store.isMyTurn || mustDrawFirst }]"
                 @click="handlePlayCard(idx, card)">
              <div class="uno-card-label">{{ getLabel(card) }}</div>
            </div>
          </div>
        </div>

        <!-- Color Picker Dialog -->
        <div v-if="showColorPicker" class="uno-dialog-overlay">
          <div class="uno-dialog uno-color-dialog">
            <div class="uno-dialog-title">เลือกสี</div>
            <div class="uno-color-picker">
              <button v-for="c in colorOptions" :key="c.key" class="uno-color-option"
                      :style="{ background: c.hex }" @click="confirmColorChoice(c.key)">
                {{ c.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== GAME OVER ==================== -->
      <div v-else-if="view === 'finished'" class="uno-gameover">
        <div class="uno-gameover-banner">
          <div class="uno-gameover-emoji">🎉</div>
          <div class="uno-gameover-title">
            {{ winnerName }} ชนะ!
          </div>
          <div v-if="isWinner" class="uno-gameover-sub">ยินดีด้วย! คุณชนะเกมนี้!</div>
          <div v-else class="uno-gameover-sub">เกมจบแล้ว ลองใหม่อีกครั้ง!</div>
        </div>

        <!-- Final Hand Counts -->
        <div class="uno-final-results">
          <div class="uno-final-title">ผลลัพธ์</div>
          <div class="uno-final-list">
            <div v-for="(pid, idx) in sortedPlayers" :key="pid" class="uno-final-player"
                 :class="{ 'uno-final-winner': pid === store.room?.winner }">
              <div class="uno-final-rank">{{ idx + 1 }}</div>
              <div class="uno-final-avatar">
                <img v-if="store.room?.players[pid]?.photoURL" :src="store.room.players[pid].photoURL" />
                <span v-else>{{ (store.room?.players[pid]?.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="uno-final-name">{{ store.room?.players[pid]?.displayName || pid }}</div>
              <div class="uno-final-cards">{{ store.room?.players[pid]?.handCount || 0 }} ใบ</div>
              <div v-if="pid === store.room?.winner" class="uno-final-badge">🏆</div>
            </div>
          </div>
        </div>

        <div class="uno-gameover-actions">
          <button v-if="store.isHost" class="uno-btn uno-btn-primary" @click="store.playAgain()">
            <q-icon name="replay" size="18px" />
            <span>เล่นอีกครั้ง</span>
          </button>
          <button class="uno-btn uno-btn-ghost" @click="handleLeave">
            <q-icon name="logout" size="16px" />
            <span>ออกจากห้อง</span>
          </button>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUnoStore } from 'src/stores/uno'
import { canPlayCard, getCardLabel, COLORS, COLOR_KEYS, CARD_TYPES } from 'src/data/unoCards'
import { copyToClipboard, useQuasar } from 'quasar'

const router = useRouter()
const store = useUnoStore()
const $q = useQuasar()

// ==================== LOCAL STATE ====================

const showCreate = ref(false)
const showJoin = ref(false)
const joinCode = ref('')
const showColorPicker = ref(false)
const pendingCardIndex = ref(null)

// ==================== COMPUTED ====================

const view = computed(() => {
  if (!store.room) return 'lobby'
  if (store.room.status === 'waiting') return 'waiting'
  if (store.room.status === 'finished') return 'finished'
  if (store.room.status === 'playing') return 'playing'
  return 'lobby'
})

const allReady = computed(() => {
  if (!store.room?.players) return false
  const players = store.room.players
  for (const [pid, p] of Object.entries(players)) {
    if (pid !== store.room.hostId && !p.isReady) return false
  }
  return true
})

const currentPlayerId = computed(() => store.currentPlayerId)

const currentPlayerName = computed(() => {
  const pid = currentPlayerId.value
  if (!pid || !store.room?.players) return ''
  return store.room.players[pid]?.displayName || pid
})

const currentColorHex = computed(() => {
  const c = store.currentColor
  return c && COLORS[c] ? COLORS[c].hex : '#9e9fa3'
})

const currentColorName = computed(() => {
  const c = store.currentColor
  return c && COLORS[c] ? COLORS[c].name : ''
})

const topCardLabel = computed(() => getCardLabel(store.topCard))

const topCardClass = computed(() => {
  if (!store.topCard) return ''
  return cardColorClass(store.topCard)
})

const mustDrawFirst = computed(() => {
  return store.room?.mustDrawPlayer === store.myId
})

const canDraw = computed(() => {
  if (mustDrawFirst.value) return true
  return store.isMyTurn && store.room?.status === 'playing'
})

const showUnoButton = computed(() => {
  if (store.myHand.length !== 2) return false
  if (store.room?.players?.[store.myId]?.calledUno) return false
  return store.isMyTurn
})

const lastActionText = computed(() => {
  const action = store.room?.lastAction
  if (!action) return ''
  const name = store.room?.players?.[action.playerId]?.displayName || action.playerId
  switch (action.type) {
    case 'play': {
      const cardName = getCardLabel(action.card)
      const colorText = action.chosenColor ? ` (เลือก${COLORS[action.chosenColor]?.name || ''})` : ''
      return `${name} ลง ${cardName}${colorText}`
    }
    case 'draw': return `${name} จั่วไพ่ ${action.count} ใบ`
    case 'uno': return `${name} ตะโกน UNO!`
    case 'challenge_uno': {
      const targetName = store.room?.players?.[action.targetId]?.displayName || action.targetId
      return `${name} จับ ${targetName} ไม่ได้ตะโกน UNO!`
    }
    default: return ''
  }
})

const isWinner = computed(() => store.room?.winner === store.myId)

const winnerName = computed(() => {
  const wid = store.room?.winner
  if (!wid) return ''
  return store.room?.players?.[wid]?.displayName || wid
})

const sortedPlayers = computed(() => {
  const order = store.room?.playerOrder || []
  const players = store.room?.players || {}
  return [...order].sort((a, b) => {
    if (a === store.room?.winner) return -1
    if (b === store.room?.winner) return 1
    return (players[a]?.handCount || 0) - (players[b]?.handCount || 0)
  })
})

const colorOptions = COLOR_KEYS.map(key => ({
  key,
  name: COLORS[key].name,
  hex: COLORS[key].hex
}))

// ==================== LIFECYCLE ====================

onBeforeUnmount(() => {
  store.cleanup()
})

// ==================== METHODS ====================

async function handleCreateRoom() {
  const result = await store.createRoom()
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
  await store.startGame()
}

function copyRoomCode() {
  if (store.room?.roomCode) {
    copyToClipboard(store.room.roomCode)
    $q.notify({ message: 'คัดลอกรหัสห้องแล้ว!', color: 'positive', timeout: 1500, position: 'top' })
  }
}

function isCardPlayable(card) {
  if (!store.topCard || !store.currentColor) return false
  return canPlayCard(card, store.topCard, store.currentColor)
}

function cardColorClass(card) {
  if (!card) return ''
  if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD4) return 'uno-card-wild'
  return `uno-card-${card.color}`
}

function getLabel(card) {
  return getCardLabel(card)
}

function handlePlayCard(idx, card) {
  if (!store.isMyTurn || !isCardPlayable(card) || mustDrawFirst.value) return

  // If wild card, show color picker
  if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD4) {
    pendingCardIndex.value = idx
    showColorPicker.value = true
    return
  }

  store.playCard(idx)
}

function confirmColorChoice(color) {
  showColorPicker.value = false
  if (pendingCardIndex.value !== null) {
    store.playCard(pendingCardIndex.value, color)
    pendingCardIndex.value = null
  }
}

function handleDraw() {
  store.drawCard()
}

function seatStyle(idx) {
  const total = store.room?.playerOrder?.length || 1
  const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
  const rx = 42
  const ry = 42
  return {
    left: `calc(50% + ${Math.cos(angle) * rx}% - 28px)`,
    top: `calc(50% + ${Math.sin(angle) * ry}% - 28px)`
  }
}

function shortName(name) {
  if (!name) return '?'
  return name.length > 6 ? name.substring(0, 5) + '..' : name
}
</script>

<style scoped>
.uno-page { padding: 16px 20px; min-height: 100vh; }
.uno-container { max-width: 1100px; margin: 0 auto; }

/* ====== Header ====== */
.uno-header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.uno-back-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.3);
  color: #9e9fa3; padding: 6px 14px; border-radius: 8px;
  cursor: pointer; font-size: 0.78rem; font-weight: 500; transition: all 0.15s;
}
.uno-back-btn:hover { background: rgba(58,59,62,0.5); color: #e0e1e4; }
.uno-title { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; font-weight: 700; color: #e0e1e4; }
.uno-subtitle { font-size: 0.72rem; color: #6b6c6f; font-weight: 500; }
.uno-room-code {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 700; color: #ff9800;
  background: rgba(255,152,0,0.1); padding: 4px 12px; border-radius: 16px;
}

/* ====== Buttons ====== */
.uno-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px;
  border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.uno-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.uno-btn-primary {
  background: linear-gradient(135deg, #ff9800, #ff5722); color: #fff;
  box-shadow: 0 4px 16px rgba(255,152,0,0.3);
}
.uno-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(255,152,0,0.4); }
.uno-btn-secondary { background: rgba(58,59,62,0.4); color: #e0e1e4; border: 1px solid rgba(58,59,62,0.5); }
.uno-btn-secondary:hover:not(:disabled) { background: rgba(58,59,62,0.6); }
.uno-btn-ghost { background: transparent; color: #9e9fa3; padding: 8px 16px; }
.uno-btn-ghost:hover { color: #e0e1e4; }
.uno-btn-sm { padding: 6px 16px; font-size: 0.78rem; }

/* ====== Lobby ====== */
.uno-lobby { text-align: center; padding: 60px 0; }
.uno-lobby-icon { font-size: 3rem; margin-bottom: 8px; }
.uno-lobby-title { font-size: 1.6rem; font-weight: 800; color: #e0e1e4; }
.uno-lobby-desc { font-size: 0.82rem; color: #9e9fa3; margin-top: 8px; line-height: 1.6; }
.uno-lobby-actions { display: flex; gap: 12px; justify-content: center; margin-top: 28px; }
.uno-error { margin-top: 16px; font-size: 0.78rem; color: #ef5350; }

/* ====== Dialogs ====== */
.uno-dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.uno-dialog {
  background: #2a2b30; border-radius: 16px; padding: 24px; min-width: 320px;
  border: 1px solid rgba(58,59,62,0.4); box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.uno-dialog-title { font-size: 1rem; font-weight: 700; color: #e0e1e4; margin-bottom: 16px; }
.uno-dialog-body { display: flex; flex-direction: column; gap: 10px; }
.uno-dialog-hint { font-size: 0.82rem; color: #9e9fa3; }
.uno-dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.uno-label { font-size: 0.75rem; color: #9e9fa3; }
.uno-input {
  width: 100%; padding: 8px 12px; background: rgba(58,59,62,0.3); border: 1px solid rgba(58,59,62,0.5);
  border-radius: 8px; color: #e0e1e4; font-size: 0.85rem; outline: none;
}
.uno-input:focus { border-color: #ff9800; }
.uno-input-code { text-align: center; font-size: 1.4rem; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; }

/* ====== Waiting Room ====== */
.uno-waiting { display: flex; flex-direction: column; }
.uno-waiting-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.uno-waiting-title { font-size: 1.1rem; font-weight: 700; color: #e0e1e4; }
.uno-waiting-code { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #9e9fa3; }
.uno-code-badge { font-size: 1.1rem; font-weight: 800; color: #ff9800; letter-spacing: 0.1em; }
.uno-copy-btn { background: none; border: none; color: #9e9fa3; cursor: pointer; padding: 4px; }

.uno-player-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 16px; }
.uno-player-card {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: #23242a; border-radius: 10px; border: 1px solid rgba(58,59,62,0.3);
  transition: all 0.15s;
}
.uno-player-host { border-color: rgba(255,152,0,0.3); }
.uno-player-ready { border-color: rgba(102,187,106,0.3); background: rgba(102,187,106,0.05); }
.uno-player-avatar {
  width: 36px; height: 36px; min-width: 36px; border-radius: 50%; background: #2a2b2e;
  display: flex; align-items: center; justify-content: center; font-size: 0.78rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden;
}
.uno-player-avatar img { width: 100%; height: 100%; object-fit: cover; }
.uno-player-info { flex: 1; min-width: 0; }
.uno-player-name { font-size: 0.82rem; font-weight: 600; color: #e0e1e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uno-player-tags { display: flex; gap: 4px; margin-top: 2px; }
.uno-tag { font-size: 0.6rem; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
.uno-tag-host { background: rgba(255,152,0,0.15); color: #ff9800; }
.uno-tag-ready { background: rgba(102,187,106,0.15); color: #66bb6a; }
.uno-tag-me { background: rgba(66,165,245,0.15); color: #42a5f5; }

.uno-waiting-info { font-size: 0.78rem; color: #9e9fa3; display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.uno-waiting-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ====== Game View ====== */
.uno-game { display: flex; gap: 14px; position: relative; }

/* Full-screen edge glow overlay (infinite pulse) */
.uno-turn-flash {
  position: fixed; inset: 0; z-index: 50; pointer-events: none;
  border-radius: 0;
  animation: unoEdgeGlow 2s ease-in-out infinite;
}
@keyframes unoEdgeGlow {
  0%, 100% { box-shadow: inset 0 0 40px 10px rgba(255,0,110,0.25); }
  50%      { box-shadow: inset 0 0 80px 24px rgba(255,0,110,0.55); }
}

/* Main Area (left) */
.uno-main-area { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }

/* Turn Bar */
.uno-turn-bar {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  border-radius: 10px; background: rgba(58,59,62,0.2); border: 1px solid rgba(58,59,62,0.3);
  transition: all 0.3s; position: relative; overflow: hidden;
}
.uno-my-turn { background: rgba(255,152,0,0.1); border-color: rgba(255,152,0,0.3); }
.uno-my-turn-glow {
  animation: unoTurnBarGlow 2s ease-in-out infinite;
  box-shadow: 0 0 16px rgba(255,152,0,0.2), inset 0 0 16px rgba(255,152,0,0.05);
}
@keyframes unoTurnBarGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(255,152,0,0.15), inset 0 0 12px rgba(255,152,0,0.03); border-color: rgba(255,152,0,0.3); }
  50%      { box-shadow: 0 0 24px rgba(255,152,0,0.35), inset 0 0 20px rgba(255,152,0,0.08); border-color: rgba(255,152,0,0.5); }
}
.uno-turn-icon { font-size: 1rem; }
.uno-turn-text { font-size: 0.82rem; font-weight: 600; color: #e0e1e4; flex: 1; }
.uno-turn-highlight { color: #ff9800; animation: unoTextPulse 2s ease-in-out infinite; }
@keyframes unoTextPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
.uno-turn-warning { color: #ef5350; animation: unoTextPulse 1.5s ease-in-out infinite; }
.uno-must-draw {
  background: rgba(239,83,80,0.1); border-color: rgba(239,83,80,0.3);
  animation: unoMustDrawGlow 1.5s ease-in-out infinite;
}
@keyframes unoMustDrawGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(239,83,80,0.15); border-color: rgba(239,83,80,0.3); }
  50%      { box-shadow: 0 0 24px rgba(239,83,80,0.35); border-color: rgba(239,83,80,0.5); }
}
.uno-direction { color: #9e9fa3; display: flex; align-items: center; }
.uno-deck-count { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #9e9fa3; }

/* Action Banner */
.uno-action-banner {
  padding: 5px 12px; background: rgba(255,152,0,0.08); border-radius: 8px;
  font-size: 0.72rem; color: #ffb74d; text-align: center;
  animation: unoBannerIn 0.3s ease-out;
}
@keyframes unoBannerIn { 0% { opacity: 0; transform: translateY(-6px); } 100% { opacity: 1; transform: translateY(0); } }

/* ====== Circle Area ====== */
.uno-circle {
  position: relative; width: 100%; height: 380px;
  flex-shrink: 0; margin: 30px auto 0;
}

/* Player Seats */
.uno-seat {
  position: absolute; width: 56px; text-align: center;
  z-index: 2; transition: all 0.2s;
}
.uno-seat-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: #2a2b2e; margin: 0 auto;
  display: flex; align-items: center; justify-content: center; font-size: 0.76rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden; position: relative;
  border: 2px solid rgba(58,59,62,0.5); transition: all 0.2s;
}
.uno-seat-avatar img { width: 100%; height: 100%; object-fit: cover; }
.uno-seat-me .uno-seat-avatar { border-color: rgba(66,165,245,0.6); }
.uno-seat-active .uno-seat-avatar { border-color: #ff9800; }
.uno-seat-name {
  font-size: 0.6rem; color: #9e9fa3; font-weight: 600; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.uno-seat-name-active { color: #ff9800; font-weight: 700; }
.uno-seat-count {
  font-size: 0.62rem; color: #6b6c6f; font-weight: 700;
  background: rgba(58,59,62,0.4); border-radius: 8px; padding: 0 5px;
  display: inline-block; margin-top: 1px;
}
.uno-seat-count-low { color: #ffb74d; background: rgba(255,152,0,0.15); }
.uno-seat-uno .uno-seat-avatar { border-color: #ef5350; }
.uno-seat-uno .uno-seat-count { color: #ef5350; background: rgba(239,83,80,0.15); }

/* Turn ring glow around active player */
.uno-seat-turn-ring {
  position: absolute; inset: -6px; border-radius: 50%; z-index: -1;
  border: 2px solid rgba(255,152,0,0.6);
  box-shadow: 0 0 14px 4px rgba(255,152,0,0.35);
  animation: unoTurnRing 1.8s ease-in-out infinite;
}
@keyframes unoTurnRing {
  0%, 100% { box-shadow: 0 0 10px 2px rgba(255,152,0,0.25); border-color: rgba(255,152,0,0.5); }
  50%      { box-shadow: 0 0 20px 6px rgba(255,152,0,0.5); border-color: rgba(255,152,0,0.8); }
}
.uno-seat-turn-label {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  font-size: 0.5rem; font-weight: 800; color: #ff9800;
  background: rgba(255,152,0,0.2); padding: 1px 6px; border-radius: 6px;
  letter-spacing: 0.08em; white-space: nowrap;
  animation: unoTextPulse 1.5s ease-in-out infinite;
}

/* Challenge button */
.uno-challenge-btn {
  position: absolute; top: -6px; right: -8px;
  background: #ef5350; color: #fff; font-size: 0.55rem; font-weight: 700;
  padding: 2px 6px; border-radius: 8px; cursor: pointer; z-index: 3;
  animation: unoPulse 1.5s ease-in-out infinite;
}
@keyframes unoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* ====== Center (discard + draw) ====== */
.uno-center {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 1;
}
.uno-color-indicator {
  padding: 2px 14px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;
  color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.uno-center-cards { display: flex; gap: 10px; align-items: center; }
.uno-discard { position: relative; }
.uno-card-large {
  width: 54px; height: 80px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 900; color: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.2);
}
.uno-card-back-large {
  width: 54px; height: 80px; border-radius: 10px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid rgba(255,152,0,0.3);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.uno-card-back-text {
  font-size: 0.8rem; font-weight: 900; color: #ff9800;
  transform: rotate(-20deg);
  text-shadow: 0 0 8px rgba(255,152,0,0.5);
}
.uno-draw-pile { cursor: default; text-align: center; }
.uno-draw-clickable { cursor: pointer; }
.uno-draw-clickable:hover .uno-card-back-large { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(255,152,0,0.3); }
.uno-draw-hint { font-size: 0.65rem; color: #ff9800; font-weight: 600; margin-top: 4px; }

/* UNO Button (in center) */
.uno-uno-btn {
  background: linear-gradient(135deg, #ef5350, #ff5722); color: #fff;
  font-size: 0.9rem; font-weight: 900; padding: 6px 20px; border: none;
  border-radius: 50px; cursor: pointer; letter-spacing: 0.1em;
  box-shadow: 0 4px 16px rgba(239,83,80,0.4);
  animation: unoPulse 1.5s ease-in-out infinite;
  transition: all 0.15s; margin-top: 2px;
}
.uno-uno-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(239,83,80,0.5); }

/* Forced Draw */
.uno-forced-draw {
  display: flex; align-items: center; gap: 10px; justify-content: center;
  padding: 10px 16px; background: rgba(239,83,80,0.1); border: 1px solid rgba(239,83,80,0.3);
  border-radius: 10px; font-size: 0.82rem; font-weight: 600; color: #ef5350;
}

/* ====== Right Panel (My Hand) ====== */
.uno-right-panel {
  width: 148px; min-width: 148px;
  background: #23242a; border-radius: 14px; padding: 10px;
  border: 1px solid rgba(58,59,62,0.3);
  display: flex; flex-direction: column;
  max-height: calc(100vh - 100px); overflow: hidden;
}
.uno-hand-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.75rem; font-weight: 600; color: #9e9fa3; margin-bottom: 8px;
  flex-shrink: 0;
}
.uno-hand {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; justify-items: center;
  overflow-y: auto; flex: 1; padding-right: 2px;
}
.uno-hand::-webkit-scrollbar { width: 3px; }
.uno-hand::-webkit-scrollbar-thumb { background: rgba(255,152,0,0.3); border-radius: 3px; }
.uno-card {
  width: 56px; height: 78px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: #fff;
  cursor: pointer; transition: all 0.15s;
  border: 2px solid rgba(255,255,255,0.15);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  position: relative;
}
.uno-card-playable:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
.uno-card-disabled { opacity: 0.45; cursor: not-allowed; }
.uno-card-label { pointer-events: none; }

/* Card Colors */
.uno-card-red, .uno-card-large.uno-card-red { background: linear-gradient(135deg, #ef5350, #c62828); }
.uno-card-yellow, .uno-card-large.uno-card-yellow { background: linear-gradient(135deg, #fdd835, #f9a825); color: #333; text-shadow: none; }
.uno-card-green, .uno-card-large.uno-card-green { background: linear-gradient(135deg, #66bb6a, #2e7d32); }
.uno-card-blue, .uno-card-large.uno-card-blue { background: linear-gradient(135deg, #42a5f5, #1565c0); }
.uno-card-wild, .uno-card-large.uno-card-wild {
  background: linear-gradient(135deg, #ef5350 25%, #fdd835 25%, #fdd835 50%, #66bb6a 50%, #66bb6a 75%, #42a5f5 75%);
}

/* Color Picker */
.uno-color-dialog { min-width: 280px; }
.uno-color-picker { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.uno-color-option {
  padding: 16px; border-radius: 12px; border: none; cursor: pointer;
  font-size: 0.92rem; font-weight: 700; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: all 0.15s;
}
.uno-color-option:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }

/* ====== Game Over ====== */
.uno-gameover { text-align: center; padding: 30px 0; }
.uno-gameover-banner {
  padding: 28px; border-radius: 16px; margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.05));
  border: 1px solid rgba(255,152,0,0.3);
}
.uno-gameover-emoji { font-size: 2.5rem; margin-bottom: 8px; }
.uno-gameover-title { font-size: 1.4rem; font-weight: 800; color: #e0e1e4; }
.uno-gameover-sub { font-size: 0.85rem; color: #9e9fa3; margin-top: 6px; }

.uno-final-results { text-align: left; margin-bottom: 24px; }
.uno-final-title { font-size: 0.92rem; font-weight: 700; color: #e0e1e4; margin-bottom: 12px; }
.uno-final-list { display: flex; flex-direction: column; gap: 6px; }
.uno-final-player {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  background: #23242a; border-radius: 10px;
}
.uno-final-winner { border: 1px solid rgba(255,152,0,0.3); background: rgba(255,152,0,0.05); }
.uno-final-rank { font-size: 0.88rem; font-weight: 800; color: #9e9fa3; width: 24px; text-align: center; }
.uno-final-winner .uno-final-rank { color: #ff9800; }
.uno-final-avatar {
  width: 32px; height: 32px; min-width: 32px; border-radius: 50%; background: #2a2b2e;
  display: flex; align-items: center; justify-content: center; font-size: 0.72rem;
  font-weight: 600; color: #9e9fa3; overflow: hidden;
}
.uno-final-avatar img { width: 100%; height: 100%; object-fit: cover; }
.uno-final-name { flex: 1; font-size: 0.82rem; font-weight: 600; color: #e0e1e4; }
.uno-final-cards { font-size: 0.78rem; color: #9e9fa3; }
.uno-final-badge { font-size: 1.1rem; }

.uno-gameover-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .uno-page { padding: 10px; }
  .uno-header { flex-wrap: wrap; gap: 8px; }
  .uno-container { max-width: 100%; }
  .uno-game { flex-direction: column; }
  .uno-right-panel {
    width: 100%; min-width: unset; flex-direction: column;
    max-height: none; border-radius: 12px;
  }
  .uno-hand { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; overflow-y: visible; }
  .uno-circle { height: 300px; }
  .uno-card { width: 44px; height: 66px; font-size: 0.9rem; }
  .uno-card-large { width: 46px; height: 68px; font-size: 1rem; }
  .uno-card-back-large { width: 46px; height: 68px; }
  .uno-seat { width: 46px; }
  .uno-seat-avatar { width: 30px; height: 30px; font-size: 0.65rem; }
  .uno-seat-name { font-size: 0.52rem; }
  .uno-lobby-actions { flex-direction: column; align-items: center; }
}
</style>
