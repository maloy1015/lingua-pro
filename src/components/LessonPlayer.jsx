import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Captions, Gauge, Download, Sparkles, Loader2 } from 'lucide-react'
import { lessonNotes } from '../lib/content'
import { VOICES } from '../data/catalog'

const fmt = (s) => {
  const v = Math.max(0, Math.floor(s || 0))
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`
}

export default function LessonPlayer({ lesson, onProgress, onComplete, voice = 'en-female' }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const [speed, setSpeed] = useState(1)
  const [captions, setCaptions] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(lesson.durationSeconds || 0)
  const [slide, setSlide] = useState(0)
  const vttUrl = useMemo(() => URL.createObjectURL(new Blob([lesson.vtt], { type: 'text/vtt' })), [lesson.vtt])

  useEffect(() => () => URL.revokeObjectURL(vttUrl), [vttUrl])

  const hasVideo = Boolean(lesson.video?.url)

  useEffect(() => {
    setCurrent(0)
    setSlide(0)
    setPlaying(false)
    if (videoRef.current) videoRef.current.currentTime = 0
  }, [lesson.id])

  useEffect(() => {
    if (hasVideo || !playing) return
    if (!('speechSynthesis' in window)) return
    const line = lesson.script[slide]
    if (!line) return
    const utterance = new SpeechSynthesisUtterance(line.text)
    const option = VOICES.find((v) => v.id === voice) || VOICES[0]
    utterance.lang = option.locale
    utterance.rate = speed
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(option.locale.slice(0, 2).toLowerCase()) && (option.gender === 'FEMALE' ? /female|zira|samantha|karen|google uk english female/i.test(v.name) : /male|david|google uk english male/i.test(v.name)))
      || voices.find((v) => v.lang?.toLowerCase().startsWith(option.locale.slice(0, 2).toLowerCase()))
    if (match) utterance.voice = match
    utterance.onend = () => {
      if (slide < lesson.script.length - 1) setSlide((s) => s + 1)
      else { setPlaying(false); onComplete?.() }
    }
    window.speechSynthesis.speak(utterance)
    return () => window.speechSynthesis.cancel()
  }, [slide, playing, hasVideo, voice, speed, lesson.script, onComplete])

  useEffect(() => {
    if (hasVideo || !playing) return
    const line = lesson.script[slide]
    if (line) setCurrent(line.start)
  }, [slide, playing, hasVideo, lesson.script])

  const toggle = () => {
    if (hasVideo) {
      const v = videoRef.current
      if (!v) return
      if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
    } else {
      if (playing) window.speechSynthesis?.cancel()
      setPlaying((p) => !p)
    }
  }

  const seek = (seconds) => {
    if (hasVideo && videoRef.current) {
      videoRef.current.currentTime = seconds
      setCurrent(seconds)
    } else {
      const idx = lesson.script.findIndex((s) => s.start <= seconds)
      setSlide(Math.max(0, idx))
      setCurrent(seconds)
    }
  }

  const onTime = () => {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
    onProgress?.(v.currentTime, v.duration || duration)
    if (v.duration && v.currentTime / v.duration > 0.92) onComplete?.()
  }

  const setRate = (value) => {
    setSpeed(value)
    if (videoRef.current) videoRef.current.playbackRate = value
  }

  const toggleCaptions = () => {
    const next = !captions
    setCaptions(next)
    const track = videoRef.current?.textTracks?.[0]
    if (track) track.mode = next ? 'showing' : 'hidden'
  }

  const fullscreen = () => {
    const el = hasVideo ? videoRef.current : videoRef.current?.parentElement
    el?.requestFullscreen?.()
  }

  const downloadNotes = () => {
    const blob = new Blob([lessonNotes(lesson)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lesson.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeLine = lesson.script.findIndex((s) => current >= s.start && current < s.end)
  const displayedSlide = hasVideo ? Math.max(0, activeLine) : slide

  return (
    <div className="glass overflow-hidden">
      <div className="relative aspect-video w-full bg-black/60">
        {hasVideo ? (
          <video ref={videoRef} className="h-full w-full" src={lesson.video.url} poster="" crossOrigin="anonymous" onTimeUpdate={onTime} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={() => { setPlaying(false); onComplete?.() }} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)}>
            <track kind="subtitles" src={vttUrl} srcLang="en" label="English" default />
          </video>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-6 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300"><Sparkles className="h-3 w-3" /> Namoyish rejimi · video hali yaratilmadi</span>
            <p className="text-xs uppercase tracking-[.2em] text-neon-blue">{lesson.subject} · {lesson.level}</p>
            <h3 key={displayedSlide} className="mt-3 max-w-3xl animate-fadeUp font-display text-xl font-bold sm:text-3xl">{lesson.slides[displayedSlide]?.title}</h3>
            <ul key={`b-${displayedSlide}`} className="mt-4 max-w-2xl animate-fadeUp space-y-2 text-left text-sm text-slate-300">
              {lesson.slides[displayedSlide]?.bullets?.slice(0, 4).map((b, i) => <li key={i} className="flex gap-2"><span className="text-neon-purple">▸</span>{b}</li>)}
            </ul>
            <p className="mt-4 max-w-2xl text-sm text-slate-400">{lesson.script[displayedSlide]?.text}</p>
          </div>
        )}
        {!playing && <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-navy-950/20 transition hover:bg-navy-950/10" aria-label="Play"><span className="grid h-16 w-16 place-items-center rounded-full bg-neon-purple/90 shadow-glow"><Play className="ml-1 h-7 w-7" /></span></button>}
      </div>

      <div className="space-y-3 border-t border-white/10 p-4">
        <input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(current, duration || 1)} onChange={(e) => seek(Number(e.target.value))} className="w-full accent-neon-purple" aria-label="Progress" />
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={toggle} className="btn-ghost !p-2.5" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
          <button onClick={() => { const next = !muted; setMuted(next); if (videoRef.current) videoRef.current.muted = next }} className="btn-ghost !p-2.5" aria-label="Mute">{muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>
          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={(e) => { const v = Number(e.target.value); setVolume(v); setMuted(v === 0); if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0 } }} className="w-20 accent-neon-blue" aria-label="Volume" />
          <span className="text-xs tabular-nums text-slate-400">{fmt(current)} / {fmt(duration)}</span>
          <div className="flex-1" />
          <button onClick={toggleCaptions} className={`btn-ghost !p-2.5 ${captions ? 'text-neon-blue' : ''}`} aria-label="Subtitles"><Captions className="h-5 w-5" /></button>
          <select value={speed} onChange={(e) => setRate(Number(e.target.value))} className="rounded-xl border border-white/10 bg-navy-900 px-2 py-2 text-xs text-slate-300" aria-label="Speed">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => <option key={s} value={s}>{s}×</option>)}
          </select>
          <button onClick={fullscreen} className="btn-ghost !p-2.5" aria-label="Fullscreen"><Maximize className="h-5 w-5" /></button>
          <button onClick={downloadNotes} className="btn-ghost !px-3 !py-2 text-xs"><Download className="h-4 w-4" /> Izohlar</button>
        </div>
        <p className="text-xs text-slate-500"><Gauge className="mr-1 inline h-3 w-3" />{hasVideo ? 'Video Firebase Storage’dan o‘qilmoqda' : 'Slides va brauzer ovozi bilan namoyish. Video yaratilganda avtomatik almashtiriladi.'}</p>
      </div>
    </div>
  )
}

export function PlayerSkeleton() {
  return <div className="glass grid aspect-video place-items-center"><Loader2 className="h-8 w-8 animate-spin text-neon-purple" /></div>
}
