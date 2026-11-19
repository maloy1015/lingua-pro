import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo, Alert, Spinner } from '../components/ui'
import { GOALS, LEVELS, DAILY_GOALS } from '../data/onboarding'

export default function Onboarding() {
  const { profile, user, saveProfile, logout } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [goals, setGoals] = useState([])
  const [level, setLevel] = useState('starter')
  const [daily, setDaily] = useState(15)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id) => setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  const name = (profile?.displayName || user?.displayName || '').split(' ')[0]

  const finish = async () => {
    setBusy(true); setError('')
    try {
      await saveProfile({ goals, level, dailyGoal: daily, onboarded: true })
      nav('/dashboard', { replace: true })
    } catch (e) {
      console.error(e); setError("Saqlab bo'lmadi. Internetni tekshirib qayta urinib ko'ring.")
    } finally { setBusy(false) }
  }
  const next = () => {
    if (step === 0 && goals.length === 0) return setError("Kamida bitta maqsadni tanlang.")
    setError(''); setStep(step + 1)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Logo />
        <button onClick={logout} className="text-sm text-slate-500 hover:text-white">Chiqish</button>
      </div>
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-neon-purple to-neon-blue' : 'bg-white/10'}`} />)}
      </div>
      <div className="glass mt-6 flex-1 animate-fadeUp p-6 sm:p-9" key={step}>
        {step === 0 && (<>
          <h1 className="font-display text-3xl font-bold">{name ? `${name}, ` : ''}maqsadlaringiz qanday?</h1>
          <p className="mt-1 text-slate-400">Bir nechtasini tanlashingiz mumkin.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {GOALS.map((g) => {
              const on = goals.includes(g.id)
              return (
                <button key={g.id} onClick={() => toggle(g.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${on ? 'border-neon-purple bg-neon-purple/15 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="flex-1 font-medium">{g.label}</span>
                  {on && <Check className="h-5 w-5 text-neon-purple" />}
                </button>
              )
            })}
          </div>
        </>)}
        {step === 1 && (<>
          <h1 className="font-display text-3xl font-bold">Hozirgi darajangiz?</h1>
          <p className="mt-1 text-slate-400">Aniq bilmasangiz, keyinroq placement test topshirasiz.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => setLevel(l.id)}
                className={`rounded-2xl border p-4 text-left transition ${level === l.id ? 'border-neon-blue bg-neon-blue/10 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <p className="font-semibold">{l.label}</p><p className="text-sm text-slate-400">{l.hint}</p>
              </button>
            ))}
          </div>
        </>)}
        {step === 2 && (<>
          <h1 className="font-display text-3xl font-bold">Kunlik maqsad</h1>
          <p className="mt-1 text-slate-400">Kuniga qancha vaqt ajrata olasiz?</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DAILY_GOALS.map((m) => (
              <button key={m} onClick={() => setDaily(m)}
                className={`rounded-2xl border p-5 text-center transition ${daily === m ? 'border-neon-purple bg-neon-purple/15 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <p className="font-display text-3xl font-bold">{m}</p><p className="text-sm text-slate-400">daqiqa</p>
              </button>
            ))}
          </div>
        </>)}
        <div className="mt-6"><Alert>{error}</Alert></div>
        <div className="mt-6 flex justify-between">
          <button className="btn-ghost" onClick={() => { setError(''); setStep(step - 1) }} style={{ visibility: step ? 'visible' : 'hidden' }}><ArrowLeft className="h-4 w-4" /> Orqaga</button>
          {step < 2
            ? <button className="btn-primary" onClick={next}>Davom etish <ArrowRight className="h-4 w-4" /></button>
            : <button className="btn-primary" onClick={finish} disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : <>Boshlash <ArrowRight className="h-4 w-4" /></>}</button>}
        </div>
      </div>
    </div>
  )
}
