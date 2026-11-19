import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Play, Pause, Upload, CheckCircle2 } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, storage } from '../firebase/firebase'
import { saveAttempt } from '../services/progressService'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/ui'

export default function SpeakingPractice({ prompts, title = 'Speaking practice', system = 'general' }) {
  const { user } = useAuth()
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState([])
  const [promptIndex, setPromptIndex] = useState(0)
  const recorder = useRef(null)
  const chunks = useRef([])
  const audio = useRef(null)

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'users', user.uid, 'attempts'), orderBy('createdAt', 'desc')))
      .then((snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((a) => a.type === 'speaking')))
      .catch(() => {})
  }, [user])

  const start = async () => {
    setError('')
    setUrl('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks.current = []
      rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' })
        const local = URL.createObjectURL(blob)
        setUrl(local)
        if (!user) return
        setBusy(true)
        try {
          const path = `recordings/${user.uid}/${Date.now()}.webm`
          const fileRef = ref(storage, path)
          await uploadBytes(fileRef, blob, { contentType: blob.type })
          const download = await getDownloadURL(fileRef)
          await saveAttempt(user.uid, { type: 'speaking', system, title, prompt: prompts[promptIndex], audioUrl: download, status: 'saved-for-review' })
          setHistory((h) => [{ id: String(Date.now()), prompt: prompts[promptIndex], audioUrl: download, status: 'saved-for-review' }, ...h])
        } catch (e) { setError(e.message) }
        finally { setBusy(false) }
      }
      rec.start()
      recorder.current = rec
      setRecording(true)
    } catch (e) { setError('Mikrofon ruxsati olinmadi yoki qurilma mavjud emas.') }
  }

  const stop = () => { recorder.current?.stop(); setRecording(false) }

  return (
    <div className="glass p-6">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <div className="mt-4 rounded-2xl border border-neon-purple/20 bg-neon-purple/10 p-4">
        <p className="text-xs uppercase tracking-widest text-neon-purple">Prompt {promptIndex + 1}/{prompts.length}</p>
        <p className="mt-2 font-medium">{prompts[promptIndex]}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((p, i) => <button key={i} onClick={() => { setPromptIndex(i); setUrl('') }} className={`rounded-xl border px-3 py-2 text-sm ${i === promptIndex ? 'border-neon-blue bg-neon-blue/15' : 'border-white/10 bg-white/5 text-slate-400'}`}>{i + 1}</button>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={recording ? stop : start} className={`btn ${recording ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40' : 'btn-primary'}`}>{recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{recording ? 'To‘xtatish' : 'Yozib olish'}</button>
        {url && <audio ref={audio} src={url} controls className="h-10 max-w-full" />}
        {busy && <span className="text-xs text-slate-400">Saqlanmoqda...</span>}
      </div>
      <p className="mt-3 text-xs text-slate-500">Yozuv Firebase Storage’ga saqlanadi va tarixda ko‘rinadi. Avtomatik AI baholash hali joriy etilmagan — javobingiz instructor tomonidan ko‘rib chiqiladi.</p>
      <Alert>{error}</Alert>
      {history.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="mb-3 font-semibold">Yozib olish tarixi</h4>
          <div className="space-y-2">
            {history.slice(0, 10).map((h) => <div key={h.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="flex-1">{h.prompt || h.title}</span>{h.audioUrl && <a href={h.audioUrl} target="_blank" rel="noreferrer" className="text-neon-blue">Tinglash</a>}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}
