import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'

export function useCollection(query, deps = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    const unsub = onSnapshot(query, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
      setError(null)
    }, (err) => { setError(err); setLoading(false) })
    return unsub
  }, deps)

  return { data, loading, error }
}

export function useDocument(docRef, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!docRef) { setLoading(false); return }
    setLoading(true)
    const unsub = onSnapshot(docRef, (snap) => { setData(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false) }, () => setLoading(false))
    return unsub
  }, deps)
  return { data, loading }
}
