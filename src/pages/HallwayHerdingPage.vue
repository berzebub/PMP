<template>
  <q-page class="herd-page">
    <div class="herd-container">
      <!-- Game Area -->
      <div class="herd-game-area">
        <!-- Game Header -->
        <div class="herd-game-header">
          <button class="herd-back-btn" @click="$router.push('/games')">
            <q-icon name="arrow_back" size="18px" />
            <span>Arcade</span>
          </button>
          <div class="herd-game-title">
            <q-icon name="school" size="20px" style="color: #ec407a;" />
            <span>Hallway Herding</span>
            <span class="herd-game-subtitle">ครูเวรต้อนเด็ก</span>
          </div>
          <div v-if="gameStore.personalBest" class="herd-personal-best">
            <q-icon name="emoji_events" size="14px" />
            <span>Best: {{ gameStore.personalBest.score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Canvas Wrapper -->
        <div class="herd-canvas-wrapper" ref="canvasWrapper"
             :style="{ height: (canvasHeight * canvasScale) + 'px' }">
          <canvas
            ref="gameCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            :style="{ transform: 'scale(' + canvasScale + ')', transformOrigin: 'top left' }"
            @click="handleCanvasClick"
            @touchstart.prevent="handleTouchStart"
          ></canvas>

          <!-- Start Overlay -->
          <div v-if="gameState === 'idle'" class="herd-overlay">
            <div class="herd-overlay-content">
              <div class="herd-overlay-icon">🏫</div>
              <div class="herd-overlay-title">Hallway Herding</div>
              <div class="herd-overlay-sub">ครูเวรต้อนเด็ก</div>
              <div class="herd-overlay-desc">ต้อนเด็กๆ ให้เข้าห้องเรียนก่อนหมดเวลา 60 วินาที!</div>
              <button class="herd-play-btn" @click.stop="startGame">
                <q-icon name="play_arrow" size="20px" />
                <span>เริ่มเกม</span>
              </button>
              <div class="herd-overlay-controls">
                <div class="herd-control-item">
                  <span class="herd-key">Click</span>
                  <span>คลิกที่เด็กเพื่อดันเข้าห้อง</span>
                </div>
                <div class="herd-control-item">
                  <span class="herd-key">Power-up</span>
                  <span>คลิกเก็บไอเทมช่วยต้อน</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Over Overlay -->
          <div v-if="gameState === 'gameover'" class="herd-overlay herd-overlay-gameover">
            <div class="herd-overlay-content">
              <div class="herd-overlay-icon">🔔</div>
              <div class="herd-overlay-title">หมดเวลา!</div>
              <div class="herd-gameover-breakdown">
                <div class="herd-breakdown-item">
                  <span class="herd-breakdown-label">เด็กเข้าห้อง</span>
                  <span class="herd-breakdown-value">{{ displayKidsHerded }} x 100 = {{ displayKidsHerded * 100 }}</span>
                </div>
                <div class="herd-breakdown-item">
                  <span class="herd-breakdown-label">Time Bonus</span>
                  <span class="herd-breakdown-value">+{{ displayTimeBonus }}</span>
                </div>
                <div class="herd-breakdown-item">
                  <span class="herd-breakdown-label">Chaos Multiplier</span>
                  <span class="herd-breakdown-value">x{{ displayChaosMultiplier }}</span>
                </div>
              </div>
              <div class="herd-gameover-score">
                <div class="herd-score-label">คะแนนรวม</div>
                <div class="herd-score-value">{{ displayScore.toLocaleString() }}</div>
              </div>
              <div v-if="isNewBest" class="herd-new-best">🎉 New Personal Best!</div>
              <button class="herd-play-btn" @click.stop="startGame">
                <q-icon name="replay" size="20px" />
                <span>เล่นอีกครั้ง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Leaderboard + Stats -->
      <div class="herd-bottom-panels">
        <!-- My Stats -->
        <div class="herd-panel-card herd-panel-stats">
          <div class="herd-panel-header">
            <q-icon name="person" size="18px" style="color: #ec407a;" />
            <span>สถิติของฉัน</span>
          </div>
          <div class="herd-stats-grid">
            <div class="herd-stat">
              <div class="herd-stat-value">{{ gameStore.personalBest?.score?.toLocaleString() || '-' }}</div>
              <div class="herd-stat-label">Best Score</div>
            </div>
            <div class="herd-stat">
              <div class="herd-stat-value">{{ myRank || '-' }}</div>
              <div class="herd-stat-label">Rank</div>
            </div>
            <div class="herd-stat">
              <div class="herd-stat-value">{{ gameStore.recentScores.length }}</div>
              <div class="herd-stat-label">Games</div>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="herd-panel-card herd-panel-leaderboard">
          <div class="herd-panel-header">
            <q-icon name="leaderboard" size="18px" style="color: #ffb74d;" />
            <span>Leaderboard</span>
          </div>

          <div v-if="gameStore.loading" class="herd-panel-loading">
            <q-spinner-dots size="24px" />
          </div>

          <div v-else-if="gameStore.leaderboard.length === 0" class="herd-panel-empty">
            <q-icon name="emoji_events" size="36px" />
            <span>ยังไม่มีคะแนน</span>
          </div>

          <div v-else class="herd-leaderboard-list">
            <div
              v-for="(entry, idx) in gameStore.leaderboard"
              :key="entry.id"
              class="herd-lb-item"
              :class="{ 'herd-lb-me': entry.userId === currentUserEmail }"
            >
              <div class="herd-lb-rank">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else class="herd-lb-rank-num">#{{ idx + 1 }}</span>
              </div>
              <div class="herd-lb-avatar">
                <img v-if="entry.photoURL" :src="entry.photoURL" />
                <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="herd-lb-info">
                <div class="herd-lb-name">{{ entry.displayName }}</div>
              </div>
              <div class="herd-lb-score">{{ entry.score.toLocaleString() }}</div>
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

const GAME_ID = 'hallway-herding'
const GAME_DURATION = 60 // seconds
const KID_RADIUS = 18
const POWERUP_RADIUS = 20
const DOOR_HEIGHT = 180
const INITIAL_KID_COUNT = 10
const MAX_KIDS = 30
const SPAWN_INTERVAL = 360 // frames (~6 seconds)
const SPAWN_COUNT_MIN = 2
const SPAWN_COUNT_MAX = 4
const POWERUP_SPAWN_MIN = 600 // frames (~10s)
const POWERUP_SPAWN_MAX = 1080 // frames (~18s)

const KID_TYPES = {
  normal: {
    label: 'Normal',
    color: '#5c9ce6',
    borderColor: 'rgba(92, 156, 230, 0.4)',
    emoji: '🧒',
    speed: 1.8,
    frictionAir: 0.025,
    density: 0.001,
    restitution: 0.5,
    pushForce: 5,
    boss: false
  },
  phone: {
    label: 'Phone Addict',
    color: '#ffb74d',
    borderColor: 'rgba(255, 183, 77, 0.4)',
    emoji: '📱',
    speed: 0.4,
    frictionAir: 0.04,
    density: 0.004,
    restitution: 0.3,
    pushForce: 3,
    boss: true
  },
  sleepy: {
    label: 'Sleepy',
    color: '#ab47bc',
    borderColor: 'rgba(171, 71, 188, 0.4)',
    emoji: '😴',
    speed: 1.2,
    frictionAir: 0.03,
    density: 0.001,
    restitution: 0.4,
    pushForce: 4,
    boss: true
  },
  runner: {
    label: 'Runner',
    color: '#ef5350',
    borderColor: 'rgba(239, 83, 80, 0.4)',
    emoji: '🏃',
    speed: 3.0,
    frictionAir: 0.012,
    density: 0.0005,
    restitution: 0.7,
    pushForce: 6,
    boss: true
  }
}

const POWERUP_TYPES = {
  megaphone: { emoji: '📢', label: 'Megaphone', color: '#66bb6a', desc: 'เด็ก 5 คนเข้าห้องทันที!' },
  candy: { emoji: '🍭', label: 'Candy Bait', color: '#ffb74d', desc: 'ล่อเด็กมาที่จุดนี้ 5 วิ' },
  sleepy: { emoji: '💤', label: 'Sleepy Spray', color: '#ab47bc', desc: 'หยุดเด็กทุกคน 3 วิ' }
}

// ==================== STORES & REFS ====================

const gameStore = useGameStore()
const authStore = useAuthStore()

const gameCanvas = ref(null)
const canvasWrapper = ref(null)
const DESIGN_WIDTH = 1200
const DESIGN_HEIGHT = 500
const canvasWidth = ref(DESIGN_WIDTH)
const canvasHeight = ref(DESIGN_HEIGHT)
const canvasScale = ref(1)

const gameState = ref('idle') // 'idle' | 'playing' | 'gameover'
const displayScore = ref(0)
const displayKidsHerded = ref(0)
const displayTimeBonus = ref(0)
const displayChaosMultiplier = ref('1.00')
const isNewBest = ref(false)

const currentUserEmail = computed(() => authStore.user?.email || '')
const myRank = computed(() => gameStore.getMyRank())

// ==================== MATTER.JS VARIABLES ====================

let engine = null
let world = null
let ctx = null
let animFrameId = null

// ==================== GAME STATE VARIABLES ====================

let kids = []
let fieldPowerups = [] // powerups on the playing field
let particles = []
let clickRipples = []
let frameCount = 0
let timeRemaining = GAME_DURATION
let kidsHerded = 0
let chaosScore = 0
let totalPushes = 0
let spawnTimer = 0
let powerupSpawnTimer = 0
let nextPowerupSpawn = 0
let activePowerupState = null // { type, timer, maxTimer, x?, y? }
let doorFlash = 0
let doorTop = 0
let doorBottom = 0

// ==================== PARTICLE SYSTEM ====================

function addParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 1.5 + Math.random() * 2.5
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 25 + Math.random() * 15,
      maxLife: 40,
      size: 2.5 + Math.random() * 3
    })
  }
}

