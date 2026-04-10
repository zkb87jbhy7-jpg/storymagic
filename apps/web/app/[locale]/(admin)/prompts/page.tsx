'use client'

import { useTranslations } from 'next-intl'
import { PromptVersionManager } from '@/components/admin/PromptVersionManager'
import { PromptTestRunner } from '@/components/admin/PromptTestRunner'

export default function PromptsPage() {
  const t = useTranslations('admin.prompts')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t('pageDescription')}
        </p>
      </div>

      <PromptVersionManager />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <PromptTestRunner />
      </div>
    </div>
  )
}
