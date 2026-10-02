import { describe, expect, it, vi } from 'vitest'
import type { NotificationChannel } from './channel'
import { composeBrowserAlert, composeSeatAlert } from './compose'
import { dispatch } from './dispatcher'
import { EmailChannel, type MailSender } from './emailChannel'
import { DEFAULT_PREFS, type EmailConnection, type OutboxEntry, type SpotAlert } from './types'

const alert: SpotAlert = {
  id: 'alert-1-123',
  kind: 'seats-free',
  spotId: 1,
  spotName: 'NUS Central Library',
  spotArea: 'Kent Ridge',
  seatsFree: 23,
  totalSeats: 180,
  crowd: 'Moderate',
  reportedMinsAgo: 12,
  reportAt: 123,
  createdAt: 456,
}

const connection: EmailConnection = {
  address: 'e1234567@u.nus.edu',
  verified: false,
  connectedAt: 1,
}

describe('composeSeatAlert', () => {
  it('leads with the number and the place', () => {
    const { subject, body } = composeSeatAlert(alert)
    expect(subject).toBe('23 seats free at NUS Central Library')
    expect(body).toContain('23 of 180 seats are free at NUS Central Library (Kent Ridge).')
  })

  it('carries the crowd level and the age of the report', () => {
    const { body } = composeSeatAlert(alert)
    expect(body).toContain('Crowd level: Moderate')
    expect(body).toContain('Reported: 12 min ago')
  })

  it('says why it was sent and how to stop it', () => {
    const { body } = composeSeatAlert(alert)
    expect(body).toContain('because you are watching this spot')
    expect(body).toContain('#/alerts')
  })

  it('omits the capacity when it is unknown', () => {
    const { body } = composeSeatAlert({ ...alert, totalSeats: 0 })
    expect(body).toContain('23 seats are free')
    expect(body).not.toContain(' of 0 ')
  })
})

describe('composeBrowserAlert', () => {
  it('fits a notification: a count in the title, context in the body', () => {
    const { title, body } = composeBrowserAlert(alert)
    expect(title).toBe('23 seats free at NUS Central Library')
    expect(body).toBe('Moderate · reported 12 min ago')
  })
})

describe('EmailChannel', () => {
  it('is not ready without a connected address', async () => {
    const channel = new EmailChannel(() => null, vi.fn())
    expect(channel.isReady()).toBe(false)

    const result = await channel.send(alert)
    expect(result.delivered).toBe(false)
    expect(result.note).toContain('No email address connected')
  })

  it('queues rather than claiming delivery when there is no sender', async () => {
    const queued: OutboxEntry[] = []
    const channel = new EmailChannel(() => connection, (e) => queued.push(e))

    const result = await channel.send(alert)

    expect(result.delivered).toBe(false)
    expect(result.note).toContain('Queued, not sent')
    expect(queued).toHaveLength(1)
    expect(queued[0]).toMatchObject({
      to: 'e1234567@u.nus.edu',
      subject: '23 seats free at NUS Central Library',
      status: 'queued',
      alertId: 'alert-1-123',
    })
  })

  it('sends and records success when a sender is configured', async () => {
    const sent: { to: string; subject: string }[] = []
    const sender: MailSender = {
      name: 'TestMail',
      async send(to, subject) {
        sent.push({ to, subject })
      },
    }
    const queued: OutboxEntry[] = []
    const channel = new EmailChannel(() => connection, (e) => queued.push(e), sender)

    const result = await channel.send(alert)

    expect(result.delivered).toBe(true)
    expect(result.note).toBe('Sent via TestMail.')
    expect(sent).toEqual([{ to: 'e1234567@u.nus.edu', subject: '23 seats free at NUS Central Library' }])
    expect(queued[0]?.status).toBe('sent')
  })

  it('records a failure with the sender error rather than losing the message', async () => {
    const sender: MailSender = {
      name: 'TestMail',
      async send() {
        throw new Error('relay returned 503')
      },
    }
    const queued: OutboxEntry[] = []
    const channel = new EmailChannel(() => connection, (e) => queued.push(e), sender)

    const result = await channel.send(alert)

    expect(result.delivered).toBe(false)
    expect(result.note).toBe('relay returned 503')
    expect(queued[0]?.status).toBe('failed')
    expect(queued[0]?.body).toContain('23 of 180 seats are free')
  })
})

/** A channel that records what it was asked to send. */
function fakeChannel(id: string, delivered: boolean, throws = false): NotificationChannel {
  return {
    id,
    label: id,
    isReady: () => true,
    async send(a) {
      if (throws) throw new Error(`${id} exploded`)
      return { channel: id, delivered, note: `${id} handled ${a.id}` }
    },
  }
}

describe('dispatch', () => {
  it('sends through every enabled channel', async () => {
    const records = await dispatch(
      [alert],
      [fakeChannel('browser', true), fakeChannel('email', false)],
      DEFAULT_PREFS,
    )
    expect(records).toHaveLength(1)
    expect(records[0]?.results.map((r) => r.channel)).toEqual(['browser', 'email'])
    expect(records[0]?.delivered).toBe(true) // one channel got through
  })

  it('skips channels the student switched off', async () => {
    const records = await dispatch(
      [alert],
      [fakeChannel('browser', true), fakeChannel('email', true)],
      { ...DEFAULT_PREFS, channels: { browser: true, email: false } },
    )
    expect(records[0]?.results.map((r) => r.channel)).toEqual(['browser'])
  })

  it('does nothing when every channel is off', async () => {
    const records = await dispatch([alert], [fakeChannel('browser', true)], {
      ...DEFAULT_PREFS,
      channels: { browser: false, email: false },
    })
    expect(records).toEqual([])
  })

  it('one channel throwing does not stop the others', async () => {
    const records = await dispatch(
      [alert],
      [fakeChannel('browser', false, true), fakeChannel('email', true)],
      DEFAULT_PREFS,
    )
    const results = records[0]?.results ?? []
    expect(results.find((r) => r.channel === 'browser')).toMatchObject({
      delivered: false,
      note: 'browser exploded',
    })
    expect(results.find((r) => r.channel === 'email')?.delivered).toBe(true)
    expect(records[0]?.delivered).toBe(true)
  })

  it('reports not-delivered when no channel got through', async () => {
    const records = await dispatch([alert], [fakeChannel('email', false)], DEFAULT_PREFS)
    expect(records[0]?.delivered).toBe(false)
  })
})
