import type { PendingReport, Report, Session } from '../../types'
import { StorageError, type StorageAdapter } from './adapter'

const KEYS = {
  reports: 'spotr.reports.v1',
  session: 'spotr.session.v1',
  pending: 'spotr.pending.v1',
} as const

/**
 * A localStorage-backed store. Free, needs no account and works offline, at the
 * cost that reports stay on the device that made them. Private-browsing modes
 * and full quotas both throw on write, which is why saveReport can reject — the
 * app queues and retries rather than losing the student's tap.
 */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly store: Storage = window.localStorage) {}

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = this.store.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      // Corrupt or unreadable — start clean rather than crashing the page.
      return fallback
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.store.setItem(key, JSON.stringify(value))
    } catch (cause) {
      throw new StorageError(`Could not write ${key}`, cause)
    }
  }

  async loadReports(): Promise<Report[]> {
    return this.read<Report[]>(KEYS.reports, [])
  }

  async saveReport(report: Report): Promise<void> {
    const all = await this.loadReports()
    // Replaying a queued report must not duplicate it.
    const next = all.filter((r) => r.id !== report.id)
    next.push(report)
    this.write(KEYS.reports, next)
  }

  async loadSession(): Promise<Session | null> {
    return this.read<Session | null>(KEYS.session, null)
  }

  async saveSession(session: Session | null): Promise<void> {
    if (session === null) {
      try {
        this.store.removeItem(KEYS.session)
      } catch (cause) {
        throw new StorageError('Could not clear the session', cause)
      }
      return
    }
    this.write(KEYS.session, session)
  }

  async loadPending(): Promise<PendingReport[]> {
    return this.read<PendingReport[]>(KEYS.pending, [])
  }

  async savePending(pending: PendingReport[]): Promise<void> {
    this.write(KEYS.pending, pending)
  }
}

/** An in-memory Storage, for tests and for browsers that deny localStorage. */
export class MemoryStorage implements Storage {
  private map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }
  clear(): void {
    this.map.clear()
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
  [name: string]: unknown
}

/** localStorage throws on access in some privacy modes; fall back silently. */
export function safeLocalStorage(): Storage {
  try {
    const probe = '__spotr_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return new MemoryStorage()
  }
}