function addClickRipple(x, y) {
  clickRipples.push({ x, y, radius: 8, maxRadius: 35 })
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.95
    p.vy *= 0.95
    p.life--
  }
  particles = particles.filter(p => p.life > 0)

  for (const r of clickRipples) {
    r.radius += 2.5
  }
  clickRipples = clickRipples.filter(r => r.radius < r.maxRadius)
}

// ==================== MATTER.JS SETUP ====================

function initMatter() {
  engine = Engine.create()
  world = engine.world
  world.gravity.x = 0
  world.gravity.y = 0 // top-down view

  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const wallThick = 60

  doorTop = ch / 2 - DOOR_HEIGHT / 2
  doorBottom = ch / 2 + DOOR_HEIGHT / 2

  const wallOpts = { isStatic: true, restitution: 0.6, friction: 0.1 }

  const walls = [
    // Top wall
    Bodies.rectangle(cw / 2, -wallThick / 2, cw + 200, wallThick, wallOpts),
    // Bottom wall
    Bodies.rectangle(cw / 2, ch + wallThick / 2, cw + 200, wallThick, wallOpts),
    // Left wall
    Bodies.rectangle(-wallThick / 2, ch / 2, wallThick, ch + 200, wallOpts)
  ]

  // Right wall: two segments with a door gap
  const upperH = doorTop
  const lowerH = ch - doorBottom

  if (upperH > 0) {
    walls.push(Bodies.rectangle(cw + wallThick / 2, upperH / 2, wallThick, upperH + 10, wallOpts))
  }
  if (lowerH > 0) {
    walls.push(Bodies.rectangle(cw + wallThick / 2, doorBottom + lowerH / 2, wallThick, lowerH + 10, wallOpts))
  }

  World.add(world, walls)
}

