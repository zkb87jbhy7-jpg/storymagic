'use client'

import { useTranslations } from 'next-intl'
import { User, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface Student {
  id: string
  name: string
  consentStatus: 'pending' | 'consented' | 'opted-out'
  parentEmail?: string
}

interface StudentRosterProps {
  students: Student[]
  className?: string
}

const statusConfig = {
  pending: {
    icon: Clock,
    style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  consented: {
    icon: CheckCircle2,
    style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-400',
  },
  'opted-out': {
    icon: XCircle,
    style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-400',
  },
} as const

export function StudentRoster({ students, className }: StudentRosterProps) {
  const t = useTranslations('classroom')

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <User className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('noStudents')}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <table className="w-full min-w-[500px] text-start">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('studentName')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('parentEmail')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('consentStatus')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {students.map((student) => {
            const config = statusConfig[student.consentStatus]
            const StatusIcon = config.icon
            return (
              <tr
                key={student.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                      <User className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {student.parentEmail ?? '-'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      config.style,
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(`consent.${student.consentStatus}`)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
