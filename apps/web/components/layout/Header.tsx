'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu, X, Sparkles, ChevronDown, LogOut, User } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  onMenuToggle?: () => void
  isSidebarOpen?: boolean
  notificationCount?: number
  onNotificationClick?: () => void
  className?: string
}

export function Header({
  onMenuToggle,
  isSidebarOpen,
  notificationCount = 0,
  onNotificationClick,
  className,
}: HeaderProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center border-b',
        'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-4 sm:px-6">
        {/* Start: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden',
              'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
              'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {tCommon('appName')}
            </span>
          </Link>
        </div>

        {/* End: actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <NotificationBell
            count={notificationCount}
            onClick={onNotificationClick}
          />

          {/* User avatar dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-2 py-1.5',
                  'text-slate-600 transition-colors hover:bg-slate-100',
                  'dark:text-slate-300 dark:hover:bg-slate-800',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    'bg-primary-100 text-primary-700',
                    'dark:bg-primary-900 dark:text-primary-300'
                  )}
                >
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="hidden h-4 w-4 sm:block" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className={cn(
                  'z-50 min-w-[180px] overflow-hidden rounded-lg border p-1 shadow-lg',
                  'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
                  'animate-in fade-in-0 zoom-in-95'
                )}
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm',
                      'text-slate-700 outline-none transition-colors',
                      'hover:bg-slate-100 focus:bg-slate-100',
                      'dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:bg-slate-700'
                    )}
                  >
                    <User className="h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-700" />

                <DropdownMenu.Item
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm',
                    'text-red-600 outline-none transition-colors',
                    'hover:bg-red-50 focus:bg-red-50',
                    'dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {tAuth('logout')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}
