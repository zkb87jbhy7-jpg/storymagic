'use client'

import {
  type ComponentType,
  createElement,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useRouter, usePathname } from '@/i18n/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  email: string
  name: string
  locale: string
  onboardingMode: 'quick' | 'creative' | 'guided' | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

// ─── useAuth hook ─────────────────────────────────────────────────────────────

/**
 * Client-side hook that returns current auth state.
 * Calls the BFF /api/auth/me endpoint to resolve the user from cookies.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
          } else {
            setUser(null)
          }
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
  }
}

// ─── withAuth HOC ─────────────────────────────────────────────────────────────

/**
 * Higher-order component that redirects unauthenticated users to /login.
 *
 * Usage:
 * ```ts
 * export default withAuth(DashboardPage)
 * ```
 */
export function withAuth<P extends Record<string, unknown>>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  function AuthGuard(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }, [isLoading, isAuthenticated, router, pathname])

    if (isLoading) {
      return createElement(
        'div',
        {
          className:
            'flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950',
        },
        createElement('div', {
          className:
            'h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-400',
          role: 'status',
          'aria-label': 'Loading',
        })
      )
    }

    if (!isAuthenticated || !user) {
      return null
    }

    return createElement(WrappedComponent, props)
  }

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`

  return AuthGuard
}
