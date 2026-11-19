import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Field, Alert, Spinner } from '../components/ui'
import { User, Mail } from 'lucide-react'

export default function Profile() {
  const { user, profile, saveProfile, logout } = useAuth()
  const [name, setName] = useState(profile?.displayName || user?.displayName || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ t: '', ok: false })

  const submit = async (e) => {
    e.preventDefault()
    if (name.trim().length < 3) return setMsg({ t: "Ism kamida 3 ta belgi bo'lsin.", ok: false })
    setBusy(true)
    try { await saveProfile({ displayName: name.trim() }); setMsg({ t: 'Saqlandi ✔', ok: true }) }
    catch { setMsg({ t: "Saqlab bo'lmadi.", ok: false }) }
    finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-xl animate-fadeUp">
      <h1 className="font-display text-3xl font-bold">Profil</h1>
      <form onSubmit={submit} className="glass mt-6 space-y-4 p-7">
        <Field label="To'liq ism" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" icon={Mail} value={user?.email || ''} disabled />
        <Alert type={msg.ok ? 'success' : 'error'}>{msg.t}</Alert>
        <div className="flex gap-3">
          <button className="btn-primary" disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : 'Saqlash'}</button>
          <button type="button" className="btn-ghost" onClick={logout}>Chiqish</button>
        </div>
      </form>
    </div>
  )
}
