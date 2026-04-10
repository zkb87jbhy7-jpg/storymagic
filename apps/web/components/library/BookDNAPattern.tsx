'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

interface BookDNAPatternProps {
  /** Hash string (e.g., story embedding hash) to generate unique pattern */
  hash: string
  /** Size of the SVG */
  size?: number
  className?: string
}

/**
 * Generates a unique SVG pattern from a story embedding hash.
 * Each story gets a visually distinct, reproducible pattern like a DNA fingerprint.
 */
export function BookDNAPattern({ hash, size = 120, className }: BookDNAPatternProps) {
  const patternData = useMemo(() => {
    // Convert hash to numeric values
    const values: number[] = []
    for (let i = 0; i < hash.length; i++) {
      values.push(hash.charCodeAt(i))
    }

    // Pad to minimum length
    while (values.length < 20) {
      values.push(values.reduce((a, b) => a + b, 0) % 256)
    }

    // Generate colors from hash
    const hue1 = (values[0] * 2.5) % 360
    const hue2 = (hue1 + 60 + (values[1] % 120)) % 360
    const hue3 = (hue2 + 40 + (values[2] % 80)) % 360

    const color1 = `hsl(${hue1}, 70%, 60%)`
    const color2 = `hsl(${hue2}, 65%, 55%)`
    const color3 = `hsl(${hue3}, 60%, 50%)`

    // Generate path data for the DNA double helix
    const points1: string[] = []
    const points2: string[] = []
    const crossBars: Array<{ y: number; x1: number; x2: number }> = []

    const steps = 12
    const amplitude = size * 0.25
    const centerX = size / 2

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const y = t * size
      const offset = Math.sin(t * Math.PI * 2 + (values[i % values.length] / 255) * Math.PI) * amplitude

      const x1 = centerX + offset
      const x2 = centerX - offset

      if (i === 0) {
        points1.push(`M ${x1} ${y}`)
        points2.push(`M ${x2} ${y}`)
      } else {
        points1.push(`L ${x1} ${y}`)
        points2.push(`L ${x2} ${y}`)
      }

      // Cross bars at intervals driven by hash
      if (i > 0 && i < steps && values[i] % 3 === 0) {
        crossBars.push({ y, x1, x2 })
      }
    }

    // Generate decorative dots
    const dots = values.slice(0, 8).map((v, i) => ({
      cx: (v / 255) * size * 0.7 + size * 0.15,
      cy: (values[(i + 3) % values.length] / 255) * size * 0.7 + size * 0.15,
      r: 1.5 + (v % 3),
    }))

    return {
      strand1: points1.join(' '),
      strand2: points2.join(' '),
      crossBars,
      dots,
      color1,
      color2,
      color3,
    }
  }, [hash, size])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`dna-grad-${hash.slice(0, 6)}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={patternData.color1} stopOpacity="0.8" />
          <stop offset="50%" stopColor={patternData.color2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={patternData.color3} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size * 0.45}
        fill="none"
        stroke={patternData.color1}
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* DNA strands */}
      <path
        d={patternData.strand1}
        fill="none"
        stroke={patternData.color1}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d={patternData.strand2}
        fill="none"
        stroke={patternData.color2}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Cross bars */}
      {patternData.crossBars.map((bar, i) => (
        <line
          key={i}
          x1={bar.x1}
          y1={bar.y}
          x2={bar.x2}
          y2={bar.y}
          stroke={patternData.color3}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}

      {/* Decorative dots */}
      {patternData.dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={i % 2 === 0 ? patternData.color1 : patternData.color2}
          opacity="0.4"
        />
      ))}
    </svg>
  )
}
