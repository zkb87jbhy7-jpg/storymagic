'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Moon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DreamToBookButton } from './DreamToBookButton'

export type DreamEmotion = 'happy' | 'adventurous' | 'scary' | 'magical' | 'peaceful' | 'funny' | 'sad'

export interface DreamData {
  id: string
  description: string
  emotion: DreamEmotion
  childName: string
  createdAt: string
}

const emotionConfig: Record<
  DreamEmotion,
  { emoji: string; bgClass: string; textClass: string; borderClass: string }
> = {
  happy: {
    emoji: '\u{1F60A}',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
  },
  adventurous: {
    emoji: '\u{1F680}',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  scary: {
    emoji: '\u{1F631}',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
  magical: {
    emoji: '\u2728',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/20',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
  },
  peaceful: {
    emoji: '\u{1F33F}',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  funny: {
    emoji: '\u{1F602}',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
  },
  sad: {
    emoji: '\u{1F622}',
    bgClass: 'bg-slate-100 dark:bg-slate-900/20',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
}

interface DreamCardProps {
  dream: DreamData
  onConvertToBook: (dreamId: string) => void
  className?: string
}

export function DreamCard({ dream, onConvertToBook, className }: DreamCardProps) {
  const t = useTranslations('dreams')
  const config = emotionConfig[dream.emotion]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-800',
        config.borderClass,
        className
      )}
    >
      {/* Header with emotion */}
      <div className={cn('flex items-center gap-2 px-4 py-2.5', config.bgClass)}>
        <span className="text-lg" aria-hidden="true">
          {config.emoji}
        </span>
        <span className={cn('text-sm font-semibold', config.textClass)}>
          {t(`emotion_${dream.emotion}`)}
        </span>
        <div className="ms-auto flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3 w-3" />
          {new Date(dream.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-2">
          <Moon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {dream.description}
          </p>
        </div>

        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {t('dreamBy', { name: dream.childName })}
        </p>
      </div>

      {/* Action */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-700">
        <DreamToBookButton
          dreamId={dream.id}
          dreamExcerpt={dream.description.slice(0, 100)}
          onConvert={onConvertToBook}
        />
      </div>
    </motion.div>
  )
}
