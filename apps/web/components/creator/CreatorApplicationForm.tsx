'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CreatorApplicationPayload {
  displayName: string
  bio: string
  portfolioLinks: string[]
  termsAgreed: boolean
}

interface CreatorApplicationFormProps {
  onSubmit: (data: CreatorApplicationPayload) => void | Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function CreatorApplicationForm({
  onSubmit,
  isSubmitting = false,
  className,
}: CreatorApplicationFormProps) {
  const t = useTranslations('creator')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])
  const [termsAgreed, setTermsAgreed] = useState(false)

  const addLink = useCallback(() => {
    setPortfolioLinks((prev) => [...prev, ''])
  }, [])

  const removeLink = useCallback((index: number) => {
    setPortfolioLinks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateLink = useCallback((index: number, value: string) => {
    setPortfolioLinks((prev) => prev.map((link, i) => (i === index ? value : link)))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!displayName.trim() || !bio.trim() || !termsAgreed) return
      await onSubmit({
        displayName: displayName.trim(),
        bio: bio.trim(),
        portfolioLinks: portfolioLinks.filter((l) => l.trim()),
        termsAgreed,
      })
    },
    [displayName, bio, portfolioLinks, termsAgreed, onSubmit],
  )

  const inputClass = cn(
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm',
    'text-slate-900 placeholder:text-slate-400',
    'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
    'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
  )

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Display name */}
      <div>
        <label
          htmlFor="creator-display-name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('displayName')}
        </label>
        <input
          id="creator-display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('displayNamePlaceholder')}
          required
          className={cn(inputClass, 'mt-1.5')}
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="creator-bio"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('bio')}
        </label>
        <textarea
          id="creator-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder={t('bioPlaceholder')}
          required
          className={cn(inputClass, 'mt-1.5')}
        />
        <p className="mt-1 text-end text-xs text-slate-500 dark:text-slate-400">
          {bio.length}/500
        </p>
      </div>

      {/* Portfolio links */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('portfolioLinks')}
        </label>
        <div className="mt-1.5 space-y-2">
          {portfolioLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder={t('portfolioLinkPlaceholder')}
                className={inputClass}
              />
              {portfolioLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                  aria-label={t('removeLink')}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLink}
          className={cn(
            'mt-2 inline-flex items-center gap-1.5 text-sm font-medium',
            'text-primary-600 transition-colors hover:text-primary-700',
            'dark:text-primary-400 dark:hover:text-primary-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('addLink')}
        </button>
      </div>

      {/* Terms agreement */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            required
            className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {t('termsAgreement')}
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!displayName.trim() || !bio.trim() || !termsAgreed || isSubmitting}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
          'bg-primary-600 text-white transition-colors hover:bg-primary-700',
          'dark:bg-primary-500 dark:hover:bg-primary-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
        )}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? t('submitting') : t('submitApplication')}
      </button>
    </form>
  )
}
