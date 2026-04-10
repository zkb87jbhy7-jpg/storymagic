'use client'

import { useTranslations } from 'next-intl'
import {
  Users,
  BookOpen,
  ShieldCheck,
  School,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ClassroomOverview {
  id: string
  name: string
  grade: string
  studentCount: number
  bookCount: number
  consentRate: number
}

interface TeacherDashboardProps {
  totalClasses: number
  totalStudents: number
  totalBooks: number
  overallConsentRate: number
  classrooms: ClassroomOverview[]
  className?: string
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          color,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function ConsentRateBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            rate >= 80
              ? 'bg-green-500'
              : rate >= 50
                ? 'bg-amber-500'
                : 'bg-red-500',
          )}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {rate}%
      </span>
    </div>
  )
}

export function TeacherDashboard({
  totalClasses,
  totalStudents,
  totalBooks,
  overallConsentRate,
  classrooms,
  className,
}: TeacherDashboardProps) {
  const t = useTranslations('classroom')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('classes')}
          value={totalClasses}
          icon={School}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label={t('students')}
          value={totalStudents}
          icon={Users}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          label={t('booksCreated')}
          value={totalBooks}
          icon={BookOpen}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          label={t('consentRate')}
          value={`${overallConsentRate}%`}
          icon={ShieldCheck}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Classrooms list */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('yourClassrooms')}
        </h2>
        {classrooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
            <School className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {t('noClassrooms')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {classrooms.map((classroom) => (
              <a
                key={classroom.id}
                href={`/classroom/${classroom.id}`}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
                  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  'dark:border-slate-700 dark:bg-slate-800',
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <School className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {classroom.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t('gradeWithStudents', {
                      grade: classroom.grade,
                      count: classroom.studentCount,
                    })}
                  </p>
                  <div className="mt-2 max-w-xs">
                    <ConsentRateBar rate={classroom.consentRate} />
                  </div>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
