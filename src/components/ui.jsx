import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 'h-12 w-12 text-2xl' : 'h-10 w-10 text-xl'
  return (
    <div className="flex items-center gap-3">
      <div className={`${s} grid place-items-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue font-display font-extrabold shadow-glow`}>L</div>
      <span className="font-display text-xl font-extrabold tracking-wide">
        LINGUA <span className="gradient-text">PRO</span>
      </span>
    </div>
  )
}

export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

export function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <Spinner className="h-6 w-6 text-neon-purple" />
      </div>
    </div>
  )
}

export function Field({ label, error, icon: Icon, type = 'text', ...props }) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>}
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />}
        <input
          {...props}
          type={isPass && show ? 'text' : type}
          className={`field ${Icon ? 'pl-12' : ''} ${isPass ? 'pr-12' : ''} ${error ? 'border-rose-500/70' : ''}`}
        />
        {isPass && (
          <button type="button" onClick={() => setShow((v) => !v)} aria-label="Parolni ko'rsatish"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-sm text-rose-400">{error}</span>}
    </label>
  )
}

export function Alert({ type = 'error', children }) {
  if (!children) return null
  const c = type === 'error'
    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${c}`}>{children}</div>
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}
