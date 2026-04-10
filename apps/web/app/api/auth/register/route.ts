import { NextRequest, NextResponse } from 'next/server'
import { storeTokens } from '@/lib/auth/session'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8000'

/**
 * POST /api/auth/register
 *
 * BFF proxy that forwards registration data to the FastAPI backend,
 * then stores the returned JWT tokens in httpOnly cookies so the
 * user is immediately signed in after registration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const upstream = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.detail ?? 'Registration failed' },
        { status: upstream.status }
      )
    }

    // Auto-login after registration
    if (data.access_token && data.refresh_token) {
      await storeTokens(data.access_token, data.refresh_token)
    }

    return NextResponse.json(
      { user: data.user },
      { status: 201 }
    )
  } catch (error) {
    console.error('[BFF] Register error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
