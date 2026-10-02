import { LocalStorageAdapter, safeLocalStorage } from './localAdapter'
import type { StorageAdapter } from './adapter'

export { StorageError } from './adapter'
export type { StorageAdapter } from './adapter'
export { LocalStorageAdapter, MemoryStorage, safeLocalStorage } from './localAdapter'
export { ReportQueue, MAX_ATTEMPTS } from './reportQueue'
export { seedReports, isSeedReport } from './seed'

/**
 * The one line to change when a real backend arrives. Everything above this
 * point talks to `StorageAdapter`, not to localStorage.
 */
export function createStorage(): StorageAdapter {
  return new LocalStorageAdapter(safeLocalStorage())
}
