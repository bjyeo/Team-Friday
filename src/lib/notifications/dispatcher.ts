import type { DeliveryResult, NotificationChannel } from './channel'
import type { NotificationPrefs, SpotAlert } from './types'

export interface DispatchRecord {
  alert: SpotAlert
  results: DeliveryResult[]
  /** True when at least one channel got through. */
  delivered: boolean
}

/**
 * Fans an alert out to every channel the student has switched on. A channel
 * that fails never stops the others — email queueing must not swallow the
 * browser notification that would actually have reached them.
 */
export async function dispatch(
  alerts: readonly SpotAlert[],
  channels: readonly NotificationChannel[],
  prefs: NotificationPrefs,
): Promise<DispatchRecord[]> {
  const enabled = channels.filter(
    (c) => prefs.channels[c.id as keyof NotificationPrefs['channels']] ?? false,
  )
  if (enabled.length === 0) return []

  const records: DispatchRecord[] = []

  for (const alert of alerts) {
    const results = await Promise.all(
      enabled.map((c) =>
        c.send(alert).catch(
          (err): DeliveryResult => ({
            channel: c.id,
            delivered: false,
            note: err instanceof Error ? err.message : 'Channel threw.',
          }),
        ),
      ),
    )
    records.push({ alert, results, delivered: results.some((r) => r.delivered) })
  }

  return records
}
