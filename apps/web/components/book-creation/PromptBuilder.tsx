'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Compass,
  Heart,
  Moon,
  Star,
  Rocket,
  Waves,
  TreePine,
  Building2,
  Cat,
  Users,
  Wand2,
  Shield,
  HandHeart,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type StepKey = 'theme' | 'location' | 'companion' | 'lesson'

interface CardOption {
  key: string
  icon: React.ReactNode
}

const themeOptions: CardOption[] = [
  { key: 'adventure', icon: <Compass className="h-6 w-6" /> },
  { key: 'friendship', icon: <Heart className="h-6 w-6" /> },
  { key: 'holiday', icon: <Star className="h-6 w-6" /> },
  { key: 'bedtime', icon: <Moon className="h-6 w-6" /> },
]

const locationOptions: CardOption[] = [
  { key: 'space', icon: <Rocket className="h-6 w-6" /> },
  { key: 'ocean', icon: <Waves className="h-6 w-6" /> },
  { key: 'forest', icon: <TreePine className="h-6 w-6" /> },
  { key: 'city', icon: <Building2 className="h-6 w-6" /> },
]

const companionOptions: CardOption[] = [
  { key: 'animal', icon: <Cat className="h-6 w-6" /> },
  { key: 'friend', icon: <Users className="h-6 w-6" /> },
  { key: 'magical_creature', icon: <Wand2 className="h-6 w-6" /> },
]

const lessonOptions: CardOption[] = [
  { key: 'courage', icon: <Shield className="h-6 w-6" /> },
  { key: 'sharing', icon: <HandHeart className="h-6 w-6" /> },
  { key: 'patience', icon: <Clock className="h-6 w-6" /> },
]

const builderSteps: { key: StepKey; options: CardOption[] }[] = [
  { key: 'theme', options: themeOptions },
  { key: 'location', options: locationOptions },
  { key: 'companion', options: companionOptions },
  { key: 'lesson', options: lessonOptions },
]

interface PromptBuilderProps {
  value: string
  onChange: (prompt: string) => void
  childName?: string
}

export function PromptBuilder({ value, onChange, childName }: PromptBuilderProps) {
  const t = useTranslations('bookCreation')
  const tBuilder = useTranslations('bookCreation.promptBuilder')

  const [selections, setSelections] = useState<Record<StepKey, string>>({
    theme: '',
    location: '',
    companion: '',
    lesson: '',
  })

  // Compose a prompt from selections
  useEffect(() => {
    const { theme, location, companion, lesson } = selections
    if (!theme && !location && !companion && !lesson) return

    const name = childName || 'the child'
    const parts: string[] = []
    if (theme) parts.push(`A ${theme} story`)
    else parts.push('A story')
    parts[0] += ` about ${name}`
    if (location) parts.push(`set in ${location === 'space' ? 'outer space' : location === 'ocean' ? 'the ocean' : location === 'forest' ? 'an enchanted forest' : 'a magical city'}`)
    if (companion) parts.push(`with a ${companion === 'animal' ? 'friendly animal companion' : companion === 'friend' ? 'best friend' : 'magical creature'}`)
    if (lesson) parts.push(`where they learn about ${lesson}`)

    const composed = parts.join(' ') + '.'
    onChange(composed)
  }, [selections, childName, onChange])

  const handleSelect = (step: StepKey, optionKey: string) => {
    setSelections((prev) => ({
      ...prev,
      [step]: prev[step] === optionKey ? '' : optionKey,
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {tBuilder('title')}
      </h3>

      {builderSteps.map((step) => (
        <div key={step.key} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {tBuilder(step.key)}
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {step.options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(step.key, option.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  selections[step.key] === option.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
                )}
              >
                {option.icon}
                <span className="capitalize">{option.key.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Editable composed prompt */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="composed-prompt"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('writePrompt')}
        </label>
        <textarea
          id="composed-prompt"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('promptPlaceholder')}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
            'border-slate-300 bg-white text-slate-900 placeholder-slate-400',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
            'dark:focus:border-primary-400 dark:focus:ring-primary-400/30',
            'resize-none'
          )}
        />
      </div>
    </div>
  )
}
