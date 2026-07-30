import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import {
  AggregateField,
  FieldValue,
  getFirestore,
  Timestamp,
  type Query,
} from 'firebase-admin/firestore'

/**
 * Writes a daily platform-wide analytics snapshot plus a per-agency and
 * per-landlord rollup, so dashboards can chart trends over time without
 * scanning whole collections client-side on every page load — Firestore has
 * no built-in time-series aggregation. See ARCHITECTURE.md's "BI dashboard"
 * note and src/types/analytics.ts for the doc shapes this writes.
 */

const PENDING_BOOKING_STATUSES = ['pending', 'confirmed']

function getDb() {
  if (getApps().length === 0) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
    const serviceAccount = JSON.parse(raw)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

async function count(query: Query) {
  const snap = await query.count().get()
  return snap.data().count
}

async function sumViewCount(query: Query) {
  const snap = await query.aggregate({ total: AggregateField.sum('viewCount') }).get()
  return snap.data().total
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
  // when CRON_SECRET is set — this rejects anyone else hitting the endpoint.
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const db = getDb()
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const startOfDay = new Date(now)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const startOfDayTs = Timestamp.fromDate(startOfDay)

  const usersCol = db.collection('users')
  const agenciesCol = db.collection('agencies')
  const propertiesCol = db.collection('properties')
  const bookingsCol = db.collection('bookings')

  const [
    totalUsers,
    totalTenants,
    totalLandlords,
    totalAgencyUsers,
    newUsersToday,
    totalAgencies,
    totalProperties,
    activeProperties,
    newPropertiesToday,
    totalBookings,
    pendingBookings,
    newBookingsToday,
  ] = await Promise.all([
    count(usersCol),
    count(usersCol.where('role', '==', 'tenant')),
    count(usersCol.where('role', '==', 'landlord')),
    count(usersCol.where('role', '==', 'agency')),
    count(usersCol.where('createdAt', '>=', startOfDayTs)),
    count(agenciesCol),
    count(propertiesCol),
    count(propertiesCol.where('status', '==', 'active')),
    count(propertiesCol.where('createdAt', '>=', startOfDayTs)),
    count(bookingsCol),
    count(bookingsCol.where('status', 'in', PENDING_BOOKING_STATUSES)),
    count(bookingsCol.where('createdAt', '>=', startOfDayTs)),
  ])

  await db
    .collection('analyticsRollups')
    .doc(date)
    .set({
      date,
      totalUsers,
      totalTenants,
      totalLandlords,
      totalAgencyUsers,
      totalAgencies,
      totalProperties,
      activeProperties,
      totalBookings,
      pendingBookings,
      newUsersToday,
      newPropertiesToday,
      newBookingsToday,
      createdAt: FieldValue.serverTimestamp(),
    })

  const agenciesSnap = await agenciesCol.get()
  for (const agencyDoc of agenciesSnap.docs) {
    const agencyId = agencyDoc.id
    const agencyProperties = propertiesCol.where('ownerId', '==', agencyId)
    const agencyBookings = bookingsCol.where('ownerId', '==', agencyId)
    const [totalViewsCumulative, pendingBookingRequests, newBookingRequestsToday] = await Promise.all([
      sumViewCount(agencyProperties),
      count(agencyBookings.where('status', 'in', PENDING_BOOKING_STATUSES)),
      count(agencyBookings.where('createdAt', '>=', startOfDayTs)),
    ])
    await agencyDoc.ref
      .collection('analyticsRollups')
      .doc(date)
      .set({
        date,
        activeListingCount: agencyDoc.data().activeListingCount ?? 0,
        totalViewsCumulative,
        pendingBookingRequests,
        newBookingRequestsToday,
        createdAt: FieldValue.serverTimestamp(),
      })
  }

  const landlordsSnap = await usersCol.where('role', '==', 'landlord').get()
  for (const landlordDoc of landlordsSnap.docs) {
    const uid = landlordDoc.id
    const landlordProperties = propertiesCol.where('ownerId', '==', uid)
    const landlordBookings = bookingsCol.where('ownerId', '==', uid)
    const [activeListingCount, totalViewsCumulative, pendingBookingRequests, newBookingRequestsToday] =
      await Promise.all([
        count(landlordProperties.where('status', '==', 'active')),
        sumViewCount(landlordProperties),
        count(landlordBookings.where('status', 'in', PENDING_BOOKING_STATUSES)),
        count(landlordBookings.where('createdAt', '>=', startOfDayTs)),
      ])
    await landlordDoc.ref
      .collection('analyticsRollups')
      .doc(date)
      .set({
        date,
        activeListingCount,
        totalViewsCumulative,
        pendingBookingRequests,
        newBookingRequestsToday,
        createdAt: FieldValue.serverTimestamp(),
      })
  }

  res.status(200).json({ date, agencies: agenciesSnap.size, landlords: landlordsSnap.size })
}
