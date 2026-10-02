/** The only alert kind this build sends. The shape leaves room for more. */
export type AlertKind = 'seats-free'

export interface SpotAlert {
  id: string
  kind: AlertKind
  spotId: number
  spotName: string
  spotArea: string
  seatsFree: number
  totalSeats: number
  crowd: string
  reportedMinsAgo: number
  /** The report that triggered it — used to avoid alerting twice on one report. */
  reportAt: number
  createdAt: number
}

/** A connected email address. */
export interface EmailConnection {
  address: string
  /**
   * Whether the address was proved to belong to this person. Always false in
   * this build: proving it means mailing a code, and there is no mail server.
   * The UI says so rather than implying a verification that did not happen.
   */
  verified: boolean
  connectedAt: number
}

export interface NotificationPrefs {
  /** Alert me when a spot I watch has seats. */
  seatsFree: boolean
  channels: {
    email: boolean
    browser: boolean
  }
  /** Don't wake me for a single chair. */
  minSeats: number
}

export const DEFAULT_PREFS: NotificationPrefs = {
  seatsFree: true,
  channels: { email: true, browser: true },
  minSeats: 3,
}

/** A composed message sitting in the outbox because there is no mail server. */
export interface OutboxEntry {
  id: string
  alertId: string
  to: string
  subject: string
  body: string
  queuedAt: number
  status: 'queued' | 'sent' | 'failed'
  /** Why it is in this state, shown verbatim in the UI. */
  note: string
}

/**
 * Everything the connector persists, in one blob. One read and one write keeps
 * the StorageAdapter interface small as this grows.
 */
export interface NotificationState {
  connection: EmailConnection | null
  prefs: NotificationPrefs
  /** Spot ids the student is watching. */
  watchlist: number[]
  outbox: OutboxEntry[]
  /** Last time each spot produced an alert, keyed by spot id. Rate limiting. */
  lastAlertAt: Record<string, number>
  /**
   * When the student started watching each spot. Reports older than this never
   * alert — otherwise starting to watch a spot that already has seats pings you
   * about the very card you are looking at.
   */
  watchingSince: Record<string, number>
}

export const EMPTY_NOTIFICATION_STATE: NotificationState = {
  connection: null,
  prefs: DEFAULT_PREFS,
  watchlist: [],
  outbox: [],
  lastAlertAt: {},
  watchingSince: {},
}
