'use server'

import { cookies } from 'next/headers'

const ACCESS_TOKEN_KEY = 'storymagic_access_token'
const REFRESH_TOKEN_KEY = 'storymagic_refresh_token'

/** Maximum age for access token cookie (15 minutes) */
const ACCESS_TOKEN_MAX_AGE = 15 * 60

/** Maximum age for refresh token cookie (7 days) */
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60

/**
 * Store JWT tokens in httpOnly secure cookies.
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

/**
 * Retrieve the current access token from cookies.
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null
}

/**
 * Retrieve the current refresh token from cookies.
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value ?? null
}

/**
 * Clear all authentication tokens from cookies.
 */
export async function clearTokens(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_KEY)
  cookieStore.delete(REFRESH_TOKEN_KEY)
}

/**
 * Check whether the user currently has a valid access token.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken()
  return token !== null
}
