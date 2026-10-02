import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '../types'
import { checkSchoolEmail, type EmailCheck } from '../lib/schoolEmail'
import type { StorageAdapter } from '../lib/storage'

interface AuthValue {
  session: Session | null
  /** False only while the stored session is being read on first paint. */
  ready: boolean
  /** Returns the connector's verdict; the caller renders the message. */
  signIn(email: string): Promise<EmailCheck>
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({
  storage,
  children,
}: {
  storage: StorageAdapter
  children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    storage
      .loadSession()
      .then((s) => {
        if (live) setSession(s)
      })
      .catch(() => {
        /* No stored session is the same as being signed out. */
      })
      .finally(() => {
        if (live) setReady(true)
      })
    return () => {
      live = false
    }
  }, [storage])

  const signIn = useCallback(
    async (email: string): Promise<EmailCheck> => {
      const check = checkSchoolEmail(email)
      if (!check.ok) return check

      const next: Session = {
        email: check.email,
        school: check.school.short,
        signedInAt: Date.now(),
      }
      // A failed write still signs the student in for this tab — losing the
      // session on reload is better than refusing to let them in at all.
      await storage.saveSession(next).catch(() => undefined)
      setSession(next)
      return check
    },
    [storage],
  )

  const signOut = useCallback(async () => {
    await storage.saveSession(null).catch(() => undefined)
    setSession(null)
  }, [storage])

  const value = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}
