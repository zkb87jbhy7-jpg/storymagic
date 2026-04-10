import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization') ?? ''

    const response = await fetch(`${FASTAPI_URL}/api/v1/books/${id}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Not found' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { detail: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}
