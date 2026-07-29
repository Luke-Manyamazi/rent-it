import { sendEmailVerification, type User } from 'firebase/auth'

export async function sendEmailVerificationLink(user: User) {
  await sendEmailVerification(user)
}
