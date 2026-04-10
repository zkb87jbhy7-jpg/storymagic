import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { localeDirection } from '@/i18n/config'
import type { Locale } from '@/i18n/config'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const dir = localeDirection[locale as Locale] ?? 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
