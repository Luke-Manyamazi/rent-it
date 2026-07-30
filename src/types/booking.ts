import type { Timestamp } from 'firebase/firestore'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'availability_confirmed'
  | 'completed'
  | 'cancelled_by_tenant'
  | 'cancelled_by_owner'
  | 'auto_cancelled_no_confirmation'
  | 'no_show'

/** Whether a completed viewing turned into a signed tenancy. Set once by the
 *  owner via `markBookingOutcome` — see bookings.ts. */
export type BookingRentalOutcome = 'pending' | 'rented' | 'not_rented'

/**
 * A viewing appointment request from a tenant for a property. Carries the
 * "Verified Before You Travel" state machine:
 *
 * pending -> confirmed (owner accepts a viewing time)
 *   -> availability_confirmed (owner reconfirms availability before
 *      `confirmationDeadline`, e.g. 24h ahead of the viewing)
 *   -> completed
 *
 * If the owner does not reconfirm by `confirmationDeadline`, a scheduled job
 * (Phase 11 Cloud Function) transitions the booking to
 * `auto_cancelled_no_confirmation` and applies a trust score penalty to the
 * owner via a TrustScoreEvent — see trust-score.ts.
 *
 * A `Booking` doc is only ever created by the `scheduled-jobs` payments
 * backend (via Admin SDK), once the tenant's $5 viewing commitment fee is
 * confirmed paid — see `ViewingPayment` in types/viewing-payment.ts and
 * `firestore.rules` (`bookings.allow create: if false`). Tenants no longer
 * create bookings directly.
 */
export interface Booking {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  ownerType: 'landlord' | 'agency'
  status: BookingStatus
  proposedViewingTime: Timestamp
  /** Deadline by which the owner must reconfirm availability, or the booking
   *  auto-cancels. Typically set to 24h before proposedViewingTime. */
  confirmationDeadline: Timestamp
  availabilityConfirmedAt: Timestamp | null
  availabilityConfirmedBy: string | null
  cancelledAt: Timestamp | null
  cancelledBy: 'system' | 'tenant' | 'owner' | null
  cancellationReason: string | null
  tenantNote: string | null
  /** The `ViewingPayment` that funded this booking's commitment fee. */
  paymentId: string
  /** Set by the owner once the viewing is `completed` — see
   *  `markBookingOutcome` in `features/booking/api/bookings.ts`. */
  rentalOutcome: BookingRentalOutcome
  outcomeDecidedAt: Timestamp | null
  outcomeDecidedBy: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
