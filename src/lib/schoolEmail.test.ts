import { describe, expect, it } from 'vitest'
import { acceptedDomains, checkSchoolEmail, schoolForDomain } from './schoolEmail'

describe('checkSchoolEmail', () => {
  it('accepts a university address and reports the school', () => {
    const r = checkSchoolEmail('e1234567@u.nus.edu')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.school.short).toBe('NUS')
    expect(r.domain).toBe('u.nus.edu')
  })

  it('accepts polytechnic addresses', () => {
    for (const email of ['s12345@np.edu.sg', 'x@nyp.edu.sg', 'y@sp.edu.sg', 'z@tp.edu.sg', 'q@rp.edu.sg']) {
      expect(checkSchoolEmail(email).ok).toBe(true)
    }
  })

  it('matches subdomains of a listed domain', () => {
    const r = checkSchoolEmail('student@e.ntu.edu.sg')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.school.short).toBe('NTU')
  })

  it('trims and lowercases before matching', () => {
    const r = checkSchoolEmail('  E1234567@U.NUS.EDU  ')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.email).toBe('e1234567@u.nus.edu')
  })

  it('rejects a personal address with a reason the student can act on', () => {
    const r = checkSchoolEmail('someone@gmail.com')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('not-a-school')
    expect(r.message).toContain('gmail.com')
  })

  it('rejects an empty input separately from a malformed one', () => {
    const empty = checkSchoolEmail('   ')
    expect(empty.ok).toBe(false)
    if (!empty.ok) expect(empty.reason).toBe('empty')

    const bad = checkSchoolEmail('not-an-email')
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.reason).toBe('malformed')
  })

  it.each([
    'a@@nus.edu',
    '@nus.edu',
    'a@nus',
    'a b@nus.edu',
    '.a@nus.edu',
    'a.@nus.edu',
    'a..b@nus.edu',
    'a@-nus.edu',
    'a@nus-.edu',
  ])('rejects malformed address %s', (input) => {
    const r = checkSchoolEmail(input)
    expect(r.ok).toBe(false)
  })

  it('does not accept a lookalike domain that merely contains a school domain', () => {
    for (const email of ['a@nus.edu.attacker.com', 'a@notnus.edu', 'a@fake-nus.edu.sg']) {
      const r = checkSchoolEmail(email)
      expect(r.ok, email).toBe(false)
      if (!r.ok) expect(r.reason).toBe('not-a-school')
    }
  })
})

describe('schoolForDomain', () => {
  it('is case insensitive', () => {
    expect(schoolForDomain('SMU.EDU.SG')?.short).toBe('SMU')
  })

  it('returns null for an unknown domain', () => {
    expect(schoolForDomain('example.com')).toBeNull()
  })
})

describe('acceptedDomains', () => {
  it('lists every configured domain', () => {
    const domains = acceptedDomains()
    expect(domains).toContain('nus.edu')
    expect(domains).toContain('rp.edu.sg')
    expect(new Set(domains).size).toBe(domains.length)
  })
})
