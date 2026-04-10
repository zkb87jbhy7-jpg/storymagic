'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, ArrowUpCircle, RotateCcw, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type PromptStatus = 'draft' | 'testing' | 'active' | 'archived'

interface PromptVersion {
  id: string
  key: string
  version: number
  status: PromptStatus
  updatedAt: string
  author: string
}

const STATUS_STYLES: Record<PromptStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  testing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

// Mock data — replaced by API calls in production
const MOCK_PROMPTS: PromptVersion[] = [
  { id: '1', key: 'story.generate', version: 3, status: 'active', updatedAt: '2025-01-15', author: 'Admin' },
  { id: '2', key: 'story.generate', version: 4, status: 'testing', updatedAt: '2025-01-18', author: 'Admin' },
  { id: '3', key: 'image.character', version: 2, status: 'active', updatedAt: '2025-01-10', author: 'Designer' },
  { id: '4', key: 'image.background', version: 1, status: 'draft', updatedAt: '2025-01-20', author: 'Designer' },
  { id: '5', key: 'quiz.generate', version: 1, status: 'archived', updatedAt: '2024-12-01', author: 'Admin' },
]

export function PromptVersionManager() {
  const t = useTranslations('admin.prompts')
  const tCommon = useTranslations('common')
  const [prompts] = useState<PromptVersion[]>(MOCK_PROMPTS)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('title')}
        </h2>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2',
            'text-sm font-medium text-white transition-colors',
            'bg-primary-600 hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('createVersion')}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('key')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('version')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {tCommon('status')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('updatedAt')}
              </th>
              <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-900 dark:text-white">
                  {prompt.key}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  v{prompt.version}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      STATUS_STYLES[prompt.status],
                    )}
                  >
                    {t(`status_${prompt.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {prompt.updatedAt}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {prompt.status === 'testing' && (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        title={t('promote')}
                      >
                        <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    {prompt.status === 'active' && (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        title={t('rollback')}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                      title={tCommon('more')}
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
