// Three.js WebGPU particle engine
// Falls back to canvas engine when WebGPU is not available

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

export class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.OrthographicCamera | null = null
  private particles: Particle[] = []
  private preset: ParticlePreset = 'twinkling_stars'
  private config: ParticleConfig = getPresetConfig('twinkling_stars')
  private animationId: number | null = null
  private lastTime = 0
  private spawnAccumulator = 0
  private isRunning = false
  private THREE: typeof import('three') | null = null

  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    this.canvas = canvas

    try {
      // Dynamic import to avoid SSR issues
      this.THREE = await import('three')
      const { WebGLRenderer, Scene, OrthographicCamera } = this.THREE

      this.renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      this.renderer.setClearColor(0x000000, 0)

      this.scene = new Scene()
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      this.camera = new OrthographicCamera(0, w, 0, h, 0.1, 1000)
      this.camera.position.z = 10

      return true
    } catch {
      // Three.js failed to initialize - caller should use canvas fallback
      return false
    }
  }

  setPreset(preset: ParticlePreset): void {
    this.preset = preset
    this.config = getPresetConfig(preset)
    this.particles = []
    this.spawnAccumulator = 0

    // Pre-spawn static particles (like stars)
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
    if (!this.canvas || !this.renderer || !this.camera) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.renderer.setSize(w, h)
    this.camera.right = w
    this.camera.bottom = h
    this.camera.updateProjectionMatrix()
  }

  destroy(): void {
    this.stop()
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
    if (this.scene) {
      this.scene.clear()
      this.scene = null
    }
    this.camera = null
    this.canvas = null
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
      // Static placement (e.g., stars)
      x = Math.random() * w
      y = Math.random() * h
    } else if (config.baseVelocity.y > 0) {
      // Falling - spawn at top
      x = Math.random() * w
      y = -size
    } else if (config.baseVelocity.y < 0) {
      // Rising - spawn at bottom
      x = Math.random() * w
      y = h + size
    } else {
      // Ambient - spawn anywhere
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
    const dt = Math.min(now - this.lastTime, 50) // Cap delta to avoid jumps
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

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += dt

      // Remove expired or out-of-bounds
      if (p.life >= p.maxLife || p.y > h + 50 || p.y < -50 || p.x > w + 50 || p.x < -50) {
        if (config.spawnRate === 0) {
          // Reset static particles instead of removing
          const newP = this.createParticle()
          newP.life = 0
          this.particles[i] = newP
        } else {
          this.particles.splice(i, 1)
        }
        continue
      }

      // Apply physics
      p.vy += config.gravity * dtSec * 60
      if (config.drift) {
        p.vx += Math.sin(p.phase + p.life * 0.001) * config.wind * dtSec * 60
      }

      p.x += p.vx * dtSec * 60
      p.y += p.vy * dtSec * 60

      if (config.rotationSpeed) {
        p.rotation += config.rotationSpeed * dtSec * 60
      }

      // Handle twinkle
      if (config.twinkle) {
        p.opacity = config.opacity[0] + (config.opacity[1] - config.opacity[0]) *
          (0.5 + 0.5 * Math.sin(p.phase + p.life * 0.003))
      }

      // Handle glow pulse
      if (config.glow) {
        const pulse = 0.5 + 0.5 * Math.sin(p.phase + p.life * 0.002)
        p.opacity = config.opacity[0] + (config.opacity[1] - config.opacity[0]) * pulse
        p.size = config.sizeRange[0] + (config.sizeRange[1] - config.sizeRange[0]) * pulse
      }

      // Firefly wander
      if (this.preset === 'fireflies') {
        p.vx = Math.sin(p.phase + p.life * 0.001) * 0.5
        p.vy = Math.cos(p.phase * 1.3 + p.life * 0.0008) * 0.3
      }

      // Accumulate at bottom
      if (config.accumulate && p.y > h - 10) {
        p.vy = 0
        p.vx *= 0.95
      }
    }
  }

  private render(): void {
    if (!this.canvas || !this.renderer || !this.scene || !this.camera || !this.THREE) return

    // Clear previous particle meshes
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0]
      this.scene.remove(child)
    }

    const { CircleGeometry, MeshBasicMaterial, Mesh, Color } = this.THREE

    for (const p of this.particles) {
      const geometry = new CircleGeometry(p.size / 2, 8)
      const material = new MeshBasicMaterial({
        color: new Color(p.color),
        transparent: true,
        opacity: p.opacity,
      })
      const mesh = new Mesh(geometry, material)
      mesh.position.set(p.x, p.y, 0)
      mesh.rotation.z = p.rotation
      this.scene.add(mesh)
    }

    this.renderer.render(this.scene, this.camera)
  }
}
