import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

/**
 * One-off CLI to promote a user to the 'admin' role.
 *
 * firestore.rules forbids a user's own document from ever setting
 * role: 'admin' on itself — only an existing admin (via the client SDK) or
 * the Admin SDK (which bypasses rules entirely) can do it. This script is
 * how the very first admin gets created, and how you recover if the last
 * admin account is ever locked out.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_KEY=$(cat service-account.json) \
 *     npm run bootstrap-admin -- someone@example.com
 *
 * Requires a service account with Firestore access AND the "Firebase
 * Authentication Admin" role (to resolve the email to a uid) — the
 * rentit-booking-sweep service account used by sweep-bookings.ts is
 * scoped to roles/datastore.user only and is NOT sufficient. Use the
 * project's default `firebase-adminsdk` service account instead, and only
 * ever run this locally — never deploy it.
 */

const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run bootstrap-admin -- <email>')
  process.exit(1)
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
if (!raw) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set')
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(raw)) })
}

const auth = getAuth()
const db = getFirestore()

const authUser = await auth.getUserByEmail(email)
const userRef = db.collection('users').doc(authUser.uid)
const userSnap = await userRef.get()

if (!userSnap.exists) {
  console.error(
    `No users/${authUser.uid} profile document found for ${email}. ` +
      'They need to sign up and complete role selection in the app first.'
  )
  process.exit(1)
}

const previousRole = userSnap.data()?.role

await userRef.update({
  role: 'admin',
  updatedAt: FieldValue.serverTimestamp(),
})

console.log(`Promoted ${email} (${authUser.uid}) from '${previousRole}' to 'admin'.`)
