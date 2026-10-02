import { describe, expect, it } from 'vitest'
import type { Spot, SpotWithState } from '../types'
import { activeFilterCount, applyFilters, sortSpots, withinRadius } from './filters'
import { NEAR_RADIUS_KM } from './distance'

const base: Spot = {
  id: 1,
  name: 'A',
  area: 'Kent Ridge',
  address: '',
  lat: 1.2966,
  lng: 103.773,
  totalSeats: 100,
  ventilation: 'Air-con',
  power: 'Every desk',
  noise: 'Quiet',
  hours: '9am–9pm',
  open24h: false,
  note: '',
}

function state(spot: Partial<Spot>, over: Partial<SpotWithState> = {}): SpotWithState {
  return {
    spot: { ...base, ...spot },
    latest: null,
    reportedMinsAgo: 10,
    seatsFree: 20,
    crowd: 2,
    status: 'plenty',
    stale: false,
    km: 1,
    ...over,
  }
}

describe('applyFilters', () => {
  it('returns everything when nothing is selected', () => {
    const spots = [state({ id: 1 }), state({ id: 2, ventilation: 'Fans' })]
    expect(applyFilters(spots, {})).toHaveLength(2)
  })

  it('"seats free now" rejects a spot whose only report is stale', () => {
    const fresh = state({ id: 1 }, { reportedMinsAgo: 10, seatsFree: 5 })
    const stale = state({ id: 2 }, { reportedMinsAgo: 400, seatsFree: 40, stale: true })
    const result = applyFilters([fresh, stale], { seats: true })
    expect(result.map((s) => s.spot.id)).toEqual([1])
  })

  it('"seats free now" rejects a spot with no reports and a full one', () => {
    const none = state({ id: 1 }, { reportedMinsAgo: null, seatsFree: null, stale: true })
    const full = state({ id: 2 }, { seatsFree: 0 })
    expect(applyFilters([none, full], { seats: true })).toHaveLength(0)
  })

  it('filters on the static facts', () => {
    const spots = [
      state({ id: 1, ventilation: 'Fans' }),
      state({ id: 2, power: 'None' }),
      state({ id: 3, noise: 'Lively' }),
      state({ id: 4, open24h: true }),
      state({ id: 5 }),
    ]
    expect(applyFilters(spots, { aircon: true }).map((s) => s.spot.id)).toEqual([2, 3, 4, 5])
    expect(applyFilters(spots, { power: true }).map((s) => s.spot.id)).toEqual([1, 3, 4, 5])
    expect(applyFilters(spots, { quiet: true }).map((s) => s.spot.id)).toEqual([1, 2, 4, 5])
    expect(applyFilters(spots, { h24: true }).map((s) => s.spot.id)).toEqual([4])
  })

  it('combines filters with AND', () => {
    const spots = [
      state({ id: 1, open24h: true, ventilation: 'Fans' }),
      state({ id: 2, open24h: true }),
      state({ id: 3 }),
    ]
    expect(applyFilters(spots, { h24: true, aircon: true }).map((s) => s.spot.id)).toEqual([2])
  })

  it('can produce an empty result, which the UI explains', () => {
    const spots = [state({ id: 1, ventilation: 'Fans', open24h: false })]
    expect(applyFilters(spots, { aircon: true, h24: true })).toHaveLength(0)
  })
})

describe('activeFilterCount', () => {
  it('counts only the ones switched on', () => {
    expect(activeFilterCount({})).toBe(0)
    expect(activeFilterCount({ aircon: true, quiet: false })).toBe(1)
    expect(activeFilterCount({ aircon: true, quiet: true })).toBe(2)
  })
})

describe('sortSpots', () => {
  it('sorts by most seats, sinking spots with no data', () => {
    const spots = [
      state({ id: 1 }, { seatsFree: 5 }),
      state({ id: 2 }, { seatsFree: null }),
      state({ id: 3 }, { seatsFree: 40 }),
    ]
    expect(sortSpots(spots, 'seats').map((s) => s.spot.id)).toEqual([3, 1, 2])
  })

  it('sorts by distance, sinking spots with no distance', () => {
    const spots = [
      state({ id: 1 }, { km: 5 }),
      state({ id: 2 }, { km: null }),
      state({ id: 3 }, { km: 0.4 }),
    ]
    expect(sortSpots(spots, 'near').map((s) => s.spot.id)).toEqual([3, 1, 2])
  })

  it('does not mutate its input', () => {
    const spots = [state({ id: 1 }, { seatsFree: 1 }), state({ id: 2 }, { seatsFree: 9 })]
    sortSpots(spots, 'seats')
    expect(spots.map((s) => s.spot.id)).toEqual([1, 2])
  })
})

describe('withinRadius', () => {
  it('keeps the near set and does not claim it widened', () => {
    const spots = [state({ id: 1 }, { km: 0.5 }), state({ id: 2 }, { km: 8 })]
    const r = withinRadius(spots)
    expect(r.widened).toBe(false)
    expect(r.radiusKm).toBe(NEAR_RADIUS_KM)
    expect(r.spots.map((s) => s.spot.id)).toEqual([1])
  })

  it('widens and says so when nothing is close', () => {
    const spots = [state({ id: 1 }, { km: 4 }), state({ id: 2 }, { km: 9 })]
    const r = withinRadius(spots)
    expect(r.widened).toBe(true)
    expect(r.radiusKm).toBe(10)
    expect(r.spots).toHaveLength(2)
  })

  it('falls back to everything rather than an empty screen', () => {
    const spots = [state({ id: 1 }, { km: 40 })]
    const r = withinRadius(spots)
    expect(r.widened).toBe(true)
    expect(r.spots).toHaveLength(1)
  })

  it('applies no radius when no location was chosen', () => {
    const spots = [state({ id: 1 }, { km: null }), state({ id: 2 }, { km: null })]
    const r = withinRadius(spots)
    expect(r.widened).toBe(false)
    expect(r.spots).toHaveLength(2)
  })
})
