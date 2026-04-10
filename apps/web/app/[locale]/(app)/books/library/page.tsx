'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { BookPlus, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { FamilyBookshelf } from '@/components/library/FamilyBookshelf'
import { StoryWorldMap } from '@/components/library/StoryWorldMap'
import { LibraryViewToggle, type LibraryView } from '@/components/library/LibraryViewToggle'
import { ReadingCornerBackground } from '@/components/library/ReadingCornerBackground'
import { SeasonalBookshelfTheme } from '@/components/library/SeasonalBookshelfTheme'
import type { BookSpineData } from '@/components/library/BookSpine'

// Mock book data
const MOCK_BOOKS: BookSpineData[] = [
  { id: '1', title: 'The Enchanted Forest', childName: 'Mika', style: 'watercolor', isLiving: true, createdAt: '2025-12-10' },
  { id: '2', title: 'Space Adventure', childName: 'Mika', style: 'pixar_3d', createdAt: '2025-12-08' },
  { id: '3', title: 'The Brave Knight', childName: 'Noa', style: 'fantasy', createdAt: '2025-12-05' },
  { id: '4', title: 'Ocean Explorers', childName: 'Mika', style: 'comic_book', createdAt: '2025-11-30' },
  { id: '5', title: 'The Magical Garden', childName: 'Noa', style: 'oil_painting', isLiving: true, createdAt: '2025-11-28' },
  { id: '6', title: 'Robot Friends', childName: 'Mika', style: 'minimalist', createdAt: '2025-11-25' },
  { id: '7', title: 'Samurai Cat', childName: 'Noa', style: 'manga', createdAt: '2025-11-20' },
  { id: '8', title: 'Once Upon a Cloud', childName: 'Mika', style: 'classic_storybook', createdAt: '2025-11-15' },
  { id: '9', title: 'The Dancing Stars', childName: 'Noa', style: 'whimsical', createdAt: '2025-11-10' },
  { id: '10', title: 'Vintage Voyage', childName: 'Mika', style: 'retro_vintage', createdAt: '2025-11-05' },
  { id: '11', title: 'Dreamland Express', childName: 'Noa', style: 'dreamscape', createdAt: '2025-10-30' },
  { id: '12', title: 'The Little Explorer', childName: 'Mika', style: 'watercolor', createdAt: '2025-10-25' },
]

export default function LibraryPage() {
  const t = useTranslations('library')

  const [view, setView] = useState<LibraryView>('shelf')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBooks = MOCK_BOOKS.filter(
    (book) =>
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.childName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBookClick = useCallback((bookId: string) => {
    // Navigate to reader
    window.location.href = `/books/${bookId}/read`
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header with reading corner background */}
      <ReadingCornerBackground className="px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {t('pageTitle')}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t('bookCount', { count: filteredBooks.length })}
            </p>
          </div>

          <a
            href="/books/create"
            className={cn(
              'flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md',
              'bg-gradient-to-r from-primary-500 to-secondary-500',
              'transition-shadow hover:shadow-lg'
            )}
          >
            <BookPlus className="h-4 w-4" />
            {t('createNew')}
          </a>
        </div>
      </ReadingCornerBackground>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchBooks')}
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-white py-2 ps-9 pe-3 text-sm',
              'text-slate-900 placeholder:text-slate-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200',
              'dark:border-slate-700 dark:bg-slate-800 dark:text-white',
              'dark:focus:border-primary-500 dark:focus:ring-primary-800'
            )}
          />
        </div>

        {/* View toggle */}
        <LibraryViewToggle view={view} onChange={setView} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'shelf' ? (
          <motion.div
            key="shelf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SeasonalBookshelfTheme>
              <FamilyBookshelf books={filteredBooks} onBookClick={handleBookClick} />
            </SeasonalBookshelfTheme>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StoryWorldMap books={filteredBooks} onBookClick={handleBookClick} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredBooks.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {searchQuery ? t('noSearchResults') : t('emptyLibrary')}
          </p>
          {!searchQuery && (
            <a
              href="/books/create"
              className="mt-4 inline-flex items-center gap-2 text-primary-500 underline hover:text-primary-600"
            >
              <BookPlus className="h-4 w-4" />
              {t('createFirst')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
