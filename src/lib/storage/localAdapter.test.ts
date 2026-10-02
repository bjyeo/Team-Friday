import { beforeEach, describe, expect, it } from 'vitest'
import type { Report } from '../../types'
import { StorageError } from './adapter'
import { LocalStorageAdapter, MemoryStorage } from './localAdapter'
import { seedReports } from './seed'
import { STALE_AFTER_MINS } from '../freshness'

const report = (over: Partial<Report> = {}): Report => ({
  id: 'r1',
  spotId: 1,
  crowd: 2,
  seatsFree: 20,
  createdAt: 1_700_000_000_000,
  reportedBy: null,
  ...over,
})

describe('LocalStorageAdapter', () => {
  let store: MemoryStorage
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    store = new MemoryStorage()
    adapter = new LocalStorageAdapter(store)
  })

  it('round-trips reports', async () => {
    await adapter.saveReport(report())
    await adapter.saveReport(report({ id: 'r2', spotId: 2 }))
    const all = await adapter.loadReports()
    expect(all.map((r) => r.id)).toEqual(['r1', 'r2'])
  })

  it('replaces rather than duplicates a report with the same id', async () => {
    await adapter.saveReport(report({ seatsFree: 1 }))
    await adapter.saveReport(report({ seatsFree: 9 }))
    const all = await adapter.loadReports()
    expect(all).toHaveLength(1)
    expect(all[0]?.seatsFree).toBe(9)
  })

  it('round-trips and clears the session', async () => {
    await adapter.saveSession({ email: 'a@u.nus.edu', school: 'NUS', signedInAt: 1 })
    expect((await adapter.loadSession())?.email).toBe('a@u.nus.edu')
    await adapter.saveSession(null)
    expect(await adapter.loadSession()).toBeNull()
  })

  it('starts clean instead of throwing on corrupt data', async () => {
    store.setItem('spotr.reports.v1', '{not json')
    expect(await adapter.loadReports()).toEqual([])
  })

  it('surfaces a write failure so the caller can queue', async () => {
    store.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    await expect(adapter.saveReport(report())).rejects.toBeInstanceOf(StorageError)
  })
})

describe('seedReports', () => {
  const NOW = 1_700_000_000_000

  it('seeds every spot except the one with no reports', () => {
    const seeded = seedReports(NOW)
    const ids = seeded.map((r) => r.spotId)
    expect(ids).not.toContain(7)
    expect(new Set(ids).size).toBe(seeded.length)
  })

  it('ages reports relative to the moment it is called', () => {
    const seeded = seedReports(NOW)
    const first = seeded.find((r) => r.spotId === 1)
    expect(first?.createdAt).toBe(NOW - 12 * 60_000)
  })

  it('leaves a minority stale, so the stale-labelling path is exercised', () => {
    const seeded = seedReports(NOW)
    const stale = seeded.filter((r) => (NOW - r.createdAt) / 60_000 >= STALE_AFTER_MINS)
    expect(stale.length).toBeGreaterThan(0)
    expect(stale.length).toBeLessThan(seeded.length / 2)
  })
})
