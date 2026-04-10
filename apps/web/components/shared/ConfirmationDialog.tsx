'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  variant?: 'default' | 'danger'
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
}: ConfirmationDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed start-1/2 top-1/2 z-50 w-full max-w-md',
            '-translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
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
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </Dialog.Title>

          {/* Description */}
          {description && (
            <Dialog.Description className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </Dialog.Description>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-4 py-2',
                'text-sm font-medium transition-colors',
                'border border-slate-300 bg-white text-slate-700',
                'hover:bg-slate-50',
                'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
                'dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-4 py-2',
                'text-sm font-medium text-white transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
