'use client'

import { useTranslations } from 'next-intl'

interface StyleCard {
  key: string
  swatch: string
}

const illustrationStyles: StyleCard[] = [
  { key: 'watercolor', swatch: 'bg-blue-200 dark:bg-blue-800' },
  { key: 'comic_book', swatch: 'bg-yellow-300 dark:bg-yellow-700' },
  { key: 'pixar_3d', swatch: 'bg-sky-300 dark:bg-sky-700' },
  { key: 'retro_vintage', swatch: 'bg-amber-200 dark:bg-amber-800' },
  { key: 'minimalist', swatch: 'bg-gray-100 dark:bg-gray-700' },
  { key: 'oil_painting', swatch: 'bg-emerald-300 dark:bg-emerald-800' },
  { key: 'fantasy', swatch: 'bg-purple-300 dark:bg-purple-800' },
  { key: 'manga', swatch: 'bg-pink-200 dark:bg-pink-800' },
  { key: 'classic_storybook', swatch: 'bg-orange-200 dark:bg-orange-800' },
  { key: 'whimsical', swatch: 'bg-teal-200 dark:bg-teal-800' },
]

export default function StyleShowcase() {
  const tLanding = useTranslations('landing')
  const tStyles = useTranslations('bookCreation.styles')

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-800 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {tLanding('showcaseTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {tLanding('showcaseSubtitle')}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {illustrationStyles.map((style) => (
            <div
              key={style.key}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              {/* Color swatch placeholder */}
              <div
                className={`aspect-square ${style.swatch} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
              >
                <span className="text-4xl opacity-40" aria-hidden="true">
                  {'\u2728'}
                </span>
              </div>

              {/* Style name */}
              <div className="px-3 py-3 text-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tStyles(style.key)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
