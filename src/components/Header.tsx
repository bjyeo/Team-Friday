import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { Logo } from './Logo'

export function Header({
  placeLabel,
  onChangePlace,
}: {
  placeLabel?: string | null
  onChangePlace?: () => void
}) {
  const { session, signOut } = useAuth()
  const { watchlist } = useNotifications()
  const navigate = useNavigate()
  const onAlerts = useLocation().pathname === '/alerts'

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '2px solid var(--color-divider)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ marginRight: 'auto' }}>
        <Logo />
      </div>

      {placeLabel && onChangePlace ? (
        <button
          type="button"
          className="pill"
          onClick={onChangePlace}
          style={{
            borderRadius: 999,
            flex: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid var(--color-divider)',
            padding: '6px 10px',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: 13,
            minHeight: 36,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{placeLabel}</span>
          <span style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>Change</span>
        </button>
      ) : null}

      {session && !onAlerts ? (
        <button
          type="button"
          className="pill"
          onClick={() => navigate('/alerts')}
          title="Notification settings"
          style={{
            borderRadius: 999,
            flex: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid var(--color-divider)',
            padding: '6px 10px',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: 13,
            minHeight: 36,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span>Alerts</span>
          {watchlist.length > 0 ? (
            <span
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                padding: '0 6px',
                minWidth: 18,
                textAlign: 'center',
              }}
            >
              {watchlist.length}
            </span>
          ) : null}
        </button>
      ) : null}

      {session ? (
        <button
          type="button"
          className="pill"
          onClick={() => void signOut()}
          title={session.email}
          style={{
            borderRadius: 999,
            flex: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid var(--color-divider)',
            padding: '6px 10px',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: 13,
            minHeight: 36,
          }}
        >
          <span style={{ fontWeight: 600 }}>{session.school}</span>
          <span style={{ color: 'var(--color-neutral-700)' }}>Sign out</span>
        </button>
      ) : null}
    </header>
  )
}