function cleanupMatter() {
  if (engine) {
    World.clear(world, false)
    Engine.clear(engine)
    engine = null
    world = null
  }
}

// ==================== KID SPAWNING ====================

function getRandomKidType() {
  const roll = Math.random()
  if (roll < 0.60) return 'normal'
  if (roll < 0.75) return 'phone'
  if (roll < 0.88) return 'sleepy'
  return 'runner'
}

function spawnKid(forceType = null) {
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const typeKey = forceType || getRandomKidType()
  const typeData = KID_TYPES[typeKey]

  const x = 40 + Math.random() * (cw * 0.55)
  const y = 40 + Math.random() * (ch - 80)

  const body = Bodies.circle(x, y, KID_RADIUS, {
    restitution: typeData.restitution,
    friction: 0.05,
    frictionAir: typeData.frictionAir,
    density: typeData.density
  })

  // Random initial velocity
  const angle = Math.random() * Math.PI * 2
  const speed = typeData.speed * (0.5 + Math.random() * 0.5)
  Body.setVelocity(body, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  })

  World.add(world, body)

  const kid = {
    type: typeKey,
    typeData,
    body,
    herded: false,
    removed: false,
    aiTimer: 60 + Math.random() * 120,
    sleeping: false,
    pushCount: 0
  }

  kids.push(kid)
  return kid
}

function spawnInitialKids() {
  // Spawn initial batch: mostly normal, a couple bosses
  for (let i = 0; i < INITIAL_KID_COUNT - 2; i++) {
    spawnKid('normal')
  }
  spawnKid('phone')
  spawnKid('runner')
}

function spawnWave() {
  const aliveCount = kids.filter(k => !k.herded && !k.removed).length
  if (aliveCount >= MAX_KIDS) return

  const count = SPAWN_COUNT_MIN + Math.floor(Math.random() * (SPAWN_COUNT_MAX - SPAWN_COUNT_MIN + 1))
  // As time passes, more boss kids
  const elapsedRatio = 1 - (timeRemaining / GAME_DURATION)

  for (let i = 0; i < count; i++) {
    if (kids.filter(k => !k.herded && !k.removed).length >= MAX_KIDS) break
    // Increase boss chance over time
    if (elapsedRatio > 0.5 && Math.random() < 0.4) {
      const bosses = ['phone', 'sleepy', 'runner']
      spawnKid(bosses[Math.floor(Math.random() * bosses.length)])
    } else {
      spawnKid()
    }
  }
}

// ==================== KID AI ====================

function updateKidAI(kid) {
  if (kid.herded || kid.removed) return
  if (activePowerupState && activePowerupState.type === 'sleepy') return // frozen

  kid.aiTimer--

  const cw = canvasWidth.value
  const ch = canvasHeight.value

  if (kid.type === 'normal') {
    if (kid.aiTimer <= 0) {
      const speed = kid.typeData.speed * (0.6 + Math.random() * 0.4)
      const angle = Math.random() * Math.PI * 2
      Body.setVelocity(kid.body, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      })
      kid.aiTimer = 120 + Math.random() * 150
    }
  } else if (kid.type === 'phone') {
    if (kid.aiTimer <= 0) {
      // Phone kid barely moves
      const speed = kid.typeData.speed * (0.3 + Math.random() * 0.7)
      const angle = Math.random() * Math.PI * 2
      Body.setVelocity(kid.body, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      })
      kid.aiTimer = 200 + Math.random() * 200
    }
  } else if (kid.type === 'sleepy') {
    if (kid.aiTimer <= 0) {
      kid.sleeping = !kid.sleeping
      if (kid.sleeping) {
        Body.setVelocity(kid.body, { x: 0, y: 0 })
        kid.aiTimer = 180 + Math.random() * 120 // sleep 3-5s
      } else {
        const speed = kid.typeData.speed * (0.5 + Math.random() * 0.5)
        const angle = Math.random() * Math.PI * 2
        Body.setVelocity(kid.body, {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        })
        kid.aiTimer = 120 + Math.random() * 120 // move 2-4s
      }
    }
    // Dampen velocity when sleeping
    if (kid.sleeping) {
      const v = kid.body.velocity
      if (Math.abs(v.x) > 0.3 || Math.abs(v.y) > 0.3) {
        Body.setVelocity(kid.body, { x: v.x * 0.96, y: v.y * 0.96 })
      }
    }
  } else if (kid.type === 'runner') {
    if (kid.aiTimer <= 0) {
      const speed = kid.typeData.speed * (0.7 + Math.random() * 0.3)
      const angle = Math.random() * Math.PI * 2
      Body.setVelocity(kid.body, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      })
      kid.aiTimer = 50 + Math.random() * 80 // change direction often
    }
  }

  // Candy bait attraction
  if (activePowerupState && activePowerupState.type === 'candy') {
    const pos = kid.body.position
    const dx = activePowerupState.x - pos.x
    const dy = activePowerupState.y - pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 5 && dist < 350) {
      const strength = 0.0003 * (1 - dist / 350)
      Body.applyForce(kid.body, kid.body.position, {
        x: (dx / dist) * strength,
        y: (dy / dist) * strength
      })
    }
  }

  // Keep kids from going too far off screen
  const pos = kid.body.position
  const margin = 30
  if (pos.x < margin) Body.applyForce(kid.body, pos, { x: 0.0005, y: 0 })
  if (pos.x > cw - margin) Body.applyForce(kid.body, pos, { x: -0.0003, y: 0 })
  if (pos.y < margin) Body.applyForce(kid.body, pos, { x: 0, y: 0.0005 })
  if (pos.y > ch - margin) Body.applyForce(kid.body, pos, { x: 0, y: -0.0005 })
}

