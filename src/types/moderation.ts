import type { Timestamp } from 'firebase/firestore'

export type FraudFlagStatus = 'open' | 'reviewing' | 'upheld' | 'dismissed'

export interface FraudFlag {
  id: string
  targetType: 'property' | 'user' | 'agency'
  targetId: string
  /** Null when system-generated (e.g. repeated auto-cancellations). */
  reportedBy: string | null
  reason: string
  description: string | null
  status: FraudFlagStatus
  reviewedBy: string | null
  reviewedAt: Timestamp | null
  createdAt: Timestamp
}

export type VerificationRequestType =
  | 'id_document'
  | 'proof_of_ownership'
  | 'agency_license'

export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationRequest {
  id: string
  userId: string
  type: VerificationRequestType
  /** Storage paths, not public URLs — access restricted to the owner and admins. */
  documentPaths: string[]
  status: VerificationRequestStatus
  reviewedBy: string | null
  reviewedAt: Timestamp | null
  rejectionReason: string | null
  createdAt: Timestamp
}
