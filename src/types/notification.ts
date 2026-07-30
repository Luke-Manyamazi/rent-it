import type { Timestamp } from 'firebase/firestore'

export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_availability_confirmed'
  | 'booking_auto_cancelled'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'viewing_payment_confirmed'
  | 'viewing_payment_failed'
  | 'viewing_outcome_rented'
  | 'viewing_refund_processed'
  | 'new_message'
  | 'listing_verified'
  | 'trust_score_changed'
  | 'subscription_expiring'
  | 'subscription_payment_approved'
  | 'subscription_payment_rejected'
  | 'admin_alert'

export interface AppNotification {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  body: string
  /** Deep-link payload, e.g. { propertyId, bookingId, conversationId }. */
  data: Record<string, string>
  isRead: boolean
  createdAt: Timestamp
}
