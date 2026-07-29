import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { TrustScoreEvent } from '@/types/trust-score'

interface EventsSnapshot {
  key: string
  events: TrustScoreEvent[]
}

/** Reads `users/{ownerId}/trustScoreEvents` (landlords/tenants) or
 *  `agencies/{ownerId}/trustScoreEvents` (agencies). Events are only ever
 *  written by the Admin SDK (see firestore.rules), so this list stays empty
 *  until Phase 11's booking auto-cancel logic starts appending to it. */
export function useTrustScoreEvents(
  ownerType: 'landlord' | 'agency' | undefined,
  ownerId: string | undefined
) {
  const key = ownerType && ownerId ? `${ownerType}:${ownerId}` : undefined
  const [snapshot, setSnapshot] = useState<EventsSnapshot | null>(null)

  useEffect(() => {
    if (!ownerType || !ownerId || !key) return
    const collectionName = ownerType === 'agency' ? 'agencies' : 'users'
    const q = query(
      collection(db, collectionName, ownerId, 'trustScoreEvents'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key,
        events: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrustScoreEvent),
      })
    })
  }, [ownerType, ownerId, key])

  const events = key && snapshot?.key === key ? snapshot.events : []
  const loading = !!key && snapshot?.key !== key

  return { events, loading }
}
