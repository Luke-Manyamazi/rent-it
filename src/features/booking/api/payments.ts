import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '@/lib/firebase/config'
import { env } from '@/config/env'
import type { ViewingPayment, ViewingPaymentMethod } from '@/types/viewing-payment'

export interface InitiateViewingPaymentInput {
  propertyId: string
  proposedViewingTime: string
  tenantNote?: string
  method: ViewingPaymentMethod
  phoneNumber?: string
}

export interface InitiateViewingPaymentResult {
  paymentId: string
  redirectUrl: string | null
  instructions: string | null
}

/**
 * Starts the $5 viewing commitment fee via the scheduled-jobs payments
 * backend (see scheduled-jobs/api/initiate-viewing-payment.ts) — this is
 * what replaces the old client-side `createBooking`; the booking itself is
 * only created once Paynow's webhook confirms payment.
 */
export async function initiateViewingPayment(
  firebaseUser: User,
  input: InitiateViewingPaymentInput
): Promise<InitiateViewingPaymentResult> {
  const idToken = await firebaseUser.getIdToken()
  const response = await fetch(`${env.VITE_PAYMENTS_API_BASE_URL}/api/initiate-viewing-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(input),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? 'Could not start the viewing payment')
  }
  return data
}

interface ViewingPaymentSnapshot {
  paymentId: string
  payment: ViewingPayment | null
}

export function useViewingPayment(paymentId: string | undefined) {
  const [snapshot, setSnapshot] = useState<ViewingPaymentSnapshot | null>(null)

  useEffect(() => {
    if (!paymentId) return
    return onSnapshot(doc(db, 'viewingPayments', paymentId), (snap) => {
      setSnapshot({
        paymentId,
        payment: snap.exists() ? ({ id: snap.id, ...snap.data() } as ViewingPayment) : null,
      })
    })
  }, [paymentId])

  const payment = paymentId && snapshot?.paymentId === paymentId ? snapshot.payment : null
  const loading = !!paymentId && snapshot?.paymentId !== paymentId
  return { payment, loading }
}
