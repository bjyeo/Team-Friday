import { describe, expect, it } from 'vitest'
import type { Report, Spot, SpotWithState } from '../../types'
import { COOLDOWN_MINS, detectSeatAlerts, type AlertHistory } from './detect'
import { DEFAULT_PREFS, type NotificationPrefs } from './types'

const MIN = 60_000
const NOW = 1_700_000_000_000

const spot: Spot = {
  id: 1,
  name: 'NUS Central Library',
  area: 'Kent Ridge',
  address: '',
  lat: 1.3,
  lng: 103.7,
  totalSeats: 100,
  ventilation: 'Air-con',
  power: 'Every desk',
  noise: 'Quiet',
  hours: '',
  open24h: false,
  note: '',
}

const report = (over: Partial<Report> = {}): Report => ({
  id: 'r1',
  spotId: 1,
  crowd: 1,
  seatsFree: 20,
  createdAt: NOW - 5 * MIN,
  reportedBy: null,
  ...over,
})

function state(over: Partial<SpotWithState> = {}, spotOver: Partial<Spot> = {}): SpotWithState {
  const latest = over.latest !== undefined ? over.latest : report()
  return {
    spot: { ...spot, ...spotOver },
    latest,
    reportedMinsAgo: 5,
    seatsFree: 20,
    crowd: 1,
    status: 'plenty',
    stale: false,
    km: 1,
    ...over,
  }
}

const prefs = (over: Partial<NotificationPrefs> = {}): NotificationPrefs => ({
  ...DEFAULT_PREFS,
  ...over,
})

/** Watching since the dawn of time unless a test says otherwise. */
const history = (over: Partial<AlertHistory> = {}): AlertHistory => ({
  lastAlertAt: {},
  watchingSince: {},
  ...over,
})

describe('detectSeatAlerts', () => {
  it('alerts for a watched spot with fresh seats', () => {
    const alerts = detectSeatAlerts([state()], [1], prefs(), history(), NOW)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      kind: 'seats-free',
      spotId: 1,
      spotName: 'NUS Central Library',
      seatsFree: 20,
      totalSeats: 100,
    })
  })

  it('ignores spots that are not watched', () => {
    expect(detectSeatAlerts([state()], [], prefs(), history(), NOW)).toHaveLength(0)
    expect(detectSeatAlerts([state()], [99], prefs(), history(), NOW)).toHaveLength(0)
  })

  it('never alerts on stale information', () => {
    const stale = state({ stale: true, reportedMinsAgo: 400 })
    expect(detectSeatAlerts([stale], [1], prefs(), history(), NOW)).toHaveLength(0)
  })

  it('never alerts for a spot nobody has reported', () => {
    const none = state({ latest: null, reportedMinsAgo: null, seatsFree: null, stale: true })
    expect(detectSeatAlerts([none], [1], prefs(), history(), NOW)).toHaveLength(0)
  })

  it('respects the minimum seat threshold', () => {
    const two = state({ seatsFree: 2 })
    expect(detectSeatAlerts([two], [1], prefs({ minSeats: 3 }), history(), NOW)).toHaveLength(0)
    expect(detectSeatAlerts([two], [1], prefs({ minSeats: 2 }), history(), NOW)).toHaveLength(1)
  })

  it('does not alert when a full spot is watched', () => {
    const full = state({ seatsFree: 0, status: 'full' })
    expect(detectSeatAlerts([full], [1], prefs(), history(), NOW)).toHaveLength(0)
  })

  it('is off entirely when the preference is off', () => {
    expect(detectSeatAlerts([state()], [1], prefs({ seatsFree: false }), history(), NOW)).toHaveLength(0)
  })

  describe('not spamming', () => {
    it('ignores a report that predates the student watching the spot', () => {
      // The seeded report is 5 minutes old; watching started a minute ago.
      // Pinging here would be telling them about the card they just tapped.
      const s = state()
      const h = history({ watchingSince: { '1': NOW - MIN } })
      expect(detectSeatAlerts([s], [1], prefs(), h, NOW)).toHaveLength(0)
    })

    it('alerts on the first report that lands after watching began', () => {
      const watchedAt = NOW - 10 * MIN
      const fresh = state({ latest: report({ id: 'r2', createdAt: NOW - MIN }) })
      const h = history({ watchingSince: { '1': watchedAt } })
      expect(detectSeatAlerts([fresh], [1], prefs(), h, NOW)).toHaveLength(1)
    })

    it('does not re-alert on the same report', () => {
      const s = state()
      const first = detectSeatAlerts([s], [1], prefs(), history(), NOW)
      expect(first).toHaveLength(1)

      // Cooldown has passed, but no new report has arrived since the alert.
      const later = NOW + (COOLDOWN_MINS + 10) * MIN
      const again = detectSeatAlerts([s], [1], prefs(), history({ lastAlertAt: { '1': NOW } }), later)
      expect(again).toHaveLength(0)
    })

    it('does not alert twice inside the cooldown even with a newer report', () => {
      const fresh = state({ latest: report({ id: 'r2', createdAt: NOW + 2 * MIN }) })
      const within = NOW + 5 * MIN
      expect(detectSeatAlerts([fresh], [1], prefs(), history({ lastAlertAt: { '1': NOW } }), within)).toHaveLength(0)
    })

    it('alerts again once the cooldown passes and a new report lands', () => {
      const later = NOW + (COOLDOWN_MINS + 5) * MIN
      const fresh = state({ latest: report({ id: 'r2', createdAt: later - MIN }) })
      expect(detectSeatAlerts([fresh], [1], prefs(), history({ lastAlertAt: { '1': NOW } }), later)).toHaveLength(1)
    })

    it('gives each watched spot its own cooldown', () => {
      const a = state({}, { id: 1 })
      const b = state({ latest: report({ spotId: 2 }) }, { id: 2, name: 'UTown' })
      const alerts = detectSeatAlerts([a, b], [1, 2], prefs(), history({ lastAlertAt: { '1': NOW } }), NOW)
      expect(alerts.map((x) => x.spotId)).toEqual([2])
    })
  })

  it('builds a stable id from the spot and the triggering report', () => {
    const s = state({ latest: report({ createdAt: 123 }) })
    const [alert] = detectSeatAlerts([s], [1], prefs(), history(), NOW)
    expect(alert?.id).toBe('alert-1-123')
  })
})
