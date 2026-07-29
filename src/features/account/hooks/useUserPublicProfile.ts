import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { UserProfile } from '@/types/user'

interface ProfileSnapshot {
  uid: string
  profile: UserProfile | null
}

/** Any signed-in user's public profile (name/photo/verification) — used to
 *  render other people, e.g. an agency's team roster. */
export function useUserPublicProfile(uid: string | undefined) {
  const [snapshot, setSnapshot] = useState<ProfileSnapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      setSnapshot({ uid, profile: snap.exists() ? (snap.data() as UserProfile) : null })
    })
  }, [uid])

  const profile = uid && snapshot?.uid === uid ? snapshot.profile : null
  const loading = !!uid && snapshot?.uid !== uid

  return { profile, loading }
}
