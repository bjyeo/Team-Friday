import type { PendingReport, Report } from '../../types'
import type { StorageAdapter } from './adapter'

export const MAX_ATTEMPTS = 5

export interface SendResult {
  sent: boolean
  /** Set when the send failed and the report was queued instead. */
  error: string | null
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/**
 * "The report button fails to send, so keep the answer locally and retry, and
 * tell the student it wasn't saved."
 *
 * Nothing here is fire-and-forget: a failed send lands in the pending list and
 * the caller gets `sent: false` so it can say so out loud.
 */
export class ReportQueue {
  constructor(private readonly storage: StorageAdapter) {}

  async send(report: Report): Promise<SendResult> {
    try {
      await this.storage.saveReport(report)
      return { sent: true, error: null }
    } catch (err) {
      const error = describe(err)
      await this.enqueue({ ...report, attempts: 1, lastError: error })
      return { sent: false, error }
    }
  }

  private async enqueue(pending: PendingReport): Promise<void> {
    try {
      const all = await this.storage.loadPending()
      const next = all.filter((p) => p.id !== pending.id)
      next.push(pending)
      await this.storage.savePending(next)
    } catch {
      // If even the queue cannot be written there is nowhere left to put it.
      // The caller has already been told the report was not saved.
    }
  }

  /**
   * Retries everything queued. Returns the reports that went through, so the
   * caller can fold them into the list it is already showing.
   */
  async flush(): Promise<{ sent: Report[]; stillPending: PendingReport[] }> {
    let queue: PendingReport[]
    try {
      queue = await this.storage.loadPending()
    } catch {
      return { sent: [], stillPending: [] }
    }
    if (queue.length === 0) return { sent: [], stillPending: [] }

    const sent: Report[] = []
    const stillPending: PendingReport[] = []

    for (const pending of queue) {
      const { attempts, lastError: _lastError, ...report } = pending
      if (attempts >= MAX_ATTEMPTS) continue // Give up rather than retry forever.
      try {
        await this.storage.saveReport(report)
        sent.push(report)
      } catch (err) {
        stillPending.push({ ...pending, attempts: attempts + 1, lastError: describe(err) })
      }
    }

    try {
      await this.storage.savePending(stillPending)
    } catch {
      // Same as above — the retry list itself is best-effort.
    }
    return { sent, stillPending }
  }
}
