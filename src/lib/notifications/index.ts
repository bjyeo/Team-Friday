export type { DeliveryResult, NotificationChannel } from './channel'
export { BrowserChannel, notificationPermission, requestNotificationPermission } from './browserChannel'
export type { PermissionState } from './browserChannel'
export { EmailChannel } from './emailChannel'
export type { MailSender } from './emailChannel'
export { composeBrowserAlert, composeSeatAlert } from './compose'
export type { ComposedEmail } from './compose'
export { COOLDOWN_MINS, detectSeatAlerts } from './detect'
export { dispatch } from './dispatcher'
export type { DispatchRecord } from './dispatcher'
export {
  DEFAULT_PREFS,
  EMPTY_NOTIFICATION_STATE,
} from './types'
export type {
  AlertKind,
  EmailConnection,
  NotificationPrefs,
  NotificationState,
  OutboxEntry,
  SpotAlert,
} from './types'
