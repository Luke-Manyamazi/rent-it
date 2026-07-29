import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

/**
 * Sweeps bookings whose Verified Before You Travel confirmation deadline
 * has passed without the owner reconfirming availability, auto-cancels
 * them, and applies a trust score penalty. This is the one piece of RentIT
 * that couldn't be built as a Firestore-rules-enforced client action: the
 * transition has to fire even if nobody happens to load the booking, which
 * needs a real clock-driven job, not a page load. Runs on Vercel Cron
 * instead of Firebase Cloud Functions because Cloud Functions require the
 * Blaze billing plan, which this project deliberately avoids (see
 * ARCHITECTURE.md and the Supabase Storage decision that hit the same wall).
 */

const TRUST_SCORE_PENALTY = -5
/** Repeated failures suspend all of the owner's active listings — the
 *  original brief's "repeated failures can lead to listing suspension." */
const SUSPENSION_STRIKE_THRESHOLD = 3

function getDb() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
    const serviceAccount = JSON.parse(raw)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

async function suspendIfRepeatOffender(
  db: FirebaseFirestore.Firestore,
  ownerId: string,
  ownerType: 'landlord' | 'agency'
) {
  const collectionName = ownerType === 'agency' ? 'agencies' : 'users'
  const eventsSnap = await db
    .collection(collectionName)
    .doc(ownerId)
    .collection('trustScoreEvents')
    .where('type', '==', 'booking_auto_cancelled')
    .get()

  if (eventsSnap.size < SUSPENSION_STRIKE_THRESHOLD) return false

  const activePropertiesSnap = await db
    .collection('properties')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'active')
    .get()

  if (activePropertiesSnap.empty) return false

  const batch = db.batch()
  for (const propertyDoc of activePropertiesSnap.docs) {
    batch.update(propertyDoc.ref, {
      status: 'suspended',
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
  // when CRON_SECRET is set — this rejects anyone else hitting the endpoint.
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const db = getDb()
  const now = Timestamp.now()

  const overdueSnap = await db
    .collection('bookings')
    .where('status', '==', 'confirmed')
    .where('confirmationDeadline', '<', now)
    .get()

  let cancelled = 0
  let suspendedOwners = 0
  // Owners touched by *this* run — collected up front so the suspension
  // check (below) reflects every penalty this run applied, not just the
  // first booking encountered for that owner. Checking inline per-booking
  // would miss an owner who crosses the strike threshold partway through
  // a single run with multiple overdue bookings.
  const affectedOwners = new Map<string, 'landlord' | 'agency'>()

  for (const bookingDoc of overdueSnap.docs) {
    const booking = bookingDoc.data()

    const batch = db.batch()
    batch.update(bookingDoc.ref, {
      status: 'auto_cancelled_no_confirmation',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: 'system',
      cancellationReason:
        'The owner did not reconfirm availability before the Verified Before You Travel deadline.',
      updatedAt: FieldValue.serverTimestamp(),
    })

    const ownerCollectionName = booking.ownerType === 'agency' ? 'agencies' : 'users'
    const ownerRef = db.collection(ownerCollectionName).doc(booking.ownerId)
    const eventRef = ownerRef.collection('trustScoreEvents').doc()
    batch.create(eventRef, {
      ownerId: booking.ownerId,
      ownerType: booking.ownerType,
      type: 'booking_auto_cancelled',
      delta: TRUST_SCORE_PENALTY,
      relatedBookingId: bookingDoc.id,
      relatedPropertyId: booking.propertyId,
      note: 'Missed the Verified Before You Travel confirmation deadline.',
      createdAt: FieldValue.serverTimestamp(),
    })
    batch.update(ownerRef, {
      trustScore: FieldValue.increment(TRUST_SCORE_PENALTY),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await batch.commit()
    cancelled += 1
    affectedOwners.set(`${booking.ownerType}:${booking.ownerId}`, booking.ownerType)
  }

  for (const [ownerKey, ownerType] of affectedOwners) {
    const ownerId = ownerKey.slice(ownerType.length + 1)
    const suspended = await suspendIfRepeatOffender(db, ownerId, ownerType)
    if (suspended) suspendedOwners += 1
  }

  res.status(200).json({ cancelled, suspendedOwners })
}
