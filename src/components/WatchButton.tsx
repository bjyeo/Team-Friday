import { useNotifications } from '../context/NotificationsContext'

/** Star a spot to be told when it has seats. */
export function WatchButton({ spotId, compact = false }: { spotId: number; compact?: boolean }) {
  const { isWatched, toggleWatch } = useNotifications()
  const on = isWatched(spotId)

  return (
    <button
      type="button"
      className={on ? undefined : 'pill'}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation()
        void toggleWatch(spotId)
      }}
      title={on ? 'Stop watching this spot' : 'Tell me when this spot has seats'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flex: 'none',
        whiteSpace: 'nowrap',
        minHeight: compact ? 30 : 40,
        padding: compact ? '0 10px' : '0 var(--space-3)',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: compact ? 12 : 14,
        fontWeight: 600,
        border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
        background: on ? 'var(--color-accent)' : 'transparent',
        color: on ? 'var(--color-bg)' : 'var(--color-text)',
      }}
    >
      <svg
        width={compact ? 12 : 14}
        height={compact ? 12 : 14}
        viewBox="0 0 24 24"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.5 3.5a.6.6 0 0 1 1 0l2.3 4.7 5.2.8a.6.6 0 0 1 .3 1l-3.7 3.6.9 5.1a.6.6 0 0 1-.9.7L12 17l-4.6 2.4a.6.6 0 0 1-.9-.7l.9-5.1-3.7-3.6a.6.6 0 0 1 .3-1l5.2-.8Z" />
      </svg>
      {on ? 'Watching' : 'Watch'}
    </button>
  )
}
