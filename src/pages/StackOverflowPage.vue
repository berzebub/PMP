<template>
  <q-page class="stack-page">
    <div class="stack-container">
      <!-- Game Area -->
      <div class="stack-game-area">
        <!-- Game Header -->
        <div class="stack-game-header">
          <button class="stack-back-btn" @click="$router.push('/games')">
            <q-icon name="arrow_back" size="18px" />
            <span>Arcade</span>
          </button>
          <div class="stack-game-title">
            <q-icon name="layers" size="20px" style="color: #42a5f5;" />
            <span>Stack Overflow</span>
            <span class="stack-game-subtitle">Office Edition</span>
          </div>
          <div v-if="gameStore.personalBest" class="stack-personal-best">
            <q-icon name="emoji_events" size="14px" />
            <span>Best: {{ gameStore.personalBest.score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Canvas Wrapper -->
        <div class="stack-canvas-wrapper" ref="canvasWrapper">
          <canvas
            ref="gameCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            @click="handleCanvasClick"
            @touchstart.prevent="handleTouchStart"
          ></canvas>

          <!-- Start Overlay -->
          <div v-if="gameState === 'idle'" class="stack-overlay">
            <div class="stack-overlay-content">
              <div class="stack-overlay-icon">📚</div>
              <div class="stack-overlay-title">Stack Overflow</div>
              <div class="stack-overlay-sub">Office Edition</div>
              <div class="stack-overlay-desc">กดจังหวะวางเอกสารซ้อนกันให้สูงที่สุด! วางตรงกลางจะได้ Perfect bonus</div>
              <button class="stack-play-btn" @click.stop="startGame">
                <q-icon name="play_arrow" size="20px" />
                <span>เริ่มเกม</span>
              </button>
              <div class="stack-overlay-controls">
                <div class="stack-control-item">
                  <span class="stack-key">Click</span>
                  <span>ปล่อยเอกสาร</span>
                </div>
                <div class="stack-control-item">
                  <span class="stack-key">จังหวะ</span>
                  <span>วางให้ตรงกลาง!</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Over Overlay -->
          <div v-if="gameState === 'gameover'" class="stack-overlay stack-overlay-gameover">
            <div class="stack-overlay-content">
              <div class="stack-overlay-icon">📦</div>
              <div class="stack-overlay-title">กองล้ม!</div>
              <div class="stack-gameover-breakdown">
                <div class="stack-breakdown-item">
                  <span class="stack-breakdown-label">เอกสารที่ซ้อนได้</span>
                  <span class="stack-breakdown-value">{{ displayBlocksStacked }} x 100 = {{ displayBlocksStacked * 100 }}</span>
                </div>
                <div class="stack-breakdown-item">
                  <span class="stack-breakdown-label">Perfect Bonus</span>
                  <span class="stack-breakdown-value">+{{ displayPerfectBonus }}</span>
                </div>
                <div class="stack-breakdown-item">
                  <span class="stack-breakdown-label">Height Bonus</span>
                  <span class="stack-breakdown-value">+{{ displayHeightBonus }}</span>
                </div>
              </div>
              <div class="stack-gameover-score">
                <div class="stack-score-label">คะแนนรวม</div>
                <div class="stack-score-value">{{ displayScore.toLocaleString() }}</div>
              </div>
              <div v-if="isNewBest" class="stack-new-best">🎉 New Personal Best!</div>
              <button class="stack-play-btn" @click.stop="startGame">
                <q-icon name="replay" size="20px" />
                <span>เล่นอีกครั้ง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Stats + Leaderboard -->
      <div class="stack-bottom-panels">
        <div class="stack-panel-card stack-panel-stats">
          <div class="stack-panel-header">
            <q-icon name="person" size="18px" style="color: #42a5f5;" />
            <span>สถิติของฉัน</span>
          </div>
          <div class="stack-stats-grid">
            <div class="stack-stat">
              <div class="stack-stat-value">{{ gameStore.personalBest?.score?.toLocaleString() || '-' }}</div>
              <div class="stack-stat-label">Best Score</div>
            </div>
            <div class="stack-stat">
              <div class="stack-stat-value">{{ myRank || '-' }}</div>
              <div class="stack-stat-label">Rank</div>
            </div>
            <div class="stack-stat">
              <div class="stack-stat-value">{{ gameStore.recentScores.length }}</div>
              <div class="stack-stat-label">Games</div>
            </div>
          </div>
        </div>

        <div class="stack-panel-card stack-panel-leaderboard">
          <div class="stack-panel-header">
            <q-icon name="leaderboard" size="18px" style="color: #ffb74d;" />
            <span>Leaderboard</span>
          </div>
          <div v-if="gameStore.loading" class="stack-panel-loading">
            <q-spinner-dots size="24px" />
          </div>
          <div v-else-if="gameStore.leaderboard.length === 0" class="stack-panel-empty">
            <q-icon name="emoji_events" size="36px" />
            <span>ยังไม่มีคะแนน</span>
          </div>
          <div v-else class="stack-leaderboard-list">
            <div
              v-for="(entry, idx) in gameStore.leaderboard"
              :key="entry.id"
              class="stack-lb-item"
              :class="{ 'stack-lb-me': entry.userId === currentUserEmail }"
            >
              <div class="stack-lb-rank">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else class="stack-lb-rank-num">#{{ idx + 1 }}</span>
              </div>
              <div class="stack-lb-avatar">
                <img v-if="entry.photoURL" :src="entry.photoURL" />
                <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="stack-lb-info">
                <div class="stack-lb-name">{{ entry.displayName }}</div>
              </div>
              <div class="stack-lb-score">{{ entry.score.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Matter from 'matter-js'
import { useGameStore } from 'src/stores/game'
import { useAuthStore } from 'src/stores/auth'

const { Engine, Bodies, Body, World, Composite } = Matter

// ==================== CONSTANTS ====================

const GAME_ID = 'stack-overflow'
const PLATFORM_WIDTH = 300
const PLATFORM_HEIGHT = 18
const SWING_Y = 40
const BASE_SWING_SPEED = 0.015
const SWING_SPEED_INCREMENT = 0.0018
const SETTLE_FRAMES_REQUIRED = 25
const SETTLE_MAX_WAIT = 180 // 3 seconds
const PERFECT_THRESHOLD = 12
const SNAP_THRESHOLD = 30 // Magnetic snap range (px)

const BLOCK_TYPES = [
  { name: 'document', width: 110, height: 22, color: '#5c9ce6', emoji: '📄', density: 0.001, label: 'Document' },
  { name: 'folder', width: 130, height: 18, color: '#66bb6a', emoji: '📁', density: 0.0012, label: 'Folder' },
  { name: 'notebook', width: 95, height: 26, color: '#ffb74d', emoji: '📓', density: 0.0009, label: 'Notebook' },
  { name: 'textbook', width: 120, height: 30, color: '#ab47bc', emoji: '📕', density: 0.0015, label: 'Textbook' },
  { name: 'binder', width: 100, height: 24, color: '#ef5350', emoji: '📒', density: 0.001, label: 'Binder' }
]

// ==================== STORES & REFS ====================

const gameStore = useGameStore()
const authStore = useAuthStore()

const gameCanvas = ref(null)
const canvasWrapper = ref(null)
const canvasWidth = ref(1200)
const canvasHeight = ref(500)

const gameState = ref('idle')
const displayScore = ref(0)
const displayBlocksStacked = ref(0)
const displayPerfectBonus = ref(0)
const displayHeightBonus = ref(0)
const isNewBest = ref(false)

const currentUserEmail = computed(() => authStore.user?.email || '')
const myRank = computed(() => gameStore.getMyRank())

// ==================== MATTER.JS VARIABLES ====================

let engine = null
let world = null
let ctx = null
let animFrameId = null

// ==================== GAME STATE ====================

let frameCount = 0
let phase = 'swing' // 'swing' | 'drop' | 'settle'
let stackedBlocks = []
let currentBlock = null
let currentBlockType = null
let swingAngle = 0
let swingSpeed = BASE_SWING_SPEED
let blocksStacked = 0
let perfectDrops = 0
let combo = 0
let totalPerfectBonus = 0
let settleTimer = 0
let settleFrames = 0
let groundY = 0
let platformBody = null
let floatingTexts = []
let particles = []
let lastStackedCenterX = 0
let snapGlowEffects = [] // { x, y, life, maxLife }

// ==================== PARTICLES & FX ====================

function addParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 1.5 + Math.random() * 2
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color, life: 25 + Math.random() * 15, maxLife: 40,
      size: 2 + Math.random() * 3
    })
  }
}

function addFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 50, maxLife: 50 })
}

function updateFx() {
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy
    p.vx *= 0.95; p.vy *= 0.95
    p.vy += 0.03
    p.life--
  }
  particles = particles.filter(p => p.life > 0)

  for (const ft of floatingTexts) {
    ft.y -= 0.7
    ft.life--
  }
  floatingTexts = floatingTexts.filter(ft => ft.life > 0)

  for (const sg of snapGlowEffects) {
    sg.life--
  }
  snapGlowEffects = snapGlowEffects.filter(sg => sg.life > 0)
}

// ==================== MATTER.JS SETUP ====================

function initMatter() {
  engine = Engine.create()
  world = engine.world
  // Reduced gravity for softer landings
  engine.gravity.y = 0.8

  const cw = canvasWidth.value
  const ch = canvasHeight.value
  groundY = ch - 45

  // Platform (desk)
  platformBody = Bodies.rectangle(
    cw / 2, groundY + PLATFORM_HEIGHT / 2,
    PLATFORM_WIDTH, PLATFORM_HEIGHT,
    { isStatic: true, friction: 0.9, restitution: 0.02 }
  )
  World.add(world, platformBody)
}

function cleanupMatter() {
  if (engine) {
    World.clear(world, false)
    Engine.clear(engine)
    engine = null
    world = null
  }
}

