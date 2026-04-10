'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { ParticlePreset } from '@/lib/reader/animation-presets'
import { ParticleEngine } from '@/lib/reader/particle-engine'
import { ParticleEngineCanvas } from '@/lib/reader/particle-engine-canvas'

interface UseParticleSystemOptions {
  preset: ParticlePreset
  enabled?: boolean
}

export function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseParticleSystemOptions
) {
  const { preset, enabled = true } = options
  const engineRef = useRef<ParticleEngine | ParticleEngineCanvas | null>(null)
  const initializedRef = useRef(false)

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current || !enabled) return

    let cancelled = false

    async function init() {
      const canvas = canvasRef.current
      if (!canvas || cancelled) return

      // Try Three.js engine first
      const threeEngine = new ParticleEngine()
      const success = await threeEngine.init(canvas)

      if (cancelled) {
        threeEngine.destroy()
        return
      }

      if (success) {
        engineRef.current = threeEngine
      } else {
        // Fall back to canvas
        threeEngine.destroy()
        const canvasEngine = new ParticleEngineCanvas()
        canvasEngine.init(canvas)
        engineRef.current = canvasEngine
      }

      engineRef.current?.setPreset(preset)
      engineRef.current?.start()
      initializedRef.current = true
    }

    init()

    return () => {
      cancelled = true
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
        initializedRef.current = false
      }
    }
  }, [canvasRef, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update preset
  useEffect(() => {
    if (engineRef.current && initializedRef.current) {
      engineRef.current.setPreset(preset)
    }
  }, [preset])

  // Handle resize
  useEffect(() => {
    if (!enabled) return

    function handleResize() {
      engineRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [enabled])

  const stop = useCallback(() => {
    engineRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    engineRef.current?.start()
  }, [])

  return { stop, start }
}
