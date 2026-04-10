'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StoryPage {
  pageNumber: number
  text: string
}

interface StoryPreviewProps {
  pages: StoryPage[]
  onPageEdit?: (pageNumber: number, newText: string) => void
}

export function StoryPreview({ pages, onPageEdit }: StoryPreviewProps) {
  const t = useTranslations('bookCreation')
  const tCommon = useTranslations('common')
  const [currentPage, setCurrentPage] = useState(0)
  const [editingPage, setEditingPage] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const page = pages[currentPage]
  if (!page) return null

  const handleStartEdit = (pageNumber: number, text: string) => {
    setEditingPage(pageNumber)
    setEditText(text)
  }

  const handleSaveEdit = () => {
    if (editingPage !== null && onPageEdit) {
      onPageEdit(editingPage, editText)
    }
    setEditingPage(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingPage(null)
    setEditText('')
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('preview')}
      </h3>

      {/* Page display */}
      <div
        className={cn(
          'relative min-h-[200px] rounded-xl border p-6',
          'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
        )}
      >
        <div className="mb-3 text-xs font-medium text-slate-400 dark:text-slate-500">
          {currentPage + 1} / {pages.length}
        </div>

        {editingPage === page.pageNumber ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={5}
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2 text-sm',
                'border-slate-300 bg-white text-slate-900',
                'dark:border-slate-600 dark:bg-slate-900 dark:text-white',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
              )}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                  'bg-primary-600 text-white hover:bg-primary-700',
                  'dark:bg-primary-500 dark:hover:bg-primary-600'
                )}
              >
                <Check className="h-4 w-4" />
                {tCommon('save')}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                  'text-slate-600 hover:bg-slate-100',
                  'dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                <X className="h-4 w-4" />
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {page.text}
            </p>
            {onPageEdit && (
              <button
                type="button"
                onClick={() => handleStartEdit(page.pageNumber, page.text)}
                className={cn(
                  'shrink-0 rounded-lg p-1.5 transition-colors',
                  'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
                  'dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300'
                )}
                aria-label={tCommon('edit')}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40',
            'dark:text-slate-300 dark:hover:bg-slate-700'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {tCommon('previous')}
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
          disabled={currentPage === pages.length - 1}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40',
            'dark:text-slate-300 dark:hover:bg-slate-700'
          )}
        >
          {tCommon('next')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
