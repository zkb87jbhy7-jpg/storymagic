'use client'

import { useTranslations } from 'next-intl'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StudentRoster } from '@/components/classroom/StudentRoster'
import { ConsentStatusTable } from '@/components/classroom/ConsentStatusTable'
import { ClassBookCreator } from '@/components/classroom/ClassBookCreator'
import { StudentOfTheWeek } from '@/components/classroom/StudentOfTheWeek'

export default function ClassroomDashboardPage() {
  const t = useTranslations('classroom')

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('classroomDashboard')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('classroomDashboardSubtitle')}
          </p>
        </div>
      </div>

      {/* Student of the Week */}
      <StudentOfTheWeek
        studentName={t('noStudentSelected')}
        onCreateCelebrationBook={() => {
          window.location.href = '/books/create?type=celebration'
        }}
      />

      {/* Tabs-style sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Student roster */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('studentRoster')}
          </h2>
          <StudentRoster students={[]} />
        </section>

        {/* Consent status */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('consentOverview')}
          </h2>
          <ConsentStatusTable entries={[]} />
        </section>
      </div>

      {/* Class book creator */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('createClassBook')}
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <ClassBookCreator
            templates={[]}
            students={[]}
            onCreateBook={async () => {
              // Handle class book creation
            }}
          />
        </div>
      </section>
    </div>
  )
}
