'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PenTool, Upload, X, Type } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DedicationEditorProps {
  value: string
  onChange: (value: string) => void
  onImageUpload?: (file: File) => void
  handwrittenImageUrl?: string
  onRemoveImage?: () => void
  maxLength?: number
  className?: string
}

export function DedicationEditor({
  value,
  onChange,
  onImageUpload,
  handwrittenImageUrl,
  onRemoveImage,
  maxLength = 500,
  className,
}: DedicationEditorProps) {
  const t = useTranslations('orders')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'text' | 'handwritten'>('text')

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onImageUpload) {
        onImageUpload(file)
      }
    },
    [onImageUpload],
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <PenTool className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('dedication')}
        </h3>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            mode === 'text'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          <Type className="h-3.5 w-3.5" aria-hidden="true" />
          {t('typedDedication')}
        </button>
        <button
          type="button"
          onClick={() => setMode('handwritten')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            mode === 'handwritten'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
          {t('handwrittenDedication')}
        </button>
      </div>

      {mode === 'text' ? (
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            rows={4}
            placeholder={t('dedicationPlaceholder')}
            className={cn(
              'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm',
              'text-slate-900 placeholder:text-slate-400',
              'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
            )}
          />
          <p className="mt-1 text-end text-xs text-slate-500 dark:text-slate-400">
            {value.length}/{maxLength}
          </p>
        </div>
      ) : (
        <div>
          {handwrittenImageUrl ? (
            <div className="relative rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <img
                src={handwrittenImageUrl}
                alt={t('handwrittenDedication')}
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
              {onRemoveImage && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className={cn(
                    'absolute end-2 top-2 rounded-full bg-red-100 p-1.5 text-red-600 transition-colors',
                    'hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                  )}
                  aria-label={t('removeImage')}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 p-8',
                'text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600',
                'dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-500 dark:hover:text-primary-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <Upload className="h-8 w-8" aria-hidden="true" />
              <span className="text-sm font-medium">{t('uploadHandwritten')}</span>
              <span className="text-xs">{t('uploadFormats')}</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label={t('uploadHandwritten')}
          />
        </div>
      )}
    </div>
  )
}
