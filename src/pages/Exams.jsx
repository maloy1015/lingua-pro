import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GraduationCap, Clock, ArrowRight, BookOpen, Headphones, PenLine, Mic, CheckCircle2, Timer, Save } from 'lucide-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { EXAM_TESTS } from '../data/examContent'
import { EXAM_SYSTEMS } from '../data/catalog'
import { saveAttempt } from '../services/progressService'
import { PageHeader, Pill, Quiz, Tabs, EmptyState } from '../components/common'
import { Alert } from '../components/ui'
import SpeakingPractice from '../components/SpeakingPractice'

const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic }

export function ExamsHub() {
  return (
    <div className="animate-fadeUp">
      <PageHeader eyebrow="Preparation" title="Imtihonlarga tayyorgarlik" description="CEFR, IELTS va TOEFL uchun haqiqiy topshiriqlar, automatik baholash va batafsil tushuntirishlar." />
      <div className="grid gap-4 md:grid-cols-3">
        {EXAM_SYSTEMS.map((s) => (
          <Link key={s.id} to={`/exams/${s.id}`} className="glass group p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue"><GraduationCap className="h-6 w-6" /></div>
            <h3 className="mt-5 font-display text-xl font-bold">{s.label}</h3>
            <p className="mt-2 text-sm text-slate-400">{s.tagline}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-neon-blue">{s.sections.length} bo‘lim <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ExamSystemPage() {
  const { system } = useParams()
  const info = EXAM_SYSTEMS.find((s) => s.id === system)
  if (!info) return <EmptyState title="Tizim topilmadi" action={<Link className="btn-primary mt-4" to="/exams">Imtihonlar</Link>} />
  return (
    <div className="animate-fadeUp">
      <PageHeader eyebrow="Exam system" title={info.label} description={info.tagline} />
      <div className="grid gap-3 md:grid-cols-2">
        {info.sections.map((section) => {
          const Icon = icons[section.id.split('-')[1]] || BookOpen
          return (
            <Link key={section.id} to={`/exams/${system}/${section.id}`} className="glass flex items-start gap-4 p-5 transition hover:border-neon-purple/40">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5"><Icon className="h-5 w-5 text-neon-purple" /></div>
              <div><h3 className="font-semibold">{section.label}</h3><p className="mt-1 text-sm text-slate-400">{section.description}</p></div>
              <ArrowRight className="ml-auto mt-3 h-4 w-4 text-slate-500" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function ExamRunner() {
  const { system, section } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [writing, setWriting] = useState('')
  const [selfCheck, setSelfCheck] = useState({})
  const [history, setHistory] = useState([])
  const test = EXAM_TESTS[system]?.[section]

  useEffect(() => {
    if (!test) return
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [test?.id])

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'users', user.uid, 'attempts'), orderBy('createdAt', 'desc')))
      .then((snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((a) => a.sectionId === section)))
      .catch(() => {})
  }, [user, section])

  if (!test) return <EmptyState title="Test topilmadi" action={<Link className="btn-primary mt-4" to={`/exams/${system}`}>Bo‘limlarga qaytish</Link>} />

  const record = async (result) => {
    if (!user) return
    try { await saveAttempt(user.uid, { type: 'exam', system, sectionId: section, title: test.title, ...result }); setMessage('Natija saqlandi ✔') }
    catch (e) { setMessage(e.message) }
  }

  const speak = () => {
    if (!('speechSynthesis' in window) || !test.script) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(test.script)
    u.lang = 'en-US'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }

  const wordCount = writing.trim() ? writing.trim().split(/\s+/).length : 0
  const saveWriting = async () => {
    if (!user) return
    try {
      await saveAttempt(user.uid, { type: 'writing', system, sectionId: section, title: test.title, text: writing, wordCount, status: 'saved-for-review', selfCheck })
      setMessage(`Yozma saqlandi (${wordCount} so‘z). Avtomatik AI baholash joriy etilmagan.`)
      setHistory((h) => [{ id: String(Date.now()), title: test.title, wordCount, status: 'saved-for-review' }, ...h])
    } catch (e) { setMessage(e.message) }
  }

  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow={`${system.toUpperCase()} · ${test.kind}`} title={test.title} description={test.prompt || 'Savollarga javob bering, so‘ngra natijani tekshiring.'}>
        <div className="flex gap-2"><Pill tone="slate"><Timer className="mr-1 h-3 w-3" />{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Pill><button onClick={() => navigate(`/exams/${system}`)} className="btn-ghost !py-2 text-sm">Chiqish</button></div>
      </PageHeader>

      {test.kind === 'reading' && test.passage && (
        <div className="glass p-6"><h3 className="mb-3 font-semibold">Matn</h3><p className="whitespace-pre-line leading-relaxed text-slate-300">{test.passage}</p></div>
      )}

      {test.kind === 'listening' && (
        <div className="glass flex flex-wrap items-center gap-4 p-6">
          <button onClick={speak} className="btn-primary"><Headphones className="h-4 w-4" /> Audio tinglash</button>
          <p className="text-sm text-slate-400">Audio brauzerning tabiiy ovozi bilan ijro etiladi. Transkript:</p>
          <p className="w-full rounded-xl bg-white/5 p-4 text-sm text-slate-300">{test.script}</p>
        </div>
      )}

      {(test.kind === 'reading' || test.kind === 'listening') && <Quiz questions={test.questions} onComplete={record} title="Topshiriq" />}

      {test.kind === 'writing' && (
        <div className="glass space-y-4 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400"><span>Minimum {test.minWords} so‘z</span><span className={wordCount >= test.minWords ? 'text-emerald-300' : 'text-amber-300'}>{wordCount} so‘z</span></div>
          <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={14} className="field resize-y" placeholder="Yozma javobingizni bu yerga kiriting..." />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h4 className="mb-2 font-semibold">Baholash mezonlari (o‘z-o‘zini tekshirish)</h4>
            <div className="space-y-2 text-sm text-slate-300">
              {test.criteria.map((c) => <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={!!selfCheck[c]} onChange={(e) => setSelfCheck((s) => ({ ...s, [c]: e.target.checked }))} className="accent-neon-purple" />{c}</label>)}
            </div>
          </div>
          <button onClick={saveWriting} disabled={!writing.trim()} className="btn-primary"><Save className="h-4 w-4" /> Javobni saqlash</button>
          <p className="text-xs text-slate-500">Bu yerda avtomatik AI baholash yo‘q. Yozma javob saqlanadi va o‘qituvchi tomonidan baholanishi mumkin.</p>
        </div>
      )}

      {test.kind === 'speaking' && <SpeakingPractice prompts={test.prompts} title={test.title} system={system} />}

      {history.length > 0 && (
        <div className="glass p-6"><h3 className="mb-3 font-semibold">Oldingi natijalar</h3><div className="space-y-2">{history.slice(0, 8).map((h) => <div key={h.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="flex-1">{h.title}</span>{h.percent != null && <span className="font-bold">{h.percent}%</span>}{h.wordCount != null && <span>{h.wordCount} so‘z</span>}</div>)}</div></div>
      )}
      <Alert type={message.includes('✔') || message.includes('saqlandi') ? 'success' : 'error'}>{message}</Alert>
    </div>
  )
}
