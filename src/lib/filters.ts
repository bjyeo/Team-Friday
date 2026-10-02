import type { FilterKey, Filters, SortKey, SpotWithState } from '../types'
import { NEAR_RADIUS_KM, WIDE_RADIUS_KM } from './distance'
import { STALE_AFTER_MINS } from './freshness'

export const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'seats', label: 'Seats free now' },
  { key: 'aircon', label: 'Air-con' },
  { key: 'power', label: 'Power sockets' },
  { key: 'quiet', label: 'Quiet' },
  { key: 'h24', label: '24/7' },
]

export const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: 'seats', label: 'Most seats' },
  { key: 'near', label: 'Nearest' },
]

/**
 * "Seats free now" is the only filter that leans on a report, and it is
 * deliberately strict: a spot qualifies only if someone said there were seats
 * *recently*. A stale "23 free" is exactly the trip this app exists to prevent.
 */
function matches(s: SpotWithState, f: Filters): boolean {
  if (f.seats) {
    const fresh = s.reportedMinsAgo !== null && s.reportedMinsAgo < STALE_AFTER_MINS
    if (!fresh || (s.seatsFree ?? 0) <= 0) return false
  }
  if (f.aircon && s.spot.ventilation !== 'Air-con') return false
  if (f.power && s.spot.power === 'None') return false
  if (f.quiet && s.spot.noise !== 'Quiet') return false
  if (f.h24 && !s.spot.open24h) return false
  return true
}

export function applyFilters(spots: readonly SpotWithState[], f: Filters): SpotWithState[] {
  return spots.filter((s) => matches(s, f))
}

export function activeFilterCount(f: Filters): number {
  return Object.values(f).filter(Boolean).length
}

export function sortSpots(spots: readonly SpotWithState[], sort: SortKey): SpotWithState[] {
  const out = spots.slice()
  if (sort === 'near') {
    // Spots with no distance (no location chosen) sink rather than sorting first.
    out.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
  } else {
    out.sort((a, b) => (b.seatsFree ?? -1) - (a.seatsFree ?? -1))
  }
  return out
}

export interface RadiusResult {
  spots: SpotWithState[]
  /** True when nothing was within NEAR_RADIUS_KM and the search was widened. */
  widened: boolean
  radiusKm: number
}

/**
 * "No spots within range, so widen the radius and say clearly that it did."
 * With no origin there is no radius to apply, so everything is in range.
 */
export function withinRadius(spots: readonly SpotWithState[]): RadiusResult {
  const hasDistance = spots.some((s) => s.km !== null)
  if (!hasDistance) return { spots: spots.slice(), widened: false, radiusKm: Infinity }

  const near = spots.filter((s) => s.km !== null && s.km <= NEAR_RADIUS_KM)
  if (near.length > 0) return { spots: near, widened: false, radiusKm: NEAR_RADIUS_KM }

  const wide = spots.filter((s) => s.km !== null && s.km <= WIDE_RADIUS_KM)
  if (wide.length > 0) return { spots: wide, widened: true, radiusKm: WIDE_RADIUS_KM }

  // Still nothing — show everything rather than an empty screen, and say so.
  return { spots: spots.slice(), widened: true, radiusKm: Infinity }
}
