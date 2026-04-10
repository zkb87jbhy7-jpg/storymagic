'use client'

import { useTranslations } from 'next-intl'
import { User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Link } from '@/i18n/navigation'

interface ChildProfile {
  id: string
  name: string
  age: number
  avatarUrl?: string | null
}

interface ChildSelectorProps {
  children: ChildProfile[]
  selectedId: string | null
  onSelect: (id: string, name: string, age: number) => void
}

export function ChildSelector({
  children,
  selectedId,
  onSelect,
}: ChildSelectorProps) {
  const t = useTranslations('bookCreation')
  const tChildren = useTranslations('children')

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('selectChild')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => onSelect(child.id, child.name, child.age)}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-start transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
              selectedId === child.id
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/30 dark:border-primary-400 dark:bg-primary-900/20 dark:ring-primary-400/30'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
            )}
          >
            {child.avatarUrl ? (
              <img
                src={child.avatarUrl}
                alt={child.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                )}
              >
                <User className="h-6 w-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span
                className={cn(
                  'font-semibold',
                  selectedId === child.id
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-slate-900 dark:text-white'
                )}
              >
                {child.name}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {child.age}
              </span>
            </div>
            {/* Radio indicator */}
            <div className="ms-auto">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  selectedId === child.id
                    ? 'border-primary-500 dark:border-primary-400'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {selectedId === child.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Add New Child */}
        <Link
          href="/children"
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 transition-all duration-200',
            'border-slate-300 text-slate-500 hover:border-primary-400 hover:text-primary-600',
            'dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-500 dark:hover:text-primary-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900'
          )}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">{tChildren('addChild')}</span>
        </Link>
      </div>
    </div>
  )
}
