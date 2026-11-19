import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, ArrowRight, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PLACEMENT_QUESTIONS, scorePlacement } from '../data/examContent'
import { saveAttempt } from '../services/progressService'
import { PageHeader, Quiz, Pill } from '../components/common'
import { Alert } from '../components/ui'

export default function PlacementTest() {
  const { user, profile, saveProfile } = useAuth()
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  const finish = async (res) => {
    const level = scorePlacement(res.answers)
    setResult(level)
    if (!user) return
    try {
      await saveAttempt(user.uid, { type: 'placement', title: 'CEFR placement test', ...res, recommendedLevel: level.level })
      await saveProfile({ level: level.level, placement: { percent: level.percent, date: new Date().toISOString() } })
      setMsg('Daraja profilingiz saqlandi ✔')
    } catch (e) { setMsg(e.message) }
  }

  const route = result?.level === 'starter' || result?.level === 'a1' || result?.level === 'a2' || result?.level === 'b1' || result?.level === 'b2' || result?.level === 'c1'
    ? `/english/${result.level}` : '/english'

  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Assessment" title="Daraja testi" description="8 ta savol orqali ingliz tili darajangizni aniqlang. Natija profilingizga saqlanadi.">
        <Pill tone="blue"><ClipboardCheck className="mr-1 h-3 w-3" />{PLACEMENT_QUESTIONS.length} savol</Pill>
      </PageHeader>
      {profile?.placement && !result && <div className="glass p-5 text-sm text-slate-300">Oldingi natija: <b>{profile.placement.percent}%</b> · Tavsiya etilgan daraja: <b className="text-neon-blue">{profile.level?.toUpperCase()}</b></div>}
      <Quiz questions={PLACEMENT_QUESTIONS} onComplete={finish} title="Daraja testi" />
      {result && (
        <div className="glass relative overflow-hidden p-7">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon-purple/20 blur-3xl" />
          <div className="relative flex items-center gap-3"><Trophy className="h-7 w-7 text-amber-300" /><h3 className="font-display text-2xl font-bold">Sizning darajangiz: {result.level.toUpperCase()}</h3></div>
          <p className="relative mt-2 text-slate-300">To‘g‘ri javoblar: {result.correct}/{result.total} · {result.percent}%</p>
          <Link to={route} className="btn-primary relative mt-5">Tavsiya etilgan kursga o‘tish <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
      <Alert type={msg.includes('✔') ? 'success' : 'error'}>{msg}</Alert>
    </div>
  )
}
