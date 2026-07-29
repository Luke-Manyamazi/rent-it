import { collection, doc, addDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

/** Admin-only per firestore.rules (create requires
 *  type == 'manual_admin_adjustment' and isAdmin()). Appends the event and
 *  bumps the cached score in the same call, since there's no Cloud Function
 *  trigger yet to keep them in sync automatically. */
export async function adjustTrustScore(
  ownerType: 'landlord' | 'agency',
  ownerId: string,
  delta: number,
  note: string
) {
  const collectionName = ownerType === 'agency' ? 'agencies' : 'users'
  await Promise.all([
    addDoc(collection(db, collectionName, ownerId, 'trustScoreEvents'), {
      ownerId,
      ownerType,
      type: 'manual_admin_adjustment',
      delta,
      relatedBookingId: null,
      relatedPropertyId: null,
      note,
      createdAt: serverTimestamp(),
    }),
    updateDoc(doc(db, collectionName, ownerId), {
      trustScore: increment(delta),
      updatedAt: serverTimestamp(),
    }),
  ])
}
