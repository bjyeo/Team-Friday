import type { DeliveryResult, NotificationChannel } from './channel'
import { composeSeatAlert } from './compose'
import type { EmailConnection, OutboxEntry, SpotAlert } from './types'

/** What an email channel needs to actually put a message on the wire. */
export interface MailSender {
  readonly name: string
  send(to: string, subject: string, body: string): Promise<void>
}

/**
 * The seam where real email plugs in.
 *
 * There is no sender in this build. Sending needs a provider account and a
 * secret key, and a static site on GitHub Pages has nowhere to keep one — so
 * the channel composes the message and queues it, and the UI shows the student
 * the exact text that would have been sent and says plainly that it was not.
 *
 * To make it real: implement MailSender against a provider and pass it in.
 * Nothing else in the app changes.
 *
 *   class ResendSender implements MailSender {
 *     name = 'Resend'
 *     async send(to, subject, body) {
 *       const res = await fetch('https://your-worker.example/send', {
 *         method: 'POST',
 *         headers: { 'content-type': 'application/json' },
 *         body: JSON.stringify({ to, subject, body }),
 *       })
 *       if (!res.ok) throw new Error(`Mail relay returned ${res.status}`)
 *     }
 *   }
 *
 * The key stays in the relay, never in this bundle.
 */
export class EmailChannel implements NotificationChannel {
  readonly id = 'email'
  readonly label = 'Email'

  constructor(
    private readonly getConnection: () => EmailConnection | null,
    private readonly queue: (entry: OutboxEntry) => void,
    private readonly sender: MailSender | null = null,
  ) {}

  isReady(): boolean {
    return this.getConnection() !== null
  }

  async send(alert: SpotAlert): Promise<DeliveryResult> {
    const connection = this.getConnection()
    if (!connection) {
      return {
        channel: this.id,
        delivered: false,
        note: 'No email address connected.',
      }
    }

    const { subject, body } = composeSeatAlert(alert)
    const base = {
      id: `out-${alert.id}`,
      alertId: alert.id,
      to: connection.address,
      subject,
      body,
      queuedAt: Date.now(),
    }

    if (!this.sender) {
      const note =
        'Queued, not sent. This build has no mail sender configured — see the README.'
      this.queue({ ...base, status: 'queued', note })
      return { channel: this.id, delivered: false, note }
    }

    try {
      await this.sender.send(connection.address, subject, body)
      const note = `Sent via ${this.sender.name}.`
      this.queue({ ...base, status: 'sent', note })
      return { channel: this.id, delivered: true, note }
    } catch (err) {
      const note = err instanceof Error ? err.message : 'The mail sender failed.'
      this.queue({ ...base, status: 'failed', note })
      return { channel: this.id, delivered: false, note }
    }
  }
}
