import { FirebaseError } from 'firebase/app'

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/invalid-verification-code': "That code doesn't look right — check and try again.",
  'auth/code-expired': 'That code has expired. Request a new one.',
  'auth/invalid-phone-number': 'Enter a valid phone number in international format.',
  'auth/credential-already-in-use': 'That phone number is already linked to another account.',
  'auth/operation-not-allowed':
    'That sign-in method isn’t enabled yet for this project. Try again shortly.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
