'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Store } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SearchBar } from '@/components/marketplace/SearchBar'
import { FilterSidebar, type FilterValues } from '@/components/marketplace/FilterSidebar'
import { TemplateGrid } from '@/components/marketplace/TemplateGrid'

const defaultFilters: FilterValues = {
  category: '',
  ageRange: '',
  language: '',
  priceRange: 'all',
  minRating: 0,
  rhyming: null,
}

export default function MarketplacePage() {
  const t = useTranslations('marketplace')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)

  const handleUseTemplate = useCallback((id: string) => {
    // Navigate to book creation with template preselected
    window.location.href = `/books/create?template=${id}`
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Store className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <a
          href="/marketplace/become-creator"
          className={cn(
            'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold',
            'border-2 border-primary-600 text-primary-600 transition-colors',
            'hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          {t('becomeCreator')}
        </a>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Content area with sidebar */}
      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <main className="min-w-0 flex-1">
          <TemplateGrid
            templates={[]}
            onUseTemplate={handleUseTemplate}
            isLoading={false}
          />
        </main>
      </div>
    </div>
  )
}