// ==================== POWER-UP SYSTEM ====================

function spawnFieldPowerup() {
  if (fieldPowerups.length > 0) return // only 1 at a time

  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const types = Object.keys(POWERUP_TYPES)
  const type = types[Math.floor(Math.random() * types.length)]

  fieldPowerups.push({
    type,
    x: 60 + Math.random() * (cw * 0.5),
    y: 50 + Math.random() * (ch - 100),
    pulse: 0
  })
}

function activatePowerup(type, x, y) {
  if (type === 'megaphone') {
    // Instantly herd up to 5 nearest kids to door
    const alive = kids.filter(k => !k.herded && !k.removed)
    alive.sort((a, b) => {
      const aDist = canvasWidth.value - a.body.position.x
      const bDist = canvasWidth.value - b.body.position.x
      return aDist - bDist
    })
    const toHerd = alive.slice(0, Math.min(5, alive.length))
    for (const kid of toHerd) {
      kid.herded = true
      kidsHerded++
      addParticles(kid.body.position.x, kid.body.position.y, '#66bb6a', 8)
      Composite.remove(world, kid.body)
    }
    doorFlash = 15
    // Brief screen flash
    addParticles(canvasWidth.value - 40, canvasHeight.value / 2, '#66bb6a', 15)
  } else if (type === 'candy') {
    activePowerupState = { type: 'candy', timer: 300, maxTimer: 300, x, y } // 5 seconds
  } else if (type === 'sleepy') {
    // Freeze all kids
    const alive = kids.filter(k => !k.herded && !k.removed)
    for (const kid of alive) {
      Body.setVelocity(kid.body, { x: 0, y: 0 })
    }
    activePowerupState = { type: 'sleepy', timer: 180, maxTimer: 180 } // 3 seconds
  }
}

function updatePowerups() {
  // Field powerup pulse animation
  for (const p of fieldPowerups) {
    p.pulse = (p.pulse + 1) % 120
  }

  // Spawn timer
  powerupSpawnTimer++
  if (powerupSpawnTimer >= nextPowerupSpawn && fieldPowerups.length === 0 && !activePowerupState) {
    spawnFieldPowerup()
    powerupSpawnTimer = 0
    nextPowerupSpawn = POWERUP_SPAWN_MIN + Math.random() * (POWERUP_SPAWN_MAX - POWERUP_SPAWN_MIN)
  }

  // Active powerup effect timer
  if (activePowerupState) {
    activePowerupState.timer--
    if (activePowerupState.timer <= 0) {
      activePowerupState = null
    }
  }
}

// ==================== INPUT HANDLING ====================

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

function handleGameClick(clickX, clickY) {
  if (gameState.value !== 'playing') return

  // 1. Check field powerups first
  for (let i = fieldPowerups.length - 1; i >= 0; i--) {
    const p = fieldPowerups[i]
    const dx = p.x - clickX
    const dy = p.y - clickY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < POWERUP_RADIUS + 12) {
      addParticles(p.x, p.y, POWERUP_TYPES[p.type].color, 12)
      activatePowerup(p.type, p.x, p.y)
      fieldPowerups.splice(i, 1)
      return
    }
  }

  // 2. Check kids
  for (const kid of kids) {
    if (kid.herded || kid.removed) continue
    const pos = kid.body.position
    const dx = pos.x - clickX
    const dy = pos.y - clickY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < KID_RADIUS + 10) {
      pushKid(kid)
      addClickRipple(pos.x, pos.y)
      return
    }
  }

  // 3. Clicked empty space
  addClickRipple(clickX, clickY)
}

function pushKid(kid) {
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const pos = kid.body.position

  // Direction toward door center
  const doorCenterX = cw
  const doorCenterY = ch / 2
  const dx = doorCenterX - pos.x
  const dy = doorCenterY - pos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 1) return

  let pushForce = kid.typeData.pushForce

  // Runner: sometimes dodges
  if (kid.type === 'runner' && Math.random() < 0.35) {
    const dodgeAngle = Math.random() * Math.PI * 2
    const dodgeForce = 4
    Body.setVelocity(kid.body, {
      x: kid.body.velocity.x + Math.cos(dodgeAngle) * dodgeForce,
      y: kid.body.velocity.y + Math.sin(dodgeAngle) * dodgeForce
    })
    chaosScore += 8
    totalPushes++
    kid.pushCount++
    return
  }

  // Sleepy when sleeping: reduced push
  if (kid.type === 'sleepy' && kid.sleeping) {
    pushForce *= 0.6
  }

  // Phone kid: extra resistance
  if (kid.type === 'phone') {
    pushForce *= 0.7
  }

  // Apply velocity toward door
  Body.setVelocity(kid.body, {
    x: kid.body.velocity.x + (dx / dist) * pushForce,
    y: kid.body.velocity.y + (dy / dist) * pushForce
  })

  chaosScore += 5
  totalPushes++
  kid.pushCount++
}

