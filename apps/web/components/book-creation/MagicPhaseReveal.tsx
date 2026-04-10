'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MagicPhaseRevealProps {
  onOpenBook: () => void
}

export function MagicPhaseReveal({ onOpenBook }: MagicPhaseRevealProps) {
  const t = useTranslations('magicMoment')
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const bookRef = useRef<HTMLDivElement>(null)

  // 3D tilt on hover
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTiltX(-y * 15)
    setTiltY(x * 15)
  }

  const handleMouseLeave = () => {
    setTiltX(0)
    setTiltY(0)
  }

  // Confetti
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      rotation: number
      rotationSpeed: number
      opacity: number
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    }))

    let animFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let alive = false
      for (const p of particles) {
        if (p.opacity <= 0) continue
        alive = true

        p.x += p.vx
        p.vy += 0.15
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.005

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }

      if (alive) {
        animFrame = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <div className="relative flex flex-col items-center gap-8">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <motion.h2
        className="text-2xl font-bold text-slate-900 dark:text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {t('phase5')}
      </motion.h2>

      {/* Book cover with 3D tilt */}
      <motion.div
        ref={bookRef}
        className={cn(
          'relative h-64 w-48 cursor-pointer overflow-hidden rounded-xl shadow-2xl',
          'bg-gradient-to-br from-primary-500 to-primary-700',
          'dark:from-primary-400 dark:to-primary-600'
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Book cover content placeholder */}
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
          <div className="h-4 w-24 rounded bg-white/30" />
          <div className="h-3 w-16 rounded bg-white/20" />
          <div className="mt-4 h-20 w-20 rounded-full bg-white/15" />
        </div>

        {/* Gloss effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </motion.div>

      {/* Open Book button */}
      <motion.button
        type="button"
        onClick={onOpenBook}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold',
          'bg-primary-600 text-white shadow-lg shadow-primary-500/30',
          'hover:bg-primary-700 hover:shadow-primary-500/40',
          'dark:bg-primary-500 dark:shadow-primary-400/20 dark:hover:bg-primary-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
          'animate-glow'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <BookOpen className="h-5 w-5" />
        {t('openBook')}
      </motion.button>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(var(--color-primary-500), 0.3); }
          50% { box-shadow: 0 0 40px rgba(var(--color-primary-500), 0.5); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
