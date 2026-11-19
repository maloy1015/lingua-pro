import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, runTransaction, increment, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { userRef } from './userService'

export const progressRef = (uid) => collection(db, 'users', uid, 'progress')
export const attemptsRef = (uid) => collection(db, 'users', uid, 'attempts')

const dayKey = () => new Date().toISOString().slice(0, 10)

export async function getProgress(uid) {
  const snap = await getDoc(doc(db, 'users', uid, 'stats', 'summary'))
  return snap.exists() ? snap.data() : { completedLessons: 0, points: 0, streak: 0 }
}

export async function saveLessonProgress(uid, lessonId, { completed = false, score = null, position = 0, duration = 0 } = {}) {
  const ref = doc(db, 'users', uid, 'progress', lessonId)
  const existing = await getDoc(ref)
  const prev = existing.exists() ? existing.data() : {}
  await setDoc(ref, {
    lessonId,
    completed: completed || prev.completed || false,
    score: score ?? prev.score ?? null,
    lastPosition: position || prev.lastPosition || 0,
    duration: duration || prev.duration || 0,
    attempts: (prev.attempts || 0) + (score != null ? 1 : 0),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  if (completed && !prev.completed) {
    await runTransaction(db, async (tx) => {
      const user = await tx.get(userRef(uid))
      if (!user.exists()) return
      const data = user.data()
      const today = dayKey()
      const last = data.lastStudyDate || ''
      const streak = last === today ? (data.streak || 0) : last === new Date(Date.now() - 86400000).toISOString().slice(0, 10) ? (data.streak || 0) + 1 : 1
      tx.update(userRef(uid), {
        completedLessons: increment(1),
        points: increment(10 + (score || 0)),
        streak,
        lastStudyDate: today,
      })
      const statsRef = doc(db, 'users', uid, 'stats', 'summary')
      const stats = await tx.get(statsRef)
      if (stats.exists()) tx.update(statsRef, { completedLessons: increment(1), points: increment(10 + (score || 0)), streak, lastStudyDate: today })
      else tx.set(statsRef, { completedLessons: 1, points: 10 + (score || 0), streak, lastStudyDate: today })
    })
  }
  return { completed: completed || prev.completed || false }
}

export async function saveAttempt(uid, payload) {
  const ref = doc(collection(db, 'users', uid, 'attempts'))
  await setDoc(ref, { ...payload, id: ref.id, createdAt: serverTimestamp() })
  return ref.id
}

export async function getAttempts(uid, type) {
  const q = query(attemptsRef(uid), ...(type ? [where('type', '==', type)] : []), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
