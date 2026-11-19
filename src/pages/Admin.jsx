import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { ENGLISH_LEVELS, MATH_LEVELS, VOICES } from '../data/catalog'
import { ENGLISH_SEEDS, MATH_SEEDS } from '../data/lessonSeeds'
import { allJobsQuery, queueVideo, queueVideos, retryJob, cancelJob, clearCompletedJobs } from '../services/videoJobService'
import { seedCatalog, saveCourseDoc, saveLessonDoc, deleteLessonDoc, setPublished, getCourseDocs, localLessonList } from '../services/courseService'
import { getProgress } from '../services/progressService'
import { sendBroadcast } from '../services/notificationService'
import { PageHeader, Pill, Tabs, EmptyState } from '../components/common'
import { Alert, Spinner } from '../components/ui'

const statusTone = { pending: 'amber', processing: 'blue', completed: 'green', failed: 'red', queued: 'amber', 'not-generated': 'slate' }

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const { data: lessons, loading: lessonsLoading } = useCollection(collection(db, 'lessons'), [])
  const { data: jobs } = useCollection(allJobsQuery(), [])
  const { data: courses } = useCollection(collection(db, 'courses'), [])
  const { data: users } = useCollection(query(collection(db, 'users'), orderBy('createdAt', 'desc')), [])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const counts = useMemo(() => ({
    lessons: lessons.length,
    videos: lessons.filter((l) => l.video?.url).length,
    pending: jobs.filter((j) => j.status === 'pending' || j.status === 'queued').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
    students: users.filter((u) => u.role !== 'admin').length,
  }), [lessons, jobs, users])

  return (
    <div className="animate-fadeUp space-y-5">
      <PageHeader eyebrow="Administration" title="Admin boshqaruv paneli" description="Kurslar, darslar, video ishlab chiqarish, o‘quvchilar, imtihonlar va bildirishnomalar." >
        <Pill tone="purple">Admin · {user?.email}</Pill>
      </PageHeader>
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'Umumiy' },
        { id: 'courses', label: 'Kurslar' },
        { id: 'lessons', label: 'Darslar' },
        { id: 'video', label: 'Video zavodi' },
        { id: 'students', label: 'O‘quvchilar' },
        { id: 'exams', label: 'Imtihonlar' },
        { id: 'subtitles', label: 'Subtitrlar' },
        { id: 'notify', label: 'Bildirishnoma' },
      ]} />
      <Alert type={msg.includes('✔') || msg.includes('navbat') ? 'success' : 'error'}>{msg}</Alert>

      {tab === 'overview' && <Overview counts={counts} lessons={lessons} jobs={jobs} onSeed={async () => { setBusy(true); try { const r = await seedCatalog(); setMsg(`Katalog yuklandi: ${r.courses} kurs, ${r.lessons} dars ✔`) } catch (e) { setMsg(e.message) } finally { setBusy(false) } }} busy={busy} />}
      {tab === 'courses' && <CoursesTab courses={courses} onSave={async (c) => { try { await saveCourseDoc(c); setMsg('Kurs saqlandi ✔') } catch (e) { setMsg(e.message) } }} />}
      {tab === 'lessons' && <LessonsTab lessons={lessons} loading={lessonsLoading} setMsg={setMsg} />}
      {tab === 'video' && <VideoTab lessons={lessons} jobs={jobs} setMsg={setMsg} />}
      {tab === 'students' && <StudentsTab users={users} />}
      {tab === 'exams' && <ExamsTab setMsg={setMsg} />}
      {tab === 'subtitles' && <SubtitlesTab lessons={lessons} setMsg={setMsg} />}
      {tab === 'notify' && <NotifyTab setMsg={setMsg} />}
    </div>
  )
}

function Overview({ counts, lessons, jobs, onSeed, busy }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Darslar', counts.lessons], ['Tayyor videolar', counts.videos], ['O‘quvchilar', counts.students], ['Navbatdagi ishlar', counts.pending]].map(([label, value]) => (
          <div key={label} className="glass p-5"><p className="font-display text-3xl font-bold gradient-text">{value}</p><p className="mt-1 text-sm text-slate-400">{label}</p></div>
        ))}
      </div>
      <div className="glass p-6">
        <h3 className="font-display text-lg font-bold">Ishlab chiqarish holati</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[['Pending', counts.pending, 'amber'], ['Processing', counts.processing, 'blue'], ['Failed', counts.failed, 'red']].map(([label, value, tone]) => <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 p-4"><span>{label}</span><Pill tone={tone}>{value}</Pill></div>)}
        </div>
        <button onClick={onSeed} disabled={busy} className="btn-primary mt-5">{busy ? <Spinner className="h-4 w-4" /> : null} Katalogni Firestore’ga yuklash (330 dars)</button>
        <p className="mt-2 text-xs text-slate-500">Bu amal barcha kurs va dars metadata hujjatlarini yaratadi. Faqat bir marta bajarish kifoya.</p>
      </div>
      <div className="glass p-6"><h3 className="mb-3 font-semibold">Oxirgi videolar</h3>{lessons.filter((l) => l.video?.url).slice(0, 5).map((l) => <p key={l.id} className="rounded-xl bg-white/5 p-3 text-sm">{l.title}</p>)}{!lessons.some((l) => l.video?.url) && <p className="text-sm text-slate-400">Hali tayyor video yo‘q. Video zavodi bo‘limida navbat yarating.</p>}</div>
    </div>
  )
}

