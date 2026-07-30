# RentIT Masvingo — Architecture

Web-first SaaS rental marketplace. This document covers the data model,
security model, and the future-expansion plan referenced throughout the
build (RentIT Bulawayo/Harare/Zimbabwe, native apps, white-label, public API).

## Backend split: Firebase + Supabase + Vercel

- **Firebase**: Auth, Firestore (database of record), Cloud Messaging.
- **Supabase**: Storage only (property photos, avatars, agency logos,
  verification documents, chat attachments).
- **Vercel**: the `scheduled-jobs/` project — two scheduled jobs (the
  Verified Before You Travel auto-cancellation sweep and the daily analytics
  rollup) plus two ordinary HTTP endpoints for the Paynow/EcoCash viewing
  commitment fee (`api/initiate-viewing-payment.ts`,
  `api/paynow-webhook.ts`). See those sections below.

Both the Supabase and Vercel pieces exist for the same reason: Firebase
Storage and Firebase Cloud Functions each require the Blaze (pay-as-you-go)
billing plan, which this project deliberately avoids during early
development.

This split exists because Firebase Storage now requires the Blaze
(pay-as-you-go) billing plan to enable, even to stay within free-tier usage,
and the project intentionally avoids that during early development. Supabase
Storage's free tier needs no card on file.

**Bridging auth across two backends**: Firebase Auth remains the single
identity provider. Supabase is registered to accept Firebase as a
[Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/firebase)
provider, so the Supabase client sends the Firebase ID token directly
(`src/lib/supabase/config.ts`), and Storage RLS policies read the Firebase UID
via `auth.jwt()->>'sub'`. No separate Supabase sign-in, no backend bridge.

**Storage authorization — known gap**: RLS policies can only cleanly express
"the path-embedded UID matches the caller" (used for avatars, verification
docs, and landlord-owned property photos). Agency-owned property photos and
chat attachments need "is this UID a member of agency X / participant in
conversation Y" — a relational check RLS can't do against Firestore, and
there's no Postgres mirror of that membership data yet. Until Phase 11 adds
a backend (Cloud Functions), those two cases use permissive
any-authenticated-user policies (see
`supabase/migrations/20260729000000_storage_setup.sql`, applied to the
`rentit-masvingo-dev` project).
Closing this gap means either:
1. A Cloud Function trigger that mirrors Firestore agency membership /
   conversation participants into a small Postgres table Supabase RLS can
   query, or
2. Routing those uploads through a server endpoint that checks Firestore via
   the Admin SDK before issuing a signed upload URL.

If Firebase Storage's billing requirement stops being a blocker (e.g. the
project moves to Blaze for other reasons), migrating storage back to Firebase
removes this whole cross-backend concern, since Firebase Storage rules can
read Firestore natively without a JWT bridge.

## RBAC without custom claims (yet)

