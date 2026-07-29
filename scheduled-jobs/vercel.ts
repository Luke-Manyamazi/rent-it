import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  // Vercel's free Hobby plan only permits daily cron jobs — a missed
  // Verified Before You Travel deadline may sit for up to ~24h before this
  // catches it. See ../ARCHITECTURE.md for the tradeoff discussion.
  crons: [{ path: '/api/sweep-bookings', schedule: '0 0 * * *' }],
}
