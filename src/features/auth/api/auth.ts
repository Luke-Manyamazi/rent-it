import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  PhoneAuthProvider,
  type User,
  type ConfirmationResult,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import type { UserRole } from '@/types/user'

/**
 * Writes both the public profile and the private contact doc for a
 * newly-created auth user. Done client-side (no Cloud Functions yet — see
 * ARCHITECTURE.md) as two writes rather than one, since firestore.rules
 * enforces different access rules for each doc.
 */
export async function createUserProfileDocs(
  user: User,
  role: UserRole,
  fullName: string
) {
  const userRef = doc(db, 'users', user.uid)
  const contactRef = doc(db, 'users', user.uid, 'private', 'contact')

  await Promise.all([
    setDoc(userRef, {
      id: user.uid,
      role,
      fullName,
      photoUrl: user.photoURL ?? null,
      verificationStatus: 'unverified',
      agencyId: null,
      trustScore: 0,
      isSuspended: false,
      suspensionReason: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    setDoc(contactRef, {
      email: user.email,
      phoneNumber: null,
      phoneVerified: false,
      fcmTokens: [],
    }),
  ])
}

export async function hasProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists()
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string,
  role: UserRole
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: fullName })
  await createUserProfileDocs(credential.user, role, fullName)
  await sendEmailVerification(credential.user).catch(() => undefined)
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function requestPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email)
}

/** Returns whether this Google account already has a RentIT profile, so the
 *  caller can route first-time sign-ins to role selection. */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)
  return { user: credential.user, isNewProfile: !(await hasProfile(credential.user.uid)) }
}

export async function completeGoogleProfile(user: User, role: UserRole) {
  await createUserProfileDocs(user, role, user.displayName ?? 'RentIT User')
}

export async function signOutUser() {
  await signOut(auth)
}

// --- Phone OTP verification (linked to an existing signed-in account) -----

let recaptchaVerifier: RecaptchaVerifier | null = null

function getRecaptchaVerifier(containerId: string) {
  recaptchaVerifier ??= new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  return recaptchaVerifier
}

export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(recaptchaContainerId)
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export async function confirmPhoneVerificationCode(
  confirmationResult: ConfirmationResult,
  code: string
) {
  if (!auth.currentUser) throw new Error('Not signed in')
  const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, code)
  const result = await linkWithCredential(auth.currentUser, credential)
  await setDoc(
    doc(db, 'users', result.user.uid, 'private', 'contact'),
    { phoneNumber: result.user.phoneNumber, phoneVerified: true },
    { merge: true }
  )
  return result.user
}
