import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
  // Bumped by refreshFirebaseUser() so the memoized context value below is
  // recomputed — auth.currentUser.reload() mutates the same User instance
  // in place, so consumers wouldn't otherwise see fields like emailVerified
  // change (no new object reference to trigger a re-render).
  const [refreshTick, setRefreshTick] = useState(0)

  const refreshFirebaseUser = useCallback(async () => {
    await auth.currentUser?.reload()
    setFirebaseUser(auth.currentUser)
    setRefreshTick((tick) => tick + 1)
  }, [])

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
      refreshFirebaseUser,
    }),
    // refreshTick isn't read in the body above, but it must stay a dependency:
    // refreshFirebaseUser() re-sets firebaseUser to the *same* object reference
    // (reload() mutates in place), so without refreshTick this memo would never
    // recompute and consumers would never see the refreshed emailVerified, etc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebaseUser, profile, authResolved, profileResolved, refreshFirebaseUser, refreshTick]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
