import { Link } from 'react-router-dom'
import { Flame, Trophy, CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Stat = ({ icon: I, label, value, tone }) => (
  <div className="glass p-5">
    <div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><I className="h-5 w-5" /></div>
    <p className="font-display text-3xl font-bold">{value}</p>
    <p className="text-sm text-slate-400">{label}</p>
  </div>
)

export default function Dashboard() {
  const { profile, user } = useAuth()
  const name = (profile?.displayName || user?.displayName || '').split(' ')[0]
  const p = profile || {}
  return (
    <div className="animate-fadeUp space-y-6">
      <div className="glass relative overflow-hidden p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-neon-purple/30 blur-3xl" />
        <h1 className="relative font-display text-3xl font-bold sm:text-4xl">Salom, <span className="gradient-text">{name || "o'quvchi"}</span>!</h1>
        <p className="relative mt-2 max-w-xl text-slate-300">Bugungi kunlik maqsadingiz — {p.dailyGoal || 15} daqiqa. Darajangizni aniqlash uchun placement testdan boshlang.</p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link to="/placement-test" className="btn-primary">Daraja testini boshlash <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/english" className="btn-ghost">Ingliz tili kurslari</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={CheckCircle2} label="Tugatilgan darslar" value={p.completedLessons ?? 0} tone="bg-emerald-500/20 text-emerald-300" />
        <Stat icon={Trophy} label="Jami ballar" value={p.points ?? 0} tone="bg-amber-500/20 text-amber-300" />
        <Stat icon={Flame} label="Kunlik seriya" value={`${p.streak ?? 0} kun`} tone="bg-orange-500/20 text-orange-300" />
        <Stat icon={GraduationCap} label="Daraja" value={(p.level || 'starter').toUpperCase()} tone="bg-neon-purple/20 text-neon-purple" />
      </div>
    </div>
  )
}
