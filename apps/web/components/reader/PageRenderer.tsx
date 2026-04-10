'use client'

import { cn } from '@/lib/utils/cn'
import type { BookPage, LayoutType } from './InteractiveBookReader'

interface PageRendererProps {
  page: BookPage
  fontSize: number
}

function IllustrationImage({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

function TextContent({
  text,
  fontSize,
  className,
}: {
  text: string
  fontSize: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'leading-relaxed text-slate-800 dark:text-slate-200',
        className
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      {text}
    </div>
  )
}

function FullIllustrationTextOverlay({ page, fontSize }: PageRendererProps) {
  return (
    <div className="relative flex h-full min-h-[60vh] w-full flex-col">
      {page.illustrationUrl && (
        <IllustrationImage url={page.illustrationUrl} alt={`Page ${page.pageNumber}`} />
      )}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 p-4 sm:p-6',
          'bg-gradient-to-t from-black/70 via-black/40 to-transparent'
        )}
      >
        <TextContent
          text={page.text}
          fontSize={fontSize}
          className="text-white drop-shadow-lg"
        />
      </div>
    </div>
  )
}

function TopIllustrationBottomText({ page, fontSize }: PageRendererProps) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col">
      {page.illustrationUrl && (
        <div className="relative h-[55%] min-h-[200px] flex-shrink-0">
          <IllustrationImage url={page.illustrationUrl} alt={`Page ${page.pageNumber}`} />
        </div>
      )}
      <div className="flex flex-1 items-start p-4 sm:p-6">
        <TextContent text={page.text} fontSize={fontSize} />
      </div>
    </div>
  )
}

function SideBySide({ page, fontSize }: PageRendererProps) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col md:flex-row">
      {page.illustrationUrl && (
        <div className="relative h-[50%] w-full flex-shrink-0 md:h-full md:w-1/2">
          <IllustrationImage url={page.illustrationUrl} alt={`Page ${page.pageNumber}`} />
        </div>
      )}
      <div className="flex flex-1 items-center p-4 sm:p-6">
        <TextContent text={page.text} fontSize={fontSize} />
      </div>
    </div>
  )
}

function FullSpread({ page, fontSize }: PageRendererProps) {
  return (
    <div className="relative flex h-full min-h-[60vh] w-full items-center justify-center">
      {page.illustrationUrl && (
        <IllustrationImage url={page.illustrationUrl} alt={`Page ${page.pageNumber}`} />
      )}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center p-6 sm:p-10',
          'bg-black/30'
        )}
      >
        <TextContent
          text={page.text}
          fontSize={fontSize + 2}
          className="max-w-xl text-center text-white drop-shadow-lg"
        />
      </div>
    </div>
  )
}

function TextOnlyDecorativeBorder({ page, fontSize }: PageRendererProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[60vh] w-full items-center justify-center',
        'bg-gradient-to-br from-amber-50 via-white to-amber-50',
        'dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'
      )}
    >
      <div
        className={cn(
          'mx-4 max-w-lg rounded-2xl p-6 sm:mx-8 sm:p-10',
          'border-2 border-amber-200 dark:border-amber-800',
          'bg-white/80 shadow-lg dark:bg-slate-900/80'
        )}
      >
        {/* Decorative corners */}
        <div className="relative">
          <div className="absolute -start-3 -top-3 text-2xl text-amber-400">&#10047;</div>
          <div className="absolute -end-3 -top-3 text-2xl text-amber-400">&#10047;</div>
          <div className="absolute -bottom-3 -start-3 text-2xl text-amber-400">&#10047;</div>
          <div className="absolute -bottom-3 -end-3 text-2xl text-amber-400">&#10047;</div>
          <TextContent
            text={page.text}
            fontSize={fontSize + 1}
            className="text-center leading-loose"
          />
        </div>
      </div>
    </div>
  )
}

const LAYOUT_RENDERERS: Record<LayoutType, React.FC<PageRendererProps>> = {
  full_illustration_text_overlay: FullIllustrationTextOverlay,
  top_illustration_bottom_text: TopIllustrationBottomText,
  side_by_side: SideBySide,
  full_spread: FullSpread,
  text_only_decorative_border: TextOnlyDecorativeBorder,
}

export function PageRenderer({ page, fontSize }: PageRendererProps) {
  const Renderer = LAYOUT_RENDERERS[page.layout] ?? TopIllustrationBottomText

  return (
    <div className="h-full w-full" dir="auto">
      <Renderer page={page} fontSize={fontSize} />
    </div>
  )
}
