import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Field, Alert, Spinner } from '../components/ui'
import { isEmail } from '../utils/validators'
import { authMessage } from '../utils/authErrors'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setOk('')
    if (!isEmail(email)) return setErr("To'g'ri email kiriting.")
    setBusy(true)
    try { await resetPassword(email); setOk("Parolni tiklash havolasi emailingizga yuborildi. Spam papkasini ham tekshiring.") }
    catch (e2) { setErr(authMessage(e2)) }
    finally { setBusy(false) }
  }
  return (
    <div className="glass p-7 sm:p-9">
      <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Orqaga</Link>
      <h2 className="font-display text-3xl font-bold">Parolni tiklash</h2>
      <p className="mt-1 text-slate-400">Emailingizni kiriting, tiklash havolasini yuboramiz.</p>
      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Alert>{err}</Alert>
        <Alert type="success">{ok}</Alert>
        <Field label="Email" icon={Mail} type="email" placeholder="siz@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner className="h-5 w-5" /> : 'Havola yuborish'}</button>
      </form>
    </div>
  )
}