function handleCanvasClick(event) {
  const coords = getCanvasCoords(event.clientX, event.clientY)
  handleGameClick(coords.x, coords.y)
}

function handleTouchStart(event) {
  if (event.touches.length > 0) {
    const touch = event.touches[0]
    const coords = getCanvasCoords(touch.clientX, touch.clientY)
    handleGameClick(coords.x, coords.y)
  }
}

// ==================== GAME LOGIC (UPDATE) ====================

function update() {
  if (gameState.value !== 'playing') return

  frameCount++

  // Update Matter.js physics
  Engine.update(engine, 1000 / 60)

  // Update kid AI
  for (const kid of kids) {
    updateKidAI(kid)
  }

  // Check door herding
  const cw = canvasWidth.value
  for (const kid of kids) {
    if (kid.herded || kid.removed) continue
    const pos = kid.body.position
    // Kid passed through door opening
    if (pos.x > cw - 5 && pos.y > doorTop - KID_RADIUS && pos.y < doorBottom + KID_RADIUS) {
      kid.herded = true
      kidsHerded++
      doorFlash = 10
      addParticles(cw - 20, pos.y, '#66bb6a', 10)
      Composite.remove(world, kid.body)
    }
    // Kid went way off screen (glitch safety)
    if (pos.x < -80 || pos.x > cw + 100 || pos.y < -80 || pos.y > canvasHeight.value + 80) {
      kid.removed = true
      Composite.remove(world, kid.body)
    }
  }

  // Spawn waves
  spawnTimer++
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer = 0
    spawnWave()
  }

  // Update powerups
  updatePowerups()

  // Update particles
  updateParticles()

  // Update door flash
  if (doorFlash > 0) doorFlash -= 0.5

  // Update timer
  timeRemaining -= 1 / 60
  if (timeRemaining <= 0) {
    timeRemaining = 0
    endGame()
  }
}

// ==================== DRAWING FUNCTIONS ====================

function drawFloor() {
  const cw = canvasWidth.value
  const ch = canvasHeight.value

  // Base floor
  const grad = ctx.createLinearGradient(0, 0, 0, ch)
  grad.addColorStop(0, '#1c1d22')
  grad.addColorStop(1, '#202128')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, cw, ch)

  // Tile grid
  ctx.strokeStyle = 'rgba(58, 59, 62, 0.12)'
  ctx.lineWidth = 1
  const tileSize = 60
  for (let x = 0; x < cw; x += tileSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, ch)
    ctx.stroke()
  }
  for (let y = 0; y < ch; y += tileSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(cw, y)
    ctx.stroke()
  }
}

function drawWalls() {
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const wallSize = 10

  ctx.fillStyle = '#2c2d33'

  // Top wall
  ctx.fillRect(0, 0, cw, wallSize)
  // Bottom wall
  ctx.fillRect(0, ch - wallSize, cw, wallSize)
  // Left wall
  ctx.fillRect(0, 0, wallSize, ch)

  // Right wall upper segment
  ctx.fillRect(cw - wallSize, 0, wallSize, doorTop)
  // Right wall lower segment
  ctx.fillRect(cw - wallSize, doorBottom, wallSize, ch - doorBottom)

  // Wall inner edge highlight
  ctx.strokeStyle = 'rgba(58, 59, 62, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(wallSize, wallSize)
  ctx.lineTo(cw - wallSize, wallSize)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(wallSize, ch - wallSize)
  ctx.lineTo(cw - wallSize, ch - wallSize)
  ctx.stroke()
}

function drawDoor() {
  const cw = canvasWidth.value
  const doorWidth = 60
  const doorX = cw - doorWidth

  // Door glow
  const glowIntensity = 0.08 + Math.sin(frameCount * 0.03) * 0.03
  const doorGrad = ctx.createLinearGradient(doorX - 40, 0, cw, 0)
  doorGrad.addColorStop(0, 'rgba(102, 187, 106, 0)')
  doorGrad.addColorStop(0.4, `rgba(102, 187, 106, ${glowIntensity * 0.5})`)
  doorGrad.addColorStop(1, `rgba(102, 187, 106, ${glowIntensity})`)
  ctx.fillStyle = doorGrad
  ctx.fillRect(doorX - 40, doorTop, doorWidth + 40, DOOR_HEIGHT)

  // Door flash when kid enters
  if (doorFlash > 0) {
    ctx.fillStyle = `rgba(102, 187, 106, ${doorFlash * 0.04})`
    ctx.fillRect(doorX - 60, doorTop - 20, doorWidth + 80, DOOR_HEIGHT + 40)
  }

  // Door frame lines
  ctx.strokeStyle = '#66bb6a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(doorX, doorTop)
  ctx.lineTo(cw, doorTop)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(doorX, doorBottom)
  ctx.lineTo(cw, doorBottom)
  ctx.stroke()
  // Vertical edge
  ctx.beginPath()
  ctx.moveTo(doorX, doorTop)
  ctx.lineTo(doorX, doorBottom)
  ctx.stroke()

  // Door label
  ctx.fillStyle = 'rgba(102, 187, 106, 0.5)'
  ctx.font = '11px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ห้องเรียน', doorX + doorWidth / 2, canvasHeight.value / 2 - 10)
  ctx.font = '18px sans-serif'
  ctx.fillText('🚪', doorX + doorWidth / 2, canvasHeight.value / 2 + 12)

  // Arrow indicators pointing to door
  ctx.fillStyle = 'rgba(102, 187, 106, 0.25)'
  const arrowX = doorX - 25
  const arrowY = canvasHeight.value / 2
  for (let i = 0; i < 3; i++) {
    const offset = i * 15
    const alpha = 0.15 + Math.sin(frameCount * 0.05 + i * 0.8) * 0.1
    ctx.fillStyle = `rgba(102, 187, 106, ${alpha})`
    ctx.beginPath()
    ctx.moveTo(arrowX - offset, arrowY - 8)
    ctx.lineTo(arrowX - offset + 10, arrowY)
    ctx.lineTo(arrowX - offset, arrowY + 8)
    ctx.closePath()
    ctx.fill()
  }
}

