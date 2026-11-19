import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import admin from 'firebase-admin'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import os from 'node:os'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { synthesise } from './lib/tts.mjs'
import { renderSlides } from './lib/slides.mjs'
import { alignScript, toSrt, toVtt } from './lib/subtitles.mjs'
import { renderVideo, probeDuration } from './lib/ffmpeg.mjs'
import { uploadFile, uploadBuffer } from './lib/storage.mjs'

admin.initializeApp()
const db = getFirestore()

const safe = (s) => String(s || '').replace(/[^a-zA-Z0-9_-]/g, '-')

export const processVideoJob = onDocumentWritten({
  document: 'videoJobs/{jobId}',
  region: 'us-central1',
  timeoutSeconds: 540,
  memory: '2GiB',
}, async (event) => {
  const after = event.data?.after
  if (!after?.exists) return
  const job = after.data()
  const jobId = event.params.jobId
  if (job.status !== 'pending') return

  const jobRef = db.doc(`videoJobs/${jobId}`)
  const lessonId = job.lessonId
  const lessonRef = lessonId ? db.doc(`lessons/${lessonId}`) : null

  // guard: claim processing
  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(jobRef)
    if (!snap.exists || snap.data().status !== 'pending') return false
    tx.update(jobRef, { status: 'processing', phase: 'starting', startedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), error: '' })
    if (lessonRef) tx.set(lessonRef, { video: { status: 'processing', url: '', voice: job.voice || 'en-female' }, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    return true
  })
  if (!claimed) return

  const workDir = path.join(os.tmpdir(), 'lingua-pro', jobId)
  try {
    await fs.mkdir(workDir, { recursive: true })
    const script = Array.isArray(job.script) && job.script.length ? job.script : []
    const slides = Array.isArray(job.slides) && job.slides.length ? job.slides : script.map((s, i) => ({ title: job.title || `Slide ${i + 1}`, bullets: [s.text] }))
    if (!script.length) throw new Error('Dars skripti topilmadi.')

    await jobRef.update({ phase: 'tts', updatedAt: FieldValue.serverTimestamp() })
    const { audio, timepoints, contentType } = await synthesise({ script, voiceId: job.voice || 'en-female' })
    const audioExt = contentType === 'audio/mpeg' ? 'mp3' : 'wav'
    const audioPath = path.join(workDir, `narration.${audioExt}`)
    await fs.writeFile(audioPath, audio)
    const audioDuration = await probeDuration(audioPath).catch(() => 0)

    const segments = alignScript(script, timepoints, audioDuration)
    const segSlides = segments.map((_, i) => slides[Math.min(i, slides.length - 1)] || slides[slides.length - 1])

    await jobRef.update({ phase: 'slides', updatedAt: FieldValue.serverTimestamp() })
    const slideFiles = await renderSlides(segSlides, workDir, job.subject || 'english')

    await jobRef.update({ phase: 'subtitles', updatedAt: FieldValue.serverTimestamp() })
    const srt = toSrt(segments)
    const vtt = toVtt(segments)
    const srtPath = path.join(workDir, 'subtitles.srt')
    const vttPath = path.join(workDir, 'subtitles.vtt')
    await fs.writeFile(srtPath, srt, 'utf8')
    await fs.writeFile(vttPath, vtt, 'utf8')

    await jobRef.update({ phase: 'render', updatedAt: FieldValue.serverTimestamp() })
    const outPath = path.join(workDir, 'lesson.mp4')
    await renderVideo({ slideFiles, segments, audioPath, srtPath, outPath, workDir })

    await jobRef.update({ phase: 'upload', updatedAt: FieldValue.serverTimestamp() })
    const base = `videos/${safe(job.subject || 'general')}/${safe(job.level || 'all')}/${safe(lessonId || jobId)}/${safe(job.voice || 'en-female')}`
    const [videoUrl, audioUrl, subtitleUrl, vttUrl] = await Promise.all([
      uploadFile(outPath, `${base}/lesson.mp4`, 'video/mp4'),
      uploadFile(audioPath, `${base}/narration.${audioExt}`, contentType),
      uploadBuffer(Buffer.from(srt, 'utf8'), `${base}/subtitles.srt`, 'application/x-subrip'),
      uploadBuffer(Buffer.from(vtt, 'utf8'), `${base}/subtitles.vtt`, 'text/vtt'),
    ])

    const video = {
      status: 'completed',
      url: videoUrl,
      audioUrl,
      subtitleUrl,
      vttUrl,
      voice: job.voice || 'en-female',
      durationSeconds: Math.round(audioDuration || segments[segments.length - 1]?.end || job.estimatedSeconds || 0),
      generatedAt: FieldValue.serverTimestamp(),
    }

    await jobRef.update({ status: 'completed', phase: 'done', video, completedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), error: '' })
    if (lessonRef) await lessonRef.set({ video, published: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  } catch (err) {
    const message = err?.message || String(err)
    console.error('processVideoJob failed', jobId, err)
    await jobRef.update({ status: 'failed', phase: 'failed', error: message.slice(0, 1000), updatedAt: FieldValue.serverTimestamp() }).catch(() => {})
    if (lessonRef) await lessonRef.set({ video: { status: 'failed', url: '', voice: job.voice || 'en-female', error: message.slice(0, 300) }, updatedAt: FieldValue.serverTimestamp() }, { merge: true }).catch(() => {})
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
})

export const sendNotification = onCall({ region: 'us-central1' }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Login required')
  const caller = await db.doc(`users/${uid}`).get()
  if (!caller.exists || caller.data().role !== 'admin') throw new HttpsError('permission-denied', 'Admin required')

  const { title, body, type = 'announcement', url = '/dashboard', targetUid } = request.data || {}
  if (!title || !body) throw new HttpsError('invalid-argument', 'title and body required')

  let userIds = []
  if (targetUid) userIds = [targetUid]
  else {
    const users = await db.collection('users').select().get()
    userIds = users.docs.map((d) => d.id)
  }

  const batchLimit = 400
  let sent = 0
  const tokens = []
  for (const id of userIds) {
    const noteRef = db.collection(`users/${id}/notifications`).doc()
    await noteRef.set({ title, body, type, url, read: false, createdAt: FieldValue.serverTimestamp() }).catch(() => {})
    const tokSnap = await db.collection(`users/${id}/fcmTokens`).get()
    tokSnap.forEach((t) => { if (t.id) tokens.push(t.id) })
  }
  const messaging = getMessaging()
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500)
    try {
      const res = await messaging.sendEachForMulticast({ tokens: chunk, notification: { title, body }, webpush: { fcmOptions: { link: url }, notification: { icon: '/icon-192.png' } }, data: { type, url } })
      sent += res.successCount
    } catch (e) { console.error('send multicast failed', e) }
  }
  return { ok: true, sent, users: userIds.length }
})

export const dailyReminders = onSchedule({ schedule: 'every day 19:00', timeZone: 'Asia/Tashkent', region: 'us-central1' }, async () => {
  const users = await db.collection('users').get()
  const messaging = getMessaging()
  for (const u of users.docs) {
    const prefs = await db.doc(`users/${u.id}/notificationPrefs/preferences`).get()
    const p = prefs.exists ? prefs.data() : {}
    if (p.dailyReminder === false) continue
    await db.collection(`users/${u.id}/notifications`).add({ title: 'Kunlik o‘quv eslatmasi', body: 'Bugungi 15 daqiqalik darsingizni boshlang!', type: 'reminder', url: '/dashboard', read: false, createdAt: FieldValue.serverTimestamp() }).catch(() => {})
    const toks = await db.collection(`users/${u.id}/fcmTokens`).get()
    const tokens = toks.docs.map((d) => d.id).filter(Boolean)
    if (tokens.length) await messaging.sendEachForMulticast({ tokens, notification: { title: 'Kunlik o‘quv eslatmasi', body: 'Bugungi darsingizni boshlang — Lingua Pro' }, data: { type: 'reminder', url: '/dashboard' } }).catch(() => {})
  }
  return null
})