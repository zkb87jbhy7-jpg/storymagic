'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sparkles, List, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DreamRecorder } from '@/components/dreams/DreamRecorder'
import { DreamCard, type DreamData, type DreamEmotion } from '@/components/dreams/DreamCard'
import { DreamTimeline } from '@/components/dreams/DreamTimeline'

type ViewMode = 'cards' | 'timeline'

// Mock data
const MOCK_DREAMS: DreamData[] = [
  {
    id: '1',
    description: 'I was flying over a rainbow bridge with a giant butterfly. The clouds were made of cotton candy and we could eat them!',
    emotion: 'magical',
    childName: 'Mika',
    createdAt: '2025-12-10T08:30:00Z',
  },
  {
    id: '2',
    description: 'There was a friendly dragon in our backyard. We played hide and seek and he always found me because he could smell chocolate.',
    emotion: 'funny',
    childName: 'Noa',
    createdAt: '2025-12-09T07:45:00Z',
  },
  {
    id: '3',
    description: 'I was an astronaut exploring a planet made entirely of LEGO bricks. I built a castle with my friend who was a robot.',
    emotion: 'adventurous',
    childName: 'Mika',
    createdAt: '2025-12-08T08:15:00Z',
  },
  {
    id: '4',
    description: 'I was swimming in a warm ocean and talking to dolphins. They showed me their underwater city with glowing coral houses.',
    emotion: 'peaceful',
    childName: 'Noa',
    createdAt: '2025-12-07T07:00:00Z',
  },
  {
    id: '5',
    description: 'It was a dark forest and the trees had eyes. But then a little firefly friend came and showed me the way home.',
    emotion: 'scary',
    childName: 'Mika',
    createdAt: '2025-12-05T08:00:00Z',
  },
  {
    id: '6',
    description: 'I had a magic paintbrush and everything I drew came to life! I drew a puppy and it jumped right out of the paper.',
    emotion: 'happy',
    childName: 'Noa',
    createdAt: '2025-12-03T07:30:00Z',
  },
]

const EMOTIONS: DreamEmotion[] = ['happy', 'adventurous', 'scary', 'magical', 'peaceful', 'funny', 'sad']

export default function DreamsPage() {
  const t = useTranslations('dreams')

  const [dreams, setDreams] = useState<DreamData[]>(MOCK_DREAMS)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedEmotion, setSelectedEmotion] = useState<DreamEmotion | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  const filteredDreams = selectedEmotion
    ? dreams.filter((d) => d.emotion === selectedEmotion)
    : dreams

  const handleSubmitDream = useCallback((description: string) => {
    const newDream: DreamData = {
      id: `dream-${Date.now()}`,
      description,
      emotion: 'magical', // In production, AI would detect emotion
      childName: 'Mika',
      createdAt: new Date().toISOString(),
    }
    setDreams((prev) => [newDream, ...prev])
    setShowRecorder(false)
  }, [])

  const handleConvertToBook = useCallback((dreamId: string) => {
    // In production, navigate to book creation with dream data
    window.location.href = `/books/create?dreamId=${dreamId}`
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Moon className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {t('pageTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('pageSubtitle')}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setShowRecorder(!showRecorder)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md',
            'bg-gradient-to-r from-indigo-500 to-purple-500',
            'transition-shadow hover:shadow-lg'
          )}
        >
          <Sparkles className="h-4 w-4" />
          {t('recordDream')}
        </motion.button>
      </div>

      {/* Dream recorder */}
      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <DreamRecorder onSubmit={handleSubmitDream} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & view toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Emotion filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedEmotion(null)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              !selectedEmotion
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            )}
          >
            {t('allEmotions')}
          </button>
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => setSelectedEmotion(emotion === selectedEmotion ? null : emotion)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                selectedEmotion === emotion
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              )}
            >
              {t(`emotion_${emotion}`)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          {[
            { key: 'cards' as ViewMode, icon: LayoutGrid },
            { key: 'timeline' as ViewMode, icon: List },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={cn(
                'relative flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === key
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(`view_${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {filteredDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onConvertToBook={handleConvertToBook}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DreamTimeline dreams={filteredDreams} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredDreams.length === 0 && (
        <div className="py-16 text-center">
          <Moon className="mx-auto h-12 w-12 text-indigo-200 dark:text-indigo-700" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {selectedEmotion ? t('noMatchingDreams') : t('noDreams')}
          </p>
        </div>
      )}
    </div>
  )
}
