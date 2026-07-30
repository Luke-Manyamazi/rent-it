import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { Paynow } from 'paynow'

/**
 * Starts the $5 viewing commitment fee payment for a tenant, via Paynow
 * (EcoCash mobile money or Paynow's own web checkout). Unlike this project's
 * other functions, this one is invoked directly by the frontend (not Vercel
 * Cron), so it authenticates the caller's Firebase ID token itself instead
 * of checking a CRON_SECRET header.
 *
 * A `viewingPayments` doc is created here in `pending` state; the actual
 * `bookings` doc is only created once `api/paynow-webhook.ts` confirms
 * payment — see firestore.rules (`bookings.allow create: if false`) and
 * ARCHITECTURE.md.
 */

const VIEWING_FEE_USD = 5
const PHONE_PATTERN = /^\+\d{9,15}$/

function getDb() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
    const serviceAccount = JSON.parse(raw)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_ORIGIN ?? '')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!idToken) {
    res.status(401).json({ error: 'Missing Authorization header' })
    return
  }

  const db = getDb()

  // A plain JWT-signature check against Firebase's public certs — no
  // `checkRevoked`, so it needs no IAM role beyond what's already granted
  // to the datastore-scoped `rentit-booking-sweep` service account.
  let tenantId: string
  let tenantEmail: string
  try {
    const decoded = await getAuth().verifyIdToken(idToken)
    tenantId = decoded.uid
    tenantEmail = decoded.email ?? `${decoded.uid}@users.rentit.app`
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
    return
  }

  const { propertyId, proposedViewingTime, tenantNote, method, phoneNumber } = req.body ?? {}

  if (typeof propertyId !== 'string' || !propertyId) {
    res.status(400).json({ error: 'propertyId is required' })
    return
  }
  const viewingTimeMs = Date.parse(proposedViewingTime)
  if (!proposedViewingTime || Number.isNaN(viewingTimeMs) || viewingTimeMs <= Date.now()) {
    res.status(400).json({ error: 'proposedViewingTime must be a future date/time' })
    return
  }
  if (method !== 'ecocash' && method !== 'paynow') {
    res.status(400).json({ error: "method must be 'ecocash' or 'paynow'" })
    return
  }
  if (method === 'ecocash' && (typeof phoneNumber !== 'string' || !PHONE_PATTERN.test(phoneNumber))) {
    res.status(400).json({ error: 'A valid phone number is required for EcoCash' })
    return
  }

  const propertySnap = await db.collection('properties').doc(propertyId).get()
  if (!propertySnap.exists) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }
  const property = propertySnap.data()!
  if (property.status !== 'active') {
    res.status(409).json({ error: 'This listing is no longer accepting viewing requests' })
    return
  }

  const paymentRef = db.collection('viewingPayments').doc()
  await paymentRef.set({
    bookingId: null,
    propertyId,
    tenantId,
    ownerId: property.ownerId,
    ownerType: property.ownerType,
    amountUsd: VIEWING_FEE_USD,
    method,
    phoneNumber: method === 'ecocash' ? phoneNumber : null,
    proposedViewingTime: new Date(viewingTimeMs),
    tenantNote: typeof tenantNote === 'string' && tenantNote.trim() ? tenantNote.trim() : null,
    paynowReference: paymentRef.id,
    paynowPollUrl: null,
    status: 'pending',
    refundedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  const integrationId = process.env.PAYNOW_INTEGRATION_ID
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY
  const returnUrl = process.env.PAYNOW_RETURN_URL
  if (!integrationId || !integrationKey || !returnUrl) {
    throw new Error('PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, and PAYNOW_RETURN_URL must be set')
  }

  const resultUrl = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers.host}/api/paynow-webhook`
  const paynow = new Paynow(integrationId, integrationKey, resultUrl, returnUrl)
  const payment = paynow.createPayment(paymentRef.id, tenantEmail)
  payment.add('Viewing commitment fee', VIEWING_FEE_USD)

  const response =
    method === 'ecocash' ? await paynow.sendMobile(payment, phoneNumber, 'ecocash') : await paynow.send(payment)

  if (!response?.success) {
    await paymentRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() })
    res.status(502).json({ error: response?.error ?? 'Paynow could not start this payment' })
    return
  }

  await paymentRef.update({
    paynowPollUrl: response.pollUrl ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  })

  res.status(200).json({
    paymentId: paymentRef.id,
    redirectUrl: response.redirectUrl ?? null,
    instructions: response.instructions ?? null,
  })
}
