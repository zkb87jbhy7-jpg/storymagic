'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { School, Users, GraduationCap, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ClassroomRegistrationPayload {
  schoolName: string
  grade: string
  studentCount: number
}

interface ClassroomRegistrationProps {
  onSubmit: (data: ClassroomRegistrationPayload) => void | Promise<void>
  isSubmitting?: boolean
  className?: string
}

const GRADES = ['pre-k', 'k', '1', '2', '3', '4', '5', '6'] as const

export function ClassroomRegistration({
  onSubmit,
  isSubmitting = false,
  className,
}: ClassroomRegistrationProps) {
  const t = useTranslations('classroom')
  const [schoolName, setSchoolName] = useState('')
  const [grade, setGrade] = useState('')
  const [studentCount, setStudentCount] = useState<number | ''>('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!schoolName.trim() || !grade || !studentCount) return
      await onSubmit({
        schoolName: schoolName.trim(),
        grade,
        studentCount: Number(studentCount),
      })
    },
    [schoolName, grade, studentCount, onSubmit],
  )

  const inputClass = cn(
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm',
    'text-slate-900 placeholder:text-slate-400',
    'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
    'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
  )

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* School name */}
      <div>
        <label
          htmlFor="school-name"
          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <School className="h-4 w-4" aria-hidden="true" />
          {t('schoolName')}
        </label>
        <input
          id="school-name"
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder={t('schoolNamePlaceholder')}
          required
          className={cn(inputClass, 'mt-1.5')}
        />
      </div>

      {/* Grade */}
      <div>
        <label
          htmlFor="grade-select"
          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          {t('grade')}
        </label>
        <select
          id="grade-select"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          className={cn(inputClass, 'mt-1.5')}
        >
          <option value="">{t('selectGrade')}</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {t(`gradeOption.${g}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Student count */}
      <div>
        <label
          htmlFor="student-count"
          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          {t('studentCount')}
        </label>
        <input
          id="student-count"
          type="number"
          min={1}
          max={50}
          value={studentCount}
          onChange={(e) =>
            setStudentCount(e.target.value ? Number(e.target.value) : '')
          }
          placeholder={t('studentCountPlaceholder')}
          required
          className={cn(inputClass, 'mt-1.5')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!schoolName.trim() || !grade || !studentCount || isSubmitting}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
          'bg-primary-600 text-white transition-colors hover:bg-primary-700',
          'dark:bg-primary-500 dark:hover:bg-primary-600',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
        )}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? t('registering') : t('registerClassroom')}
      </button>
    </form>
  )
}
