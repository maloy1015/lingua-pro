export function toSrt(items) {
  const stamp = (sec) => {
    const ms = Math.max(0, Math.round(sec * 1000))
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
    const milli = String(ms % 1000).padStart(3, '0')
    return `${h}:${m}:${s},${milli}`
  }
  return items.map((it, i) => `${i + 1}\n${stamp(it.start)} --> ${stamp(it.end)}\n${it.text}\n`).join('\n') + '\n'
}

export function toVtt(items) {
  const stamp = (sec) => {
    const ms = Math.max(0, Math.round(sec * 1000))
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
    const milli = String(ms % 1000).padStart(3, '0')
    return `${h}:${m}:${s}.${milli}`
  }
  const body = items.map((it, i) => `${i + 1}\n${stamp(it.start)} --> ${stamp(it.end)}\n${it.text}\n`).join('\n')
  return `WEBVTT\n\n${body}`
}

export function alignScript(script, timepoints = [], audioDuration = 0) {
  const marks = timepoints.filter((t) => /^s\d+$/.test(t.name)).sort((a, b) => Number(a.name.slice(1)) - Number(b.name.slice(1)))
  if (marks.length === script.length) {
    const total = audioDuration || marks[marks.length - 1].seconds + Math.max(2, (script[script.length - 1].text.split(/\s+/).length / 2.6))
    return script.map((seg, i) => {
      const start = Math.max(0, marks[i].seconds)
      const end = i < marks.length - 1 ? Math.max(start + 1.2, marks[i + 1].seconds) : Math.max(start + 1.5, total)
      return { ...seg, start, end }
    })
  }
  // fallback to provided timings scaled to audio duration
  const providedEnd = script[script.length - 1]?.end || audioDuration || 60
  const scale = audioDuration && providedEnd ? audioDuration / providedEnd : 1
  return script.map((seg) => ({ ...seg, start: (seg.start || 0) * scale, end: (seg.end || seg.start + 3) * scale }))
}
