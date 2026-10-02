import type { DeliveryResult, NotificationChannel } from './channel'
import { composeBrowserAlert } from './compose'
import type { SpotAlert } from './types'

export type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

export function notificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as Exclude<PermissionState, 'unsupported'>
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (notificationPermission() === 'unsupported') return 'unsupported'
  try {
    return (await Notification.requestPermission()) as PermissionState
  } catch {
    return 'denied'
  }
}

/**
 * Delivers through the Web Notifications API. This is the channel that actually
 * fires today: it needs no server, no account and no key, and it reaches the
 * student on desktop and on Android while the tab is open.
 */
export class BrowserChannel implements NotificationChannel {
  readonly id = 'browser'
  readonly label = 'Browser notification'

  isReady(): boolean {
    return notificationPermission() === 'granted'
  }

  async send(alert: SpotAlert): Promise<DeliveryResult> {
    const permission = notificationPermission()

    if (permission === 'unsupported') {
      return {
        channel: this.id,
        delivered: false,
        note: 'This browser has no notification support.',
      }
    }
    if (permission !== 'granted') {
      return {
        channel: this.id,
        delivered: false,
        note:
          permission === 'denied'
            ? 'Notifications are blocked in your browser settings.'
            : 'Notification permission has not been granted yet.',
      }
    }

    try {
      const { title, body } = composeBrowserAlert(alert)
      const n = new Notification(title, {
        body,
        tag: `spotr-${alert.spotId}`, // replaces an older alert for the same spot
        icon: `${import.meta.env.BASE_URL}favicon.svg`,
      })
      n.onclick = () => {
        window.focus()
        window.location.hash = '#/browse'
        n.close()
      }
      return { channel: this.id, delivered: true, note: 'Shown on this device.' }
    } catch (err) {
      return {
        channel: this.id,
        delivered: false,
        note: err instanceof Error ? err.message : 'The browser refused to show it.',
      }
    }
  }
}
