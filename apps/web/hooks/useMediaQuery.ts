'use client'

import { useState, useEffect } from 'react'

interface UseMediaQueryReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const BREAKPOINTS = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
} as const

function getMatch(query: string): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

/**
 * Responsive breakpoint hook. Values update live as the viewport changes.
 * Mobile-first: isMobile is true when the viewport is below tablet width.
 */
export function useMediaQuery(): UseMediaQueryReturn {
  const [isTablet, setIsTablet] = useState(() => getMatch(BREAKPOINTS.tablet))
  const [isDesktop, setIsDesktop] = useState(() => getMatch(BREAKPOINTS.desktop))

  useEffect(() => {
    const tabletMql = window.matchMedia(BREAKPOINTS.tablet)
    const desktopMql = window.matchMedia(BREAKPOINTS.desktop)

    const onTablet = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    const onDesktop = (e: MediaQueryListEvent) => setIsDesktop(e.matches)

    tabletMql.addEventListener('change', onTablet)
    desktopMql.addEventListener('change', onDesktop)

    return () => {
      tabletMql.removeEventListener('change', onTablet)
      desktopMql.removeEventListener('change', onDesktop)
    }
  }, [])

  return {
    isMobile: !isTablet,
    isTablet: isTablet && !isDesktop,
    isDesktop,
  }
}
