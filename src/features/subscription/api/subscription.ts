import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { supabase } from '@/lib/supabase/config'
import { STORAGE_BUCKETS, paymentProofPath } from '@/lib/supabase/storage'
import { PLANS } from '@/config/plans'
import type { Subscription, SubscriptionPaymentSubmission } from '@/types/subscription'
import type { SubmitPaymentValues } from '@/features/subscription/schemas'

interface SubscriptionSnapshot {
  agencyId: string
  subscription: Subscription | null
}

export function useSubscription(agencyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null)

  useEffect(() => {
    if (!agencyId) return
    return onSnapshot(doc(db, 'subscriptions', agencyId), (snap) => {
      setSnapshot({ agencyId, subscription: snap.exists() ? (snap.data() as Subscription) : null })
    })
  }, [agencyId])

  const subscription = agencyId && snapshot?.agencyId === agencyId ? snapshot.subscription : null
  const loading = !!agencyId && snapshot?.agencyId !== agencyId

  return { subscription, loading }
}

interface PaymentSubmissionsSnapshot {
  agencyId: string
  submissions: SubscriptionPaymentSubmission[]
}

export function useSubscriptionPaymentSubmissions(agencyId: string | undefined) {
  const [snapshot, setSnapshot] = useState<PaymentSubmissionsSnapshot | null>(null)

  useEffect(() => {
    if (!agencyId) return
    const q = query(
      collection(db, 'subscriptionPaymentSubmissions'),
      where('agencyId', '==', agencyId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setSnapshot({
        agencyId,
        submissions: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPaymentSubmission),
      })
    })
  }, [agencyId])

  const submissions = agencyId && snapshot?.agencyId === agencyId ? snapshot.submissions : []
  const loading = !!agencyId && snapshot?.agencyId !== agencyId

  return { submissions, loading }
}

export async function submitPaymentProof(
  agencyId: string,
  uid: string,
  values: SubmitPaymentValues,
  proofFile: File | null
) {
  let proofImageUrl: string | null = null
  let proofImageStoragePath: string | null = null

  if (proofFile) {
    const extension = proofFile.name.split('.').pop() ?? 'jpg'
    const path = paymentProofPath(uid, `${Date.now()}.${extension}`)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.paymentProofs)
      .upload(path, proofFile, { contentType: proofFile.type })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKETS.paymentProofs).getPublicUrl(path)
    proofImageUrl = publicUrl
    proofImageStoragePath = path
  }

  await addDoc(collection(db, 'subscriptionPaymentSubmissions'), {
    agencyId,
    submittedByUid: uid,
    requestedTier: values.requestedTier,
    amountUsd: PLANS[values.requestedTier].priceUsd,
    paymentMethod: values.paymentMethod,
    referenceNumber: values.referenceNumber,
    proofImageUrl,
    proofImageStoragePath,
    status: 'pending',
    adminNote: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function checkAgencyListingLimit(
  agencyId: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscriptionSnap = await getDoc(doc(db, 'subscriptions', agencyId))
  const subscription = subscriptionSnap.exists() ? (subscriptionSnap.data() as Subscription) : null
  const limit =
    subscription && subscription.status === 'active' ? subscription.listingLimit : PLANS.free.listingLimit

  const countSnap = await getCountFromServer(
    query(
      collection(db, 'properties'),
      where('ownerId', '==', agencyId),
      where('status', 'in', ['draft', 'pending_review', 'active'])
    )
  )
  const current = countSnap.data().count

  return { allowed: current < limit, current, limit }
}
