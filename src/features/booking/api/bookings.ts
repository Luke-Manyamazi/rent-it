import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Booking } from '@/types/booking'
import type { Property } from '@/types/property'
import type { BookingRequestValues } from '@/features/booking/schemas'

/** Hours before the viewing that the owner must reconfirm availability by. */
export const CONFIRMATION_WINDOW_HOURS = 24
/** Floor so a viewing requested for very soon still gives the owner a
 *  fair minimum window to respond, instead of an already-overdue booking. */
const MIN_CONFIRMATION_WINDOW_HOURS = 1

function computeConfirmationDeadline(proposedViewingTime: Date) {
  const viewingMs = proposedViewingTime.getTime()
  const standardDeadline = viewingMs - CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000
  const floorDeadline = Date.now() + MIN_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000
  return new Date(Math.max(standardDeadline, floorDeadline))
}

export async function createBooking(
  tenantId: string,
  property: Property,
  values: BookingRequestValues
) {
  const proposedViewingTime = new Date(values.proposedViewingTime)
  const confirmationDeadline = computeConfirmationDeadline(proposedViewingTime)

  await addDoc(collection(db, 'bookings'), {
    propertyId: property.id,
    tenantId,
    ownerId: property.ownerId,
    ownerType: property.ownerType,
    status: 'pending',
    proposedViewingTime: Timestamp.fromDate(proposedViewingTime),
    confirmationDeadline: Timestamp.fromDate(confirmationDeadline),
    availabilityConfirmedAt: null,
    availabilityConfirmedBy: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    tenantNote: values.tenantNote || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function confirmBooking(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'confirmed',
    updatedAt: serverTimestamp(),
  })
}

export async function confirmAvailability(bookingId: string, confirmedByUid: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'availability_confirmed',
    availabilityConfirmedAt: serverTimestamp(),
    availabilityConfirmedBy: confirmedByUid,
    updatedAt: serverTimestamp(),
  })
}

export async function completeBooking(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}

export async function cancelBookingByOwner(bookingId: string, reason: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'cancelled_by_owner',
    cancelledAt: serverTimestamp(),
    cancelledBy: 'owner',
    cancellationReason: reason,
    updatedAt: serverTimestamp(),
  })
}

export async function cancelBookingByTenant(bookingId: string) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'cancelled_by_tenant',
    cancelledAt: serverTimestamp(),
    cancelledBy: 'tenant',
    updatedAt: serverTimestamp(),
  })
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
