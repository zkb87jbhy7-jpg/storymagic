// Canvas 2D fallback particle engine
// Same interface as the Three.js engine but uses 2D context

import type { ParticlePreset } from './animation-presets'
import { getPresetConfig, type ParticleConfig } from './animation-presets'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  rotation: number
  life: number
  maxLife: number
  phase: number
}

export class ParticleEngineCanvas {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private preset: ParticlePreset = 'twinkling_stars'
  private config: ParticleConfig = getPresetConfig('twinkling_stars')
  private animationId: number | null = null
  private lastTime = 0
  private spawnAccumulator = 0
  private isRunning = false

  init(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    if (!this.ctx) return false

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    this.ctx.scale(dpr, dpr)

    return true
  }

  setPreset(preset: ParticlePreset): void {
    this.preset = preset
    this.config = getPresetConfig(preset)
    this.particles = []
    this.spawnAccumulator = 0

    // Pre-spawn static particles
    if (this.config.spawnRate === 0 && this.canvas) {
      for (let i = 0; i < this.config.particleCount; i++) {
        this.particles.push(this.createParticle())
      }
    }
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.tick()
  }

  stop(): void {
    this.isRunning = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  resize(): void {
    if (!this.canvas || !this.ctx) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.canvas.width = this.canvas.clientWidth * dpr
    this.canvas.height = this.canvas.clientHeight * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  destroy(): void {
    this.stop()
    this.canvas = null
    this.ctx = null
    this.particles = []
  }

  private createParticle(): Particle {
    if (!this.canvas) {
      return {
        x: 0, y: 0, vx: 0, vy: 0, size: 2,
        color: '#fff', opacity: 1, rotation: 0,
        life: 0, maxLife: 1000, phase: 0,
      }
    }

    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const config = this.config
    const colors = config.colors
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0])

    let x: number
    let y: number

    if (config.spawnRate === 0) {
      x = Math.random() * w
      y = Math.random() * h
    } else if (config.baseVelocity.y > 0) {
      x = Math.random() * w
      y = -size
    } else if (config.baseVelocity.y < 0) {
      x = Math.random() * w
      y = h + size
    } else {
      x = Math.random() * w
      y = Math.random() * h
    }

    return {
      x,
      y,
      vx: config.baseVelocity.x + (Math.random() - 0.5) * 0.5,
      vy: config.baseVelocity.y + (Math.random() - 0.5) * 0.3,
      size,
      color,
      opacity: config.opacity[0] + Math.random() * (config.opacity[1] - config.opacity[0]),
      rotation: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: config.lifetime * (0.8 + Math.random() * 0.4),
      phase: Math.random() * Math.PI * 2,
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return

    const now = performance.now()
    const dt = Math.min(now - this.lastTime, 50)
    this.lastTime = now

    this.update(dt)
    this.render()

    this.animationId = requestAnimationFrame(this.tick)
  }

  private update(dt: number): void {
    if (!this.canvas) return

    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const config = this.config
    const dtSec = dt / 1000

    // Spawn new particles
    if (config.spawnRate > 0) {
      this.spawnAccumulator += config.spawnRate * dtSec
      while (this.spawnAccumulator >= 1 && this.particles.length < config.particleCount) {
        this.particles.push(this.createParticle())
        this.spawnAccumulator -= 1
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += dt

      if (p.life >= p.maxLife || p.y > h + 50 || p.y < -50 || p.x > w + 50 || p.x < -50) {
        if (config.spawnRate === 0) {
          const newP = this.createParticle()
          newP.life = 0
          this.particles[i] = newP
        } else {
          this.particles.splice(i, 1)
        }
        continue
      }

      p.vy += config.gravity * dtSec * 60
      if (config.drift) {
        p.vx += Math.sin(p.phase + p.life * 0.001) * config.wind * dtSec * 60
      }

      p.x += p.vx * dtSec * 60
      p.y += p.vy * dtSec * 60

      if (config.rotationSpeed) {
        p.rotation += config.rotationSpeed * dtSec * 60
      }

      if (config.twinkle) {
        p.opacity = config.opacity[0] + (config.opacity[1] - config.opacity[0]) *
          (0.5 + 0.5 * Math.sin(p.phase + p.life * 0.003))
      }

      if (config.glow) {
        const pulse = 0.5 + 0.5 * Math.sin(p.phase + p.life * 0.002)
        p.opacity = config.opacity[0] + (config.opacity[1] - config.opacity[0]) * pulse
        p.size = config.sizeRange[0] + (config.sizeRange[1] - config.sizeRange[0]) * pulse
      }

      if (this.preset === 'fireflies') {
        p.vx = Math.sin(p.phase + p.life * 0.001) * 0.5
        p.vy = Math.cos(p.phase * 1.3 + p.life * 0.0008) * 0.3
      }

      if (config.accumulate && p.y > h - 10) {
        p.vy = 0
        p.vx *= 0.95
      }
    }
  }

  private render(): void {
    if (!this.canvas || !this.ctx) return

    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const ctx = this.ctx

    ctx.clearRect(0, 0, w, h)

    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)

      if (this.config.glow) {
        // Draw glow effect
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.size * 2
      }

      ctx.fillStyle = p.color
      ctx.beginPath()

      if (this.preset === 'falling_leaves') {
        // Leaf shape
        ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2)
      } else if (this.preset === 'gentle_rain') {
        // Rain streak
        ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 3)
      } else if (this.preset === 'floating_bubbles') {
        // Bubble with highlight
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = p.opacity * 0.4
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(-p.size / 6, -p.size / 6, p.size / 6, 0, Math.PI * 2)
      } else {
        // Default circle
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      }

      ctx.fill()
      ctx.restore()
    }
  }
}