function CoursesTab({ courses, onSave }) {
  const [form, setForm] = useState({ id: '', title: '', subject: 'english', level: 'starter', description: '' })
  return (
    <div className="space-y-5">
      <div className="glass space-y-3 p-6">
        <h3 className="font-display text-lg font-bold">Kurs yaratish / tahrirlash</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="field" placeholder="ID (masalan: english-my-course)" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          <input className="field" placeholder="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="english">English</option><option value="math">Math</option></select>
          <input className="field" placeholder="Daraja (starter, a1, ...)" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <input className="field sm:col-span-2" placeholder="Tavsif" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn-primary" disabled={!form.id || !form.title} onClick={async () => { await onSave({ ...form, published: true, order: 200 }); setForm({ id: '', title: '', subject: 'english', level: 'starter', description: '' }) }}>Saqlash</button>
      </div>
      <div className="glass p-6"><h3 className="mb-3 font-semibold">Mavjud kurslar ({courses.length})</h3><div className="space-y-2">{courses.map((c) => <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 p-3 text-sm"><Pill tone="blue">{c.subject}</Pill><span className="flex-1 font-medium">{c.title}</span><span className="text-slate-500">{c.id}</span></div>)}</div></div>
    </div>
  )
}

function LessonsTab({ lessons, loading, setMsg }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const filtered = lessons.filter((l) => (l.title || '').toLowerCase().includes(search.toLowerCase())).slice(0, 60)
  return (
    <div className="space-y-4">
      <input className="field" placeholder="Dars qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading && <Spinner className="h-5 w-5 text-neon-purple" />}
      {filtered.map((l) => (
        <div key={l.id} className="glass p-5">
          <div className="flex flex-wrap items-center gap-3"><Pill tone="slate">{l.subject}</Pill><Pill tone="blue">{l.level}</Pill><span className="flex-1 font-semibold">{l.title}</span><Pill tone={statusTone[l.video?.status] || 'slate'}>{l.video?.status || 'not-generated'}</Pill></div>
          {editing === l.id && (
            <div className="mt-4 space-y-3">
              <textarea rows={4} className="field" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="flex gap-2"><button className="btn-primary !py-2 text-sm" onClick={async () => {
                try {
                  const overrides = { ...(l.overrides || {}), quiz: JSON.parse(draft) }
                  await saveLessonDoc(l.id, { overrides }); setEditing(null); setMsg('Test saqlandi ✔')
                } catch (e) { setMsg('JSON xato: ' + e.message) }
              }}>Testni saqlash</button><button className="btn-ghost !py-2 text-sm" onClick={() => setEditing(null)}>Bekor qilish</button></div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-ghost !py-2 text-sm" onClick={() => { setEditing(l.id); setDraft(JSON.stringify(l.overrides?.quiz || [], null, 2)) }}>Test tahrirlash</button>
            <button className="btn-ghost !py-2 text-sm" onClick={async () => { await setPublished(l.id, !l.published); setMsg('Nashr holati o‘zgartirildi ✔') }}>{l.published ? 'Nashrdan olish' : 'Nashr qilish'}</button>
            <button className="btn-ghost !py-2 text-sm text-rose-300" onClick={async () => { await deleteLessonDoc(l.id); setMsg('Dars o‘chirildi') }}>O‘chirish</button>
          </div>
        </div>
      ))}
      {!loading && !filtered.length && <EmptyState title="Darslar topilmadi" text="Avval katalogni Firestore’ga yuklang." />}
    </div>
  )
}

function VideoTab({ lessons, jobs, setMsg }) {
  const [subject, setSubject] = useState('english')
  const [level, setLevel] = useState('starter')
  const [voice, setVoice] = useState('en-female')
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const levels = subject === 'english' ? ENGLISH_LEVELS : MATH_LEVELS
  const pool = lessons.filter((l) => l.subject === subject && l.level === level)

  const queueBulk = async () => {
    setBusy(true)
    try {
      const local = localLessonList(subject, level)
      const res = await queueVideos(local, voice, 'admin')
      setMsg(`${res.filter((r) => r.ok).length} ta dars video navbatiga qo‘shildi ✔`)
    } catch (e) { setMsg(e.message) }
    finally { setBusy(false) }
  }

  const queueOne = async () => {
    const lesson = lessons.find((l) => l.id === selected)
    if (!lesson) return
    setBusy(true)
    try {
      const local = localLessonList(lesson.subject, lesson.level).find((l) => l.id === lesson.id)
      await queueVideo(local || lesson, voice, 'admin')
      setMsg('Video navbatiga qo‘shildi ✔')
    } catch (e) { setMsg(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <div className="glass space-y-4 p-6">
        <h3 className="font-display text-lg font-bold">Ommaviy video yaratish</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <select className="field" value={subject} onChange={(e) => { setSubject(e.target.value); setLevel(e.target.value === 'english' ? 'starter' : 'math-zero') }}><option value="english">English</option><option value="math">Mathematics</option></select>
          <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>{levels.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
          <select className="field" value={voice} onChange={(e) => setVoice(e.target.value)}>{VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}</select>
          <button onClick={queueBulk} disabled={busy} className="btn-primary">{busy ? <Spinner className="h-4 w-4" /> : '30 darsni navbatga qo‘shish'}</button>
        </div>
        <p className="text-xs text-slate-500">Tanlangan bosqichdagi barcha darslar alohida MP4 video sifatida yaratiladi. Video Cloud Function tomonidan Firestore navbatidan olinadi.</p>
        <div className="flex flex-wrap gap-2">
          <select className="field max-w-xs" value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Bitta dars tanlash...</option>{pool.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
          <button onClick={queueOne} disabled={!selected || busy} className="btn-ghost">Bitta video yaratish</button>
        </div>
      </div>
      <div className="glass p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3"><h3 className="flex-1 font-display text-lg font-bold">Ishlar navbati ({jobs.length})</h3><button className="btn-ghost !py-2 text-sm" onClick={async () => { const n = await clearCompletedJobs(jobs); setMsg(`${n} ta bajarilgan ish tozalandi`) }}>Bajarilganlarni tozalash</button></div>
        {jobs.length ? <div className="space-y-2">{jobs.map((j) => (
          <div key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm">
            <span className="flex-1">{j.title || j.lessonId}</span>
            <Pill tone="slate">{VOICES.find((v) => v.id === j.voice)?.label || j.voice}</Pill>
            <Pill tone={statusTone[j.status] || 'slate'}>{j.status}</Pill>
            <span className="text-xs text-slate-500">{j.phase}</span>
            {j.attempts > 0 && <span className="text-xs text-slate-500">urinish: {j.attempts}</span>}
            {j.status === 'failed' && <button className="btn-ghost !py-1 text-xs" onClick={() => retryJob(j)}>Qayta urinish</button>}
            <button className="btn-ghost !p-1.5 text-xs" onClick={() => cancelJob(j)} aria-label="Bekor qilish">×</button>
            {j.error && <p className="w-full text-xs text-rose-400">{j.error}</p>}
          </div>
        ))}</div> : <EmptyState title="Navbat bo‘sh" text="Video yaratish uchun yuqoridan kurs va bosqich tanlang." />}
      </div>
    </div>
  )
}

function StudentsTab({ users }) {
  const [detail, setDetail] = useState(null)
  const students = users.filter((u) => u.role !== 'admin')
  return (
    <div className="glass p-6">
      <h3 className="mb-4 font-display text-lg font-bold">O‘quvchilar ({students.length})</h3>
      <div className="space-y-2">{students.map((u) => (
        <div key={u.id} className="rounded-xl bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue font-bold">{(u.displayName || '?')[0]?.toUpperCase()}</div><span className="flex-1 font-medium">{u.displayName || u.email}</span><span className="text-slate-500">{u.email}</span><Pill tone="blue">{u.level || 'starter'}</Pill><button className="btn-ghost !py-1 text-xs" onClick={async () => setDetail({ uid: u.id, ...(await getProgress(u.id)), completed: u.completedLessons, points: u.points, streak: u.streak })}>Progress</button></div>
          {detail?.uid === u.id && <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">{['completed', 'points', 'streak'].map((k) => <div key={k} className="rounded-xl bg-navy-900 p-3"><p className="font-bold text-neon-blue">{detail[k] ?? 0}</p><p className="text-xs text-slate-500">{k}</p></div>)}</div>}
        </div>
      ))}{!students.length && <p className="text-sm text-slate-400">Hali o‘quvchi yo‘q.</p>}</div>
    </div>
  )
}

function ExamsTab({ setMsg }) {
  const [form, setForm] = useState({ id: '', title: '', passage: '', questions: '[]' })
  return (
    <div className="space-y-5">
      <div className="glass space-y-3 p-6">
        <h3 className="font-display text-lg font-bold">Yangi imtihon/topshiriq yaratish</h3>
        <input className="field" placeholder="ID" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
        <input className="field" placeholder="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="field" rows={3} placeholder="Matn (ixtiyoriy)" value={form.passage} onChange={(e) => setForm({ ...form, passage: e.target.value })} />
        <textarea className="field" rows={6} placeholder='Savollar JSON: [{"id":"q1","question":"...","options":["A","B"],"answer":"A","explanation":"..."}]' value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} />
        <button className="btn-primary" onClick={async () => {
          try {
            const { setDoc, doc, serverTimestamp } = await import('firebase/firestore')
            const questions = JSON.parse(form.questions)
            await setDoc(doc(db, 'tests', form.id), { ...form, questions, createdAt: serverTimestamp(), published: true })
            setMsg('Imtihon saqlandi ✔'); setForm({ id: '', title: '', passage: '', questions: '[]' })
          } catch (e) { setMsg(e.message) }
        }}>Saqlash</button>
      </div>
      <ExamList />
    </div>
  )
}

function ExamList() {
  const { data } = useCollection(collection(db, 'tests'), [])
  return <div className="glass p-6"><h3 className="mb-3 font-semibold">Saqlangan imtihonlar ({data.length})</h3><div className="space-y-2">{data.map((t) => <div key={t.id} className="rounded-xl bg-white/5 p-3 text-sm">{t.title} · {(t.questions || []).length} savol</div>)}{!data.length && <p className="text-sm text-slate-400">Hali maxsus imtihon yo‘q.</p>}</div></div>
}

function SubtitlesTab({ lessons, setMsg }) {
  const [id, setId] = useState('')
  const [vtt, setVtt] = useState('')
  return (
    <div className="glass space-y-4 p-6">
      <h3 className="font-display text-lg font-bold">Subtitrlarni tahrirlash</h3>
      <select className="field" value={id} onChange={async (e) => { setId(e.target.value); const l = lessons.find((x) => x.id === e.target.value); setVtt(l?.overrides?.vtt || '') }}><option value="">Dars tanlash...</option>{lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
      <textarea className="field font-mono text-xs" rows={12} value={vtt} onChange={(e) => setVtt(e.target.value)} placeholder="WEBVTT formatida subtitrlar..." />
      <button className="btn-primary" disabled={!id} onClick={async () => { try { const l = lessons.find((x) => x.id === id); await saveLessonDoc(id, { overrides: { ...(l?.overrides || {}), vtt } }); setMsg('Subtitrlar saqlandi ✔') } catch (e) { setMsg(e.message) } }}>Saqlash</button>
      <p className="text-xs text-slate-500">Eslatma: video yaratilganda subtitrlar MP4 ichiga muhrlanadi. Ushbu tahrir navbatdagi generatsiyada ishlatiladi.</p>
    </div>
  )
}

function NotifyTab({ setMsg }) {
  const [form, setForm] = useState({ title: '', body: '', type: 'announcement', url: '/dashboard' })
  const [busy, setBusy] = useState(false)
  return (
    <div className="glass space-y-4 p-6">
      <h3 className="font-display text-lg font-bold">Barcha foydalanuvchilarga push yuborish</h3>
      <input className="field" placeholder="Sarlavha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="field" rows={3} placeholder="Xabar matni" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['lesson', 'course', 'reminder', 'exam', 'achievement', 'announcement'].map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <input className="field" placeholder="Yo‘nalish (masalan: /english)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </div>
      <button className="btn-primary" disabled={!form.title || !form.body || busy} onClick={async () => {
        setBusy(true)
        try { const r = await sendBroadcast(form); setMsg(`Yuborildi: ${r.data?.sent ?? 0} ta qurilma ✔`) }
        catch (e) { setMsg(e.message || 'Cloud Function sozlanmagan') }
        finally { setBusy(false) }
      }}>{busy ? <Spinner className="h-4 w-4" /> : 'Yuborish'}</button>
      <p className="text-xs text-slate-500">Cloud Function `sendNotification` deploy qilingan bo‘lishi kerak. FCM tokenlari `users/{uid}/fcmTokens` da saqlanadi.</p>
    </div>
  )
}
