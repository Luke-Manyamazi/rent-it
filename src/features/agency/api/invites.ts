import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { AgencyInvite } from '@/types/agency'

export async function createAgencyInvite(agencyId: string, invitedByUid: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  await setDoc(doc(db, 'agencyInvites', normalizedEmail), {
    email: normalizedEmail,
    agencyId,
    invitedByUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function revokeAgencyInvite(email: string) {
  await deleteDoc(doc(db, 'agencyInvites', email.trim().toLowerCase()))
}

interface InvitesSnapshot {
  agencyId: string
  invites: AgencyInvite[]
}

export function useAgencyInvites(agencyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<InvitesSnapshot | null>(null)

  useEffect(() => {
    if (!agencyId) return
    const q = query(
      collection(db, 'agencyInvites'),
      where('agencyId', '==', agencyId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({ agencyId, invites: snap.docs.map((d) => d.data() as AgencyInvite) })
    })
  }, [agencyId])

  const invites = agencyId && snapshot?.agencyId === agencyId ? snapshot.invites : []
  const loading = !!agencyId && snapshot?.agencyId !== agencyId

  return { invites, loading }
}
