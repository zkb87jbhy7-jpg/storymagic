'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Star, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ReviewFormProps {
  templateId: string
  onSubmit: (data: { rating: number; text: string }) => void | Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function ReviewForm({
  templateId,
  onSubmit,
  isSubmitting = false,
  className,
}: ReviewFormProps) {
  const t = useTranslations('marketplace')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [text, setText] = useState('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (rating === 0) return
      await onSubmit({ rating, text })
      setRating(0)
      setText('')
    },
    [rating, text, onSubmit],
  )

  const displayRating = hoveredRating || rating

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('writeReview')}
      </h3>

      {/* Star selector */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('yourRating')}
        </label>
        <div
          className="mt-2 flex items-center gap-1"
          role="radiogroup"
          aria-label={t('yourRating')}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={rating === starValue}
                aria-label={t('starRating', { count: starValue })}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                className={cn(
                  'rounded p-0.5 transition-transform hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                )}
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    starValue <= displayRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600',
                  )}
                  aria-hidden="true"
                />
              </button>
            )
          })}
          {rating > 0 && (
            <span className="ms-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Text area */}
      <div className="mt-4">
        <label
          htmlFor={`review-text-${templateId}`}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('reviewText')}
        </label>
        <textarea
          id={`review-text-${templateId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={t('reviewPlaceholder')}
          className={cn(
            'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm',
            'text-slate-900 placeholder:text-slate-400',
            'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
            'dark:focus:border-primary-400',
          )}
        />
      </div>

      {/* Submit */}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
            'bg-primary-600 text-white transition-colors hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-800',
          )}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? t('submitting') : t('submitReview')}
        </button>
      </div>
    </form>
  )
}
