import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { SavedProperty } from '@/types/property'

interface SavedSnapshot {
  uid: string
  saved: SavedProperty[]
}

/** Property documents don't exist until Phase 9, so this only returns saved
 *  IDs/timestamps for now — joining in full property details is Phase 9/10 work. */
export function useSavedProperties(uid: string | undefined) {
  const [snapshot, setSnapshot] = useState<SavedSnapshot | null>(null)

  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'users', uid, 'savedProperties'),
      orderBy('savedAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({ uid, saved: snap.docs.map((d) => d.data() as SavedProperty) })
    })
  }, [uid])

  const saved = uid && snapshot?.uid === uid ? snapshot.saved : []
  const loading = !!uid && snapshot?.uid !== uid

  return { saved, loading }
}
