import { NextResponse } from 'next/server'
import { getRefreshToken, storeTokens, clearTokens } from '@/lib/auth/session'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8000'

/**
 * POST /api/auth/refresh
 *
 * BFF proxy that reads the refresh token from httpOnly cookies,
 * sends it to the FastAPI backend, and stores the new token pair.
 * If the refresh fails, cookies are cleared to force re-login.
 */
export async function POST() {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      )
    }

    const upstream = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      // Refresh token expired or invalid — clear cookies
      await clearTokens()
      return NextResponse.json(
        { message: data?.detail ?? 'Token refresh failed' },
        { status: 401 }
      )
    }

    // Store the new token pair
    await storeTokens(data.access_token, data.refresh_token)

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('[BFF] Refresh error:', error)
    await clearTokens()
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
