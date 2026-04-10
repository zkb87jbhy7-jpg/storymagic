'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ConversationalEditorProps {
  currentText: string
  onTextUpdate: (newText: string) => void
  bookId?: string
}

export function ConversationalEditor({
  currentText,
  onTextUpdate,
  bookId,
}: ConversationalEditorProps) {
  const t = useTranslations('common')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // In production this would call an AI editing API
      // For now, simulate a response
      const response = await fetch('/api/books/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          current_text: currentText,
          instruction: userMessage.content,
        }),
      }).catch(() => null)

      let updatedText = currentText
      if (response?.ok) {
        const data = await response.json()
        updatedText = data.updated_text ?? currentText
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: updatedText,
      }

      setMessages((prev) => [...prev, assistantMessage])
      onTextUpdate(updatedText)
    } catch {
      // Keep existing text on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border',
        'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      )}
    >
      {/* Current text */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-700">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {currentText}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex max-h-64 flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[85%] rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'ms-auto bg-primary-600 text-white dark:bg-primary-500'
                : 'me-auto bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
            )}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="me-auto flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t('loading')}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Make it funnier..."
          className={cn(
            'flex-1 rounded-lg border px-3 py-2 text-sm',
            'border-slate-300 bg-white text-slate-900 placeholder-slate-400',
            'dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30'
          )}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40',
            'dark:bg-primary-500 dark:hover:bg-primary-600'
          )}
          aria-label={t('submit')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