function drawKids() {
  for (const kid of kids) {
    if (kid.herded || kid.removed) continue
    const pos = kid.body.position
    const r = KID_RADIUS

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(pos.x + 2, pos.y + 4, r - 3, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Kid body circle
    ctx.fillStyle = kid.typeData.color
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.fill()

    // Border
    ctx.strokeStyle = kid.typeData.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.stroke()

    // Emoji icon
    ctx.font = '15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(kid.typeData.emoji, pos.x, pos.y + 1)

    // Sleeping zzz indicator
    if (kid.type === 'sleepy' && kid.sleeping) {
      const zFloat = Math.sin(frameCount * 0.08) * 3
      ctx.font = '11px sans-serif'
      ctx.fillText('💤', pos.x + r + 4, pos.y - r - 2 + zFloat)
    }

    // Boss star indicator
    if (kid.typeData.boss) {
      ctx.fillStyle = kid.typeData.color
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('★', pos.x, pos.y - r - 5)
    }

    // Frozen indicator (sleepy spray active)
    if (activePowerupState && activePowerupState.type === 'sleepy') {
      ctx.strokeStyle = 'rgba(171, 71, 188, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

function drawFieldPowerups() {
  for (const p of fieldPowerups) {
    const typeData = POWERUP_TYPES[p.type]
    const pulse = Math.sin(p.pulse * 0.1) * 4

    // Outer glow
    const glowAlpha = 0.1 + Math.sin(p.pulse * 0.08) * 0.05
    ctx.globalAlpha = glowAlpha
    ctx.fillStyle = typeData.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, POWERUP_RADIUS + 14 + pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Inner glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, POWERUP_RADIUS + 6 + pulse * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Circle
    ctx.fillStyle = typeData.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, POWERUP_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, POWERUP_RADIUS, 0, Math.PI * 2)
    ctx.stroke()

    // Emoji
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typeData.emoji, p.x, p.y + 1)
  }
}

function drawCandyBait() {
  if (!activePowerupState || activePowerupState.type !== 'candy') return
  const { x, y, timer, maxTimer } = activePowerupState
  const pulse = Math.sin(timer * 0.15) * 5

  // Attraction ring
  const ringAlpha = 0.08 + Math.sin(timer * 0.1) * 0.04
  ctx.strokeStyle = `rgba(255, 183, 77, ${ringAlpha})`
  ctx.lineWidth = 2
  const ringRadius = 50 + pulse + (1 - timer / maxTimer) * 40
  ctx.beginPath()
  ctx.arc(x, y, ringRadius, 0, Math.PI * 2)
  ctx.stroke()

  // Glow
  ctx.fillStyle = `rgba(255, 183, 77, 0.08)`
  ctx.beginPath()
  ctx.arc(x, y, 35 + pulse, 0, Math.PI * 2)
  ctx.fill()

  // Candy icon
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🍭', x, y)

  // Timer ring
  const progress = timer / maxTimer
  ctx.strokeStyle = 'rgba(255, 183, 77, 0.4)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
  ctx.stroke()
}

function drawSleepyOverlay() {
  if (!activePowerupState || activePowerupState.type !== 'sleepy') return
  ctx.fillStyle = 'rgba(171, 71, 188, 0.06)'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
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

function drawClickRipples() {
  for (const r of clickRipples) {
    const alpha = 1 - (r.radius / r.maxRadius)
    ctx.globalAlpha = alpha * 0.4
    ctx.strokeStyle = '#ec407a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawTimer() {
  const cw = canvasWidth.value
  const barWidth = 200
  const barHeight = 8
  const x = (cw - barWidth) / 2
  const y = 26

  const progress = Math.max(0, timeRemaining / GAME_DURATION)

  // Background
  ctx.fillStyle = 'rgba(58, 59, 62, 0.4)'
  ctx.beginPath()
  ctx.roundRect(x, y, barWidth, barHeight, 4)
  ctx.fill()

  // Fill color
  let color = '#66bb6a'
  if (progress < 0.2) color = '#ef5350'
  else if (progress < 0.5) color = '#ffb74d'

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, barWidth * progress, barHeight, 4)
  ctx.fill()

  // Time text
  ctx.fillStyle = '#e0e1e4'
  ctx.font = 'bold 13px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  const seconds = Math.ceil(timeRemaining)
  ctx.fillText(seconds + 's', cw / 2, y - 4)
}

function drawHerdedCounter() {
  const aliveCount = kids.filter(k => !k.herded && !k.removed).length
  ctx.fillStyle = '#e0e1e4'
  ctx.font = 'bold 14px "Segoe UI", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`🧒 ${kidsHerded} เข้าห้อง`, 18, 14)

  ctx.fillStyle = '#6b6c6f'
  ctx.font = '11px "Segoe UI", sans-serif'
  ctx.fillText(`เหลือ ${aliveCount} คน`, 18, 34)
}

function drawChaosMeter() {
  const cw = canvasWidth.value
  const multiplier = (1 + chaosScore / 500).toFixed(1)
  ctx.fillStyle = '#ec407a'
  ctx.font = 'bold 12px "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(`Chaos x${multiplier}`, cw - 18, 14)

  // Small chaos bar
  const barW = 60
  const barH = 4
  const barX = cw - 18 - barW
  const barY = 30
  const progress = Math.min(1, chaosScore / 500)

  ctx.fillStyle = 'rgba(58, 59, 62, 0.3)'
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW, barH, 2)
  ctx.fill()

  const chaosGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
  chaosGrad.addColorStop(0, '#ec407a')
  chaosGrad.addColorStop(1, '#ff7043')
  ctx.fillStyle = chaosGrad
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW * progress, barH, 2)
  ctx.fill()
}

function drawActivePowerupIndicator() {
  if (!activePowerupState) return
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  const { type, timer, maxTimer } = activePowerupState
  const progress = timer / maxTimer

  const typeData = POWERUP_TYPES[type]
  const x = cw / 2
  const y = ch - 30

  // Background pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.roundRect(x - 70, y - 13, 140, 26, 13)
  ctx.fill()

  // Icon + text
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(typeData.emoji, x - 48, y)

  ctx.fillStyle = '#e0e1e4'
  ctx.font = '11px "Segoe UI", sans-serif'
  ctx.fillText(typeData.label, x + 5, y - 1)

  // Progress bar
  ctx.fillStyle = 'rgba(58, 59, 62, 0.4)'
  ctx.beginPath()
  ctx.roundRect(x - 40, y + 8, 80, 3, 1.5)
  ctx.fill()
  ctx.fillStyle = typeData.color
  ctx.beginPath()
  ctx.roundRect(x - 40, y + 8, 80 * progress, 3, 1.5)
  ctx.fill()
}

// ==================== RENDER ====================

function render() {
  if (!ctx) return

  drawFloor()
  drawDoor()
  drawWalls()
  drawCandyBait()
  drawKids()
  drawFieldPowerups()
  drawParticles()
  drawClickRipples()
  drawSleepyOverlay()

  // UI
  if (gameState.value === 'playing') {
    drawTimer()
    drawHerdedCounter()
    drawChaosMeter()
    drawActivePowerupIndicator()
  }
}

// ==================== GAME LOOP ====================

function gameLoop() {
  if (gameState.value !== 'playing') return

  update()
  render()

  animFrameId = requestAnimationFrame(gameLoop)
}

// ==================== GAME STATE MANAGEMENT ====================

function calculateFinalScore() {
  const baseScore = kidsHerded * 100
  const timeBonus = Math.max(0, Math.floor(timeRemaining * 10))
  const chaosMultiplier = Math.round((1 + chaosScore / 500) * 100) / 100
  const total = Math.floor((baseScore + timeBonus) * chaosMultiplier)
  return { total, baseScore, timeBonus, chaosMultiplier }
}

function resetGame() {
  // Remove all kid bodies from world
  for (const kid of kids) {
    if (!kid.herded && !kid.removed) {
      try { Composite.remove(world, kid.body) } catch (e) { /* ignore */ }
    }
  }

  kids = []
  fieldPowerups = []
  particles = []
  clickRipples = []
  frameCount = 0
  timeRemaining = GAME_DURATION
  kidsHerded = 0
  chaosScore = 0
  totalPushes = 0
  spawnTimer = 0
  powerupSpawnTimer = 0
  nextPowerupSpawn = POWERUP_SPAWN_MIN + Math.random() * (POWERUP_SPAWN_MAX - POWERUP_SPAWN_MIN)
  activePowerupState = null
  doorFlash = 0
  isNewBest.value = false
}

function startGame() {
  // Reinitialize Matter.js for fresh world
  cleanupMatter()
  initMatter()

  resetGame()
  spawnInitialKids()

  gameState.value = 'playing'
  animFrameId = requestAnimationFrame(gameLoop)
}

async function endGame() {
  gameState.value = 'gameover'

  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  // Final render
  render()

  const { total, baseScore, timeBonus, chaosMultiplier } = calculateFinalScore()
  displayScore.value = total
  displayKidsHerded.value = kidsHerded
  displayTimeBonus.value = timeBonus
  displayChaosMultiplier.value = chaosMultiplier.toFixed(2)

  // Check new personal best
  if (!gameStore.personalBest || total > gameStore.personalBest.score) {
    isNewBest.value = true
  }

  // Submit score
  if (total > 0) {
    await gameStore.submitScore(GAME_ID, total)
  }

  // Refresh leaderboard
  await Promise.all([
    gameStore.fetchLeaderboard(GAME_ID, 10),
    gameStore.fetchRecentScores(GAME_ID, 5)
  ])
}

// ==================== CANVAS SETUP ====================

function initCanvas() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return

  canvasWidth.value = DESIGN_WIDTH
  canvasHeight.value = DESIGN_HEIGHT
  updateCanvasScale()

  nextTick(() => {
    const canvas = gameCanvas.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    renderIdleScreen()
  })
}