// ==================== BLOCK SPAWNING ====================

function getRandomBlockType() {
  return BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
}

function spawnSwingBlock() {
  currentBlockType = getRandomBlockType()
  swingAngle = Math.random() * Math.PI * 2 // random start position
  swingSpeed = BASE_SWING_SPEED + blocksStacked * SWING_SPEED_INCREMENT
  phase = 'swing'
}

function getSwingX() {
  const amplitude = canvasWidth.value * 0.35
  return canvasWidth.value / 2 + Math.sin(swingAngle) * amplitude
}

function dropBlock() {
  if (phase !== 'swing' || !currentBlockType) return

  const type = currentBlockType
  const x = getSwingX()

  const body = Bodies.rectangle(x, SWING_Y, type.width, type.height, {
    friction: 0.85,
    restitution: 0.01,
    density: type.density,
    frictionStatic: 1.0
  })

  World.add(world, body)

  currentBlock = { body, type }
  stackedBlocks.push(currentBlock)

  phase = 'drop'
  settleTimer = 0
  settleFrames = 0
}

// ==================== GAME LOGIC ====================

function isBlockOutOfBounds(block) {
  if (!block) return false
  const pos = block.body.position
  const cw = canvasWidth.value
  return pos.y > groundY + 80 || pos.x < -100 || pos.x > cw + 100
}

function areBlocksSettled() {
  let allSlow = true
  for (const block of stackedBlocks) {
    const v = block.body.velocity
    if (Math.abs(v.x) > 0.4 || Math.abs(v.y) > 0.4) {
      allSlow = false
      break
    }
  }

  if (allSlow) {
    settleFrames++
    if (settleFrames >= SETTLE_FRAMES_REQUIRED) return true
  } else {
    settleFrames = Math.max(0, settleFrames - 2)
  }

  settleTimer++
  return settleTimer > SETTLE_MAX_WAIT
}

