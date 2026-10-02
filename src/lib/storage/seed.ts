import type { Report, ReportableCrowd } from '../../types'

/**
 * The hand-seeded report history, taken from the design mockup. Ages are
 * relative to the moment the store is first opened, so a student arriving for
 * the first time sees a plausible mix rather than a wall of year-old data.
 *
 * Spot 7 is absent on purpose: it is the "no reports at all" case the app has
 * to show honestly rather than guess at.
 */
const SEED: { spotId: number; seatsFree: number; crowd: ReportableCrowd; minsAgo: number }[] = [
  { spotId: 1, seatsFree: 23, crowd: 2, minsAgo: 12 },
  { spotId: 2, seatsFree: 4, crowd: 3, minsAgo: 35 },
  { spotId: 3, seatsFree: 31, crowd: 1, minsAgo: 5 },
  { spotId: 4, seatsFree: 0, crowd: 4, minsAgo: 20 },
  { spotId: 5, seatsFree: 41, crowd: 1, minsAgo: 8 },
  { spotId: 6, seatsFree: 14, crowd: 1, minsAgo: 250 },
  { spotId: 8, seatsFree: 9, crowd: 3, minsAgo: 100 },
  { spotId: 9, seatsFree: 12, crowd: 2, minsAgo: 25 },
  { spotId: 10, seatsFree: 3, crowd: 3, minsAgo: 60 },
  { spotId: 11, seatsFree: 18, crowd: 2, minsAgo: 130 },
  { spotId: 12, seatsFree: 7, crowd: 2, minsAgo: 200 },
]

export function seedReports(now: number): Report[] {
  return SEED.map((s) => ({
    id: `seed-${s.spotId}`,
    spotId: s.spotId,
    crowd: s.crowd,
    seatsFree: s.seatsFree,
    createdAt: now - s.minsAgo * 60_000,
    reportedBy: null,
  }))
}

export function isSeedReport(report: Report): boolean {
  return report.id.startsWith('seed-')
}