function updateCanvasScale() {
  const wrapper = canvasWrapper.value
  if (!wrapper) return
  const wrapperWidth = wrapper.clientWidth - 4
  canvasScale.value = Math.min(1, wrapperWidth / DESIGN_WIDTH)
}

function renderIdleScreen() {
  if (!ctx) return

  // Temp init matter for wall positioning calculations
  const cw = canvasWidth.value
  const ch = canvasHeight.value
  doorTop = ch / 2 - DOOR_HEIGHT / 2
  doorBottom = ch / 2 + DOOR_HEIGHT / 2
  frameCount = 0

  // Draw static scene
  drawFloor()

  // Draw door
  drawDoor()
  drawWalls()

  // Draw a few static "preview" kids
  const previewKids = [
    { x: cw * 0.2, y: ch * 0.3, typeData: KID_TYPES.normal },
    { x: cw * 0.35, y: ch * 0.6, typeData: KID_TYPES.phone },
    { x: cw * 0.15, y: ch * 0.7, typeData: KID_TYPES.runner },
    { x: cw * 0.45, y: ch * 0.4, typeData: KID_TYPES.normal },
    { x: cw * 0.28, y: ch * 0.5, typeData: KID_TYPES.sleepy },
    { x: cw * 0.5, y: ch * 0.65, typeData: KID_TYPES.normal }
  ]

  for (const pk of previewKids) {
    const r = KID_RADIUS
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(pk.x + 2, pk.y + 3, r - 3, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    // Circle
    ctx.fillStyle = pk.typeData.color
    ctx.beginPath()
    ctx.arc(pk.x, pk.y, r, 0, Math.PI * 2)
    ctx.fill()
    // Border
    ctx.strokeStyle = pk.typeData.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(pk.x, pk.y, r, 0, Math.PI * 2)
    ctx.stroke()
    // Emoji
    ctx.font = '15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(pk.typeData.emoji, pk.x, pk.y + 1)
  }
}

function handleResize() {
  updateCanvasScale()
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  initCanvas()

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
    animFrameId = null
  }
  cleanupMatter()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.herd-page {
  padding: 24px;
  min-height: 100vh;
}

.herd-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ====== Game Area ====== */
.herd-game-area {
  flex: 1;
  min-width: 0;
}

.herd-game-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.herd-back-btn {
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

.herd-back-btn:hover {
  background: rgba(58, 59, 62, 0.5);
  color: #e0e1e4;
}

.herd-game-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0e1e4;
}

.herd-game-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  font-weight: 500;
}

