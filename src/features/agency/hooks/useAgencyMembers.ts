import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { AgencyMember } from '@/types/agency'

interface MembersSnapshot {
  agencyId: string
  members: AgencyMember[]
}

export function useAgencyMembers(agencyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<MembersSnapshot | null>(null)

  useEffect(() => {
    if (!agencyId) return
    return onSnapshot(collection(db, 'agencies', agencyId, 'members'), (snap) => {
      setSnapshot({ agencyId, members: snap.docs.map((d) => d.data() as AgencyMember) })
    })
  }, [agencyId])

  const members = agencyId && snapshot?.agencyId === agencyId ? snapshot.members : []
  const loading = !!agencyId && snapshot?.agencyId !== agencyId

  return { members, loading }
}
