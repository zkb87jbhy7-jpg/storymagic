import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization') ?? ''

    const response = await fetch(`${FASTAPI_URL}/api/v1/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { detail: 'Failed to create book' },
      { status: 500 }
    )
  }
}
