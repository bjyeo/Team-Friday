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
import type { SpotWithState } from '../types'
import {
  BrowserChannel,
  DEFAULT_PREFS,
  EmailChannel,
  EMPTY_NOTIFICATION_STATE,
  detectSeatAlerts,
  dispatch,
  notificationPermission,
  requestNotificationPermission,
  type DispatchRecord,
  type EmailConnection,
  type NotificationChannel,
  type NotificationPrefs,
  type NotificationState,
  type OutboxEntry,
  type PermissionState,
} from '../lib/notifications'
import { checkSchoolEmail } from '../lib/schoolEmail'
import type { StorageAdapter } from '../lib/storage'

interface NotificationsValue {
  ready: boolean
  connection: EmailConnection | null
  prefs: NotificationPrefs
  watchlist: number[]
  outbox: OutboxEntry[]
  permission: PermissionState
  /** The alerts fired this session, newest first. */
  recent: DispatchRecord[]

  connectEmail(address: string): Promise<{ ok: boolean; message: string }>
  disconnectEmail(): Promise<void>
  setPrefs(next: Partial<NotificationPrefs>): Promise<void>
  setChannel(channel: 'email' | 'browser', on: boolean): Promise<void>
  toggleWatch(spotId: number): Promise<void>
  isWatched(spotId: number): boolean
  askPermission(): Promise<PermissionState>
  clearOutbox(): Promise<void>
  /** Fires a sample alert through the enabled channels, so a student can see it work. */
  sendTestAlert(spot: SpotWithState): Promise<DispatchRecord | null>
  /** Called by the browse screen whenever spot state changes. */
  evaluate(states: readonly SpotWithState[]): Promise<void>
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

const MAX_OUTBOX = 50

export function NotificationsProvider({
  storage,
  children,
}: {
  storage: StorageAdapter
  children: ReactNode
}) {
  const [state, setState] = useState<NotificationState>(EMPTY_NOTIFICATION_STATE)
  const [ready, setReady] = useState(false)
  const [permission, setPermission] = useState<PermissionState>(() => notificationPermission())
  const [recent, setRecent] = useState<DispatchRecord[]>([])

  // Channels read through refs so a preference change does not rebuild them
  // mid-dispatch, and so the email channel always sees the current address.
  const stateRef = useRef(state)
  stateRef.current = state

  const persist = useCallback(
    async (next: NotificationState) => {
      setState(next)
      stateRef.current = next
      await storage.saveNotifications(next).catch(() => undefined)
    },
    [storage],
  )

  const queueOutbox = useCallback((entry: OutboxEntry) => {
    // Written through the ref rather than persist(): a dispatch can queue
    // several entries in one tick and each must see the previous one.
    const prev = stateRef.current
    const outbox = [entry, ...prev.outbox.filter((o) => o.id !== entry.id)].slice(0, MAX_OUTBOX)
    stateRef.current = { ...prev, outbox }
    setState(stateRef.current)
  }, [])

  const channels = useMemo<NotificationChannel[]>(
    () => [
      new BrowserChannel(),
      new EmailChannel(() => stateRef.current.connection, queueOutbox, null),
    ],
    [queueOutbox],
  )

  useEffect(() => {
    let live = true
    storage
      .loadNotifications()
      .then((loaded) => {
        if (!live) return
        setState(loaded)
        stateRef.current = loaded
      })
      .catch(() => undefined)
      .finally(() => {
        if (live) setReady(true)
      })
    return () => {
      live = false
    }
  }, [storage])

  const connectEmail = useCallback(
    async (address: string) => {
      // Reuse the school-email connector: alerts go to a student address, same
      // rule as sign-in, so one list governs both.
      const check = checkSchoolEmail(address)
      if (!check.ok) return { ok: false, message: check.message }

      await persist({
        ...stateRef.current,
        connection: {
          address: check.email,
          verified: false,
          connectedAt: Date.now(),
        },
      })
      return { ok: true, message: `Alerts will be addressed to ${check.email}.` }
    },
    [persist],
  )

  const disconnectEmail = useCallback(async () => {
    await persist({ ...stateRef.current, connection: null })
  }, [persist])

  const setPrefs = useCallback(
    async (next: Partial<NotificationPrefs>) => {
      const prefs = { ...stateRef.current.prefs, ...next }
      await persist({ ...stateRef.current, prefs })
    },
    [persist],
  )

  const setChannel = useCallback(
    async (channel: 'email' | 'browser', on: boolean) => {
      const prefs = {
        ...stateRef.current.prefs,
        channels: { ...stateRef.current.prefs.channels, [channel]: on },
      }
      await persist({ ...stateRef.current, prefs })
    },
    [persist],
  )

  const toggleWatch = useCallback(
    async (spotId: number) => {
      const cur = stateRef.current
      const on = cur.watchlist.includes(spotId)
      const watchlist = on
        ? cur.watchlist.filter((id) => id !== spotId)
        : [...cur.watchlist, spotId]

      // Stamping the moment watching begins is what stops an immediate ping
      // about a report the student has already seen on screen.
      const watchingSince = { ...cur.watchingSince }
      if (on) delete watchingSince[String(spotId)]
      else watchingSince[String(spotId)] = Date.now()

      await persist({ ...cur, watchlist, watchingSince })
    },
    [persist],
  )

  const isWatched = useCallback((spotId: number) => state.watchlist.includes(spotId), [state.watchlist])

  const askPermission = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    return result
  }, [])

  const clearOutbox = useCallback(async () => {
    await persist({ ...stateRef.current, outbox: [] })
  }, [persist])

  /**
   * Detects, dispatches and records. Kept here rather than in the browse screen
   * so every entry point into spot state goes through the same cooldown
   * bookkeeping — alerting twice is the failure mode students notice.
   */
  const evaluate = useCallback(
    async (states: readonly SpotWithState[]) => {
      const cur = stateRef.current
      const now = Date.now()
      const alerts = detectSeatAlerts(
        states,
        cur.watchlist,
        cur.prefs,
        { lastAlertAt: cur.lastAlertAt, watchingSince: cur.watchingSince },
        now,
      )
      if (alerts.length === 0) return

      // Stamp the cooldown before dispatching, so a slow channel cannot let a
      // second evaluate() slip through and double-send.
      const lastAlertAt = { ...cur.lastAlertAt }
      for (const a of alerts) lastAlertAt[String(a.spotId)] = now
      stateRef.current = { ...stateRef.current, lastAlertAt }

      const records = await dispatch(alerts, channels, cur.prefs)
      setRecent((prev) => [...records, ...prev].slice(0, 20))
      await persist(stateRef.current)
    },
    [channels, persist],
  )

  const sendTestAlert = useCallback(
    async (spot: SpotWithState) => {
      const now = Date.now()
      const [record] = await dispatch(
        [
          {
            id: `test-${now}`,
            kind: 'seats-free',
            spotId: spot.spot.id,
            spotName: spot.spot.name,
            spotArea: spot.spot.area,
            seatsFree: spot.seatsFree ?? 12,
            totalSeats: spot.spot.totalSeats,
            crowd: 'Quiet',
            reportedMinsAgo: spot.reportedMinsAgo ?? 2,
            reportAt: now,
            createdAt: now,
          },
        ],
        channels,
        stateRef.current.prefs,
      )
      if (record) setRecent((prev) => [record, ...prev].slice(0, 20))
      await persist(stateRef.current)
      return record ?? null
    },
    [channels, persist],
  )

  const value = useMemo(
    () => ({
      ready,
      connection: state.connection,
      prefs: state.prefs ?? DEFAULT_PREFS,
      watchlist: state.watchlist,
      outbox: state.outbox,
      permission,
      recent,
      connectEmail,
      disconnectEmail,
      setPrefs,
      setChannel,
      toggleWatch,
      isWatched,
      askPermission,
      clearOutbox,
      sendTestAlert,
      evaluate,
    }),
    [
      ready,
      state,
      permission,
      recent,
      connectEmail,
      disconnectEmail,
      setPrefs,
      setChannel,
      toggleWatch,
      isWatched,
      askPermission,
      clearOutbox,
      sendTestAlert,
      evaluate,
    ],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications(): NotificationsValue {
  const v = useContext(NotificationsContext)
  if (!v) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return v
}
