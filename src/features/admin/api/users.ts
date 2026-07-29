import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { UserProfile, VerificationStatus } from '@/types/user'

export function useAllUsers(rowLimit = 200) {
  const [users, setUsers] = useState<UserProfile[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(rowLimit))
    return onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile))
    })
  }, [rowLimit])

  return { users: users ?? [], loading: users === null }
}

export async function setUserSuspension(uid: string, isSuspended: boolean, reason: string | null) {
  await updateDoc(doc(db, 'users', uid), {
    isSuspended,
    suspensionReason: isSuspended ? reason : null,
    updatedAt: serverTimestamp(),
  })
}

export async function setUserVerificationStatus(uid: string, status: VerificationStatus) {
  await updateDoc(doc(db, 'users', uid), {
    verificationStatus: status,
    updatedAt: serverTimestamp(),
  })
}
