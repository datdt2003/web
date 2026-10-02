import { EventEmitter } from "node:events"

export type RealtimeEvent = {
  type: "order.created" | "order.updated" | "order.deleted" | "product.created" | "product.updated" | "product.deleted" | "ethnic.updated"
  data?: Record<string, unknown>
}

const globalForRealtime = globalThis as typeof globalThis & {
  realtimeEvents?: EventEmitter
}

export const realtimeEvents =
  globalForRealtime.realtimeEvents || new EventEmitter()

realtimeEvents.setMaxListeners(0)
globalForRealtime.realtimeEvents = realtimeEvents

export function publishRealtimeEvent(event: RealtimeEvent) {
  realtimeEvents.emit("event", event)
}