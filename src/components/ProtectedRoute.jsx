import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenLoader } from './ui'

/** Requires login. Sends users who skipped onboarding to /onboarding. */
export function ProtectedRoute({ adminOnly = false }) {
  const { user, profile, loading, isAdmin } = useAuth()
  const loc = useLocation()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (profile && !profile.onboarded) return <Navigate to="/onboarding" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Login/register pages: redirect signed-in users away. */
export function PublicOnlyRoute() {
  const { user, profile, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to={profile && !profile.onboarded ? '/onboarding' : '/dashboard'} replace />
  return <Outlet />
}

/** Onboarding: needs login; skip if already done. */
export function OnboardingRoute() {
  const { user, profile, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.onboarded) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
