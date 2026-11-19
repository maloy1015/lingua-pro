import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GOALS, DAILY_GOALS } from '../data/onboarding'
import { Alert, Spinner } from '../components/ui'

export default function Settings() {
  const { profile, saveProfile } = useAuth()
  const [daily, setDaily] = useState(profile?.dailyGoal || 15)
  const [goals, setGoals] = useState(profile?.goals || [])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const toggle = (id) => setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  const save = async () => {
    setBusy(true)
    try { await saveProfile({ dailyGoal: daily, goals }); setMsg('Saqlandi ✔') } catch { setMsg("Saqlab bo'lmadi.") } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-2xl animate-fadeUp">
      <h1 className="font-display text-3xl font-bold">Sozlamalar</h1>
      <div className="glass mt-6 space-y-6 p-7">
        <div>
          <p className="mb-3 font-semibold">Kunlik maqsad</p>
          <div className="flex flex-wrap gap-2">
            {DAILY_GOALS.map((m) => <button key={m} onClick={() => setDaily(m)} className={`rounded-xl border px-4 py-2 ${daily === m ? 'border-neon-purple bg-neon-purple/20' : 'border-white/10 bg-white/5'}`}>{m} daq.</button>)}
          </div>
        </div>
        <div>
          <p className="mb-3 font-semibold">O'quv maqsadlari</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => <button key={g.id} onClick={() => toggle(g.id)} className={`rounded-xl border px-3 py-2 text-sm ${goals.includes(g.id) ? 'border-neon-blue bg-neon-blue/15' : 'border-white/10 bg-white/5'}`}>{g.emoji} {g.label}</button>)}
          </div>
        </div>
        <Alert type="success">{msg}</Alert>
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : 'Saqlash'}</button>
      </div>
    </div>
  )
}
