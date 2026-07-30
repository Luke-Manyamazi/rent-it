import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { addMonths } from 'date-fns'
import { db } from '@/lib/firebase/config'
import { createNotification } from '@/features/notifications/api/notifications'
import { PLANS } from '@/config/plans'
import type { SubscriptionPaymentSubmission } from '@/types/subscription'

export function useAllPaymentSubmissions() {
  const [submissions, setSubmissions] = useState<SubscriptionPaymentSubmission[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'subscriptionPaymentSubmissions'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setSubmissions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPaymentSubmission)
      )
    })
  }, [])

  return { submissions: submissions ?? [], loading: submissions === null }
}

/**
 * `agencyId` is always the founding owner's Firebase UID (see
 * `setupAgencyForUser` in `features/agency/api/agency-setup.ts`), so it
 * doubles as the notification recipient without an extra agency doc read.
 */
export async function approvePaymentSubmission(
  submission: SubscriptionPaymentSubmission,
  adminUid: string
) {
  const plan = PLANS[submission.requestedTier]
  const subscriptionRef = doc(db, 'subscriptions', submission.agencyId)
  const existingSubscription = await getDoc(subscriptionRef)

  const batch = writeBatch(db)
  batch.update(doc(db, 'subscriptionPaymentSubmissions', submission.id), {
    status: 'approved',
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(
    subscriptionRef,
    {
      agencyId: submission.agencyId,
      tier: submission.requestedTier,
      status: 'active',
      listingLimit: plan.listingLimit,
      trialEndsAt: null,
      currentPeriodEnd: Timestamp.fromDate(addMonths(new Date(), 1)),
      paymentProvider: submission.paymentMethod,
      externalCustomerId: null,
      ...(existingSubscription.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
  batch.update(doc(db, 'agencies', submission.agencyId), {
    subscriptionTier: submission.requestedTier,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()

  await createNotification(
    submission.agencyId,
    'subscription_payment_approved',
    'Subscription upgraded',
    `Your payment was confirmed — you're now on the ${plan.name} plan.`,
    {}
  )
}

export async function rejectPaymentSubmission(
  submission: SubscriptionPaymentSubmission,
  adminUid: string,
  note: string
) {
  await updateDoc(doc(db, 'subscriptionPaymentSubmissions', submission.id), {
    status: 'rejected',
    adminNote: note,
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await createNotification(
    submission.agencyId,
    'subscription_payment_rejected',
    'Payment not confirmed',
    `Your submission for the ${PLANS[submission.requestedTier].name} plan was rejected: ${note}`,
    {}
  )
}
