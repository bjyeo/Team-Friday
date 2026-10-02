import { beforeEach, describe, expect, it } from 'vitest'
import type { PendingReport, Report, Session } from '../../types'
import { EMPTY_NOTIFICATION_STATE, type NotificationState } from '../notifications/types'
import { StorageError, type StorageAdapter } from './adapter'
import { MAX_ATTEMPTS, ReportQueue } from './reportQueue'

const report = (over: Partial<Report> = {}): Report => ({
  id: 'r1',
  spotId: 1,
  crowd: 2,
  seatsFree: 20,
  createdAt: 1_700_000_000_000,
  reportedBy: 'a@u.nus.edu',
  ...over,
})

/** A store whose writes can be made to fail on command. */
class FlakyAdapter implements StorageAdapter {
  reports: Report[] = []
  pending: PendingReport[] = []
  failWrites = false

  async loadReports() {
    return this.reports
  }
  async saveReport(r: Report) {
    if (this.failWrites) throw new StorageError('quota exceeded')
    this.reports = [...this.reports.filter((x) => x.id !== r.id), r]
  }
  async loadSession(): Promise<Session | null> {
    return null
  }
  async saveSession() {}
  async loadPending() {
    return this.pending
  }
  async savePending(p: PendingReport[]) {
    this.pending = p
  }
  async loadNotifications(): Promise<NotificationState> {
    return EMPTY_NOTIFICATION_STATE
  }
  async saveNotifications() {}
}

describe('ReportQueue', () => {
  let adapter: FlakyAdapter
  let queue: ReportQueue

  beforeEach(() => {
    adapter = new FlakyAdapter()
    queue = new ReportQueue(adapter)
  })

  it('saves a report when the store is healthy', async () => {
    const result = await queue.send(report())
    expect(result).toEqual({ sent: true, error: null })
    expect(adapter.reports).toHaveLength(1)
    expect(adapter.pending).toHaveLength(0)
  })

  it('keeps the answer and says it was not saved when the write fails', async () => {
    adapter.failWrites = true
    const result = await queue.send(report())

    expect(result.sent).toBe(false)
    expect(result.error).toContain('quota exceeded')
    expect(adapter.reports).toHaveLength(0)
    expect(adapter.pending).toHaveLength(1)
    expect(adapter.pending[0]?.attempts).toBe(1)
  })

  it('sends the queued report once the store recovers', async () => {
    adapter.failWrites = true
    await queue.send(report())

    adapter.failWrites = false
    const { sent, stillPending } = await queue.flush()

    expect(sent.map((r) => r.id)).toEqual(['r1'])
    expect(stillPending).toHaveLength(0)
    expect(adapter.pending).toHaveLength(0)
    expect(adapter.reports).toHaveLength(1)
    // The retry must not leave queue bookkeeping on the stored report.
    expect(adapter.reports[0]).not.toHaveProperty('attempts')
  })

  it('counts attempts up while the store stays broken', async () => {
    adapter.failWrites = true
    await queue.send(report())
    await queue.flush()
    expect(adapter.pending[0]?.attempts).toBe(2)
    await queue.flush()
    expect(adapter.pending[0]?.attempts).toBe(3)
  })

  it('gives up rather than retrying forever', async () => {
    adapter.pending = [{ ...report(), attempts: MAX_ATTEMPTS, lastError: 'nope' }]
    adapter.failWrites = false

    const { sent, stillPending } = await queue.flush()
    expect(sent).toHaveLength(0)
    expect(stillPending).toHaveLength(0)
    expect(adapter.reports).toHaveLength(0)
  })

  it('replaying a report does not duplicate it', async () => {
    await queue.send(report())
    await queue.send(report())
    expect(adapter.reports).toHaveLength(1)
  })

  it('flushing an empty queue is a no-op', async () => {
    const r = await queue.flush()
    expect(r).toEqual({ sent: [], stillPending: [] })
  })
})
