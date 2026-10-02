/**
 * The primary outcome metric from the canvas: time from opening the site to
 * choosing a spot. "Choosing" is the moment a student taps through to Maps —
 * the point at which they commit to travelling.
 *
 * Measurements stay on the device. There is no analytics endpoint to send them
 * to, and adding one would mean an account, which this build does not have.
 * Read them from the console with `spotrMetrics()` during a test session.
 */

const KEY = 'spotr.metrics.v1'

export interface ChoiceMeasurement {
  spotId: number
  msToChoose: number
  /** Filters active at the moment of choosing, for reading the numbers later. */
  filterCount: number
  at: number
}

let openedAt = Date.now()

/** Called once when the app mounts, and again whenever a new search starts. */
export function markSessionStart(now = Date.now()): void {
  openedAt = now
}

export function msSinceStart(now = Date.now()): number {
  return now - openedAt
}

function read(): ChoiceMeasurement[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ChoiceMeasurement[]) : []
  } catch {
    return []
  }
}

export function recordChoice(spotId: number, filterCount: number, now = Date.now()): ChoiceMeasurement {
  const measurement: ChoiceMeasurement = {
    spotId,
    msToChoose: now - openedAt,
    filterCount,
    at: now,
  }
  try {
    const all = read()
    all.push(measurement)
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(-50)))
  } catch {
    /* Measurement is best-effort; never block the student's trip over it. */
  }
  return measurement
}

export function allMeasurements(): ChoiceMeasurement[] {
  return read()
}

/** The number the target is stated against: 8 of 10 students under 2 minutes. */
export function medianSecondsToChoose(): number | null {
  const times = read()
    .map((m) => m.msToChoose / 1000)
    .sort((a, b) => a - b)
  if (times.length === 0) return null
  const mid = Math.floor(times.length / 2)
  if (times.length % 2 === 1) return times[mid] ?? null
  const lo = times[mid - 1]
  const hi = times[mid]
  return lo !== undefined && hi !== undefined ? (lo + hi) / 2 : null
}

/** Exposed on window so a facilitator can read a test session's numbers. */
export function installMetricsConsoleHook(): void {
  ;(window as unknown as Record<string, unknown>).spotrMetrics = () => ({
    measurements: allMeasurements(),
    medianSecondsToChoose: medianSecondsToChoose(),
  })
}
