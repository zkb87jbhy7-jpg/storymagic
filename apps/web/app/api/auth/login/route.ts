import { NextRequest, NextResponse } from 'next/server'
import { storeTokens } from '@/lib/auth/session'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8000'

/**
 * POST /api/auth/login
 *
 * BFF proxy that forwards login credentials to the FastAPI backend,
 * then stores the returned JWT tokens in httpOnly cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const upstream = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.detail ?? 'Authentication failed' },
        { status: upstream.status }
      )
    }

    // Store tokens from FastAPI response
    await storeTokens(data.access_token, data.refresh_token)

    return NextResponse.json(
      { user: data.user },
      { status: 200 }
    )
  } catch (error) {
    console.error('[BFF] Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
