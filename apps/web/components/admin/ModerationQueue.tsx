'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, Filter, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ---- Types ---------------------------------------------------------------

type ItemType = 'book' | 'image' | 'review'
type Priority = 'low' | 'medium' | 'high' | 'critical'

interface ModerationItem {
  id: string
  type: ItemType
  title: string
  submittedAt: string
  priority: Priority
  author: string
}

// ---- Mock data -----------------------------------------------------------

const MOCK_ITEMS: ModerationItem[] = [
  { id: '1', type: 'book', title: 'Space Adventure', submittedAt: '2025-01-20 14:30', priority: 'high', author: 'user123' },
  { id: '2', type: 'image', title: 'Character portrait', submittedAt: '2025-01-20 13:15', priority: 'critical', author: 'user456' },
  { id: '3', type: 'review', title: 'Product review', submittedAt: '2025-01-20 12:00', priority: 'low', author: 'user789' },
  { id: '4', type: 'book', title: 'Dragon Story', submittedAt: '2025-01-19 18:45', priority: 'medium', author: 'user321' },
  { id: '5', type: 'image', title: 'Background scene', submittedAt: '2025-01-19 16:20', priority: 'low', author: 'user654' },
]

// ---- Styles --------------------------------------------------------------

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const TYPE_STYLES: Record<ItemType, string> = {
  book: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  image: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  review: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
}

// ---- Component -----------------------------------------------------------

export function ModerationQueue() {
  const t = useTranslations('admin.moderation')
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  const filteredItems = MOCK_ITEMS.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('title')}
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {filteredItems.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | 'all')}
            className={cn(
              'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm',
              'text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            )}
            aria-label={t('filterByType')}
          >
            <option value="all">{t('allTypes')}</option>
            <option value="book">{t('type_book')}</option>
            <option value="image">{t('type_image')}</option>
            <option value="review">{t('type_review')}</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className={cn(
              'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm',
              'text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            )}
            aria-label={t('filterByPriority')}
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="critical">{t('priority_critical')}</option>
            <option value="high">{t('priority_high')}</option>
            <option value="medium">{t('priority_medium')}</option>
            <option value="low">{t('priority_low')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('itemType')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('titleColumn')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('submittedDate')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('priority')}
              </th>
              <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      TYPE_STYLES[item.type],
                    )}
                  >
                    {t(`type_${item.type}`)}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {item.title}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {item.submittedAt}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      PRIORITY_STYLES[item.priority],
                    )}
                  >
                    {t(`priority_${item.priority}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-end">
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
                      'text-xs font-medium text-primary-600 transition-colors',
                      'hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('review')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
