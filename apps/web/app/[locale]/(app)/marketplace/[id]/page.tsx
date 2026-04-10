'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  User,
  Calendar,
  Globe,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ReviewSection } from '@/components/marketplace/ReviewSection'
import { ReviewForm } from '@/components/marketplace/ReviewForm'

export default function TemplateDetailPage() {
  const t = useTranslations('marketplace')
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const handleReviewSubmit = useCallback(
    async (data: { rating: number; text: string }) => {
      setIsSubmittingReview(true)
      try {
        await fetch(`/api/marketplace/${templateId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } finally {
        setIsSubmittingReview(false)
      }
    },
    [templateId],
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-medium',
          'text-slate-600 transition-colors hover:text-slate-900',
          'dark:text-slate-400 dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('backToMarketplace')}
      </button>

      {/* Template header */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Cover image */}
        <div className="lg:col-span-2">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-full items-center justify-center">
              <BookOpen
                className="h-16 w-16 text-slate-300 dark:text-slate-600"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Template info */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {t('templatePlaceholderTitle')}
          </h1>

          {/* Creator info */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
              <User className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {t('creatorPlaceholder')}
            </span>
          </div>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < 4
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600',
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              4.0 (0 {t('reviews')})
            </span>
          </div>

          {/* Meta info */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t('ageRange.3-5')}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Globe className="h-4 w-4" aria-hidden="true" />
              {t('language.en')}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('free')}
            </span>
            <button
              type="button"
              onClick={() => {
                window.location.href = `/books/create?template=${templateId}`
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
                'bg-primary-600 text-white transition-colors hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
              )}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {t('useTemplate')}
            </button>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('description')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t('templatePlaceholderDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <ReviewSection
        reviews={[]}
        averageRating={0}
        totalCount={0}
      />

      {/* Review form */}
      <ReviewForm
        templateId={templateId}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </div>
  )
}
