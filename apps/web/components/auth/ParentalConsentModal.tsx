'use client'

import { useTranslations } from 'next-intl'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import BiometricConsentDisclosure from './BiometricConsentDisclosure'

interface ParentalConsentModalProps {
  open: boolean
  onClose: () => void
  onAgree: () => void
}

/**
 * Modal dialog (Radix UI) that must be shown before any face-related features
 * are enabled. Contains the full COPPA 2025 biometric disclosure text and
 * requires explicit parental agreement.
 */
export default function ParentalConsentModal({
  open,
  onClose,
  onAgree,
}: ParentalConsentModalProps) {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />

        {/* Content */}
        <Dialog.Content
          className={cn(
            'fixed start-1/2 top-1/2 z-50 w-full max-w-lg',
            '-translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
            'max-h-[85vh] overflow-y-auto',
            'rounded-xl border border-slate-200 bg-white p-6 shadow-xl',
            'dark:border-slate-700 dark:bg-slate-900',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className={cn(
                'absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md',
                'text-slate-400 transition-colors hover:text-slate-600',
                'dark:text-slate-500 dark:hover:text-slate-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
              aria-label={tCommon('close')}
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                'bg-amber-100 text-amber-700',
                'dark:bg-amber-900/40 dark:text-amber-400'
              )}
            >
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('parentalConsent')}
            </Dialog.Title>
          </div>

          <Dialog.Description className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('biometricDisclosure')}
          </Dialog.Description>

          {/* Disclosure content */}
          <div className="mt-5">
            <BiometricConsentDisclosure />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-5 py-2.5',
                'text-sm font-medium transition-colors',
                'border border-slate-300 bg-white text-slate-700',
                'hover:bg-slate-50',
                'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
                'dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="button"
              onClick={onAgree}
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-5 py-2.5',
                'text-sm font-semibold text-white transition-colors',
                'bg-primary-600 hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900'
              )}
            >
              {t('iAgree')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
