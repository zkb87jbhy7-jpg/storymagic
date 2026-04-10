import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('common')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary-600">
      <h1 className="text-5xl font-bold text-white">{t('appName')}</h1>
      <p className="mt-4 text-xl text-primary-100">
        AI-powered personalized children&apos;s books
      </p>
    </main>
  )
}
