'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface TimelineChapter {
  id: string
  title: string
  date: string
  pageCount: number
  isLatest?: boolean
}

interface LivingBookTimelineProps {
  chapters: TimelineChapter[]
  bookTitle: string
  onAddChapter?: () => void
  onChapterClick?: (chapterId: string) => void
  className?: string
}

export function LivingBookTimeline({
  chapters,
  bookTitle,
  onAddChapter,
  onChapterClick,
  className,
}: LivingBookTimelineProps) {
  const t = useTranslations('library')

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-accent-500" />
          {t('livingTimeline')}
        </h3>
        {onAddChapter && (
          <button
            type="button"
            onClick={onAddChapter}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium',
              'bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100',
              'dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-950/50'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('addChapter')}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative ps-6">
        {/* Vertical line */}
        <div className="absolute bottom-0 start-2.5 top-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-300 to-slate-200 dark:from-primary-500 dark:via-primary-700 dark:to-slate-700" />

        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute -start-[14px] top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-slate-800',
                  chapter.isLatest
                    ? 'bg-primary-500'
                    : 'bg-primary-200 dark:bg-primary-700'
                )}
              >
                {chapter.isLatest && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Chapter card */}
              <button
                type="button"
                onClick={() => onChapterClick?.(chapter.id)}
                className={cn(
                  'w-full rounded-xl border bg-white p-3 text-start transition-all',
                  'hover:shadow-md',
                  'dark:bg-slate-800',
                  chapter.isLatest
                    ? 'border-primary-200 shadow-sm dark:border-primary-800'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {chapter.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(chapter.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                    <BookOpen className="h-3 w-3" />
                    <span>
                      {t('pageCount', { count: chapter.pageCount })}
                    </span>
                  </div>
                </div>

                {chapter.isLatest && (
                  <span className="mt-2 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
                    {t('latestChapter')}
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
