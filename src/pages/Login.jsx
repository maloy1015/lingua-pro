import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Field, Alert, Spinner, GoogleIcon } from '../components/ui'
import { validateLogin } from '../utils/validators'
import { authMessage } from '../utils/authErrors'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const dest = loc.state?.from || '/dashboard'

  const submit = async (e) => {
    e.preventDefault()
    const v = validateLogin(form)
    setErrors(v)
    if (Object.keys(v).length) return
    setBusy(true); setError('')
    try { await login(form.email, form.password); nav(dest, { replace: true }) }
    catch (err) { setError(authMessage(err)) }
    finally { setBusy(false) }
  }
  const google = async () => {
    setBusy(true); setError('')
    try { await loginWithGoogle(); nav(dest, { replace: true }) }
    catch (err) { setError(authMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <div className="glass p-7 sm:p-9">
      <h2 className="font-display text-3xl font-bold">Xush kelibsiz 👋</h2>
      <p className="mt-1 text-slate-400">Hisobingizga kiring va o'qishni davom ettiring.</p>
      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Alert>{error}</Alert>
        <Field label="Email" icon={Mail} type="email" autoComplete="email" placeholder="siz@email.com" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Parol" icon={Lock} type="password" autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
        <div className="text-right"><Link to="/forgot-password" className="text-sm text-neon-blue hover:underline">Parolni unutdingizmi?</Link></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : 'Kirish'}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-500"><span className="h-px flex-1 bg-white/10" />yoki<span className="h-px flex-1 bg-white/10" /></div>
      <button onClick={google} disabled={busy} className="btn-ghost w-full"><GoogleIcon /> Google orqali kirish</button>
      <p className="mt-6 text-center text-slate-400">Hisobingiz yo'qmi? <Link to="/register" className="font-semibold text-neon-purple hover:underline">Ro'yxatdan o'tish</Link></p>
    </div>
  )
}
