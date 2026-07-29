import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types/user'

export interface AuthContextValue {
  firebaseUser: User | null
  profile: UserProfile | null
  /** True until the initial Auth + (if signed in) profile state has resolved. */
  loading: boolean
  /** Reloads the Firebase user (e.g. after clicking an email verification
   *  link) and forces consumers to re-read live fields like emailVerified. */
  refreshFirebaseUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
