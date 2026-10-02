/**
 * Freshness is the guardrail the canvas names: no more than 1 in 5 cards may
 * show information older than three hours without being labelled. Everything
 * that decides "is this still true" lives here.
 */

export const STALE_AFTER_MINS = 180

/** Share of cards allowed to be stale before the guardrail is breached. */
export const STALE_CARD_BUDGET = 0.2

export function minsSince(timestamp: number, now: number): number {
  return Math.max(0, Math.floor((now - timestamp) / 60_000))
}

/** "12 min ago", "1 h ago", "4 h 10 min ago". */
export function ago(mins: number): string {
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return `${hours} h ${rest ? `${rest} min ` : ''}ago`
}

export function isStale(reportedMinsAgo: number | null): boolean {
  return reportedMinsAgo === null || reportedMinsAgo >= STALE_AFTER_MINS
}

/** The long line on a spot card and the detail pane. */
export function freshnessLabel(reportedMinsAgo: number | null): string {
  if (reportedMinsAgo === null) return 'No reports yet'
  if (reportedMinsAgo >= STALE_AFTER_MINS) return `Unconfirmed · last report ${ago(reportedMinsAgo)}`
  return `Reported ${ago(reportedMinsAgo)}`
}

/** The short line, used where the row is tight. */
export function freshnessLabelShort(reportedMinsAgo: number | null): string {
  if (reportedMinsAgo === null) return 'No reports yet'
  if (reportedMinsAgo >= STALE_AFTER_MINS) return 'Unconfirmed'
  return ago(reportedMinsAgo)
}

export function staleNote(reportedMinsAgo: number | null): string {
  return reportedMinsAgo === null
    ? 'Nobody has reported here yet. Seat count and crowd level are unknown.'
    : 'The last report is over 3 hours old, so the seat count may be wrong.'
}

/**
 * The guardrail measurement. Returns the fraction of the given cards whose
 * information is stale — every one of those must be labelled or hidden.
 */
export function staleFraction(reportedMinsAgo: readonly (number | null)[]): number {
  if (reportedMinsAgo.length === 0) return 0
  const stale = reportedMinsAgo.filter(isStale).length
  return stale / reportedMinsAgo.length
}
