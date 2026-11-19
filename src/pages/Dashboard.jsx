import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Flame, Trophy, CheckCircle2, GraduationCap, ArrowRight, BookOpen, Calculator, Mic, PenLine, Headphones, BookText, Bell, Sparkles } from 'lucide-react'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { ENGLISH_LEVELS, MATH_LEVELS } from '../data/catalog'
import { getLesson } from '../lib/content'

const Stat = ({ icon: I, label, value, tone }) => (
  <div className="glass p-5"><div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><I className="h-5 w-5" /></div><p className="font-display text-3xl font-bold">{value}</p><p className="text-sm text-slate-400">{label}</p></div>
)

const QUICK = [
  { to: '/english', label: 'Ingliz tili', icon: BookOpen, tone: 'from-violet-500/20 to-sky-500/20' },
  { to: '/math', label: 'Matematika', icon: Calculator, tone: 'from-sky-500/20 to-cyan-500/20' },
  { to: '/ielts', label: 'IELTS', icon: GraduationCap, tone: 'from-cyan-500/20 to-emerald-500/20' },
  { to: '/toefl', label: 'TOEFL', icon: GraduationCap, tone: 'from-emerald-500/20 to-amber-500/20' },
  { to: '/skills/writing', label: 'Writing', icon: PenLine, tone: 'from-fuchsia-500/20 to-violet-500/20' },
  { to: '/skills/speaking', label: 'Speaking', icon: Mic, tone: 'from-violet-500/20 to-indigo-500/20' },
  { to: '/skills/listening', label: 'Listening', icon: Headphones, tone: 'from-indigo-500/20 to-sky-500/20' },
  { to: '/skills/reading', label: 'Reading', icon: BookText, tone: 'from-sky-500/20 to-teal-500/20' },
]

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [progress, setProgress] = useState([])
  const name = (profile?.displayName || user?.displayName || '').split(' ')[0]
  const p = profile || {}

  useEffect(() => {
    if (!user) return
    getDocs(collection(db, 'users', user.uid, 'progress')).then((snap) => setProgress(snap.docs.map((d) => d.data()))).catch(() => {})
  }, [user])

  const continueLessons = useMemo(() => progress.filter((x) => !x.completed && x.lessonId).slice(0, 3).map((x) => {
    const parts = x.lessonId.split('-')
    return { progress: x, lesson: getLesson(parts[0], parts[1], parts.slice(2).join('-')) }
  }).filter((x) => x.lesson), [progress])

  const levelCount = (subject) => (subject === 'english' ? ENGLISH_LEVELS : MATH_LEVELS).length

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="glass relative overflow-hidden p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-neon-purple/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-neon-blue/20 blur-3xl" />
        <p className="relative text-sm text-neon-blue">LINGUA PRO · {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="relative mt-2 font-display text-3xl font-bold sm:text-4xl">Salom, <span className="gradient-text">{name || "o'quvchi"}</span>!</h1>
        <p className="relative mt-2 max-w-xl text-slate-300">Bugungi maqsadingiz — {p.dailyGoal || 15} daqiqa. {continueLessons.length ? 'Davom etayotgan darslaringiz sizni kutyapti.' : 'Darajangizni aniqlash uchun placement testdan boshlang.'}</p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link to="/placement-test" className="btn-primary">Daraja testi <ArrowRight className="h-4 w-4" /></Link>
          {continueLessons[0] && <Link to={`/${continueLessons[0].lesson.subject}/lesson/${continueLessons[0].lesson.id}`} className="btn-ghost">Darsni davom ettirish</Link>}
          <Link to="/english" className="btn-ghost">Kurslar</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={CheckCircle2} label="Tugatilgan darslar" value={p.completedLessons ?? 0} tone="bg-emerald-500/20 text-emerald-300" />
        <Stat icon={Trophy} label="Jami ballar" value={p.points ?? 0} tone="bg-amber-500/20 text-amber-300" />
        <Stat icon={Flame} label="Kunlik seriya" value={`${p.streak ?? 0} kun`} tone="bg-orange-500/20 text-orange-300" />
        <Stat icon={GraduationCap} label="Daraja" value={(p.level || 'starter').toUpperCase()} tone="bg-neon-purple/20 text-neon-purple" />
      </div>

      {continueLessons.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold"><Sparkles className="h-5 w-5 text-neon-purple" /> Davom etish</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {continueLessons.map(({ lesson, progress: pr }) => (
              <Link key={lesson.id} to={`/${lesson.subject}/lesson/${lesson.id}`} className="glass p-5 transition hover:border-neon-purple/40">
                <p className="text-xs uppercase tracking-widest text-neon-blue">{lesson.subject} · {lesson.level}</p>
                <p className="mt-2 font-semibold">{lesson.title}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue" style={{ width: `${Math.min(100, (pr.lastPosition / (pr.duration || lesson.durationSeconds || 1)) * 100)}%` }} /></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Tezkor kirish</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK.map(({ to, label, icon: I, tone }) => (
            <Link key={to} to={to} className={`glass bg-gradient-to-br ${tone} p-5 transition hover:-translate-y-1 hover:shadow-glow`}><I className="h-6 w-6 text-neon-purple" /><p className="mt-4 font-semibold">{label}</p></Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/english" className="glass p-6 transition hover:border-neon-purple/40"><p className="text-xs uppercase tracking-widest text-neon-blue">English</p><h3 className="mt-2 font-display text-xl font-bold">210 ta video dars</h3><p className="mt-2 text-sm text-slate-400">{levelCount('english')} bosqich · Starter dan C2 gacha</p><ArrowRight className="mt-4 h-5 w-5 text-neon-purple" /></Link>
        <Link to="/math" className="glass p-6 transition hover:border-neon-blue/40"><p className="text-xs uppercase tracking-widest text-neon-blue">Mathematics</p><h3 className="mt-2 font-display text-xl font-bold">120 ta video dars</h3><p className="mt-2 text-sm text-slate-400">{levelCount('math')} bosqich · Noldan ilg‘or darajagacha</p><ArrowRight className="mt-4 h-5 w-5 text-neon-blue" /></Link>
      </div>
      <div className="flex flex-wrap gap-3"><Link to="/results" className="btn-ghost">Natijalar</Link><Link to="/notifications" className="btn-ghost"><Bell className="h-4 w-4" /> Bildirishnomalar</Link></div>
    </div>
  )
}
