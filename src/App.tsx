import { useMemo, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { PlaceProvider } from './context/PlaceContext'
import { ReportsProvider } from './context/ReportsContext'
import { AlertsPage } from './pages/AlertsPage'
import { BrowsePage } from './pages/BrowsePage'
import { LocationPage } from './pages/LocationPage'
import { LoginPage } from './pages/LoginPage'
import { createStorage } from './lib/storage'

/** Signed-out students get sent to the login page and back again afterwards. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <Splash />
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

function Splash() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--color-neutral-700)',
        fontSize: 14,
      }}
    >
      Loading…
    </div>
  )
}

export default function App() {
  // Built once: the providers hold onto it, and remaking it would re-seed.
  const storage = useMemo(() => createStorage(), [])

  return (
    <HashRouter>
      <AuthProvider storage={storage}>
        <ReportsProvider storage={storage}>
          <NotificationsProvider storage={storage}>
            <PlaceProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <LocationPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/browse"
                  element={
                    <RequireAuth>
                      <BrowsePage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <RequireAuth>
                      <AlertsPage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PlaceProvider>
          </NotificationsProvider>
        </ReportsProvider>
      </AuthProvider>
    </HashRouter>
  )
}
