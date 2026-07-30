import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { Paynow } from 'paynow'

/**
 * Paynow's `resultUrl` — it POSTs transaction status here as
 * `application/x-www-form-urlencoded` (auto-parsed into `req.body` by
 * @vercel/node) whenever a payment started by api/initiate-viewing-payment.ts
 * changes state. On a confirmed payment this is what actually creates the
 * `bookings` doc — see firestore.rules (`bookings.allow create: if false`)
 * and src/types/booking.ts.
 */

/** Same 24h window as src/features/booking/api/bookings.ts, ported here
 *  since this runs server-side and can't import from the Vite app. */
const CONFIRMATION_WINDOW_HOURS = 24
const MIN_CONFIRMATION_WINDOW_HOURS = 1

/** Paynow has no "delivery" concept for a service like this — a mobile
 *  payment settles as 'Paid' and a web one often lands on 'Awaiting Delivery'
 *  with no further merchant action expected, so both count as paid. */
const PAID_STATUSES = new Set(['paid', 'awaiting delivery'])
const FAILED_STATUSES = new Set(['cancelled', 'failed', 'disputed'])

function getDb() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
    const serviceAccount = JSON.parse(raw)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

function computeConfirmationDeadline(proposedViewingTime: Date) {
  const viewingMs = proposedViewingTime.getTime()
  const standardDeadline = viewingMs - CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000
  const floorDeadline = Date.now() + MIN_CONFIRMATION_WINDOW_HOURS * 60 * 60 * 1000
  return new Date(Math.max(standardDeadline, floorDeadline))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const integrationId = process.env.PAYNOW_INTEGRATION_ID
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY
  if (!integrationId || !integrationKey) {
    throw new Error('PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY must be set')
  }

  const body = req.body as Record<string, string> | undefined
  const paynow = new Paynow(integrationId, integrationKey, '', '')
  if (!body || !paynow.verifyHash(body)) {
    // Always 200 back to Paynow (it retries on non-2xx) but never act on an
    // unverifiable payload.
    res.status(200).json({ ok: false, reason: 'hash mismatch' })
    return
  }

  const reference = body.reference
  const status = (body.status ?? '').toLowerCase()
  if (!reference) {
    res.status(200).json({ ok: false, reason: 'missing reference' })
    return
  }

  const db = getDb()
  const paymentRef = db.collection('viewingPayments').doc(reference)
  const paymentSnap = await paymentRef.get()
  if (!paymentSnap.exists) {
    res.status(200).json({ ok: false, reason: 'unknown payment' })
    return
  }
  const payment = paymentSnap.data()!

  // Already resolved — Paynow can redeliver the same result.
  if (payment.status !== 'pending') {
    res.status(200).json({ ok: true, alreadyResolved: true })
    return
  }

  if (PAID_STATUSES.has(status)) {
    const proposedViewingTime = (payment.proposedViewingTime as Timestamp).toDate()
    const confirmationDeadline = computeConfirmationDeadline(proposedViewingTime)

    const bookingRef = db.collection('bookings').doc()
    const batch = db.batch()
    batch.create(bookingRef, {
      propertyId: payment.propertyId,
      tenantId: payment.tenantId,
      ownerId: payment.ownerId,
      ownerType: payment.ownerType,
      status: 'pending',
      proposedViewingTime: Timestamp.fromDate(proposedViewingTime),
      confirmationDeadline: Timestamp.fromDate(confirmationDeadline),
      availabilityConfirmedAt: null,
      availabilityConfirmedBy: null,
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
      tenantNote: payment.tenantNote,
      paymentId: paymentRef.id,
      rentalOutcome: 'pending',
      outcomeDecidedAt: null,
      outcomeDecidedBy: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    batch.update(paymentRef, {
      status: 'paid',
      bookingId: bookingRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    })
    batch.create(db.collection('notifications').doc(), {
      recipientId: payment.ownerId,
      type: 'booking_request',
      title: 'New viewing request',
      body: 'A tenant paid the viewing fee and wants to view your listing.',
      data: { propertyId: payment.propertyId, bookingId: bookingRef.id },
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    })
    batch.create(db.collection('notifications').doc(), {
      recipientId: payment.tenantId,
      type: 'viewing_payment_confirmed',
      title: 'Payment confirmed',
      body: 'Your $5 viewing fee was received — the owner will confirm your viewing time shortly.',
      data: { propertyId: payment.propertyId, bookingId: bookingRef.id },
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    })
    await batch.commit()
  } else if (FAILED_STATUSES.has(status)) {
    await paymentRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() })
    await db.collection('notifications').add({
      recipientId: payment.tenantId,
      type: 'viewing_payment_failed',
      title: 'Payment did not go through',
      body: 'Your viewing fee payment failed or was cancelled — you can try again.',
      data: { propertyId: payment.propertyId },
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  // Any other in-flight status (e.g. 'created', 'sent'): no-op, Paynow will
  // call back again once it resolves.

  res.status(200).json({ ok: true })
}
