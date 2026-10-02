import { useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { usePlace, resolvePlace, type Place } from '../context/PlaceContext'
import { useReports } from '../context/ReportsContext'
import { NAMED_PLACES, QUICK_PLACES, SPOTS } from '../data/spots'
import { GEO_MESSAGES, getCurrentPosition, type GeoFailure } from '../lib/geolocation'
import { buildAllSpotStates } from '../lib/spotState'
import { ago } from '../lib/freshness'

/** The two live numbers in the right-hand panel: best and worst nearby. */
function useHeadlines() {
  const { reports } = useReports()
  const states = buildAllSpotStates(SPOTS, reports, null, Date.now())
    .filter((s) => s.seatsFree !== null)
    .sort((a, b) => (b.seatsFree ?? 0) - (a.seatsFree ?? 0))

  return { best: states[0] ?? null, worst: states[states.length - 1] ?? null }
}

export function LocationPage() {
  const navigate = useNavigate()
  const { setPlace } = usePlace()
  const [query, setQuery] = useState('')
  const [geoError, setGeoError] = useState<GeoFailure | null>(null)
  const [noMatch, setNoMatch] = useState(false)
  const [locating, setLocating] = useState(false)
  const { best, worst } = useHeadlines()

  function go(place: Place) {
    setPlace(place)
    navigate('/browse')
  }

  async function useMyLocation() {
    setLocating(true)
    setGeoError(null)
    const result = await getCurrentPosition()
    setLocating(false)
    if (result.ok && result.coords) {
      go({ label: 'Near you', coords: result.coords, fromDevice: true })
    } else {
      setGeoError(result.reason ?? 'unavailable')
    }
  }

  function search() {
    const match = resolvePlace(query)
    if (match) {
      setNoMatch(false)
      go(match)
    } else {
      setNoMatch(true)
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      search()
    }
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          borderBottom: '2px solid var(--color-divider)',
        }}
      >
        <section
          style={{
            padding: 'var(--space-8) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            maxWidth: 560,
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
            Public study spots · Singapore
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 6vw, 52px)',
              lineHeight: 1.02,
              margin: 0,
              textWrap: 'balance',
            }}
          >
            Know there's a seat before you travel.
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 16,
              maxWidth: 420,
              color: 'var(--color-neutral-800)',
            }}
          >
            Live seat counts and crowd levels, reported by students who are already there.
          </p>

          <button
            type="button"
            className="accent-btn"
            onClick={() => void useMyLocation()}
            disabled={locating}
            style={{
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: '100%',
              maxWidth: 420,
              minHeight: 52,
              padding: '0 var(--space-4)',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: 0,
              cursor: locating ? 'progress' : 'pointer',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 16,
              textAlign: 'left',
              opacity: locating ? 0.6 : 1,
            }}
          >
            <span>{locating ? 'Finding you…' : 'Use my location'}</span>
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
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </button>

          {geoError ? (
            <div
              role="status"
              style={{
                maxWidth: 420,
                borderRadius: 10,
                padding: 'var(--space-3)',
                background: 'var(--color-accent-100)',
                color: 'var(--color-accent-800)',
                fontSize: 14,
              }}
            >
              {GEO_MESSAGES[geoError]}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxWidth: 420,
              paddingTop: 'var(--space-4)',
              borderTop: '2px solid var(--color-divider)',
            }}
          >
            <label htmlFor="area" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
              Or search an area, MRT station or postcode
            </label>
            <div style={{ display: 'flex', gap: 0 }}>
              <input
                id="area"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (noMatch) setNoMatch(false)
                }}
                onKeyDown={onKey}
                placeholder="e.g. Kent Ridge, 119077"
                aria-describedby={noMatch ? 'area-error' : undefined}
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 48,
                  padding: '0 12px',
                  font: 'inherit',
                  fontSize: 15,
                  color: 'var(--color-text)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-divider)',
                  borderRight: 0,
                  borderRadius: '10px 0 0 10px',
                  outlineColor: 'var(--color-accent)',
                }}
              />
              <button
                type="button"
                className="dark-btn"
                onClick={search}
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
                Search
              </button>
            </div>

            {noMatch ? (
              <div
                id="area-error"
                role="alert"
                style={{
                  fontSize: 13,
                  color: 'var(--st-few-text)',
                  background: 'var(--st-few-bg)',
                  padding: '8px 10px',
                  borderRadius: 8,
                }}
              >
                No seeded spots near “{query.trim()}”. Try{' '}
                {NAMED_PLACES.slice(0, 3)
                  .map((p) => p.label)
                  .join(', ')}
                .
              </div>
            ) : null}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 6 }}>
              {QUICK_PLACES.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="chip-idle"
                  onClick={() => {
                    const p = resolvePlace(label)
                    if (p) go(p)
                  }}
                  style={{
                    borderRadius: 999,
                    background: 'transparent',
                    border: '1px solid var(--color-divider)',
                    padding: '6px 10px',
                    fontSize: 13,
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                    minHeight: 36,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            borderLeft: '2px solid var(--color-divider)',
            display: 'grid',
            gridTemplateRows: 'repeat(3, auto)',
            alignContent: 'end',
            padding: 'var(--space-8) var(--space-4) var(--space-4)',
            gap: 0,
            background: 'var(--color-surface)',
          }}
        >
          {best ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 'var(--space-4)',
                alignItems: 'baseline',
                padding: 'var(--space-4) 0',
                borderBottom: '2px solid var(--color-divider)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 44,
                  color: 'var(--st-ok-text)',
                  lineHeight: 1,
                }}
              >
                {best.seatsFree}
              </span>
              <span style={{ fontSize: 14 }}>
                seats free at {best.spot.name}
                <br />
                <span style={{ color: 'var(--color-neutral-700)' }}>
                  {best.reportedMinsAgo === null
                    ? 'No reports yet'
                    : `Reported ${ago(best.reportedMinsAgo)}`}
                </span>
              </span>
            </div>
          ) : null}

          {worst && worst.spot.id !== best?.spot.id ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 'var(--space-4)',
                alignItems: 'baseline',
                padding: 'var(--space-4) 0',
                borderBottom: '2px solid var(--color-divider)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 44,
                  lineHeight: 1,
                }}
              >
                {worst.seatsFree}
              </span>
              <span style={{ fontSize: 14 }}>
                seats free at {worst.spot.name}
                <br />
                <span style={{ color: 'var(--color-neutral-700)' }}>
                  Saved you a trip across town
                </span>
              </span>
            </div>
          ) : null}

          <div
            style={{
              fontSize: 12,
              color: 'var(--color-neutral-700)',
              paddingTop: 'var(--space-3)',
            }}
          >
            {SPOTS.length} spots seeded around Kent Ridge, Clementi and the city.
          </div>
        </section>
      </main>
    </div>
  )
}
