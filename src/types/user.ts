import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'tenant' | 'landlord' | 'agency' | 'admin'

export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'

/**
 * Public-facing profile — readable by any authenticated user (needed to show
 * a landlord's name/trust score on a listing). Deliberately excludes contact
 * details; see UserPrivateContact.
 */
export interface UserProfile {
  id: string
  role: UserRole
  fullName: string
  photoUrl: string | null
  verificationStatus: VerificationStatus
  /** Present only when role is 'agency' — links to the parent agency record. */
  agencyId: string | null
  trustScore: number
  isSuspended: boolean
  suspensionReason: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Stored at `users/{userId}/private/contact`. Readable only by the user
 * themself and admins — email/phone are never exposed to other users
 * directly. Contact happens through in-app messaging (Phase 12) instead,
 * which keeps landlords and tenants transacting on-platform rather than
 * dropping to WhatsApp/SMS the moment they have a number, and keeps the
 * trust/accountability mechanisms (reviews, trust score, fraud flags) in
 * force for the whole rental process.
 */
export interface UserPrivateContact {
  email: string
  phoneNumber: string | null
  phoneVerified: boolean
  fcmTokens: string[]
}
