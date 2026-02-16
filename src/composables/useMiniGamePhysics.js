import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Runner } = Matter

const BALL_COLORS = [
  '#7C4DFF', '#E040FB', '#FF4081', '#FF6E40',
  '#FFD740', '#76FF03', '#64FFDA', '#00E5FF',
  '#448AFF', '#FF5252', '#69F0AE', '#FFAB40',
]

/**
 * Physics-based mini-game: a walled container where balls spawn on each click.
 * Creates a "gumball machine" / "ball pit" visual effect.
 */
export function useMiniGamePhysics() {
  let engine = null
  let runner = null
  let animId = null
  let canvas = null
  let ctx = null
  let containerW = 0
  let containerH = 0
  const balls = []
  const walls = []

  function init(canvasEl, width = 300, height = 300) {
    if (!canvasEl) return
    canvas = canvasEl
    ctx = canvas.getContext('2d')
    containerW = width
    containerH = height
    canvas.width = width
    canvas.height = height

    engine = Engine.create({ gravity: { x: 0, y: 1.2 } })
    runner = Runner.create()
    Runner.run(runner, engine)

    const wallThickness = 20
    const wallOpts = { isStatic: true, restitution: 0.3, friction: 0.05 }

    const floor = Bodies.rectangle(width / 2, height + wallThickness / 2 - 2, width + wallThickness * 2, wallThickness, wallOpts)
    const leftWall = Bodies.rectangle(-wallThickness / 2 + 2, height / 2, wallThickness, height * 2, wallOpts)
    const rightWall = Bodies.rectangle(width + wallThickness / 2 - 2, height / 2, wallThickness, height * 2, wallOpts)

    walls.push(floor, leftWall, rightWall)
    World.add(engine.world, walls)

    loop()
  }

  function spawnBall(x, y) {
    if (!engine) return

    const radius = 8 + Math.random() * 6
    const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)]

    const body = Bodies.circle(
      Math.max(radius, Math.min(containerW - radius, x)),
      Math.max(radius, Math.min(containerH * 0.5, y)),
      radius,
      {
        restitution: 0.6,
        friction: 0.05,
        frictionAir: 0.005,
        density: 0.002,
      }
    )

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 4,
      y: -2 - Math.random() * 3,
    })

    World.add(engine.world, body)
    balls.push({ body, color, radius })

    if (balls.length > 120) {
      const old = balls.shift()
      World.remove(engine.world, old.body)
    }
  }

  function loop() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(124, 77, 255, 0.25)'
    ctx.lineWidth = 3
    ctx.strokeRect(1, 1, containerW - 2, containerH - 2)

    for (const ball of balls) {
      const { x, y } = ball.body.position
      ctx.save()

      ctx.shadowColor = ball.color
      ctx.shadowBlur = 6
      ctx.fillStyle = ball.color
      ctx.beginPath()
      ctx.arc(x, y, ball.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.arc(x - ball.radius * 0.3, y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    animId = requestAnimationFrame(loop)
  }

  function reset() {
    for (const ball of balls) {
      if (engine) World.remove(engine.world, ball.body)
    }
    balls.length = 0
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
    balls.length = 0
    walls.length = 0
    canvas = null
    ctx = null
  }

  return {
    init,
    spawnBall,
    reset,
    cleanup,
  }
}
