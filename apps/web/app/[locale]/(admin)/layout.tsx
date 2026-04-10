'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  LineChart,
  Shield,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AdminNavItem {
  key: string
  href: string
  icon: LucideIcon
}

const adminNavItems: AdminNavItem[] = [
  { key: 'prompts', href: '/prompts', icon: FileText },
  { key: 'quality', href: '/quality', icon: BarChart3 },
  { key: 'analytics', href: '/analytics', icon: LineChart },
  { key: 'moderation', href: '/moderation', icon: Shield },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('admin.nav')
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside
        className={cn(
          'hidden w-64 shrink-0 flex-col border-e border-slate-200 bg-slate-50 lg:flex',
          'dark:border-slate-700 dark:bg-slate-900',
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-700">
          <LayoutDashboard
            className="h-5 w-5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t('adminPanel')}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1" role="list">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.includes(item.href)

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                      aria-hidden="true"
                    />
                    <span>{t(item.key)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* System health link */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <Link
            href="/admin/health"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
              'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            )}
          >
            <Activity className="h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            {t('systemHealth')}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white p-6 dark:bg-slate-900 lg:p-8">
        {children}
      </main>
    </div>
  )
}
