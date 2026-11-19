import { LayoutDashboard, BookOpen, Calculator, GraduationCap, ClipboardCheck, PenLine, Mic, Headphones, BookText, BarChart3, Bell, User, Settings, Shield } from 'lucide-react'

export const NAV = [
  { to: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { to: '/english', label: 'Ingliz tili', icon: BookOpen },
  { to: '/math', label: 'Matematika', icon: Calculator },
  { to: '/exams', label: 'Imtihonlar', icon: GraduationCap },
  { to: '/placement-test', label: 'Daraja testi', icon: ClipboardCheck },
  { to: '/skills/writing', label: 'Writing', icon: PenLine },
  { to: '/skills/speaking', label: 'Speaking', icon: Mic },
  { to: '/skills/listening', label: 'Listening', icon: Headphones },
  { to: '/skills/reading', label: 'Reading', icon: BookText },
  { to: '/results', label: 'Natijalar', icon: BarChart3 },
  { to: '/notifications', label: 'Bildirishnomalar', icon: Bell },
  { to: '/profile', label: 'Profil', icon: User },
  { to: '/settings', label: 'Sozlamalar', icon: Settings },
]
export const ADMIN_NAV = { to: '/admin', label: 'Admin panel', icon: Shield }
