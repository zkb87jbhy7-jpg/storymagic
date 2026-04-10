'use client'

import { useState, useEffect } from 'react'
import type { ParticlePreset } from '@/lib/reader/animation-presets'
import { ParticleSystem } from './ParticleSystem'
import { ParticleSystemFallback } from './ParticleSystemFallback'

interface PageAnimationLayerProps {
  preset: ParticlePreset
}

/**
 * Wrapper that decides which particle system to use based on WebGPU/WebGL support.
 * Tries Three.js (WebGL) first, falls back to Canvas 2D.
 */
export function PageAnimationLayer({ preset }: PageAnimationLayerProps) {
  const [useWebGL, setUseWebGL] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Quick check for WebGL support
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      setUseWebGL(!!gl)
    } catch {
      setUseWebGL(false)
    }
    setChecked(true)
  }, [])

  if (!checked) return null

  if (useWebGL) {
    return <ParticleSystem preset={preset} />
  }

  return <ParticleSystemFallback preset={preset} />
}
