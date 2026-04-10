import { NextRequest } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authHeader = request.headers.get('authorization') ?? ''

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(
          `${FASTAPI_URL}/api/v1/books/${id}/progress`,
          {
            headers: {
              Accept: 'text/event-stream',
              Authorization: authHeader,
            },
          }
        )

        if (!response.ok || !response.body) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Failed to connect to progress stream' })}\n\n`
            )
          )
          controller.close()
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          controller.enqueue(encoder.encode(chunk))
        }

        controller.close()
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream connection failed' })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
