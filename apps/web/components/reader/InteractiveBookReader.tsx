'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useNightMode } from '@/hooks/useNightMode'
import { ReaderModeSelector } from './ReaderModeSelector'
import { PageRenderer } from './PageRenderer'
import { PageFlipViewer } from './PageFlipViewer'
import { ReaderSettingsPanel } from './ReaderSettingsPanel'
import { PageAnimationLayer } from './PageAnimationLayer'
import { KaraokeReader } from './KaraokeReader'
import { InteractiveElements } from './InteractiveElements'
import { NightMode } from './NightMode'
import { ReadingBuddy } from './ReadingBuddy'
import { EndOfBookCelebration } from './EndOfBookCelebration'
import { NeuroInclusiveModes } from './NeuroInclusiveModes'
import { ReadingAnalytics } from './ReadingAnalytics'
import type { ParticlePreset } from '@/lib/reader/animation-presets'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export type ReadingMode = 'i_read' | 'read_to_me' | 'parent_voice' | 'night_mode'
export type AccessibilityMode = 'none' | 'dyslexia' | 'adhd' | 'autism'

export type LayoutType =
  | 'full_illustration_text_overlay'
  | 'top_illustration_bottom_text'
  | 'side_by_side'
  | 'full_spread'
  | 'text_only_decorative_border'

export interface BookPage {
  pageNumber: number
  text: string
  illustrationUrl?: string
  layout: LayoutType
  audioUrl?: string
  particlePreset?: ParticlePreset
  interactiveElements?: InteractiveElement[]
}

export interface InteractiveElement {
  id: string
  type: 'tappable'
  x: number
  y: number
  width: number
  height: number
  label: string
  funFact: string
  sfxUrl?: string
}

export interface QuizData {
  question: string
  options: string[]
  correctIndex: number
}

interface InteractiveBookReaderProps {
  bookId: string
}

// Mock book data for development
function getMockBookData(): { pages: BookPage[]; title: string; childAge: number; quiz: QuizData } {
  return {
    title: 'The Magical Garden',
    childAge: 6,
    quiz: {
      question: 'What color was the magic flower?',
      options: ['Red', 'Blue', 'Golden'],
      correctIndex: 2,
    },
    pages: [
      {
        pageNumber: 1,
        text: 'Once upon a time, in a garden filled with wonder, a little child discovered something magical hiding beneath the leaves.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'top_illustration_bottom_text',
        particlePreset: 'falling_leaves',
        interactiveElements: [
          {
            id: 'leaf-1',
            type: 'tappable',
            x: 30,
            y: 20,
            width: 15,
            height: 15,
            label: 'Golden Leaf',
            funFact: 'Leaves change color in autumn because they stop making chlorophyll!',
          },
        ],
      },
      {
        pageNumber: 2,
        text: 'The flowers sparkled like tiny stars, each one a different color. The child reached out to touch the golden petals.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'full_illustration_text_overlay',
        particlePreset: 'twinkling_stars',
      },
      {
        pageNumber: 3,
        text: 'Bubbles floated up from the enchanted pond, carrying wishes and dreams high into the sky.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'side_by_side',
        particlePreset: 'floating_bubbles',
      },
      {
        pageNumber: 4,
        text: 'Rain began to fall gently, watering the magical plants. Each drop made a tiny musical note as it landed.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'top_illustration_bottom_text',
        particlePreset: 'gentle_rain',
      },
      {
        pageNumber: 5,
        text: 'Snow covered the garden like a white blanket. The child smiled as soft flakes danced around them.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'full_spread',
        particlePreset: 'snowfall',
      },
      {
        pageNumber: 6,
        text: 'As night fell, tiny fireflies lit up the garden. The child knew this magical place would always be here, waiting for the next adventure.',
        illustrationUrl: '/images/placeholder-illustration.jpg',
        layout: 'text_only_decorative_border',
        particlePreset: 'fireflies',
      },
    ],
  }
}

