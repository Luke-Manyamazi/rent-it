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
import type { Agency } from '@/types/agency'
import type { VerificationStatus } from '@/types/user'

export function useAllAgencies(rowLimit = 200) {
  const [agencies, setAgencies] = useState<Agency[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'agencies'), orderBy('createdAt', 'desc'), limit(rowLimit))
    return onSnapshot(q, (snap) => {
      setAgencies(snap.docs.map((d) => d.data() as Agency))
    })
  }, [rowLimit])

  return { agencies: agencies ?? [], loading: agencies === null }
}

export async function setAgencySuspension(
  agencyId: string,
  isSuspended: boolean,
  reason: string | null
) {
  await updateDoc(doc(db, 'agencies', agencyId), {
    isSuspended,
    suspensionReason: isSuspended ? reason : null,
    updatedAt: serverTimestamp(),
  })
}

export async function setAgencyVerificationStatus(agencyId: string, status: VerificationStatus) {
  await updateDoc(doc(db, 'agencies', agencyId), {
    verificationStatus: status,
    updatedAt: serverTimestamp(),
  })
}
