import { useEffect, useState } from 'react'
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Property } from '@/types/property'

export function useAllProperties(rowLimit = 200) {
  const [properties, setProperties] = useState<Property[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(rowLimit))
    return onSnapshot(q, (snap) => {
      setProperties(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Property))
    })
  }, [rowLimit])

  return { properties: properties ?? [], loading: properties === null }
}

export async function setPropertyVerified(propertyId: string, isVerified: boolean) {
  await updateDoc(doc(db, 'properties', propertyId), { isVerified, updatedAt: serverTimestamp() })
}

export async function setPropertySuspended(propertyId: string, suspended: boolean, previousStatus: Property['status']) {
  await updateDoc(doc(db, 'properties', propertyId), {
    status: suspended ? 'suspended' : previousStatus === 'suspended' ? 'active' : previousStatus,
    updatedAt: serverTimestamp(),
  })
}
