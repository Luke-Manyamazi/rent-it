# RentIT Masvingo — Architecture

Web-first SaaS rental marketplace. This document covers the data model,
security model, and the future-expansion plan referenced throughout the
build (RentIT Bulawayo/Harare/Zimbabwe, native apps, white-label, public API).

## Backend split: Firebase + Supabase

- **Firebase**: Auth, Firestore (database of record), Cloud Messaging.
- **Supabase**: Storage only (property photos, avatars, agency logos,
  verification documents, chat attachments).

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
custom claims requires the Admin SDK — a Cloud Function — and Cloud
Functions are deferred to Phase 11. Once they exist, `userRole()` /
`userAgencyId()` in `firestore.rules` should switch to
`request.auth.token.role` / `request.auth.token.agencyId` for lower latency
and cost; the rule shapes stay the same.

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
| `bookings/{bookingId}` | Viewing appointments — the Verified Before You Travel state machine (below). |
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
- A scheduled Cloud Function (Phase 11) sweeps bookings past their deadline
  without confirmation, transitions them to
  `auto_cancelled_no_confirmation`, and appends a `booking_auto_cancelled`
  `TrustScoreEvent` with a negative delta against the owner (or their
  agency). Firestore rules never allow a client to write that status
  transition directly — only the Admin SDK can, since it bypasses rules.
- Repeated `booking_auto_cancelled` events are what should trigger listing
  suspension (Phase 8 admin tooling reads the trust score / event history to
  decide this — the threshold itself is a product decision for that phase,
  not hardcoded into the schema).

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
- **Paynow / EcoCash / InnBucks / Mukuru**: `Subscription.paymentProvider` and
  `externalCustomerId` are typed and nullable now specifically so adding a
  provider in Phase 14 is filling in a field, not adding one.
- **BI dashboard**: cached rollup fields (`Property.viewCount`,
  `Agency.activeListingCount`) exist so a future analytics view doesn't need
  to scan whole collections to compute basic metrics.
