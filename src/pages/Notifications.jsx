import { useEffect, useState } from 'react'
import { Bell, BellRing, CheckCheck, Trash2, Settings2, Send, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCollection, useDocument } from '../hooks/useFirestore'
import { notificationPrefsRef, notificationsQuery, DEFAULT_PREFS, getNotificationPrefs, saveNotificationPrefs, enableNotifications, markNotificationRead, markAllRead, clearNotifications } from '../services/notificationService'
import { PageHeader, Pill, Tabs, EmptyState } from '../components/common'
import { Alert, Spinner } from '../components/ui'

const TYPE_LABELS = {
  lesson: 'Yangi dars', course: 'Yangi kurs', reminder: 'Kunlik eslatma', exam: 'Yangi imtihon', achievement: 'Yutuq', announcement: 'E’lon',
}

export default function Notifications() {
  const { user } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [foreground, setForeground] = useState([])
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')
  const { data: stored, loading } = useCollection(user ? notificationsQuery(user.uid) : null, [user?.uid])
  const { data: prefsDoc } = useDocument(user ? notificationPrefsRef(user.uid) : null, [user?.uid])

  useEffect(() => { if (prefsDoc) setPrefs({ ...DEFAULT_PREFS, ...prefsDoc }) }, [prefsDoc])
  useEffect(() => { if (user) getNotificationPrefs(user.uid).then(setPrefs).catch(() => {}) }, [user])

  const all = [...foreground, ...stored]
  const unread = all.filter((n) => !n.read)

  const enable = async () => {
    if (!user) return
    setBusy(true); setError(''); setSuccess('')
    try {
      const res = await enableNotifications(user.uid, (n) => setForeground((f) => [n, ...f]))
      setToken(res.token)
      await saveNotificationPrefs(user.uid, { ...prefs, enabled: true })
      setSuccess('Push bildirishnomalar yoqildi ✔')
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  const save = async () => {
    if (!user) return
    setBusy(true)
    try { await saveNotificationPrefs(user.uid, prefs); setSuccess('Sozlamalar saqlandi ✔') }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Notifications" title="Bildirishnomalar" description="Yangi darslar, kurslar, imtihonlar, eslatmalar va yutuqlar haqida xabarnomalar.">
        <Pill tone={unread.length ? 'purple' : 'slate'}>{unread.length} o‘qilmagan</Pill>
      </PageHeader>
      <Tabs tabs={[{ id: 'inbox', label: 'Xabarlar' }, { id: 'settings', label: 'Sozlamalar' }]} active={tab} onChange={setTab} />

      {tab === 'inbox' && (
        <div className="glass p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button className="btn-ghost !py-2 text-sm" onClick={async () => { if (user) await markAllRead(user.uid, stored); setForeground((f) => f.map((n) => ({ ...n, read: true }))) }}><CheckCheck className="h-4 w-4" /> Hammasini o‘qilgan deb belgilash</button>
            <button className="btn-ghost !py-2 text-sm" onClick={async () => { if (user) await clearNotifications(user.uid, stored); setForeground([]) }}><Trash2 className="h-4 w-4" /> Tozalash</button>
          </div>
          {all.length ? (
            <div className="space-y-2">
              {all.map((n, i) => (
                <div key={n.id || i} className={`flex items-start gap-3 rounded-2xl border p-4 ${n.read ? 'border-white/5 bg-white/[0.02]' : 'border-neon-purple/30 bg-neon-purple/10'}`}>
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read ? 'bg-white/5' : 'bg-neon-purple/20'}`}>{n.read ? <Bell className="h-5 w-5" /> : <BellRing className="h-5 w-5 text-neon-purple" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{n.title}</p><Pill tone="slate">{TYPE_LABELS[n.type] || n.type || 'Xabar'}</Pill></div>
                    <p className="mt-1 text-sm text-slate-400">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-500">{n.createdAt?.toDate?.()?.toLocaleString?.() || (typeof n.createdAt === 'string' ? new Date(n.createdAt).toLocaleString() : '')}</p>
                  </div>
                  {!n.read && <button className="btn-ghost !p-2" onClick={async () => { if (!n.foreground && user) await markNotificationRead(user.uid, n.id); setForeground((f) => f.map((x) => x.id === n.id ? { ...x, read: true } : x)) }} aria-label="O‘qildi"><CheckCircle2 className="h-4 w-4" /></button>}
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Bell} title="Xabarlar yo‘q" text="Bildirishnomalar bu yerda paydo bo‘ladi." />}
        </div>
      )}

      {tab === 'settings' && (
        <div className="glass space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={enable} disabled={busy} className="btn-primary">{busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />} Pushni yoqish</button>
            {token && <Pill tone="green"><CheckCircle2 className="mr-1 h-3 w-3" />Qurilma ro‘yxatdan o‘tgan</Pill>}
          </div>
          {!import.meta.env.VITE_FIREBASE_VAPID_KEY && <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">VITE_FIREBASE_VAPID_KEY sozlanmagan. Firebase Console → Cloud Messaging → Web Push certificates dan kalit olib .env ga kiriting.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(DEFAULT_PREFS).filter(([k]) => k !== 'enabled').map(([key, value]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="flex items-center gap-2 text-sm"><Settings2 className="h-4 w-4 text-neon-purple" />{TYPE_LABELS[key] || (key === 'dailyReminder' ? 'Kunlik eslatma' : key === 'reminderTime' ? 'Eslatma vaqti' : key)}</span>
                {typeof value === 'boolean'
                  ? <input type="checkbox" checked={!!prefs[key]} onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))} className="h-5 w-5 accent-neon-purple" />
                  : <input type="time" value={prefs[key] || '19:00'} onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.value }))} className="rounded-lg bg-navy-900 px-2 py-1 text-sm" />}
              </label>
            ))}
          </div>
          <button onClick={save} disabled={busy} className="btn-ghost">Saqlash</button>
          <Alert type={success ? 'success' : 'error'}>{success || error}</Alert>
        </div>
      )}
      {loading && <Spinner className="h-5 w-5 text-neon-purple" />}
    </div>
  )
}
