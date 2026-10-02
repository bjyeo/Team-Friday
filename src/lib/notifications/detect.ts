import type { SpotWithState } from '../../types'
import { CROWD_LABELS } from '../spotState'
import type { NotificationPrefs, SpotAlert } from './types'

/** Never alert about the same spot more often than this. */
export const COOLDOWN_MINS = 30

export interface AlertHistory {
  /** Last alert per spot id — the cooldown clock. */
  lastAlertAt: Readonly<Record<string, number>>
  /** When watching started per spot id — the news baseline. */
  watchingSince: Readonly<Record<string, number>>
}

/**
 * Decides what to tell a student about the spots they watch.
 *
 * Three rules keep this from becoming spam, and they are the whole reason this
 * is a pure function with tests rather than an effect buried in a component:
 *
 *  1. The triggering report must have arrived *after* the student started
 *     watching. Watching a spot that already has seats should not instantly
 *     notify them about the card they are looking at.
 *  2. It must also be newer than the last alert for that spot, so a spot that
 *     simply stays free does not re-notify on every render.
 *  3. Even with new reports, at most one alert per spot per cooldown window.
 */
export function detectSeatAlerts(
  states: readonly SpotWithState[],
  watchlist: readonly number[],
  prefs: NotificationPrefs,
  history: AlertHistory,
  now: number,
): SpotAlert[] {
  if (!prefs.seatsFree) return []

  const watched = new Set(watchlist)
  const alerts: SpotAlert[] = []

  for (const s of states) {
    if (!watched.has(s.spot.id)) continue

    // Stale information is exactly what this app exists to stop acting on.
    if (s.stale || s.latest === null || s.reportedMinsAgo === null) continue
    if (s.seatsFree === null || s.seatsFree < prefs.minSeats) continue

    const key = String(s.spot.id)
    const last = history.lastAlertAt[key] ?? 0
    const since = history.watchingSince[key] ?? 0

    // Rule 1: only reports that arrived after watching began.
    if (s.latest.createdAt <= since) continue
    // Rule 2: and newer than whatever we last alerted about.
    if (s.latest.createdAt <= last) continue
    // Rule 3: respect the cooldown.
    if (now - last < COOLDOWN_MINS * 60_000) continue

    alerts.push({
      id: `alert-${s.spot.id}-${s.latest.createdAt}`,
      kind: 'seats-free',
      spotId: s.spot.id,
      spotName: s.spot.name,
      spotArea: s.spot.area,
      seatsFree: s.seatsFree,
      totalSeats: s.spot.totalSeats,
      crowd: CROWD_LABELS[s.crowd],
      reportedMinsAgo: s.reportedMinsAgo,
      reportAt: s.latest.createdAt,
      createdAt: now,
    })
  }

  return alerts
}
