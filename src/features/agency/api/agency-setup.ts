import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

/**
 * Runs once, right after an account signs up with role 'agency'. Fixes a
 * gap left by Phase 3: signup only ever created the `users/{uid}` doc, not
 * an actual `agencies/{agencyId}` entity for that role to belong to.
 *
 * If the signup email matches a pending invite (see firestore.rules
 * `agencyInvites`), the user joins that agency as an 'agent' instead of
 * founding a new one — this is how team members get added without any
 * backend to provision their account directly (see ARCHITECTURE.md).
 */
export async function setupAgencyForUser(user: User, fullName: string) {
  const email = (user.email ?? '').toLowerCase()
  const inviteRef = doc(db, 'agencyInvites', email)
  const inviteSnap = await getDoc(inviteRef)
  const invite = inviteSnap.exists() ? inviteSnap.data() : null

  if (invite && invite.status === 'pending') {
    const agencyId = invite.agencyId as string
    await Promise.all([
      setDoc(doc(db, 'agencies', agencyId, 'members', user.uid), {
        userId: user.uid,
        agencyId,
        role: 'agent',
        invitedAt: invite.createdAt,
        joinedAt: serverTimestamp(),
      }),
      updateDoc(inviteRef, { status: 'accepted' }),
      updateDoc(doc(db, 'users', user.uid), { agencyId, updatedAt: serverTimestamp() }),
    ])
    return agencyId
  }

  const agencyId = user.uid
  await Promise.all([
    setDoc(doc(db, 'agencies', agencyId), {
      id: agencyId,
      ownerId: user.uid,
      name: fullName,
      description: null,
      logoUrl: null,
      coverPhotoUrl: null,
      licenseNumber: null,
      verificationStatus: 'unverified',
      trustScore: 0,
      subscriptionTier: 'free',
      contactPhone: '',
      contactEmail: user.email ?? '',
      website: null,
      address: null,
      isSuspended: false,
      suspensionReason: null,
      activeListingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    setDoc(doc(db, 'agencies', agencyId, 'members', user.uid), {
      userId: user.uid,
      agencyId,
      role: 'owner',
      invitedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
    }),
    updateDoc(doc(db, 'users', user.uid), { agencyId, updatedAt: serverTimestamp() }),
  ])
  return agencyId
}
