'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StoryChoiceCard } from './StoryChoiceCard'

export interface ChoiceOption {
  id: string
  icon: React.ReactNode
  labelKey: string
  colorClass?: string
}

interface ChoiceGridProps {
  /** 4 options to show */
  options: ChoiceOption[]
  /** Currently selected option id */
  selectedId: string | null
  /** Selection handler */
  onSelect: (id: string) => void
  /** Whether to show "Something else" option */
  showCustomOption?: boolean
  /** Handler for "Something else" */
  onCustomSelect?: () => void
  /** Whether "Something else" is selected */
  isCustomSelected?: boolean
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export function ChoiceGrid({
  options,
  selectedId,
  onSelect,
  showCustomOption = true,
  onCustomSelect,
  isCustomSelected = false,
  className,
}: ChoiceGridProps) {
  const t = useTranslations('coCreation')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // 2x2 on mobile, expand on larger screens
        'grid grid-cols-2 gap-3 sm:gap-4',
        showCustomOption ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => (
        <motion.div key={option.id} variants={itemVariants}>
          <StoryChoiceCard
            icon={option.icon}
            label={t(option.labelKey)}
            selected={selectedId === option.id}
            onSelect={() => onSelect(option.id)}
            colorClass={option.colorClass}
            className="h-full w-full"
          />
        </motion.div>
      ))}

      {showCustomOption && (
        <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1">
          <StoryChoiceCard
            icon={<Lightbulb className="h-8 w-8 text-accent-500" />}
            label={t('somethingElse')}
            selected={isCustomSelected}
            onSelect={() => onCustomSelect?.()}
            colorClass="bg-accent-300/10 dark:bg-accent-400/10"
            className="h-full w-full"
          />
        </motion.div>
      )}
    </motion.div>
  )
}
