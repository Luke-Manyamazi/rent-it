import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { FraudFlag, FraudFlagStatus } from '@/types/moderation'

export function useFraudFlags() {
  const [flags, setFlags] = useState<FraudFlag[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'fraudFlags'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setFlags(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FraudFlag))
    })
  }, [])

  return { flags: flags ?? [], loading: flags === null }
}

export async function updateFraudFlagStatus(
  flagId: string,
  status: FraudFlagStatus,
  reviewedBy: string
) {
  await updateDoc(doc(db, 'fraudFlags', flagId), {
    status,
    reviewedBy,
    reviewedAt: status === 'open' ? null : serverTimestamp(),
  })
}
