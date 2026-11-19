import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Calculator, Search, Trophy, PlayCircle } from 'lucide-react'
import { collection, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { ENGLISH_LEVELS, MATH_LEVELS } from '../data/catalog'
import { localLessonList } from '../services/courseService'
import { PageHeader, LessonCard, Pill, EmptyState } from '../components/common'

function useProgressMap() {
  const { user } = useAuth()
  const q = user ? query(collection(db, 'users', user.uid, 'progress')) : null
  const { data } = useCollection(q, [user?.uid])
  return useMemo(() => Object.fromEntries(data.map((p) => [p.lessonId, p])), [data])
}

function LevelTile({ level, subject, done, total }) {
  const to = subject === 'math' ? `/math/${level.id}` : `/english/${level.id}`
  return (
    <Link to={to} className="glass group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-glow">
      <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${level.color} opacity-20 blur-3xl`} />
      <div className="relative flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${level.color}`}>{subject === 'math' ? <Calculator className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}</div>
        <Pill tone="slate">{total} dars</Pill>
      </div>
      <h3 className="relative mt-5 font-display text-lg font-bold">{level.label}</h3>
      <p className="relative mt-1 text-sm text-slate-400">{level.tagline}</p>
      <div className="relative mt-5 flex items-center justify-between text-xs text-slate-400">
        <span>{done} tugatilgan</span>
        <PlayCircle className="h-5 w-5 text-neon-purple transition group-hover:scale-110" />
      </div>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
    </Link>
  )
}

function Hub({ subject }) {
  const levels = subject === 'math' ? MATH_LEVELS : ENGLISH_LEVELS
  const progress = useProgressMap()
  const totalDone = Object.values(progress).filter((p) => p.completed).length
  return (
    <div className="animate-fadeUp">
      <PageHeader eyebrow={subject === 'math' ? 'Mathematics' : 'English'} title={subject === 'math' ? 'Matematika kurslari' : 'Ingliz tili kurslari'} description={subject === 'math' ? 'Noldan boshlab 4 bosqich, 120 ta o‘ziga xos dars, yechimlar va mashqlar.' : 'Starter’dan C2 gacha 7 bosqich, 210 ta o‘ziga xos dars, transkript va testlar.'}>
        <Pill tone="green"><Trophy className="mr-1 h-3 w-3" />{totalDone} dars tugatilgan</Pill>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {levels.map((level) => {
          const lessons = localLessonList(subject, level.id)
          const done = lessons.filter((l) => progress[l.id]?.completed).length
          return <LevelTile key={level.id} level={level} subject={subject} done={done} total={lessons.length} />
        })}
      </div>
    </div>
  )
}

function LevelPage({ subject }) {
  const { level, topic } = useParams()
  const levelId = level || topic
  const progress = useProgressMap()
  const [search, setSearch] = useState('')
  const lessonDocs = useCollection(levelId ? query(collection(db, 'lessons'), where('subject', '==', subject), where('level', '==', levelId)) : null, [subject, levelId])
  const videoMap = useMemo(() => Object.fromEntries(lessonDocs.data.map((d) => [d.id, d.video])), [lessonDocs.data])
  const info = (subject === 'math' ? MATH_LEVELS : ENGLISH_LEVELS).find((l) => l.id === levelId)
  const lessons = useMemo(() => localLessonList(subject, levelId).filter((l) => l.title.toLowerCase().includes(search.toLowerCase())), [subject, levelId, search])
  if (!info) return <EmptyState title="Bosqich topilmadi" text="Kurslar ro‘yxatidan birini tanlang." action={<Link to={subject === 'math' ? '/math' : '/english'} className="btn-primary mt-4">Kurslarga qaytish</Link>} />
  const done = lessons.filter((l) => progress[l.id]?.completed).length
  return (
    <div className="animate-fadeUp">
      <PageHeader eyebrow={subject === 'math' ? 'Mathematics' : 'English'} title={info.label} description={`${info.tagline} · ${lessons.length} dars`}>
        <Pill tone="blue">{done}/{lessons.length} tugatilgan</Pill>
      </PageHeader>
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Dars nomini qidirish..." className="field pl-11" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {lessons.map((lesson, i) => (
          <LessonCard key={lesson.id} lesson={{ ...lesson, video: videoMap[lesson.id] }} index={i + 1} progress={progress[lesson.id]} to={`/${subject}/lesson/${lesson.id}`} />
        ))}
      </div>
      {!lessons.length && <EmptyState title="Hech narsa topilmadi" text="Boshqa so‘z bilan qidiring." />}
    </div>
  )
}

export const EnglishHub = () => <Hub subject="english" />
export const EnglishLevel = () => <LevelPage subject="english" />
export const MathHub = () => <Hub subject="math" />
export const MathLevel = () => <LevelPage subject="math" />