function checkStackIntegrity() {
  // Check if any block fell off the platform area
  for (const block of stackedBlocks) {
    const pos = block.body.position
    if (pos.y > groundY + 30) return false
  }
  return true
}

/**
 * Check drop quality: 'perfect' | 'near' | 'normal'
 * Perfect: within PERFECT_THRESHOLD (12px)
 * Near Perfect: within SNAP_THRESHOLD (30px) - triggers magnetic snap
 * Normal: beyond SNAP_THRESHOLD
 */
function checkDropQuality() {
  if (!currentBlock) return 'normal'

  const isFirstBlock = stackedBlocks.length < 2
  const cx = currentBlock.body.position.x
  const targetX = isFirstBlock
    ? canvasWidth.value / 2
    : lastStackedCenterX

  const dist = Math.abs(cx - targetX)

  if (dist < PERFECT_THRESHOLD) return 'perfect'
  // Magnetic snap only works when stacking on other blocks, not on the platform
  if (!isFirstBlock && dist < SNAP_THRESHOLD) return 'near'
  return 'normal'
}

/**
 * Magnetic snap: smoothly move block toward the target center X.
 * Called when quality is 'near' to assist the player.
 */
function applyMagneticSnap() {
  if (!currentBlock) return

  const targetX = stackedBlocks.length < 2
    ? canvasWidth.value / 2
    : lastStackedCenterX

  const pos = currentBlock.body.position
  const snapX = pos.x + (targetX - pos.x) * 0.7 // Lerp 70% toward target

  Body.setPosition(currentBlock.body, { x: snapX, y: pos.y })
  Body.setVelocity(currentBlock.body, { x: 0, y: 0 })
  Body.setAngle(currentBlock.body, 0)
  Body.setAngularVelocity(currentBlock.body, 0)

  // Add snap glow effect
  snapGlowEffects.push({
    x: snapX, y: pos.y,
    width: currentBlock.type.width,
    height: currentBlock.type.height,
    life: 30, maxLife: 30
  })
}

function getStackHeight() {
  if (stackedBlocks.length === 0) return 0
  let highest = groundY
  for (const block of stackedBlocks) {
    const pos = block.body.position
    if (pos.y < highest && pos.y < groundY) {
      highest = pos.y
    }
  }
  return Math.max(0, groundY - highest)
}

function update() {
  if (gameState.value !== 'playing') return
  frameCount++

  Engine.update(engine, 1000 / 60)
  updateFx()

  if (phase === 'swing') {
    swingAngle += swingSpeed
  } else if (phase === 'drop' || phase === 'settle') {
    // Check if the dropped block fell out
    if (isBlockOutOfBounds(currentBlock)) {
      endGame()
      return
    }

    // Check if any stacked block fell
    for (const block of stackedBlocks) {
      if (block !== currentBlock && isBlockOutOfBounds(block)) {
        endGame()
        return
      }
    }

    // Check if everything has settled
    if (areBlocksSettled()) {
      if (!checkStackIntegrity()) {
        endGame()
        return
      }

      // Check drop quality and apply snap if needed
      const quality = checkDropQuality()

      if (quality === 'near') {
        applyMagneticSnap()
      }

      lastStackedCenterX = (quality === 'normal')
        ? currentBlock.body.position.x
        : (stackedBlocks.length < 2 ? canvasWidth.value / 2 : lastStackedCenterX)

      blocksStacked++
      let pts = 100

      if (quality === 'perfect') {
        perfectDrops++
        combo++
        const comboMultiplier = Math.min(combo, 5)
        const perfectPts = 50 * comboMultiplier
        totalPerfectBonus += perfectPts
        pts += perfectPts

        addFloatingText(
          currentBlock.body.position.x,
          currentBlock.body.position.y - 20,
          combo > 1 ? `Perfect! x${comboMultiplier}` : 'Perfect!',
          '#ffb74d'
        )
        addParticles(currentBlock.body.position.x, currentBlock.body.position.y, '#ffb74d', 10)
      } else if (quality === 'near') {
        // Near Perfect: snap + bonus, keep combo alive
        combo++
        const nearPts = 25
        totalPerfectBonus += nearPts
        pts += nearPts

        addFloatingText(
          currentBlock.body.position.x,
          currentBlock.body.position.y - 20,
          'Near Perfect! +25',
          '#42a5f5'
        )
        addParticles(currentBlock.body.position.x, currentBlock.body.position.y, '#42a5f5', 6)
      } else {
        combo = 0
        addFloatingText(
          currentBlock.body.position.x,
          currentBlock.body.position.y - 20,
          '+100',
          '#e0e1e4'
        )
      }

      // Check if stack reached the top (victory!)
      if (currentBlock.body.position.y < SWING_Y + 60) {
        // Stack reached the sky! Big bonus
        addFloatingText(canvasWidth.value / 2, canvasHeight.value / 2, 'MAX HEIGHT!', '#66bb6a')
        endGame()
        return
      }

      currentBlock = null
      spawnSwingBlock()
    }
  }
}

