import type { Timestamp } from 'firebase/firestore'

export type ModerationStatus = 'visible' | 'hidden'

export interface Review {
  id: string
  propertyId: string
  targetId: string
  targetType: 'landlord' | 'agency'
  authorId: string
  bookingId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  moderationStatus: ModerationStatus
  isFlagged: boolean
  createdAt: Timestamp
}
