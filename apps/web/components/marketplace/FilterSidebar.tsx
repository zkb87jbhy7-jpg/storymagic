'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface FilterValues {
  category: string
  ageRange: string
  language: string
  priceRange: string
  minRating: number
  rhyming: boolean | null
}

interface FilterSidebarProps {
  filters: FilterValues
  onChange: (filters: FilterValues) => void
  className?: string
}

const CATEGORIES = ['adventure', 'educational', 'fantasy', 'bedtime', 'holiday', 'social-emotional'] as const
const AGE_RANGES = ['0-2', '3-5', '6-8', '9-12'] as const
const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'ar'] as const
const PRICE_RANGES = ['free', 'under5', 'under10', 'under20', 'all'] as const
const RATINGS = [4, 3, 2, 1] as const

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between text-start text-sm font-semibold',
          'text-slate-900 dark:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
        )}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform dark:text-slate-500',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ filters, onChange, className }: FilterSidebarProps) {
  const t = useTranslations('marketplace')
  const [mobileOpen, setMobileOpen] = useState(false)

  const update = useCallback(
    (patch: Partial<FilterValues>) => {
      onChange({ ...filters, ...patch })
    },
    [filters, onChange],
  )

  const filterContent = (
    <>
      {/* Category */}
      <FilterSection title={t('filterCategory')}>
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm',
            'text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          )}
        >
          <option value="">{t('allCategories')}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category.${cat}`)}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Age range */}
      <FilterSection title={t('filterAgeRange')}>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() =>
                update({ ageRange: filters.ageRange === range ? '' : range })
              }
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filters.ageRange === range
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              {t(`ageRange.${range}`)}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title={t('filterLanguage')}>
        <select
          value={filters.language}
          onChange={(e) => update({ language: e.target.value })}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm',
            'text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          )}
        >
          <option value="">{t('allLanguages')}</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {t(`language.${lang}`)}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Price range */}
      <FilterSection title={t('filterPrice')}>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <label
              key={range}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="radio"
                name="priceRange"
                value={range}
                checked={filters.priceRange === range}
                onChange={() => update({ priceRange: range })}
                className="text-primary-600 focus:ring-primary-500"
              />
              {t(`priceRange.${range}`)}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title={t('filterRating')}>
        <div className="space-y-1.5">
          {RATINGS.map((stars) => (
            <label
              key={stars}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="radio"
                name="minRating"
                value={stars}
                checked={filters.minRating === stars}
                onChange={() => update({ minRating: stars })}
                className="text-primary-600 focus:ring-primary-500"
              />
              {t('starsAndUp', { count: stars })}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rhyming */}
      <FilterSection title={t('filterRhyming')}>
        <div className="space-y-1.5">
          {[
            { value: null, label: t('rhymingAll') },
            { value: true, label: t('rhymingYes') },
            { value: false, label: t('rhymingNo') },
          ].map((option) => (
            <label
              key={String(option.value)}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="radio"
                name="rhyming"
                checked={filters.rhyming === option.value}
                onChange={() => update({ rhyming: option.value })}
                className="text-primary-600 focus:ring-primary-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium',
          'text-slate-700 transition-colors hover:bg-slate-50',
          'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'lg:hidden',
        )}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {t('filters')}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 start-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('filters')}
              </h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={t('closeFilters')}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block',
          'dark:border-slate-700 dark:bg-slate-800',
          className,
        )}
      >
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('filters')}
        </h2>
        {filterContent}
      </aside>
    </>
  )
}
