import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { TrustScoreEvent } from '@/types/trust-score'

interface EventsSnapshot {
  ownerId: string
  events: TrustScoreEvent[]
}

/** Reads `users/{ownerId}/trustScoreEvents` — the agency variant
 *  (`agencies/{agencyId}/trustScoreEvents`) is added in Phase 7 once the
 *  agency dashboard needs it. Events are only ever written by the Admin SDK
 *  (see firestore.rules), so this list stays empty until Phase 11's booking
 *  auto-cancel logic starts appending to it. */
export function useTrustScoreEvents(ownerId: string | undefined) {
  const [snapshot, setSnapshot] = useState<EventsSnapshot | null>(null)

  useEffect(() => {
    if (!ownerId) return
    const q = query(
      collection(db, 'users', ownerId, 'trustScoreEvents'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        ownerId,
        events: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrustScoreEvent),
      })
    })
  }, [ownerId])

  const events = ownerId && snapshot?.ownerId === ownerId ? snapshot.events : []
  const loading = !!ownerId && snapshot?.ownerId !== ownerId

  return { events, loading }
}
