import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Field, Alert, Spinner, GoogleIcon } from '../components/ui'
import { validateRegister } from '../utils/validators'
import { authMessage } from '../utils/authErrors'

export default function Register() {
  const { register, loginWithGoogle } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const v = validateRegister(form)
    setErrors(v)
    if (Object.keys(v).length) return
    setBusy(true); setError('')
    try { await register(form); nav('/onboarding', { replace: true }) }
    catch (err) { setError(authMessage(err)) }
    finally { setBusy(false) }
  }
  const google = async () => {
    setBusy(true); setError('')
    try { await loginWithGoogle(); nav('/onboarding', { replace: true }) }
    catch (err) { setError(authMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <div className="glass p-7 sm:p-9">
      <h2 className="font-display text-3xl font-bold">Hisob yaratish</h2>
      <p className="mt-1 text-slate-400">Bepul boshlang — bir daqiqa yetarli.</p>
      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Alert>{error}</Alert>
        <Field label="To'liq ism" icon={User} autoComplete="name" placeholder="Ism Familiya" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" icon={Mail} type="email" autoComplete="email" placeholder="siz@email.com" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Parol" icon={Lock} type="password" autoComplete="new-password" placeholder="Kamida 6 ta belgi" value={form.password} onChange={set('password')} error={errors.password} />
        <Field label="Parolni tasdiqlang" icon={Lock} type="password" autoComplete="new-password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : "Ro'yxatdan o'tish"}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-500"><span className="h-px flex-1 bg-white/10" />yoki<span className="h-px flex-1 bg-white/10" /></div>
      <button onClick={google} disabled={busy} className="btn-ghost w-full"><GoogleIcon /> Google orqali davom etish</button>
      <p className="mt-6 text-center text-slate-400">Hisobingiz bormi? <Link to="/login" className="font-semibold text-neon-purple hover:underline">Kirish</Link></p>
    </div>
  )
}