// ==================== DRAWING ====================

function drawBackground() {
  const cw = canvasWidth.value
  const ch = canvasHeight.value

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, ch)
  grad.addColorStop(0, '#16171b')
  grad.addColorStop(1, '#1e1f25')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, cw, ch)

  // Subtle vertical grid
  ctx.strokeStyle = 'rgba(58, 59, 62, 0.08)'
  ctx.lineWidth = 1
  for (let x = 0; x < cw; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, ch)
    ctx.stroke()
  }
}

function drawPlatform() {
  const cw = canvasWidth.value
  const pX = cw / 2 - PLATFORM_WIDTH / 2
  const pY = groundY

  // Desk shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.roundRect(pX - 4, pY + 4, PLATFORM_WIDTH + 8, PLATFORM_HEIGHT + 4, 4)
  ctx.fill()

  // Desk body
  const deskGrad = ctx.createLinearGradient(0, pY, 0, pY + PLATFORM_HEIGHT)
  deskGrad.addColorStop(0, '#4a4b52')
  deskGrad.addColorStop(1, '#3a3b42')
  ctx.fillStyle = deskGrad
  ctx.beginPath()
  ctx.roundRect(pX, pY, PLATFORM_WIDTH, PLATFORM_HEIGHT, 4)
  ctx.fill()

  // Desk surface highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.beginPath()
  ctx.roundRect(pX + 2, pY, PLATFORM_WIDTH - 4, 3, 2)
  ctx.fill()

  // Desk legs
  ctx.fillStyle = '#35363c'
  ctx.fillRect(pX + 15, pY + PLATFORM_HEIGHT, 8, 20)
  ctx.fillRect(pX + PLATFORM_WIDTH - 23, pY + PLATFORM_HEIGHT, 8, 20)
}

function drawSwingBlock() {
  if (phase !== 'swing' || !currentBlockType) return

  const x = getSwingX()
  const y = SWING_Y
  const type = currentBlockType
  const cw = canvasWidth.value

  // Guide line (dotted)
  ctx.setLineDash([3, 8])
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + type.height / 2)
  ctx.lineTo(x, groundY)
  ctx.stroke()
  ctx.setLineDash([])

  // Swing rail
  ctx.strokeStyle = 'rgba(58, 59, 62, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cw * 0.15, 14)
  ctx.lineTo(cw * 0.85, 14)
  ctx.stroke()

  // Connector line to block
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, 14)
  ctx.lineTo(x, y - type.height / 2)
  ctx.stroke()

  // Block
  drawBlockShape(x, y, type, 0)
}

function drawBlockShape(cx, cy, type, angle) {
  const { width, height, color, emoji } = type

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.beginPath()
  ctx.roundRect(-width / 2 + 2, -height / 2 + 3, width, height, 3)
  ctx.fill()

  // Body
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(-width / 2, -height / 2, width, height, 3)
  ctx.fill()

  // Top highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.roundRect(-width / 2 + 1, -height / 2, width - 2, 3, 2)
  ctx.fill()

  // Emoji
  const fontSize = Math.min(height - 4, 14)
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 1)

  ctx.restore()
}

