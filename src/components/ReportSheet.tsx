import { useState } from 'react'
import type { ReportableCrowd } from '../types'
import { CROWD_CHOICES } from '../lib/spotState'

interface Props {
  spotName: string
  onReport(crowd: ReportableCrowd): Promise<{ saved: boolean; message: string }>
}

/**
 * "As a student, I want to tap one button on arrival to report how full the
 * place is." Four buttons, one tap, no form. The result line says plainly
 * whether it was saved — a failed send is never shown as a success.
 */
export function ReportSheet({ spotName, onReport }: Props) {
  const [busy, setBusy] = useState<ReportableCrowd | null>(null)
  const [result, setResult] = useState<{ saved: boolean; message: string } | null>(null)

  async function tap(crowd: ReportableCrowd) {
    setBusy(crowd)
    setResult(null)
    const outcome = await onReport(crowd)
    setBusy(null)
    setResult(outcome)
  }

  return (
    <section
      style={{
        padding: 'var(--space-4)',
        borderTop: '2px solid var(--color-divider)',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Are you here now?</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
          One tap tells the next student what {spotName} looks like.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: 8,
        }}
      >
        {CROWD_CHOICES.map((c) => (
          <button
            key={c.crowd}
            type="button"
            className="hoverable"
            onClick={() => void tap(c.crowd)}
            disabled={busy !== null}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              textAlign: 'left',
              minHeight: 64,
              padding: 'var(--space-3)',
              borderRadius: 12,
              border: '1px solid var(--color-divider)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              cursor: busy !== null ? 'progress' : 'pointer',
              opacity: busy !== null && busy !== c.crowd ? 0.5 : 1,
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
              {c.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{c.blurb}</span>
          </button>
        ))}
      </div>

      <div role="status" aria-live="polite" style={{ minHeight: 20 }}>
        {result ? (
          <span
            style={{
              fontSize: 13,
              padding: '6px 10px',
              borderRadius: 8,
              display: 'inline-block',
              background: result.saved ? 'var(--st-ok-bg)' : 'var(--st-few-bg)',
              color: result.saved ? 'var(--st-ok-text)' : 'var(--st-few-text)',
            }}
          >
            {result.message}
          </span>
        ) : null}
      </div>

      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-neutral-700)' }}>
        A one-tap answer gives a crowd level, so the seat count beside it is an estimate from
        that answer rather than a count of empty chairs.
      </p>
    </section>
  )
}
