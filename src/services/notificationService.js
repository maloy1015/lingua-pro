import { doc, collection, setDoc, updateDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore'
import { getToken, onMessage, isSupported } from 'firebase/messaging'
import { db, messaging, vapidKey } from '../firebase/firebase'
import { firebaseConfig } from '../firebase/firebase'

export const notificationPrefsRef = (uid) => doc(db, 'users', uid, 'notificationPrefs', 'preferences')
export const notificationsQuery = (uid) => query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'))

export const DEFAULT_PREFS = {
  newLessons: true,
  newCourses: true,
  dailyReminder: true,
  exams: true,
  achievements: true,
  announcements: true,
  reminderTime: '19:00',
}

export async function getNotificationPrefs(uid) {
  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(notificationPrefsRef(uid))
  return snap.exists() ? { ...DEFAULT_PREFS, ...snap.data() } : DEFAULT_PREFS
}

export async function saveNotificationPrefs(uid, prefs) {
  await setDoc(notificationPrefsRef(uid), { ...prefs, updatedAt: serverTimestamp() }, { merge: true })
}

export async function enableNotifications(uid, onForeground) {
  if (!messaging || !vapidKey) throw new Error('FCM VAPID kaliti sozlanmagan. VITE_FIREBASE_VAPID_KEY ni kiriting.')
  const supported = await isSupported()
  if (!supported) throw new Error('Bu brauzer push bildirishnomalarni qo‘llab-quvvatlamaydi.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Bildirishnoma ruxsati berilmadi.')
  const params = new URLSearchParams(Object.entries(firebaseConfig).filter(([, v]) => v))
  const swReg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`)
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg })
  if (!token) throw new Error('Token olinmadi.')
  await setDoc(doc(db, 'users', uid, 'fcmTokens', token), { token, createdAt: serverTimestamp(), platform: 'web' }, { merge: true })
  const unsub = onMessage(messaging, (payload) => {
    onForeground?.({
      id: payload.messageId || `fg-${Date.now()}`,
      title: payload.notification?.title || 'LINGUA PRO',
      body: payload.notification?.body || '',
      type: payload.data?.type || 'announcement',
      read: false,
      createdAt: new Date().toISOString(),
      foreground: true,
    })
  })
  return { token, unsub }
}

export async function disableNotifications(uid, token) {
  if (token) await deleteDoc(doc(db, 'users', uid, 'fcmTokens', token))
  await saveNotificationPrefs(uid, { ...DEFAULT_PREFS, enabled: false })
}

export async function markNotificationRead(uid, id) {
  await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true, readAt: serverTimestamp() })
}

export async function markAllRead(uid, notifications) {
  for (const n of notifications.filter((x) => !x.read)) await markNotificationRead(uid, n.id)
}

export async function clearNotifications(uid, notifications) {
  for (const n of notifications) await deleteDoc(doc(db, 'users', uid, 'notifications', n.id))
}

export async function sendBroadcast({ title, body, type = 'announcement', url = '/dashboard' }) {
  const { httpsCallable } = await import('firebase/functions')
  const { functions } = await import('../firebase/firebase')
  const fn = httpsCallable(functions, 'sendNotification')
  return fn({ title, body, type, url })
}
