import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  // Vercel's free Hobby plan only permits daily cron jobs (a missed Verified
  // Before You Travel deadline may sit for up to ~24h before this catches
  // it — see ../ARCHITECTURE.md) and, as of writing, caps a Hobby account at
  // 2 cron jobs total. This project uses both slots; verify that limit still
  // holds before adding a third.
  crons: [
    { path: '/api/sweep-bookings', schedule: '0 0 * * *' },
    { path: '/api/daily-analytics-rollup', schedule: '0 1 * * *' },
  ],
}