export function InteractiveBookReader({ bookId }: InteractiveBookReaderProps) {
  const t = useTranslations('reader')
  const [isLoading, setIsLoading] = useState(true)
  const [bookData, setBookData] = useState<ReturnType<typeof getMockBookData> | null>(null)
  const [readingMode, setReadingMode] = useState<ReadingMode>('i_read')
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('none')
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [readingSpeed, setReadingSpeed] = useState(1.0)
  const [buddyEnabled, setBuddyEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [karaokeActive, setKaraokeActive] = useState(false)

  const nightMode = useNightMode()

  // Load book data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBookData(getMockBookData())
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [bookId])

  const totalPages = bookData?.pages.length ?? 0
  const { currentPage, setPage, progress } = useReadingProgress(bookId, totalPages)

  const currentPageData = useMemo(() => {
    return bookData?.pages[currentPage] ?? null
  }, [bookData, currentPage])

  const handlePageChange = useCallback((newPage: number) => {
    if (!bookData) return
    if (newPage >= 0 && newPage < bookData.pages.length) {
      setPage(newPage)
    }
    // Check if finishing the book
    if (newPage >= bookData.pages.length) {
      setShowCelebration(true)
    }
  }, [bookData, setPage])

  const handleModeChange = useCallback((mode: ReadingMode) => {
    setReadingMode(mode)
    if (mode === 'night_mode') {
      nightMode.toggle()
    } else if (mode === 'read_to_me') {
      setKaraokeActive(true)
    } else {
      setKaraokeActive(false)
    }
  }, [nightMode])

  if (isLoading || !bookData) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    )
  }

  if (showCelebration) {
    return (
      <EndOfBookCelebration
        bookId={bookId}
        quiz={bookData.quiz}
        onReadAgain={() => {
          setShowCelebration(false)
          setPage(0)
        }}
      />
    )
  }

  const isNightActive = readingMode === 'night_mode' || nightMode.isNight

  return (
    <NightMode active={isNightActive}>
      <NeuroInclusiveModes
        mode={accessibilityMode}
        currentPage={currentPage}
        totalPages={totalPages}
        childAge={bookData.childAge}
        pageText={currentPageData?.text ?? ''}
      >
        <div
          className={cn(
            'relative flex min-h-[100dvh] flex-col',
            'bg-white dark:bg-slate-950'
          )}
        >
          {/* Top bar */}
          <header
            className={cn(
              'sticky top-0 z-30 flex items-center justify-between',
              'border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur-sm',
              'dark:border-slate-800 dark:bg-slate-950/90'
            )}
          >
            <ReaderModeSelector
              activeMode={readingMode}
              onModeChange={handleModeChange}
              isNightMode={isNightActive}
            />
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'rounded-lg p-2 text-slate-600 transition-colors',
                'hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
              aria-label={t('settings')}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </header>

          {/* Settings Panel */}
          <ReaderSettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            readingSpeed={readingSpeed}
            onReadingSpeedChange={setReadingSpeed}
            accessibilityMode={accessibilityMode}
            onAccessibilityModeChange={setAccessibilityMode}
            buddyEnabled={buddyEnabled}
            onBuddyToggle={() => setBuddyEnabled(!buddyEnabled)}
            animationsEnabled={animationsEnabled}
            onAnimationsToggle={() => setAnimationsEnabled(!animationsEnabled)}
          />

          {/* Main reader area */}
          <main className="relative flex flex-1 flex-col">
            <PageFlipViewer
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            >
              <div className="relative h-full w-full">
                {/* Particle animation layer */}
                {animationsEnabled && currentPageData?.particlePreset && (
                  <PageAnimationLayer preset={currentPageData.particlePreset} />
                )}

                {/* Page content */}
                {currentPageData && (
                  <PageRenderer
                    page={currentPageData}
                    fontSize={fontSize}
                  />
                )}

                {/* Karaoke overlay */}
                {karaokeActive && currentPageData && (
                  <KaraokeReader
                    text={currentPageData.text}
                    audioUrl={currentPageData.audioUrl}
                    speed={readingSpeed}
                  />
                )}

                {/* Interactive elements */}
                {currentPageData?.interactiveElements && (
                  <InteractiveElements
                    elements={currentPageData.interactiveElements}
                  />
                )}
              </div>
            </PageFlipViewer>
          </main>

          {/* Reading progress bar */}
          <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Reading buddy */}
          {buddyEnabled && (
            <ReadingBuddy
              currentPage={currentPage}
              totalPages={totalPages}
              childAge={bookData.childAge}
              pageText={currentPageData?.text ?? ''}
            />
          )}

          {/* Analytics tracker (invisible) */}
          <ReadingAnalytics
            bookId={bookId}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </NeuroInclusiveModes>
    </NightMode>
  )
}