Firestore security rules look up a user's role from their own document
(`users/{uid}.role`) via `get()`, rather than an Auth custom claim. Setting
custom claims needs the Admin SDK running server-side with Auth-admin
permissions — Phase 11's `scheduled-jobs` service deliberately doesn't have
those (it's scoped to `roles/datastore.user` only, for the booking sweep).
Adding a claims-setting endpoint there would be a small extension, not a
new architecture, if this ever becomes a bottleneck; until then `userRole()`
in `firestore.rules` costs one extra document read per rule evaluation.

The first admin account has no self-service path (rules block creating or
promoting to role `admin` from the client) — it's set by hand in the
Firestore console after the project exists.

## Firestore collections

| Collection | Purpose |
|---|---|
| `users/{uid}` | Public profile: role, name, photo, verification status, trust score. Deliberately excludes email/phone. |
| `users/{uid}/private/contact` | Email, phone, FCM tokens. Self + admin only. |
| `users/{uid}/savedProperties/{propertyId}` | Tenant's saved listings. |
| `users/{uid}/trustScoreEvents/{id}` | Append-only trust score log for landlords. Admin-SDK write only. |
| `agencies/{agencyId}` | Agency profile, verification, subscription tier. |
| `agencies/{agencyId}/members/{uid}` | Agency staff roster. |
| `agencies/{agencyId}/trustScoreEvents/{id}` | Trust score log for agencies. |
| `properties/{propertyId}` | Listings. Only `active`/`rented` are publicly readable. |
| `bookings/{bookingId}` | Viewing appointments — the Verified Before You Travel state machine (below). Only ever created server-side, once the linked `viewingPayments` doc is paid. |
| `viewingPayments/{id}` | The $5 EcoCash/Paynow viewing commitment fee — see below. |
| `conversations/{id}` / `.../messages/{id}` | In-app messaging, tied to a property/booking. |
| `notifications/{id}` | Per-user notification feed. |
| `reviews/{id}` | Tenant reviews of a completed booking. |
| `subscriptions/{agencyId}` | SaaS billing state for agencies. |
| `fraudFlags/{id}` | User/property/agency reports for moderation. |
| `verificationRequests/{id}` | KYC-lite submissions (ID docs, proof of ownership, agency license). |

Why email/phone live in a `private` subcollection instead of the main user
doc: Firestore rules can only allow/deny a whole document, not individual
fields. Splitting keeps the public profile (needed to show a landlord's name
on a listing) genuinely public while contact details stay private — and
pushes tenant-landlord contact through in-app messaging instead of raw phone
numbers, which is also a product goal (keeps the relationship, and the trust
mechanisms around it, on-platform instead of moving to WhatsApp).

## Messaging

`Conversation.participantIds` is always exactly 2 uids by design (enforced
in `firestore.rules`: `participantIds.size() == 2`). Two consequences worth
knowing:

- **One conversation per (tenant, property) pair**, not per (tenant, owner).
  Asking about two different listings from the same landlord opens two
  separate threads — they're different rental decisions, and keeping them
  separate matches how a tenant actually thinks about "the conversation
  about the Rhodene house" vs. "the one about the Mucheke flat."
- **Agency conversations only reach the agency owner**, not any team member
  who happens to be logged in. Since `agencyId` equals the owner's own uid
  for founding agencies (see Agencies below), messaging "the agency" already
  resolves correctly to a real, valid uid — but a 2-participant model can't
  represent "any of N current agents can answer this." Giving every agent
  visibility into agency-wide conversations would need either a 3rd
  participant type (agency-as-participant, not user-as-participant) or a
  fan-out/mirroring scheme, both bigger schema changes than this phase
  warranted.
- **Unread counts (`Conversation.unreadCounts`) aren't rule-validated** —
  either participant can freely rewrite the whole map, same MVP tradeoff as
  the client-authored notifications below. Low stakes since only the two
  people in the conversation are ever affected.

## Authentication

- **Email/Password and Google** are the two primary sign-in methods, both of
  which create a `users/{uid}` + `users/{uid}/private/contact` doc pair
  client-side (`src/features/auth/api/auth.ts`) — see the RBAC note above for
  why this isn't done via a Cloud Function yet.
- **Google sign-in doesn't collect a role.** A brand-new Google sign-in is
  routed to `/choose-role` to finish profile creation before it can reach any
  dashboard; `RequireProfile` (`src/app/route-guards.tsx`) enforces this for
  every `/dashboard/*` route.
- **Phone OTP is a verification step, not a third primary login method.**
  Treating it as its own sign-in path would let one person hold two unlinked
  RentIT accounts (email+password and phone). Instead, `/verify-phone` links
  a phone credential to the already-authenticated account
  (`linkWithCredential`), and sets `phoneVerified: true` on
  `private/contact`. It's skippable post-signup and re-visitable later, since
  a verified phone feeds trust score / the "Verified Before You Travel" flow
  but isn't required to use the platform.
- **Admin accounts have no self-service path.** `firestore.rules` blocks
  creating or updating a user doc with `role == 'admin'` from the client
  entirely — the first admin is set by hand in the Firestore console.

## Verified Before You Travel

`Booking.status` state machine (`src/types/booking.ts`):

```
pending → confirmed → availability_confirmed → completed
                    ↘ (deadline passes without confirmation)
                       auto_cancelled_no_confirmation
```

- `confirmationDeadline` is set when the owner accepts a viewing time
  (typically 24h before `proposedViewingTime`).
- The owner must reconfirm availability before that deadline
  (`availabilityConfirmedAt` gets set).
- A scheduled job sweeps bookings past their deadline without confirmation,
  transitions them to `auto_cancelled_no_confirmation`, and appends a
  `booking_auto_cancelled` `TrustScoreEvent` with a negative delta (-5)
  against the owner (or their agency). Firestore rules never allow a client
  to write that status transition directly — only the Admin SDK can, since
  it bypasses rules.
- **This job runs on Vercel Cron, not Firebase Cloud Functions** —
  `scheduled-jobs/api/sweep-bookings.ts`, deployed as its own Vercel project
  (`rentit-booking-sweep`), separate from the main frontend. Cloud Functions
  require the Blaze billing plan, the same wall hit for Firebase Storage
  (see above); a minimally-scoped service account
  (`rentit-booking-sweep@...`, `roles/datastore.user` only) gives the job
  Admin SDK access without it. See `scheduled-jobs/README.md` for the
  deployment details.
- **Known limitation**: Vercel's free Hobby plan restricts cron jobs to
  once daily, so the sweep runs once a day rather than every 15-30 minutes.
  A booking whose deadline passes could sit unconfirmed for up to ~24h
  before auto-cancelling. Upgrading to Vercel Pro removes this limit; the
  alternative considered and rejected was a Firestore-rules-enforced
  transition (using `request.time` to allow the client to trigger its own
  overdue booking's cancellation) — free and instant-on-page-load, but only
  fires when someone actually opens the booking, which was judged less
  predictable than a real (if infrequent) scheduled sweep.
- Repeated `booking_auto_cancelled` events trigger listing suspension: 3
  strikes suspends all of that owner's currently-active listings (also
  handled inside the sweep job, since it already has Admin SDK access).

## Viewing commitment fee (Paynow / EcoCash)

The product problem: viewing a property the old way costs ~$40 (a $20
viewing fee plus a $20 agent fee), which gets prohibitively expensive if a
tenant wants to see several houses before choosing. RentIT replaces that with
a single $5 commitment fee per viewing, refunded if it doesn't lead to a
tenancy and kept only if it does — payable via EcoCash (mobile money) or
Paynow's web checkout, both through one Paynow merchant integration.

```
viewingPayments: pending → paid ──┬─→ forfeited  (booking marked "Rented")
                        ↘ failed  └─→ refunded    (booking marked "Not Rented")
```

- A `Booking` doc is **only** ever created server-side
  (`scheduled-jobs/api/paynow-webhook.ts`), once Paynow confirms the fee is
  paid — `firestore.rules` sets `bookings.allow create: if false`, closing
  off the old tenant-creates-a-free-booking path entirely. The
  `viewingPayments` doc created up front by
  `scheduled-jobs/api/initiate-viewing-payment.ts` carries the booking-request
  fields (`propertyId`, `proposedViewingTime`, `tenantNote`) until then.
- After a viewing completes, the owner presses **Rented** or **Not Rented**
  (`markBookingOutcome` in `src/features/booking/api/bookings.ts`). Rented
  forfeits the fee and finally exercises `Property.status: 'rented'` (a value
  that existed in the schema before this feature but nothing set); Not
  Rented flips the fee to `refunded` — instantly, with no admin approval
  gate, via a narrow client-writable `firestore.rules` branch scoped to
  `paid → forfeited | refunded` and only the property's owner.
- **"Instant refund" is a status, not a guarantee of moved money.** All fees
  settle into one platform Paynow merchant account (one Integration
  ID/Key), not each landlord's own — Paynow itself has no documented
  automated refund/payout API, so `refunded` records that a payout is owed.
  `/dashboard/admin/refunds` (`AdminRefundsPage`) is a read-only bookkeeping
  list of what still needs to be sent back, not a review/approval queue.
- Same reasoning as the booking sweep applies to why this is in
  `scheduled-jobs/` and not a Firebase Cloud Function: no Blaze plan. Unlike
  the sweep, these two endpoints are ordinary HTTP functions (one called by
  the frontend with a Firebase ID token, one called by Paynow as its
  `resultUrl` webhook), not on a Vercel Cron schedule — so they don't count
  against the Hobby plan's 2-cron-job cap.

## Future expansion (documented now, not built)

The schema is deliberately shaped so these don't require breaking changes:

- **RentIT Bulawayo / Harare / Zimbabwe**: `Property.location.citySlug` scopes
  listings by market today (`'masvingo'`); adding a city is a data change, not
  a schema change. A composite index already exists on
  `(status, location.citySlug, createdAt)`.
- **Public API for agencies/PMS**: Firestore's document shapes double as the
  wire format for a future REST/GraphQL layer — an Express API in front of
  the same Firestore data can expose scoped read/write access without
  duplicating models.
- **Native Android/iOS (React Native)**: all business logic lives in
  Firestore + security rules, not in the web client, so a React Native app
  reuses the same backend and rule set unchanged.
- **White-label for agencies**: `agencies/{agencyId}` already isolates an
  agency's branding (`logoUrl`, `coverPhotoUrl`) and listings; a white-label
  frontend would filter/theme by `agencyId` against the same data.
- **AI assistant**: property/booking data is already structured (not
  freeform text), which is what makes it usable as tool-call context for an
  assistant later, without a data migration first.
- **Paynow / EcoCash / InnBucks / Mukuru for subscriptions**: agency billing
  is still proof-of-payment + admin approval (see `subscriptions` above) —
  only the viewing commitment fee has a real Paynow integration so far.
  `Subscription.paymentProvider` and `externalCustomerId` are typed and
  nullable now specifically so wiring subscriptions to the same Paynow
  integration used for viewing fees is filling in a field, not adding one.
- **BI dashboard**: cached rollup fields (`Property.viewCount`,
  `Agency.activeListingCount`) exist so a future analytics view doesn't need
  to scan whole collections to compute basic metrics.
