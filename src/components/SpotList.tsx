import type { ListStyle } from '../types'
import type { SpotVM } from '../lib/viewModel'

interface Props {
  spots: SpotVM[]
  style: ListStyle
  selectedId: number | null
  onSelect(id: number): void
}

export function SpotList({ spots, style, selectedId, onSelect }: Props) {
  if (style === 'Tiles') return <Tiles spots={spots} selectedId={selectedId} onSelect={onSelect} />
  if (style === 'Gauge') return <Gauge spots={spots} selectedId={selectedId} onSelect={onSelect} />
  return <Ledger spots={spots} selectedId={selectedId} onSelect={onSelect} />
}

/** The default: a dense ledger where the seat count is the first thing read. */
function Ledger({ spots, selectedId, onSelect }: Omit<Props, 'style'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {spots.map((s) => (
        <button
          key={s.id}
          type="button"
          className="hoverable"
          onClick={() => onSelect(s.id)}
          aria-current={s.id === selectedId ? 'true' : undefined}
          style={{
            display: 'grid',
            gridTemplateColumns: '76px minmax(0, 1fr) auto',
            gap: 'var(--space-3)',
            alignItems: 'start',
            textAlign: 'left',
            width: '100%',
            padding: 'var(--space-4)',
            border: 0,
            borderBottom: '1px solid var(--color-divider)',
            cursor: 'pointer',
            color: 'var(--color-text)',
            background: s.id === selectedId ? 'var(--color-surface)' : 'transparent',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 38,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: s.seatColor,
              }}
            >
              {s.seatsShown}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>
              {s.seatsCaption}
            </span>
            <span
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 999,
                background: s.statusBg,
                color: s.statusText,
                whiteSpace: 'nowrap',
              }}
            >
              {s.statusLabel}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 1.2,
              }}
            >
              {s.name}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-800)' }}>
              {s.crowd} · {s.featuresShort}
            </span>
            <span style={{ fontSize: 12, color: s.freshColor }}>{s.fresh}</span>
          </div>

          <span
            style={{ fontSize: 12, color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}
          >
            {s.distLabel}
          </span>
        </button>
      ))}
    </div>
  )
}

function Tiles({ spots, selectedId, onSelect }: Omit<Props, 'style'>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 10,
        padding: 'var(--space-4)',
      }}
    >
      {spots.map((s) => (
        <button
          key={s.id}
          type="button"
          className="tile"
          onClick={() => onSelect(s.id)}
          aria-current={s.id === selectedId ? 'true' : undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            textAlign: 'left',
            padding: 'var(--space-3)',
            cursor: 'pointer',
            minHeight: 188,
            borderRadius: 14,
            border: `2px solid ${s.id === selectedId ? 'var(--color-text)' : 'transparent'}`,
            background: s.statusBg,
            color: 'var(--color-text)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <span style={{ color: s.statusText }}>{s.statusLabel}</span>
            <span>{s.distLabel}</span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              marginTop: 'auto',
              color: s.statusText,
            }}
          >
            {s.seatsShown}
          </span>
          <span style={{ fontSize: 12 }}>
            {s.seatsCaption} · {s.crowd}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.2,
            }}
          >
            {s.name}
          </span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>{s.freshShort}</span>
        </button>
      ))}
    </div>
  )
}

function Gauge({ spots, selectedId, onSelect }: Omit<Props, 'style'>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
      }}
    >
      {spots.map((s) => (
        <button
          key={s.id}
          type="button"
          className="gauge-card"
          onClick={() => onSelect(s.id)}
          aria-current={s.id === selectedId ? 'true' : undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            textAlign: 'left',
            width: '100%',
            padding: 'var(--space-4)',
            cursor: 'pointer',
            color: 'var(--color-text)',
            background: 'var(--color-surface)',
            borderRadius: 14,
            border: `2px solid ${s.id === selectedId ? 'var(--color-accent)' : 'transparent'}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 17,
                lineHeight: 1.2,
              }}
            >
              {s.name}
            </span>
            <span
              style={{ fontSize: 12, color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}
            >
              {s.distLabel}
            </span>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}
            aria-hidden="true"
          >
            {s.blocks.map((b, i) => (
              <span
                key={i}
                style={{ height: 18, display: 'block', borderRadius: 4, background: b.bg }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'baseline',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 14 }}>
              <strong
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: s.seatColor,
                }}
              >
                {s.seatsShown}
              </strong>{' '}
              {s.seatsCaption} · {s.crowd} ·{' '}
              <span style={{ fontWeight: 600, color: s.statusText }}>{s.statusLabel}</span>
            </span>
            <span style={{ fontSize: 12, color: s.freshColor }}>{s.freshShort}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {s.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'var(--color-neutral-200)',
                  color: 'var(--color-neutral-800)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
}
