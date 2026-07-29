import type { Timestamp } from 'firebase/firestore'

export type TrustScoreEventType =
  | 'booking_confirmed_on_time'
  | 'booking_auto_cancelled'
  | 'listing_verified'
  | 'fraud_report_upheld'
  | 'tenant_no_show'
  | 'positive_review_received'
  | 'manual_admin_adjustment'

/**
 * Append-only log of everything that moved a user's or agency's trust score.
 * Stored at `users/{ownerId}/trustScoreEvents/{eventId}` (or
 * `agencies/{agencyId}/trustScoreEvents/{eventId}`). The cached `trustScore`
 * field on the parent doc is the rolling sum, recomputed whenever an event is
 * appended (Phase 11 Cloud Function trigger).
 *
 * Repeated `booking_auto_cancelled` events are what drives the "repeated
 * failures can lead to listing suspension" rule from the Verified Before You
 * Travel feature.
 */
export interface TrustScoreEvent {
  id: string
  ownerId: string
  ownerType: 'landlord' | 'agency'
  type: TrustScoreEventType
  delta: number
  relatedBookingId: string | null
  relatedPropertyId: string | null
  note: string | null
  createdAt: Timestamp
}
