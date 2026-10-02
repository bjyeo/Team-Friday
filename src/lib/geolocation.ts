import type { Coords } from '../types'

export type GeoFailure = 'unsupported' | 'denied' | 'unavailable' | 'timeout'

export interface GeoResult {
  ok: boolean
  coords?: Coords
  reason?: GeoFailure
}

export const GEO_MESSAGES: Record<GeoFailure, string> = {
  unsupported: "This browser can't share your location. Type an area or postcode instead.",
  denied: 'Location is blocked in your browser. Type an area or postcode instead.',
  unavailable: "Your device couldn't get a fix. Type an area or postcode instead.",
  timeout: 'Finding your location took too long. Type an area or postcode instead.',
}

const TIMEOUT_MS = 8000

/**
 * Wraps the callback API in a promise that never rejects — a denied permission
 * is an expected outcome with its own screen, not an error to catch.
 */
export function getCurrentPosition(): Promise<GeoResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (err) => {
        const reason: GeoFailure =
          err.code === err.PERMISSION_DENIED
            ? 'denied'
            : err.code === err.TIMEOUT
              ? 'timeout'
              : 'unavailable'
        resolve({ ok: false, reason })
      },
      { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: 60_000 },
    )
  })
}
