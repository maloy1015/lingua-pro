import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'
import ffprobePkg from 'ffprobe-static'

const ffprobePath = ffprobePkg.path

const run = (bin, args) => new Promise((resolve, reject) => {
  const proc = spawn(bin, args, { windowsHide: true })
  let stderr = ''
  proc.stderr.on('data', (d) => { stderr += d.toString() })
  proc.on('error', reject)
  proc.on('close', (code) => code === 0 ? resolve(stderr) : reject(new Error(`${path.basename(bin)} exited ${code}: ${stderr.slice(-1200)}`)))
})

export async function probeDuration(file) {
  const out = await new Promise((resolve, reject) => {
    const proc = spawn(ffprobePath, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { windowsHide: true })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => { stdout += d.toString() })
    proc.stderr.on('data', (d) => { stderr += d.toString() })
    proc.on('error', reject)
    proc.on('close', (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr)))
  })
  const val = Number(out)
  return Number.isFinite(val) ? val : 0
}

export async function renderVideo({ slideFiles, segments, audioPath, srtPath, outPath, workDir }) {
  if (!slideFiles.length) throw new Error('Slaydlar topilmadi')
  if (slideFiles.length !== segments.length) {
    // align counts
    while (slideFiles.length < segments.length) slideFiles.push(slideFiles[slideFiles.length - 1])
    segments = segments.slice(0, slideFiles.length)
  }
  const listPath = path.join(workDir, 'concat.txt')
  const lines = []
  for (let i = 0; i < slideFiles.length; i++) {
    const dur = Math.max(1.5, (segments[i].end - segments[i].start) || 3)
    const safe = slideFiles[i].replace(/\\/g, '/').replace(/'/g, "'\\''")
    lines.push(`file '${safe}'`)
    lines.push(`duration ${dur.toFixed(3)}`)
  }
  // ffmpeg concat demuxer needs last image repeated without duration sometimes; add last again
  const last = slideFiles[slideFiles.length - 1].replace(/\\/g, '/').replace(/'/g, "'\\''")
  lines.push(`file '${last}'`)
  await fs.writeFile(listPath, lines.join('\n'), 'utf8')

  const args = [
    '-y',
    '-f', 'concat', '-safe', '0', '-i', listPath,
    '-i', audioPath,
    '-vf', "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-shortest',
    '-movflags', '+faststart',
  ]
  if (srtPath) {
    // try to mux subtitles as mov_text if possible? for mp4 web compatibility easier keep separate; but include attempt only if file exists
    // skipping burn-in to avoid libass dependency issues in serverless
  }
  args.push(outPath)
  await run(ffmpegPath, args)
  return outPath
}
