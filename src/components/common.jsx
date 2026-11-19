import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, BookOpen, Clock } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[.2em] text-neon-blue">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SectionTitle({ children, icon: Icon }) {
  return <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">{Icon && <Icon className="h-5 w-5 text-neon-purple" />}{children}</h2>
}

export function EmptyState({ icon: Icon = BookOpen, title, text, action }) {
  return (
    <div className="glass p-10 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5"><Icon className="h-7 w-7 text-slate-400" /></div>
      <h3 className="font-semibold">{title}</h3>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{text}</p>}
      {action}
    </div>
  )
}

export function Pill({ children, tone = 'purple' }) {
  const tones = {
    purple: 'bg-neon-purple/15 text-neon-purple border-neon-purple/30',
    blue: 'bg-neon-blue/15 text-neon-blue border-neon-blue/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    slate: 'bg-white/5 text-slate-300 border-white/10',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)} className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-medium transition ${active === tab.id ? 'border-neon-purple/50 bg-neon-purple/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Quiz({ questions, onComplete, title = 'Bilimni tekshirish' }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const score = questions.reduce((n, q) => n + (answers[q.id] === q.answerKey ? 1 : 0), 0)
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0

  const submit = () => {
    setSubmitted(true)
    onComplete?.({ score, total: questions.length, percent, answers })
  }

  return (
    <div className="glass p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <span className="text-sm text-slate-400">{questions.length} savol</span>
      </div>
      <div className="space-y-6">
        {questions.map((question, qi) => (
          <div key={question.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 font-medium"><span className="mr-2 text-neon-blue">{qi + 1}.</span>{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const chosen = answers[question.id] === option.key
                const correct = option.key === question.options[question.answerKey]?.key
                const cls = submitted
                  ? correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : chosen ? 'border-rose-500/50 bg-rose-500/10 text-rose-200' : 'border-white/10 bg-white/5 text-slate-400'
                  : chosen ? 'border-neon-purple/60 bg-neon-purple/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
                return (
                  <button key={option.key} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [question.id]: option.key }))} className={`flex w-full items-start gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${cls}`}>
                    <span className="mt-0.5 font-bold">{option.key}</span>
                    <span>{option.text}</span>
                  </button>
                )
              })}
            </div>
            {submitted && <p className="mt-3 flex items-start gap-2 text-xs text-slate-400">{correctIcon(answers[question.id] === question.options[question.answerKey]?.key)}<span>{question.explanation}</span></p>}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button className="btn-primary mt-6 w-full sm:w-auto" disabled={Object.keys(answers).length < questions.length} onClick={submit}>Natijani tekshirish</button>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className={`rounded-2xl px-5 py-3 font-display text-lg font-bold ${percent >= 70 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
            {score}/{questions.length} · {percent}%
          </div>
          <button className="btn-ghost" onClick={() => { setAnswers({}); setSubmitted(false) }}><RotateCcw className="h-4 w-4" /> Qayta ishlash</button>
        </div>
      )}
    </div>
  )
}

const correctIcon = (ok) => ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

export function LessonCard({ lesson, to, progress, index }) {
  return (
    <LinkCard to={to}>
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/20 font-display font-bold text-neon-blue">{index ?? <BookOpen className="h-5 w-5" />}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{lesson.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{lesson.concept || lesson.focus || lesson.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone="slate"><Clock className="mr-1 h-3 w-3" />{Math.round((lesson.durationSeconds || 0) / 60)} daq</Pill>
            {lesson.video?.status === 'completed' || lesson.video?.url ? <Pill tone="green">Video tayyor</Pill> : <Pill tone="amber">Video tayyorlanmoqda</Pill>}
            {progress?.completed && <Pill tone="blue"><CheckCircle2 className="mr-1 h-3 w-3" />Tugatilgan</Pill>}
          </div>
        </div>
        <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-slate-500" />
      </div>
    </LinkCard>
  )
}

function LinkCard({ to, children }) {
  return <Link to={to} className="glass block p-5 transition hover:border-neon-purple/40 hover:shadow-glow">{children}</Link>
}
