import type { Timestamp } from 'firebase/firestore'
import type { SubscriptionTier } from '@/types/agency'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'

/**
 * SaaS billing scaffold for agencies. Payment processing (Paynow, EcoCash,
 * InnBucks, Mukuru) is documented in ARCHITECTURE.md but not implemented
 * until Phase 14 — `paymentProvider`/`externalCustomerId` stay null until
 * then, and the plan is enforced purely by `listingLimit` in the meantime.
 */
export interface Subscription {
  agencyId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  listingLimit: number
  trialEndsAt: Timestamp | null
  currentPeriodEnd: Timestamp | null
  paymentProvider: 'paynow' | 'ecocash' | 'innbucks' | 'mukuru' | null
  externalCustomerId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
