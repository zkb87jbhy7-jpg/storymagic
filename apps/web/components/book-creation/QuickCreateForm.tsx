'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { IllustrationStyle } from '@/hooks/useBookGeneration'

function getStyleByAge(age: number): IllustrationStyle {
  if (age >= 2 && age <= 4) return 'whimsical'
  if (age >= 5 && age <= 7) return 'classic_storybook'
  if (age >= 8 && age <= 10) return 'comic_book'
  return 'classic_storybook'
}

export function QuickCreateForm() {
  const t = useTranslations('bookCreation')
  const tCommon = useTranslations('common')
  const tChildren = useTranslations('children')

  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState(5)
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!childName.trim() || !prompt.trim()) return

      setIsSubmitting(true)

      try {
        const style = getStyleByAge(childAge)

        const response = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            child_name: childName.trim(),
            child_age: childAge,
            prompt: prompt.trim(),
            style,
            mood: 'happy',
            language: 'he',
            page_count: 12,
            rhyming: false,
            bilingual: false,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create book')
        }

        const data = await response.json()
        // Navigate to magic moment page with book id
        window.location.href = `/books/${data.id}/magic`
      } catch {
        // Error handling would go here
      } finally {
        setIsSubmitting(false)
      }
    },
    [childName, childAge, prompt]
  )

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('quickCreate')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          3 simple questions and your book is ready
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Child Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quick-child-name"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {tChildren('name')}
          </label>
          <input
            id="quick-child-name"
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            required
            className={cn(
              'h-10 rounded-lg border px-3 text-sm transition-colors',
              'border-slate-300 bg-white text-slate-900 placeholder-slate-400',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/30'
            )}
          />
        </div>

        {/* Child Age */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quick-child-age"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Age
          </label>
          <input
            id="quick-child-age"
            type="number"
            min={2}
            max={12}
            value={childAge}
            onChange={(e) => setChildAge(Number(e.target.value))}
            required
            className={cn(
              'h-10 w-24 rounded-lg border px-3 text-sm transition-colors',
              'border-slate-300 bg-white text-slate-900',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/30'
            )}
          />
        </div>

        {/* Story Prompt */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quick-prompt"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('writePrompt')}
          </label>
          <textarea
            id="quick-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('promptPlaceholder')}
            required
            className={cn(
              'w-full resize-none rounded-lg border px-3 py-2 text-sm transition-colors',
              'border-slate-300 bg-white text-slate-900 placeholder-slate-400',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/30'
            )}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !childName.trim() || !prompt.trim()}
          className={cn(
            'inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-semibold transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          {isSubmitting ? t('generating') : `${tCommon('create')} Book`}
        </button>
      </form>
    </div>
  )
}
