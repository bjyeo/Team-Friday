import { describe, expect, it } from 'vitest'
import type { Report, Spot } from '../types'
import {
  buildSpotState,
  estimateSeatsFree,
  latestReport,
  seatStatus,
} from './spotState'

const MIN = 60_000
const NOW = 1_700_000_000_000

const spot = (over: Partial<Spot> = {}): Spot => ({
  id: 1,
  name: 'Test Library',
  area: 'Kent Ridge',
  address: '1 Test Road',
  lat: 1.2966,
  lng: 103.773,
  totalSeats: 100,
  ventilation: 'Air-con',
  power: 'Every desk',
  noise: 'Quiet',
  hours: '9am–9pm',
  open24h: false,
  note: '',
  ...over,
})

const report = (over: Partial<Report> = {}): Report => ({
  id: 'r1',
  spotId: 1,
  crowd: 2,
  seatsFree: 20,
  createdAt: NOW - 10 * MIN,
  reportedBy: null,
  ...over,
})

describe('seatStatus', () => {
  it('is unknown when nobody has reported', () => {
    expect(seatStatus(null, 100)).toBe('unknown')
  })

  it('is full at zero seats', () => {
    expect(seatStatus(0, 100)).toBe('full')
  })

  it('is "few" below 15% of capacity and "plenty" at or above it', () => {
    expect(seatStatus(14, 100)).toBe('few')
    expect(seatStatus(15, 100)).toBe('plenty')
  })

  it('does not divide by a zero capacity', () => {
    expect(seatStatus(3, 0)).toBe('plenty')
  })
})

describe('estimateSeatsFree', () => {
  it('maps a one-tap crowd level onto a seat estimate', () => {
    expect(estimateSeatsFree(1, 100)).toBe(45)
    expect(estimateSeatsFree(2, 100)).toBe(20)
    expect(estimateSeatsFree(3, 100)).toBe(7)
    expect(estimateSeatsFree(4, 100)).toBe(0)
  })

  it('reports no seats when a student says it is full, whatever the size', () => {
    expect(estimateSeatsFree(4, 1000)).toBe(0)
  })
})

describe('latestReport', () => {
  it('picks the newest report for the spot and ignores other spots', () => {
    const reports = [
      report({ id: 'old', createdAt: NOW - 60 * MIN, seatsFree: 5 }),
      report({ id: 'new', createdAt: NOW - 2 * MIN, seatsFree: 40 }),
      report({ id: 'other', spotId: 2, createdAt: NOW, seatsFree: 99 }),
    ]
    expect(latestReport(reports, 1)?.id).toBe('new')
  })

  it('returns null when the spot has no reports', () => {
    expect(latestReport([report({ spotId: 2 })], 1)).toBeNull()
  })
})

describe('buildSpotState', () => {
  it('never invents a crowd level for a spot with no reports', () => {
    const s = buildSpotState(spot(), [], null, NOW)
    expect(s.crowd).toBe(0)
    expect(s.seatsFree).toBeNull()
    expect(s.status).toBe('unknown')
    expect(s.stale).toBe(true)
    expect(s.reportedMinsAgo).toBeNull()
  })

  it('uses the freshest report', () => {
    const s = buildSpotState(
      spot(),
      [
        report({ id: 'a', createdAt: NOW - 90 * MIN, seatsFree: 2, crowd: 4 }),
        report({ id: 'b', createdAt: NOW - 5 * MIN, seatsFree: 30, crowd: 1 }),
      ],
      null,
      NOW,
    )
    expect(s.seatsFree).toBe(30)
    expect(s.crowd).toBe(1)
    expect(s.reportedMinsAgo).toBe(5)
    expect(s.stale).toBe(false)
  })

  it('marks a spot stale when its only report is over three hours old', () => {
    const s = buildSpotState(spot(), [report({ createdAt: NOW - 200 * MIN })], null, NOW)
    expect(s.stale).toBe(true)
    expect(s.seatsFree).toBe(20) // still shown, but labelled
  })

  it('computes distance only when an origin is given', () => {
    expect(buildSpotState(spot(), [], null, NOW).km).toBeNull()
    const near = buildSpotState(spot(), [], { lat: 1.2966, lng: 103.773 }, NOW)
    expect(near.km).toBeCloseTo(0, 3)
  })
})
