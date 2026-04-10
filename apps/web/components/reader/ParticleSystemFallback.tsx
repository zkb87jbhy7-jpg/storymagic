'use client'

import { useRef, useEffect } from 'react'
import type { ParticlePreset } from '@/lib/reader/animation-presets'
import { ParticleEngineCanvas } from '@/lib/reader/particle-engine-canvas'

interface ParticleSystemFallbackProps {
  preset: ParticlePreset
}

/**
 * Canvas 2D fallback particle renderer.
 * Same 6 presets using requestAnimationFrame. Simpler but works everywhere.
 */
export function ParticleSystemFallback({ preset }: ParticleSystemFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleEngineCanvas | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new ParticleEngineCanvas()
    const success = engine.init(canvas)

    if (!success) return

    engineRef.current = engine
    engine.setPreset(preset)
    engine.start()

    return () => {
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
