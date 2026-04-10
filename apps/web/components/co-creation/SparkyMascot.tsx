'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type SparkyMood = 'happy' | 'excited' | 'thinking' | 'waving' | 'idle'

interface SparkyMascotProps {
  mood?: SparkyMood
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-32 w-32',
} as const

export function SparkyMascot({ mood = 'idle', size = 'md', className }: SparkyMascotProps) {
  const eyeVariant = mood === 'excited' ? 'wide' : mood === 'thinking' ? 'squint' : 'normal'

  return (
    <motion.div
      className={cn('relative', sizeMap[size], className)}
      animate={
        mood === 'waving'
          ? { rotate: [0, -10, 10, -10, 0] }
          : mood === 'excited'
            ? { y: [0, -8, 0] }
            : {}
      }
      transition={
        mood === 'waving'
          ? { duration: 1.2, repeat: Infinity, repeatDelay: 2 }
          : mood === 'excited'
            ? { duration: 0.6, repeat: Infinity }
            : {}
      }
    >
      {/* Star body with glow pulse */}
      <motion.div
        className="relative h-full w-full"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Glow aura */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'animate-pulse blur-md',
            'bg-accent-400/40 dark:bg-accent-300/30'
          )}
        />

        {/* Star SVG body */}
        <svg viewBox="0 0 100 100" className="relative h-full w-full drop-shadow-lg">
          <defs>
            <radialGradient id="sparky-gradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <filter id="sparky-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" />
            </filter>
          </defs>

          {/* 5-point star */}
          <motion.polygon
            points="50,5 61,35 95,35 67,57 78,90 50,70 22,90 33,57 5,35 39,35"
            fill="url(#sparky-gradient)"
            stroke="#EAB308"
            strokeWidth="1.5"
            filter="url(#sparky-glow)"
            animate={
              mood === 'happy'
                ? { scale: [1, 1.02, 1] }
                : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Eyes */}
          <g>
            {/* Left eye */}
            <motion.ellipse
              cx="40"
              cy="42"
              rx={eyeVariant === 'wide' ? 5 : eyeVariant === 'squint' ? 4 : 4}
              ry={eyeVariant === 'wide' ? 6 : eyeVariant === 'squint' ? 2.5 : 5}
              fill="#1E293B"
              animate={
                mood === 'thinking'
                  ? { cx: [40, 38, 40] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Left eye highlight */}
            <circle cx="42" cy="40" r="1.5" fill="white" />

            {/* Right eye */}
            <motion.ellipse
              cx="60"
              cy="42"
              rx={eyeVariant === 'wide' ? 5 : eyeVariant === 'squint' ? 4 : 4}
              ry={eyeVariant === 'wide' ? 6 : eyeVariant === 'squint' ? 2.5 : 5}
              fill="#1E293B"
              animate={
                mood === 'thinking'
                  ? { cx: [60, 58, 60] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Right eye highlight */}
            <circle cx="62" cy="40" r="1.5" fill="white" />
          </g>

          {/* Mouth */}
          <motion.path
            d={
              mood === 'excited'
                ? 'M 40 55 Q 50 68 60 55'
                : mood === 'thinking'
                  ? 'M 42 56 Q 50 52 58 56'
                  : 'M 42 54 Q 50 62 58 54'
            }
            fill="none"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Cheeks (blush) */}
          {(mood === 'happy' || mood === 'excited') && (
            <>
              <circle cx="32" cy="50" r="4" fill="#FCA5A5" opacity="0.4" />
              <circle cx="68" cy="50" r="4" fill="#FCA5A5" opacity="0.4" />
            </>
          )}
        </svg>
      </motion.div>

      {/* Sparkle particles around */}
      {(mood === 'excited' || mood === 'happy') && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-accent-400"
              style={{
                top: `${10 + i * 20}%`,
                left: i % 2 === 0 ? '-10%' : '105%',
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -10, -20],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}