function drawStackedBlocks() {
  for (const block of stackedBlocks) {
    const pos = block.body.position
    const angle = block.body.angle
    drawBlockShape(pos.x, pos.y, block.type, angle)
  }
}

function drawUI() {
  const cw = canvasWidth.value

  // Block counter (top left)
  ctx.fillStyle = '#e0e1e4'
  ctx.font = 'bold 14px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`📚 ${blocksStacked} ชิ้น`, 16, 14)

  // Combo indicator
  if (combo > 1) {
    ctx.fillStyle = '#ffb74d'
    ctx.font = 'bold 12px "Segoe UI", sans-serif'
    ctx.fillText(`Combo x${Math.min(combo, 5)}`, 16, 34)
  }

  // Live score (top right)
  const liveScore = blocksStacked * 100 + totalPerfectBonus + Math.floor(getStackHeight())
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  ctx.roundRect(cw - 155, 10, 142, 34, 10)
  ctx.fill()

  ctx.fillStyle = '#e0e1e4'
  ctx.font = 'bold 18px "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(liveScore).padStart(5, '0'), cw - 20, 27)

  ctx.fillStyle = '#6b6c6f'
  ctx.font = '10px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE', cw - 148, 27)

  // Speed indicator
  const speed = Math.min(1, (swingSpeed - BASE_SWING_SPEED) / 0.06)
  const barW = 60
  const barH = 4
  const barX = cw - 148
  const barY = 50

  ctx.fillStyle = 'rgba(58, 59, 62, 0.3)'
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW, barH, 2)
  ctx.fill()

  const speedGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
  speedGrad.addColorStop(0, '#42a5f5')
  speedGrad.addColorStop(1, '#ef5350')
  ctx.fillStyle = speedGrad
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW * speed, barH, 2)
  ctx.fill()

  ctx.fillStyle = '#6b6c6f'
  ctx.font = '9px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('SPEED', barX, barY - 2)

  // Height indicator on right side
  const height = getStackHeight()
  if (height > 10) {
    const highestY = groundY - height
    ctx.strokeStyle = 'rgba(66, 165, 245, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 5])
    ctx.beginPath()
    ctx.moveTo(cw - 60, highestY)
    ctx.lineTo(cw - 25, highestY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(66, 165, 245, 0.5)'
    ctx.font = '10px "Segoe UI", sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.floor(height)}px`, cw - 65, highestY)
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawFloatingTexts() {
  for (const ft of floatingTexts) {
    const alpha = ft.life / ft.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = ft.color
    ctx.font = 'bold 13px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ft.text, ft.x, ft.y)
  }
  ctx.globalAlpha = 1
}

function render() {
  if (!ctx) return

  drawBackground()
  drawPlatform()
  drawStackedBlocks()
  drawSwingBlock()
  drawParticles()
  drawFloatingTexts()

  if (gameState.value === 'playing') {
    drawUI()
  }
}

// ==================== GAME LOOP ====================

function gameLoop() {
  if (gameState.value !== 'playing') return
  update()
  render()
  animFrameId = requestAnimationFrame(gameLoop)
}

// ==================== INPUT ====================

function getCanvasCoords(clientX, clientY) {
  const canvas = gameCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvasWidth.value / rect.width
  const scaleY = canvasHeight.value / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

function handleCanvasClick() {
  if (gameState.value === 'playing' && phase === 'swing') {
    dropBlock()
  }
}

function handleTouchStart(event) {
  if (event.touches.length > 0) {
    handleCanvasClick()
  }
}

// ==================== GAME STATE ====================

function calculateFinalScore() {
  const blockScore = blocksStacked * 100
  const heightBonus = Math.floor(getStackHeight())
  const total = blockScore + totalPerfectBonus + heightBonus
  return { total, blockScore, perfectBonus: totalPerfectBonus, heightBonus }
}

function resetGame() {
  for (const block of stackedBlocks) {
    try { Composite.remove(world, block.body) } catch (e) { /* ignore */ }
  }

  stackedBlocks = []
  currentBlock = null
  currentBlockType = null
  frameCount = 0
  phase = 'swing'
  swingAngle = 0
  swingSpeed = BASE_SWING_SPEED
  blocksStacked = 0
  perfectDrops = 0
  combo = 0
  totalPerfectBonus = 0
  settleTimer = 0
  settleFrames = 0
  floatingTexts = []
  particles = []
  snapGlowEffects = []
  lastStackedCenterX = canvasWidth.value / 2
  isNewBest.value = false
}

function startGame() {
  cleanupMatter()
  initMatter()
  resetGame()
  spawnSwingBlock()
  gameState.value = 'playing'
  animFrameId = requestAnimationFrame(gameLoop)
}

async function endGame() {
  gameState.value = 'gameover'

  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  render()

  const { total, blockScore, perfectBonus, heightBonus } = calculateFinalScore()
  displayScore.value = total
  displayBlocksStacked.value = blocksStacked
  displayPerfectBonus.value = perfectBonus
  displayHeightBonus.value = heightBonus

  if (!gameStore.personalBest || total > gameStore.personalBest.score) {
    isNewBest.value = true
  }

  if (total > 0) {
    await gameStore.submitScore(GAME_ID, total)
  }

  await Promise.all([
    gameStore.fetchLeaderboard(GAME_ID, 10),
    gameStore.fetchRecentScores(GAME_ID, 5)
  ])
}

// ==================== CANVAS SETUP ====================

function initCanvas() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return

  canvasWidth.value = wrapper.clientWidth - 4
  canvasHeight.value = Math.max(350, Math.min(550, Math.floor(canvasWidth.value * 0.42)))

  nextTick(() => {
    const canvas = gameCanvas.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    renderIdleScreen()
  })
}

function renderIdleScreen() {
  if (!ctx) return
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  groundY = ch - 45

  drawBackground()
  drawPlatform()

  // Preview stack (spaced for larger blocks)
  const previewBlocks = [
    { type: BLOCK_TYPES[0], x: cw / 2, y: groundY - 12, angle: 0 },
    { type: BLOCK_TYPES[1], x: cw / 2 + 3, y: groundY - 34, angle: 0.02 },
    { type: BLOCK_TYPES[2], x: cw / 2 - 2, y: groundY - 58, angle: -0.01 },
    { type: BLOCK_TYPES[3], x: cw / 2 + 5, y: groundY - 86, angle: 0.04 },
    { type: BLOCK_TYPES[4], x: cw / 2 - 1, y: groundY - 112, angle: -0.02 }
  ]

  for (const pb of previewBlocks) {
    drawBlockShape(pb.x, pb.y, pb.type, pb.angle)
  }
}

function handleResize() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return

  canvasWidth.value = wrapper.clientWidth - 4
  canvasHeight.value = Math.max(350, Math.min(550, Math.floor(canvasWidth.value * 0.42)))

  nextTick(() => {
    if (gameState.value === 'idle') renderIdleScreen()
  })
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  initCanvas()
  window.addEventListener('resize', handleResize)

  await Promise.all([
    gameStore.fetchLeaderboard(GAME_ID, 10),
    gameStore.fetchPersonalBest(GAME_ID),
    gameStore.fetchRecentScores(GAME_ID, 5)
  ])
})

