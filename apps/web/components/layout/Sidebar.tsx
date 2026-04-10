'use client'

import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Users,
  BookPlus,
  Library,
  CloudMoon,
  Store,
  GraduationCap,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

interface NavItem {
  key: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'children', href: '/children', icon: Users },
  { key: 'createBook', href: '/create', icon: BookPlus },
  { key: 'library', href: '/library', icon: Library },
  { key: 'dreams', href: '/dreams', icon: CloudMoon },
  { key: 'marketplace', href: '/marketplace', icon: Store },
  { key: 'classroom', href: '/classroom', icon: GraduationCap },
  { key: 'orders', href: '/orders', icon: ShoppingBag },
  { key: 'settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isOpen, onToggle, className }: SidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-e border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900',
        isOpen ? 'w-64' : 'w-16',
        className
      )}
    >
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

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
                    !isOpen && 'justify-center px-0'
                  )}
                  title={!isOpen ? t(item.key) : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400 dark:text-slate-500'
                    )}
                  />
                  {isOpen && <span>{t(item.key)}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 p-2 dark:border-slate-700">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-center rounded-lg p-2',
            'text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600',
            'dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          ) : (
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          )}
        </button>
      </div>
    </aside>
  )
}
