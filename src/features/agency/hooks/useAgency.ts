import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Agency } from '@/types/agency'

interface AgencySnapshot {
  agencyId: string
  agency: Agency | null
}

export function useAgency(agencyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<AgencySnapshot | null>(null)

  useEffect(() => {
    if (!agencyId) return
    return onSnapshot(doc(db, 'agencies', agencyId), (snap) => {
      setSnapshot({ agencyId, agency: snap.exists() ? (snap.data() as Agency) : null })
    })
  }, [agencyId])

  const agency = agencyId && snapshot?.agencyId === agencyId ? snapshot.agency : null
  const loading = !!agencyId && snapshot?.agencyId !== agencyId

  return { agency, loading }
}
