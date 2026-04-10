'use client'

import { useTranslations } from 'next-intl'
import { LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TemplateCard } from './TemplateCard'
import { EmptyState } from '@/components/shared/EmptyState'

interface Template {
  id: string
  title: string
  coverImageUrl: string
  creatorName: string
  rating: number
  reviewCount: number
  price: number
  currency?: string
}

interface TemplateGridProps {
  templates: Template[]
  onUseTemplate?: (id: string) => void
  isLoading?: boolean
  className?: string
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-7 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

export function TemplateGrid({
  templates,
  onUseTemplate,
  isLoading = false,
  className,
}: TemplateGridProps) {
  const t = useTranslations('marketplace')

  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={LayoutTemplate}
        title={t('noTemplatesFound')}
        description={t('noTemplatesDescription')}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          {...template}
          onUseTemplate={onUseTemplate}
        />
      ))}
    </div>
  )
}
