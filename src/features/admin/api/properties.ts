import { useEffect, useState } from 'react'
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Property } from '@/types/property'
import { createNotification } from '@/features/notifications/api/notifications'

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

export async function setPropertyVerified(property: Property, isVerified: boolean) {
  await updateDoc(doc(db, 'properties', property.id), { isVerified, updatedAt: serverTimestamp() })
  if (isVerified) {
    await createNotification(
      property.ownerId,
      'listing_verified',
      'Listing verified',
      `"${property.title}" now shows the Verified badge to tenants.`,
      { propertyId: property.id }
    )
  }
}

export async function setPropertySuspended(
  property: Property,
  suspended: boolean,
  previousStatus: Property['status']
) {
  await updateDoc(doc(db, 'properties', property.id), {
    status: suspended ? 'suspended' : previousStatus === 'suspended' ? 'active' : previousStatus,
    updatedAt: serverTimestamp(),
  })
  if (suspended) {
    await createNotification(
      property.ownerId,
      'admin_alert',
      'Listing suspended',
      `"${property.title}" has been suspended by an admin.`,
      { propertyId: property.id }
    )
  }
}
