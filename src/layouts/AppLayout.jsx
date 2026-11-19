import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Menu, X, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/ui'
import { NAV, ADMIN_NAV } from '../data/nav'
import VerifyBanner from '../components/VerifyBanner'

export default function AppLayout() {
  const { user, profile, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const items = isAdmin ? [...NAV, ADMIN_NAV] : NAV
  const name = profile?.displayName || user?.displayName || 'Foydalanuvchi'

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-gradient-to-r from-neon-purple/30 to-neon-blue/20 text-white shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <div className="px-2 py-3"><Logo /></div>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: I }) => (
          <NavLink key={to} to={to} className={link} onClick={() => setOpen(false)}><I className="h-5 w-5" />{label}</NavLink>
        ))}
      </nav>
      <button onClick={logout} className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300">
        <LogOut className="h-5 w-5" /> Chiqish
      </button>
    </div>
  )

  return (
    <div className="min-h-screen lg:pl-72">
      <aside className="glass fixed inset-y-3 left-3 z-30 hidden w-64 lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-navy-900 transition-transform lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button className="absolute right-3 top-4 text-slate-400" onClick={() => setOpen(false)} aria-label="Yopish"><X /></button>
        {sidebar}
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-navy-950/70 px-4 py-3 backdrop-blur-xl sm:px-8">
        <button className="btn-ghost !p-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Menyu"><Menu className="h-5 w-5" /></button>
        <div className="flex-1" />
        <Link to="/notifications" className="btn-ghost !p-2.5" aria-label="Bildirishnomalar"><Bell className="h-5 w-5" /></Link>
        <Link to="/profile" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4">
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-xl object-cover" />
            : <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue font-bold">{name[0]?.toUpperCase()}</div>}
          <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{name}</span>
        </Link>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-8">
        <VerifyBanner />
        <Outlet />
      </main>
    </div>
  )
}
