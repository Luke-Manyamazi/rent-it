import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { UserPrivateContact } from '@/types/user'

interface ContactSnapshot {
  uid: string
  contact: UserPrivateContact | null
}

export function usePrivateContact(uid: string | undefined) {
  const [snapshot, setSnapshot] = useState<ContactSnapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    return onSnapshot(doc(db, 'users', uid, 'private', 'contact'), (snap) => {
      setSnapshot({ uid, contact: snap.exists() ? (snap.data() as UserPrivateContact) : null })
    })
  }, [uid])

  const contact = uid && snapshot?.uid === uid ? snapshot.contact : null
  const loading = !!uid && snapshot?.uid !== uid

  return { contact, loading }
}