onBeforeUnmount(() => {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  cleanupMatter()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.stack-page {
  padding: 24px;
  min-height: 100vh;
}

.stack-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stack-game-area {
  flex: 1;
  min-width: 0;
}

.stack-game-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.stack-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(58, 59, 62, 0.3);
  border: 1px solid rgba(58, 59, 62, 0.3);
  color: #9e9fa3;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 500;
  transition: all 0.15s;
}

.stack-back-btn:hover {
  background: rgba(58, 59, 62, 0.5);
  color: #e0e1e4;
}

.stack-game-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0e1e4;
}

.stack-game-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  font-weight: 500;
}

.stack-personal-best {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
}

/* ====== Canvas ====== */
.stack-canvas-wrapper {
  position: relative;
  background: #1a1b1f;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(58, 59, 62, 0.3);
  display: flex;
  justify-content: center;
}

.stack-canvas-wrapper canvas {
  display: block;
  cursor: pointer;
}

/* ====== Overlays ====== */
.stack-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 27, 31, 0.85);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.stack-overlay-content {
  text-align: center;
}

.stack-overlay-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.stack-overlay-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #e0e1e4;
  letter-spacing: -0.02em;
}

.stack-overlay-sub {
  font-size: 0.78rem;
  color: #42a5f5;
  margin-top: 2px;
  font-weight: 600;
}

