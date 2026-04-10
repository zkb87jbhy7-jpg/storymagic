'use client'

import { use } from 'react'
import { InteractiveBookReader } from '@/components/reader/InteractiveBookReader'

interface ReadPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function ReadPage({ params }: ReadPageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-[100dvh] w-full">
      <InteractiveBookReader bookId={id} />
    </div>
  )
}
