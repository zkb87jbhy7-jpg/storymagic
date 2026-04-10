'use client'

import { useTranslations } from 'next-intl'
import { School, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TeacherDashboard } from '@/components/classroom/TeacherDashboard'

export default function ClassroomPage() {
  const t = useTranslations('classroom')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <School className="h-5 w-5" aria-hidden="true" />
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
          href="/classroom/register"
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
            'bg-primary-600 text-white transition-colors hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('registerNew')}
        </a>
      </div>

      <TeacherDashboard
        totalClasses={0}
        totalStudents={0}
        totalBooks={0}
        overallConsentRate={0}
        classrooms={[]}
      />
    </div>
  )
}
