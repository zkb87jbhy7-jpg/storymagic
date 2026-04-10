'use client'

import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type Season = 'spring' | 'summer' | 'sukkot' | 'hanukkah' | 'purim' | 'passover' | 'default'

interface SeasonalBookshelfThemeProps {
  /** Override auto-detected season */
  override?: Season
  children?: React.ReactNode
  className?: string
}

function getCurrentSeason(): Season {
  const now = new Date()
  const month = now.getMonth() // 0-indexed
  const day = now.getDate()

  // Jewish holidays (approximate Gregorian dates — would use a calendar library in production)
  // Sukkot: ~Sep/Oct
  if (month === 9 && day >= 1 && day <= 15) return 'sukkot'
  // Hanukkah: ~Dec
  if (month === 11 && day >= 10 && day <= 30) return 'hanukkah'
  // Purim: ~March
  if (month === 2 && day >= 5 && day <= 20) return 'purim'
  // Passover: ~April
  if (month === 3 && day >= 5 && day <= 25) return 'passover'
  // Summer: June-Aug
  if (month >= 5 && month <= 7) return 'summer'
  // Spring: March-May
  if (month >= 2 && month <= 4) return 'spring'

  return 'default'
}

const seasonConfig: Record<
  Season,
  {
    borderClass: string
    overlayElements: React.ReactNode
  }
> = {
  sukkot: {
    borderClass: 'border-green-600/30',
    overlayElements: (
      <>
        {/* Hanging leaves/s'chach */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute -top-1 h-6 w-8 rounded-b-full bg-green-500/20 dark:bg-green-400/10"
            style={{ left: `${10 + i * 20}%` }}
            animate={{ y: [0, 2, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        {/* Decorative fruits */}
        {[15, 45, 75].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute top-1 h-3 w-3 rounded-full bg-orange-400/60"
            style={{ left: `${pos}%` }}
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
      </>
    ),
  },
  hanukkah: {
    borderClass: 'border-blue-400/30',
    overlayElements: (
      <>
        {/* Candle flames */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${8 + i * 12}%` }}
          >
            <motion.div
              className="h-3 w-2 rounded-full bg-yellow-400/60 blur-[1px]"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            />
            <div className="h-5 w-1 rounded-sm bg-blue-300/40 dark:bg-blue-400/20" />
          </motion.div>
        ))}
      </>
    ),
  },
  purim: {
    borderClass: 'border-purple-400/30',
    overlayElements: (
      <>
        {/* Confetti/costumes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute h-2 w-2 rounded-sm',
              i % 3 === 0
                ? 'bg-purple-400/40'
                : i % 3 === 1
                  ? 'bg-pink-400/40'
                  : 'bg-yellow-400/40'
            )}
            style={{
              left: `${5 + ((i * 17) % 90)}%`,
              top: `${((i * 23) % 80)}%`,
            }}
            animate={{
              y: [0, 20, 40],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              rotate: [0, 180, 360],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </>
    ),
  },
  passover: {
    borderClass: 'border-amber-400/30',
    overlayElements: (
      <>
        {/* Stars of freedom */}
        {[20, 50, 80].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute top-2"
            style={{ left: `${pos}%` }}
            animate={{ y: [-2, 2, -2], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
          >
            <svg className="h-4 w-4 text-amber-400/50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14l-6-4.5h7.5z" />
            </svg>
          </motion.div>
        ))}
      </>
    ),
  },
  summer: {
    borderClass: 'border-cyan-300/30',
    overlayElements: (
      <>
        {/* Beach waves */}
        <motion.div
          className="absolute bottom-0 h-4 w-full bg-gradient-to-t from-cyan-300/20 to-transparent"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Sun */}
        <motion.div
          className="absolute end-4 top-2 h-6 w-6 rounded-full bg-yellow-300/40"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </>
    ),
  },
  spring: {
    borderClass: 'border-pink-300/30',
    overlayElements: (
      <>
        {/* Flower petals */}
        {[10, 30, 50, 70, 90].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute top-1 h-3 w-3 rounded-full bg-pink-300/30"
            style={{ left: `${pos}%` }}
            animate={{ y: [0, 8, 16], opacity: [0.6, 0.4, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}
      </>
    ),
  },
  default: {
    borderClass: 'border-transparent',
    overlayElements: null,
  },
}

export function SeasonalBookshelfTheme({
  override,
  children,
  className,
}: SeasonalBookshelfThemeProps) {
  const [season, setSeason] = useState<Season>('default')

  useEffect(() => {
    setSeason(override ?? getCurrentSeason())
  }, [override])

  const config = useMemo(() => seasonConfig[season], [season])

  return (
    <div className={cn('relative overflow-hidden rounded-lg border', config.borderClass, className)}>
      {/* Seasonal overlay */}
      {config.overlayElements && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {config.overlayElements}
        </div>
      )}

      {/* Children */}
      <div className="relative">{children}</div>
    </div>
  )
}
