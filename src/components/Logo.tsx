export function Logo() {
  return (
    <div
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: '-0.02em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          background: 'var(--color-accent)',
          display: 'block',
          borderRadius: 4,
        }}
      />
      Spotr
    </div>
  )
}
