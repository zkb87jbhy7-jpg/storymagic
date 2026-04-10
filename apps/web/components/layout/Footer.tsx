'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils/cn'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')

  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { key: 'about' as const, href: '/about' },
    { key: 'privacy' as const, href: '/privacy' },
    { key: 'terms' as const, href: '/terms' },
    { key: 'contact' as const, href: '/contact' },
  ]

  return (
    <footer
      className={cn(
        'border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Links */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-slate-500 transition-colors',
                      'hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    )}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language switcher + copyright */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <LanguageSwitcher />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              &copy; {currentYear} {tCommon('appName')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
