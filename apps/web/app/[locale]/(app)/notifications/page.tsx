'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import {
  Bell,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Check,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---- Types ---------------------------------------------------------------

type NotificationType = 'book' | 'payment' | 'security' | 'ai' | 'general'

interface Notification {
  id: string
  type: NotificationType
  titleKey: string
  bodyKey: string
  timestamp: string
  read: boolean
}

// ---- Config --------------------------------------------------------------

const TYPE_CONFIG: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  book: {
    icon: BookOpen,
    color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  },
  payment: {
    icon: CreditCard,
    color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  security: {
    icon: ShieldCheck,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  ai: {
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  general: {
    icon: Bell,
    color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
}

// ---- Mock data -----------------------------------------------------------

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'book',
    titleKey: 'bookReady',
    bodyKey: 'bookReadyBody',
    timestamp: '2025-01-20T14:30:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    titleKey: 'paymentSuccess',
    bodyKey: 'paymentSuccessBody',
    timestamp: '2025-01-19T10:00:00Z',
    read: false,
  },
  {
    id: '3',
    type: 'security',
    titleKey: 'newLogin',
    bodyKey: 'newLoginBody',
    timestamp: '2025-01-18T08:15:00Z',
    read: true,
  },
  {
    id: '4',
    type: 'ai',
    titleKey: 'generationComplete',
    bodyKey: 'generationCompleteBody',
    timestamp: '2025-01-17T16:45:00Z',
    read: true,
  },
]

// ---- Component -----------------------------------------------------------

export default function NotificationsPage() {
  const t = useTranslations('notifications')
  const tCommon = useTranslations('common')
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {unreadCount} {t('unread')}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-sm font-medium text-primary-600 transition-colors',
              'hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {t('markAllRead')}
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <Bell
            className="h-16 w-16 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          />
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
            {t('empty')}
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type]
            const Icon = config.icon

            return (
              <li
                key={notification.id}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-colors',
                  notification.read
                    ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                    : 'border-primary-200 bg-primary-50/30 dark:border-primary-800 dark:bg-primary-900/10',
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    config.color,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        notification.read
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-900 dark:text-white',
                      )}
                    >
                      {t(notification.titleKey)}
                    </p>
                    {!notification.read && (
                      <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {t(notification.bodyKey)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                      title={t('markRead')}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dismiss(notification.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                    title={tCommon('delete')}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
