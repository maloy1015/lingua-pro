import { useEffect, useState } from 'react'
import { Download, X, RefreshCw, Smartphone, Monitor } from 'lucide-react'

export function hasInstallPrompt() {
  return typeof window !== 'undefined' && Boolean(window.deferredPrompt)
}

export function InstallButton({ compact = false }) {
  const [prompt, setPrompt] = useState(null)
  const [hidden, setHidden] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); window.deferredPrompt = e; setPrompt(e) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone
    setIos(isIos)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (hidden) return null
  if (ios) return (
    <button onClick={() => setHidden(true)} className="btn-ghost !py-2 text-xs" title="iOS: Share → Add to Home Screen">
      <Smartphone className="h-4 w-4" /> {compact ? 'O‘rnatish' : 'iOS ga o‘rnatish: Share → Add to Home Screen'}
    </button>
  )
  if (!prompt) return null
  return (
    <button className="btn-primary !py-2 text-xs" onClick={async () => {
      prompt.prompt()
      await prompt.userChoice
      window.deferredPrompt = null
      setPrompt(null)
      setHidden(true)
    }}><Download className="h-4 w-4" /> Ilovani o‘rnatish</button>
  )
}

export function UpdateBanner() {
  const [waiting, setWaiting] = useState(null)
  useEffect(() => {
    const onUpdate = (e) => setWaiting(e.detail)
    window.addEventListener('sw-update-ready', onUpdate)
    return () => window.removeEventListener('sw-update-ready', onUpdate)
  }, [])
  if (!waiting) return null
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm">
      <RefreshCw className="h-4 w-4 text-neon-blue" />
      <span className="flex-1">Yangi versiya mavjud. Yangilash uchun sahifani qayta yuklang.</span>
      <button className="btn-primary !py-1.5 text-xs" onClick={() => { waiting.postMessage({ type: 'SKIP_WAITING' }); window.location.reload() }}>Yangilash</button>
      <button className="btn-ghost !p-1.5" onClick={() => setWaiting(null)} aria-label="Yopish"><X className="h-4 w-4" /></button>
    </div>
  )
}

export function PlatformHint() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => setIsMobile(/android|iphone|ipad/i.test(navigator.userAgent)), [])
  return <span className="inline-flex items-center gap-1 text-xs text-slate-400">{isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}{isMobile ? 'Android/iOS o‘rnatish' : 'Desktop o‘rnatish'}</span>
}
