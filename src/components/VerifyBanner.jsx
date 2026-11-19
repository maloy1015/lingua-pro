import { useState } from 'react'
import { MailWarning } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase/firebase'

export default function VerifyBanner() {
  const { user, resendVerification } = useAuth()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  if (!user || user.emailVerified) return null

  const resend = async () => {
    setBusy(true)
    try { await resendVerification(); setMsg('Tasdiqlash xati yuborildi.') }
    catch { setMsg("Hozircha yuborib bo'lmadi, birozdan keyin urinib ko'ring.") }
    finally { setBusy(false) }
  }
  const refresh = async () => {
    await auth.currentUser.reload()
    window.location.reload()
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
      <MailWarning className="h-5 w-5 shrink-0" />
      <span className="flex-1">Emailingiz tasdiqlanmagan ({user.email}). Xatdagi havolani bosing.</span>
      {msg && <span className="text-amber-300">{msg}</span>}
      <button className="btn-ghost !px-3 !py-1.5" onClick={resend} disabled={busy}>Qayta yuborish</button>
      <button className="btn-ghost !px-3 !py-1.5" onClick={refresh}>Tasdiqladim</button>
    </div>
  )
}
