'use client'

import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

interface ReadingCornerBackgroundProps {
  /** Override the auto-detected time of day */
  override?: TimeOfDay
  children?: React.ReactNode
  className?: string
}

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const timeConfig: Record<
  TimeOfDay,
  {
    gradient: string
    darkGradient: string
    elements: React.ReactNode
  }
> = {
  morning: {
    gradient: 'from-amber-100 via-sky-100 to-blue-50',
    darkGradient: 'dark:from-amber-950/30 dark:via-sky-950/20 dark:to-slate-900',
    elements: (
      <>
        {/* Sunshine rays */}
        <motion.div
          className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-yellow-300/30 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {/* Small clouds */}
        <motion.div
          className="absolute end-[20%] top-[10%] h-8 w-20 rounded-full bg-white/40 blur-sm"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute end-[40%] top-[15%] h-6 w-14 rounded-full bg-white/30 blur-sm"
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </>
    ),
  },
  afternoon: {
    gradient: 'from-sky-100 via-blue-50 to-white',
    darkGradient: 'dark:from-sky-950/20 dark:via-blue-950/10 dark:to-slate-900',
    elements: (
      <>
        <motion.div
          className="absolute end-[10%] top-[5%] h-32 w-32 rounded-full bg-yellow-200/20 blur-3xl"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </>
    ),
  },
  evening: {
    gradient: 'from-orange-100 via-rose-100 to-purple-100',
    darkGradient: 'dark:from-orange-950/20 dark:via-rose-950/20 dark:to-purple-950/20',
    elements: (
      <>
        {/* Sunset glow */}
        <motion.div
          className="absolute bottom-0 start-0 h-1/2 w-full bg-gradient-to-t from-orange-200/40 to-transparent"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        {/* Setting sun */}
        <motion.div
          className="absolute bottom-[20%] start-[10%] h-16 w-16 rounded-full bg-orange-300/40 blur-xl"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </>
    ),
  },
  night: {
    gradient: 'from-indigo-100 via-slate-100 to-slate-50',
    darkGradient: 'dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950',
    elements: (
      <>
        {/* Moon */}
        <motion.div
          className="absolute end-[10%] top-[8%] h-12 w-12 rounded-full bg-slate-200 shadow-inner dark:bg-slate-300/20"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        {/* Stars */}
        {[
          { x: 20, y: 12, size: 2, delay: 0 },
          { x: 35, y: 8, size: 1.5, delay: 0.5 },
          { x: 55, y: 15, size: 2.5, delay: 1 },
          { x: 70, y: 5, size: 1.5, delay: 1.5 },
          { x: 85, y: 18, size: 2, delay: 0.7 },
          { x: 15, y: 25, size: 1, delay: 2 },
          { x: 45, y: 22, size: 1.5, delay: 0.3 },
          { x: 65, y: 10, size: 2, delay: 1.2 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-slate-400 dark:bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
            transition={{
              duration: 2 + star.delay,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </>
    ),
  },
}

export function ReadingCornerBackground({
  override,
  children,
  className,
}: ReadingCornerBackgroundProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon')

  useEffect(() => {
    setTimeOfDay(override ?? getTimeOfDay())
  }, [override])

  const config = useMemo(() => timeConfig[timeOfDay], [timeOfDay])

  return (
    <div
      className={cn(
        'relative min-h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br',
        config.gradient,
        config.darkGradient,
        className
      )}
    >
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0">{config.elements}</div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
