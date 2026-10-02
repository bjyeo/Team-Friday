import type { SpotAlert } from './types'

export interface DeliveryResult {
  channel: string
  delivered: boolean
  /** Shown to the student verbatim, so it must read as plain English. */
  note: string
}

/**
 * One way of getting an alert to a student. Implementations are swapped in
 * `createChannels()` — adding real email means adding one class here, not
 * touching the detection logic, the preferences UI or the contexts.
 */
export interface NotificationChannel {
  readonly id: string
  readonly label: string
  /** False when the channel cannot deliver right now (no permission, no address). */
  isReady(): boolean
  send(alert: SpotAlert): Promise<DeliveryResult>
}
