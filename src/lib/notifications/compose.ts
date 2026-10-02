import { ago } from '../freshness'
import type { SpotAlert } from './types'

export interface ComposedEmail {
  subject: string
  body: string
}

const SITE = 'https://bjyeo.github.io/Team-Friday/'

/**
 * Turns an alert into the message that would be mailed. Pure, so the wording
 * can be tested without a mail server — and so the outbox preview shows the
 * student exactly the bytes a real send would carry.
 */
export function composeSeatAlert(alert: SpotAlert): ComposedEmail {
  const share = alert.totalSeats > 0 ? ` of ${alert.totalSeats}` : ''

  const subject = `${alert.seatsFree} seats free at ${alert.spotName}`

  const body = [
    `${alert.seatsFree}${share} seats are free at ${alert.spotName} (${alert.spotArea}).`,
    '',
    `Crowd level: ${alert.crowd}`,
    `Reported: ${ago(alert.reportedMinsAgo)}`,
    '',
    `Open the spot: ${SITE}#/browse`,
    '',
    'You are getting this because you are watching this spot in Spotr.',
    `Stop watching it, or turn alerts off: ${SITE}#/alerts`,
  ].join('\n')

  return { subject, body }
}

/** The one-line form used for a browser notification. */
export function composeBrowserAlert(alert: SpotAlert): { title: string; body: string } {
  return {
    title: `${alert.seatsFree} seats free at ${alert.spotName}`,
    body: `${alert.crowd} · reported ${ago(alert.reportedMinsAgo)}`,
  }
}
