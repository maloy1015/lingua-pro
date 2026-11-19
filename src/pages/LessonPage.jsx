import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleCheck, NotebookPen, ListChecks, Languages, FileText, Sparkles, Send } from 'lucide-react'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { getLesson } from '../lib/content'
import { getSeeds } from '../data/lessonSeeds'
import { getEnglishLevel, getMathLevel } from '../data/catalog'
import { resolveLesson } from '../services/courseService'
import { progressRef, saveLessonProgress, saveAttempt } from '../services/progressService'
import { queueVideo } from '../services/videoJobService'
import LessonPlayer from '../components/LessonPlayer'
import { Quiz, Pill, Tabs, PageHeader } from '../components/common'
import { Alert, Spinner } from '../components/ui'

const TABS = [
  { id: 'video', label: 'Video', icon: Sparkles },
  { id: 'transcript', label: 'Transkript', icon: FileText },
  { id: 'vocab', label: 'Lug‘at', icon: Languages },
  { id: 'exercises', label: 'Mashqlar', icon: NotebookPen },
  { id: 'quiz', label: 'Test', icon: ListChecks },
]

export default function LessonPage({ subject: subjectProp }) {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [tab, setTab] = useState('video')
  const [revealed, setRevealed] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const parsed = useMemo(() => {
    const parts = (id || '').split('-')
    const subject = subjectProp || parts[0]
    const level = parts[1]
    const seedId = parts.slice(2).join('-')
    return { subject, level, seedId }
  }, [id, subjectProp])

  useEffect(() => {
    const base = getLesson(parsed.subject, parsed.level, parsed.seedId)
    if (!base) { setLesson(null); return }
    setLesson({ ...base, video: { status: 'not-generated', url: '', audioUrl: '', subtitleUrl: '', voice: 'en-female' } })
    const unsub = onSnapshot(doc(db, 'lessons', base.id), (snap) => {
      if (snap.exists()) setLesson(resolveLesson({ id: snap.id, ...snap.data() }))
    }, () => {})
    return unsub
  }, [parsed.subject, parsed.level, parsed.seedId])

  useEffect(() => {
    if (!user || !id) return
    return onSnapshot(doc(db, 'users', user.uid, 'progress', id), (snap) => setProgress(snap.exists() ? snap.data() : null), () => {})
  }, [user, id])

  if (!lesson) return <div className="glass p-10 text-center">Dars topilmadi. <Link className="text-neon-blue" to="/dashboard">Bosh sahifa</Link></div>

  const seeds = getSeeds(parsed.subject, parsed.level)
  const idx = seeds.findIndex((s) => s.id === parsed.seedId)
  const prev = idx > 0 ? seeds[idx - 1] : null
  const next = idx < seeds.length - 1 ? seeds[idx + 1] : null
  const basePath = parsed.subject === 'math' ? '/math/lesson' : '/english/lesson'
  const levelInfo = parsed.subject === 'math' ? getMathLevel(parsed.level) : getEnglishLevel(parsed.level)

  const complete = async (score) => {
    if (!user) return
    setBusy(true)
    try {
      await saveLessonProgress(user.uid, lesson.id, { completed: true, score: score ?? progress?.score ?? null, position: lesson.durationSeconds, duration: lesson.durationSeconds })
      setMessage('Dars tugatildi va natija saqlandi ✔')
    } catch (e) { setMessage(e.message || 'Saqlab bo‘lmadi') }
    finally { setBusy(false) }
  }

  const onQuiz = async (result) => {
    if (!user) return
    try {
      await saveAttempt(user.uid, { type: 'lesson-quiz', lessonId: lesson.id, title: lesson.title, subject: lesson.subject, level: lesson.level, ...result })
      if (result.percent >= 70) await complete(result.percent)
    } catch (e) { setMessage(e.message) }
  }

  const generate = async () => {
    setBusy(true)
    try { await queueVideo(lesson, 'en-female', user?.uid); setMessage('Video yaratish navbatga qo‘shildi.') }
    catch (e) { setMessage(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="animate-fadeUp space-y-6">
      <PageHeader eyebrow={`${levelInfo?.label || parsed.level} · ${lesson.category}`} title={lesson.title} description={lesson.concept}>
        <div className="flex flex-wrap gap-2">
          {prev && <Link to={`${basePath}/${parsed.level}-${prev.id}`} className="btn-ghost !py-2 text-sm"><ArrowLeft className="h-4 w-4" /> Oldingi</Link>}
          {next && <Link to={`${basePath}/${parsed.level}-${next.id}`} className="btn-ghost !py-2 text-sm">Keyingi <ArrowRight className="h-4 w-4" /></Link>}
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="blue">{idx + 1} / {seeds.length}-dars</Pill>
        <Pill tone="slate">{Math.round(lesson.durationSeconds / 60)} daqiqa</Pill>
        {progress?.completed ? <Pill tone="green"><CircleCheck className="mr-1 h-3 w-3" />Tugatilgan</Pill> : <Pill tone="amber">Jarayonda</Pill>}
        {lesson.video?.url ? <Pill tone="green">MP4 tayyor</Pill> : <Pill tone="amber">{lesson.video?.status === 'queued' || lesson.video?.status === 'processing' ? 'Video yaratilmoqda' : 'Video navbatda emas'}</Pill>}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'video' && (
        <div className="space-y-4">
          <LessonPlayer lesson={lesson} voice={lesson.video?.voice || 'en-female'} onProgress={(pos, dur) => { if (user && Math.floor(pos) % 30 === 0) saveLessonProgress(user.uid, lesson.id, { position: pos, duration: dur }) }} onComplete={() => complete()} />
          {isAdmin && !lesson.video?.url && <button className="btn-ghost" onClick={generate} disabled={busy}>{busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />} Ushbu dars uchun video yaratish</button>}
        </div>
      )}

      {tab === 'transcript' && (
        <div className="glass p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Dars transkripti</h3>
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            {lesson.script.map((s, i) => <p key={s.id}><span className="mr-2 font-mono text-xs text-neon-blue">{Math.floor(s.start / 60)}:{String(Math.floor(s.start % 60)).padStart(2, '0')}</span>{s.text}</p>)}
          </div>
        </div>
      )}

      {tab === 'vocab' && (
        <div className="glass p-6">
          <h3 className="mb-4 font-display text-lg font-bold">So‘z boyligi</h3>
          {lesson.vocabulary.length ? <div className="grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map((w, i) => <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold text-neon-blue">{w.term}</p><p className="mt-1 text-sm text-slate-400">{w.meaning}</p></div>)}</div> : <p className="text-sm text-slate-400">Bu darsda matematik atamalar qo‘llaniladi: {lesson.category}.</p>}
          <div className="mt-5 rounded-2xl border border-neon-purple/20 bg-neon-purple/10 p-4 text-sm"><b className="text-neon-purple">Grammatika / qoida:</b> {lesson.grammar || lesson.concept}</div>
        </div>
      )}

      {tab === 'exercises' && (
        <div className="space-y-3">
          {lesson.exercises.map((ex, i) => (
            <div key={ex.id} className="glass p-5">
              <p className="font-medium"><span className="mr-2 text-neon-blue">{i + 1}.</span>{ex.prompt}</p>
              <p className="mt-2 text-xs text-slate-500">Maslahat: {ex.hint}</p>
              <button className="btn-ghost mt-3 !py-2 text-sm" onClick={() => setRevealed((r) => ({ ...r, [ex.id]: !r[ex.id] }))}>{revealed[ex.id] ? 'Javobni yashirish' : 'Javobni ko‘rish'}</button>
              {revealed[ex.id] && <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{ex.answer}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && <Quiz questions={lesson.quiz} onComplete={onQuiz} title={`${lesson.title} — test`} />}

      <Alert type={message.includes('✔') || message.includes('navbat') ? 'success' : 'error'}>{message}</Alert>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => complete()} disabled={busy || progress?.completed} className="btn-primary disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> {progress?.completed ? 'Tugatilgan' : 'Darsni tugatish'}</button>
        <Link to={parsed.subject === 'math' ? '/math' : `/english/${parsed.level}`} className="btn-ghost">Kursga qaytish</Link>
      </div>
    </div>
  )
}
