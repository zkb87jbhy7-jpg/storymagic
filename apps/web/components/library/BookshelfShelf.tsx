'use client'

import { cn } from '@/lib/utils/cn'
import { BookSpine, type BookSpineData } from './BookSpine'

interface BookshelfShelfProps {
  /** Books to display on this shelf */
  books: BookSpineData[]
  /** Shelf label */
  label?: string
  /** Click handler */
  onBookClick?: (bookId: string) => void
  className?: string
}

export function BookshelfShelf({ books, label, onBookClick, className }: BookshelfShelfProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Shelf label */}
      {label && (
        <p className="mb-1 ps-2 text-xs font-medium text-amber-800/60 dark:text-amber-300/50">
          {label}
        </p>
      )}

      {/* Books row */}
      <div className="relative z-10 flex items-end gap-1 px-3 pb-1 sm:gap-1.5 sm:px-4">
        {books.map((book) => (
          <BookSpine
            key={book.id}
            book={book}
            onClick={onBookClick}
          />
        ))}

        {/* Empty slot indicators */}
        {books.length === 0 && (
          <div className="flex h-44 w-full items-center justify-center sm:h-52">
            <p className="text-xs text-amber-700/40 dark:text-amber-300/30">
              ~
            </p>
          </div>
        )}
      </div>

      {/* Shelf board — 3D CSS wood texture */}
      <div
        className={cn(
          'relative h-4 w-full rounded-b-sm',
          // Wood grain effect with gradient
          'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
          'dark:from-amber-800 dark:via-amber-900 dark:to-amber-950',
          // Top edge highlight
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-amber-500/50',
          // Shadow beneath
          'shadow-[0_4px_8px_-2px_rgba(120,53,15,0.3)]',
          'dark:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.5)]'
        )}
        style={{
          // CSS 3D tilt for shelf board
          transform: 'perspective(600px) rotateX(5deg)',
          transformOrigin: 'top center',
        }}
      >
        {/* Wood grain lines */}
        <div className="absolute inset-0 overflow-hidden rounded-b-sm opacity-20">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute h-px w-full bg-amber-400"
              style={{ top: `${30 + i * 25}%` }}
            />
          ))}
        </div>
      </div>

      {/* Shelf bracket shadows */}
      <div className="absolute -bottom-1 start-4 h-3 w-3 rounded-b bg-amber-900/30 dark:bg-black/30" />
      <div className="absolute -bottom-1 end-4 h-3 w-3 rounded-b bg-amber-900/30 dark:bg-black/30" />
    </div>
  )
}
