'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Sparkles, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { VoiceSelector, type PresetVoice } from '@/components/voice/VoiceSelector'
import { FamilyVoiceRecorder } from '@/components/voice/FamilyVoiceRecorder'
import { VoicePreviewPlayer } from '@/components/voice/VoicePreviewPlayer'
import { VoiceCloneStatus, type CloneStatus } from '@/components/voice/VoiceCloneStatus'
import type { RecordingQuality } from '@/components/voice/RecordingQualityFeedback'

type Tab = 'preset' | 'family'

interface FamilyVoice {
  id: string
  name: string
  recordedAt: string
  blobUrl: string
  quality: RecordingQuality
  cloneStatus: CloneStatus
  cloneProgress: number
}

export default function VoicesSettingsPage() {
  const t = useTranslations('voice')

  const [activeTab, setActiveTab] = useState<Tab>('preset')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [familyVoices, setFamilyVoices] = useState<FamilyVoice[]>([])
  const [isRecordingNew, setIsRecordingNew] = useState(false)
  const [newVoiceName, setNewVoiceName] = useState('')

  const handlePresetSelect = useCallback((voice: PresetVoice) => {
    setSelectedPresetId(voice.id)
  }, [])

  const handleRecordingComplete = useCallback(
    (blob: Blob, quality: RecordingQuality) => {
      const url = URL.createObjectURL(blob)
      const newVoice: FamilyVoice = {
        id: `family-${Date.now()}`,
        name: newVoiceName || t('defaultVoiceName'),
        recordedAt: new Date().toISOString(),
        blobUrl: url,
        quality,
        cloneStatus: 'processing' as CloneStatus,
        cloneProgress: 0,
      }
      setFamilyVoices((prev) => [...prev, newVoice])
      setIsRecordingNew(false)
      setNewVoiceName('')

      // Simulate clone processing
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setFamilyVoices((prev) =>
            prev.map((v) =>
              v.id === newVoice.id ? { ...v, cloneStatus: 'ready' as CloneStatus, cloneProgress: 100 } : v
            )
          )
        } else {
          setFamilyVoices((prev) =>
            prev.map((v) =>
              v.id === newVoice.id ? { ...v, cloneProgress: progress } : v
            )
          )
        }
      }, 1500)
    },
    [newVoiceName, t]
  )

  const handleDeleteVoice = useCallback((id: string) => {
    setFamilyVoices((prev) => {
      const voice = prev.find((v) => v.id === id)
      if (voice) URL.revokeObjectURL(voice.blobUrl)
      return prev.filter((v) => v.id !== id)
    })
  }, [])

  const tabs: { key: Tab; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'preset', icon: Sparkles },
    { key: 'family', icon: Mic },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('voiceLibrary')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('voiceLibraryDesc')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
        {tabs.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`tab_${key}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'preset' ? (
          <motion.div
            key="preset"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VoiceSelector
              selectedVoiceId={selectedPresetId}
              onSelect={handlePresetSelect}
            />
          </motion.div>
        ) : (
          <motion.div
            key="family"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Existing family voices */}
            {familyVoices.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('savedVoices')}
                </h2>
                {familyVoices.map((voice) => (
                  <motion.div
                    key={voice.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {voice.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {new Date(voice.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVoice(voice.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10"
                        aria-label={t('deleteVoice')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <VoicePreviewPlayer
                        src={voice.blobUrl}
                        compact
                        label={voice.name}
                      />
                    </div>

                    <div className="mt-3">
                      <VoiceCloneStatus
                        status={voice.cloneStatus}
                        progress={voice.cloneProgress}
                        voiceName={voice.name}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Record new voice */}
            {isRecordingNew ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="voice-name"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t('voiceNameLabel')}
                  </label>
                  <input
                    id="voice-name"
                    type="text"
                    value={newVoiceName}
                    onChange={(e) => setNewVoiceName(e.target.value)}
                    placeholder={t('voiceNamePlaceholder')}
                    className={cn(
                      'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm',
                      'text-slate-900 placeholder:text-slate-400',
                      'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200',
                      'dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
                      'dark:focus:border-primary-500 dark:focus:ring-primary-800'
                    )}
                  />
                </div>

                <FamilyVoiceRecorder onRecordingComplete={handleRecordingComplete} />

                <button
                  type="button"
                  onClick={() => setIsRecordingNew(false)}
                  className="text-sm text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('cancelRecording')}
                </button>
              </motion.div>
            ) : (
              <motion.button
                type="button"
                onClick={() => setIsRecordingNew(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed',
                  'border-primary-300 bg-primary-50 py-6 text-primary-600',
                  'transition-colors hover:border-primary-400 hover:bg-primary-100',
                  'dark:border-primary-700 dark:bg-primary-950/20 dark:text-primary-400',
                  'dark:hover:border-primary-600 dark:hover:bg-primary-950/30'
                )}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">{t('recordNewVoice')}</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
