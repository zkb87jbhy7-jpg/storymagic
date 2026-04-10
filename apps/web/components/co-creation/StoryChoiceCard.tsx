'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StoryChoiceCardProps {
  /** Icon rendered as React node (emoji or Lucide icon) */
  icon: React.ReactNode
  /** Label text */
  label: string
  /** Whether this option is selected */
  selected?: boolean
  /** Selection handler */
  onSelect: () => void
  /** Optional color theme */
  colorClass?: string
  className?: string
}

export function StoryChoiceCard({
  icon,
  label,
  selected = false,
  onSelect,
  colorClass = 'bg-primary-50 dark:bg-primary-950/30',
  className,
}: StoryChoiceCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex min-h-[80px] min-w-[80px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
        'dark:focus:ring-offset-slate-900',
        // Min touch target 48px
        'touch-action-manipulation',
        selected
          ? 'border-primary-500 shadow-md dark:border-primary-400'
          : 'border-slate-200 hover:border-primary-300 dark:border-slate-700 dark:hover:border-primary-600',
        colorClass,
        className
      )}
      role="radio"
      aria-checked={selected}
    >
      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white"
        >
          <Check className="h-3 w-3" />
        </motion.div>
      )}

      {/* Icon */}
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-center text-sm font-semibold leading-tight',
          selected
            ? 'text-primary-700 dark:text-primary-300'
            : 'text-slate-700 dark:text-slate-300'
        )}
      >
        {label}
      </span>
    </motion.button>
  )
}
