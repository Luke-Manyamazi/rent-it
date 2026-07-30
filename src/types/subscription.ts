import type { Timestamp } from 'firebase/firestore'
import type { SubscriptionTier } from '@/types/agency'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'

export interface Subscription {
  agencyId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  listingLimit: number
  trialEndsAt: Timestamp | null
  currentPeriodEnd: Timestamp | null
  paymentProvider: 'paynow' | 'ecocash' | 'innbucks' | 'mukuru' | 'bank' | null
  externalCustomerId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Phase 14: no real payment gateway integration exists (client-only SPA, no
 * merchant credentials/backend for EcoCash or bank APIs), so billing is
 * proof-of-payment + admin approval — the agency submits a reference (and
 * optional screenshot), an admin reviews it in the admin dashboard, and
 * approval is what actually creates/updates the `subscriptions/{agencyId}`
 * doc above.
 */
export type PaymentMethod = 'ecocash' | 'bank'

export type PaymentSubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface SubscriptionPaymentSubmission {
  id: string
  agencyId: string
  submittedByUid: string
  requestedTier: SubscriptionTier
  amountUsd: number
  paymentMethod: PaymentMethod
  referenceNumber: string
  proofImageUrl: string | null
  proofImageStoragePath: string | null
  status: PaymentSubmissionStatus
  adminNote: string | null
  reviewedBy: string | null
  reviewedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
