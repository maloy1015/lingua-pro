import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from './components/ProtectedRoute'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

// Routes built in later stages render ComingSoon until implemented.
const LATER = [
  '/english', '/english/:level', '/english/lesson/:id', '/math', '/math/:topic',
  '/exams', '/cefr', '/ielts', '/toefl',
  '/skills/writing', '/skills/speaking', '/skills/listening', '/skills/reading',
  '/placement-test', '/results', '/notifications',
]

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          {LATER.map((p) => <Route key={p} path={p} element={<ComingSoon />} />)}
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<ComingSoon />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
