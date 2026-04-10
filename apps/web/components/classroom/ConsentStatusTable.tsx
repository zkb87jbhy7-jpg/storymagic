'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, XCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConsentEntry {
  studentId: string
  studentName: string
  parentName: string
  parentEmail: string
  status: 'pending' | 'consented' | 'opted-out'
  sentAt: string
  respondedAt?: string
}

interface ConsentStatusTableProps {
  entries: ConsentEntry[]
  onResend?: (studentId: string) => void
  className?: string
}

const statusConfig = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  consented: {
    icon: CheckCircle2,
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
  },
  'opted-out': {
    icon: XCircle,
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
  },
} as const

export function ConsentStatusTable({
  entries,
  onResend,
  className,
}: ConsentStatusTableProps) {
  const t = useTranslations('classroom')

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <table className="w-full min-w-[700px] text-start">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('student')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('parent')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('status')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('sentAt')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {entries.map((entry) => {
            const config = statusConfig[entry.status]
            const StatusIcon = config.icon
            return (
              <tr
                key={entry.studentId}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">
                  {entry.studentName}
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {entry.parentName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entry.parentEmail}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      config.bg,
                      config.text,
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(`consent.${entry.status}`)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                  <time dateTime={entry.sentAt}>
                    {new Date(entry.sentAt).toLocaleDateString()}
                  </time>
                </td>
                <td className="px-5 py-3">
                  {entry.status === 'pending' && onResend && (
                    <button
                      type="button"
                      onClick={() => onResend(entry.studentId)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                        'text-primary-600 transition-colors hover:bg-primary-50',
                        'dark:text-primary-400 dark:hover:bg-primary-900/20',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                      )}
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('resendConsent')}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
