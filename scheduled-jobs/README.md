# RentIT scheduled jobs

A small, separately-deployed Vercel project — not part of the main Vite
frontend's build. It exists for exactly one reason: the Verified Before You
Travel auto-cancellation sweep needs a real clock-driven job, and Firebase
Cloud Functions require the Blaze billing plan, which this project avoids
(see `../ARCHITECTURE.md`). Everything else in RentIT stays in the main app
and Firestore rules; this is the one exception.

## What it does

`api/sweep-bookings.ts` runs on a Vercel Cron schedule (every 30 minutes,
see `vercel.ts`). It finds bookings whose Verified Before You Travel
confirmation deadline has passed while still `confirmed`, transitions them
to `auto_cancelled_no_confirmation`, and applies a trust score penalty to
the owner (or their agency) via the Firebase Admin SDK — which, unlike the
client SDK, isn't bound by `firestore.rules`.

## Deploying

This is linked to its own Vercel project (`rentit-booking-sweep`), rooted
at this directory rather than the repo root. Required environment
variables (set in the Vercel dashboard, never committed):

- `FIREBASE_SERVICE_ACCOUNT_KEY` — JSON key for the
  `rentit-booking-sweep@rentit-masvingo-dev.iam.gserviceaccount.com`
  service account, scoped to `roles/datastore.user` only.
- `CRON_SECRET` — Vercel automatically sends this as a bearer token on
  cron-triggered requests; the function rejects anything else.

## Bootstrapping an admin

`scripts/bootstrap-admin.mjs` is a local-only CLI (not deployed) that
promotes a user to the `admin` role. Firestore rules only let an *existing*
admin set `role: 'admin'` on another user's document, so this is how the
first admin gets created:

```
FIREBASE_SERVICE_ACCOUNT_KEY=$(cat service-account.json) \
  npm run bootstrap-admin -- someone@example.com
```

This needs a service account with Firestore access plus the "Firebase
Authentication Admin" role (to resolve the email to a uid) — the scoped-down
`rentit-booking-sweep` account above isn't enough. Use the project's default
`firebase-adminsdk` service account key instead, downloaded from Firebase
Console → Project settings → Service accounts.
