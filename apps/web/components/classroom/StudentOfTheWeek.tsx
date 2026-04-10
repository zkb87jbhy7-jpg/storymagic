'use client'

import { useTranslations } from 'next-intl'
import { Trophy, BookPlus, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StudentOfTheWeekProps {
  studentName: string
  avatarUrl?: string
  achievement?: string
  onCreateCelebrationBook: () => void
  className?: string
}

export function StudentOfTheWeek({
  studentName,
  avatarUrl,
  achievement,
  onCreateCelebrationBook,
  className,
}: StudentOfTheWeekProps) {
  const t = useTranslations('classroom')

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6',
        'dark:border-amber-800/50 dark:from-amber-900/20 dark:to-orange-900/20',
        className,
      )}
    >
      {/* Decorative trophy */}
      <div className="absolute -end-4 -top-4 opacity-10">
        <Trophy className="h-24 w-24 text-amber-600" aria-hidden="true" />
      </div>

      <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-start">
        {/* Avatar */}
        <div className="mb-4 sm:mb-0 sm:me-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={studentName}
                className="h-20 w-20 rounded-full border-4 border-amber-300 object-cover dark:border-amber-600"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-100 dark:border-amber-600 dark:bg-amber-900/50">
                <User className="h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
            )}
            <div className="absolute -end-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-sm dark:bg-amber-500">
              <Trophy className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {t('studentOfTheWeek')}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {studentName}
          </h3>
          {achievement && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {achievement}
            </p>
          )}

          <button
            type="button"
            onClick={onCreateCelebrationBook}
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
              'bg-amber-500 text-white transition-colors hover:bg-amber-600',
              'dark:bg-amber-600 dark:hover:bg-amber-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            <BookPlus className="h-4 w-4" aria-hidden="true" />
            {t('createCelebrationBook')}
          </button>
        </div>
      </div>
    </div>
  )
}
