import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export const userRef = (uid) => doc(db, 'users', uid)

export async function ensureUserDoc(user, extra = {}) {
  const ref = userRef(user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()
  const data = {
    uid: user.uid,
    displayName: extra.displayName || user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    role: 'student',
    onboarded: false,
    goals: [],
    level: 'starter',
    dailyGoal: 15,
    points: 0,
    streak: 0,
    completedLessons: 0,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, data)
  return data
}

export async function updateUserDoc(uid, patch) {
  await updateDoc(userRef(uid), patch)
}
