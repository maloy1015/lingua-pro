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
import NotFound from './pages/NotFound'
import { EnglishHub, EnglishLevel, MathHub, MathLevel } from './pages/CoursePages'
import LessonPage from './pages/LessonPage'
import { ExamsHub, ExamSystemPage, ExamRunner } from './pages/Exams'
import { WritingSkill, SpeakingSkill, ListeningSkill, ReadingSkill } from './pages/Skills'
import PlacementTest from './pages/PlacementTest'
import Results from './pages/Results'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'

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
          <Route path="/english" element={<EnglishHub />} />
          <Route path="/english/:level" element={<EnglishLevel />} />
          <Route path="/english/lesson/:id" element={<LessonPage subject="english" />} />
          <Route path="/math" element={<MathHub />} />
          <Route path="/math/:topic" element={<MathLevel />} />
          <Route path="/math/lesson/:id" element={<LessonPage subject="math" />} />
          <Route path="/exams" element={<ExamsHub />} />
          <Route path="/exams/:system" element={<ExamSystemPage />} />
          <Route path="/exams/:system/:section" element={<ExamRunner />} />
          <Route path="/cefr" element={<Navigate to="/exams/cefr" replace />} />
          <Route path="/ielts" element={<Navigate to="/exams/ielts" replace />} />
          <Route path="/toefl" element={<Navigate to="/exams/toefl" replace />} />
          <Route path="/skills/writing" element={<WritingSkill />} />
          <Route path="/skills/speaking" element={<SpeakingSkill />} />
          <Route path="/skills/listening" element={<ListeningSkill />} />
          <Route path="/skills/reading" element={<ReadingSkill />} />
          <Route path="/placement-test" element={<PlacementTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
