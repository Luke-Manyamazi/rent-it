import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'tenant' | 'landlord' | 'agency' | 'admin'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface UserProfile {
  id: string
  role: UserRole
  fullName: string
  email: string
  phoneNumber: string | null
  phoneVerified: boolean
  photoUrl: string | null
  verificationStatus: VerificationStatus
  /** Present only when role is 'agency' — links to the parent agency record. */
  agencyId: string | null
  trustScore: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
