import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Coords } from '../types'
import { NAMED_PLACES } from '../data/spots'

export interface Place {
  label: string
  coords: Coords
  /** True when it came from the device rather than a typed or picked area. */
  fromDevice: boolean
}

interface PlaceValue {
  place: Place | null
  setPlace(place: Place): void
  clearPlace(): void
  /** Resolves typed text to a known area; null when nothing matches. */
  resolve(query: string): Place | null
}

const PlaceContext = createContext<PlaceValue | null>(null)

const KEY = 'spotr.place.v1'

function readStored(): Place | null {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Place) : null
  } catch {
    return null
  }
}

function writeStored(place: Place | null): void {
  try {
    if (place) window.sessionStorage.setItem(KEY, JSON.stringify(place))
    else window.sessionStorage.removeItem(KEY)
  } catch {
    /* Private mode — the place just does not survive a reload. */
  }
}

/**
 * Matches a typed area, MRT station or postcode against the seeded places.
 * Case- and space-insensitive, and tolerant of a postcode typed on its own.
 */
export function resolvePlace(query: string): Place | null {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const normalise = (s: string) => s.toLowerCase().replace(/[\s-]+/g, '')
  const nq = normalise(q)

  for (const p of NAMED_PLACES) {
    const candidates = [p.label, ...(p.aliases ?? [])]
    if (candidates.some((c) => normalise(c) === nq)) {
      return { label: p.label, coords: { lat: p.lat, lng: p.lng }, fromDevice: false }
    }
  }
  // Fall back to a looser contains match so "kent ridge mrt" still lands.
  for (const p of NAMED_PLACES) {
    const candidates = [p.label, ...(p.aliases ?? [])]
    if (candidates.some((c) => nq.includes(normalise(c)))) {
      return { label: p.label, coords: { lat: p.lat, lng: p.lng }, fromDevice: false }
    }
  }
  return null
}

export function PlaceProvider({ children }: { children: ReactNode }) {
  const [place, setPlaceState] = useState<Place | null>(readStored)

  const setPlace = useCallback((next: Place) => {
    setPlaceState(next)
    writeStored(next)
  }, [])

  const clearPlace = useCallback(() => {
    setPlaceState(null)
    writeStored(null)
  }, [])

  const value = useMemo(
    () => ({ place, setPlace, clearPlace, resolve: resolvePlace }),
    [place, setPlace, clearPlace],
  )

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>
}

export function usePlace(): PlaceValue {
  const v = useContext(PlaceContext)
  if (!v) throw new Error('usePlace must be used inside <PlaceProvider>')
  return v
}
