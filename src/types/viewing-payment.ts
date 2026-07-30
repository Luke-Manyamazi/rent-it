import type { Timestamp } from 'firebase/firestore'

export type ViewingPaymentStatus = 'pending' | 'paid' | 'failed' | 'forfeited' | 'refunded'
export type ViewingPaymentMethod = 'ecocash' | 'paynow'

/**
 * The $5 viewing commitment fee a tenant pays to book a viewing, via Paynow
 * (EcoCash mobile money or Paynow's web checkout). Created by the
 * `scheduled-jobs` payments backend when a tenant starts the payment —
 * `bookingId` stays null until Paynow's webhook confirms `status: 'paid'`,
 * at which point the backend creates the actual `Booking` doc. See
 * ARCHITECTURE.md and src/features/booking/api/bookings.ts.
 *
 * `paid -> forfeited` (owner marks the booking "Rented", or the tenant is a
 * no-show) and `paid -> refunded` (owner marks "Not Rented") are the only
 * two transitions a client can make directly (see firestore.rules) — there
 * is no admin approval gate on the refund, but the fee settles into a single
 * platform Paynow merchant account, so `refunded` records that a refund is
 * owed, not that EcoCash/bank money has already moved.
 */
export interface ViewingPayment {
  id: string
  bookingId: string | null
  propertyId: string
  tenantId: string
  ownerId: string
  ownerType: 'landlord' | 'agency'
  amountUsd: number
  method: ViewingPaymentMethod
  phoneNumber: string | null
  proposedViewingTime: Timestamp
  tenantNote: string | null
  paynowReference: string
  paynowPollUrl: string | null
  status: ViewingPaymentStatus
  refundedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
