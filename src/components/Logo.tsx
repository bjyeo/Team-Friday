/**
 * The Spotr mark: an S built from two half-discs with a dot in each counter.
 * Drawn rather than imported so it stays sharp at any size and picks up the
 * palette tokens — the brand colours and the seat-status ramp are the same
 * four values.
 */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flex: 'none' }}
    >
      <path d="M205 35 A85 85 0 0 0 205 205 Z" fill="var(--st-full)" />
      <path d="M205 205 A85 85 0 0 1 205 375 Z" fill="var(--color-accent)" />
      <rect x="196" y="300" width="18" height="92" rx="9" fill="var(--color-accent)" />
      <circle cx="268" cy="121" r="30" fill="var(--st-few)" />
      <circle cx="131" cy="291" r="30" fill="var(--color-text)" />
    </svg>
  )
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.03em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <LogoMark size={size * 1.2} />
      spotr
    </div>
  )
}
