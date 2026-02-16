import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Runner } = Matter

const NEON_GOLD = ['#FFD700', '#FFC107', '#FFAB00', '#FFE082', '#FFF176']
const NEON_RED = ['#EF5350', '#FF5722', '#FF7043', '#E53935', '#D32F2F']
const CONFETTI_COLORS = ['#7C4DFF', '#FFD740', '#FF4081', '#00E5FF', '#76FF03', '#FF6E40', '#E040FB', '#64FFDA']

/**
 * Creates a particle-burst FX engine bound to a <canvas> ref.
 * Used for score particles (correct/wrong) and confetti rain.
 */
export function usePhysicsFX() {
  let engine = null
  let runner = null
  let animId = null
  let canvas = null
  let ctx = null
  const particles = []

  function init(canvasEl) {
    if (!canvasEl) return
    canvas = canvasEl
    ctx = canvas.getContext('2d')

    engine = Engine.create({ gravity: { x: 0, y: 0.6 } })
    runner = Runner.create()
    Runner.run(runner, engine)

    loop()
  }

  function resize(w, h) {
    if (!canvas) return
    canvas.width = w
    canvas.height = h
  }

  function spawnBurst(x, y, { count = 12, palette = NEON_GOLD, direction = 'up', lifetime = 1500 } = {}) {
    if (!engine) return

    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 4
      const color = palette[Math.floor(Math.random() * palette.length)]
      const angle = direction === 'up'
        ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8
        : Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6
      const speed = 3 + Math.random() * 5

      const body = Bodies.circle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 10, r, {
        restitution: 0.4,
        friction: 0.01,
        frictionAir: direction === 'up' ? 0.03 : 0.01,
        collisionFilter: { group: -1 },
        render: { visible: false },
      })

      Body.setVelocity(body, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      })

      World.add(engine.world, body)

      const particle = {
        body,
        color,
        radius: r,
        born: Date.now(),
        lifetime,
        glow: direction === 'up',
      }
      particles.push(particle)
    }
  }

  function spawnCorrect(x, y) {
    if (!engine) return
    const prevGravity = { ...engine.gravity }
    engine.gravity.y = -0.3
    spawnBurst(x, y, { count: 14, palette: NEON_GOLD, direction: 'up', lifetime: 1400 })
    setTimeout(() => {
      if (engine) {
        engine.gravity.x = prevGravity.x
        engine.gravity.y = prevGravity.y
      }
    }, 200)
  }

  function spawnWrong(x, y) {
    spawnBurst(x, y, { count: 10, palette: NEON_RED, direction: 'down', lifetime: 1200 })
  }

  function spawnConfetti(canvasWidth, canvasHeight, { count = 70, palette = CONFETTI_COLORS } = {}) {
    if (!engine) return
    engine.gravity.y = 0.5

    const floorBody = Bodies.rectangle(canvasWidth / 2, canvasHeight + 20, canvasWidth * 2, 40, {
      isStatic: true,
      collisionFilter: { group: 1 },
    })
    World.add(engine.world, floorBody)

    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 2000
      setTimeout(() => {
        if (!engine) return
        const x = Math.random() * canvasWidth
        const y = -20 - Math.random() * 100
        const size = 4 + Math.random() * 6
        const color = palette[Math.floor(Math.random() * palette.length)]
        const isRect = Math.random() > 0.5

        const body = isRect
          ? Bodies.rectangle(x, y, size * 2, size, {
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.02 + Math.random() * 0.02,
            angle: Math.random() * Math.PI * 2,
            collisionFilter: { group: 1 },
          })
          : Bodies.circle(x, y, size / 2, {
            restitution: 0.5,
            friction: 0.1,
            frictionAir: 0.02 + Math.random() * 0.02,
            collisionFilter: { group: 1 },
          })

        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 3,
          y: 1 + Math.random() * 2,
        })
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2)

        World.add(engine.world, body)
        particles.push({
          body,
          color,
          radius: size / 2,
          isRect,
          rectW: size * 2,
          rectH: size,
          born: Date.now(),
          lifetime: 8000,
          glow: false,
        })
      }, delay)
    }
  }

  function loop() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const now = Date.now()

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      const age = now - p.born
      if (age > p.lifetime) {
        World.remove(engine.world, p.body)
        particles.splice(i, 1)
        continue
      }

      const alpha = Math.max(0, 1 - age / p.lifetime)
      const pos = p.body.position
      const angle = p.body.angle

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(pos.x, pos.y)
      ctx.rotate(angle)

      if (p.glow) {
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
      }

      ctx.fillStyle = p.color

      if (p.isRect) {
        ctx.fillRect(-p.rectW / 2, -p.rectH / 2, p.rectW, p.rectH)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    animId = requestAnimationFrame(loop)
  }

  function cleanup() {
    if (animId) {
      cancelAnimationFrame(animId)
      animId = null
    }
    if (runner && engine) {
      Runner.stop(runner)
    }
    if (engine) {
      World.clear(engine.world, false)
      Engine.clear(engine)
      engine = null
    }
    runner = null
    particles.length = 0
    canvas = null
    ctx = null
  }

  return {
    init,
    resize,
    spawnBurst,
    spawnCorrect,
    spawnWrong,
    spawnConfetti,
    cleanup,
    CONFETTI_COLORS,
    NEON_GOLD,
    NEON_RED,
  }
}
