import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Booking, BookingRentalOutcome } from '@/types/booking'
import type { Property } from '@/types/property'
import { createNotification } from '@/features/notifications/api/notifications'
import { getPropertyOnce, setPropertyStatus } from '@/features/property/api/properties'

/** Hours before the viewing that the owner must reconfirm availability by —
 *  also the window scheduled-jobs/api/paynow-webhook.ts uses server-side
 *  when it creates the booking (a booking now only exists once the $5
 *  viewing fee is paid — see initiateViewingPayment in
 *  features/booking/api/payments.ts). */
export const CONFIRMATION_WINDOW_HOURS = 24

export async function confirmBooking(booking: Booking) {
  await updateDoc(doc(db, 'bookings', booking.id), {
    status: 'confirmed',
    updatedAt: serverTimestamp(),
  })
  const property = await getPropertyOnce(booking.propertyId)
  await createNotification(
    booking.tenantId,
    'booking_confirmed',
    'Viewing confirmed',
    `Your viewing for "${property?.title ?? 'a listing'}" was confirmed.`,
    { propertyId: booking.propertyId, bookingId: booking.id }
  )
}

export async function confirmAvailability(booking: Booking, confirmedByUid: string) {
  await updateDoc(doc(db, 'bookings', booking.id), {
    status: 'availability_confirmed',
    availabilityConfirmedAt: serverTimestamp(),
    availabilityConfirmedBy: confirmedByUid,
    updatedAt: serverTimestamp(),
  })
  const property = await getPropertyOnce(booking.propertyId)
  await createNotification(
    booking.tenantId,
    'booking_availability_confirmed',
    'Verified Before You Travel ✓',
    `The owner reconfirmed "${property?.title ?? 'the listing'}" is still available — go with confidence.`,
    { propertyId: booking.propertyId, bookingId: booking.id }
  )
}

export async function completeBooking(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}

/**
 * The owner records whether a completed viewing turned into a tenancy.
 * 'rented' forfeits the $5 fee and takes the listing off the market;
 * 'not_rented' marks the fee refunded — instantly, with no admin approval
 * gate (see firestore.rules's viewingPayments rule and ARCHITECTURE.md for
 * why "instant" here means the status, not that EcoCash/bank money has
 * already moved).
 */
export async function markBookingOutcome(
  booking: Booking,
  property: Property,
  outcome: Extract<BookingRentalOutcome, 'rented' | 'not_rented'>,
  decidedByUid: string
) {
  await updateDoc(doc(db, 'bookings', booking.id), {
    rentalOutcome: outcome,
    outcomeDecidedAt: serverTimestamp(),
    outcomeDecidedBy: decidedByUid,
    updatedAt: serverTimestamp(),
  })

  if (outcome === 'rented') {
    await setPropertyStatus(property, 'rented')
  }

  await updateDoc(doc(db, 'viewingPayments', booking.paymentId), {
    status: outcome === 'rented' ? 'forfeited' : 'refunded',
    refundedAt: outcome === 'not_rented' ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })

  await createNotification(
    booking.tenantId,
    outcome === 'rented' ? 'viewing_outcome_rented' : 'viewing_refund_processed',
    outcome === 'rented' ? 'Listing marked as rented' : 'Viewing fee refunded',
    outcome === 'rented'
      ? `The owner marked "${property.title}" as rented.`
      : `Your $5 viewing fee for "${property.title}" was refunded.`,
    { propertyId: booking.propertyId, bookingId: booking.id }
  )
}

export async function cancelBookingByOwner(booking: Booking, reason: string) {
  await updateDoc(doc(db, 'bookings', booking.id), {
    status: 'cancelled_by_owner',
    cancelledAt: serverTimestamp(),
    cancelledBy: 'owner',
    cancellationReason: reason,
    updatedAt: serverTimestamp(),
  })
  const property = await getPropertyOnce(booking.propertyId)
  await createNotification(
    booking.tenantId,
    'booking_cancelled',
    'Viewing request declined',
    `Your request for "${property?.title ?? 'a listing'}" was declined: ${reason}`,
    { propertyId: booking.propertyId, bookingId: booking.id }
  )
}

export async function cancelBookingByTenant(booking: Booking) {
  await updateDoc(doc(db, 'bookings', booking.id), {
    status: 'cancelled_by_tenant',
    cancelledAt: serverTimestamp(),
    cancelledBy: 'tenant',
    updatedAt: serverTimestamp(),
  })
  const property = await getPropertyOnce(booking.propertyId)
  await createNotification(
    booking.ownerId,
    'booking_cancelled',
    'Viewing cancelled',
    `The tenant cancelled their viewing request for "${property?.title ?? 'a listing'}".`,
    { propertyId: booking.propertyId, bookingId: booking.id }
  )
}

interface BookingsSnapshot {
  key: string
  bookings: Booking[]
}

export function useBookingsForTenant(tenantId: string | undefined) {
  const [snapshot, setSnapshot] = useState<BookingsSnapshot | null>(null)
  const key = tenantId ? `tenant:${tenantId}` : undefined

  useEffect(() => {
    if (!tenantId) return
    const q = query(
      collection(db, 'bookings'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key: `tenant:${tenantId}`,
        bookings: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking),
      })
    })
  }, [tenantId])

  const bookings = key && snapshot?.key === key ? snapshot.bookings : []
  const loading = !!key && snapshot?.key !== key
  return { bookings, loading }
}

export function useBookingsForOwner(ownerId: string | undefined) {
  const [snapshot, setSnapshot] = useState<BookingsSnapshot | null>(null)
  const key = ownerId ? `owner:${ownerId}` : undefined

  useEffect(() => {
    if (!ownerId) return
    const q = query(
      collection(db, 'bookings'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        key: `owner:${ownerId}`,
        bookings: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking),
      })
    })
  }, [ownerId])

  const bookings = key && snapshot?.key === key ? snapshot.bookings : []
  const loading = !!key && snapshot?.key !== key
  return { bookings, loading }
}
