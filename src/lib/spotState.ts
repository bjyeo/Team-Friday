import type {
  Coords,
  CrowdLevel,
  ReportableCrowd,
  Report,
  SeatStatus,
  Spot,
  SpotWithState,
} from '../types'
import { distanceKm } from './distance'
import { isStale, minsSince } from './freshness'

export const CROWD_LABELS: Record<CrowdLevel, string> = {
  0: 'No data',
  1: 'Quiet',
  2: 'Moderate',
  3: 'Busy',
  4: 'Full',
}

/** The four one-tap answers to "how full is it now". */
export const CROWD_CHOICES: { crowd: ReportableCrowd; label: string; blurb: string }[] = [
  { crowd: 1, label: 'Lots of space', blurb: 'Easy to find a seat' },
  { crowd: 2, label: 'Filling up', blurb: 'Still seats, but looking' },
  { crowd: 3, label: 'Almost full', blurb: 'A few left at most' },
  { crowd: 4, label: 'No seats', blurb: 'Nothing free right now' },
]

/** Below this share of seats free, "Few left" rather than "Seats free". */
const FEW_THRESHOLD = 0.15

/**
 * A one-tap report says how busy it feels, not how many chairs are empty. These
 * are the counts we infer from each answer — rough on purpose, and always shown
 * next to the crowd word that produced them.
 */
const FREE_SHARE_BY_CROWD: Record<ReportableCrowd, number> = {
  1: 0.45,
  2: 0.2,
  3: 0.07,
  4: 0,
}

export function estimateSeatsFree(crowd: ReportableCrowd, totalSeats: number): number {
  return Math.round(totalSeats * FREE_SHARE_BY_CROWD[crowd])
}

export function seatStatus(seatsFree: number | null, totalSeats: number): SeatStatus {
  if (seatsFree === null) return 'unknown'
  if (seatsFree <= 0) return 'full'
  if (totalSeats > 0 && seatsFree / totalSeats < FEW_THRESHOLD) return 'few'
  return 'plenty'
}

export const STATUS_LABELS: Record<SeatStatus, string> = {
  plenty: 'Seats free',
  few: 'Few left',
  full: 'Full',
  unknown: 'Unknown',
}

/** Maps a status onto the --st-* token family. */
export const STATUS_TOKEN: Record<SeatStatus, string> = {
  plenty: 'ok',
  few: 'few',
  full: 'full',
  unknown: 'unk',
}

export function latestReport(reports: readonly Report[], spotId: number): Report | null {
  let best: Report | null = null
  for (const r of reports) {
    if (r.spotId !== spotId) continue
    if (!best || r.createdAt > best.createdAt) best = r
  }
  return best
}

/**
 * Joins a spot to the freshest thing anyone said about it. A spot with no
 * reports keeps its card but carries no crowd level — it is never guessed.
 */
export function buildSpotState(
  spot: Spot,
  reports: readonly Report[],
  origin: Coords | null,
  now: number,
): SpotWithState {
  const latest = latestReport(reports, spot.id)
  const reportedMinsAgo = latest ? minsSince(latest.createdAt, now) : null
  const seatsFree = latest ? latest.seatsFree : null
  const crowd: CrowdLevel = latest ? latest.crowd : 0

  return {
    spot,
    latest,
    reportedMinsAgo,
    seatsFree,
    crowd,
    status: seatStatus(seatsFree, spot.totalSeats),
    stale: isStale(reportedMinsAgo),
    km: origin ? distanceKm(origin, { lat: spot.lat, lng: spot.lng }) : null,
  }
}

export function buildAllSpotStates(
  spots: readonly Spot[],
  reports: readonly Report[],
  origin: Coords | null,
  now: number,
): SpotWithState[] {
  return spots.map((s) => buildSpotState(s, reports, origin, now))
}
