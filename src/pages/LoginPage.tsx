import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SCHOOLS } from '../lib/schoolEmail'
import { Logo } from '../components/Logo'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const check = await signIn(email)
    setBusy(false)
    if (check.ok) navigate(from, { replace: true })
    else setError(check.message)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <section
        style={{
          padding: 'var(--space-8) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-6)',
          maxWidth: 560,
        }}
      >
        <Logo />

        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-700)',
            fontWeight: 600,
          }}
        >
          Students only · Singapore
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 46px)',
            lineHeight: 1.02,
            margin: 0,
            textWrap: 'balance',
          }}
        >
          Sign in with your school email.
        </h1>

        <p style={{ margin: 0, fontSize: 16, maxWidth: 420, color: 'var(--color-neutral-800)' }}>
          Seat counts are only as good as the students reporting them. Signing in keeps the
          reports coming from people who actually study here.
        </p>

        <form
          onSubmit={onSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420 }}
          noValidate
        >
          <label htmlFor="email" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
            School email address
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e1234567@u.nus.edu"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'email-error' : 'email-hint'}
            style={{
              width: '100%',
              minHeight: 52,
              padding: '0 12px',
              font: 'inherit',
              fontSize: 15,
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
              border: `1px solid ${error ? 'var(--st-full)' : 'var(--color-divider)'}`,
              borderRadius: 10,
              outlineColor: 'var(--color-accent)',
            }}
          />

          {error ? (
            <div
              id="email-error"
              role="alert"
              style={{
                fontSize: 13,
                color: 'var(--st-full-text)',
                background: 'var(--st-full-bg)',
                padding: '8px 10px',
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          ) : (
            <div id="email-hint" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
              Any Singapore university or polytechnic address.
            </div>
          )}

          <button
            type="submit"
            className="accent-btn"
            disabled={busy}
            style={{
              marginTop: 'var(--space-2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: '100%',
              minHeight: 52,
              padding: '0 var(--space-4)',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: 0,
              cursor: busy ? 'progress' : 'pointer',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 16,
              textAlign: 'left',
              opacity: busy ? 0.6 : 1,
            }}
          >
            <span>{busy ? 'Checking…' : 'Continue'}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>

        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-neutral-700)', maxWidth: 420 }}>
          Your address stays on this device. It is used to label your reports and nothing else.
        </p>
      </section>

      <section
        style={{
          borderLeft: '2px solid var(--color-divider)',
          background: 'var(--color-surface)',
          padding: 'var(--space-8) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-neutral-700)',
          }}
        >
          Accepted schools
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SCHOOLS.map((s) => (
            <div
              key={s.short}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px minmax(0, 1fr)',
                gap: 'var(--space-3)',
                alignItems: 'baseline',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--color-accent-700)',
                }}
              >
                {s.short}
              </span>
              <span style={{ fontSize: 13 }}>
                {s.name}
                <br />
                <span style={{ color: 'var(--color-neutral-700)', fontSize: 12 }}>
                  {s.domains.join(' · ')}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
