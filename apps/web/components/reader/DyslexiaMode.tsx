'use client'

interface DyslexiaModeProps {
  children: React.ReactNode
}

/**
 * Wrapper applying dyslexia-friendly styles:
 * - OpenDyslexic font
 * - Cream background (#FDF6E3)
 * - Line-height 2
 * - Letter-spacing 0.05em
 * - No italic
 * - Max 10 words per line (~45ch)
 */
export function DyslexiaMode({ children }: DyslexiaModeProps) {
  return (
    <div
      className="min-h-[100dvh] bg-[#FDF6E3] font-dyslexic dark:bg-[#3B3526]"
      style={{
        lineHeight: 2,
        letterSpacing: '0.05em',
        fontStyle: 'normal',
      }}
    >
      <style jsx global>{`
        .reader-dyslexia * {
          font-family: 'OpenDyslexic', sans-serif !important;
          font-style: normal !important;
          line-height: 2 !important;
          letter-spacing: 0.05em !important;
        }
        .reader-dyslexia p,
        .reader-dyslexia span,
        .reader-dyslexia div[style*="fontSize"] {
          max-width: 45ch;
        }
      `}</style>
      {children}
    </div>
  )
}
