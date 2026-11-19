import { collection, doc, getDocs, writeBatch, serverTimestamp, updateDoc, setDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { ENGLISH_LEVELS, MATH_LEVELS } from '../data/catalog'
import { ENGLISH_SEEDS, MATH_SEEDS } from '../data/lessonSeeds'
import { buildLesson, getLesson } from '../lib/content'

export const coursesRef = collection(db, 'courses')
export const lessonsRef = collection(db, 'lessons')

export const coursesQuery = () => query(coursesRef, orderBy('order', 'asc'))
export const lessonsQuery = (subject, level) => query(lessonsRef, where('subject', '==', subject), where('level', '==', level), orderBy('order', 'asc'))
export const publishedLessonsQuery = () => query(lessonsRef, where('published', '==', true))

const allCourses = () => [
  ...ENGLISH_LEVELS.map((l, i) => ({ id: `english-${l.id}`, subject: 'english', level: l.id, title: `${l.label} English`, description: l.tagline, cefr: l.cefr, order: i, published: true })),
  ...MATH_LEVELS.map((l, i) => ({ id: `math-${l.id}`, subject: 'math', level: l.id, title: l.label, description: l.tagline, order: 100 + i, published: true })),
]

export const localCourses = allCourses()

export function localLessonList(subject, level) {
  const seeds = (subject === 'english' ? ENGLISH_SEEDS : MATH_SEEDS)[level] || []
  return seeds.map((seed, i) => {
    const lesson = buildLesson(subject, level, seed, seeds)
    return { ...lesson, order: i, published: true, video: { status: 'not-generated', url: '', audioUrl: '', subtitleUrl: '', voice: 'en-female' } }
  })
}

export function resolveLesson(docData) {
  if (!docData) return null
  const base = getLesson(docData.subject, docData.level, docData.seedId)
  if (!base) return null
  const overrides = docData.overrides || {}
  const video = docData.video || { status: 'not-generated', url: '', audioUrl: '', subtitleUrl: '', voice: 'en-female' }
  return {
    ...base,
    ...overrides,
    id: docData.id || base.id,
    title: overrides.title || base.title,
    video,
    published: docData.published ?? true,
    order: docData.order ?? 0,
    firestoreId: docData.id,
  }
}

export async function seedCatalog() {
  const batches = []
  let batch = writeBatch(db)
  let count = 0
  const put = (ref, data) => { batch.set(ref, data, { merge: true }); count++; if (count === 400) { batches.push(batch); batch = writeBatch(db); count = 0 } }

  allCourses().forEach((c) => put(doc(db, 'courses', c.id), { ...c, updatedAt: serverTimestamp() }))

  for (const [subject, levels] of [['english', ENGLISH_SEEDS], ['math', MATH_SEEDS]]) {
    for (const [level, seeds] of Object.entries(levels)) {
      seeds.forEach((seed, i) => {
        const lesson = buildLesson(subject, level, seed, seeds)
        put(doc(db, 'lessons', lesson.id), {
          id: lesson.id,
          seedId: seed.id,
          subject,
          level,
          courseId: `${subject}-${level}`,
          title: lesson.title,
          order: i,
          published: true,
          durationSeconds: lesson.durationSeconds,
          video: { status: 'not-generated', url: '', audioUrl: '', subtitleUrl: '', voice: 'en-female' },
          overrides: {},
          updatedAt: serverTimestamp(),
        })
      })
    }
  }
  if (count) batches.push(batch)
  for (const b of batches) await b.commit()
  return { courses: allCourses().length, lessons: 330 }
}

export async function saveLessonDoc(lessonId, patch) {
  await setDoc(doc(db, 'lessons', lessonId), {updatedAt: serverTimestamp(), ...patch}, { merge: true })
}

export async function deleteLessonDoc(lessonId) {
  await deleteDoc(doc(db, 'lessons', lessonId))
}

export async function getLessonDocs() {
  const snap = await getDocs(lessonsRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getCourseDocs() {
  const snap = await getDocs(coursesRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveCourseDoc(course) {
  await setDoc(doc(db, 'courses', course.id || `custom-${Date.now()}`), { ...course, updatedAt: serverTimestamp() }, { merge: true })
}

export async function setPublished(lessonId, published) {
  await updateDoc(doc(db, 'lessons', lessonId), { published, updatedAt: serverTimestamp() })
}

export async function recentLessons(n = 6) {
  const snap = await getDocs(query(lessonsRef, where('published', '==', true), limit(n)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
