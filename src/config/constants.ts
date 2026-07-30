export const APP_NAME = 'RentIT Masvingo'
export const APP_TAGLINE = 'Find Your Next Home. Without the Hassle.'

/** The viewing commitment fee — refunded if the viewing doesn't lead to a
 *  tenancy, kept only if it does. See ARCHITECTURE.md's "Viewing commitment
 *  fee" section and features/booking/api/payments.ts. */
export const VIEWING_FEE_USD = 5

export const NAV_LINKS = [
  { label: 'Browse Rentals', href: '/listings' },
  { label: 'List Your Property', href: '/list-property' },
  { label: 'How It Works', href: '/how-it-works' },
] as const
