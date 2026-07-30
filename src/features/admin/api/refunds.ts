import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { ViewingPayment } from '@/types/viewing-payment'

/**
 * Viewing fees an owner has marked "Not Rented" — refunded instantly in the
 * app (see markBookingOutcome in features/booking/api/bookings.ts and
 * firestore.rules), but the money still settles in one platform Paynow
 * account, not the owner's. This is a bookkeeping list, not an approval
 * queue, for whoever operates that account to know what to actually pay out.
 */
export function useRefundedViewingPayments() {
  const [payments, setPayments] = useState<ViewingPayment[] | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'viewingPayments'),
      where('status', '==', 'refunded'),
      orderBy('refundedAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ViewingPayment))
    })
  }, [])

  return { payments: payments ?? [], loading: payments === null }
}
