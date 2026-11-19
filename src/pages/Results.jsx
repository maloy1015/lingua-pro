import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { BarChart3, CheckCircle2, Trophy, Flame, FileCheck2 } from 'lucide-react'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Pill, EmptyState } from '../components/common'

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="glass p-5"><div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="font-display text-2xl font-bold">{value}</p><p className="text-xs text-slate-400">{label}</p></div>
)

export default function Results() {
  const { user, profile } = useAuth()
  const [attempts, setAttempts] = useState([])

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'users', user.uid, 'attempts'), orderBy('createdAt', 'desc')))
      .then((snap) => setAttempts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => {})
  }, [user])

  const avg = useMemo(() => {
    const scored = attempts.filter((a) => typeof a.percent === 'number')
    return scored.length ? Math.round(scored.reduce((s, a) => s + a.percent, 0) / scored.length) : 0
  }, [attempts])

  const grouped = useMemo(() => {
    const map = {}
    attempts.forEach((a) => { map[a.type || 'other'] = (map[a.type || 'other'] || 0) + 1 })
    return map
  }, [attempts])

  return (
    <div className="animate-fadeUp space-y-6">
      <PageHeader eyebrow="Analytics" title="Natijalar va yutuqlar" description="Barcha testlar, yozma va og‘zaki topshiriqlar hamda dars tugatishlarining qisqacha hisoboti." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={CheckCircle2} label="Tugatilgan darslar" value={profile?.completedLessons ?? 0} tone="bg-emerald-500/20 text-emerald-300" />
        <Stat icon={Trophy} label="Jami ball" value={profile?.points ?? 0} tone="bg-amber-500/20 text-amber-300" />
        <Stat icon={Flame} label="Kunlik seriya" value={`${profile?.streak ?? 0} kun`} tone="bg-orange-500/20 text-orange-300" />
        <Stat icon={BarChart3} label="O‘rtacha test natijasi" value={`${avg}%`} tone="bg-neon-purple/20 text-neon-purple" />
      </div>
      <div className="glass p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Faoliyat turlari</h3>
        <div className="flex flex-wrap gap-2">{Object.entries(grouped).map(([type, count]) => <Pill key={type} tone="blue">{type}: {count}</Pill>)}</div>
      </div>
      {attempts.length ? (
        <div className="glass p-6">
          <h3 className="mb-4 font-display text-lg font-bold">So‘nggi natijalar</h3>
          <div className="space-y-2">{attempts.slice(0, 20).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-sm">
              <FileCheck2 className="h-4 w-4 text-neon-blue" />
              <span className="flex-1">{a.title || a.type}</span>
              <Pill tone="slate">{a.type}</Pill>
              {a.percent != null && <Pill tone={a.percent >= 70 ? 'green' : 'amber'}>{a.percent}%</Pill>}
              {a.wordCount != null && <Pill tone="slate">{a.wordCount} so‘z</Pill>}
            </div>
          ))}</div>
        </div>
      ) : <EmptyState title="Hali natija yo‘q" text="Dars testlarini topshirganingizda natijalar bu yerda paydo bo‘ladi." action={<Link className="btn-primary mt-4" to="/english">Darslarga o‘tish</Link>} />}
    </div>
  )
}
