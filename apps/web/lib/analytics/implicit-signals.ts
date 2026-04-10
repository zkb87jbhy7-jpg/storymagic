// ---------------------------------------------------------------------------
// Implicit reading-signal tracker — captures behavioural signals that reveal
// engagement without requiring the child to take an explicit action.
// ---------------------------------------------------------------------------

import { eventTracker } from './event-tracker'

export interface ReadingSignals {
  bookId: string
  pageIndex: number
  timeOnPageMs: number
  pagesReread: Set<number>
  tapCount: number
  completed: boolean
}

export class ImplicitSignalTracker {
  private bookId: string
  private pageIndex = 0
  private pageEnteredAt = Date.now()
  private pagesReread = new Set<number>()
  private visitedPages = new Set<number>()
  private tapCount = 0
  private completed = false

  constructor(bookId: string) {
    this.bookId = bookId
  }

  /** Called when the reader navigates to a page. */
  enterPage(pageIndex: number): void {
    // Flush time for the previous page
    this.flushPage()

    if (this.visitedPages.has(pageIndex)) {
      this.pagesReread.add(pageIndex)
    }
    this.visitedPages.add(pageIndex)

    this.pageIndex = pageIndex
    this.pageEnteredAt = Date.now()
  }

  /** Record an interactive tap on the current page. */
  recordTap(): void {
    this.tapCount++
    eventTracker.track('reading.tap', {
      bookId: this.bookId,
      pageIndex: this.pageIndex,
    })
  }

  /** Mark the book as completed. */
  markCompleted(): void {
    this.completed = true
    this.flushPage()

    eventTracker.track('reading.completed', {
      bookId: this.bookId,
      totalPages: this.visitedPages.size,
      pagesReread: Array.from(this.pagesReread),
      totalTaps: this.tapCount,
    })
  }

  /** Snapshot of current signals (useful for parent dashboards). */
  getSignals(): ReadingSignals {
    return {
      bookId: this.bookId,
      pageIndex: this.pageIndex,
      timeOnPageMs: Date.now() - this.pageEnteredAt,
      pagesReread: new Set(this.pagesReread),
      tapCount: this.tapCount,
      completed: this.completed,
    }
  }

  // ---- Internal ----------------------------------------------------------

  private flushPage(): void {
    const timeOnPageMs = Date.now() - this.pageEnteredAt
    if (timeOnPageMs < 100) return // skip near-instant page changes

    eventTracker.track('reading.page_time', {
      bookId: this.bookId,
      pageIndex: this.pageIndex,
      timeOnPageMs,
    })
  }
}