.herd-personal-best {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ec407a;
  background: rgba(236, 64, 122, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
}

/* ====== Canvas ====== */
.herd-canvas-wrapper {
  position: relative;
  background: #1a1b1f;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.herd-canvas-wrapper canvas {
  display: block;
  cursor: pointer;
}

/* ====== Overlays ====== */
.herd-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 27, 31, 0.85);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.herd-overlay-content {
  text-align: center;
}

.herd-overlay-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.herd-overlay-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #e0e1e4;
  letter-spacing: -0.02em;
}

.herd-overlay-sub {
  font-size: 0.78rem;
  color: #ec407a;
  margin-top: 2px;
  font-weight: 600;
}

.herd-overlay-desc {
  font-size: 0.75rem;
  color: #9e9fa3;
  margin-top: 10px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.herd-overlay-hint {
  margin-top: 16px;
  font-size: 0.78rem;
  color: #9e9fa3;
}

.herd-key {
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

.herd-overlay-controls {
  margin-top: 14px;
  display: flex;
  gap: 18px;
  justify-content: center;
}

.herd-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 32px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ec407a, #f06292);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
  box-shadow: 0 4px 18px rgba(236, 64, 122, 0.35);
  letter-spacing: 0.01em;
}

.herd-play-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 24px rgba(236, 64, 122, 0.45);
  filter: brightness(1.08);
}

.herd-play-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(236, 64, 122, 0.3);
}

.herd-control-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #6b6c6f;
}

/* Game Over */
.herd-gameover-breakdown {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(58, 59, 62, 0.15);
  border-radius: 10px;
}

.herd-breakdown-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 0.75rem;
}

.herd-breakdown-label {
  color: #9e9fa3;
}

.herd-breakdown-value {
  color: #e0e1e4;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.herd-gameover-score {
  margin-top: 12px;
}

.herd-score-label {
  font-size: 0.72rem;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.herd-score-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ec407a;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.herd-new-best {
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #66bb6a;
}

/* ====== Bottom Panels ====== */
.herd-bottom-panels {
  display: flex;
  gap: 16px;
}

.herd-panel-stats {
  width: 260px;
  min-width: 260px;
}

.herd-panel-leaderboard {
  flex: 1;
  min-width: 0;
}

.herd-leaderboard-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px;
}

.herd-panel-card {
  background: #23242a;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.herd-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e1e4;
  margin-bottom: 14px;
}

.herd-panel-loading {
  text-align: center;
  padding: 20px 0;
  color: #6b6c6f;
}

.herd-panel-empty {
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
.herd-lb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.herd-lb-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.herd-lb-me {
  background: rgba(236, 64, 122, 0.08);
  border: 1px solid rgba(236, 64, 122, 0.12);
}

.herd-lb-rank {
  width: 26px;
  text-align: center;
  font-size: 0.82rem;
}

.herd-lb-rank-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6c6f;
}

.herd-lb-avatar {
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

.herd-lb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.herd-lb-info {
  flex: 1;
  min-width: 0;
}

.herd-lb-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e0e1e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.herd-lb-score {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ec407a;
  font-variant-numeric: tabular-nums;
}

/* ====== Stats Grid ====== */
.herd-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.herd-stat {
  text-align: center;
  padding: 10px 4px;
  background: rgba(58, 59, 62, 0.15);
  border-radius: 10px;
}

.herd-stat-value {
  font-size: 1rem;
  font-weight: 800;
  color: #e0e1e4;
  font-variant-numeric: tabular-nums;
}

.herd-stat-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .herd-page {
    padding: 12px;
  }

  .herd-bottom-panels {
    flex-direction: column;
  }

  .herd-panel-stats {
    width: 100%;
    min-width: 0;
  }

  .herd-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .herd-game-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .herd-personal-best {
    margin-left: 0;
  }

  .herd-leaderboard-list {
    grid-template-columns: 1fr;
  }
}
</style>
