export const wordsPerSecond = 2.6

export function estimateDurations(segments) {
  let cursor = 1.2
  return segments.map((s) => {
    const text = typeof s === 'string' ? s : s.text
    const words = text.trim().split(/\s+/).length
    const seconds = Math.max(2.2, words / wordsPerSecond + 0.8)
    const item = { start: cursor, end: cursor + seconds, text }
    cursor += seconds + 0.45
    return item
  })
}

const stamp = (seconds) => {
  const ms = Math.max(0, Math.round(seconds * 1000))
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  const milli = String(ms % 1000).padStart(3, '0')
  return `${h}:${m}:${s}.${milli}`
}

export function buildVtt(items) {
  const body = items.map((it, i) => `${i + 1}\n${stamp(it.start)} --> ${stamp(it.end)}\n${it.text}\n`).join('\n')
  return `WEBVTT\n\n${body}`
}

export function buildSrt(items) {
  const body = items.map((it, i) => `${i + 1}\n${stamp(it.start).replace('.', ',')} --> ${stamp(it.end).replace('.', ',')}\n${it.text}\n`).join('\n')
  return `${body}\n`
}

export const totalDuration = (items) => (items.length ? items[items.length - 1].end + 1 : 0)
