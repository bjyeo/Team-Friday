import { describe, expect, it } from 'vitest'
import {
  ago,
  freshnessLabel,
  freshnessLabelShort,
  isStale,
  minsSince,
  STALE_AFTER_MINS,
  staleFraction,
  staleNote,
} from './freshness'

const MIN = 60_000

describe('minsSince', () => {
  it('counts whole minutes', () => {
    const now = 1_000_000_000
    expect(minsSince(now - 90_000, now)).toBe(1)
    expect(minsSince(now - 12 * MIN, now)).toBe(12)
  })

  it('never goes negative for a clock skewed into the future', () => {
    expect(minsSince(2000, 1000)).toBe(0)
  })
})

describe('ago', () => {
  it('reads in minutes under an hour', () => {
    expect(ago(0)).toBe('0 min ago')
    expect(ago(59)).toBe('59 min ago')
  })

  it('switches to hours, dropping a zero minute remainder', () => {
    expect(ago(60)).toBe('1 h ago')
    expect(ago(130)).toBe('2 h 10 min ago')
    expect(ago(250)).toBe('4 h 10 min ago')
  })
})

describe('isStale', () => {
  it('treats no report as stale', () => {
    expect(isStale(null)).toBe(true)
  })

  it('turns stale exactly at the three-hour mark', () => {
    expect(isStale(STALE_AFTER_MINS - 1)).toBe(false)
    expect(isStale(STALE_AFTER_MINS)).toBe(true)
  })
})

describe('labels', () => {
  it('labels a stale card rather than pretending it is fresh', () => {
    expect(freshnessLabel(250)).toBe('Unconfirmed · last report 4 h 10 min ago')
    expect(freshnessLabelShort(250)).toBe('Unconfirmed')
  })

  it('says plainly when there are no reports', () => {
    expect(freshnessLabel(null)).toBe('No reports yet')
    expect(staleNote(null)).toContain('Nobody has reported')
  })

  it('shows the age when fresh', () => {
    expect(freshnessLabel(12)).toBe('Reported 12 min ago')
    expect(freshnessLabelShort(12)).toBe('12 min ago')
  })
})

describe('staleFraction', () => {
  it('is zero for an empty list', () => {
    expect(staleFraction([])).toBe(0)
  })

  it('counts missing and old reports alike', () => {
    expect(staleFraction([5, 10, null, 400])).toBe(0.5)
    expect(staleFraction([5, 10, 20, 30])).toBe(0)
  })
})
