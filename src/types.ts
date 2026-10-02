/** 0 means "nobody has told us" — it is never a value a student can report. */
export type CrowdLevel = 0 | 1 | 2 | 3 | 4
export type ReportableCrowd = Exclude<CrowdLevel, 0>

export type Ventilation = 'Air-con' | 'Fans' | 'Open air'
export type Power = 'Every desk' | 'Along the walls' | 'A few tables' | 'None'
export type Noise = 'Quiet' | 'Some chatter' | 'Lively'

/** Static facts about a place. Seeded by hand, never written by the app. */
export interface Spot {
  id: number
  name: string
  area: string
  address: string
  lat: number
  lng: number
  totalSeats: number
  ventilation: Ventilation
  power: Power
  noise: Noise
  hours: string
  open24h: boolean
  note: string
}

/** One student's one-tap answer to "how full is it now". */
export interface Report {
  id: string
  spotId: number
  crowd: ReportableCrowd
  /** Exact count when known (seeded history); otherwise estimated from `crowd`. */
  seatsFree: number
  createdAt: number
  /** School email of the reporter, or null for seeded history. */
  reportedBy: string | null
}

/** A report that has not reached the store yet. Kept so a failed send can retry. */
export interface PendingReport extends Report {
  attempts: number
  lastError: string | null
}

export interface Session {
  email: string
  school: string
  signedInAt: number
}

export type SeatStatus = 'plenty' | 'few' | 'full' | 'unknown'

export type FilterKey = 'seats' | 'aircon' | 'power' | 'quiet' | 'h24'
export type Filters = Partial<Record<FilterKey, boolean>>
export type SortKey = 'seats' | 'near'
export type ListStyle = 'Ledger' | 'Tiles' | 'Gauge'

export interface Coords {
  lat: number
  lng: number
}

/** A spot joined to its freshest report, plus distance from the viewer. */
export interface SpotWithState {
  spot: Spot
  latest: Report | null
  /** Minutes since the latest report, or null when there are none. */
  reportedMinsAgo: number | null
  seatsFree: number | null
  crowd: CrowdLevel
  status: SeatStatus
  /** True when the only information is older than STALE_AFTER_MINS, or absent. */
  stale: boolean
  km: number | null
}
