import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Report, ReportableCrowd, Spot } from '../types'
import { ReportQueue, seedReports, type StorageAdapter } from '../lib/storage'
import { estimateSeatsFree } from '../lib/spotState'

export interface ReportOutcome {
  saved: boolean
  message: string
}

interface ReportsValue {
  reports: Report[]
  ready: boolean
  /** Reports waiting on a retry — shown as a banner so nothing fails silently. */
  pendingCount: number
  submit(spot: Spot, crowd: ReportableCrowd, reporterEmail: string | null): Promise<ReportOutcome>
  retryPending(): Promise<void>
}

const ReportsContext = createContext<ReportsValue | null>(null)

/** Report ids must survive a retry, so they are generated once at tap time. */
function newId(): string {
  const c = globalThis.crypto
  if (c && 'randomUUID' in c) return c.randomUUID()
  return `r-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

export function ReportsProvider({
  storage,
  children,
}: {
  storage: StorageAdapter
  children: ReactNode
}) {
  const [reports, setReports] = useState<Report[]>([])
  const [ready, setReady] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const queue = useRef(new ReportQueue(storage))

  useEffect(() => {
    queue.current = new ReportQueue(storage)
    let live = true

    async function load() {
      let stored: Report[] = []
      try {
        stored = await storage.loadReports()
      } catch {
        stored = []
      }

      // First ever open: lay down the seeded history relative to now, so the
      // freshness labels mean something instead of reading as months old.
      if (stored.length === 0) {
        const seeded = seedReports(Date.now())
        for (const r of seeded) {
          await storage.saveReport(r).catch(() => undefined)
        }
        stored = seeded
      }

      const { sent, stillPending } = await queue.current.flush()
      if (!live) return

      const byId = new Map(stored.map((r) => [r.id, r]))
      for (const r of sent) byId.set(r.id, r)

      setReports([...byId.values()])
      setPendingCount(stillPending.length)
      setReady(true)
    }

    void load()
    return () => {
      live = false
    }
  }, [storage])

  const submit = useCallback(
    async (
      spot: Spot,
      crowd: ReportableCrowd,
      reporterEmail: string | null,
    ): Promise<ReportOutcome> => {
      const report: Report = {
        id: newId(),
        spotId: spot.id,
        crowd,
        seatsFree: estimateSeatsFree(crowd, spot.totalSeats),
        createdAt: Date.now(),
        reportedBy: reporterEmail,
      }

      // Show it immediately either way — the student told us what they saw, and
      // the banner below says plainly whether it was saved.
      setReports((prev) => [...prev.filter((r) => r.id !== report.id), report])

      const result = await queue.current.send(report)
      if (result.sent) {
        return { saved: true, message: 'Thanks — the next student sees this.' }
      }

      const pending = await storage.loadPending().catch(() => [])
      setPendingCount(pending.length)
      return {
        saved: false,
        message: "Couldn't save that. It's kept on your phone and will retry.",
      }
    },
    [storage],
  )

  const retryPending = useCallback(async () => {
    const { sent, stillPending } = await queue.current.flush()
    if (sent.length > 0) {
      setReports((prev) => {
        const byId = new Map(prev.map((r) => [r.id, r]))
        for (const r of sent) byId.set(r.id, r)
        return [...byId.values()]
      })
    }
    setPendingCount(stillPending.length)
  }, [])

  // Retry whenever the browser says the network is back. Harmless for the
  // local store, and already correct for the day this talks to a server.
  useEffect(() => {
    const onOnline = () => void retryPending()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [retryPending])

  const value = useMemo(
    () => ({ reports, ready, pendingCount, submit, retryPending }),
    [reports, ready, pendingCount, submit, retryPending],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

export function useReports(): ReportsValue {
  const v = useContext(ReportsContext)
  if (!v) throw new Error('useReports must be used inside <ReportsProvider>')
  return v
}
