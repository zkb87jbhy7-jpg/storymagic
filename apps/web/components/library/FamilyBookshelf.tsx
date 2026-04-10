'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { BookshelfShelf } from './BookshelfShelf'
import type { BookSpineData } from './BookSpine'

const BOOKS_PER_SHELF = 8

interface FamilyBookshelfProps {
  books: BookSpineData[]
  onBookClick?: (bookId: string) => void
  className?: string
}

export function FamilyBookshelf({ books, onBookClick, className }: FamilyBookshelfProps) {
  const t = useTranslations('library')

  // Split books across shelves
  const shelves = useMemo(() => {
    const result: BookSpineData[][] = []
    for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
      result.push(books.slice(i, i + BOOKS_PER_SHELF))
    }
    // Always show at least 2 shelves
    while (result.length < 2) {
      result.push([])
    }
    return result
  }, [books])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative mx-auto max-w-3xl', className)}
      style={{
        perspective: '800px',
        perspectiveOrigin: 'center 40%',
      }}
    >
      {/* Bookshelf frame */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-4',
          'border-amber-800 bg-gradient-to-b from-amber-100 to-amber-50',
          'dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-900/60',
          'shadow-2xl'
        )}
        style={{
          // Slight 3D tilt for the entire bookshelf
          transform: 'rotateX(2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Back panel with wood texture */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139,69,19,0.1) 40px, rgba(139,69,19,0.1) 41px)',
            }}
          />
        </div>

        {/* Shelves */}
        <div className="relative space-y-2 px-2 py-4 sm:px-3">
          {shelves.map((shelfBooks, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <BookshelfShelf
                books={shelfBooks}
                onBookClick={onBookClick}
                label={
                  index === 0 && books.length > 0
                    ? t('favoriteShelf')
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>

        {/* Side panels (decorative) */}
        <div className="absolute inset-y-0 start-0 w-2 bg-gradient-to-r from-amber-900/20 to-transparent" />
        <div className="absolute inset-y-0 end-0 w-2 bg-gradient-to-l from-amber-900/20 to-transparent" />
      </div>

      {/* Bookshelf shadow on floor */}
      <div className="mx-8 h-4 rounded-b-full bg-black/10 blur-md dark:bg-black/30" />
    </motion.div>
  )
}
