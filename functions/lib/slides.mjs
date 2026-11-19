import sharp from 'sharp'

const esc = (s) => String(s || '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))

const wrap = (text, max = 52) => {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) { lines.push(line.trim()); line = w } else line += ` ${w}`
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function svg(slide, index, total, subject) {
  const from = subject === 'math' ? '#0ea5e9' : '#8b5cf6'
  const to = subject === 'math' ? '#14b8a6' : '#38bdf8'
  const titleLines = wrap(slide.title, 36).slice(0, 3)
  const bullets = (slide.bullets || []).slice(0, 6).flatMap((b) => wrap(b, 62).slice(0, 3))
  const bulletSvg = bullets.map((b, i) => `<text x="110" y="${380 + i * 56}" fill="#dbeafe" font-family="Arial,sans-serif" font-size="30">▸ ${esc(b)}</text>`).join('')
  const subtitle = slide.subtitle ? `<text x="110" y="330" fill="#7dd3fc" font-family="Arial,sans-serif" font-size="30" letter-spacing="3">${esc(slide.subtitle.toUpperCase())}</text>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050816"/><stop offset="1" stop-color="#10173a"/></linearGradient>
  <linearGradient id="a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <circle cx="1120" cy="90" r="260" fill="${from}" opacity="0.13"/>
  <circle cx="120" cy="680" r="220" fill="${to}" opacity="0.10"/>
  <rect x="80" y="70" width="120" height="8" rx="4" fill="url(#a)"/>
  <text x="110" y="180" fill="#ffffff" font-family="Arial,sans-serif" font-size="58" font-weight="bold">${esc(titleLines[0] || '')}</text>
  ${titleLines.slice(1).map((l, i) => `<text x="110" y="${180 + (i + 1) * 66}" fill="#ffffff" font-family="Arial,sans-serif" font-size="58" font-weight="bold">${esc(l)}</text>`).join('')}
  ${subtitle}
  ${bulletSvg}
  <text x="110" y="660" fill="#94a3b8" font-family="Arial,sans-serif" font-size="22">LINGUA PRO · ${esc(subject || 'lesson').toUpperCase()}</text>
  <text x="1160" y="660" text-anchor="end" fill="#94a3b8" font-family="Arial,sans-serif" font-size="22">${index + 1} / ${total}</text>
</svg>`
}

export async function renderSlides(slides, dir, subject) {
  const files = []
  for (let i = 0; i < slides.length; i++) {
    const file = `${dir}/slide-${String(i).padStart(3, '0')}.png`
    await sharp(Buffer.from(svg(slides[i], i, slides.length, subject))).png().toFile(file)
    files.push(file)
  }
  return files
}
