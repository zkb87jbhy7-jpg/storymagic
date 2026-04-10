'use client'

import { useRef, useEffect } from 'react'
import type { ParticlePreset } from '@/lib/reader/animation-presets'
import { ParticleEngine } from '@/lib/reader/particle-engine'

interface ParticleSystemProps {
  preset: ParticlePreset
}

/**
 * Three.js WebGPU/WebGL particle renderer.
 * Falls back to ParticleSystemFallback if Three.js fails to initialize.
 */
export function ParticleSystem({ preset }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleEngine | null>(null)
  const failedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || failedRef.current) return

    let cancelled = false
    const engine = new ParticleEngine()

    async function init() {
      if (!canvas || cancelled) return
      const success = await engine.init(canvas)
      if (cancelled) {
        engine.destroy()
        return
      }
      if (!success) {
        failedRef.current = true
        engine.destroy()
        return
      }
      engineRef.current = engine
      engine.setPreset(preset)
      engine.start()
    }

    init()

    return () => {
      cancelled = true
      engine.destroy()
      engineRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    engineRef.current?.setPreset(preset)
  }, [preset])

  useEffect(() => {
    function handleResize() {
      engineRef.current?.resize()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
