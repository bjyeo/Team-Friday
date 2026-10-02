import type { SpotWithState } from '../types'
import { distanceLabel } from './distance'
import { freshnessLabel, freshnessLabelShort, staleNote } from './freshness'
import { CROWD_LABELS, STATUS_LABELS, STATUS_TOKEN } from './spotState'

/** Everything a card or detail pane renders, with no logic left in the JSX. */
export interface SpotVM {
  id: number
  name: string
  area: string
  address: string
  note: string

  seatsShown: string
  seatsCaption: string
  crowd: string
  seatColor: string
  statusLabel: string
  statusText: string
  statusBg: string

  fresh: string
  freshShort: string
  freshColor: string
  stale: boolean
  staleNote: string

  distLabel: string
  featuresShort: string
  tags: string[]
  /** Ten-segment occupancy bar: how full, not how free. */
  blocks: { bg: string }[]
  crowdSteps: { bg: string }[]
  facts: { k: string; v: string }[]
  mapsUrl: string
}

export function toVM(s: SpotWithState): SpotVM {
  const { spot, seatsFree, reportedMinsAgo, status, stale } = s
  const token = STATUS_TOKEN[status]

  const occupied =
    seatsFree === null || spot.totalSeats === 0
      ? 0
      : (spot.totalSeats - seatsFree) / spot.totalSeats

  const blocks = Array.from({ length: 10 }, (_, i) => ({
    bg:
      seatsFree === null
        ? 'var(--color-neutral-300)'
        : i < Math.round(occupied * 10)
          ? `var(--st-${token})`
          : 'var(--color-neutral-300)',
  }))

  const crowdFill =
    s.crowd === 4 ? 'var(--st-full)' : s.crowd === 3 ? 'var(--st-few)' : 'var(--st-ok)'

  const tags = [
    spot.ventilation,
    spot.power === 'None' ? 'No power' : 'Power',
    spot.noise === 'Quiet' ? 'Quiet room' : spot.noise,
    spot.open24h ? '24/7' : spot.hours,
  ]

  return {
    id: spot.id,
    name: spot.name,
    area: spot.area,
    address: spot.address,
    note: spot.note,

    seatsShown: seatsFree === null ? '—' : String(seatsFree),
    seatsCaption: seatsFree === null ? 'seats unknown' : `of ${spot.totalSeats} free`,
    crowd: CROWD_LABELS[s.crowd],
    seatColor: `var(--st-${token}-text)`,
    statusLabel: STATUS_LABELS[status],
    statusText: `var(--st-${token}-text)`,
    statusBg: `var(--st-${token}-bg)`,

    fresh: freshnessLabel(reportedMinsAgo),
    freshShort: freshnessLabelShort(reportedMinsAgo),
    freshColor: stale ? 'var(--st-few-text)' : 'var(--color-neutral-700)',
    stale,
    staleNote: staleNote(reportedMinsAgo),

    distLabel: distanceLabel(s.km),
    featuresShort: tags.slice(0, 3).join(' · '),
    tags,
    blocks,
    crowdSteps: [1, 2, 3, 4].map((i) => ({
      bg: i <= s.crowd ? crowdFill : 'var(--color-neutral-300)',
    })),
    facts: [
      { k: 'Ventilation', v: spot.ventilation },
      { k: 'Power', v: spot.power },
      { k: 'Noise', v: spot.noise },
      { k: 'Hours', v: spot.hours },
      { k: 'Seats total', v: String(spot.totalSeats) },
    ],
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${spot.name} ${spot.address}`,
    )}`,
  }
}
