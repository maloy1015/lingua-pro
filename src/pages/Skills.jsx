import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { PenLine, Mic, Headphones, BookOpen, Save, Play, CheckCircle2 } from 'lucide-react'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { EXAM_TESTS, WRITING_RUBRIC } from '../data/examContent'
import { saveAttempt } from '../services/progressService'
import { PageHeader, Quiz, Pill } from '../components/common'
import { Alert } from '../components/ui'
import SpeakingPractice from '../components/SpeakingPractice'

function useHistory(type) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'users', user.uid, 'attempts'), orderBy('createdAt', 'desc')))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((a) => a.type === type)))
      .catch(() => {})
  }, [user, type])
  return [items, setItems]
}

const PROMPTS = [
  'Describe a memorable journey you have taken. What made it special?',
  'Some people think students should use computers in every lesson. Do you agree?',
  'Write an email to a friend explaining your study plans for the next month.',
  'What is the most useful skill you have learned recently, and how did you learn it?',
]

export function WritingSkill() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState(PROMPTS[0])
  const [checks, setChecks] = useState({})
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useHistory('writing')
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const save = async () => {
    if (!user || !text.trim()) return
    try {
      await saveAttempt(user.uid, { type: 'writing', title: 'Writing practice', prompt, text, wordCount: words, selfCheck: checks, status: 'saved-for-review' })
      setHistory((h) => [{ id: String(Date.now()), title: 'Writing practice', wordCount: words, prompt }, ...h])
      setMsg(`Saqlangan: ${words} so‘z. AI baholash joriy etilmagan; javob o‘qituvchi tomonidan ko‘rib chiqiladi.`)
    } catch (e) { setMsg(e.message) }
  }
  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Skill" title="Writing" description="Yozma javob yozing, so‘z sonini kuzating va baholash mezonlarini o‘zingiz tekshiring." />
      <div className="glass space-y-4 p-6">
        <label className="block text-sm font-medium text-slate-300">Topshiriq
          <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="field mt-2">{PROMPTS.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <div className="flex justify-between text-sm text-slate-400"><span>Tavsiya etiladi: 150–250 so‘z</span><span className={words >= 150 ? 'text-emerald-300' : 'text-amber-300'}>{words} so‘z</span></div>
        <textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} className="field resize-y" placeholder="Ingliz tilida yozing..." />
        <div className="grid gap-2 sm:grid-cols-2">{WRITING_RUBRIC.map((r) => <label key={r.criterion} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><input type="checkbox" className="mr-2 accent-neon-purple" checked={!!checks[r.criterion]} onChange={(e) => setChecks((c) => ({ ...c, [r.criterion]: e.target.checked }))} /><b>{r.criterion}</b> <span className="text-slate-500">({r.max})</span><p className="mt-1 text-xs text-slate-400">{r.description}</p></label>)}</div>
        <button onClick={save} disabled={!text.trim()} className="btn-primary"><Save className="h-4 w-4" /> Saqlash</button>
        <Alert type={msg.includes('Saqlangan') ? 'success' : 'error'}>{msg}</Alert>
      </div>
      {history.length > 0 && <div className="glass p-6"><h3 className="mb-3 font-semibold">Tarix</h3>{history.map((h) => <div key={h.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="flex-1 truncate">{h.prompt}</span><span>{h.wordCount} so‘z</span></div>)}</div>}
    </div>
  )
}

export function SpeakingSkill() {
  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Skill" title="Speaking" description="Mikrofon bilan gapirish mashqlari, audio playback va saqlangan tarix." />
      <SpeakingPractice title="Speaking practice" system="general" prompts={[
        'Introduce yourself and describe your daily routine.',
        'Describe a place where you like to study.',
        'Talk about a film you recently watched.',
        'Explain how you learn new English words.',
      ]} />
    </div>
  )
}

export function ListeningSkill() {
  const { user } = useAuth()
  const test = EXAM_TESTS.ielts['ielts-listening']
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useHistory('exam')
  const play = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(test.script)
    u.lang = 'en-US'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }
  const record = async (res) => {
    if (!user) return
    try { await saveAttempt(user.uid, { type: 'exam', system: 'ielts', sectionId: 'ielts-listening', title: test.title, ...res }); setMsg(`Natija: ${res.percent}% saqlandi ✔`); setHistory((h) => [{ id: String(Date.now()), title: test.title, percent: res.percent }, ...h]) }
    catch (e) { setMsg(e.message) }
  }
  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Skill" title="Listening" description="Audio tinglang, savollarga javob bering va avtomatik baho oling." />
      <div className="glass flex flex-wrap items-center gap-4 p-6"><button onClick={play} className="btn-primary"><Play className="h-4 w-4" /> Audioni ijro etish</button><Pill tone="slate">{test.questions.length} savol</Pill></div>
      <details className="glass p-5"><summary className="cursor-pointer font-semibold">Transkriptni ko‘rish</summary><p className="mt-3 text-sm leading-relaxed text-slate-300">{test.script}</p></details>
      <Quiz questions={test.questions} onComplete={record} />
      <Alert type={msg.includes('✔') ? 'success' : 'error'}>{msg}</Alert>
    </div>
  )
}

export function ReadingSkill() {
  const { user } = useAuth()
  const test = EXAM_TESTS.ielts['ielts-reading']
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useHistory('exam')
  const record = async (res) => {
    if (!user) return
    try { await saveAttempt(user.uid, { type: 'exam', system: 'ielts', sectionId: 'ielts-reading', title: test.title, ...res }); setMsg(`Natija: ${res.percent}% saqlandi ✔`); setHistory((h) => [{ id: String(Date.now()), title: test.title, percent: res.percent }, ...h]) }
    catch (e) { setMsg(e.message) }
  }
  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Skill" title="Reading" description="Matnni o‘qing, tushunish savollariga javob bering va natijani oling." />
      <div className="glass p-6"><div className="mb-3 flex gap-2"><BookOpen className="h-5 w-5 text-neon-purple" /><Pill tone="slate">IELTS Academic</Pill></div><p className="leading-relaxed text-slate-300">{test.passage}</p></div>
      <Quiz questions={test.questions} onComplete={record} />
      <Alert type={msg.includes('✔') ? 'success' : 'error'}>{msg}</Alert>
      {history.length > 0 && <div className="glass p-6"><h3 className="mb-3 font-semibold">Natijalar</h3><div className="space-y-2">{history.filter((h) => h.sectionId === 'ielts-reading').map((h) => <div key={h.id} className="flex justify-between rounded-xl bg-white/5 p-3 text-sm"><span>{h.title}</span><span className="font-bold text-emerald-300">{h.percent}%</span></div>)}</div></div>}
    </div>
  )
}
