import type { PendingReport, Report, Session } from '../../types'
import type { NotificationState } from '../notifications/types'

/**
 * Everything the app needs from a backend. The local implementation keeps all
 * of it in localStorage; swapping in a hosted store means writing one more
 * class against this interface and changing the line in `index.ts`.
 *
 * Every method is async even though the local one resolves immediately — so
 * the UI already handles latency and failure, and a remote store needs no
 * changes above this line.
 */
export interface StorageAdapter {
  loadReports(): Promise<Report[]>
  /** Rejects on failure; the caller is expected to queue and retry. */
  saveReport(report: Report): Promise<void>

  loadSession(): Promise<Session | null>
  saveSession(session: Session | null): Promise<void>

  /** Reports that failed to send and are waiting for another try. */
  loadPending(): Promise<PendingReport[]>
  savePending(pending: PendingReport[]): Promise<void>

  /**
   * The notification connector's whole state — connected address, preferences,
   * watchlist, outbox, alert history. Kept as one blob so this interface does
   * not grow a pair of methods every time the connector learns a new trick.
   */
  loadNotifications(): Promise<NotificationState>
  saveNotifications(state: NotificationState): Promise<void>
}

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'StorageError'
  }
}
