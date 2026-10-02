import { NextRequest } from "next/server"
import { realtimeEvents, type RealtimeEvent } from "@/lib/realtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  let heartbeat: ReturnType<typeof setInterval> | undefined
  let listener: ((event: RealtimeEvent) => void) | undefined

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: RealtimeEvent | { type: "connected" }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      send({ type: "connected" })
      listener = (event) => send(event)
      realtimeEvents.on("event", listener)
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"))
      }, 20000)

      request.signal.addEventListener("abort", () => {
        if (listener) realtimeEvents.off("event", listener)
        if (heartbeat) clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          // The client may already have closed the stream.
        }
      })
    },
    cancel() {
      if (listener) realtimeEvents.off("event", listener)
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}