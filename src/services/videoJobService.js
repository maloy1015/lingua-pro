import { collection, doc, addDoc, getDoc, setDoc, updateDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export const jobsRef = collection(db, 'videoJobs')
export const allJobsQuery = () => query(jobsRef, orderBy('createdAt', 'desc'))

export const JOB_STATUS = ['pending', 'processing', 'completed', 'failed']

export function buildJobPayload(lesson, voice = 'en-female', requestedBy = '') {
  return {
    lessonId: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    level: lesson.level,
    seedId: lesson.seedId,
    voice,
    script: lesson.script.map((s) => ({ text: s.text, start: s.start, end: s.end })),
    slides: lesson.slides.map((s) => ({ title: s.title, subtitle: s.subtitle || '', bullets: s.bullets })),
    subtitles: lesson.vtt,
    estimatedSeconds: lesson.durationSeconds,
    status: 'pending',
    phase: 'queued',
    attempts: 0,
    error: '',
    requestedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export async function queueVideo(lesson, voice, requestedBy) {
  const payload = buildJobPayload(lesson, voice, requestedBy)
  const ref = await addDoc(jobsRef, payload)
  await updateDoc(doc(db, 'lessons', lesson.id), { video: { status: 'queued', url: '', audioUrl: '', subtitleUrl: '', voice }, updatedAt: serverTimestamp() })
  return ref.id
}

export async function queueVideos(lessons, voice, requestedBy) {
  const results = []
  for (const lesson of lessons) {
    try { results.push({ lessonId: lesson.id, jobId: await queueVideo(lesson, voice, requestedBy), ok: true }) }
    catch (error) { results.push({ lessonId: lesson.id, ok: false, error: error.message }) }
  }
  return results
}

export async function retryJob(job) {
  const ref = typeof job === 'string' ? doc(db, 'videoJobs', job) : doc(db, 'videoJobs', job.id)
  const snap = await getDoc(ref)
  const current = snap.exists() ? snap.data() : {}
  await updateDoc(ref, { status: 'pending', phase: 'queued', error: '', attempts: (current.attempts || 0) + 1, updatedAt: serverTimestamp() })
  if (current.lessonId) {
    await setDoc(doc(db, 'lessons', current.lessonId), { video: { status: 'queued', url: '', audioUrl: '', subtitleUrl: '', voice: current.voice }, updatedAt: serverTimestamp() }, { merge: true })
  }
}

export async function cancelJob(job) {
  await deleteDoc(doc(db, 'videoJobs', job.id || job))
}

export async function clearCompletedJobs(jobs) {
  const done = jobs.filter((j) => j.status === 'completed')
  for (const job of done) await deleteDoc(doc(db, 'videoJobs', job.id))
  return done.length
}
