import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { getDoc } from 'firebase/firestore'
import { auth, googleProvider } from '../firebase/firebase'
import { ensureUserDoc, updateUserDoc, userRef } from '../services/userService'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u) => {
    const snap = await getDoc(userRef(u.uid))
    setProfile(snap.exists() ? snap.data() : await ensureUserDoc(u))
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try { await loadProfile(u) } catch (e) { console.error(e); setProfile(null) }
      } else setProfile(null)
      setLoading(false)
    })
  }, [loadProfile])

  const register = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })
    await ensureUserDoc(cred.user, { displayName: name.trim() })
    try { await sendEmailVerification(cred.user) } catch (e) { console.warn(e) }
    await loadProfile(cred.user)
    return cred.user
  }
  const login = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password)
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider)
    await ensureUserDoc(cred.user)
    await loadProfile(cred.user)
    return cred.user
  }
  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim())
  const resendVerification = () => sendEmailVerification(auth.currentUser)
  const logout = () => signOut(auth)

  const saveProfile = async (patch) => {
    await updateUserDoc(user.uid, patch)
    if (patch.displayName) await updateProfile(auth.currentUser, { displayName: patch.displayName })
    await loadProfile(user)
  }

  const value = {
    user, profile, loading,
    isAdmin: profile?.role === 'admin',
    register, login, loginWithGoogle, resetPassword, resendVerification, logout, saveProfile,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
