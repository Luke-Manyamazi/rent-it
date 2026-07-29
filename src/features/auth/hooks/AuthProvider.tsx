import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import type { UserProfile } from '@/types/user'
import { AuthContext, type AuthContextValue } from '@/features/auth/hooks/auth-context'

interface ProfileSnapshot {
  uid: string
  profile: UserProfile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      setAuthResolved(true)
    })
  }, [])

  useEffect(() => {
    if (!firebaseUser) return
    return onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      setProfileSnapshot({
        uid: firebaseUser.uid,
        profile: snap.exists() ? (snap.data() as UserProfile) : null,
      })
    })
  }, [firebaseUser])

  const profile =
    firebaseUser && profileSnapshot?.uid === firebaseUser.uid ? profileSnapshot.profile : null
  const profileResolved = !firebaseUser || profileSnapshot?.uid === firebaseUser.uid

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading: !authResolved || !profileResolved,
    }),
    [firebaseUser, profile, authResolved, profileResolved]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
