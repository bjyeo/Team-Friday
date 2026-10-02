import type { ReactNode } from 'react'
import type { ReportableCrowd } from '../types'
import type { SpotVM } from '../lib/viewModel'
import { ReportSheet } from './ReportSheet'

interface Props {
  spot: SpotVM
  showBack: boolean
  onBack(): void
  onReport(crowd: ReportableCrowd): Promise<{ saved: boolean; message: string }>
  /** Fired when the student commits to travelling — the outcome metric's stop. */
  onChoose(): void
}

export function SpotDetail({ spot: s, showBack, onBack, onReport, onChoose }: Props) {
  return (
    <section
      style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 var(--space-4)',
            minHeight: 48,
            background: 'transparent',
            border: 0,
            borderBottom: '2px solid var(--color-divider)',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--color-text)',
            textAlign: 'left',
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
          All spots
        </button>
      ) : null}

      <div
        style={{
          padding: 'var(--space-6) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          borderBottom: '2px solid var(--color-divider)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-700)',
            fontWeight: 600,
          }}
        >
          {s.area}
          {s.distLabel ? ` · ${s.distLabel}` : ''}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.05,
            textWrap: 'balance',
          }}
        >
          {s.name}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>{s.address}</div>
      </div>

      <div className="stat-split">
        <div
          style={{
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <Kicker>Seats free</Kicker>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: s.seatColor,
            }}
          >
            {s.seatsShown}
          </span>
          <span style={{ fontSize: 13 }}>{s.seatsCaption}</span>
          <span
            style={{
              alignSelf: 'flex-start',
              fontSize: 12,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              background: s.statusBg,
              color: s.statusText,
            }}
          >
            {s.statusLabel}
          </span>
        </div>

        <div
          style={{
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <Kicker>Crowd</Kicker>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1,
            }}
          >
            {s.crowd}
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 3,
              maxWidth: 220,
            }}
            aria-hidden="true"
          >
            {s.crowdSteps.map((b, i) => (
              <span
                key={i}
                style={{ height: 8, display: 'block', borderRadius: 4, background: b.bg }}
              />
            ))}
          </div>
          <span style={{ fontSize: 13, marginTop: 'auto', color: s.freshColor }}>{s.fresh}</span>
        </div>
      </div>

      {s.stale ? (
        <div
          style={{
            margin: 'var(--space-4) var(--space-4) 0',
            padding: 'var(--space-3)',
            borderRadius: 10,
            background: 'var(--st-few-bg)',
            color: 'var(--st-few-text)',
            fontSize: 13,
          }}
        >
          {s.staleNote}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: 8,
          padding: 'var(--space-4) var(--space-4) 0',
        }}
      >
        {s.facts.map((f) => (
          <div
            key={f.k}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 12,
              background: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Kicker>{f.k}</Kicker>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{f.v}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <p style={{ margin: 0, fontSize: 15, maxWidth: 520 }}>{s.note}</p>
        <a
          href={s.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="accent-btn"
          onClick={onChoose}
          style={{
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            maxWidth: 420,
            minHeight: 52,
            padding: '0 var(--space-4)',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            textDecoration: 'none',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          <span>Open in Maps</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>
      </div>

      <ReportSheet spotName={s.name} onReport={onReport} />
    </section>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-neutral-700)',
      }}
    >
      {children}
    </span>
  )
}
