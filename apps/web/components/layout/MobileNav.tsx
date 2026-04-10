'use client'

import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  BookPlus,
  Library,
  Store,
  Settings,
} from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface MobileNavProps {
  className?: string
}

interface MobileNavItem {
  key: string
  href: string
  icon: LucideIcon
}

const mobileNavItems: MobileNavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'createBook', href: '/create', icon: BookPlus },
  { key: 'library', href: '/library', icon: Library },
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'settings', href: '/settings', icon: Settings },
]

export function MobileNav({ className }: MobileNavProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t md:hidden',
        'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
        'safe-area-inset-bottom',
        className
      )}
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around px-2 py-1" role="list">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                <span>{t(item.key)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
