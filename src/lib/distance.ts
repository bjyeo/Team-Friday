import type { Coords } from '../types'

const EARTH_RADIUS_KM = 6371

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance in kilometres. */
export function distanceKm(a: Coords, b: Coords): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Roughly 5 km/h on foot; under 1.5 km a walk time reads better than a distance. */
export function distanceLabel(km: number | null): string {
  if (km === null) return ''
  if (km < 1.5) return `${Math.max(1, Math.round(km * 12))} min walk`
  return `${km.toFixed(1)} km`
}

/** Start here; widen to WIDE_RADIUS_KM when nothing is in range. */
export const NEAR_RADIUS_KM = 2
export const WIDE_RADIUS_KM = 10
