'use client'

import { useTranslations } from 'next-intl'
import { BookPlus, UserPlus, LayoutTemplate, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  labelKey: string
  href: string
  icon: LucideIcon
  color: string
}

const quickActions: QuickAction[] = [
  {
    labelKey: 'createBook',
    href: '/create',
    icon: BookPlus,
    color: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
  },
  {
    labelKey: 'addChild',
    href: '/children/new',
    icon: UserPlus,
    color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300',
  },
  {
    labelKey: 'browseTemplates',
    href: '/templates',
    icon: LayoutTemplate,
    color: 'bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-300',
  },
]

export default function DashboardPage() {
  const tDash = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const tChildren = useTranslations('children')

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome banner */}
      <section className="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {tDash('welcome', { name: 'Parent' })}
        </h1>
        <p className="mt-2 text-primary-100">
          {tDash('createFirstBook')}
        </p>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tDash('quickActions')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            const label =
              action.labelKey === 'addChild'
                ? tChildren('addChild')
                : action.labelKey === 'createBook'
                  ? tNav('createBook')
                  : 'Browse Templates'
            return (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label}
                </span>
              </a>
            )
          })}
        </div>
      </section>

      {/* Recent books / empty state */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tDash('recentBooks')}
        </h2>
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <BookOpen
            className="h-16 w-16 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          />
          <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
            {tDash('noBooks')}
          </p>
          <a
            href="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800"
          >
            <BookPlus className="h-4 w-4" aria-hidden="true" />
            {tDash('createFirstBook')}
          </a>
        </div>
      </section>
    </div>
  )
}
