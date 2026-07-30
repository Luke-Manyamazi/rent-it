import type { SubscriptionTier } from '@/types/agency'
import type { PaymentMethod } from '@/types/subscription'

export interface PlanDefinition {
  tier: SubscriptionTier
  name: string
  priceUsd: number
  listingLimit: number
  features: string[]
}

// TODO: replace with real pricing/limits before launch.
export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceUsd: 0,
    listingLimit: 2,
    features: ['Up to 2 active listings', 'Booking requests & messaging', 'Trust score tracking'],
  },
  starter: {
    tier: 'starter',
    name: 'Starter',
    priceUsd: 15,
    listingLimit: 10,
    features: ['Up to 10 active listings', 'Everything in Free', 'Priority listing placement'],
  },
  professional: {
    tier: 'professional',
    name: 'Professional',
    priceUsd: 40,
    listingLimit: 9999,
    features: ['Unlimited active listings', 'Everything in Starter', 'Team member seats'],
  },
}

export const PAID_PLAN_TIERS: SubscriptionTier[] = ['starter', 'professional']

interface PaymentMethodInfo {
  label: string
  instructions: string[]
}

// TODO: replace with the real EcoCash merchant number and bank account details.
export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  ecocash: {
    label: 'EcoCash',
    instructions: ['EcoCash number: <ADD NUMBER>', 'Account name: RentIT Masvingo'],
  },
  bank: {
    label: 'Bank transfer',
    instructions: [
      'Bank: <ADD BANK NAME>',
      'Account name: <ADD ACCOUNT NAME>',
      'Account number: <ADD ACCOUNT NUMBER>',
      'Branch: <ADD BRANCH>',
    ],
  },
}
