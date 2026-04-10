'use client'

import { Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface NotificationBellProps {
  count?: number
  onClick?: () => void
  className?: string
}

export function NotificationBell({ count = 0, onClick, className }: NotificationBellProps) {
  const t = useTranslations('nav')

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg',
        'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
        'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className
      )}
      aria-label={t('notifications')}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className={cn(
            'absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center',
            'rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'
          )}
          aria-label={`${count}`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
