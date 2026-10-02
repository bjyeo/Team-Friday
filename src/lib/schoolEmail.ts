/**
 * The school-email connector.
 *
 * Spotr is for students at Singapore universities and polytechnics, so sign-in
 * is gated on an institutional address. This module owns the whole decision:
 * what counts as a school email, which school it belongs to, and why a given
 * address was turned away. Adding an institution means adding one row here.
 */

export interface School {
  /** Display name shown after a successful match. */
  name: string
  /** Short form used in the header. */
  short: string
  /**
   * Domains that belong to this school. A match is exact on the domain, or on
   * any subdomain of it — so `u.nus.edu` matches the `nus.edu` row, and a
   * lookalike like `nus.edu.attacker.com` does not.
   */
  domains: string[]
  kind: 'university' | 'polytechnic'
}

export const SCHOOLS: School[] = [
  { name: 'National University of Singapore', short: 'NUS', domains: ['nus.edu', 'nus.edu.sg'], kind: 'university' },
  { name: 'Nanyang Technological University', short: 'NTU', domains: ['ntu.edu.sg'], kind: 'university' },
  { name: 'Singapore Management University', short: 'SMU', domains: ['smu.edu.sg'], kind: 'university' },
  { name: 'Singapore University of Technology and Design', short: 'SUTD', domains: ['sutd.edu.sg'], kind: 'university' },
  { name: 'Singapore Institute of Technology', short: 'SIT', domains: ['singaporetech.edu.sg'], kind: 'university' },
  { name: 'Singapore University of Social Sciences', short: 'SUSS', domains: ['suss.edu.sg'], kind: 'university' },
  { name: 'Ngee Ann Polytechnic', short: 'NP', domains: ['np.edu.sg'], kind: 'polytechnic' },
  { name: 'Nanyang Polytechnic', short: 'NYP', domains: ['nyp.edu.sg'], kind: 'polytechnic' },
  { name: 'Singapore Polytechnic', short: 'SP', domains: ['sp.edu.sg'], kind: 'polytechnic' },
  { name: 'Temasek Polytechnic', short: 'TP', domains: ['tp.edu.sg'], kind: 'polytechnic' },
  { name: 'Republic Polytechnic', short: 'RP', domains: ['rp.edu.sg'], kind: 'polytechnic' },
]

export type EmailRejection =
  | 'empty'
  | 'malformed'
  | 'not-a-school'

export type EmailCheck =
  | { ok: true; email: string; domain: string; school: School }
  | { ok: false; reason: EmailRejection; message: string }

/**
 * Deliberately stricter than RFC 5322 and deliberately not a one-line regex:
 * exactly one `@`, a non-empty local part with no spaces, and a domain of at
 * least two dot-separated labels made only of letters, digits and hyphens.
 */
const LOCAL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/
const LABEL_RE = /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$/

function parse(raw: string): { local: string; domain: string } | null {
  const at = raw.indexOf('@')
  if (at <= 0 || at !== raw.lastIndexOf('@')) return null

  const local = raw.slice(0, at)
  const domain = raw.slice(at + 1).toLowerCase()

  if (!LOCAL_RE.test(local)) return null
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null

  const labels = domain.split('.')
  if (labels.length < 2) return null
  if (!labels.every((l) => LABEL_RE.test(l))) return null

  return { local, domain }
}

/** Exact domain, or a subdomain of it — never a suffix match on the raw string. */
function domainMatches(domain: string, candidate: string): boolean {
  return domain === candidate || domain.endsWith(`.${candidate}`)
}

export function schoolForDomain(domain: string): School | null {
  const lower = domain.toLowerCase()
  return SCHOOLS.find((s) => s.domains.some((d) => domainMatches(lower, d))) ?? null
}

/**
 * The connector's single entry point. Trims and lowercases, then reports either
 * the matched school or a reason a student can act on.
 */
export function checkSchoolEmail(input: string): EmailCheck {
  const raw = input.trim()
  if (!raw) {
    return { ok: false, reason: 'empty', message: 'Enter your school email address.' }
  }

  const parsed = parse(raw)
  if (!parsed) {
    return {
      ok: false,
      reason: 'malformed',
      message: "That doesn't look like an email address.",
    }
  }

  const school = schoolForDomain(parsed.domain)
  if (!school) {
    return {
      ok: false,
      reason: 'not-a-school',
      message: `${parsed.domain} isn't a Singapore university or polytechnic address. Use the one your school gave you.`,
    }
  }

  return {
    ok: true,
    email: `${parsed.local.toLowerCase()}@${parsed.domain}`,
    domain: parsed.domain,
    school,
  }
}

/** Every accepted domain, for the hint under the sign-in field. */
export function acceptedDomains(): string[] {
  return SCHOOLS.flatMap((s) => s.domains).sort()
}
