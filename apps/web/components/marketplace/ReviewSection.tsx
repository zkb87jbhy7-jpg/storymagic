'use client'

import { useTranslations } from 'next-intl'
import { Star, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Review {
  id: string
  authorName: string
  rating: number
  date: string
  text: string
}

interface ReviewSectionProps {
  reviews: Review[]
  averageRating: number
  totalCount: number
  className?: string
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const t = useTranslations('marketplace')
  const total = reviews.length || 1
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.floor(r.rating) === stars).length,
  }))

  return (
    <div className="space-y-1.5">
      {counts.map(({ stars, count }) => (
        <div key={stars} className="flex items-center gap-2 text-sm">
          <span className="w-8 text-end text-slate-600 dark:text-slate-400">
            {stars}
          </span>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <span className="w-8 text-start text-xs text-slate-500 dark:text-slate-400">
            {count}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReviewSection({
  reviews,
  averageRating,
  totalCount,
  className,
}: ReviewSectionProps) {
  const t = useTranslations('marketplace')

  return (
    <section className={cn('space-y-6', className)}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {t('reviews')}
      </h2>

      {/* Average rating summary */}
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">
            {averageRating.toFixed(1)}
          </span>
          <StarDisplay rating={averageRating} size="md" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t('reviewCount', { count: totalCount })}
          </span>
        </div>
        <div className="flex-1">
          <RatingBreakdown reviews={reviews} />
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <MessageSquare
            className="h-10 w-10 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {t('noReviews')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {review.authorName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    <time
                      dateTime={review.date}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {new Date(review.date).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {review.text}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
