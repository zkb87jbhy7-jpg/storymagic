// Animation preset configurations for the particle system

export type ParticlePreset =
  | 'falling_leaves'
  | 'twinkling_stars'
  | 'floating_bubbles'
  | 'gentle_rain'
  | 'snowfall'
  | 'fireflies'

export interface ParticleConfig {
  particleCount: number
  spawnRate: number
  baseVelocity: { x: number; y: number }
  colors: string[]
  sizeRange: [number, number]
  lifetime: number
  gravity: number
  wind: number
  opacity: [number, number]
  rotationSpeed?: number
  twinkle?: boolean
  glow?: boolean
  drift?: boolean
  pop?: boolean
  accumulate?: boolean
}

export const PARTICLE_PRESETS: Record<ParticlePreset, ParticleConfig> = {
  falling_leaves: {
    particleCount: 30,
    spawnRate: 2,
    baseVelocity: { x: 0.3, y: 1.2 },
    colors: ['#8B4513', '#D2691E', '#CD853F', '#F4A460', '#DAA520', '#B8860B'],
    sizeRange: [8, 18],
    lifetime: 8000,
    gravity: 0.02,
    wind: 0.15,
    opacity: [0.6, 0.9],
    rotationSpeed: 0.02,
    drift: true,
  },

  twinkling_stars: {
    particleCount: 60,
    spawnRate: 0,
    baseVelocity: { x: 0, y: 0 },
    colors: ['#FFFFFF', '#FFFACD', '#FFD700', '#FFF8DC', '#FAFAD2'],
    sizeRange: [2, 6],
    lifetime: 3000,
    gravity: 0,
    wind: 0,
    opacity: [0.2, 1.0],
    twinkle: true,
  },

  floating_bubbles: {
    particleCount: 25,
    spawnRate: 1.5,
    baseVelocity: { x: 0, y: -0.8 },
    colors: ['#87CEEB', '#ADD8E6', '#B0E0E6', '#E0F7FF', '#CCE5FF'],
    sizeRange: [6, 20],
    lifetime: 6000,
    gravity: -0.01,
    wind: 0.08,
    opacity: [0.3, 0.6],
    drift: true,
    pop: true,
  },

  gentle_rain: {
    particleCount: 80,
    spawnRate: 8,
    baseVelocity: { x: -0.3, y: 4 },
    colors: ['#4A90D9', '#6BA3E0', '#87B5E7', '#A3C7EE'],
    sizeRange: [1, 3],
    lifetime: 2000,
    gravity: 0.05,
    wind: -0.1,
    opacity: [0.3, 0.7],
  },

  snowfall: {
    particleCount: 50,
    spawnRate: 3,
    baseVelocity: { x: 0.1, y: 0.8 },
    colors: ['#FFFFFF', '#F0F8FF', '#F5F5F5', '#FAFAFA'],
    sizeRange: [3, 8],
    lifetime: 10000,
    gravity: 0.005,
    wind: 0.12,
    opacity: [0.5, 1.0],
    drift: true,
    accumulate: true,
  },

  fireflies: {
    particleCount: 20,
    spawnRate: 1,
    baseVelocity: { x: 0, y: 0 },
    colors: ['#FFD700', '#FFA500', '#FFDF00', '#FFE4B5'],
    sizeRange: [3, 7],
    lifetime: 5000,
    gravity: 0,
    wind: 0,
    opacity: [0.2, 1.0],
    glow: true,
    drift: true,
  },
} as const

export function getPresetConfig(preset: ParticlePreset): ParticleConfig {
  return PARTICLE_PRESETS[preset]
}