.stack-overlay-desc {
  font-size: 0.75rem;
  color: #9e9fa3;
  margin-top: 10px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.stack-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 32px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #42a5f5, #64b5f6);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
  box-shadow: 0 4px 18px rgba(66, 165, 245, 0.35);
}

.stack-play-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 24px rgba(66, 165, 245, 0.45);
  filter: brightness(1.08);
}

.stack-play-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(66, 165, 245, 0.3);
}

.stack-overlay-controls {
  margin-top: 14px;
  display: flex;
  gap: 18px;
  justify-content: center;
}

.stack-control-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #6b6c6f;
}

.stack-key {
  display: inline-block;
  background: rgba(58, 59, 62, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.6);
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #e0e1e4;
  font-family: monospace;
}

/* Game Over */
.stack-gameover-breakdown {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(58, 59, 62, 0.15);
  border-radius: 10px;
}

.stack-breakdown-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 0.75rem;
}

.stack-breakdown-label {
  color: #9e9fa3;
}

.stack-breakdown-value {
  color: #e0e1e4;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stack-gameover-score {
  margin-top: 12px;
}

.stack-score-label {
  font-size: 0.72rem;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stack-score-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #42a5f5;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.stack-new-best {
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #66bb6a;
}

/* ====== Bottom Panels ====== */
.stack-bottom-panels {
  display: flex;
  gap: 16px;
}

.stack-panel-stats {
  width: 260px;
  min-width: 260px;
}

.stack-panel-leaderboard {
  flex: 1;
  min-width: 0;
}

.stack-leaderboard-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px;
}

.stack-panel-card {
  background: #23242a;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.stack-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 14px;
}

.stack-panel-loading {
  text-align: center;
  padding: 20px 0;
  color: #6b6c6f;
}

.stack-panel-empty {
  text-align: center;
  padding: 20px 0;
  color: #6b6c6f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

.stack-lb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.stack-lb-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.stack-lb-me {
  background: rgba(66, 165, 245, 0.08);
  border: 1px solid rgba(66, 165, 245, 0.12);
}

.stack-lb-rank {
  width: 26px;
  text-align: center;
  font-size: 0.82rem;
}

.stack-lb-rank-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6c6f;
}

.stack-lb-avatar {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: #9e9fa3;
  overflow: hidden;
}

.stack-lb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stack-lb-info {
  flex: 1;
  min-width: 0;
}

.stack-lb-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e0e1e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stack-lb-score {
  font-size: 0.82rem;
  font-weight: 700;
  color: #42a5f5;
  font-variant-numeric: tabular-nums;
}

/* ====== Stats Grid ====== */
.stack-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stack-stat {
  text-align: center;
  padding: 10px 4px;
  background: rgba(58, 59, 62, 0.15);
  border-radius: 10px;
}

.stack-stat-value {
  font-size: 1rem;
  font-weight: 800;
  color: #e0e1e4;
  font-variant-numeric: tabular-nums;
}

.stack-stat-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .stack-page {
    padding: 12px;
  }

  .stack-bottom-panels {
    flex-direction: column;
  }

  .stack-panel-stats {
    width: 100%;
    min-width: 0;
  }

  .stack-game-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .stack-personal-best {
    margin-left: 0;
  }

  .stack-leaderboard-list {
    grid-template-columns: 1fr;
  }
}
</style>
