import type { Timestamp } from 'firebase/firestore'
import type { VerificationStatus } from '@/types/user'

export type SubscriptionTier = 'free' | 'starter' | 'professional'

export interface Agency {
  id: string
  ownerId: string
  name: string
  description: string | null
  logoUrl: string | null
  coverPhotoUrl: string | null
  licenseNumber: string | null
  verificationStatus: VerificationStatus
  trustScore: number
  subscriptionTier: SubscriptionTier
  contactPhone: string
  contactEmail: string
  website: string | null
  address: string | null
  isSuspended: boolean
  suspensionReason: string | null
  activeListingCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type AgencyMemberRole = 'owner' | 'agent'

export interface AgencyMember {
  userId: string
  agencyId: string
  role: AgencyMemberRole
  invitedAt: Timestamp
  joinedAt: Timestamp | null
}
