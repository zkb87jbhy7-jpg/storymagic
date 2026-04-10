'use client'

import { useTranslations } from 'next-intl'
import { Star, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TemplateCardProps {
  id: string
  title: string
  coverImageUrl: string
  creatorName: string
  rating: number
  reviewCount: number
  price: number
  currency?: string
  onUseTemplate?: (id: string) => void
  className?: string
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating
        return (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              filled
                ? 'fill-amber-400 text-amber-400'
                : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600',
            )}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

export function TemplateCard({
  id,
  title,
  coverImageUrl,
  creatorName,
  rating,
  reviewCount,
  price,
  currency = 'USD',
  onUseTemplate,
  className,
}: TemplateCardProps) {
  const t = useTranslations('marketplace')

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(price)

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      {/* Cover image */}
      <a href={`/marketplace/${id}`} className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coverImageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </a>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <a
          href={`/marketplace/${id}`}
          className="text-sm font-semibold text-slate-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
        >
          <h3 className="line-clamp-2">{title}</h3>
        </a>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('byCreator', { name: creatorName })}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <StarRating rating={rating} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({reviewCount})
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {price === 0 ? t('free') : formattedPrice}
          </span>
          <button
            type="button"
            onClick={() => onUseTemplate?.(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
              'bg-primary-600 text-white transition-colors hover:bg-primary-700',
              'dark:bg-primary-500 dark:hover:bg-primary-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-800',
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            {t('useTemplate')}
          </button>
        </div>
      </div>
    </article>
  )
}
