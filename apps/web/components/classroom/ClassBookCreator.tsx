'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, Users, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StudentCharacter {
  id: string
  name: string
  avatarUrl?: string
}

interface Template {
  id: string
  title: string
  coverUrl?: string
}

interface ClassBookCreatorProps {
  templates: Template[]
  students: StudentCharacter[]
  onCreateBook: (templateId: string, studentIds: string[]) => void | Promise<void>
  className?: string
}

export function ClassBookCreator({
  templates,
  students,
  onCreateBook,
  className,
}: ClassBookCreatorProps) {
  const t = useTranslations('classroom')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(students.map((s) => s.id)),
  )
  const [isCreating, setIsCreating] = useState(false)

  const toggleStudent = useCallback((id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedStudents(new Set(students.map((s) => s.id)))
  }, [students])

  const handleCreate = useCallback(async () => {
    if (!selectedTemplate || selectedStudents.size === 0) return
    setIsCreating(true)
    try {
      await onCreateBook(selectedTemplate, Array.from(selectedStudents))
    } finally {
      setIsCreating(false)
    }
  }, [selectedTemplate, selectedStudents, onCreateBook])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Template selection */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {t('selectTemplate')}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                'flex flex-col items-center rounded-xl border p-3 transition-all',
                selectedTemplate === template.id
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:bg-primary-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                {template.coverUrl ? (
                  <img
                    src={template.coverUrl}
                    alt={template.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-500" aria-hidden="true" />
                  </div>
                )}
              </div>
              <span className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {template.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Student selection */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Users className="h-4 w-4" aria-hidden="true" />
            {t('selectStudents')}
          </h3>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
          >
            {t('selectAll')}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {students.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => toggleStudent(student.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedStudents.has(student.id)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600">
                  <span className="text-[10px] font-bold">{student.name[0]}</span>
                </div>
              )}
              {student.name}
            </button>
          ))}
        </div>
      </section>

      {/* Preview + create */}
      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('selectedCount', { count: selectedStudents.size, total: students.length })}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!selectedTemplate || selectedStudents.size === 0}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium',
              'border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50',
              'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {t('preview')}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!selectedTemplate || selectedStudents.size === 0 || isCreating}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
              'bg-primary-600 text-white transition-colors hover:bg-primary-700',
              'dark:bg-primary-500 dark:hover:bg-primary-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isCreating ? t('creating') : t('createClassBook')}
          </button>
        </div>
      </div>
    </div>
  )
}
