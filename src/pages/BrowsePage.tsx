import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { SpotDetail } from '../components/SpotDetail'
import { SpotList } from '../components/SpotList'
import { useAuth } from '../context/AuthContext'
import { usePlace } from '../context/PlaceContext'
import { useReports } from '../context/ReportsContext'
import { SPOTS } from '../data/spots'
import {
  activeFilterCount,
  applyFilters,
  FILTER_LABELS,
  SORT_LABELS,
  sortSpots,
  withinRadius,
} from '../lib/filters'
import { recordChoice } from '../lib/metrics'
import { buildAllSpotStates } from '../lib/spotState'
import { useIsWide } from '../lib/useIsWide'
import { toVM } from '../lib/viewModel'
import type { FilterKey, Filters, ListStyle, ReportableCrowd, SortKey } from '../types'

const LIST_STYLES: ListStyle[] = ['Ledger', 'Tiles', 'Gauge']

export function BrowsePage() {
  const navigate = useNavigate()
  const { place, clearPlace } = usePlace()
  const { session } = useAuth()
  const { reports, pendingCount, submit, retryPending } = useReports()
  const wide = useIsWide()

  const [filters, setFilters] = useState<Filters>({})
  const [sort, setSort] = useState<SortKey>('seats')
  const [listStyle, setListStyle] = useState<ListStyle>('Ledger')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Re-derived on every report, so a tap updates the card behind the sheet.
  const states = useMemo(
    () => buildAllSpotStates(SPOTS, reports, place?.coords ?? null, Date.now()),
    [reports, place],
  )

  const inRange = useMemo(() => withinRadius(states), [states])
  const visible = useMemo(
    () => sortSpots(applyFilters(inRange.spots, filters), sort),
    [inRange.spots, filters, sort],
  )
  const vms = useMemo(() => visible.map(toVM), [visible])

  const selected = useMemo(() => {
    const explicit = states.find((s) => s.spot.id === selectedId)
    if (explicit) return toVM(explicit)
    // On a wide screen the detail pane always shows something.
    return wide && visible[0] ? toVM(visible[0]) : null
  }, [states, selectedId, wide, visible])

  if (!place) return <Navigate to="/" replace />

  const detailOpen = selectedId !== null && states.some((s) => s.spot.id === selectedId)
  const showList = wide || !detailOpen
  const showDetail = (wide && selected !== null) || detailOpen
  const active = activeFilterCount(filters)
  const countLabel =
    active > 0 ? `${vms.length} of ${inRange.spots.length} spots` : `${inRange.spots.length} spots nearby`

  function toggleFilter(key: FilterKey) {
    setFilters((f) => ({ ...f, [key]: !f[key] }))
  }

  async function onReport(crowd: ReportableCrowd) {
    const spot = SPOTS.find((s) => s.id === selected?.id)
    if (!spot) return { saved: false, message: 'That spot is no longer listed.' }
    return submit(spot, crowd, session?.email ?? null)
  }

  function onChoose(spotId: number) {
    recordChoice(spotId, active)
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
      <Header
        placeLabel={place.label}
        onChangePlace={() => {
          clearPlace()
          navigate('/')
        }}
      />

      {pendingCount > 0 ? (
        <div
          role="status"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--st-few-bg)',
            color: 'var(--st-few-text)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--color-divider)',
          }}
        >
          <span>
            {pendingCount} report{pendingCount === 1 ? '' : 's'} not saved yet.
          </span>
          <button
            type="button"
            onClick={() => void retryPending()}
            style={{
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: 999,
              padding: '2px 10px',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 12,
            }}
          >
            Retry now
          </button>
        </div>
      ) : null}

      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {showList ? (
          <section
            style={
              wide
                ? {
                    width: listStyle === 'Tiles' ? 520 : 460,
                    flex: 'none',
                    borderRight: '2px solid var(--color-divider)',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 64px)',
                  }
                : { width: '100%' }
            }
          >
            <div
              style={{
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderBottom: '2px solid var(--color-divider)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 24 }}>{countLabel}</h2>
                <Segmented<SortKey>
                  options={SORT_LABELS}
                  value={sort}
                  onChange={(next) => setSort(next)}
                  label="Sort spots"
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FILTER_LABELS.map(({ key, label }) => {
                  const on = !!filters[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      className={on ? undefined : 'chip-idle'}
                      aria-pressed={on}
                      onClick={() => toggleFilter(key)}
                      style={{
                        borderRadius: 999,
                        flex: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '0 12px',
                        minHeight: 36,
                        fontSize: 13,
                        cursor: 'pointer',
                        border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background: on ? 'var(--color-accent)' : 'transparent',
                        color: on ? 'var(--color-bg)' : 'var(--color-text)',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <Segmented<ListStyle>
                  options={LIST_STYLES.map((s) => ({ key: s, label: s }))}
                  value={listStyle}
                  onChange={(next) => setListStyle(next)}
                  label="Card layout"
                />
              </div>

              {inRange.widened ? (
                <div
                  role="status"
                  style={{
                    fontSize: 12,
                    color: 'var(--color-accent-800)',
                    background: 'var(--color-accent-100)',
                    padding: '6px 10px',
                    borderRadius: 8,
                  }}
                >
                  Nothing within 2 km, so we widened the search to{' '}
                  {inRange.radiusKm === Infinity ? 'all of Singapore' : `${inRange.radiusKm} km`}.
                </div>
              ) : null}
            </div>

            {vms.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-8) var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                }}
              >
                <h3 style={{ margin: 0, fontSize: 20 }}>No spots match all filters.</h3>
                <p style={{ margin: 0, color: 'var(--color-neutral-700)', fontSize: 14 }}>
                  Try removing one. Seats-free-now and 24/7 rule out the most.
                </p>
                <button
                  type="button"
                  className="pill"
                  onClick={() => setFilters({})}
                  style={{
                    borderRadius: 10,
                    minHeight: 40,
                    padding: '0 var(--space-4)',
                    background: 'transparent',
                    border: '1px solid var(--color-divider)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--color-text)',
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <SpotList
                spots={vms}
                style={listStyle}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
              />
            )}
          </section>
        ) : null}

        {showDetail && selected ? (
          <SpotDetail
            spot={selected}
            showBack={!wide}
            onBack={() => setSelectedId(null)}
            onReport={onReport}
            onChoose={() => onChoose(selected.id)}
          />
        ) : null}
      </main>
    </div>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange(next: T): void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: 'flex',
        border: '1px solid var(--color-divider)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      {options.map((o) => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            style={{
              flex: 'none',
              whiteSpace: 'nowrap',
              textAlign: 'left',
              border: 0,
              padding: '6px 10px',
              fontSize: 12,
              cursor: 'pointer',
              minHeight: 32,
              background: on ? 'var(--color-text)' : 'transparent',
              color: on ? 'var(--color-bg)' : 'var(--color-text)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
