'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Moon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { DreamData, DreamEmotion } from './DreamCard'

const emotionColors: Record<DreamEmotion, string> = {
  happy: 'bg-yellow-400',
  adventurous: 'bg-blue-400',
  scary: 'bg-purple-400',
  magical: 'bg-indigo-400',
  peaceful: 'bg-green-400',
  funny: 'bg-orange-400',
  sad: 'bg-slate-400',
}

interface DreamTimelineProps {
  dreams: DreamData[]
  onDreamClick?: (dreamId: string) => void
  className?: string
}

interface GroupedDream {
  date: string
  dreams: DreamData[]
}

export function DreamTimeline({ dreams, onDreamClick, className }: DreamTimelineProps) {
  const t = useTranslations('dreams')

  // Group by date
  const grouped = useMemo<GroupedDream[]>(() => {
    const map = new Map<string, DreamData[]>()
    const sorted = [...dreams].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    for (const dream of sorted) {
      const date = new Date(dream.createdAt).toLocaleDateString()
      const existing = map.get(date)
      if (existing) {
        existing.push(dream)
      } else {
        map.set(date, [dream])
      }
    }

    return Array.from(map.entries()).map(([date, dreams]) => ({ date, dreams }))
  }, [dreams])

  if (dreams.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Moon className="mx-auto h-12 w-12 text-indigo-300 dark:text-indigo-600" />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('noDreams')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('relative ps-8', className)}>
      {/* Vertical timeline line */}
      <div className="absolute bottom-0 start-3 top-0 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-300 to-slate-200 dark:from-indigo-500 dark:via-purple-600 dark:to-slate-700" />

      <div className="space-y-6">
        {grouped.map((group, groupIndex) => (
          <div key={group.date}>
            {/* Date label */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="relative mb-3"
            >
              <div className="absolute -start-[22px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-indigo-500 dark:border-slate-800" />
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {group.date}
              </p>
            </motion.div>

            {/* Dreams for this date */}
            <div className="space-y-2">
              {group.dreams.map((dream, dreamIndex) => (
                <motion.button
                  key={dream.id}
                  type="button"
                  onClick={() => onDreamClick?.(dream.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + dreamIndex * 0.05 }}
                  className={cn(
                    'relative flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-start',
                    'transition-all hover:border-indigo-200 hover:shadow-sm',
                    'dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
                  )}
                >
                  {/* Emotion dot on timeline */}
                  <div
                    className={cn(
                      'absolute -start-[29px] top-4 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800',
                      emotionColors[dream.emotion]
                    )}
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                      {dream.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                          dream.emotion === 'happy'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : dream.emotion === 'adventurous'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                              : dream.emotion === 'scary'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                : dream.emotion === 'magical'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                                  : dream.emotion === 'peaceful'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                    : dream.emotion === 'funny'
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        )}
                      >
                        {t(`emotion_${dream.emotion}`)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {dream.childName}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
