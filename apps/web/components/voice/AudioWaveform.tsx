'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

interface AudioWaveformProps {
  /** Float32Array of audio samples or frequency data */
  data?: Float32Array | number[]
  /** Whether to animate in real-time */
  isLive?: boolean
  /** Analyser node for live data */
  analyserNode?: AnalyserNode | null
  /** Bar color — Tailwind class won't work on canvas; pass hex/rgb */
  barColor?: string
  /** Background color */
  bgColor?: string
  /** Bar width in pixels */
  barWidth?: number
  /** Gap between bars */
  barGap?: number
  /** Height of the canvas */
  height?: number
  className?: string
}

export function AudioWaveform({
  data,
  isLive = false,
  analyserNode,
  barColor = '#6366f1',
  bgColor = 'transparent',
  barWidth = 3,
  barGap = 1,
  height = 48,
  className,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  const drawStatic = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, samples: Float32Array | number[]) => {
      ctx.clearRect(0, 0, w, h)

      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, w, h)
      }

      const totalBarWidth = barWidth + barGap
      const barCount = Math.floor(w / totalBarWidth)
      const step = Math.max(1, Math.floor(samples.length / barCount))

      ctx.fillStyle = barColor

      for (let i = 0; i < barCount; i++) {
        const sampleIndex = Math.min(i * step, samples.length - 1)
        const value = Math.abs(samples[sampleIndex] ?? 0)
        const barHeight = Math.max(2, value * h * 0.9)
        const x = i * totalBarWidth
        const y = (h - barHeight) / 2

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }
    },
    [barColor, bgColor, barWidth, barGap]
  )

  const drawLive = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, analyser: AnalyserNode) => {
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)

        ctx.clearRect(0, 0, w, h)

        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, w, h)
        }

        const totalBarWidth = barWidth + barGap
        const barCount = Math.floor(w / totalBarWidth)
        const step = Math.max(1, Math.floor(bufferLength / barCount))

        ctx.fillStyle = barColor

        for (let i = 0; i < barCount; i++) {
          const sampleIndex = Math.min(i * step, bufferLength - 1)
          const value = (dataArray[sampleIndex] ?? 0) / 255
          const barHeight = Math.max(2, value * h * 0.9)
          const x = i * totalBarWidth
          const y = (h - barHeight) / 2

          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
          ctx.fill()
        }
      }

      draw()
    },
    [barColor, bgColor, barWidth, barGap]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    if (isLive && analyserNode) {
      drawLive(ctx, rect.width, rect.height, analyserNode)
    } else if (data && data.length > 0) {
      drawStatic(ctx, rect.width, rect.height, data)
    } else {
      // Draw idle bars
      ctx.clearRect(0, 0, rect.width, rect.height)
      const totalBarWidth = barWidth + barGap
      const barCount = Math.floor(rect.width / totalBarWidth)
      ctx.fillStyle = barColor + '40'

      for (let i = 0; i < barCount; i++) {
        const idleHeight = 2 + Math.sin(i * 0.3) * 2
        const x = i * totalBarWidth
        const y = (rect.height - idleHeight) / 2
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, idleHeight, barWidth / 2)
        ctx.fill()
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data, isLive, analyserNode, drawStatic, drawLive, barColor, barWidth, barGap])

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full', className)}
      style={{ height }}
      aria-hidden="true"
    />
  )
}
