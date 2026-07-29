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

export type AgencyInviteStatus = 'pending' | 'accepted'

/**
 * Stored at `agencyInvites/{lowercasedEmail}` — no backend exists yet to
 * create an account on someone else's behalf (see ARCHITECTURE.md), so
 * invites work by matching against the email an invitee later signs up
 * with, rather than provisioning their account directly.
 */
export interface AgencyInvite {
  email: string
  agencyId: string
  invitedByUid: string
  status: AgencyInviteStatus
  createdAt: Timestamp
}
