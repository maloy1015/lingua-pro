import { useLocation, Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'

export default function ComingSoon() {
  const { pathname } = useLocation()
  return (
    <div className="glass mx-auto mt-10 max-w-lg animate-fadeUp p-10 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30"><Hammer className="h-8 w-8" /></div>
      <h1 className="font-display text-2xl font-bold">Bu bo'lim keyingi bosqichda qo'shiladi</h1>
      <p className="mt-2 text-slate-400"><code>{pathname}</code> — Stage 2–4 da to'liq ishlaydigan holatga keltiriladi.</p>
      <Link to="/dashboard" className="btn-primary mt-6">Boshqaruv paneliga qaytish</Link>
    </div>
  )
}
