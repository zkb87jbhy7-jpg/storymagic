import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'StoryMagic',
  description: 'AI-powered personalized children\'s books where your child is the hero',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
