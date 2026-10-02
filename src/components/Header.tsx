import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'

export function Header({
  placeLabel,
  onChangePlace,
}: {
  placeLabel?: string | null
  onChangePlace?: () => void
}) {
  const { session, signOut } = useAuth()

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
