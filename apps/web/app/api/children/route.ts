import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

/**
 * GET /api/children
 *
 * If an `id` query-param is supplied the route returns a single child profile;
 * otherwise it returns the full list belonging to the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('id')

    const upstream = childId
      ? `${FASTAPI_URL}/api/v1/children/${childId}`
      : `${FASTAPI_URL}/api/v1/children`

    const response = await fetch(upstream, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: 'Unknown error' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { detail: 'Failed to fetch children' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/children
 *
 * Accepts a `multipart/form-data` body (photos + JSON-serialised fields) and
 * forwards everything to the FastAPI backend.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const formData = await request.formData()

    // Build payload for FastAPI.  Photos are forwarded as-is; structured
    // fields were JSON-stringified on the client so we parse them back.
    const payload: Record<string, unknown> = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      birth_date: formData.get('birthDate'),
    }

    const avatarRaw = formData.get('avatar')
    if (avatarRaw && typeof avatarRaw === 'string') {
      payload.avatar = JSON.parse(avatarRaw)
    }

    const traitsRaw = formData.get('physicalTraits')
    if (traitsRaw && typeof traitsRaw === 'string') {
      payload.physical_traits = JSON.parse(traitsRaw)
    }

    const prefsRaw = formData.get('preferences')
    if (prefsRaw && typeof prefsRaw === 'string') {
      payload.preferences = JSON.parse(prefsRaw)
    }

    // Forward photos as a new FormData to the upstream service.
    const upstreamForm = new FormData()
    upstreamForm.append('data', JSON.stringify(payload))

    const photos = formData.getAll('photos')
    for (const photo of photos) {
      if (photo instanceof File) {
        upstreamForm.append('photos', photo)
      }
    }

    // If an `id` field is present we treat this as an update (PUT).
    const childId = formData.get('id')
    const method = childId ? 'PUT' : 'POST'
    const upstreamUrl = childId
      ? `${FASTAPI_URL}/api/v1/children/${childId}`
      : `${FASTAPI_URL}/api/v1/children`

    const response = await fetch(upstreamUrl, {
      method,
      headers: {
        Authorization: authHeader,
      },
      body: upstreamForm,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: 'Unknown error' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: childId ? 200 : 201 })
  } catch {
    return NextResponse.json(
      { detail: 'Failed to save child profile' },
      { status: 500 },
    )
  }
}
