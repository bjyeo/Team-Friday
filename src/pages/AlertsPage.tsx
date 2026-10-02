import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { useReports } from '../context/ReportsContext'
import { SPOTS } from '../data/spots'
import { COOLDOWN_MINS } from '../lib/notifications'
import { buildAllSpotStates } from '../lib/spotState'

export function AlertsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { reports } = useReports()
  const {
    connection,
    prefs,
    watchlist,
    outbox,
    permission,
    recent,
    connectEmail,
    disconnectEmail,
    setPrefs,
    setChannel,
    toggleWatch,
    askPermission,
    clearOutbox,
    sendTestAlert,
  } = useNotifications()

  const [draft, setDraft] = useState(session?.email ?? '')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [openEntry, setOpenEntry] = useState<string | null>(null)

  const states = useMemo(
    () => buildAllSpotStates(SPOTS, reports, null, Date.now()),
    [reports],
  )
  const watched = states.filter((s) => watchlist.includes(s.spot.id))

  async function onConnect(e: FormEvent) {
    e.preventDefault()
    setResult(await connectEmail(draft))
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
          padding: 'var(--space-6) var(--space-4) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 0,
              padding: 0,
              marginBottom: 'var(--space-4)',
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--color-text)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back
          </button>
          <Kicker>Notifications</Kicker>
          <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.05 }}>
            Tell me when a seat opens.
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 16, color: 'var(--color-neutral-800)' }}>
            Watch a spot and Spotr pings you when a fresh report says it has seats. At most one
            alert per spot every {COOLDOWN_MINS} minutes.
          </p>
        </div>

        {/* ── Email connection ─────────────────────────────────────── */}
        <Card>
          <h2 style={{ margin: 0, fontSize: 20 }}>Email</h2>

          {connection ? (
            <>
              <Row label="Connected">
                <strong style={{ fontSize: 15 }}>{connection.address}</strong>
              </Row>
              <div
                style={{
                  fontSize: 13,
                  padding: 'var(--space-3)',
                  borderRadius: 10,
                  background: 'var(--st-few-bg)',
                  color: 'var(--st-few-text)',
                }}
              >
                <strong>Not verified, and nothing is actually mailed.</strong> Verifying an
                address means sending it a code, and sending mail needs a server with a secret
                key — which a static site has nowhere to keep. Alerts are composed and queued
                below so you can see exactly what would go out.
              </div>
              <button
                type="button"
                className="pill"
                onClick={() => void disconnectEmail()}
                style={ghostButton}
              >
                Disconnect
              </button>
            </>
          ) : (
            <form onSubmit={onConnect} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="alert-email" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                School email address to send alerts to
              </label>
              <div style={{ display: 'flex', gap: 0 }}>
                <input
                  id="alert-email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    if (result) setResult(null)
                  }}
                  placeholder="e1234567@u.nus.edu"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 48,
                    padding: '0 12px',
                    font: 'inherit',
                    fontSize: 15,
                    color: 'var(--color-text)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-divider)',
                    borderRight: 0,
                    borderRadius: '10px 0 0 10px',
                    outlineColor: 'var(--color-accent)',
                  }}
                />
                <button
                  type="submit"
                  className="dark-btn"
                  style={{
                    borderRadius: '0 10px 10px 0',
                    minHeight: 48,
                    padding: '0 var(--space-4)',
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    border: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Connect
                </button>
              </div>
              {result ? (
                <div
                  role="alert"
                  style={{
                    fontSize: 13,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: result.ok ? 'var(--st-ok-bg)' : 'var(--st-full-bg)',
                    color: result.ok ? 'var(--st-ok-text)' : 'var(--st-full-text)',
                  }}
                >
                  {result.message}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                  Same school domains as sign-in.
                </div>
              )}
            </form>
          )}
        </Card>

        {/* ── Channels ─────────────────────────────────────────────── */}
        <Card>
          <h2 style={{ margin: 0, fontSize: 20 }}>How to reach you</h2>

          <Toggle
            on={prefs.channels.browser}
            onChange={async (on) => {
              if (on && permission !== 'granted') await askPermission()
              await setChannel('browser', on)
            }}
            title="Browser notification"
            blurb={
              permission === 'granted'
                ? 'Works now, on this device, while Spotr is open.'
                : permission === 'denied'
                  ? 'Blocked in your browser settings — unblock Spotr to use this.'
                  : permission === 'unsupported'
                    ? 'This browser has no notification support.'
                    : 'Needs your permission; you will be asked when you switch this on.'
            }
          />

          <Toggle
            on={prefs.channels.email}
            onChange={(on) => setChannel('email', on)}
            title="Email"
            blurb={
              connection
                ? `Composed for ${connection.address} and queued in the outbox below.`
                : 'Connect an address above first.'
            }
          />

          <Row label="Don't alert me for fewer than">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={1}
                max={50}
                value={prefs.minSeats}
                onChange={(e) =>
                  void setPrefs({ minSeats: Math.max(1, Number(e.target.value) || 1) })
                }
                style={{
                  width: 72,
                  minHeight: 36,
                  padding: '0 10px',
                  font: 'inherit',
                  fontSize: 14,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-divider)',
                  borderRadius: 8,
                  color: 'var(--color-text)',
                }}
              />
              <span style={{ fontSize: 14 }}>seats</span>
            </div>
          </Row>
        </Card>

        {/* ── Watchlist ────────────────────────────────────────────── */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>
              Watching {watched.length} spot{watched.length === 1 ? '' : 's'}
            </h2>
            {watched[0] ? (
              <button
                type="button"
                className="pill"
                onClick={() => void sendTestAlert(watched[0]!)}
                style={ghostButton}
              >
                Send a test alert
              </button>
            ) : null}
          </div>

          {watched.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>
              Nothing yet. Tap <strong>Watch</strong> on a spot and it shows up here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {watched.map((s) => (
                <div
                  key={s.spot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 'var(--space-3) 0',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
                      {s.spot.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                      {s.seatsFree === null ? 'No reports yet' : `${s.seatsFree} seats free`}
                      {s.stale ? ' · unconfirmed' : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => void toggleWatch(s.spot.id)}
                    style={{ ...ghostButton, minHeight: 32, fontSize: 12 }}
                  >
                    Stop
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── What fired this session ──────────────────────────────── */}
        {recent.length > 0 ? (
          <Card>
            <h2 style={{ margin: 0, fontSize: 20 }}>Fired this session</h2>
            {recent.map((r) => (
              <div
                key={r.alert.id}
                style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}
              >
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {r.alert.seatsFree} seats free at {r.alert.spotName}
                </div>
                {r.results.map((d) => (
                  <div key={d.channel} style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                    <span style={{ color: d.delivered ? 'var(--st-ok-text)' : 'var(--st-few-text)' }}>
                      {d.delivered ? '✓' : '○'} {d.channel}
                    </span>{' '}
                    — {d.note}
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ) : null}

        {/* ── Outbox ───────────────────────────────────────────────── */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>Outbox ({outbox.length})</h2>
            {outbox.length > 0 ? (
              <button type="button" className="pill" onClick={() => void clearOutbox()} style={ghostButton}>
                Clear
              </button>
            ) : null}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-700)' }}>
            The exact messages a mail sender would have delivered. Nothing leaves your device.
          </p>

          {outbox.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>
              Empty. Watch a spot, then report seats free there to see one appear.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {outbox.map((o) => (
                <div
                  key={o.id}
                  style={{
                    border: '1px solid var(--color-divider)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--color-bg)',
                  }}
                >
                  <button
                    type="button"
                    className="hoverable"
                    onClick={() => setOpenEntry(openEntry === o.id ? null : o.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      padding: 'var(--space-3)',
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                    }}
                    aria-expanded={openEntry === o.id}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background:
                            o.status === 'sent'
                              ? 'var(--st-ok-bg)'
                              : o.status === 'failed'
                                ? 'var(--st-full-bg)'
                                : 'var(--st-few-bg)',
                          color:
                            o.status === 'sent'
                              ? 'var(--st-ok-text)'
                              : o.status === 'failed'
                                ? 'var(--st-full-text)'
                                : 'var(--st-few-text)',
                        }}
                      >
                        {o.status}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{o.subject}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
                      To {o.to} · {o.note}
                    </span>
                  </button>

                  {openEntry === o.id ? (
                    <pre
                      style={{
                        margin: 0,
                        padding: 'var(--space-3)',
                        borderTop: '1px solid var(--color-divider)',
                        background: 'var(--color-surface)',
                        fontSize: 12,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      {o.body}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}

const ghostButton = {
  borderRadius: 999,
  minHeight: 36,
  padding: '0 var(--space-3)',
  background: 'transparent',
  border: '1px solid var(--color-divider)',
  cursor: 'pointer',
  fontSize: 13,
  color: 'var(--color-text)',
  alignSelf: 'flex-start',
} as const

function Card({ children }: { children: ReactNode }) {
  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: 14,
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {children}
    </section>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-accent-700)',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--color-neutral-800)' }}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({
  on,
  onChange,
  title,
  blurb,
}: {
  on: boolean
  onChange(on: boolean): void | Promise<void>
  title: string
  blurb: string
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        cursor: 'pointer',
        padding: 'var(--space-2) 0',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => void onChange(e.target.checked)}
        style={{ width: 18, height: 18, marginTop: 3, accentColor: 'var(--color-accent)', flex: 'none' }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--color-neutral-700)' }}>
          {blurb}
        </span>
      </span>
    </label>
  )
}
