'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LivingBookBadgeProps {
  /** Number of chapters in the living book */
  chapterCount?: number
  /** Whether to show compact version */
  compact?: boolean
  className?: string
}

export function LivingBookBadge({
  chapterCount,
  compact = false,
  className,
}: LivingBookBadgeProps) {
  const t = useTranslations('library')

  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        'bg-gradient-to-r from-accent-400 to-amber-500 text-amber-950',
        'shadow-md shadow-accent-400/30',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      {/* Animated sparkle */}
      <motion.div
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className={compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
      </motion.div>

      <span>{t('livingBook')}</span>

      {chapterCount && !compact && (
        <span className="rounded-full bg-white/30 px-1.5 text-[10px]">
          {t('chapters', { count: chapterCount })}
        </span>
      )}

      {/* Golden shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.div>
  )
}
