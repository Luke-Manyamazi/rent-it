import type { Timestamp } from 'firebase/firestore'

/** Written once daily by scheduled-jobs/api/daily-analytics-rollup.ts —
 *  lets dashboards chart trends over time without scanning whole
 *  collections client-side on every page load. */
export interface PlatformAnalyticsRollup {
  date: string
  totalUsers: number
  totalTenants: number
  totalLandlords: number
  totalAgencyUsers: number
  totalAgencies: number
  totalProperties: number
  activeProperties: number
  totalBookings: number
  pendingBookings: number
  newUsersToday: number
  newPropertiesToday: number
  newBookingsToday: number
  createdAt: Timestamp
}

/** Stored at `agencies/{agencyId}/analyticsRollups/{date}` and
 *  `users/{uid}/analyticsRollups/{date}` — same shape either way. */
export interface OwnerAnalyticsRollup {
  date: string
  activeListingCount: number
  totalViewsCumulative: number
  pendingBookingRequests: number
  newBookingRequestsToday: number
  createdAt: Timestamp
}
