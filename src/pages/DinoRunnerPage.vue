<template>
  <q-page class="dino-page">
    <div class="dino-container">
      <!-- Left: Game Area -->
      <div class="dino-game-area">
        <!-- Game Header -->
        <div class="dino-game-header">
          <button class="dino-back-btn" @click="$router.push('/games')">
            <q-icon name="arrow_back" size="18px" />
            <span>Arcade</span>
          </button>
          <div class="dino-game-title">
            <q-icon name="directions_run" size="20px" style="color: #66bb6a;" />
            <span>Dino Runner</span>
            <span class="dino-game-subtitle">Office Edition</span>
          </div>
          <div v-if="gameStore.personalBest" class="dino-personal-best">
            <q-icon name="emoji_events" size="14px" />
            <span>Best: {{ gameStore.personalBest.score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Canvas Wrapper -->
        <div class="dino-canvas-wrapper" ref="canvasWrapper">
          <canvas
            ref="gameCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            @click="handleCanvasClick"
            @touchstart.prevent="handleTouchStart"
            @touchend.prevent="handleTouchEnd"
          ></canvas>

          <!-- Start Overlay -->
          <div v-if="gameState === 'idle'" class="dino-overlay">
            <div class="dino-overlay-content">
              <img src="/images/dino/dino-01.png" class="dino-overlay-dino-img" alt="Dino" />
              <div class="dino-overlay-title">Dino Runner</div>
              <div class="dino-overlay-sub">Office Edition</div>
              <button class="dino-play-btn" @click.stop="startGame">
                <q-icon name="play_arrow" size="22px" />
                <span>เริ่มเกม</span>
              </button>
              <div class="dino-overlay-controls">
                <div class="dino-control-item">
                  <span class="dino-key">↑</span> / <span class="dino-key">Space</span>
                  <span>กระโดด</span>
                </div>
                <div class="dino-control-item">
                  <span class="dino-key">↓</span>
                  <span>ก้มหัว</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Over Overlay -->
          <div v-if="gameState === 'gameover'" class="dino-overlay dino-overlay-gameover">
            <div class="dino-overlay-content">
              <div class="dino-overlay-icon">💥</div>
              <div class="dino-overlay-title">Game Over</div>
              <div class="dino-gameover-score">
                <div class="dino-score-label">คะแนน</div>
                <div class="dino-score-value">{{ displayScore.toLocaleString() }}</div>
              </div>
              <div v-if="isNewBest" class="dino-new-best">🎉 New Personal Best!</div>
              <button class="dino-play-btn dino-retry-btn" @click.stop="startGame">
                <q-icon name="replay" size="20px" />
                <span>เล่นอีกครั้ง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Leaderboard + Stats -->
      <div class="dino-bottom-panels">
        <!-- My Stats -->
        <div class="dino-panel-card dino-panel-stats">
          <div class="dino-panel-header">
            <q-icon name="person" size="18px" style="color: #5c9ce6;" />
            <span>สถิติของฉัน</span>
          </div>
          <div class="dino-stats-grid">
            <div class="dino-stat">
              <div class="dino-stat-value">{{ gameStore.personalBest?.score?.toLocaleString() || '-' }}</div>
              <div class="dino-stat-label">Best Score</div>
            </div>
            <div class="dino-stat">
              <div class="dino-stat-value">{{ myRank || '-' }}</div>
              <div class="dino-stat-label">Rank</div>
            </div>
            <div class="dino-stat">
              <div class="dino-stat-value">{{ gameStore.recentScores.length }}</div>
              <div class="dino-stat-label">Games</div>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="dino-panel-card dino-panel-leaderboard">
          <div class="dino-panel-header">
            <q-icon name="leaderboard" size="18px" style="color: #ffb74d;" />
            <span>Leaderboard</span>
          </div>

          <div v-if="gameStore.loading" class="dino-panel-loading">
            <q-spinner-dots size="24px" />
          </div>

          <div v-else-if="gameStore.leaderboard.length === 0" class="dino-panel-empty">
            <q-icon name="emoji_events" size="36px" />
            <span>ยังไม่มีคะแนน</span>
          </div>

          <div v-else class="dino-leaderboard-list">
            <div
              v-for="(entry, idx) in gameStore.leaderboard"
              :key="entry.id"
              class="dino-lb-item"
              :class="{ 'dino-lb-me': entry.userId === currentUserEmail }"
            >
              <div class="dino-lb-rank">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else class="dino-lb-rank-num">#{{ idx + 1 }}</span>
              </div>
              <div class="dino-lb-avatar">
                <img v-if="entry.photoURL" :src="entry.photoURL" />
                <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="dino-lb-info">
                <div class="dino-lb-name">{{ entry.displayName }}</div>
              </div>
              <div class="dino-lb-score">{{ entry.score.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useGameStore } from 'src/stores/game'
import { useAuthStore } from 'src/stores/auth'

const GAME_ID = 'dino-runner'

const gameStore = useGameStore()
const authStore = useAuthStore()

const gameCanvas = ref(null)
const canvasWrapper = ref(null)
const canvasWidth = ref(1200)
const canvasHeight = ref(400)

const gameState = ref('idle') // 'idle' | 'playing' | 'gameover'
const displayScore = ref(0)
const isNewBest = ref(false)

const currentUserEmail = computed(() => authStore.user?.email || '')
const myRank = computed(() => gameStore.getMyRank())

// ==================== GAME ENGINE ====================

let ctx = null
let animFrameId = null
let lastTime = 0

// Game state variables
let score = 0
let gameSpeed = 0
let frameCount = 0

// Player
const player = {
  x: 80,
  y: 0,
  width: 50,
  height: 62,
  velocityY: 0,
  isJumping: false,
  isDucking: false,
  isFastFalling: false,
  duckHeight: 34,
  normalHeight: 62,
  // Animation
  legFrame: 0,
  legTimer: 0
}

// Ground
const GROUND_Y_OFFSET = 60 // distance from bottom of canvas

// Physics
const GRAVITY = 0.7
const JUMP_FORCE = -14.5
const FAST_FALL_GRAVITY = 3.5  // fast fall when pressing down mid-air
const INITIAL_SPEED = 6
const MAX_SPEED = 18
const SPEED_INCREMENT = 0.003

// Obstacles
let obstacles = []
let obstacleTimer = 0
let nextObstacleGap = 0 // frames until next obstacle (pre-calculated per spawn)
const MIN_GAP_FRAMES = 28
const MAX_GAP_FRAMES = 90

// Preloaded images
const obstacleImages = {}
const playerImages = { run: null, duck: null }

function preloadImages() {
  // Obstacle images
  const obstacleMap = {
    bug: '/images/dino/01.png',
    docs: '/images/dino/02.png',
    deadline: '/images/dino/03.png',
    coffee: '/images/dino/04.png'
  }
  for (const [key, src] of Object.entries(obstacleMap)) {
    const img = new Image()
    img.src = src
    obstacleImages[key] = img
  }

  // Player images: dino-01 = run, dino-02 = duck
  const runImg = new Image()
  runImg.src = '/images/dino/dino-01.png'
  playerImages.run = runImg

  const duckImg = new Image()
  duckImg.src = '/images/dino/dino-02.png'
  playerImages.duck = duckImg
}

// Obstacle types
const OBSTACLE_TYPES = [
  { name: 'bug', width: 40, height: 40, color: '#ef5350' },
  { name: 'docs', width: 36, height: 48, color: '#ffb74d' },
  { name: 'deadline', width: 48, height: 38, color: '#ab47bc' },
  { name: 'coffee', width: 32, height: 36, color: '#8d6e63' }
]

// Clouds
let clouds = []
let cloudTimer = 0

// Day/Night
let isDayMode = true
let dayNightTimer = 0
let transitionAlpha = 0

// Milestone flash
let milestoneFlash = 0

// Ground particles
let groundOffset = 0

// Input tracking
let touchStartY = 0
let isDownKeyHeld = false

// ==================== DRAWING FUNCTIONS ====================

function getGroundY() {
  return canvasHeight.value - GROUND_Y_OFFSET
}

function drawBackground() {
  const w = canvasWidth.value
  const h = canvasHeight.value

  // Sky gradient
  if (isDayMode) {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1a1b1f')
    grad.addColorStop(1, '#23242a')
    ctx.fillStyle = grad
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#0d0e12')
    grad.addColorStop(1, '#16171b')
    ctx.fillStyle = grad
  }
  ctx.fillRect(0, 0, w, h)

  // Milestone flash effect
  if (milestoneFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${milestoneFlash * 0.08})`
    ctx.fillRect(0, 0, w, h)
    milestoneFlash -= 0.5
  }
}

function drawClouds() {
  ctx.fillStyle = isDayMode ? 'rgba(58, 59, 62, 0.3)' : 'rgba(38, 39, 42, 0.3)'
  for (const cloud of clouds) {
    // Simple cloud shape
    ctx.beginPath()
    ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cloud.x - cloud.w * 0.25, cloud.y + 3, cloud.w * 0.3, cloud.h * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cloud.x + cloud.w * 0.25, cloud.y + 2, cloud.w * 0.35, cloud.h * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawGround() {
  const groundY = getGroundY()
  const w = canvasWidth.value

  // Ground line
  ctx.strokeStyle = isDayMode ? '#3a3b3e' : '#2a2b2e'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(w, groundY)
  ctx.stroke()

  // Ground texture (moving dots)
  ctx.fillStyle = isDayMode ? '#2a2b2e' : '#1e1f22'
  const dotSpacing = 50
  for (let x = -dotSpacing + (groundOffset % dotSpacing); x < w; x += dotSpacing) {
    ctx.fillRect(x, groundY + 10, 16, 1)
    ctx.fillRect(x + 25, groundY + 22, 10, 1)
  }
}

function drawPlayer() {
  const groundY = getGroundY()
  const h = player.isDucking ? player.duckHeight : player.normalHeight
  const py = groundY - h - player.y

  // Choose the right sprite
  const img = player.isDucking ? playerImages.duck : playerImages.run
  const imgReady = img && img.complete && img.naturalWidth > 0

  if (imgReady) {
    // Draw PNG sprite sized to match hitbox
    const drawW = player.isDucking ? 70 : 60
    const drawH = player.isDucking ? 42 : 68
    const drawX = player.x - drawW / 2
    const drawY = groundY - drawH - player.y

    ctx.drawImage(img, drawX, drawY, drawW, drawH)
  } else {
    // Fallback: geometric player
    ctx.fillStyle = '#5c9ce6'

    if (player.isDucking) {
      ctx.beginPath()
      ctx.roundRect(player.x - 22, py + 4, 44, 28, 7)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(player.x + 18, py + 10, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1a1b1f'
      ctx.beginPath()
      ctx.arc(player.x + 22, py + 8, 2.5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(player.x, py + 14, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1a1b1f'
      ctx.beginPath()
      ctx.arc(player.x + 5, py + 12, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#5c9ce6'
      ctx.beginPath()
      ctx.roundRect(player.x - 11, py + 27, 22, 22, 5)
      ctx.fill()
      ctx.fillStyle = '#3a7bd5'
      const legOffset = Math.sin(player.legFrame * 0.3) * 6
      ctx.fillRect(player.x - 9, py + 48, 8, 12 + legOffset)
      ctx.fillRect(player.x + 1, py + 48, 8, 12 - legOffset)
    }
  }
}

function drawObstacles() {
  const groundY = getGroundY()

  for (const obs of obstacles) {
    const type = obs.type
    const ox = obs.x
    const oy = groundY - type.height

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(ox + type.width / 2, groundY + 2, type.width / 2 + 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw image if loaded, otherwise fallback to colored rectangle
    const img = obstacleImages[type.name]
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, ox, oy, type.width, type.height)
    } else {
      ctx.fillStyle = type.color
      ctx.beginPath()
      ctx.roundRect(ox, oy, type.width, type.height, 4)
      ctx.fill()
    }
  }
}

function drawScore() {
  // Score background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.roundRect(canvasWidth.value - 160, 12, 148, 38, 10)
  ctx.fill()

  // Score text
  ctx.fillStyle = '#e0e1e4'
  ctx.font = 'bold 20px "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(Math.floor(score)).padStart(5, '0'), canvasWidth.value - 22, 31)

  // HI score
  if (gameStore.personalBest) {
    ctx.fillStyle = '#6b6c6f'
    ctx.font = '12px "Segoe UI", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('HI ' + String(gameStore.personalBest.score).padStart(5, '0'), canvasWidth.value - 153, 31)
  }
}

function drawSpeedIndicator() {
  // Small speed bar at top left
  const barWidth = 80
  const barHeight = 5
  const x = 16
  const y = 22
  const progress = Math.min(1, (gameSpeed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED))

  ctx.fillStyle = 'rgba(58, 59, 62, 0.3)'
  ctx.beginPath()
  ctx.roundRect(x, y, barWidth, barHeight, 2)
  ctx.fill()

  const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0)
  gradient.addColorStop(0, '#66bb6a')
  gradient.addColorStop(0.5, '#ffb74d')
  gradient.addColorStop(1, '#ef5350')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(x, y, barWidth * progress, barHeight, 2)
  ctx.fill()

  ctx.fillStyle = '#6b6c6f'
  ctx.font = '10px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('SPEED', x, y - 3)
}

// ==================== GAME LOGIC ====================

function spawnCloud() {
  clouds.push({
    x: canvasWidth.value + 50,
    y: 20 + Math.random() * 60,
    w: 40 + Math.random() * 40,
    h: 14 + Math.random() * 10,
    speed: 0.3 + Math.random() * 0.5
  })
}

function spawnObstacle() {
  const typeIdx = Math.floor(Math.random() * OBSTACLE_TYPES.length)
  const type = OBSTACLE_TYPES[typeIdx]
  obstacles.push({
    x: canvasWidth.value + 10,
    type
  })

  // At higher speeds, chance to spawn a second obstacle nearby (cluster)
  const speedRatio = Math.min(1, (gameSpeed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED))
  if (speedRatio > 0.4 && Math.random() < speedRatio * 0.4) {
    // Spawn a second obstacle with a small gap behind the first
    const type2Idx = Math.floor(Math.random() * OBSTACLE_TYPES.length)
    const type2 = OBSTACLE_TYPES[type2Idx]
    const clusterGap = 60 + Math.random() * 40 // 60-100px behind
    obstacles.push({
      x: canvasWidth.value + 10 + clusterGap,
      type: type2
    })
  }
}

function checkCollision() {
  const groundY = getGroundY()
  const h = player.isDucking ? player.duckHeight : player.normalHeight
  const py = groundY - h - player.y

  // Player hitbox (slightly smaller than visual)
  const px1 = player.x - (player.isDucking ? 18 : 9)
  const py1 = py + 6
  const px2 = player.x + (player.isDucking ? 18 : 9)
  const py2 = py + h - 3

  for (const obs of obstacles) {
    const ox1 = obs.x + 3
    const oy1 = groundY - obs.type.height + 3
    const ox2 = obs.x + obs.type.width - 3
    const oy2 = groundY - 2

    // AABB collision
    if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
      return true
    }
  }

  return false
}

function resetGame() {
  score = 0
  gameSpeed = INITIAL_SPEED
  frameCount = 0
  obstacles = []
  obstacleTimer = 0
  player.y = 0
  player.velocityY = 0
  player.isJumping = false
  player.isDucking = false
  player.isFastFalling = false
  player.legFrame = 0
  isDownKeyHeld = false
  nextObstacleGap = 60
  isDayMode = true
  dayNightTimer = 0
  milestoneFlash = 0
  groundOffset = 0
  isNewBest.value = false
}

function startGame() {
  resetGame()
  gameState.value = 'playing'
  lastTime = performance.now()
  gameLoop(lastTime)
}

async function endGame() {
  gameState.value = 'gameover'
  displayScore.value = Math.floor(score)

  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  // Check if new personal best
  if (!gameStore.personalBest || displayScore.value > gameStore.personalBest.score) {
    isNewBest.value = true
  }

  // Submit score to Firestore
  await gameStore.submitScore(GAME_ID, displayScore.value)

  // Refresh leaderboard
  await Promise.all([
    gameStore.fetchLeaderboard(GAME_ID, 10),
    gameStore.fetchRecentScores(GAME_ID, 5)
  ])
}

function update() {
  if (gameState.value !== 'playing') return

  frameCount++
  score += gameSpeed * 0.05
  gameSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + frameCount * SPEED_INCREMENT)

  // Check milestone
  const scoreInt = Math.floor(score)
  if (scoreInt > 0 && scoreInt % 100 === 0 && milestoneFlash <= 0) {
    milestoneFlash = 10
  }

  // Day/Night cycle
  dayNightTimer++
  if (dayNightTimer >= 500 / (gameSpeed * 0.05)) {
    dayNightTimer = 0
    if (scoreInt > 0 && scoreInt % 500 < 10) {
      isDayMode = !isDayMode
    }
  }

  // Update player
  if (player.isJumping) {
    // Apply fast fall gravity if pressing down, otherwise normal gravity
    const currentGravity = player.isFastFalling ? FAST_FALL_GRAVITY : GRAVITY
    player.velocityY += currentGravity
    player.y -= player.velocityY

    if (player.y <= 0) {
      player.y = 0
      player.velocityY = 0
      player.isJumping = false
      player.isFastFalling = false
      // If down key is still held when landing, transition to duck
      if (isDownKeyHeld) {
        player.isDucking = true
      }
    }
  }

  // Leg animation
  if (!player.isJumping) {
    player.legTimer++
    if (player.legTimer >= 3) {
      player.legTimer = 0
      player.legFrame++
    }
  }

  // Update ground offset
  groundOffset += gameSpeed

  // Update clouds
  cloudTimer++
  if (cloudTimer > 120 + Math.random() * 80) {
    cloudTimer = 0
    spawnCloud()
  }
  for (const cloud of clouds) {
    cloud.x -= cloud.speed
  }
  clouds = clouds.filter(c => c.x + c.w > -20)

  // Update obstacles
  obstacleTimer++
  if (obstacleTimer >= nextObstacleGap) {
    obstacleTimer = 0
    spawnObstacle()
    // Calculate next gap: gets progressively tighter as speed increases
    const speedRatio = Math.min(1, (gameSpeed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED)) // 0→1
    // Phase 1 (speedRatio 0-0.3): comfortable gaps ~300-450px
    // Phase 2 (speedRatio 0.3-0.7): medium gaps ~200-350px
    // Phase 3 (speedRatio 0.7-1.0): tight gaps ~150-250px, occasional double obstacles
    const baseMinDist = 300 - speedRatio * 160  // 300px → 140px
    const baseMaxDist = 450 - speedRatio * 250  // 450px → 200px
    const pixelDist = baseMinDist + Math.random() * (baseMaxDist - baseMinDist)
    const gapFrames = Math.ceil(pixelDist / gameSpeed)
    // Small random jitter so it doesn't feel robotic
    const jitter = Math.floor((Math.random() - 0.3) * 10)
    nextObstacleGap = Math.max(MIN_GAP_FRAMES, Math.min(MAX_GAP_FRAMES, gapFrames + jitter))
  }
  for (const obs of obstacles) {
    obs.x -= gameSpeed
  }
  obstacles = obstacles.filter(o => o.x + o.type.width > -20)

  // Collision check
  if (checkCollision()) {
    endGame()
    return
  }
}

function render() {
  if (!ctx) return

  drawBackground()
  drawClouds()
  drawGround()
  drawObstacles()
  drawPlayer()
  drawScore()
  drawSpeedIndicator()
}

function gameLoop(timestamp) {
  if (gameState.value !== 'playing') return

  update()
  render()

  animFrameId = requestAnimationFrame(gameLoop)
}

// ==================== INPUT HANDLING ====================

function jump() {
  if (!player.isJumping) {
    player.isJumping = true
    player.velocityY = JUMP_FORCE
    player.isDucking = false
  }
}

function duck(active) {
  isDownKeyHeld = active
  if (player.isJumping && active) {
    // Fast fall: slam down quickly when pressing down mid-air
    player.isFastFalling = true
  } else if (!player.isJumping) {
    player.isDucking = active
  }
  // When releasing down key, always clear ducking
  if (!active) {
    player.isDucking = false
  }
}

function handleKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    if (gameState.value === 'idle' || gameState.value === 'gameover') {
      startGame()
    } else if (gameState.value === 'playing') {
      jump()
    }
  } else if (e.code === 'ArrowDown') {
    e.preventDefault()
    if (gameState.value === 'playing') {
      duck(true)
    }
  }
}

function handleKeyUp(e) {
  if (e.code === 'ArrowDown') {
    e.preventDefault()
    duck(false)
  }
}

function handleCanvasClick() {
  if (gameState.value === 'idle' || gameState.value === 'gameover') {
    startGame()
  } else if (gameState.value === 'playing') {
    jump()
  }
}

function handleTouchStart(e) {
  if (e.touches.length > 0) {
    touchStartY = e.touches[0].clientY
  }

  if (gameState.value === 'idle' || gameState.value === 'gameover') {
    startGame()
  } else if (gameState.value === 'playing') {
    jump()
  }
}

function handleTouchEnd(e) {
  duck(false)
}

// ==================== LIFECYCLE ====================

function initCanvas() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return

  const wrapperWidth = wrapper.clientWidth
  canvasWidth.value = wrapperWidth - 4
  canvasHeight.value = Math.max(300, Math.min(500, Math.floor(canvasWidth.value * 0.38)))

  nextTick(() => {
    const canvas = gameCanvas.value
    if (!canvas) return
    ctx = canvas.getContext('2d')

    // Initial render
    renderIdleScreen()
  })
}

function renderIdleScreen() {
  if (!ctx) return
  const w = canvasWidth.value
  const h = canvasHeight.value

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#1a1b1f')
  grad.addColorStop(1, '#23242a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Ground line
  const groundY = getGroundY()
  ctx.strokeStyle = '#3a3b3e'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(w, groundY)
  ctx.stroke()

  // Draw static player
  player.y = 0
  player.isDucking = false
  player.isJumping = false
  drawPlayer()
}

function handleResize() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return

  const wrapperWidth = wrapper.clientWidth
  canvasWidth.value = wrapperWidth - 4
  canvasHeight.value = Math.max(300, Math.min(500, Math.floor(canvasWidth.value * 0.38)))

  nextTick(() => {
    if (gameState.value === 'idle') {
      renderIdleScreen()
    }
  })
}

onMounted(async () => {
  preloadImages()
  initCanvas()

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('resize', handleResize)

  // Fetch game data
  await Promise.all([
    gameStore.fetchLeaderboard(GAME_ID, 10),
    gameStore.fetchPersonalBest(GAME_ID),
    gameStore.fetchRecentScores(GAME_ID, 5)
  ])
})

onBeforeUnmount(() => {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
  }
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dino-page {
  padding: 24px;
  min-height: 100vh;
}

.dino-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ====== Game Area ====== */
.dino-game-area {
  flex: 1;
  min-width: 0;
}

.dino-game-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.dino-back-btn {
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

.dino-back-btn:hover {
  background: rgba(58, 59, 62, 0.5);
  color: #e0e1e4;
}

.dino-game-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0e1e4;
}

.dino-game-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  font-weight: 500;
}

.dino-personal-best {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ffb74d;
  background: rgba(255, 183, 77, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
}

/* ====== Canvas ====== */
.dino-canvas-wrapper {
  position: relative;
  background: #1a1b1f;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(58, 59, 62, 0.3);
  display: flex;
  justify-content: center;
}

.dino-canvas-wrapper canvas {
  display: block;
  cursor: pointer;
}

/* ====== Overlays ====== */
.dino-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 27, 31, 0.85);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.dino-overlay-content {
  text-align: center;
}

.dino-overlay-dino-img {
  width: 80px;
  height: auto;
  image-rendering: pixelated;
}

.dino-overlay-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.dino-overlay-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #e0e1e4;
  letter-spacing: -0.02em;
}

.dino-overlay-sub {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
  font-weight: 500;
}

.dino-overlay-hint {
  margin-top: 16px;
  font-size: 0.78rem;
  color: #9e9fa3;
}

.dino-key {
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

.dino-overlay-controls {
  margin-top: 14px;
  display: flex;
  gap: 18px;
  justify-content: center;
}

.dino-control-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #6b6c6f;
}

/* Game Over */
.dino-gameover-score {
  margin-top: 14px;
}

.dino-score-label {
  font-size: 0.72rem;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dino-score-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffb74d;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.dino-new-best {
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #66bb6a;
}

/* ====== Play / Retry Button ====== */
.dino-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 36px;
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(102, 187, 106, 0.3);
  letter-spacing: 0.02em;
}

.dino-play-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 24px rgba(102, 187, 106, 0.45);
  background: linear-gradient(135deg, #72c576 0%, #4caf50 100%);
}

.dino-play-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.25);
}

.dino-retry-btn {
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  box-shadow: 0 4px 16px rgba(92, 156, 230, 0.3);
}

.dino-retry-btn:hover {
  box-shadow: 0 6px 24px rgba(92, 156, 230, 0.45);
  background: linear-gradient(135deg, #6babf0 0%, #4a8be5 100%);
}

.dino-retry-btn:active {
  box-shadow: 0 2px 8px rgba(92, 156, 230, 0.25);
}

/* ====== Bottom Panels ====== */
.dino-bottom-panels {
  display: flex;
  gap: 16px;
}

.dino-panel-stats {
  width: 260px;
  min-width: 260px;
}

.dino-panel-leaderboard {
  flex: 1;
  min-width: 0;
}

.dino-leaderboard-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px;
}

.dino-panel-card {
  background: #23242a;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.dino-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 14px;
}

.dino-panel-loading {
  text-align: center;
  padding: 20px 0;
  color: #6b6c6f;
}

.dino-panel-empty {
  text-align: center;
  padding: 20px 0;
  color: #6b6c6f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

/* ====== Leaderboard List ====== */
.dino-lb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.dino-lb-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.dino-lb-me {
  background: rgba(92, 156, 230, 0.08);
  border: 1px solid rgba(92, 156, 230, 0.12);
}

.dino-lb-rank {
  width: 26px;
  text-align: center;
  font-size: 0.82rem;
}

.dino-lb-rank-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6c6f;
}

.dino-lb-avatar {
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

.dino-lb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dino-lb-info {
  flex: 1;
  min-width: 0;
}

.dino-lb-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e0e1e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dino-lb-score {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffb74d;
  font-variant-numeric: tabular-nums;
}

/* ====== Stats Grid ====== */
.dino-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.dino-stat {
  text-align: center;
  padding: 10px 4px;
  background: rgba(58, 59, 62, 0.15);
  border-radius: 10px;
}

.dino-stat-value {
  font-size: 1rem;
  font-weight: 800;
  color: #e0e1e4;
  font-variant-numeric: tabular-nums;
}

.dino-stat-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .dino-page {
    padding: 12px;
  }

  .dino-bottom-panels {
    flex-direction: column;
  }

  .dino-panel-stats {
    width: 100%;
    min-width: 0;
  }

  .dino-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .dino-game-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .dino-personal-best {
    margin-left: 0;
  }

  .dino-leaderboard-list {
    grid-template-columns: 1fr;
  }
}
</style>
